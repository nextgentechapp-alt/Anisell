import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PetOrderService } from '@/services/api/petverse/PetOrderService';
import type { PetOrder, PetOrderStatus } from '@/types/petverse';
import '@/features/petverse/petverse.css';

const TRACK_STEPS: PetOrderStatus[] = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

const PetverseOrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<PetOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      const data = await PetOrderService.getOrderById(orderId);
      if (!cancelled) {
        setOrder(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const handleReturnRequest = async () => {
    if (!order) return;
    setRequesting(true);
    try {
      await PetOrderService.requestReturn(order.id);
      const updated = await PetOrderService.getOrderById(order.id);
      setOrder(updated);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="pv-loading">Loading order…</div>;
  if (!order) return <div className="pv-error">Order not found.</div>;

  const currentStepIndex = TRACK_STEPS.indexOf(order.status);
  const isCancelledOrReturned = ['cancelled', 'return_requested', 'returned', 'refunded'].includes(order.status);

  return (
    <div className="pv-container pv-section">
      <h1 className="pv-section-title" style={{ marginBottom: 8 }}>Order #{order.trackingId ?? order.id.slice(0, 8)}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
        Placed on {new Date(order.placedAt).toLocaleString('en-IN')}
      </p>

      {!isCancelledOrReturned ? (
        <div className="pv-track-steps">
          {TRACK_STEPS.map((step, idx) => (
            <div key={step} className={`pv-track-step ${idx <= currentStepIndex ? 'done' : ''}`}>
              <div className="dot" />
              {step.replace(/_/g, ' ')}
            </div>
          ))}
        </div>
      ) : (
        <div className="pv-form-card">
          <span className={`pv-status-pill ${order.status}`}>{order.status.replace(/_/g, ' ')}</span>
        </div>
      )}

      <div className="pv-checkout-layout">
        <div>
          <div className="pv-form-card">
            <h3>Items</h3>
            {order.items.map((item) => (
              <div key={item.productId + (item.variantId ?? '')} className="pv-cart-line" style={{ marginBottom: 12 }}>
                <div className="pv-cart-thumb"><img src={item.image} alt={item.title} /></div>
                <div>
                  <strong style={{ fontSize: 'var(--font-size-sm)' }}>{item.title}</strong>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Qty: {item.quantity}</p>
                </div>
                <span style={{ fontWeight: 700 }}>₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="pv-form-card">
            <h3>Shipping Address</h3>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
              📞 {order.shippingAddress.phone}
            </p>
          </div>
        </div>

        <div className="pv-summary-card">
          <h3 style={{ marginBottom: 12 }}>Payment Summary</h3>
          <div className="pv-summary-row"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
          <div className="pv-summary-row"><span>Delivery</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
          {order.discount > 0 && <div className="pv-summary-row"><span>Discount</span><span>−₹{order.discount.toLocaleString('en-IN')}</span></div>}
          <div className="pv-summary-row total"><span>Total</span><span>₹{order.total.toLocaleString('en-IN')}</span></div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 12 }}>
            Payment: {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
          </p>

          {order.status === 'delivered' && (
            <button type="button" className="pv-btn pv-btn-outline pv-btn-block" style={{ marginTop: 16 }} onClick={handleReturnRequest} disabled={requesting}>
              {requesting ? 'Requesting…' : 'Request Return / Refund'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetverseOrderDetail;
