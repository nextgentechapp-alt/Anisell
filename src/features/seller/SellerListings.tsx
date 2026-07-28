import React, { useMemo } from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import { StatCard } from '@/components/ui/StatCard';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiCheck, FiAlertCircle } from 'react-icons/fi';
import type { Product } from '@/types';
import styles from './SellerListings.module.css';
import homeStyles from './SellerHome.module.css';

interface SellerListingsProps {
  products: Product[];
  isVerified?: boolean;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * Merchant Listing Management Feature.
 * Orchestrates the seller's active stock, leveraging the shared ProductCard (compact)
 * and Badge UI components to visualize standardized platform statuses.
 * Aligned with the premium SellerHome dashboard layout.
 */
export const SellerListings: React.FC<SellerListingsProps> = ({ 
  products, 
  isVerified = true,
  onAdd, 
  onEdit, 
  onDelete 
}) => {
  const stats = useMemo(() => {
    return {
      total: products.length,
      approved: products.filter(p => p.status === 'APPROVED').length,
      pending: products.filter(p => p.status === 'PENDING').length,
      rejected: products.filter(p => p.status === 'REJECTED').length,
    };
  }, [products]);

  return (
    <div className={styles.container}>
      {/* 1. Portal Meta - Actions & Summary */}
      <header className={styles.header}>
        <div>
           <h2 className={styles.title}>Inventory Management</h2>
           <p className={styles.subtitle}>List your pets and track their marketplace verification status.</p>
        </div>
        {isVerified && (
           <button className="button-base button-primary" onClick={onAdd}>
              <FiPlus /> Add New Listing
           </button>
        )}
      </header>

      {/* 2. Merchant KPI Metrics */}
      <div className={homeStyles.kpiGrid} style={{ marginBottom: '32px' }}>
        <StatCard 
          label="Total Items" 
          value={stats.total} 
          icon={<FiPackage />} 
          color="#2563eb"
          variant="primary"
        />
        <StatCard 
          label="Live Catalog" 
          value={stats.approved} 
          icon={<FiCheck />} 
          color="#10b981"
          variant="success"
        />
        <StatCard 
          label="Verification" 
          value={stats.pending} 
          icon={<FiAlertCircle />} 
          color="#f59e0b"
          variant="warning"
        />
      </div>

      {!isVerified && (
         <div style={{ background: '#fef2f2', border: '1px solid #f87171', padding: '16px', borderRadius: '8px', marginBottom: '24px', color: '#991b1b', fontSize: '14px' }}>
            <strong>Store Verification Pending:</strong> Your merchant account is under review. You will be able to add inventory to the marketplace once an administrator approves your KYC details.
         </div>
      )}

      {/* 3. Operational Hub - Inventory Visualization */}
      {products.length > 0 ? (
        <div className={styles.grid}>
          {products.map(product => (
            <div key={product.productId} className={styles.productWrapper}>
               <ProductCard product={product as any} showStatus={true} />
               
               {product.status === 'REJECTED' && product.rejectionReason && (
                 <div style={{ marginTop: '12px', padding: '12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', fontSize: '12px', color: '#991b1b', fontStyle: 'italic', fontWeight: 500 }}>
                   <strong>Rejection Reason:</strong> {product.rejectionReason}
                 </div>
               )}

               <div className={styles.actionsOverlay}>
                  <div className={styles.statusBox}>
                     {product.status === 'APPROVED' && <span style={{ color: '#10b981', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Public Catalog</span>}
                     {product.status === 'PENDING' && <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Awaiting Review</span>}
                     {product.status === 'REJECTED' && <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Listing Denied</span>}
                     <span className={styles.stock}>Quantity: 1</span>
                  </div>
                  {isVerified && (
                     <div className={styles.btnGroup}>
                        <button className={styles.actionBtn} onClick={() => onEdit?.(product.productId)} title="Modify Attributes">
                          <FiEdit2 />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDelete?.(product.productId)} title="Withdraw Listing">
                          <FiTrash2 />
                        </button>
                     </div>
                  )}
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
           <p>Your store doesn't have any active pet listings yet.</p>
           {isVerified ? (
              <button className="button-base button-outline" onClick={onAdd}>Establish First Listing</button>
           ) : (
              <p style={{ marginTop: '12px', color: '#64748b' }}>Complete your verification to post your first listing.</p>
           )}
        </div>
      )}
    </div>
  );
};
