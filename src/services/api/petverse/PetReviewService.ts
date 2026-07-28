import { db } from '@/services/firebase/config';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import type { PetProductReview } from '@/types/petverse';

const REVIEWS_COLLECTION = 'petverse_reviews';
const PRODUCTS_COLLECTION = 'petverse_products';

export const PetReviewService = {
  async getReviewsForProduct(productId: string): Promise<PetProductReview[]> {
    const q = query(collection(db, REVIEWS_COLLECTION), where('productId', '==', productId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => d.data().review as PetProductReview)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addReview(productId: string, review: PetProductReview): Promise<void> {
    await addDoc(collection(db, REVIEWS_COLLECTION), { productId, review });

    // Recompute rolling average rating on the product document.
    const reviews = await this.getReviewsForProduct(productId);
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      await updateDoc(productRef, { rating: Number(avg.toFixed(1)), ratingCount: reviews.length });
    }
  },
};
