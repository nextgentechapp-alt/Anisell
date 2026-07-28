import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PetProductService } from '@/services/api/petverse/PetProductService';
import { PetReviewService } from '@/services/api/petverse/PetReviewService';
import { usePetverseCart } from '@/context/PetverseCartContext';
import { usePetverseWishlist } from '@/context/PetverseWishlistContext';
import { ProductCard } from '@/features/petverse/components/ProductCard';
import { StarRating } from '@/features/petverse/components/StarRating';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import type { PetProduct, PetProductReview } from '@/types/petverse';
import '@/features/petverse/petverse.css';

const RECENTLY_VIEWED_KEY = 'petverse_recently_viewed_v1';

function pushRecentlyViewed(productId: string) {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? '[]');
    const next = [productId, ...ids.filter((id) => id !== productId)].slice(0, 10);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch {
    /* non-fatal */
  }
}

const PetverseProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = usePetverseCart();
  const { isWishlisted, toggleWishlist } = usePetverseWishlist();

  const [product, setProduct] = useState<PetProduct | null>(null);
  const [related, setRelated] = useState<PetProduct[]>([]);
  const [reviews, setReviews] = useState<PetProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeVariant, setActiveVariant] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const p = await PetProductService.getProductById(productId);
      if (cancelled) return;
      setProduct(p);
      setActiveVariant(p?.variants[0]?.id);
      setLoading(false);
      if (p) {
        pushRecentlyViewed(p.id);
        const [rel, rev] = await Promise.all([
          PetProductService.getRelatedProducts(p),
          PetReviewService.getReviewsForProduct(p.id),
        ]);
        if (!cancelled) {
          setRelated(rel);
          setReviews(rev);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.id === activeVariant),
    [product, activeVariant]
  );
  const finalPrice = (product?.price ?? 0) + (selectedVariant?.priceDelta ?? 0);
  const inStock = (selectedVariant?.stock ?? product?.stock ?? 0) > 0;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, activeVariant, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product.id, activeVariant, quantity);
    navigate(PETVERSE_ROUTES.CHECKOUT);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const review: PetProductReview = {
        id: `rev-${Date.now()}`,
        userId: user?.uid ?? 'guest',
        userName: user?.displayName ?? 'Verified Buyer',
        rating: reviewRating,
        comment: reviewText.trim(),
        createdAt: new Date().toISOString(),
        verifiedPurchase: !!user,
      };
      await PetReviewService.addReview(product.id, review);
      setReviews((prev) => [review, ...prev]);
      setReviewText('');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="pv-loading">Loading product…</div>;
  if (!product) return <div className="pv-error">Product not found.</div>;

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="pv-container pv-section">
      <div className="pv-detail-grid">
        {/* Gallery */}
        <div>
          <div className="pv-gallery-main">
            <img src={product.images[activeImage]} alt={product.title} />
          </div>
          <div className="pv-gallery-thumbs">
            {product.images.map((img, idx) => (
              <button
                key={img + idx}
                type="button"
                className={`pv-gallery-thumb ${idx === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(idx)}
                style={{ padding: 0, border: idx === activeImage ? undefined : 'none' }}
              >
                <img src={img} alt={`${product.title} ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="pv-product-brand">{product.brand}</span>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: '4px 0 8px' }}>{product.title}</h1>
          <span className="pv-product-rating">★ {product.rating} ({product.ratingCount} ratings)</span>

          <div className="pv-product-price-row" style={{ marginTop: 16 }}>
            <span className="pv-price" style={{ fontSize: '2rem' }}>₹{finalPrice.toLocaleString('en-IN')}</span>
            {product.mrp > product.price && <span className="pv-mrp">₹{product.mrp.toLocaleString('en-IN')}</span>}
            {product.discountPercent > 0 && <span className="pv-discount">{product.discountPercent}% off</span>}
          </div>
          <p className="pv-delivery-eta">🚚 Delivery in {product.deliveryEtaDays} days · Sold by {product.sellerName}</p>

          {product.variants.length > 0 && (
            <div>
              <h4 style={{ marginTop: 20, marginBottom: 4, fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Options</h4>
              <div className="pv-variant-row">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`pv-variant-chip ${activeVariant === v.id ? 'active' : ''}`}
                    onClick={() => setActiveVariant(v.id)}
                    disabled={v.stock === 0}
                  >
                    {v.label} {v.priceDelta > 0 ? `(+₹${v.priceDelta})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
            <div className="pv-qty-stepper">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: inStock ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 700 }}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="pv-detail-actions">
            <button type="button" className="pv-btn pv-btn-outline pv-btn-block" onClick={handleAddToCart} disabled={!inStock}>
              🛒 Add to Cart
            </button>
            <button type="button" className="pv-btn pv-btn-primary pv-btn-block" onClick={handleBuyNow} disabled={!inStock}>
              Buy Now
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="button" className="pv-btn pv-btn-outline" onClick={() => toggleWishlist(product.id)}>
              {wishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}
            </button>
            <button
              type="button"
              className="pv-btn pv-btn-outline"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: product.title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
            >
              🔗 Share
            </button>
          </div>

          <h4 style={{ marginTop: 28, marginBottom: 8, fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Description</h4>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{product.description}</p>

          <h4 style={{ marginTop: 24, marginBottom: 8, fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Specifications</h4>
          <table className="pv-specs-table">
            <tbody>
              {product.specifications.map((s) => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td>{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Bought Together */}
      {related.length > 0 && (
        <section className="pv-section">
          <div className="pv-section-header">
            <h2 className="pv-section-title">Frequently Bought Together</h2>
          </div>
          <div className="pv-product-grid">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="pv-section">
        <div className="pv-section-header">
          <h2 className="pv-section-title">Customer Reviews</h2>
        </div>

        <form className="pv-form-card" onSubmit={handleSubmitReview}>
          <h3>Write a Review</h3>
          <div style={{ marginBottom: 12 }}>
            <StarRating rating={reviewRating} size={22} />
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`pv-variant-chip ${reviewRating === r ? 'active' : ''}`}
                  onClick={() => setReviewRating(r)}
                >
                  {r}★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={3}
            style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
          />
          <button type="submit" className="pv-btn pv-btn-primary" style={{ marginTop: 10 }} disabled={submittingReview || !reviewText.trim()}>
            {submittingReview ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No reviews yet — be the first to review this product.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="pv-review-card">
              <div className="pv-review-header">
                <strong>{r.userName}</strong>
                {r.verifiedPurchase && <span className="pv-verified-tag">Verified Purchase</span>}
              </div>
              <StarRating rating={r.rating} />
              <p style={{ marginTop: 6, fontSize: 'var(--font-size-sm)' }}>{r.comment}</p>
            </div>
          ))
        )}
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pv-section">
          <div className="pv-section-header">
            <h2 className="pv-section-title">Related Products</h2>
          </div>
          <div className="pv-product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PetverseProductDetail;
