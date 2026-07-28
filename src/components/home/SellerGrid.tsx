import React, { useMemo } from 'react';
import type { Product } from '@/types';

// --- Interface ---
interface TopSellingPetsProps {
  products: Product[];
}

interface CategoryData {
  category: string;
  topProduct: Product;
  totalSales: number;
}

const TopSellingPets: React.FC<TopSellingPetsProps> = ({ products }) => {
  // Get top 4 categories with their best-selling products
  const topCategories = useMemo(() => {
    // Group products by category and find the best-selling product in each
    const categoryMap = new Map<string, Product>();
    
    products
      .filter((product) => (product.newSalesCount || 0) > 0) // Only pets with sales
      .forEach((product) => {
        const category = product.productType;
        const existing = categoryMap.get(category);
        
        // If no product exists for this category or current product has more sales
        if (!existing || (product.newSalesCount || 0) > (existing.newSalesCount || 0)) {
          categoryMap.set(category, product);
        }
      });
    
    // Convert to array and sort by total sales in category
    const categories: CategoryData[] = Array.from(categoryMap.entries()).map(([category, product]) => ({
      category,
      topProduct: product,
      totalSales: products
        .filter(p => p.productType === category)
        .reduce((sum, p) => sum + (p.newSalesCount || 0), 0)
    }));
    
    // Sort by total sales and take top 4
    return categories
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 4);
  }, [products]);

  if (topCategories.length === 0) return null;

  return (
    <section className="sellers-section">
      <div className="sellers-header">
        <span className="badge">TOP CATEGORIES</span>
        <h2>Popular Pet Categories</h2>
        <p>Best-selling subcategories from the top 4 most popular pet categories.</p>
      </div>

      <div className="sellers-grid-minimal">
        {topCategories.map(({ category, topProduct }) => (
          <div 
            key={category} 
            className="seller-card-minimal"
          >
            <div className="seller-avatar-minimal">
              <img 
                src={topProduct.productMedia[0]} 
                alt={topProduct.productSubCategory} 
                className="avatar-img"
              />
            </div>
            
            <h3 className="seller-name-minimal">
              {topProduct.productSubCategory}
            </h3>
            
            <p className="seller-location-minimal">{category}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopSellingPets;
