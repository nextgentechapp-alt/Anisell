import React, { useState } from 'react';
import styles from './OrderTrackingTimeline.module.css';
import type { PetOrder, PetOrderStatus } from '@/types/petverse';

interface OrderTrackingTimelineProps {
  orderId?: string;
}

const STEP_CONFIG: { status: PetOrderStatus; icon: string; title: string }[] = [
  { status: 'placed', icon: '📋', title: 'Order Placed' },
  { status: 'confirmed', icon: '✅', title: 'Confirmed' },
  { status: 'shipped', icon: '📦', title: 'Shipped' },
  { status: 'out_for_delivery', icon: '🚚', title: 'Out for Delivery' },
  { status: 'delivered', icon: '🎉', title: 'Delivered' },
];

const STATUS_ORDER: PetOrderStatus[] = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'];

function getStepStatus(currentStatus: PetOrderStatus, stepStatus: PetOrderStatus): 'completed' | 'active' | 'pending' {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const stepIdx = STATUS_ORDER.indexOf(stepStatus);
  if (currentStatus === 'cancelled' || currentStatus === 'returned' || currentStatus === 'refunded' || currentStatus === 'return_requested') {
    if (stepIdx <= currentIdx && stepIdx <= 4) return 'completed';
    return 'pending';
  }
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getStatusEntry(history: { status: PetOrderStatus; at: string }[], status: PetOrderStatus): string | undefined {
  const entry = history.find((h) => h.status === status);
  return entry?.at;
}

function getDescription(status: PetOrderStatus): string {
  const map: Record<string, string> = {
    placed: 'Your order has been placed successfully.',
    confirmed: 'Seller has confirmed your order.',
    shipped: 'Your order is on its way.',
    out_for_delivery: 'Delivery partner is heading to your address.',
    delivered: 'Package delivered successfully.',
  };
  return map[status] ?? '';
}

const SAMPLE_ORDERS: PetOrder[] = [
  {
    id: 'pv-ord-001',
    userId: 'user-1',
    items: [
      { productId: 'pv-dogs-1', title: 'Adjustable Nylon Dog Collar', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200', quantity: 1, unitPrice: 349 },
      { productId: 'pv-food-1', title: 'Adult Dog Dry Food 3kg', image: 'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=200', quantity: 2, unitPrice: 1499 },
    ],
    subtotal: 3347,
    discount: 200,
    deliveryFee: 49,
    total: 3196,
    status: 'shipped',
    couponCode: 'PET50',
    shippingAddress: { fullName: 'Rahul Sharma', phone: '+91 98765 43210', line1: '42, Green Park Apartments', line2: 'Sector 12', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    placedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    statusHistory: [
      { status: 'placed', at: new Date(Date.now() - 7 * 86400000).toISOString() },
      { status: 'confirmed', at: new Date(Date.now() - 6 * 86400000).toISOString() },
      { status: 'shipped', at: new Date(Date.now() - 2 * 86400000).toISOString() },
    ],
    trackingId: 'TRK-ANL-7841',
  },
  {
    id: 'pv-ord-002',
    userId: 'user-1',
    items: [
      { productId: 'pv-cats-2', title: 'Self-Cleaning Litter Box', image: 'https://images.unsplash.com/photo-1601758064952-11f9f6c2f9a3?w=200', quantity: 1, unitPrice: 1799 },
    ],
    subtotal: 1799,
    discount: 0,
    deliveryFee: 49,
    total: 1848,
    status: 'delivered',
    shippingAddress: { fullName: 'Rahul Sharma', phone: '+91 98765 43210', line1: '42, Green Park Apartments', line2: 'Sector 12', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    placedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    statusHistory: [
      { status: 'placed', at: new Date(Date.now() - 14 * 86400000).toISOString() },
      { status: 'confirmed', at: new Date(Date.now() - 13 * 86400000).toISOString() },
      { status: 'shipped', at: new Date(Date.now() - 10 * 86400000).toISOString() },
      { status: 'out_for_delivery', at: new Date(Date.now() - 8 * 86400000).toISOString() },
      { status: 'delivered', at: new Date(Date.now() - 7 * 86400000).toISOString() },
    ],
    trackingId: 'TRK-ANL-4523',
  },
];

function canCancel(status: PetOrderStatus): boolean {
  return ['placed', 'confirmed'].includes(status);
}

function canReturn(status: PetOrderStatus): boolean {
  return status === 'delivered';
}

const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ orderId }) => {
  const [selectedId, setSelectedId] = useState(orderId ?? SAMPLE_ORDERS[0].id);
  const order = SAMPLE_ORDERS.find((o) => o.id === selectedId) ?? SAMPLE_ORDERS[0];

  const estimatedDelivery = (() => {
    if (order.status === 'delivered') return 'Delivered';
    if (order.status === 'cancelled' || order.status === 'returned' || order.status === 'refunded') return '—';
    const est = new Date(Date.now() + 3 * 86400000);
    return `Estimated: ${est.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`;
  })();

  return (
    <div className={styles.wrapper}>
      <div className="pv-section-header">
        <h2 className="pv-section-title">Order Tracking</h2>
      </div>

      <div className={styles.orderSelector}>
        {SAMPLE_ORDERS.map((o) => (
          <button
            key={o.id}
            className={`${styles.orderSelectBtn} ${selectedId === o.id ? styles.orderSelectBtnActive : ''}`}
            onClick={() => setSelectedId(o.id)}
          >
            #{o.trackingId ?? o.id.slice(0, 8)}
          </button>
        ))}
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <div>
            <strong style={{ fontSize: 'var(--font-size-lg)' }}>
              Order #{order.trackingId ?? order.id.slice(0, 8)}
            </strong>
            <p className={styles.orderId}>
              Placed on {formatDate(order.placedAt)} &middot; {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </p>
          </div>
          <span className={styles.estDelivery}>{estimatedDelivery}</span>
        </div>

        <div className={styles.itemsList}>
          {order.items.map((item, idx) => (
            <div key={idx} className={styles.itemRow}>
              <div className={styles.itemThumb}>
                <img src={item.image} alt={item.title} />
              </div>
              <div className={styles.itemInfo}>
                {item.title}
                <span className={styles.itemQty}> x{item.quantity}</span>
              </div>
              <div className={styles.itemPrice}>{formatCurrency(item.unitPrice * item.quantity)}</div>
            </div>
          ))}
        </div>

        <div className={styles.summaryRows}>
          <div className={styles.summaryRow}>
            <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Delivery Fee</span><span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          {order.discount > 0 && (
            <div className={`${styles.summaryRow} ${styles.summaryRowDiscount}`}>
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
            <span>Total</span><span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div className={styles.addressSection}>
          <div className={styles.addressTitle}>Shipping Address</div>
          <div className={styles.addressText}>
            {order.shippingAddress.fullName}, {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
          </div>
        </div>

        <div className={styles.paymentRow}>
          <span>Payment: {order.paymentMethod.toUpperCase()}</span>
          <span className={`${styles.paymentStatusBadge} ${
            order.paymentStatus === 'paid' ? styles.paymentStatusPaid :
            order.paymentStatus === 'failed' ? styles.paymentStatusFailed :
            styles.paymentStatusPending
          }`}>
            {order.paymentStatus}
          </span>
        </div>

        <div className={styles.actions}>
          {canCancel(order.status) && (
            <button className="pv-btn pv-btn-outline">Cancel Order</button>
          )}
          {canReturn(order.status) && (
            <button className="pv-btn pv-btn-outline">Return / Replace</button>
          )}
          {order.status === 'shipped' && (
            <button className="pv-btn pv-btn-primary">Track Live</button>
          )}
        </div>
      </div>

      <div className={styles.timeline}>
        {STEP_CONFIG.map((step) => {
          const stepStatus = getStepStatus(order.status, step.status);
          const entryDate = getStatusEntry(order.statusHistory, step.status);
          return (
            <div key={step.status} className={styles.step}>
              <div className={`${styles.stepIcon} ${
                stepStatus === 'completed' ? styles.stepIconCompleted :
                stepStatus === 'active' ? styles.stepIconActive :
                styles.stepIconPending
              }`}>
                {stepStatus === 'completed' ? '✓' : stepStatus === 'active' ? step.icon : step.icon}
              </div>
              <div className={styles.stepContent}>
                <div className={`${styles.stepTitle} ${
                  stepStatus === 'active' ? styles.stepTitleActive :
                  stepStatus === 'pending' ? styles.stepTitlePending : ''
                }`}>
                  {step.title}
                </div>
                {entryDate && <div className={styles.stepMeta}>{formatDate(entryDate)}</div>}
                {(stepStatus === 'active' || stepStatus === 'completed') && (
                  <div className={styles.stepDesc}>{getDescription(step.status)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingTimeline;
