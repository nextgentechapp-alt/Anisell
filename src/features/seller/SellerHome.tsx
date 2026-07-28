import React, { useMemo } from 'react';
import { FiTrendingUp, FiShoppingBag, FiStar, FiBarChart2, FiClock } from 'react-icons/fi';
import type { Seller, Product, Order } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import styles from './SellerHome.module.css';

interface SellerHomeProps {
  seller: Seller;
  products: Product[];
  sellerOrders: { order: Order; buyerName: string; productName: string }[];
}

/**
 * Seller Dashboard Home Feature.
 * Analytics are now derived from real Firestore data (orders + reviews),
 * not from seller.analytics static fields.
 */
export const SellerHome: React.FC<SellerHomeProps> = ({ seller, products, sellerOrders }) => {
  // Derive real analytics from Firestore data
  const analytics = useMemo(() => {
    const totalSales = sellerOrders.filter(o => o.order.status === 'DELIVERED').length;
    const revenue = sellerOrders
      .filter(o => o.order.status !== 'CANCELLED')
      .reduce((acc, o) => acc + o.order.amount, 0);
    const totalReviews = products.reduce((acc, p) => acc + (p.productReviews?.length || 0), 0);
    const avgRating = products.reduce((acc, p) => {
      const reviews = p.productReviews || [];
      return acc + reviews.reduce((sum, r) => sum + r.rating, 0);
    }, 0) / (totalReviews || 1);

    // Build 7-day sales history from real order dates
    const salesHistory = Array(7).fill(0);
    const now = new Date();
    sellerOrders.forEach(o => {
      const orderDate = new Date(o.order.orderDate);
      const daysAgo = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) {
        salesHistory[6 - daysAgo]++;
      }
    });

    return {
      totalSales,
      revenue,
      totalOrders: sellerOrders.length,
      storeRating: Math.round(avgRating * 10) / 10,
      totalReviews,
      salesHistory
    };
  }, [sellerOrders, products]);

  const topProducts = products
    .filter(p => (p.productReviews?.length || 0) > 0 || (p.newSalesCount || 0) > 0)
    .sort((a, b) => (b.productReviews?.length || 0) - (a.productReviews?.length || 0))
    .slice(0, 3);

  return (
    <div className={styles.container}>
      
      {/* Verification Pendancy Banner */}
      {seller.status === 'pending' && (
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '16px 24px', borderRadius: '12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
           <FiClock size={24} color="#ca8a04" />
           <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#854d0e' }}>Storefront Under Administrative Review</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#a16207' }}>Your credentials and shop media have been successfully submitted during onboarding. You will be notified once a Platform Administrator authorizes your account to begin trading.</p>
           </div>
        </div>
      )}

      {/* 1. Merchant KPI Metrics - Derived from Real Data */}
      <div className={styles.kpiGrid}>
        <StatCard 
          label="Total Orders" 
          value={analytics.totalOrders} 
          icon={<FiShoppingBag />} 
          color="#2563eb"
          variant="primary"
        />
        <StatCard 
          label="Delivered" 
          value={analytics.totalSales} 
          icon={<FiBarChart2 />} 
          color="#ea580c"
          variant="warning"
        />
        <StatCard 
          label="Gross Revenue" 
          value={`₹${analytics.revenue.toLocaleString()}`} 
          icon={<FiTrendingUp />} 
          color="#10b981"
          variant="success"
        />
        <StatCard 
          label="Avg Rating" 
          value={analytics.totalReviews > 0 ? `${analytics.storeRating} ★` : 'N/A'} 
          icon={<FiStar />} 
          color="#7c3aed"
          variant="neutral"
        />
      </div>

      {/* 2. Performance Tracking - 7 Day Trend from Real Orders */}
      {(() => {
        const recentHistory = analytics.salesHistory;
        const maxHistory = Math.max(...recentHistory, 5);
        const polylinePoints = recentHistory.map((val, i) => {
           const x = (i / 6) * 800;
           const y = 240 - ((val / maxHistory) * 200);
           return `${x},${y}`;
        }).join(' ');

        return (
          <div className={styles.chartCard} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '32px' }}>
            <h3 className={styles.chartTitle} style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>7-Day Fulfillment Trends</h3>
            
            <div style={{ position: 'relative', width: '100%', height: '320px', marginTop: '32px' }}>
              <svg viewBox="0 0 800 300" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                 <defs>
                   <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                     <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                   </linearGradient>
                 </defs>

                 {/* Atmospheric Grid Guides - Synchronized */}
                 <line x1="0" y1="40" x2="800" y2="40" stroke="#cbd5e1" strokeWidth="1" />
                 <line x1="0" y1="140" x2="800" y2="140" stroke="#cbd5e1" strokeWidth="1" />
                 <line x1="0" y1="240" x2="800" y2="240" stroke="#64748b" strokeWidth="3" />
                 
                 {/* Data Series Shadow (Area Gradient) */}
                 <path 
                    d={`M 0 240 ${recentHistory.map((val, i) => `L ${(i/6)*800} ${240 - ((val/maxHistory)*200)}`).join(' ')} L 800 240 Z`}
                    fill="url(#chartAreaGradient)"
               />

                 <polyline 
                   fill="none" 
                   stroke="#3b82f6" 
                   strokeWidth="4" 
                   strokeLinecap="round" 
                   strokeLinejoin="round" 
                   points={polylinePoints} 
                 />
                 
                 {recentHistory.map((val, i) => {
                    const x = (i / 6) * 800;
                    const y = 240 - ((val / maxHistory) * 200);
                    const dayLabel = new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en', { weekday: 'short' });
                    return (
                      <g key={`point-${i}`}>
                        {val > 0 && <text x={x} y={y - 15} textAnchor="middle" fontSize="12" fill="#1e293b" fontWeight="800">{val}</text>}
                        <circle cx={x} cy={y} r="6" fill="#fff" stroke="#3b82f6" strokeWidth="3" style={{ filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.4))' }} />
                        <text x={x} y="280" textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="800" style={{ letterSpacing: '0.5px' }}>{dayLabel}</text>
                      </g>
                    );
                 })}
              </svg>
            </div>
          </div>
        );
      })()}

      {/* 3. Top Performing Listings */}
      {topProducts.length > 0 && (
        <div className={styles.topProductsCard} style={{ marginTop: '24px' }}>
          <h3 className={styles.chartTitle}>Top Performing Listings</h3>
          <div className={styles.productList}>
            {topProducts.map(p => (
              <div key={p.productId} className={styles.productItem}>
                {p.productMedia?.[0] && <img src={p.productMedia[0]} alt="" className={styles.productImage} />}
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{p.productSubCategory}</div>
                  <div className={styles.productMeta}>{p.productType} • {p.productReviews?.length || 0} Reviews</div>
                </div>
                <div className={styles.productStats}>
                   <div className={styles.salesValue}>{p.newSalesCount || 0} Sales</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
