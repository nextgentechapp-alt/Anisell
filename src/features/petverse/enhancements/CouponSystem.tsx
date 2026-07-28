import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './CouponSystem.module.css';
import { PETVERSE_COUPONS, PETVERSE_PRODUCTS } from '@/data/petverseCatalog';
import type { PetCoupon } from '@/types/petverse';

interface CouponSystemProps {
  onApply?: (coupon: { code: string; discount: number; type: string }) => void;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const MOCK_COUPONS: PetCoupon[] = [
  { code: 'WELCOME20', description: '20% off up to ₹500 on first order', discountType: 'percent', discountValue: 20, minOrderValue: 999, maxDiscount: 500, expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(), active: true },
  { code: 'FREEDEL', description: 'Free delivery on orders above ₹299', discountType: 'flat', discountValue: 49, minOrderValue: 299, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(), active: true },
  { code: 'PETCARE', description: 'Flat ₹150 off on pet care products', discountType: 'flat', discountValue: 150, minOrderValue: 799, expiresAt: new Date(Date.now() + 45 * 86400000).toISOString(), active: true },
  { code: 'FURFRIEND', description: '15% off on toys & accessories', discountType: 'percent', discountValue: 15, minOrderValue: 499, maxDiscount: 300, expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(), active: true },
];

const ALL_COUPONS = [...PETVERSE_COUPONS, ...MOCK_COUPONS];

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

function computeDiscount(coupon: PetCoupon, subtotal: number): number {
  if (subtotal < coupon.minOrderValue) return 0;
  if (coupon.discountType === 'flat') return coupon.discountValue;
  const raw = Math.round(subtotal * (coupon.discountValue / 100));
  return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
}

const FLASH_PRODUCTS = PETVERSE_PRODUCTS.filter((p) => p.isFlashSale).slice(0, 4);

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

const CouponSystem: React.FC<CouponSystemProps> = ({ onApply }) => {
  const [inputCode, setInputCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(() => 2 * 3600);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const handleApply = useCallback((code: string) => {
    const coupon = ALL_COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) {
      showToast('Invalid coupon code', 'error');
      return;
    }
    if (!coupon.active) {
      showToast('This coupon is no longer active', 'error');
      return;
    }
    if (isExpired(coupon.expiresAt)) {
      showToast('This coupon has expired', 'error');
      return;
    }

    const disc = computeDiscount(coupon, 2000);
    if (disc === 0) {
      showToast(`Minimum order of ${formatCurrency(coupon.minOrderValue)} required`, 'error');
      return;
    }

    setAppliedCode(code.toUpperCase());
    setDiscount(disc);
    setInputCode('');
    showToast(`Coupon "${code.toUpperCase()}" applied! You save ${formatCurrency(disc)}`, 'success');
    onApply?.({ code: code.toUpperCase(), discount: disc, type: coupon.discountType });
  }, [onApply, showToast]);

  const handleRemove = useCallback(() => {
    setAppliedCode(null);
    setDiscount(0);
    showToast('Coupon removed', 'success');
  }, [showToast]);

  const handleCopy = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      showToast('Failed to copy', 'error');
    }
  }, [showToast]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={styles.wrapper}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}

      <div className="pv-section-header">
        <h2 className="pv-section-title">Coupons & Offers</h2>
      </div>

      <div className={styles.applySection}>
        {appliedCode ? (
          <div>
            <div className={styles.appliedBadge}>
              ✅ {appliedCode} applied — You save {formatCurrency(discount)}
              <button onClick={handleRemove} title="Remove coupon">✕</button>
            </div>
          </div>
        ) : (
          <div className={styles.applyRow}>
            <input
              className={styles.couponInput}
              placeholder="Enter coupon code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleApply(inputCode)}
            />
            <button className="pv-btn pv-btn-primary" onClick={() => handleApply(inputCode)} disabled={!inputCode.trim()}>
              Apply
            </button>
          </div>
        )}
      </div>

      {appliedCode && (
        <div className={styles.discountSummary}>
          <div className={styles.discountRow}>
            <span>Discount ({appliedCode})</span>
            <span className={styles.discountValue}>-{formatCurrency(discount)}</span>
          </div>
        </div>
      )}

      <div className={styles.couponList}>
        {ALL_COUPONS.map((coupon) => {
          const expired = isExpired(coupon.expiresAt);
          return (
            <div key={coupon.code} className={styles.couponCard} style={{ opacity: expired ? 0.5 : 1 }}>
              <div className={styles.couponIcon}>🏷️</div>
              <div className={styles.couponInfo}>
                <div className={styles.couponCode}>
                  {coupon.code}
                  <button className={styles.copyBtn} onClick={() => handleCopy(coupon.code)}>
                    {copiedCode === coupon.code ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <div className={styles.couponDesc}>{coupon.description}</div>
                <div className={styles.couponMeta}>
                  Min. order: {formatCurrency(coupon.minOrderValue)} &middot;
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {expired && ' ⏰ Expired'}
                </div>
              </div>
              <div className={styles.couponApply}>
                <button
                  className="pv-btn pv-btn-outline"
                  style={{ padding: '8px 16px', fontSize: 'var(--font-size-xs)' }}
                  onClick={() => handleApply(coupon.code)}
                  disabled={expired || appliedCode === coupon.code}
                >
                  {appliedCode === coupon.code ? 'Applied' : 'Apply'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.flashSection}>
        <div className={styles.flashHeader}>
          <div className={styles.flashTitle}>🔥 Flash Sale</div>
          <div className={styles.timer}>
            <span>Ends in</span>
            <span className={styles.timerUnit}>{pad(hours)}</span>
            <span>:</span>
            <span className={styles.timerUnit}>{pad(minutes)}</span>
            <span>:</span>
            <span className={styles.timerUnit}>{pad(seconds)}</span>
          </div>
        </div>
        <div className={styles.flashGrid}>
          {FLASH_PRODUCTS.map((product) => (
            <div key={product.id} className={styles.flashProduct}>
              <img className={styles.flashProductImage} src={product.images[0]} alt={product.title} />
              <div className={styles.flashProductName}>{product.title}</div>
              <div className={styles.flashProductPrice}>{formatCurrency(product.price)}</div>
              <div className={styles.flashProductMrp}>{formatCurrency(product.mrp)}</div>
            </div>
          ))}
          {FLASH_PRODUCTS.length === 0 && (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
              No flash sale products at the moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponSystem;
