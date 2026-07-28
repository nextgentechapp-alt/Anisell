import React from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import type { Product } from '@/types';
import styles from './ListingGrid.module.css';

interface ListingGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  showEmpty?: boolean;
}

/**
 * Public Listing Grid Feature.
 * Orchestrates the marketplace discovery experience by organizing pet listings 
 * into a responsive, SEO-optimized grid using the centralized ProductCard component.
 * Eliminated structural duplication formerly found in Home.tsx and SearchResults.tsx.
 */
export const ListingGrid: React.FC<ListingGridProps> = ({ 
  products, 
  title, 
  subtitle,
  columns = 4,
  showEmpty = true 
}) => {
  const gridClass = styles[`gridCols${columns}`];

  return (
    <div className={styles.container}>
      {/* 1. Portal Meta - Section Headers */}
      {(title || subtitle) && (
        <header className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
      )}

      {/* 2. Operational Hub - Result Rendering */}
      {products.length > 0 ? (
        <div className={`${styles.grid} ${gridClass}`}>
          {products.map(product => (
            <ProductCard 
              key={product.productId} 
              product={product as any} 
              showStatus={false}
            />
          ))}
        </div>
      ) : showEmpty && (
        <div className={styles.emptyState}>
           <p className={styles.emptyMsg}>No listings found matching your parameters.</p>
        </div>
      )}
    </div>
  );
};
