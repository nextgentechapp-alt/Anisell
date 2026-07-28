import { db } from '@/services/firebase/config';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  writeBatch,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import type { PetProduct, PetVerseCategorySlug } from '@/types/petverse';
import { PETVERSE_PRODUCTS, PETVERSE_CATEGORIES } from '@/data/petverseCatalog';

const PRODUCTS_COLLECTION = 'petverse_products';
const CATEGORIES_COLLECTION = 'petverse_categories';

let seedCheckPromise: Promise<void> | null = null;

/**
 * PetProductService
 * All reads/writes are isolated under the `petverse_*` Firestore collections,
 * so AniSell's existing `products` / `sellers` collections are never touched.
 */
export const PetProductService = {
  /**
   * Ensures the isolated PetVerse collections have data. Runs once per session.
   * If the `petverse_products` collection is empty (first run), it batch-seeds
   * the bundled demo catalog so the storefront is fully functional out of the box.
   * Admins can later add/edit/delete real products via the PetVerse Admin panel,
   * which writes to this same collection.
   */
  async ensureSeeded(): Promise<void> {
    if (seedCheckPromise) return seedCheckPromise;

    seedCheckPromise = (async () => {
      try {
        const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
        if (!snap.empty) return;

        // Firestore batches are capped at 500 writes; chunk defensively.
        const chunks: (typeof PETVERSE_PRODUCTS)[] = [];
        for (let i = 0; i < PETVERSE_PRODUCTS.length; i += 400) {
          chunks.push(PETVERSE_PRODUCTS.slice(i, i + 400));
        }

        for (const chunk of chunks) {
          const batch = writeBatch(db);
          chunk.forEach((product) => {
            batch.set(doc(db, PRODUCTS_COLLECTION, product.id), product);
          });
          await batch.commit();
        }

        const categoryBatch = writeBatch(db);
        PETVERSE_CATEGORIES.forEach((category) => {
          categoryBatch.set(doc(db, CATEGORIES_COLLECTION, category.id), category);
        });
        await categoryBatch.commit();
      } catch (err) {
        // If Firestore rules block anonymous writes, gracefully fall back to
        // the in-memory catalog — the storefront still works, just read-only.
        console.warn('[PetVerse] Auto-seed skipped (using in-memory catalog fallback):', err);
      }
    })();

    return seedCheckPromise;
  },

  async getAllProducts(): Promise<PetProduct[]> {
    await this.ensureSeeded();
    try {
      const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
      if (snap.empty) return PETVERSE_PRODUCTS;
      return snap.docs.map((d) => d.data() as PetProduct);
    } catch {
      return PETVERSE_PRODUCTS;
    }
  },

  async getProductsByCategory(categorySlug: PetVerseCategorySlug): Promise<PetProduct[]> {
    await this.ensureSeeded();
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), where('categorySlug', '==', categorySlug));
      const snap = await getDocs(q);
      if (snap.empty) return PETVERSE_PRODUCTS.filter((p) => p.categorySlug === categorySlug);
      return snap.docs.map((d) => d.data() as PetProduct);
    } catch {
      return PETVERSE_PRODUCTS.filter((p) => p.categorySlug === categorySlug);
    }
  },

  async getProductById(id: string): Promise<PetProduct | null> {
    await this.ensureSeeded();
    try {
      const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, id));
      if (snap.exists()) return snap.data() as PetProduct;
    } catch {
      /* fall through to in-memory lookup */
    }
    return PETVERSE_PRODUCTS.find((p) => p.id === id) ?? null;
  },

  async searchProducts(term: string): Promise<PetProduct[]> {
    const all = await this.getAllProducts();
    const lower = term.trim().toLowerCase();
    if (!lower) return all;
    return all.filter(
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

  // --- Admin CRUD (used by the PetVerse Admin Panel) ---

  async createProduct(product: Omit<PetProduct, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  },

  async updateProduct(id: string, updates: Partial<PetProduct>): Promise<void> {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), updates as Record<string, unknown>);
  },

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  },
};
