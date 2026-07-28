import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { Order, Product } from '@/types';
import styles from './UserOrders.module.css';

interface UserOrdersProps {
  orders: Order[];
  products: Product[];
  onTrack?: (id: string) => void;
}

/**
 * User Account Order Feature.
 * Orchestrates the customer purchase history view, leveraging the shared Badge UI 
 * component to visualize standardized shipping and fulfillment statuses.
 * Extracted from Profile.tsx to isolate customer-specific features.
 */
export const UserOrders: React.FC<UserOrdersProps> = ({ 
  orders, 
  products,
  onTrack 
}) => {
  return (
    <div className={styles.container}>
      {orders.length > 0 ? (
        <div className={styles.list}>
          {orders.map(order => {
             const product = products.find(p => p.productId === order.productId);
             const variant = order.status === 'DELIVERED' ? 'success' : 
                            order.status === 'CANCELLED' ? 'error' : 
                            order.status === 'SHIPPED' ? 'primary' :
                            order.status === 'PROCESSING' ? 'warning' : 'neutral';

             return (
               <div key={order.orderId} className={styles.orderCard}>
                 {/* 1. Header Metdata */}
                 <header className={styles.cardHeader}>
                    <Badge label={order.status} variant={variant} />
                    <span className={styles.orderId}>ID: #{order.orderId}</span>
                 </header>

                 {/* 2. Item Fulfillment Core */}
                 <div className={styles.cardBody}>
                    <img 
                      src={product?.productMedia?.[0] || 'https://via.placeholder.com/150?text=Pet+Item'} 
                      alt="" 
                      className={styles.productImg} 
                    />
                    <div className={styles.productInfo}>
                       <h4 className={styles.productName}>{product?.productSubCategory || 'Pet Item'}</h4>
                       <div className={styles.orderMeta}>
                         Ordered on {new Date(order.orderDate).toLocaleDateString()}
                       </div>
                    </div>
                    <div className={styles.actions}>
                       <span className={styles.price}>₹{order.amount.toLocaleString()}</span>
                       <button 
                         className="button-base button-outline" 
                         style={{ padding: '8px 16px', fontSize: '13px' }}
                         onClick={() => onTrack?.(order.orderId)}
                       >
                         Track Detailed Progress
                       </button>
                    </div>
                 </div>
               </div>
             );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
           <p>No account activity tracked yet. Start browsing the marketplace!</p>
        </div>
      )}
    </div>
  );
};
