import React, { useMemo } from 'react';
import { FiCheckCircle, FiPackage, FiUser, FiCalendar, FiLoader, FiShoppingBag, FiClock } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { OrderService } from '@/services/api/OrderService';
import type { Order, Product } from '@/types';
import styles from './SellerHome.module.css';

interface SellerOrdersProps {
  sellerOrders: { order: Order; buyerName: string; productName: string }[];
  products: Product[];
}

/**
 * Dedicated Seller Order Management Feature.
 * Redesigned with inline dispatch actions — no modal required.
 * Aligned with the premium SellerHome dashboard layout.
 */
export const SellerOrders: React.FC<SellerOrdersProps> = ({ sellerOrders, products }) => {
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = React.useState<Record<string, string>>({});

  const handleDispatch = async (buyerId: string, orderId: string) => {
    setUpdatingId(orderId);
    try {
      await OrderService.updateOrderStatus(buyerId, orderId, 'SHIPPED');
      setLocalStatuses(prev => ({ ...prev, [orderId]: 'SHIPPED' }));
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Operation failed. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getEffectiveStatus = (order: Order) => {
    return localStatuses[order.orderId] || order.status;
  };

  const orderStats = useMemo(() => {
    const total = sellerOrders.length;
    const dispatched = sellerOrders.filter(o => {
      const s = getEffectiveStatus(o.order);
      return s !== 'PENDING' && s !== 'CANCELLED';
    }).length;
    const pending = sellerOrders.filter(o => getEffectiveStatus(o.order) === 'PENDING').length;
    return { total, dispatched, pending };
  }, [sellerOrders, localStatuses]);

  const pendingOrders = sellerOrders.filter(o => getEffectiveStatus(o.order) === 'PENDING');
  const dispatchedOrders = sellerOrders.filter(o => {
    const s = getEffectiveStatus(o.order);
    return s !== 'PENDING' && s !== 'CANCELLED';
  });
  const cancelledOrders = sellerOrders.filter(o => getEffectiveStatus(o.order) === 'CANCELLED');

  const renderOrderCard = ({ order, buyerName, productName }: { order: Order; buyerName: string; productName: string }) => {
    const product = products.find(p => p.productId === order.productId);
    const status = getEffectiveStatus(order);
    const isPending = status === 'PENDING';
    const isDispatched = status !== 'PENDING' && status !== 'CANCELLED';
    const isThisUpdating = updatingId === order.orderId;

    return (
      <div
        key={order.orderId}
        style={{
          background: '#fff',
          borderRadius: '20px',
          border: isPending ? '2px solid #f59e0b' : '1px solid #e2e8f0',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: isPending ? '0 4px 20px rgba(245, 158, 11, 0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Card Body */}
        <div style={{ display: 'flex', gap: '16px', padding: '20px', alignItems: 'center' }}>
          {/* Product Thumbnail */}
          {product?.productMedia?.[0] ? (
            <img
              src={product.productMedia[0]}
              alt=""
              style={{
                width: '72px', height: '72px', borderRadius: '14px',
                objectFit: 'cover', flexShrink: 0,
                border: '2px solid #f1f5f9'
              }}
            />
          ) : (
            <div style={{
              width: '72px', height: '72px', borderRadius: '14px',
              background: '#f1f5f9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <FiPackage size={24} color="#94a3b8" />
            </div>
          )}

          {/* Order Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{productName}</span>
              <Badge
                label={isDispatched ? 'DISPATCHED' : status}
                variant={isDispatched ? 'success' : (status === 'CANCELLED' ? 'error' : 'warning')}
                size="sm"
              />
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiUser size={12} /> {buyerName}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiCalendar size={12} /> {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
              ₹{order.amount.toLocaleString()}
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginLeft: '6px' }}>
                × {order.quantity || 1}
              </span>
            </div>
          </div>

          {/* Inline Action */}
          <div style={{ flexShrink: 0 }}>
            {isPending ? (
              <button
                onClick={() => handleDispatch(order.buyerId, order.orderId)}
                disabled={isThisUpdating}
                style={{
                  background: isThisUpdating ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', border: 'none', borderRadius: '14px',
                  padding: '12px 20px', fontWeight: 800, fontSize: '13px',
                  cursor: isThisUpdating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: isThisUpdating ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {isThisUpdating ? (
                  <><FiLoader size={14} className="spin" /> Processing...</>
                ) : (
                  <><FiCheckCircle size={14} /> Dispatch</>
                )}
              </button>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 16px', background: isDispatched ? '#f0fdf4' : '#fef2f2',
                borderRadius: '12px', fontSize: '12px', fontWeight: 700,
                color: isDispatched ? '#166534' : '#991b1b',
                border: `1px solid ${isDispatched ? '#bbf7d0' : '#fecaca'}`,
              }}>
                <FiCheckCircle size={13} />
                {isDispatched ? 'Dispatched' : 'Cancelled'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header style={{ marginBottom: '32px' }}>
         <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Manage Orders</h2>
         <p style={{ color: '#64748b' }}>Track and acknowledge incoming inquiries from interested buyers.</p>
      </header>

      <div className={styles.kpiGrid} style={{ marginBottom: '40px' }}>
        <StatCard 
          label="Total Orders" 
          value={orderStats.total} 
          icon={<FiShoppingBag />} 
          color="#2563eb"
          variant="primary"
        />
        <StatCard 
          label="Dispatched" 
          value={orderStats.dispatched} 
          icon={<FiCheckCircle />} 
          color="#10b981"
          variant="success"
        />
        <StatCard 
          label="Awaiting Action" 
          value={orderStats.pending} 
          icon={<FiClock />} 
          color="#f59e0b"
          variant="warning"
        />
      </div>

      {/* Section: Pending — Needs Action */}
      {pendingOrders.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingOrders.map(renderOrderCard)}
          </div>
        </div>
      )}

      {/* Section: Dispatched */}
      {dispatchedOrders.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dispatchedOrders.map(renderOrderCard)}
          </div>
        </div>
      )}

      {/* Section: Cancelled */}
      {cancelledOrders.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cancelledOrders.map(renderOrderCard)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sellerOrders.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 20px', background: '#f8fafc',
          borderRadius: '24px', border: '1px dashed #e2e8f0',
        }}>
          <FiPackage size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#1e293b', fontWeight: 700, marginBottom: '8px' }}>No Orders Yet</h3>
          <p style={{ color: '#64748b', maxWidth: '360px', margin: '0 auto' }}>
            When buyers contact you about your items, their requests will appear here.
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
