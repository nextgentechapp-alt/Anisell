import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PetProductService } from '@/services/api/petverse/PetProductService';
import { PetOrderService } from '@/services/api/petverse/PetOrderService';
import { PETVERSE_CATEGORIES } from '@/data/petverseCatalog';
import type { PetOrder, PetProduct, PetVerseCategorySlug } from '@/types/petverse';
import '@/features/petverse/petverse.css';

type Tab = 'listings' | 'add' | 'orders' | 'earnings';

const PetverseSellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('listings');
  const [allProducts, setAllProducts] = useState<PetProduct[]>([]);
  const [allOrders, setAllOrders] = useState<PetOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState({
    title: '', categorySlug: 'accessories' as PetVerseCategorySlug, brand: '', price: 0, mrp: 0, stock: 0, animalType: 'All', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600', description: '',
  });

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const mrp = draft.mrp || draft.price;
      await PetProductService.createProduct({
        title: draft.title,
        slug: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categorySlug: draft.categorySlug,
        brand: draft.brand || 'Independent Seller',
        price: draft.price,
        mrp,
        discountPercent: mrp > draft.price ? Math.round(((mrp - draft.price) / mrp) * 100) : 0,
        rating: 0,
        ratingCount: 0,
        stock: draft.stock,
        images: [draft.image],
        description: draft.description,
        specifications: [{ label: 'Sold By', value: user.displayName || 'AniSell Seller' }],
        variants: [{ id: `var-${Date.now()}`, label: 'Standard', priceDelta: 0, stock: draft.stock }],
        deliveryEtaDays: 4,
        tags: [draft.categorySlug],
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        isFlashSale: false,
        animalType: draft.animalType,
        ageGroup: 'all-ages',
        sellerId: user.uid,
        sellerName: user.displayName || 'AniSell Seller',
        createdAt: new Date().toISOString(),
      });
      setDraft({ title: '', categorySlug: 'accessories', brand: '', price: 0, mrp: 0, stock: 0, animalType: 'All', image: draft.image, description: '' });
      await loadData();
      setTab('listings');
    } finally {
      setSaving(false);
    }
  };

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
        {(['listings', 'add', 'orders', 'earnings'] as Tab[]).map((t) => (
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

      {tab === 'add' && (
        <form className="pv-form-card" onSubmit={handleAddProduct}>
          <h3>Upload New Product</h3>
          <div className="pv-form-grid">
            <input className="pv-full-span" placeholder="Product Title" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <select value={draft.categorySlug} onChange={(e) => setDraft({ ...draft, categorySlug: e.target.value as PetVerseCategorySlug })}>
              {PETVERSE_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <input placeholder="Brand" value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} />
            <input type="number" placeholder="Price (₹)" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
            <input type="number" placeholder="MRP (₹)" value={draft.mrp} onChange={(e) => setDraft({ ...draft, mrp: Number(e.target.value) })} />
            <input type="number" placeholder="Stock" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} />
            <input placeholder="Animal Type" value={draft.animalType} onChange={(e) => setDraft({ ...draft, animalType: e.target.value })} />
            <input className="pv-full-span" placeholder="Image URL" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
            <textarea className="pv-full-span" placeholder="Description" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} style={{ padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
          </div>
          <button type="submit" className="pv-btn pv-btn-primary" style={{ marginTop: 12 }} disabled={saving}>{saving ? 'Publishing…' : 'Publish Product'}</button>
        </form>
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
