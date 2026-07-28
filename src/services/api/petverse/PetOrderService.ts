import { db } from '@/services/firebase/config';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import type { PetOrder, PetOrderStatus } from '@/types/petverse';

const ORDERS_COLLECTION = 'petverse_orders';

export const PetOrderService = {
  async placeOrder(order: Omit<PetOrder, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  },

  async getOrdersForUser(uid: string): Promise<PetOrder[]> {
    try {
      const q = query(collection(db, ORDERS_COLLECTION), where('userId', '==', uid), orderBy('placedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as PetOrder);
    } catch {
      // Fallback if a composite index hasn't been created yet — filter client-side.
      const q = query(collection(db, ORDERS_COLLECTION), where('userId', '==', uid));
      const snap = await getDocs(q);
      return (snap.docs.map((d) => d.data() as PetOrder)).sort(
        (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
      );
    }
  },

  async getOrderById(orderId: string): Promise<PetOrder | null> {
    const snap = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    return snap.exists() ? (snap.data() as PetOrder) : null;
  },

  async getAllOrders(): Promise<PetOrder[]> {
    const snap = await getDocs(collection(db, ORDERS_COLLECTION));
    return snap.docs.map((d) => d.data() as PetOrder);
  },

  async updateOrderStatus(orderId: string, status: PetOrderStatus): Promise<void> {
    const order = await this.getOrderById(orderId);
    const history = order?.statusHistory ?? [];
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status,
      statusHistory: [...history, { status, at: new Date().toISOString() }],
    });
  },

  async requestReturn(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, 'return_requested');
  },
};
