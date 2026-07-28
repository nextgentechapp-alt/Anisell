import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiStar, FiMenu } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useSearchData } from '@/hooks/useSearchData';
import { SkeletonTableRow } from '@/components/ui/Skeleton';

/**
 * Merchant Review Orchestrator.
 * Now fetches real reviews from productReviews in Firestore products.
 */
const SellerReviews: React.FC = () => {
  const { toggleMenu } = useOutletContext<{ toggleMenu: () => void }>();
  const { user } = useAuth();
  const { products, users, loading } = useSearchData();

  // Aggregate all reviews across this seller's products
  const allReviews = useMemo(() => {
    if (!user) return [];
    
    return products
      .filter(p => p.sellerId === user.uid)
      .flatMap(p => 
        (p.productReviews || []).map(review => ({
          ...review,
          productName: p.productSubCategory,
          productCategory: p.productCategory,
          productImage: p.productMedia?.[0],
          reviewerName: users.find(u => u.uid === review.userId)?.displayName || 'Marketplace Member'
        }))
      )
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }, [products, users, user]);

  const avgRating = useMemo(() => {
    if (allReviews.length === 0) return 0;
    return Math.round(allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length * 10) / 10;
  }, [allReviews]);

  if (loading) return (
     <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {[...Array(5)].map((_, i) => <SkeletonTableRow key={i} columns={4} />)}
     </div>
  );

  return (
    <div className="seller-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Customer Reviews</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Analyze feedback and build trust with your marketplace participants.</p>
        </div>
        <button 
          className="mobileMenuTrigger" 
          onClick={toggleMenu}
          style={{ display: 'none', background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
        >
           <FiMenu size={24} color="#1e293b" />
        </button>
      </header>

      {/* Review Summary Stats */}
      {allReviews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>{allReviews.length}</div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>Total Reviews</div>
          </div>
          <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b' }}>{avgRating} ★</div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>Average Rating</div>
          </div>
          <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981' }}>{allReviews.filter(r => r.rating >= 4).length}</div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>Positive (4★+)</div>
          </div>
        </div>
      )}

      {/* Review List */}
      {allReviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allReviews.map((review, idx) => (
            <div key={idx} style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {review.productImage && (
                <img src={review.productImage} alt="" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #f1f5f9' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{review.reviewerName}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>on {review.productName} • {review.productCategory}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <FiStar
                        key={star}
                        size={14}
                        style={{
                          fill: star <= review.rating ? '#f59e0b' : 'transparent',
                          color: star <= review.rating ? '#f59e0b' : '#cbd5e1'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{review.comment}</p>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>{review.datetime}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
           <FiStar size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
           <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No Reviews Yet</h3>
           <p style={{ color: '#64748b', marginBottom: '24px' }}>Your store hasn't received any customer ratings or feedback.</p>
           <p style={{ color: '#94a3b8', fontSize: '13px' }}>Reviews will appear here when buyers rate your products.</p>
        </div>
      )}
    </div>
  );
};

export default SellerReviews;
