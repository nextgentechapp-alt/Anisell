import React, { useMemo } from 'react';
import ProductCard from '../common/ProductCard';
import type { Product } from '@/types';

// --- Interface ---
interface MarketplaceProps {
  products: Product[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ products }) => {
  // Optimization: Sort by newSalesCount to show "Trending" or "Popular" pets first
  const trendingPets = useMemo(() => {
    return products
      .filter((p) => p.productCategory === 'Pets')
      .sort((a, b) => (b.newSalesCount || 0) - (a.newSalesCount || 0))
      .slice(0, 9);
  }, [products]);

  if (trendingPets.length === 0) {
    return null; // Don't render empty section
  }

  return (
    <section className="marketplace-section">
      <div className="marketplace-header">
        <span className="badge">TRENDING PETS</span>
        <h2>Find Your Perfect Companion</h2>
        <p>Explore our most popular healthy pets from verified community members.</p>
      </div>

      <div className="pet-grid">
        {trendingPets.map((pet) => (
          <ProductCard key={pet.productId} product={pet} />
        ))}
      </div>

      <div className="view-all-container">
        <button className="view-all-btn">
          Explore All Marketplace <span>→</span>
        </button>
      </div>
    </section>
  );
};

export default Marketplace;
