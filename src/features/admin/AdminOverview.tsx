import React from 'react';
import { 
  FiPercent, FiPackage, FiActivity, FiShoppingCart 
} from 'react-icons/fi';
import type { Product, Seller, User, Buyer, Order } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import styles from './AdminOverview.module.css';

interface OverviewProps {
  products: Product[];
  sellers: Seller[];
  users: User[];
  buyers: Buyer[];
  orders: (Order & { buyerName: string })[];
  analytics: {
    totalRevenue: number;
    totalOrders: number;
    totalDelivered: number;
    totalReviews: number;
    topProducts: Product[];
  };
}

/**
 * Admin Overview Feature.
 * All KPIs are now derived from real Firestore data (orders, products, reviews).
 */
export const AdminOverview: React.FC<OverviewProps> = ({ products, sellers, users, buyers, orders, analytics }) => {
  const pendingProducts = products.filter(p => p.status === 'PENDING').length;
  const approvedProducts = products.filter(p => p.status === 'APPROVED').length;
  const pendingSellers = sellers.filter(s => s.status === 'pending').length;

  const getUserState = (u: User) => {
    if (u.role === 'seller') {
      const seller = sellers.find(s => s.sellerId === u.uid);
      if (!seller || !seller.sellerLocation) return 'N/A';
      const parts = seller.sellerLocation.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        const last = parts[parts.length - 1];
        if (/^\d+$/.test(last)) {
          return parts[parts.length - 2] || 'N/A';
        }
        return last;
      }
      return seller.sellerLocation;
    } else if (u.role === 'buyer') {
      const buyer = buyers.find(b => b.buyerId === u.uid);
      return buyer?.addresses?.[0]?.state || 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className={styles.overview}>
      {/* 1. Global Platform KPI Grid - Real Data */}
      <div className={styles.metricsGrid}>
        <StatCard 
          label="Total Revenue" 
          value={`₹${analytics.totalRevenue.toLocaleString()}`} 
          icon={<FiActivity size={20} />} 
          color="#2563eb"
          variant="primary"
        />
        <StatCard 
          label="Aquired Commision" 
          value={`₹${(analytics.totalRevenue * 0.15).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`} 
          icon={<FiPercent size={20} />} 
          color="#7c3aed"
          variant="neutral"
        />
        <StatCard 
          label="Total Orders" 
          value={analytics.totalOrders} 
          icon={<FiShoppingCart size={20} />} 
          color="#10b981"
          variant="success"
        />
        <StatCard 
          label="Live Listings" 
          value={products.length} 
          icon={<FiPackage size={20} />} 
          color="#ea580c"
          variant="warning"
        />
      </div>

      {/* 2. Secondary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '16px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>Sellers</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>{sellers.length}</div>
          {pendingSellers > 0 && <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>{pendingSellers} pending KYC</div>}
        </div>
        <div style={{ padding: '16px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>Buyers</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>{buyers.length}</div>
        </div>
        <div style={{ padding: '16px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>Approved Listings</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{approvedProducts}</div>
          {pendingProducts > 0 && <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>{pendingProducts} pending review</div>}
        </div>
        <div style={{ padding: '16px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>Delivered</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>{analytics.totalDelivered}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{analytics.totalReviews} reviews</div>
        </div>
      </div>

      {/* 3. Recent Orders */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
           <h3 className={styles.tableTitle}>Recent Orders</h3>
           <span className={styles.statusPending}>{orders.length} Total</span>
        </div>
        
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map(o => (
              <tr key={o.orderId}>
                <td>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>{o.orderId.substring(0, 16)}...</span>
                </td>
                <td>{o.buyerName}</td>
                <td><span style={{ fontWeight: 700, color: '#10b981' }}>₹{o.amount.toLocaleString()}</span></td>
                <td>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                    background: o.status === 'DELIVERED' ? '#d1fae5' : o.status === 'CANCELLED' ? '#fee2e2' : o.status === 'SHIPPED' ? '#e0e7ff' : '#fef3c7',
                    color: o.status === 'DELIVERED' ? '#059669' : o.status === 'CANCELLED' ? '#dc2626' : o.status === 'SHIPPED' ? '#4f46e5' : '#d97706'
                  }}>
                    {o.status}
                  </span>
                </td>
                <td style={{ color: '#64748b', fontSize: '13px' }}>{new Date(o.orderDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No orders placed yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Recent Platform Registrations */}
      <div className={styles.tableSection}>
        <h3 className={styles.tableTitle} style={{ marginBottom: '24px' }}>New User Onboarding</h3>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>User Details</th>
              <th>Role</th>
              <th>State</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 5).map(u => (
              <tr key={u.uid}>
                <td>
                  <div className={styles.userCell}>
                    <img src={u.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} alt="" className={styles.avatar} />
                    <div>
                       <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                       <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                    background: u.role === 'admin' ? '#e0e7ff' : u.role === 'seller' ? '#fef3c7' : '#d1fae5',
                    color: u.role === 'admin' ? '#4f46e5' : u.role === 'seller' ? '#d97706' : '#059669'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#475569', fontSize: '13px' }}>
                    {getUserState(u)}
                  </span>
                </td>
                <td style={{ color: '#64748b', fontSize: '13px' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
