import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePetverseCart } from '@/context/PetverseCartContext';
import { PetProductService } from '@/services/api/petverse/PetProductService';
import { PetOrderService } from '@/services/api/petverse/PetOrderService';
import { PETVERSE_COUPONS } from '@/data/petverseCatalog';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import type { PetAddress, PetOrder, PetOrderItem, PetProduct } from '@/types/petverse';
import '@/features/petverse/petverse.css';

const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || '';

const normalizePhone = (p: string) => {
  const digits = p.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const PetverseCheckout: React.FC = () => {
  const { user } = useAuth();
  const { items, clearCart } = usePetverseCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Record<string, PetProduct>>({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [address, setAddress] = useState<PetAddress>({
    fullName: user?.displayName ?? '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PetOrder['paymentMethod']>('cod');
  const [utr, setUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<(typeof PETVERSE_COUPONS)[number] | null>(null);
  const [couponError, setCouponError] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        items.map(async (line) => [line.productId, await PetProductService.getProductById(line.productId)] as const)
      );
      if (!cancelled) {
        const map: Record<string, PetProduct> = {};
        entries.forEach(([id, p]) => {
          if (p) map[id] = p;
        });
        setProducts(map);
        setLoadingProducts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const lines = items
    .map((line) => {
      const product = products[line.productId];
      if (!product) return null;
      const variant = product.variants.find((v) => v.id === line.variantId);
      const unitPrice = product.price + (variant?.priceDelta ?? 0);
      return { line, product, unitPrice };
    })
    .filter(Boolean) as { line: (typeof items)[number]; product: PetProduct; unitPrice: number }[];

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.line.quantity, 0);
  const deliveryFee = subtotal > 999 || subtotal === 0 ? 0 : 49;

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minOrderValue) return 0;
    const raw =
      appliedCoupon.discountType === 'flat'
        ? appliedCoupon.discountValue
        : Math.round((subtotal * appliedCoupon.discountValue) / 100);
    return appliedCoupon.maxDiscount ? Math.min(raw, appliedCoupon.maxDiscount) : raw;
  }, [appliedCoupon, subtotal]);

  const total = subtotal + deliveryFee - discount;

  const handleApplyCoupon = () => {
    const found = PETVERSE_COUPONS.find((c) => c.code.toLowerCase() === couponInput.trim().toLowerCase() && c.active);
    if (!found) {
      setCouponError('Invalid or expired coupon code.');
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < found.minOrderValue) {
      setCouponError(`Minimum order value ₹${found.minOrderValue} required for this coupon.`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(found);
    setCouponError('');
  };

  const addressComplete = address.fullName && address.phone && address.line1 && address.city && address.state && address.pincode;

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login', { state: { from: PETVERSE_ROUTES.CHECKOUT } });
      return;
    }
    if (!addressComplete || lines.length === 0) return;

    let waWindow: Window | null = null;
    if (ADMIN_PHONE) {
      const itemsSummary = lines.map((l) => `${l.product.title} x${l.line.quantity}`).join(', ');
      const msg = `New Order!\nBuyer: ${user?.displayName || user?.uid || ''}\nItems: ${itemsSummary}\nTotal: ₹${total}\nPayment: ${paymentMethod}\nAddress: ${address.line1}, ${address.city}`;
      waWindow = window.open(`https://wa.me/${normalizePhone(ADMIN_PHONE)}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    setPlacing(true);
    try {
      const orderItems: PetOrderItem[] = lines.map((l) => ({
        productId: l.product.id,
        variantId: l.line.variantId,
        title: l.product.title,
        image: l.product.images[0],
        quantity: l.line.quantity,
        unitPrice: l.unitPrice,
      }));

      const now = new Date().toISOString();
      const order: Omit<PetOrder, 'id'> = {
        userId: user.uid,
        items: orderItems,
        subtotal,
        discount,
        deliveryFee,
        total,
        status: 'placed',
        ...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}),
        shippingAddress: address,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending_verification',
        ...(paymentMethod === 'upi' && utr ? { utr } : {}),
        placedAt: now,
        statusHistory: [{ status: 'placed', at: now }],
        trackingId: `PV${Date.now().toString().slice(-8)}`,
      };

      const orderId = await PetOrderService.placeOrder(order);
      clearCart();
      if (waWindow) {
        const itemsSummary = orderItems.map(i => `${i.title} x${i.quantity}`).join(', ');
        const msg = `New Order!\nOrder: ${orderId}\nBuyer: ${user.displayName || user.uid}\nItems: ${itemsSummary}\nTotal: ₹${total}\nPayment: ${paymentMethod}\nAddress: ${address.line1}, ${address.city}`;
        waWindow.location.href = `https://wa.me/${normalizePhone(ADMIN_PHONE)}?text=${encodeURIComponent(msg)}`;
      }
      navigate(PETVERSE_ROUTES.orderPath(orderId));
    } finally {
      setPlacing(false);
    }
  };

  if (loadingProducts) return <div className="pv-loading">Preparing checkout…</div>;

  if (lines.length === 0) {
    return (
      <div className="pv-container pv-section">
        <div className="pv-empty-state">
          <div className="pv-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add products before checking out.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pv-container pv-section">
      <h1 className="pv-section-title" style={{ marginBottom: 20 }}>Checkout</h1>
      <div className="pv-checkout-layout">
        <div>
          <div className="pv-form-card">
            <h3>Shipping Address</h3>
            <div className="pv-form-grid">
              <input placeholder="Full Name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
              <input placeholder="Phone Number" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
              <input className="pv-full-span" placeholder="Address Line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              <input className="pv-full-span" placeholder="Address Line 2 (optional)" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
              <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              <input placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              <input placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
            </div>
          </div>

          <div className="pv-form-card">
            <h3>Payment Method</h3>
            {([
              ['cod', '💵 Cash on Delivery'],
              ['upi', '📱 UPI'],
              ['card', '💳 Credit / Debit Card'],
              ['netbanking', '🏦 Net Banking'],
            ] as const).map(([value, label]) => (
              <div
                key={value}
                className={`pv-payment-option ${paymentMethod === value ? 'active' : ''}`}
                onClick={() => { setPaymentMethod(value); if (value !== 'upi') setUtr(''); }}
              >
                <input type="radio" checked={paymentMethod === value} onChange={() => { setPaymentMethod(value); if (value !== 'upi') setUtr(''); }} />
                {label}
              </div>
            ))}
            {paymentMethod === 'upi' && (
              <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Pay via UPI</p>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('upi://pay?pa=' + encodeURIComponent(import.meta.env.VITE_UPI_ID || 'subikshan182006-1@oksbi') + '&pn=AniSell&am=' + total + '&cu=INR')}`}
                    alt="UPI QR Code"
                    style={{ width: 200, height: 200, borderRadius: 8 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <code style={{ flex: 1, padding: '8px 12px', background: '#fff', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}>{import.meta.env.VITE_UPI_ID || 'subikshan182006-1@oksbi'}</code>
                  <button
                    type="button"
                    className="pv-btn pv-btn-outline"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => {
                      navigator.clipboard.writeText(import.meta.env.VITE_UPI_ID || 'subikshan182006-1@oksbi');
                      setCopiedUpi(true);
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                  >
                    {copiedUpi ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <input
                  placeholder="Enter UTR / Transaction ID"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
                />
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Enter the UTR number from your UPI payment to complete the order.</p>
              </div>
            )}
          </div>

          <div className="pv-form-card">
            <h3>Order Items</h3>
            {lines.map((l) => (
              <div key={l.line.productId + (l.line.variantId ?? '')} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: 8 }}>
                <span>{l.product.title} × {l.line.quantity}</span>
                <span>₹{(l.unitPrice * l.line.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pv-summary-card">
          <h3 style={{ marginBottom: 12 }}>Price Summary</h3>
          <div className="pv-coupon-row">
            <input placeholder="Enter coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
            <button type="button" className="pv-btn pv-btn-outline" onClick={handleApplyCoupon}>Apply</button>
          </div>
          {couponError && <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', marginTop: -8, marginBottom: 12 }}>{couponError}</p>}
          {appliedCoupon && <p style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-xs)', marginTop: -8, marginBottom: 12 }}>Coupon "{appliedCoupon.code}" applied!</p>}

          <div className="pv-summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div className="pv-summary-row"><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
          {discount > 0 && <div className="pv-summary-row"><span>Coupon Discount</span><span>−₹{discount.toLocaleString('en-IN')}</span></div>}
          <div className="pv-summary-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>

          <button
            type="button"
            className="pv-btn pv-btn-primary pv-btn-block"
            style={{ marginTop: 16 }}
            disabled={!addressComplete || (paymentMethod === 'upi' && !utr) || placing}
            onClick={handlePlaceOrder}
          >
            {placing ? 'Placing Order…' : !user ? 'Login to Place Order' : 'Place Order'}
          </button>
          {!addressComplete && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 8 }}>Fill in your full shipping address to continue.</p>}
        </div>
      </div>
    </div>
  );
};

export default PetverseCheckout;
