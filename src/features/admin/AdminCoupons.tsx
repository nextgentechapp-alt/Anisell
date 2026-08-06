import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTruck, FiTag, FiSave, FiX } from 'react-icons/fi';
import { PlatformSettingsService, DEFAULT_DELIVERY_SETTINGS, type DeliverySettings } from '@/services/api/PlatformSettingsService';
import { PetCouponService } from '@/services/api/petverse/PetCouponService';
import type { PetCoupon } from '@/types/petverse';

const EMPTY_COUPON_FORM = {
  code: '',
  description: '',
  discountType: 'flat' as 'flat' | 'percent',
  discountValue: '',
  minOrderValue: '',
  maxDiscount: '',
  expiresAt: '',
  active: true,
};

type CouponForm = typeof EMPTY_COUPON_FORM;

const couponToForm = (c: PetCoupon): CouponForm => ({
  code: c.code,
  description: c.description,
  discountType: c.discountType,
  discountValue: String(c.discountValue),
  minOrderValue: String(c.minOrderValue),
  maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
  expiresAt: (c.expiresAt ?? '').slice(0, 10),
  active: c.active,
});

const AdminCoupons: React.FC = () => {
  const [delivery, setDelivery] = useState<DeliverySettings>(DEFAULT_DELIVERY_SETTINGS);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState(String(DEFAULT_DELIVERY_SETTINGS.fee));
  const [freeThresholdInput, setFreeThresholdInput] = useState(String(DEFAULT_DELIVERY_SETTINGS.freeThreshold));
  const [deliverySaved, setDeliverySaved] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');

  const [coupons, setCoupons] = useState<PetCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY_COUPON_FORM);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState('');

  const loadDelivery = async () => {
    const settings = await PlatformSettingsService.getDeliverySettings();
    setDelivery(settings);
    setDeliveryFeeInput(String(settings.fee));
    setFreeThresholdInput(String(settings.freeThreshold));
  };

  const loadCoupons = async () => {
    setLoadingCoupons(true);
    const all = await PetCouponService.getAllCoupons();
    setCoupons(all);
    setLoadingCoupons(false);
  };

  useEffect(() => {
    loadDelivery();
    loadCoupons();
  }, []);

  const handleSaveDelivery = async () => {
    setDeliveryError('');
    setDeliverySaved(false);
    const fee = Number(deliveryFeeInput);
    const freeThreshold = Number(freeThresholdInput);
    if (!Number.isFinite(fee) || fee < 0) {
      setDeliveryError('Enter a valid delivery fee.');
      return;
    }
    if (!Number.isFinite(freeThreshold) || freeThreshold < 0) {
      setDeliveryError('Enter a valid free-delivery threshold.');
      return;
    }
    try {
      const settings = { fee, freeThreshold };
      await PlatformSettingsService.updateDeliverySettings(settings);
      setDelivery(settings);
      setDeliverySaved(true);
      setTimeout(() => setDeliverySaved(false), 3000);
    } catch {
      setDeliveryError('Could not save. Firestore is not available (mock mode).');
    }
  };

  const openCreate = () => {
    setEditingCode(null);
    setForm(EMPTY_COUPON_FORM);
    setShowForm(true);
    setCouponError('');
  };

  const openEdit = (c: PetCoupon) => {
    setEditingCode(c.code);
    setForm(couponToForm(c));
    setShowForm(true);
    setCouponError('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCode(null);
    setCouponMessage('');
    setCouponError('');
  };

  const handleSaveCoupon = async () => {
    setCouponMessage('');
    setCouponError('');
    const code = form.code.trim().toUpperCase();
    if (!code) {
      setCouponError('Coupon code is required.');
      return;
    }
    const discountValue = Number(form.discountValue);
    const minOrderValue = Number(form.minOrderValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      setCouponError('Enter a valid discount value.');
      return;
    }
    if (!Number.isFinite(minOrderValue) || minOrderValue < 0) {
      setCouponError('Enter a valid minimum order value.');
      return;
    }
    const maxDiscount = form.maxDiscount ? Number(form.maxDiscount) : undefined;
    if (maxDiscount !== undefined && (!Number.isFinite(maxDiscount) || maxDiscount <= 0)) {
      setCouponError('Enter a valid max discount (or leave blank).');
      return;
    }
    const payload: Omit<PetCoupon, 'code'> & { code: string } = {
      code,
      description: form.description,
      discountType: form.discountType,
      discountValue,
      minOrderValue,
      ...(maxDiscount !== undefined ? { maxDiscount } : {}),
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : '',
      active: form.active,
    };
    try {
      if (editingCode) {
        await PetCouponService.updateCoupon(editingCode, payload);
      } else {
        await PetCouponService.createCoupon(payload);
      }
      setCouponMessage(editingCode ? `Coupon "${code}" updated.` : `Coupon "${code}" created.`);
      await loadCoupons();
      setTimeout(() => {
        setCouponMessage('');
        setShowForm(false);
        setEditingCode(null);
      }, 1500);
    } catch {
      setCouponError('Could not save coupon. Firestore is not available (mock mode).');
    }
  };

  const handleDeleteCoupon = async (c: PetCoupon) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    try {
      await PetCouponService.deleteCoupon(c.code);
      await loadCoupons();
    } catch {
      window.alert('Could not delete coupon. Firestore is not available (mock mode).');
    }
  };

  const handleToggleActive = async (c: PetCoupon) => {
    try {
      await PetCouponService.updateCoupon(c.code, { active: !c.active });
      await loadCoupons();
    } catch {
      window.alert('Could not update coupon. Firestore is not available (mock mode).');
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: 14,
    boxSizing: 'border-box',
    background: '#fff',
  };

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Coupons &amp; Delivery</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Configure PetVerse delivery charges and manage store coupons.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Delivery charge configuration */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: '#dbeafe', borderRadius: '50%', color: '#2563eb' }}><FiTruck size={22} /></div>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Delivery Charge Configuration</h4>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Applied on the PetVerse Store checkout &amp; cart summary.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: 480, marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Delivery Fee (₹)</label>
              <input type="number" min={0} value={deliveryFeeInput} onChange={(e) => setDeliveryFeeInput(e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Free Delivery Above (₹)</label>
              <input type="number" min={0} value={freeThresholdInput} onChange={(e) => setFreeThresholdInput(e.target.value)} style={fieldStyle} />
            </div>
          </div>

          {deliveryError && <p style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 12px 0' }}>{deliveryError}</p>}
          {deliverySaved && <p style={{ color: '#16a34a', fontSize: '13px', margin: '0 0 12px 0' }}>Delivery settings saved. Cart and checkout now use the new values.</p>}

          <button
            onClick={handleSaveDelivery}
            style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <FiSave /> Save Delivery Settings
          </button>
          <p style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>Currently: ₹{delivery.fee} fee · free above ₹{delivery.freeThreshold.toLocaleString('en-IN')}</p>
        </div>

        {/* Coupon management */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '50%', color: '#d97706' }}><FiTag size={22} /></div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Coupon Management</h4>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Create, edit, activate and remove PetVerse Store coupons.</p>
              </div>
            </div>
            <button
              onClick={openCreate}
              style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <FiPlus /> Create Coupon
            </button>
          </div>

          {couponMessage && <p style={{ color: '#16a34a', fontSize: '13px', margin: '0 0 12px 0' }}>{couponMessage}</p>}
          {couponError && <p style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 12px 0' }}>{couponError}</p>}

          {showForm && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{editingCode ? `Edit Coupon ${editingCode}` : 'New Coupon'}</h5>
                <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><FiX size={20} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Coupon Code</label>
                  <input placeholder="e.g. SAVE20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} style={fieldStyle} disabled={!!editingCode} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Discount Type</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'flat' | 'percent' })} style={fieldStyle}>
                    <option value="flat">Flat (₹)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>{form.discountType === 'flat' ? 'Discount Value (₹)' : 'Discount Percent (%)'}</label>
                  <input type="number" min={0} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} style={fieldStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Min Order Value (₹)</label>
                  <input type="number" min={0} value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} style={fieldStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Max Discount (₹, optional)</label>
                  <input type="number" min={0} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} style={fieldStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Expires On (optional)</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} style={fieldStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Description</label>
                  <input placeholder="Short description shown to customers" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={fieldStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="coupon-active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  <label htmlFor="coupon-active" style={{ fontSize: 14, color: '#475569' }}>Coupon is active</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button onClick={handleSaveCoupon} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  {editingCode ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button onClick={closeForm} style={{ padding: '10px 20px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {loadingCoupons ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading coupons…</p>
          ) : coupons.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No coupons yet. Create your first coupon above.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Code</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Description</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Discount</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Min Order</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Expires</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#1e293b' }}>{c.code}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{c.description || '—'}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>
                        {c.discountType === 'flat' ? `₹${c.discountValue}` : `${c.discountValue}%`}
                        {c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}
                      </td>
                      <td style={{ padding: '12px', color: '#334155' }}>₹{c.minOrderValue.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleToggleActive(c)}
                          style={{ padding: '5px 12px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: c.active ? '#dcfce7' : '#fee2e2', color: c.active ? '#16a34a' : '#dc2626' }}
                        >
                          {c.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: 13 }}>
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'Never'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEdit(c)} title="Edit" style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: 8, padding: '7px 9px', cursor: 'pointer' }}><FiEdit2 size={14} /></button>
                          <button onClick={() => handleDeleteCoupon(c)} title="Delete" style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '7px 9px', cursor: 'pointer' }}><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
