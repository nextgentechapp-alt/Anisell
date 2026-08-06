import type { PetCoupon } from '@/types/petverse';
import { PETVERSE_COUPONS } from '@/data/petverseCatalog';

const IS_MOCK = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

let firestoreDb: typeof import('firebase/firestore') | null = null;
let dbInstance: ReturnType<typeof import('firebase/firestore').getFirestore> | null = null;

async function getFirestore() {
  if (IS_MOCK) return null;
  if (dbInstance) return dbInstance;
  try {
    const mod = await import('firebase/firestore');
    firestoreDb = mod;
    const config = await import('@/services/firebase/config');
    dbInstance = config.db;
    return dbInstance;
  } catch {
    return null;
  }
}

const COUPONS_COLLECTION = 'petverse_coupons';

/**
 * PetCouponService
 * Coupons created by admins are stored in the `petverse_coupons` Firestore
 * collection and merged on top of the seed catalog (`PETVERSE_COUPONS`).
 */
export const PetCouponService = {
  async getAllCoupons(): Promise<PetCoupon[]> {
    if (IS_MOCK) return PETVERSE_COUPONS;
    const db = await getFirestore();
    if (!db || !firestoreDb) return PETVERSE_COUPONS;
    try {
      const { collection, getDocs } = firestoreDb;
      const snap = await getDocs(collection(db, COUPONS_COLLECTION));
      const firestoreCoupons = snap.docs.map((d) => d.data() as PetCoupon);
      const merged: PetCoupon[] = [...PETVERSE_COUPONS];
      firestoreCoupons.forEach((c) => {
        const existingIndex = merged.findIndex((m) => m.code.toLowerCase() === c.code.toLowerCase());
        if (existingIndex >= 0) merged[existingIndex] = c;
        else merged.push(c);
      });
      return merged;
    } catch {
      return PETVERSE_COUPONS;
    }
  },

  async createCoupon(coupon: Omit<PetCoupon, 'code'> & { code: string }): Promise<void> {
    const db = await getFirestore();
    if (!db || !firestoreDb) throw new Error('Firestore not available in mock mode');
    const { doc, setDoc } = firestoreDb;
    const code = coupon.code.trim().toUpperCase();
    await setDoc(doc(db, COUPONS_COLLECTION, code), { ...coupon, code });
  },

  async updateCoupon(code: string, updates: Partial<PetCoupon>): Promise<void> {
    const db = await getFirestore();
    if (!db || !firestoreDb) throw new Error('Firestore not available in mock mode');
    const { doc, updateDoc } = firestoreDb;
    await updateDoc(doc(db, COUPONS_COLLECTION, code), updates as Record<string, unknown>);
  },

  async deleteCoupon(code: string): Promise<void> {
    const db = await getFirestore();
    if (!db || !firestoreDb) throw new Error('Firestore not available in mock mode');
    const { doc, deleteDoc } = firestoreDb;
    await deleteDoc(doc(db, COUPONS_COLLECTION, code));
  },
};
