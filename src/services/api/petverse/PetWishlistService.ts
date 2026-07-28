import { db } from '@/services/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { PetWishlistLine } from '@/types/petverse';

const WISHLIST_COLLECTION = 'petverse_wishlists';

export const PetWishlistService = {
  async getWishlist(uid: string): Promise<PetWishlistLine[]> {
    const snap = await getDoc(doc(db, WISHLIST_COLLECTION, uid));
    if (!snap.exists()) return [];
    return (snap.data().items as PetWishlistLine[]) ?? [];
  },

  async saveWishlist(uid: string, items: PetWishlistLine[]): Promise<void> {
    await setDoc(doc(db, WISHLIST_COLLECTION, uid), { items, updatedAt: new Date().toISOString() });
  },
};
