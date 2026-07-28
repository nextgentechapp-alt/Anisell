import React, { useState } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FiX } from 'react-icons/fi';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Product } from '@/types';

/**
 * Platform Supply Oversight.
 * Governs the marketplace catalog, category architecture, and stock policies.
 */
const AdminProducts: React.FC = () => {
  const { products, loading } = useSearchData();
  const [filterType, setFilterType] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (loading) return (
     <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {[...Array(8)].map((_, i) => <SkeletonTableRow key={i} columns={5} />)}
     </div>
  );

  const uniqueTypes = ['All', ...Array.from(new Set(products.map(p => p.productType)))];
  const filteredProducts = products.filter(p => filterType === 'All' || p.productType === filterType);

  const handleAction = async (id: string, action: string) => {
    const confirmationText = action === 'Delete' ? 'permanently purge' : action === 'Approve' ? 'verify and list' : 'decline';
    if (!window.confirm(`Are you certain you want to ${confirmationText} this registry entry?`)) return;

    try {
      const productRef = doc(db, 'products', id);
      if (action === 'Delete') {
         await deleteDoc(productRef);
         setSelectedProduct(null);
      } else if (action === 'Approve') {
         await updateDoc(productRef, { status: 'APPROVED' });
         if (selectedProduct && selectedProduct.productId === id) {
           setSelectedProduct({ ...selectedProduct, status: 'APPROVED' });
         }
      } else if (action === 'Reject') {
         await updateDoc(productRef, { status: 'REJECTED' });
         if (selectedProduct && selectedProduct.productId === id) {
           setSelectedProduct({ ...selectedProduct, status: 'REJECTED' });
         }
      }
    } catch (error) {
       console.error(`Failed to execute ${action} on product ${id}:`, error);
       alert(`Authorization failure: Unable to ${action.toLowerCase()} listing.`);
    }
  };

  const productColumns = [
    { 
      header: 'Listing Entity', 
      key: 'productSubCategory',
      render: (p: Product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img 
                src={p.productMedia[0]} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
           </div>
           <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{p.productSubCategory}</div>
        </div>
      )
    },
    { 
      header: 'Supply Status', 
      key: 'status', 
      render: (p: Product) => {
        const variants: Record<string, any> = {
          'APPROVED': 'success',
          'PENDING': 'warning',
          'REJECTED': 'error',
          'SOLD': 'neutral'
        };
        const labels: Record<string, string> = {
          'APPROVED': 'Live Hub',
          'PENDING': 'KYC Required',
          'REJECTED': 'Restricted',
          'SOLD': 'Fulfillment Closed'
        };
        return <Badge label={labels[p.status] || p.status} variant={variants[p.status] || 'neutral'} />;
      }
    },
    { 
      header: 'Unit Value', 
      key: 'productPrice', 
      render: (p: Product) => (
        <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '15px' }}>₹{p.productPrice.toLocaleString()}</div>
      )
    },
    { 
      header: 'Listing Category', 
      key: 'productCategory',
      render: (p: Product) => (
        <div style={{ fontWeight: 600, color: '#64748b', fontSize: '14px' }}>{p.productCategory}</div>
      )
    }
  ];

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Product Control</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Govern marketplace inventory, curate catalogs, and enforce listing quality.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <select 
             value={filterType} 
             onChange={(e) => setFilterType(e.target.value)}
             style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600 }}
           >
             {uniqueTypes.map(t => <option key={t} value={t}>{t} Records</option>)}
           </select>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table data={filteredProducts} columns={productColumns} onRowClick={(p) => setSelectedProduct(p)} />
      </div>

      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div style={{ background: '#fff', width: '100%', maxWidth: '800px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer', zIndex: 10 }}
              >
                <FiX />
              </button>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
                 <div style={{ padding: '40px', background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                       <img 
                          src={selectedProduct.productMedia[0]} 
                          alt="" 
                          style={{ width: '100%', aspectRatio: '1', borderRadius: '20px', objectFit: 'cover', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                       />
                       <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                          <Badge label={selectedProduct.status} variant={selectedProduct.status === 'APPROVED' ? 'success' : 'warning'} />
                       </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                       {selectedProduct.productMedia.slice(1).map((m, i) => (
                          <img key={i} src={m} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                       ))}
                    </div>
                 </div>

                 <div style={{ padding: '40px' }}>
                    <header style={{ marginBottom: '32px' }}>
                       <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Inventory Operations Registry</div>
                       <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{selectedProduct.productSubCategory}</h2>
                       <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{selectedProduct.productCategory} • {selectedProduct.productType}</div>
                    </header>

                    <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '20px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
                       <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Commercial Valuation</div>
                       <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb' }}>₹{selectedProduct.productPrice.toLocaleString()}</div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                       <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Biological Specifications</h4>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div>
                             <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Biological Age</div>
                             <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>{selectedProduct.productAge}</div>
                          </div>
                          <div>
                             <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Gender Profile</div>
                             <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>{selectedProduct.productGender}</div>
                          </div>
                          <div>
                             <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Medical Protocol</div>
                             <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>{selectedProduct.productVaccinated ? 'Vaccinated' : 'Pending Protocol'}</div>
                          </div>
                          <div>
                             <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Product Reference</div>
                             <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>ID: {selectedProduct.productId.substring(0, 8).toUpperCase()}</div>
                          </div>
                       </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                       <button 
                          onClick={() => handleAction(selectedProduct.productId, 'Approve')}
                          disabled={selectedProduct.status === 'APPROVED'}
                          style={{ padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', opacity: selectedProduct.status === 'APPROVED' ? 0.3 : 1 }}
                       >
                          Authorize Listing
                       </button>
                       <button 
                          onClick={() => handleAction(selectedProduct.productId, 'Reject')}
                          disabled={selectedProduct.status === 'REJECTED'}
                          style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', opacity: selectedProduct.status === 'REJECTED' ? 0.3 : 1 }}
                       >
                          Reject
                       </button>
                       <button 
                          onClick={() => handleAction(selectedProduct.productId, 'Delete')}
                          style={{ gridColumn: 'span 2', padding: '16px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}
                       >
                          Purge Registry Entry
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
