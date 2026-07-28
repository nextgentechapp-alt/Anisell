import React, { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { ROUTES } from '@/constants/routes';

interface BreedBrowserProps {
  products: Product[];
}

/**
 * Global Breed Exploration Ribbon.
 * Aggregates all available pet categories (Dog, Cat, etc.) from the live Firestore catalog.
 * Refined to show unique taxonomy buckets, allowing customers to dive into specific species.
 */
const BreedBrowser: React.FC<BreedBrowserProps> = ({ products }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -250 : 250,
      behavior: 'smooth',
    });
  };

  // 1. Extract unique species categories (e.g., Dog, Cat) from the available approved inventory
  const speciesList = useMemo(() => {
    const pets = products.filter(p => p.productType === 'Pets');
    const categories = Array.from(new Set(pets.map(p => p.productCategory)));
    
    // Map categories back to their first matching product for the image representation
    return categories.map(cat => {
      const firstProd = pets.find(p => p.productCategory === cat);
      return {
        id: cat,
        name: cat,
        image: firstProd?.productMedia[0] || 'https://via.placeholder.com/60'
      };
    });
  }, [products]);

  const handleCategoryClick = (category: string) => {
    navigate(`${ROUTES.MARKETPLACE}?category=${category}`);
  };

  return (
    <section className="breed-section">
      <button className="arrow left" onClick={() => scroll('left')} aria-label="Previous Breeds">
        <svg viewBox="0 0 24 24"><path d="M15 18L9 12L15 6" /></svg>
      </button>

      <div className="breed-scroll-wrapper">
        <div className="breed-scroll" ref={scrollRef}>
          {speciesList.map((category) => (
            <div 
              key={category.id} 
              className="breed-card" 
              onClick={() => handleCategoryClick(category.name)}
              role="button"
              tabIndex={0}
            >
              <div className="img-box">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  loading="lazy"
                />
              </div>
              <p className="breed-name">{category.name}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="arrow right" onClick={() => scroll('right')} aria-label="Next Breeds">
        <svg viewBox="0 0 24 24"><path d="M9 18L15 12L9 6" /></svg>
      </button>
    </section>
  );
};

export default BreedBrowser;
