import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PetProductService } from '@/services/api/petverse/PetProductService';
import { PETVERSE_CATEGORIES, PETVERSE_BRANDS } from '@/data/petverseCatalog';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import { ProductSection } from '@/features/petverse/components/ProductSection';
import BlogSection from '@/features/petverse/enhancements/BlogSection';
import type { PetProduct } from '@/types/petverse';
import '@/features/petverse/petverse.css';

const RECENTLY_VIEWED_KEY = 'petverse_recently_viewed_v1';

function getRecentlyViewedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? '[]');
  } catch {
    return [];
  }
}

const PetverseHome: React.FC = () => {
  const [products, setProducts] = useState<PetProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = await PetProductService.getAllProducts();
      if (!cancelled) {
        setProducts(all);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => products.filter((p) => p.isFeatured), [products]);
  const bestSellers = useMemo(() => products.filter((p) => p.isBestSeller), [products]);
  const newArrivals = useMemo(
    () => [...products].filter((p) => p.isNewArrival).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
    [products]
  );
  const flashSale = useMemo(() => products.filter((p) => p.isFlashSale), [products]);
  const recommended = useMemo(() => [...products].sort((a, b) => b.rating - a.rating), [products]);
  const recentlyViewed = useMemo(() => {
    const ids = getRecentlyViewedIds();
    return ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as PetProduct[];
  }, [products]);

  if (loading) {
    return <div className="pv-loading">Loading AniSell Store…</div>;
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="pv-container" style={{ paddingTop: 24 }}>
        <div className="pv-hero">
          <div className="pv-hero-content">
            <span className="pv-hero-eyebrow">Everything for your pet, in one place</span>
            <h1 className="pv-hero-title">Premium food, toys & healthcare for every pet you love</h1>
            <p className="pv-hero-subtitle">Dogs, cats, birds, fish, rabbits & more — shop from top brands with fast doorstep delivery.</p>
            <Link to={PETVERSE_ROUTES.PRODUCTS} className="pv-btn">Shop Now →</Link>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <section className="pv-section">
        <div className="pv-container">
          <div className="pv-section-header">
            <div>
              <h2 className="pv-section-title">Popular Categories</h2>
              <p className="pv-section-subtitle">Everything your pet needs, neatly organized.</p>
            </div>
          </div>
          <div className="pv-category-grid">
            {PETVERSE_CATEGORIES.map((cat) => (
              <Link key={cat.id} to={PETVERSE_ROUTES.categoryPath(cat.slug)} className="pv-category-card">
                <span className="pv-category-icon">{cat.icon}</span>
                <span className="pv-category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProductSection title="⚡ Flash Sale" subtitle="Limited-time deals, while stocks last." products={flashSale} />
      <ProductSection title="Today's Deals" subtitle="Hand-picked offers just for you." products={featured} />
      <ProductSection title="Best Sellers" subtitle="Most loved by pet parents across India." products={bestSellers} />
      <ProductSection title="New Arrivals" subtitle="Freshly stocked products." products={newArrivals} />

      {/* Top Brands */}
      <section className="pv-section">
        <div className="pv-container">
          <div className="pv-section-header">
            <div>
              <h2 className="pv-section-title">Top Brands</h2>
              <p className="pv-section-subtitle">Trusted names in pet care.</p>
            </div>
          </div>
          <div className="pv-grid-2col">
            {PETVERSE_BRANDS.map((b) => (
              <div key={b.id} className="pv-category-card" style={{ cursor: 'default' }}>
                <span className="pv-category-icon">{b.logo}</span>
                <span className="pv-category-name">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductSection title="Recommended For You" subtitle="Top-rated picks across AniSell Store." products={recommended} />
      {recentlyViewed.length > 0 && (
        <ProductSection title="Recently Viewed" products={recentlyViewed} />
      )}

      {/* New Features Promo */}
      <section className="pv-section" style={{ background: 'linear-gradient(135deg, #f3f0ff 0%, #eef2ff 100%)', padding: '40px 20px', marginTop: 0 }}>
        <div className="pv-container" style={{ textAlign: 'center' }}>
          <div className="pv-section-header" style={{ textAlign: 'center' }}>
            <div>
              <h2 className="pv-section-title">✨ New Features</h2>
              <p className="pv-section-subtitle">We have added 25+ new features to enhance your shopping experience.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <Link to={PETVERSE_ROUTES.ENHANCEMENTS} className="pv-btn pv-btn-primary">Explore All Features</Link>
            <Link to={PETVERSE_ROUTES.COMPARE} className="pv-btn pv-btn-outline">Compare Products</Link>
            <Link to={PETVERSE_ROUTES.PETS} className="pv-btn pv-btn-outline">Pet Profiles</Link>
            <Link to={PETVERSE_ROUTES.LOYALTY} className="pv-btn pv-btn-outline">Loyalty Rewards</Link>
            <Link to={PETVERSE_ROUTES.COUPONS} className="pv-btn pv-btn-outline">Coupons</Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <BlogSection />
    </div>
  );
};

export default PetverseHome;
