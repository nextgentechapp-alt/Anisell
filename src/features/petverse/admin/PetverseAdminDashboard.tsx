import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PetProductService } from '@/services/api/petverse/PetProductService';
import { PetOrderService } from '@/services/api/petverse/PetOrderService';
import { PETVERSE_CATEGORIES } from '@/data/petverseCatalog';
import type { PetOrder, PetOrderStatus, PetProduct, PetVerseCategorySlug } from '@/types/petverse';
import '@/features/petverse/petverse.css';

type Tab = 'overview' | 'products' | 'orders' | 'inventory';

const emptyDraft = (): Omit<PetProduct, 'id'> => ({
  title: '',
  slug: '',
  categorySlug: 'accessories',
  brand: '',
  price: 0,
  mrp: 0,
  discountPercent: 0,
  rating: 0,
  ratingCount: 0,
  stock: 0,
  images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600'],
  description: '',
  specifications: [],
  variants: [{ id: `var-${Date.now()}`, label: 'Standard', priceDelta: 0, stock: 0 }],
  deliveryEtaDays: 3,
  tags: [],
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: true,
  isFlashSale: false,
  animalType: 'All',
  ageGroup: 'all-ages',
  sellerId: 'petverse-official',
  sellerName: 'AniSell Official Store',
  createdAt: new Date().toISOString(),
});

const PetverseAdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<PetProduct[]>([]);
  const [orders, setOrders] = useState<PetOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<PetProduct, 'id'>>(emptyDraft());
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [p, o] = await Promise.all([PetProductService.getAllProducts(), PetOrderService.getAllOrders()]);
    setProducts(p);
    setOrders(o);
    setLoading(false);
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const lowStock = useMemo(() => products.filter((p) => p.stock <= 5), [products]);
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);

  const startEdit = (p?: PetProduct) => {
    if (p) {
      setEditingId(p.id);
      const { id: _id, ...rest } = p;
      setDraft(rest);
    } else {
      setEditingId(null);
      setDraft(emptyDraft());
    }
    setTab('products');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...draft,
        slug: draft.slug || draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        discountPercent: draft.mrp > draft.price ? Math.round(((draft.mrp - draft.price) / draft.mrp) * 100) : 0,
      };
      if (editingId) {
        await PetProductService.updateProduct(editingId, payload);
      } else {
        await PetProductService.createProduct(payload);
      }
      setDraft(emptyDraft());
      setEditingId(null);
      await loadAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    await PetProductService.deleteProduct(id);
    await loadAll();
  };

  const handleStatusChange = async (orderId: string, status: PetOrderStatus) => {
    await PetOrderService.updateOrderStatus(orderId, status);
    await loadAll();
  };

  if (authLoading) return <div className="pv-loading">Checking access…</div>;

  if (!user || user.role !== 'admin') {
    return (
      <div className="pv-container pv-section">
        <div className="pv-empty-state">
          <div className="pv-empty-icon">🔒</div>
          <h2>Admin access required</h2>
          <p>Log in with an AniSell admin account to manage AniSell Store.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="pv-loading">Loading AniSell Admin…</div>;

  return (
    <div className="pv-container pv-section">
      <h1 className="pv-section-title" style={{ marginBottom: 4 }}>🐾 AniSell Admin</h1>
      <p className="pv-section-subtitle" style={{ marginBottom: 20 }}>Manage products, categories, orders & inventory for AniSell Store.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['overview', 'products', 'orders', 'inventory'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`pv-variant-chip ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
            style={{ textTransform: 'capitalize' }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="pv-grid-2col">
          <div className="pv-summary-card"><h3>Total Products</h3><p style={{ fontSize: '2rem', fontWeight: 800 }}>{products.length}</p></div>
          <div className="pv-summary-card"><h3>Total Orders</h3><p style={{ fontSize: '2rem', fontWeight: 800 }}>{orders.length}</p></div>
          <div className="pv-summary-card"><h3>Total Revenue</h3><p style={{ fontSize: '2rem', fontWeight: 800 }}>₹{totalRevenue.toLocaleString('en-IN')}</p></div>
          <div className="pv-summary-card"><h3>Low Stock Alerts</h3><p style={{ fontSize: '2rem', fontWeight: 800, color: lowStock.length ? 'var(--color-error)' : undefined }}>{lowStock.length}</p></div>
        </div>
      )}

      {tab === 'products' && (
        <div>
          <form className="pv-form-card" onSubmit={handleSaveProduct}>
            <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
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
              <input className="pv-full-span" placeholder="Image URL" value={draft.images[0]} onChange={(e) => setDraft({ ...draft, images: [e.target.value] })} />
              <textarea className="pv-full-span" placeholder="Description" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} style={{ padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button type="submit" className="pv-btn pv-btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}</button>
              {editingId && <button type="button" className="pv-btn pv-btn-outline" onClick={() => startEdit()}>Cancel</button>}
            </div>
          </form>

          <div className="pv-form-card">
            <h3>All Products ({products.length})</h3>
            {products.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={p.images[0]} alt={p.title} style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  <div>
                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>{p.title}</strong>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{p.categorySlug} · ₹{p.price} · Stock: {p.stock}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="pv-btn pv-btn-outline" onClick={() => startEdit(p)}>Edit</button>
                  <button type="button" className="pv-btn pv-btn-outline" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="pv-form-card">
          <h3>All Orders ({orders.length})</h3>
          {orders.map((o) => (
            <div key={o.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <strong>#{o.trackingId ?? o.id.slice(0, 8)}</strong>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{o.items.length} items · ₹{o.total.toLocaleString('en-IN')}</p>
                </div>
                <select className="pv-select" value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value as PetOrderStatus)}>
                  {(['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'] as PetOrderStatus[]).map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'inventory' && (
        <div className="pv-form-card">
          <h3>Low Stock Alerts (≤ 5 units)</h3>
          {lowStock.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>All products are sufficiently stocked.</p>
          ) : (
            lowStock.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>{p.title}</span>
                <span style={{ color: 'var(--color-error)', fontWeight: 700 }}>{p.stock} left</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PetverseAdminDashboard;
