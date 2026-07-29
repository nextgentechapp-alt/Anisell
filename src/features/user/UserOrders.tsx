import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { OrderService } from '@/services/api/OrderService';
import type { Order, Product } from '@/types';
import styles from './UserOrders.module.css';

interface UserOrdersProps {
  orders: Order[];
  products: Product[];
  onTrack?: (id: string) => void;
  buyerId?: string;
  onOrderCancelled?: (orderId: string) => void;
}

export const UserOrders: React.FC<UserOrdersProps> = ({ 
  orders, 
  products,
  onTrack,
  buyerId,
  onOrderCancelled,
}) => {
  const handleCancel = async (orderId: string) => {
    if (!buyerId) return;
    if (!window.confirm(`Are you sure you want to cancel order ${orderId.substring(0, 12)}?`)) return;
    try {
      await OrderService.cancelOrder(buyerId, orderId);
      onOrderCancelled?.(orderId);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  const canCancel = (order: Order) => {
    return ['PENDING', 'PROCESSING'].includes(order.status);
  };

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
                 <header className={styles.cardHeader}>
                    <Badge label={order.status} variant={variant} />
                    <span className={styles.orderId}>ID: #{order.orderId}</span>
                 </header>

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
                       {order.payment && (
                         <div className={styles.orderMeta}>
                           Payment: {order.payment.method === 'cod' ? 'COD' : order.payment.status === 'paid' ? 'Paid' : 'Pending'}
                         </div>
                       )}
                    </div>
                    <div className={styles.actions}>
                       <span className={styles.price}>₹{order.amount.toLocaleString()}</span>
                       <button 
                         className="button-base button-outline" 
                         style={{ padding: '8px 16px', fontSize: '13px' }}
                         onClick={() => onTrack?.(order.orderId)}
                       >
                         Track Order
                       </button>
                       {canCancel(order) && (
                         <button 
                           className="button-base" 
                           style={{ padding: '8px 16px', fontSize: '13px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer' }}
                           onClick={() => handleCancel(order.orderId)}
                         >
                           Cancel Order
                         </button>
                       )}
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
