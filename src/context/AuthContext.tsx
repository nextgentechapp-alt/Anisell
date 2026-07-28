import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase/config';
import { AuthService } from '@/services/api/AuthService';
import { isAdminSubdomain, isAdminEmail } from '@/utils/subdomain';
import type { User, Seller, Buyer } from '@/types';

interface AuthContextType {
  user: User | null;
  sellerData: Seller | null;
  buyerData: Buyer | null;
  loading: boolean;
  role: 'admin' | 'buyer' | 'seller' | null;
  isProfileComplete: boolean;
  isSellerVerified: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  loginAdmin: (email: string, pass: string) => Promise<User | null>;
  register: (email: string, pass: string, role: 'buyer' | 'seller') => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateBuyerProfile: (data: Partial<Buyer>) => Promise<void>;
  loginWithGoogle: (role: 'buyer' | 'seller') => Promise<{ user?: User | null; sellerStatus?: string; requiresConfirmation?: boolean; pendingUserData?: User }>;
  convertToSeller: (uid: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Global Authentication Context Provider.
 * Abstracted to use AuthService for explicit separation of concerns.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sellerData, setSellerData] = useState<Seller | null>(null);
  const [buyerData, setBuyerData] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);

  // Derived State Configuration
  const role = user?.role || null;
  
  // Profile completion determinant logic across roles
  const isProfileComplete = React.useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'buyer') return !!buyerData?.phone;
    if (user.role === 'seller') return sellerData?.status !== 'onboarding';
    return false;
  }, [user, sellerData, buyerData]);

  const isSellerVerified = sellerData?.status === 'verified';

  useEffect(() => {
    const isAsAdmin = isAdminSubdomain();
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const isUserAdmin = isAdminEmail(firebaseUser.email);
          
          if (isAsAdmin) {
             if (!isUserAdmin) {
                // If on admin subdomain but user is NOT an admin, clear session.
                await AuthService.logout();
                setUser(null);
                return;
             }
             // Synthetic Admin Load (No Firestore usage)
             setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: 'System Administrator',
                photoURL: 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png',
                role: 'admin'
             });
          } else {
           if (isUserAdmin) {
                 setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: 'System Administrator',
                    photoURL: 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png',
                    role: 'admin'
                 });
                 setLoading(false);
                 return;
              }
             
             // Standard User/Seller Load (Firestore usage)
             const userRef = doc(db, 'users', firebaseUser.uid);
             const userDoc = await getDoc(userRef);
             
             if (userDoc.exists()) {
               let userData = userDoc.data() as User;
               setUser(userData);

               if (userData.role === 'seller') {
                 const sellerRef = doc(db, 'sellers', firebaseUser.uid);
                 const sellerDoc = await getDoc(sellerRef);
                 if (sellerDoc.exists()) {
                   setSellerData(sellerDoc.data() as Seller);
                 }
               }

               if (userData.role === 'buyer') {
                 const buyerRef = doc(db, 'buyers', firebaseUser.uid);
                 const buyerDoc = await getDoc(buyerRef);
                 if (buyerDoc.exists()) {
                   setBuyerData(buyerDoc.data() as Buyer);
                 }
               }
             } else {
               setUser(null);
             }
          }
        } else {
          setUser(null);
          setSellerData(null);
          setBuyerData(null);
        }
      } catch (err) {
        console.error('Session Hydration Error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const userData = await AuthService.loginWithEmail(email, pass);
    setUser(userData);
    return userData;
  };

  const loginAdmin = async (email: string, pass: string) => {
     const userData = await AuthService.loginAdmin(email, pass);
     setUser(userData);
     return userData;
  };

  const register = async (email: string, pass: string, reqRole: 'buyer' | 'seller') => {
    const userData = await AuthService.registerWithEmail(email, pass, reqRole);
    setUser(userData);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!auth.currentUser) return;
    await AuthService.updateUserInfo(auth.currentUser.uid, data);
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const updateBuyerProfile = async (data: Partial<Buyer>) => {
    if (!auth.currentUser) return;
    await AuthService.updateBuyerInfo(auth.currentUser.uid, data);
    setBuyerData(prev => prev ? { ...prev, ...data } : null);
  };

  const loginWithGoogle = async (requestedRole: 'buyer' | 'seller') => {
    const response = await AuthService.loginWithGoogle(requestedRole);
    if (response.requiresConfirmation) {
       return response;
    }
    const { user: userData, sellerData: sData, buyerData: bData } = response;
    if (userData) setUser(userData);
    if (sData) setSellerData(sData);
    if (bData) setBuyerData(bData);
    return { user: userData, sellerStatus: sData?.status };
  };

  const convertToSeller = async (uid: string) => {
    const { user: userData, sellerData: sData, buyerData: bData } = await AuthService.convertToSeller(uid);
    setUser(userData);
    setSellerData(sData);
    setBuyerData(bData);
  };

  const logout = async () => {
    await AuthService.logout();
    localStorage.removeItem('anisell_user_details');
    setUser(null);
    setSellerData(null);
    setBuyerData(null);
  };

  return (
    <AuthContext.Provider value={{ 
       user, sellerData, buyerData, loading, role, isProfileComplete, isSellerVerified, 
       login, loginAdmin, register, updateProfile, updateBuyerProfile, loginWithGoogle, convertToSeller, logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
