import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import type { Product, Seller, User, Buyer, Order } from '@/types';

/**
 * Custom hook to manage fetching and processing global marketplace data.
 * Synchronizes in real-time with Firestore collections (products, sellers, users).
 * Centralizes distributed data models into a unified search and analytics context.
 * 
 * @returns {Object} products, sellers, users, buyers, orders and loading state.
 */
export const useSearchData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const loadState = { sellers: false, products: false, users: false, buyers: false, orders: false };
    const checkComplete = () => {
      if (loadState.sellers && loadState.products && loadState.users && loadState.buyers && loadState.orders) {
        setLoading(false);
      }
    };

    // 1. Listen to Sellers
    const unsubscribeSellers = onSnapshot(query(collection(db, 'sellers')), (snapshot) => {
      setSellers(snapshot.docs.map(doc => ({
        ...(doc.data() as Seller),
        sellerId: doc.id
      })));
      loadState.sellers = true;
      checkComplete();
    });

    // 2. Listen to Products
    const unsubscribeProducts = onSnapshot(query(collection(db, 'products')), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({
        ...(doc.data() as Product),
        productId: doc.id
      })));
      loadState.products = true;
      checkComplete();
    });

    // 3. Listen to Users
    const unsubscribeUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({
        ...(doc.data() as User),
        uid: doc.id
      })));
      loadState.users = true;
      checkComplete();
    });

    // 4. Listen to Buyers
    const unsubscribeBuyers = onSnapshot(query(collection(db, 'buyers')), (snapshot) => {
      setBuyers(snapshot.docs.map(doc => ({
        ...(doc.data() as Buyer),
        buyerId: doc.id
      })));
      loadState.buyers = true;
      checkComplete();
    });

    // 5. Listen to Orders
    const unsubscribeOrders = onSnapshot(query(collection(db, 'orders')), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({
        ...(doc.data() as Order),
        orderId: doc.id
      })));
      loadState.orders = true;
      checkComplete();
    }, (error) => {
      console.error('Firestore orders sync error:', error);
      loadState.orders = true;
      checkComplete();
    });

    return () => {
      unsubscribeSellers();
      unsubscribeProducts();
      unsubscribeUsers();
      unsubscribeBuyers();
      unsubscribeOrders();
    };
  }, []);

  // Denormalize products with seller info
  const enrichedProducts = products.map(product => {
    const seller = sellers.find(s => s.sellerId === product.sellerId);
    return {
      ...product,
      sellerLocation: product.sellerLocation || seller?.sellerLocation || 'Global Marketplace',
      sellerName: product.sellerName || seller?.shopName || 'Verified Merchant'
    };
  });

  const approvedProducts = enrichedProducts.filter(p => p.status === 'APPROVED');

  return { 
    products: enrichedProducts as Product[], 
    approvedProducts: approvedProducts as Product[],
    sellers, 
    users, 
    buyers,
    orders,
    loading 
  };
};
