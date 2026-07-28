import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePetverseWishlist } from '@/context/PetverseWishlistContext';
import { PetProductService } from '@/services/api/petverse/PetProductService';
import { ProductCard } from '@/features/petverse/components/ProductCard';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import type { PetProduct } from '@/types/petverse';
import '@/features/petverse/petverse.css';

const PetverseWishlist: React.FC = () => {
  const { items, loading } = usePetverseWishlist();
  const [products, setProducts] = useState<PetProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingProducts(true);
      const resolved = await Promise.all(items.map((i) => PetProductService.getProductById(i.productId)));
      if (!cancelled) {
        setProducts(resolved.filter(Boolean) as PetProduct[]);
        setLoadingProducts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (loading || loadingProducts) return <div className="pv-loading">Loading your wishlist…</div>;

  if (products.length === 0) {
    return (
      <div className="pv-container pv-section">
        <div className="pv-empty-state">
          <div className="pv-empty-icon">🤍</div>
          <h2>Your wishlist is empty</h2>
          <p>Tap the heart icon on any product to save it here.</p>
          <Link to={PETVERSE_ROUTES.HOME} className="pv-btn pv-btn-primary" style={{ marginTop: 16 }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pv-container pv-section">
      <h1 className="pv-section-title" style={{ marginBottom: 20 }}>Your Wishlist ({products.length})</h1>
      <div className="pv-product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default PetverseWishlist;
