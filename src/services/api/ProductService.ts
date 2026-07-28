import { db } from '../firebase/config';
import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import type { Product, Seller } from '@/types';

/**
 * Marketplace Product Management Service.
 * Handles lifecycle events for pet listings, ensuring synchronization
 * between the product catalog and merchant inventory records.
 */
export const ProductService = {
  /**
   * Registers a new pet listing in the marketplace.
   * Defaults status to 'PENDING' for administrative verification.
   */
  async createProduct(uid: string, productData: Omit<Product, 'productId' | 'sellerId' | 'status' | 'sellerName' | 'sellerLocation'>): Promise<string> {
    const sellerRef = doc(db, 'sellers', uid);
    const sellerDoc = await getDoc(sellerRef);
    
    if (!sellerDoc.exists()) {
      throw new Error('Merchant profile not found. Platform registration required.');
    }

    const sellerInfo = sellerDoc.data() as Seller;

    // 1. Create the product document with denormalized seller info
    const productsRef = collection(db, 'products');
    const newProduct: Omit<Product, 'productId'> = {
      ...productData,
      sellerId: uid,
      sellerName: sellerInfo.shopName,
      sellerLocation: sellerInfo.sellerLocation,
      status: 'PENDING',
      newSalesCount: 0,
      productReviews: []
    };

    const docRef = await addDoc(productsRef, newProduct);
    const productId = docRef.id;

    // 2. Synchronize with Seller's inventory registry
    await updateDoc(sellerRef, {
      productIds: arrayUnion(productId)
    });

    return productId;
  },

  /**
   * Updates an existing product's registry details.
   */
  async updateProduct(productId: string, data: Partial<Product>) {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, data);
  }
};
