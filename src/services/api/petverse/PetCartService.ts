import { db } from '@/services/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { PetCartLine } from '@/types/petverse';

const CART_COLLECTION = 'petverse_carts';

export const PetCartService = {
  async getCart(uid: string): Promise<PetCartLine[]> {
    const snap = await getDoc(doc(db, CART_COLLECTION, uid));
    if (!snap.exists()) return [];
    return (snap.data().items as PetCartLine[]) ?? [];
  },

  async saveCart(uid: string, items: PetCartLine[]): Promise<void> {
    await setDoc(doc(db, CART_COLLECTION, uid), { items, updatedAt: new Date().toISOString() });
  },
};
