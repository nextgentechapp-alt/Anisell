import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import type { Order, Buyer } from '@/types';

/**
 * Platform Order Management Service.
 * Centralizes order creation, status updates, and buyer order synchronization.
 * Orders are stored as an array inside the buyer's document for efficient retrieval.
 */
export const OrderService = {
  /**
   * Creates a new order and persists it to the buyer's order history.
   * Generates a unique order ID and appends to the buyer's orders array.
   */
  async createOrder(orderData: {
    productId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    quantity: number;
    buyerName: string;
    productName: string;
  }): Promise<Order> {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newOrder: Order = {
      orderId,
      productId: orderData.productId,
      buyerId: orderData.buyerId,
      sellerId: orderData.sellerId,
      amount: orderData.amount * orderData.quantity,
      quantity: orderData.quantity,
      status: 'PENDING',
      orderDate: new Date().toISOString(),
    };

    // Persist to buyer's order history
    const buyerRef = doc(db, 'buyers', orderData.buyerId);
    const buyerSnap = await getDoc(buyerRef);

    if (!buyerSnap.exists()) {
      throw new Error('Buyer profile not found. Please complete your profile first.');
    }

    const buyerData = buyerSnap.data() as Buyer;
    const existingOrders = buyerData.orders || [];

    await updateDoc(buyerRef, {
      orders: [...existingOrders, newOrder]
    });

    // Also store in a top-level orders collection for admin-level queries
    await addDoc(collection(db, 'orders'), {
      ...newOrder,
      buyerName: orderData.buyerName,
      productName: orderData.productName,
      createdAt: new Date().toISOString(),
    });

    return newOrder;
  },

  /**
   * Updates the status of a specific order within a buyer's order array.
   */
  async updateOrderStatus(
    buyerId: string,
    orderId: string,
    newStatus: Order['status']
  ): Promise<void> {
    const buyerRef = doc(db, 'buyers', buyerId);
    const buyerSnap = await getDoc(buyerRef);

    if (!buyerSnap.exists()) {
      throw new Error('Buyer record not found.');
    }

    const buyerData = buyerSnap.data() as Buyer;
    const updatedOrders = (buyerData.orders || []).map((o: Order) =>
      o.orderId === orderId ? { ...o, status: newStatus } : o
    );

    await updateDoc(buyerRef, { orders: updatedOrders });
  },

  /**
   * Fetches all orders for a specific buyer.
   */
  async getBuyerOrders(buyerId: string): Promise<Order[]> {
    const buyerRef = doc(db, 'buyers', buyerId);
    const buyerSnap = await getDoc(buyerRef);

    if (!buyerSnap.exists()) return [];

    const buyerData = buyerSnap.data() as Buyer;
    return buyerData.orders || [];
  }
};
