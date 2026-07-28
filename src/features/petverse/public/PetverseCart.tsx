import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePetverseCart } from '@/context/PetverseCartContext';
import { PetProductService } from '@/services/api/petverse/PetProductService';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import type { PetProduct } from '@/types/petverse';
import '@/features/petverse/petverse.css';

const PetverseCart: React.FC = () => {
  const { items, loading, updateQuantity, removeFromCart } = usePetverseCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Record<string, PetProduct>>({});
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingProducts(true);
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
      return { line, product, variant, unitPrice, lineTotal: unitPrice * line.quantity };
    })
    .filter(Boolean) as { line: (typeof items)[number]; product: PetProduct; variant?: PetProduct['variants'][number]; unitPrice: number; lineTotal: number }[];

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const deliveryFee = subtotal > 999 || subtotal === 0 ? 0 : 49;
  const total = subtotal + deliveryFee;

  if (loading || loadingProducts) return <div className="pv-loading">Loading your cart…</div>;

  if (items.length === 0) {
    return (
      <div className="pv-container pv-section">
        <div className="pv-empty-state">
          <div className="pv-empty-icon">🛒</div>
          <h2>Your AniSell cart is empty</h2>
          <p>Add some products your pet will love!</p>
          <Link to={PETVERSE_ROUTES.HOME} className="pv-btn pv-btn-primary" style={{ marginTop: 16 }}>Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pv-container pv-section">
      <h1 className="pv-section-title" style={{ marginBottom: 20 }}>Your Cart ({lines.length} items)</h1>
      <div className="pv-cart-layout">
        <div>
          {lines.map(({ line, product, variant, unitPrice, lineTotal }) => (
            <div key={`${line.productId}-${line.variantId ?? 'default'}`} className="pv-cart-line">
              <Link to={PETVERSE_ROUTES.productPath(product.id)} className="pv-cart-thumb">
                <img src={product.images[0]} alt={product.title} />
              </Link>
              <div>
                <Link to={PETVERSE_ROUTES.productPath(product.id)} style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--color-text-main)' }}>
                  {product.title}
                </Link>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '4px 0' }}>
                  {variant?.label ?? 'Standard'} · ₹{unitPrice.toLocaleString('en-IN')} each
                </p>
                <div className="pv-qty-stepper" style={{ marginTop: 6 }}>
                  <button type="button" onClick={() => updateQuantity(line.productId, line.variantId, line.quantity - 1)}>−</button>
                  <span>{line.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(line.productId, line.variantId, line.quantity + 1)}>+</button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700 }}>₹{lineTotal.toLocaleString('en-IN')}</p>
                <button
                  type="button"
                  onClick={() => removeFromCart(line.productId, line.variantId)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', cursor: 'pointer', marginTop: 8 }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pv-summary-card">
          <h3 style={{ marginBottom: 12 }}>Order Summary</h3>
          <div className="pv-summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div className="pv-summary-row"><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
          <div className="pv-summary-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
          <button type="button" className="pv-btn pv-btn-primary pv-btn-block" style={{ marginTop: 16 }} onClick={() => navigate(PETVERSE_ROUTES.CHECKOUT)}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetverseCart;
