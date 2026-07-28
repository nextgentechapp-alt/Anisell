import React, { useMemo } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { AdminOverview } from '@/features/admin/AdminOverview';
import { SkeletonAnalytics, SkeletonTableRow } from '@/components/ui/Skeleton';
import type { Product, Seller, User, Buyer } from '@/types';

/**
 * Admin Dashboard - Platform Governance.
 * Analytics are now derived from real Firestore data (orders from buyers, product reviews).
 */
const AdminDashboard: React.FC = () => {
  const { products, sellers, users, buyers, loading } = useSearchData();

  // Derive all orders from the buyers collection
  const allOrders = useMemo(() => {
    return buyers.flatMap(b => (b.orders || []).map(order => ({
      ...order,
      buyerName: users.find(u => u.uid === b.buyerId)?.displayName || 'Member'
    })));
  }, [buyers, users]);

  // Derive analytics from real Firestore data
  const analytics = useMemo(() => {
    const totalRevenue = allOrders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((acc, o) => acc + o.amount, 0);
    const totalDelivered = allOrders.filter(o => o.status === 'DELIVERED').length;
    const totalReviews = (products as Product[]).reduce((acc, p) => acc + (p.productReviews?.length || 0), 0);
    
    const topProducts = [...(products as Product[])]
      .filter(p => (p.newSalesCount || 0) > 0 || (p.productReviews?.length || 0) > 0)
      .sort((a, b) => (b.newSalesCount || 0) - (a.newSalesCount || 0));

    return {
      totalRevenue,
      totalOrders: allOrders.length,
      totalDelivered,
      totalReviews,
      topProducts,
    };
  }, [products, allOrders]);

  if (loading) return (
     <div className="admin-dashboard-content">
        <header style={{ marginBottom: '32px' }}>
           <div style={{ width: '40%', height: '32px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '12px' }} />
           <div style={{ width: '25%', height: '18px', background: '#f1f5f9', borderRadius: '8px' }} />
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
           {[...Array(4)].map((_, i) => <SkeletonAnalytics key={i} />)}
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
           {[...Array(5)].map((_, i) => <SkeletonTableRow key={i} columns={5} />)}
        </div>
     </div>
  );

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Governance Oversight</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Real-time metrics and administration for the AniSell marketplace.</p>
        </div>
      </header>

      {/* Portal Operational Views */}
      <AdminOverview 
        products={products as Product[]}
        sellers={sellers as Seller[]}
        users={users as User[]}
        buyers={buyers as Buyer[]}
        orders={allOrders}
        analytics={analytics}
      />
    </div>
  );
};

export default AdminDashboard;
