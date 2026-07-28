import React from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import type { PetProduct } from '@/types/petverse';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: PetProduct[];
  viewAllHref?: string;
}

export const ProductSection: React.FC<ProductSectionProps> = ({ title, subtitle, products, viewAllHref }) => {
  if (products.length === 0) return null;

  return (
    <section className="pv-section">
      <div className="pv-container">
        <div className="pv-section-header">
          <div>
            <h2 className="pv-section-title">{title}</h2>
            {subtitle && <p className="pv-section-subtitle">{subtitle}</p>}
          </div>
          <Link to={viewAllHref ?? PETVERSE_ROUTES.PRODUCTS} className="pv-link">View all →</Link>
        </div>
        <div className="pv-product-grid">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};
