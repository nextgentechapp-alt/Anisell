import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchData } from '@/hooks/useSearchData';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FiX } from 'react-icons/fi';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Seller } from '@/types';

/**
 * Merchant Store Management Hub.
 * Regulates seller onboarding, credential verification, and revenue performance tracking.
 */
const AdminSellers: React.FC = () => {
  const navigate = useNavigate();
  const { sellers, orders, products, users, loading } = useSearchData();
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<string | null>(null);

  if (loading) return (
     <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {[...Array(5)].map((_, i) => <SkeletonTableRow key={i} columns={6} />)}
     </div>
  );

  // Reactive Seller Selection
  const currentSeller = sellers.find(s => s.sellerId === selectedSellerId);
  const currentUser = currentSeller ? users.find(u => u.uid === currentSeller.sellerId) : null;

  // Dynamic Calculation Helper
  const getSellerStats = (sellerId: string) => {
    const sellerOrders = orders.filter((o: any) => o.sellerId === sellerId && o.status !=='CANCELLED');
    const sellerRevenue = sellerOrders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
    const sellerInventory = products.filter((p: any) => p.sellerId === sellerId);
    return {
      sold: sellerOrders.length,
      revenue: sellerRevenue,
      listings: sellerInventory.length
    };
  };

  // Filter based on populated store credentials and status
  const filteredSellers = sellers.filter(seller => {
     if (filter === 'all') return true;
     return seller.status === filter;
  });

  const handleStatusUpdate = async (sellerId: string, newStatus: string) => {
    if (!window.confirm(`Advance store ${sellerId} to ${newStatus} state?`)) return;
    try {
      const sellerRef = doc(db, 'sellers', sellerId);
      await updateDoc(sellerRef, { status: newStatus });
      alert(`Merchant status synchronized: Storefront ${sellerId.substring(0,8)} is now verified.`);
    } catch (error) {
      console.error('Merchant status transition failed:', error);
      alert('Network failure: Unable to synchronize store status.');
    }
  };

  const sellerColumns = [
    { 
      header: 'Store Entity', 
      key: 'shopName',
      render: (s: Seller) => {
        const user = users.find(u => u.uid === s.sellerId);
        const avatarUrl = user?.photoURL || (s.shopPhotoUrls && s.shopPhotoUrls.length > 0 ? s.shopPhotoUrls[0] : 'https://via.placeholder.com/100?text=PS');
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <img 
                src={avatarUrl} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{s.shopName || 'Merchant'}</div>
          </div>
        );
      }
    },
    {
      header: 'Contact',
      key: 'contact',
      render: (s: Seller) => (
        <div style={{ fontSize: '13px', color: '#475569', fontWeight: 700 }}>{s.sellerNumber || 'Private'}</div>
      )
    },
    { 
      header: 'Status', 
      key: 'status', 
      render: (s: Seller) => {
        const isVerified = s.status === 'verified';
        const isPending = !s.status || s.status === 'pending';
        return <Badge label={isVerified ? 'Verified Active' : isPending ? 'Pending KYC' : 'Rejected'} variant={isVerified ? 'success' : isPending ? 'warning' : 'error'} />;
      }
    },
    { 
      header: 'Performance', 
      key: 'performance', 
      render: (s: Seller) => (
        <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '13px' }}>★ {s.analytics?.storeRating || 0}/5</div>
      )
    },
    { 
      header: 'Inventory', 
      key: 'inventory', 
      render: (s: Seller) => (
        <div style={{ fontSize: '14px', color: '#475569', fontWeight: 800 }}>{getSellerStats(s.sellerId).listings}</div>
      )
    },
    { 
      header: 'Gross Revenue', 
      key: 'revenue', 
      render: (s: Seller) => (
        <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '15px' }}>₹{getSellerStats(s.sellerId).revenue.toLocaleString()}</span>
      )
    }
  ];

  return (
    <div className="admin-dashboard-content" style={{ position: 'relative' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Seller Directory</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Verify compliance, track store performance, and manage merchant payouts.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <select 
             value={filter} 
             onChange={(e) => setFilter(e.target.value as any)}
             style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600 }}
           >
             <option value="all">Every Storefront</option>
             <option value="verified">Verified Hubs</option>
             <option value="pending">Pending KYC</option>
             <option value="rejected">Rejected Apps</option>
           </select>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table data={filteredSellers} columns={sellerColumns} onRowClick={(s) => setSelectedSellerId(s.sellerId)} />
      </div>

      {currentSeller && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              <button 
                onClick={() => setSelectedSellerId(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer', zIndex: 10 }}
              >
                <FiX />
              </button>
              
              <div style={{ padding: '40px' }}>
                 <header style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', background: '#f8fafc' }}>
                       <img 
                         src={currentUser?.photoURL || (currentSeller.shopPhotoUrls && currentSeller.shopPhotoUrls.length > 0 ? currentSeller.shopPhotoUrls[0] : 'https://via.placeholder.com/100?text=PS')} 
                         alt="" 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                       />
                    </div>
                   <div>
                      <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{currentSeller.shopName}</h2>
                      <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Merchant ID: {currentSeller.sellerId}</p>
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                         <Badge label={currentSeller.status === 'verified' ? 'Active Merchant' : 'KYC Pending'} variant={currentSeller.status === 'verified' ? 'success' : 'warning'} />
                         <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ★ {currentSeller.analytics?.storeRating || 0}/5
                         </span>
                      </div>
                   </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '32px', marginBottom: '40px' }}>
                   <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                         <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Units Sold</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{getSellerStats(currentSeller.sellerId).sold}</div>
                         </div>
                         <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Gross Revenue</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>₹{getSellerStats(currentSeller.sellerId).revenue.toLocaleString()}</div>
                         </div>
                         <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', gridColumn: 'span 2' }}>
                            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Marketplace Conversion</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>{currentSeller.analytics?.conversion || 0}% Efficiency</div>
                         </div>
                      </div>

                      <div style={{ display: 'grid', gap: '16px' }}>
                         <div>
                            <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Operational Outpost</h4>
                            <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600, lineHeight: 1.5 }}>{currentSeller.sellerLocation || 'Global Hub'}</div>
                         </div>
                         <div>
                            <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Direct Communication</h4>
                            <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{currentSeller.sellerNumber || 'Private Registry'}</div>
                         </div>
                      </div>
                   </section>

                   <aside>
                      {currentSeller.sellerCertificateUrl && (
                         <div 
                            onClick={() => setActiveMedia(currentSeller.sellerCertificateUrl || null)}
                            style={{ width: '240px', height: '240px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', cursor: 'pointer', background: '#fff', transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                         >
                            <img src={currentSeller.sellerCertificateUrl} alt="KYC License" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         </div>
                      )}
                      <div style={{ marginTop: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Legal Compliance Document</div>
                   </aside>
                </div>

                <footer style={{ display: 'flex', gap: '12px' }}>
                   <button 
                      onClick={() => handleStatusUpdate(currentSeller.sellerId, 'verified')}
                      disabled={currentSeller.status === 'verified'}
                      style={{ flex: 1.5, padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', opacity: currentSeller.status === 'verified' ? 0.5 : 1 }}
                   >
                      Authorize Storefront
                   </button>
                   <button 
                      onClick={() => navigate(`/profile/users/${currentSeller.sellerId}`)}
                      style={{ flex: 1, padding: '16px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}
                   >
                      Owner Dossier
                   </button>
                </footer>
              </div>
           </div>
        </div>
      )}

      {activeMedia && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setActiveMedia(null)}
        >
           <button style={{ position: 'absolute', top: '32px', right: '32px', background: 'rgba(255,255,255,0.1)', border: 'none', width: '56px', height: '56px', borderRadius: '50%', color: '#fff', cursor: 'pointer' }}><FiX size={28}/></button>
           <div style={{ maxWidth: '90%', maxHeight: '90%', background: '#fff', borderRadius: '24px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <img src={activeMedia} alt="" style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block' }} />
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;
