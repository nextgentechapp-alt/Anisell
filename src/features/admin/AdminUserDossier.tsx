import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSearchData } from '@/hooks/useSearchData';
import { SkeletonProfile } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Order, Product } from '@/types';

/**
 * Dedicated Admin Dossier & KYC Verification Endpoint.
 */
const AdminUserDossier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, sellers, buyers, orders, products, loading } = useSearchData();
  const [activeMedia, setActiveMedia] = React.useState<string | null>(null);

  if (loading) return (
     <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
       <SkeletonProfile />
     </div>
  );

  const user = users.find(u => u.uid === id);
  const sellerData = sellers.find(s => s.sellerId === id);
  const buyerData = buyers.find(b => b.buyerId === id);

  if (!user) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>Identity Record Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>The requested administrative dossier for UID {id?.substring(0, 8)} is unavailable.</p>
        <button onClick={() => navigate('/admin/users')} style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Return to Directory</button>
      </div>
    );
  }

  const handleApproval = async (approve: boolean) => {
    if (!sellerData) return;
    const actionText = approve ? 'verify and approve' : 'reject';
    if (!window.confirm(`Are you certain you want to ${actionText} storefront ${sellerData.shopName || 'Unknown Store'}?`)) return;
    
    try {
      const sellerRef = doc(db, 'sellers', sellerData.sellerId);
      await updateDoc(sellerRef, { status: approve ? 'verified' : 'rejected' });
      alert(`Governance status updated: Storefront is now ${approve ? 'Verified Active' : 'Restricted'}.`);
    } catch (error) {
      console.error(`Error attempting to ${actionText} merchant:`, error);
      alert(`Authorization Pipeline Failure: Unable to ${actionText} store.`);
    }
  };

  // Compute Related Data
  const userOrders = (orders as Order[]).filter(o => o.buyerId === user.uid);
  const sellerOrders = (orders as Order[]).filter(o => o.sellerId === user.uid);
  const sellerProducts = (products as Product[]).filter(p => p.sellerId === user.uid);
  
  const totalRevenue = sellerOrders.reduce((sum: number, o: Order) => sum + (o.amount || 0), 0);
  const contactPhone = sellerData?.sellerNumber || buyerData?.phone || 'Private Record';

  return (
    <div className="admin-dashboard-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 20px', borderRadius: '14px', fontWeight: 700, fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <FiArrowLeft /> Back to Directory
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
           <Badge label={`ID: ${user.uid.substring(0, 12)}...`} variant="neutral" />
           <Badge label={user.status === 'suspended' ? 'SUSPENDED' : 'VERIFIED ACTIVE'} variant={user.status === 'suspended' ? 'error' : 'success'} />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Sidebar: Profile Snapshot */}
        <aside style={{ position: 'sticky', top: '24px' }}>
           <div style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '40px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #f8fafc, #ffffff)' }}>
                 <div style={{ width: '140px', height: '140px', margin: '0 auto 24px', position: 'relative' }}>
                    <img src={user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} alt="" style={{ width: '100%', height: '100%', borderRadius: '48px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '28px', height: '28px', background: user.status === 'suspended' ? '#ef4444' : '#10b981', border: '4px solid #fff', borderRadius: '50%' }} />
                 </div>
                 <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.025em' }}>{user.displayName}</h2>
                 <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, marginBottom: '24px' }}>{user.email}</p>
                 <Badge label={user.role.toUpperCase()} variant={user.role === 'admin' ? 'primary' : 'neutral'} />
              </div>
              
              <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9' }}>
                 <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '16px' }}>Network Coordinates</h4>
                 <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                       <div style={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px' }}>PHONE</div>
                       <div style={{ fontWeight: 600 }}>{contactPhone}</div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                       <div style={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px' }}>GENDER</div>
                       <div style={{ fontWeight: 600 }}>{buyerData?.gender || (sellerData?.dateOfBirth ? 'Shared' : 'Omitted')}</div>
                    </div>
                    {buyerData?.dateOfBirth && (
                       <div style={{ fontSize: '13px', color: '#475569' }}>
                          <div style={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px' }}>DATE OF BIRTH</div>
                          <div style={{ fontWeight: 600 }}>{new Date(buyerData.dateOfBirth).toLocaleDateString()}</div>
                       </div>
                    )}
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                       <div style={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px' }}>REGISTRATION</div>
                       <div style={{ fontWeight: 600 }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Historical'}</div>
                    </div>
                 </div>
              </div>
           </div>
        </aside>

        {/* Main Content Area */}
        <main>
           {/* Section 1: Role-Specific Data */}
           {user.role === 'seller' && sellerData ? (
              <section style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '40px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '4px', height: '24px', background: '#2563eb', borderRadius: '2px' }} />
                       Store Performance Analytics
                    </h3>
                    <Badge label="Merchant Registry" variant="success" />
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {[
                       { label: 'Total Sales', value: sellerData.analytics?.totalSales || sellerOrders.length, color: '#1e293b' },
                       { label: 'Total Revenue', value: `₹${(sellerData.analytics?.revenue || totalRevenue).toLocaleString()}`, color: '#2563eb' },
                       { label: 'Store Views', value: sellerData.analytics?.storeViews || 0, color: '#64748b' },
                       { label: 'Conversion', value: `${sellerData.analytics?.conversion || 0}%`, color: '#10b981' },
                       { label: 'Store Rating', value: `${sellerData.analytics?.storeRating || 0}/5`, color: '#f59e0b' }
                    ].map((stat, i) => (
                       <div key={i} style={{ padding: '24px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.05em' }}>{stat.label}</div>
                          <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                       </div>
                    ))}
                 </div>

                 <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '20px', textTransform: 'uppercase' }}>Store Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                       <div><div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Shop Identity</div><div style={{ fontWeight: 700, color: '#0f172a' }}>{sellerData.shopName}</div></div>
                       <div><div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Merchant Location</div><div style={{ fontWeight: 700, color: '#0f172a' }}>{sellerData.sellerLocation}</div></div>
                       <div><div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Inventory Count</div><div style={{ fontWeight: 700, color: '#0f172a' }}>{sellerProducts.length} Live Items</div></div>
                       <div><div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Verification State</div><Badge label={sellerData.status || 'Pending'} variant={sellerData.status === 'verified' ? 'success' : 'warning'} /></div>
                    </div>
                 </div>
              </section>
           ) : (
              <section style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '40px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '4px', height: '24px', background: '#f59e0b', borderRadius: '2px' }} />
                       Purchase History & Activity
                    </h3>
                    <Badge label="Customer Profile" variant="neutral" />
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                       <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Total Volume</div>
                       <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>{userOrders.length}</div>
                       <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Consolidated Orders</div>
                    </div>
                    <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                       <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Lifetime Value</div>
                       <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb' }}>₹{userOrders.reduce((sum: number, o: Order) => sum + (o.amount || 0), 0).toLocaleString()}</div>
                       <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>Economic Contribution</div>
                    </div>
                 </div>

                 <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '20px', textTransform: 'uppercase' }}>Onboarding Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                       <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Recipient Name</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{buyerData?.addresses?.[0]?.name || user.displayName}</div>
                       </div>
                       <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Contact Phone</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{buyerData?.phone || 'Not Provided'}</div>
                       </div>
                       <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Date of Birth</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                             {buyerData?.dateOfBirth ? new Date(buyerData.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not Provided'}
                          </div>
                       </div>
                       <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Gender</div>
                          <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{buyerData?.gender || 'Not Provided'}</div>
                       </div>
                       <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Primary Address</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                             {buyerData?.addresses?.[0] ? (
                                [
                                   buyerData.addresses[0].addressLine,
                                   buyerData.addresses[0].locality,
                                   buyerData.addresses[0].city,
                                   buyerData.addresses[0].state,
                                   buyerData.addresses[0].pincode
                                ].filter(Boolean).join(', ')
                             ) : 'No Address Stored'}
                          </div>
                       </div>
                    </div>
                 </div>
              </section>
           )}

           {/* Section: Professional Activity Ledger (Buyer vs Seller Lists) */}
           {user.role === 'buyer' ? (
              <section style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '40px', marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Fulfillment Ledger & Logistics</h3>
                 {userOrders.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                       {userOrders.map((order, i) => {
                          const product = products.find(p => p.productId === order.productId);
                          return (
                             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <img src={product?.productMedia[0] || 'https://via.placeholder.com/60'} alt="" style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                   <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{product?.productType || 'Asset'} {product?.productSubCategory}</div>
                                   <div style={{ fontSize: '12px', color: '#64748b' }}>Order ID: {order.orderId.substring(0, 8)} • {new Date(order.orderDate).toLocaleDateString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                   <div style={{ fontWeight: 800, color: '#2563eb' }}>₹{order.amount.toLocaleString()}</div>
                                   <Badge label={order.status.toUpperCase()} variant="neutral" />
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 ) : (
                    <div style={{ padding: '60px', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>Transaction archive empty.</div>
                 )}
              </section>
           ) : (
              <section style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '40px', marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Merchant Inventory Catalog</h3>
                 {sellerProducts.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                       {sellerProducts.map((p, i) => (
                          <div key={i} style={{ background: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                             <img src={p.productMedia[0]} alt="" style={{ width: '100%', aspectRatio: '1.2', objectFit: 'cover' }} />
                             <div style={{ padding: '16px' }}>
                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px', marginBottom: '4px' }}>{p.productType} {p.productSubCategory}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                   <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '15px' }}>₹{p.productPrice.toLocaleString()}</span>
                                   <Badge label={p.status.toUpperCase()} variant={p.status === 'APPROVED' ? 'success' : 'neutral'} />
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div style={{ padding: '60px', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>Inventory registry empty.</div>
                 )}
              </section>
           )}

           {/* Section 3: Merchant Documentation (Seller Only) */}
           {user.role === 'seller' && sellerData && (
              <section style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '40px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>KYC & Compliance Documentation</h3>
                    <Badge label={sellerData.status?.toUpperCase() || 'DOCUMENTATION PENDING'} variant={sellerData.status === 'verified' ? 'success' : 'warning'} />
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                    <div>
                       <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Primary License</h4>
                       <div onClick={() => sellerData.sellerCertificateUrl && setActiveMedia(sellerData.sellerCertificateUrl)} style={{ width: '100%', height: '300px', background: '#f1f5f9', borderRadius: '24px', border: '2px dashed #cbd5e1', overflow: 'hidden', cursor: 'pointer' }}>
                          {sellerData.sellerCertificateUrl ? <img src={sellerData.sellerCertificateUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Missing</div>}
                       </div>
                    </div>
                    <div>
                       <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Operational Storefront Gallery</h4>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                          {(sellerData.shopPhotoUrls || []).map((url, i) => (
                             <div key={i} onClick={() => setActiveMedia(url)} style={{ width: '100%', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
                    <button onClick={() => handleApproval(true)} disabled={sellerData.status === 'verified'} style={{ flex: 1, padding: '18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>VERIFY STOREFRONT</button>
                    <button onClick={() => handleApproval(false)} disabled={sellerData.status === 'rejected'} style={{ flex: 1, padding: '18px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}>REJECT APPLICATION</button>
                 </div>
              </section>
           )}
        </main>
      </div>

      {activeMedia && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setActiveMedia(null)}>
           <button style={{ position: 'absolute', top: '32px', right: '32px', background: 'rgba(255,255,255,0.1)', border: 'none', width: '56px', height: '56px', borderRadius: '50%', color: '#fff' }}><FiX size={28}/></button>
           <div style={{ maxWidth: '90%', maxHeight: '90%', background: '#fff', borderRadius: '24px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <img src={activeMedia} alt="" style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block' }} />
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDossier;
