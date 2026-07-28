import { auth, db, googleProvider } from '../firebase/config';
import { isAdminEmail } from '@/utils/subdomain';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { User, Seller, Buyer } from '@/types';

/**
 * Platform Authentication Service Layer.
 * Centralizes all Firebase Identity Management and User Profile Synchronization.
 */
export const AuthService = {
  async loginWithEmail(email: string, pass: string): Promise<User | null> {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const userRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  },

  async loginAdmin(email: string, pass: string): Promise<User | null> {
     if (!isAdminEmail(email)) {
        throw new Error('Access Denied: Email not in platform administrative registry.');
     }
     const result = await signInWithEmailAndPassword(auth, email, pass);
     return {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: 'System Administrator',
        photoURL: 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png',
        role: 'admin'
     };
  },

  async registerWithEmail(email: string, pass: string, role: 'buyer' | 'seller'): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const userId = result.user.uid;
    const initialProfile: User = {
      uid: userId,
      email: email,
      role: role,
      displayName: result.user.displayName || 'New User',
      photoURL: result.user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', userId), initialProfile);

    if (role === 'seller') {
       await this.initializeSellerProfile(userId, result.user.phoneNumber || '');
    } else if (role === 'buyer') {
       await this.initializeBuyerProfile(userId, result.user.phoneNumber || '');
    }

    return initialProfile;
  },

  async loginWithGoogle(requestedRole: 'buyer' | 'seller'): Promise<{ user?: User; sellerData?: Seller | null; buyerData?: Buyer | null; requiresConfirmation?: boolean; pendingUserData?: User }> {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    if (isAdminEmail(firebaseUser.email)) {
      return {
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: 'System Administrator',
          photoURL: firebaseUser.photoURL || 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png',
          role: 'admin'
        },
        sellerData: null,
        buyerData: null
      };
    }
    
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    let finalRole: 'buyer' | 'seller' | 'admin' = requestedRole;
    let finalUserData: User;

    if (!userSnap.exists()) {
      const initialProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: requestedRole,
        displayName: firebaseUser.displayName || 'New User',
        photoURL: firebaseUser.photoURL || 'https://www.w3schools.com/howto/img_avatar.png',
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, initialProfile);
      finalUserData = initialProfile as User;
    } else {
      const userData = userSnap.data() as User;
      if (requestedRole === 'seller' && userData.role === 'buyer') {
        return { requiresConfirmation: true, pendingUserData: userData };
      } else {
        finalRole = userData.role;
      }
      finalUserData = userData;
    }

    let finalSellerData: Seller | null = null;
    let finalBuyerData: Buyer | null = null;

    if (finalRole === 'buyer') {
       const buyerRef = doc(db, 'buyers', firebaseUser.uid);
       const buyerSnap = await getDoc(buyerRef);
       if (!buyerSnap.exists()) {
          finalBuyerData = await this.initializeBuyerProfile(firebaseUser.uid, firebaseUser.phoneNumber || '');
       } else {
          finalBuyerData = buyerSnap.data() as Buyer;
       }
    }

    if (finalRole === 'seller') {
       const sellerRef = doc(db, 'sellers', firebaseUser.uid);
       const sellerSnap = await getDoc(sellerRef);
       if (!sellerSnap.exists()) {
          finalSellerData = await this.initializeSellerProfile(firebaseUser.uid, firebaseUser.phoneNumber || '');
       } else {
          finalSellerData = sellerSnap.data() as Seller;
       }
    }

    return { user: finalUserData, sellerData: finalSellerData, buyerData: finalBuyerData };
  },

  async initializeSellerProfile(uid: string, phone: string): Promise<Seller> {
     const sellerRef = doc(db, 'sellers', uid);
     const newSellerProfile: Seller = {
        sellerId: uid,
        sellerLocation: 'Pending Verification',
        sellerNumber: phone,
        shopName: '', 
        sellerCertificateUrl: '',
        shopPhotoUrls: [],
        productIds: [],
        status: 'onboarding', 
        dateOfBirth: '',
        analytics: { totalSales: 0, revenue: 0, storeViews: 0, conversion: 0, storeRating: 0, salesHistory: [] }
     };
     await setDoc(sellerRef, newSellerProfile);
     return newSellerProfile;
  },

  async initializeBuyerProfile(uid: string, phone: string): Promise<Buyer> {
     const buyerRef = doc(db, 'buyers', uid);
     const newBuyerProfile: Buyer = {
        buyerId: uid,
        phone: phone,
        dateOfBirth: '',
        gender: '',
        addresses: [],
        orders: [],
        status: 'onboarding'
     };
     await setDoc(buyerRef, newBuyerProfile);
     return newBuyerProfile;
  },

  async convertToSeller(uid: string): Promise<{ user: User; sellerData: Seller; buyerData: Buyer }> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role: 'seller' });
    
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as User;

    // 1. Fetch Buyer Data for migration
    const buyerRef = doc(db, 'buyers', uid);
    const buyerSnap = await getDoc(buyerRef);
    let finalBuyerData: Buyer;
    
    if (buyerSnap.exists()) {
       finalBuyerData = buyerSnap.data() as Buyer;
       // 2. Mark Buyer record as inactive
       await updateDoc(buyerRef, { status: 'inactive' });
    } else {
       finalBuyerData = await this.initializeBuyerProfile(uid, '');
       await updateDoc(buyerRef, { status: 'inactive' });
    }

    // 3. Initialize/Migrate to Seller Profile
    let finalSellerData: Seller;
    const sellerRef = doc(db, 'sellers', uid);
    const sellerSnap = await getDoc(sellerRef);
    
    if (!sellerSnap.exists()) {
       // Migrate specific fields from Buyer profile if they exist
       const sellerPhone = finalBuyerData.phone || '';
       const sellerLocation = finalBuyerData.addresses?.[0] 
          ? [finalBuyerData.addresses[0].addressLine, finalBuyerData.addresses[0].city, finalBuyerData.addresses[0].state].filter(Boolean).join(', ')
          : 'Pending Onboarding';

       finalSellerData = {
          sellerId: uid,
          sellerLocation,
          sellerNumber: sellerPhone,
          shopName: '', 
          sellerCertificateUrl: '',
          shopPhotoUrls: [],
          productIds: [],
          status: 'onboarding', 
          dateOfBirth: finalBuyerData.dateOfBirth || '',
          analytics: { totalSales: 0, revenue: 0, storeViews: 0, conversion: 0, storeRating: 0, salesHistory: [] }
       };
       await setDoc(sellerRef, finalSellerData);
    } else {
       finalSellerData = sellerSnap.data() as Seller;
    }

    return { user: userData, sellerData: finalSellerData, buyerData: finalBuyerData };
  },

  async updateUserInfo(uid: string, data: Partial<User>) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
    
    if ((data.displayName || data.photoURL) && auth.currentUser) {
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL
      });
    }
  },

  async updateSellerInfo(uid: string, data: Partial<Seller>) {
    const sellerRef = doc(db, 'sellers', uid);
    await updateDoc(sellerRef, data);
  },

  async updateBuyerInfo(uid: string, data: Partial<Buyer>) {
    const buyerRef = doc(db, 'buyers', uid);
    await updateDoc(buyerRef, data);
  },

  async logout() {
    await signOut(auth);
  }
};
