import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import type { Order, Buyer } from '@/types';
import type { PaymentInfo } from '@/types/payment';

export const OrderService = {
  async createOrder(orderData: {
    productId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    quantity: number;
    buyerName: string;
    productName: string;
    buyerEmail?: string;
    buyerPhone?: string;
    shippingAddress?: Order['shippingAddress'];
    payment?: PaymentInfo;
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
      payment: orderData.payment,
      shippingAddress: orderData.shippingAddress,
      buyerName: orderData.buyerName,
      buyerEmail: orderData.buyerEmail,
      buyerPhone: orderData.buyerPhone,
    };

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

    await addDoc(collection(db, 'orders'), {
      ...newOrder,
      buyerName: orderData.buyerName,
      productName: orderData.productName,
      createdAt: new Date().toISOString(),
    });

    return newOrder;
  },

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

    const batch = writeBatch(db);
    batch.update(buyerRef, { orders: updatedOrders });

    const ordersSnap = await getDocs(query(collection(db, 'orders'), where('orderId', '==', orderId)));
    ordersSnap.forEach((d) => {
      batch.update(doc(db, 'orders', d.id), { status: newStatus });
    });

    await batch.commit();
  },

  async updateOrderPayment(
    buyerId: string,
    orderId: string,
    payment: PaymentInfo
  ): Promise<void> {
    const buyerRef = doc(db, 'buyers', buyerId);
    const buyerSnap = await getDoc(buyerRef);

    if (!buyerSnap.exists()) {
      throw new Error('Buyer record not found.');
    }

    const buyerData = buyerSnap.data() as Buyer;
    const updatedOrders = (buyerData.orders || []).map((o: Order) =>
      o.orderId === orderId ? { ...o, payment } : o
    );

    const batch = writeBatch(db);
    batch.update(buyerRef, { orders: updatedOrders });

    const ordersSnap = await getDocs(query(collection(db, 'orders'), where('orderId', '==', orderId)));
    ordersSnap.forEach((d) => {
      batch.update(doc(db, 'orders', d.id), { payment });
    });

    await batch.commit();
  },

  async cancelOrder(buyerId: string, orderId: string, _reason?: string): Promise<void> {
    await this.updateOrderStatus(buyerId, orderId, 'CANCELLED');
  },

  async getBuyerOrders(buyerId: string): Promise<Order[]> {
    const buyerRef = doc(db, 'buyers', buyerId);
    const buyerSnap = await getDoc(buyerRef);

    if (!buyerSnap.exists()) return [];

    const buyerData = buyerSnap.data() as Buyer;
    return buyerData.orders || [];
  }
};
