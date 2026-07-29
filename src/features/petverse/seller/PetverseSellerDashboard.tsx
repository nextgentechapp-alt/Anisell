import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PetProductService } from '@/services/api/petverse/PetProductService';
import { PetOrderService } from '@/services/api/petverse/PetOrderService';
import type { PetOrder, PetProduct } from '@/types/petverse';
import '@/features/petverse/petverse.css';

type Tab = 'listings' | 'orders' | 'earnings';

const PetverseSellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('listings');
  const [allProducts, setAllProducts] = useState<PetProduct[]>([]);
  const [allOrders, setAllOrders] = useState<PetOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [p, o] = await Promise.all([PetProductService.getAllProducts(), PetOrderService.getAllOrders()]);
    setAllProducts(p);
    setAllOrders(o);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const myProducts = useMemo(() => allProducts.filter((p) => p.sellerId === user?.uid), [allProducts, user]);
  const myProductIds = useMemo(() => new Set(myProducts.map((p) => p.id)), [myProducts]);
  const myOrders = useMemo(
    () => allOrders.filter((o) => o.items.some((i) => myProductIds.has(i.productId))),
    [allOrders, myProductIds]
  );
  const earnings = useMemo(() => {
    return myOrders.reduce((sum, o) => {
      const mine = o.items.filter((i) => myProductIds.has(i.productId));
      return sum + mine.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    }, 0);
  }, [myOrders, myProductIds]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this listing?')) return;
    await PetProductService.deleteProduct(id);
    await loadData();
  };

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return (
      <div className="pv-container pv-section">
        <div className="pv-empty-state">
          <div className="pv-empty-icon">🔒</div>
          <h2>Seller access required</h2>
          <p>Log in with an AniSell seller account to access the AniSell Seller Panel.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="pv-loading">Loading your seller dashboard…</div>;

  return (
    <div className="pv-container pv-section">
      <h1 className="pv-section-title" style={{ marginBottom: 4 }}>🐾 AniSell Seller Panel</h1>
      <p className="pv-section-subtitle" style={{ marginBottom: 20 }}>Welcome back, {user.displayName || 'Seller'}.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['listings', 'orders', 'earnings'] as Tab[]).map((t) => (
          <button key={t} type="button" className={`pv-variant-chip ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'listings' && (
        <div className="pv-form-card">
          <h3>My Listings ({myProducts.length})</h3>
          {myProducts.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>You haven't listed any products yet.</p>}
          {myProducts.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={p.images[0]} alt={p.title} style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                <div>
                  <strong style={{ fontSize: 'var(--font-size-sm)' }}>{p.title}</strong>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>₹{p.price} · Stock: {p.stock}</p>
                </div>
              </div>
              <button type="button" className="pv-btn pv-btn-outline" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={() => handleDelete(p.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="pv-form-card">
          <h3>Orders Containing My Products ({myOrders.length})</h3>
          {myOrders.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No orders yet.</p>}
          {myOrders.map((o) => (
            <div key={o.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <strong>#{o.trackingId ?? o.id.slice(0, 8)}</strong>
              <span className={`pv-status-pill ${o.status}`} style={{ marginLeft: 10 }}>{o.status.replace(/_/g, ' ')}</span>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                {o.items.filter((i) => myProductIds.has(i.productId)).map((i) => i.title).join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === 'earnings' && (
        <div>
          <div className="pv-summary-card" style={{ marginBottom: 16 }}>
            <h3>Total Earnings</h3>
            <p style={{ fontSize: '2rem', fontWeight: 800 }}>₹{earnings.toLocaleString('en-IN')}</p>
          </div>
          <div className="pv-form-card">
            <h3>Withdraw Funds</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Withdrawals require a connected payout method (bank account / UPI) via a payment gateway
              such as Razorpay or Stripe Connect. Wire this up in a follow-up phase once you confirm
              which payment provider AniSell should standardize on for seller payouts.
            </p>
            <button type="button" className="pv-btn pv-btn-outline" disabled>Withdraw (requires payout setup)</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetverseSellerDashboard;
