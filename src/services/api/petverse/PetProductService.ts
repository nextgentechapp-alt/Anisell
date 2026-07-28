import type { PetProduct, PetVerseCategorySlug } from '@/types/petverse';
import { PETVERSE_PRODUCTS, PETVERSE_CATEGORIES } from '@/data/petverseCatalog';

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

const PRODUCTS_COLLECTION = 'petverse_products';
const CATEGORIES_COLLECTION = 'petverse_categories';

/**
 * PetProductService
 * In mock mode, returns in-memory catalog instantly without any Firestore calls.
 * Otherwise, reads/writes are isolated under the `petverse_*` Firestore collections.
 */
export const PetProductService = {
  async getAllProducts(): Promise<PetProduct[]> {
    return PETVERSE_PRODUCTS;
  },

  async getProductsByCategory(categorySlug: PetVerseCategorySlug): Promise<PetProduct[]> {
    return PETVERSE_PRODUCTS.filter((p) => p.categorySlug === categorySlug);
  },

  async getProductById(id: string): Promise<PetProduct | null> {
    return PETVERSE_PRODUCTS.find((p) => p.id === id) ?? null;
  },

  async searchProducts(term: string): Promise<PetProduct[]> {
    const lower = term.trim().toLowerCase();
    if (!lower) return PETVERSE_PRODUCTS;
    return PETVERSE_PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        p.categorySlug.includes(lower) ||
        p.tags.some((t) => t.includes(lower))
    );
  },

  async getRelatedProducts(product: PetProduct, limit = 8): Promise<PetProduct[]> {
    const sameCategory = await this.getProductsByCategory(product.categorySlug);
    return sameCategory.filter((p) => p.id !== product.id).slice(0, limit);
  },

  async ensureSeeded(): Promise<void> {
    if (IS_MOCK) return;
    const db = await getFirestore();
    if (!db || !firestoreDb) return;
    const { collection, getDocs, doc, writeBatch } = firestoreDb;
    try {
      const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
      if (!snap.empty) return;
      for (let i = 0; i < PETVERSE_PRODUCTS.length; i += 400) {
        const batch = writeBatch(db);
        PETVERSE_PRODUCTS.slice(i, i + 400).forEach((p) => {
          batch.set(doc(db, PRODUCTS_COLLECTION, p.id), p);
        });
        await batch.commit();
      }
      const catBatch = writeBatch(db);
      PETVERSE_CATEGORIES.forEach((c) => {
        catBatch.set(doc(db, CATEGORIES_COLLECTION, c.id), c);
      });
      await catBatch.commit();
    } catch {
      console.warn('[PetVerse] Auto-seed skipped (in-memory fallback)');
    }
  },

  async createProduct(product: Omit<PetProduct, 'id'>): Promise<string> {
    const db = await getFirestore();
    if (!db || !firestoreDb) throw new Error('Firestore not available in mock mode');
    const { collection, addDoc, updateDoc, doc } = firestoreDb;
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product);
    await updateDoc(doc(db, PRODUCTS_COLLECTION, docRef.id), { id: docRef.id } as Record<string, unknown>);
    return docRef.id;
  },

  async updateProduct(id: string, updates: Partial<PetProduct>): Promise<void> {
    const db = await getFirestore();
    if (!db || !firestoreDb) throw new Error('Firestore not available in mock mode');
    const { doc, updateDoc } = firestoreDb;
    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), updates as Record<string, unknown>);
  },

  async deleteProduct(id: string): Promise<void> {
    const db = await getFirestore();
    if (!db || !firestoreDb) throw new Error('Firestore not available in mock mode');
    const { doc, deleteDoc } = firestoreDb;
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  },
};
