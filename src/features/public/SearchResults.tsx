import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchData } from '@/hooks/useSearchData';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ListingGrid } from '@/features/public/ListingGrid';
import FilterSidebar from '@/components/search/FilterSidebar';
import { FiFilter } from 'react-icons/fi';
import './SearchResults.css';

/**
 * Search Results Page.
 * Orchestrates the pet marketplace search experience, featuring a responsive 
 * filter sidebar and dynamic product grid synchronized with Firestore.
 * Refactored to eliminate duplicate listing JSX by leveraging the Public ListingGrid feature.
 */
const SearchResults: React.FC = () => {
  const { approvedProducts, loading } = useSearchData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Discovery Filter Orchestration
  const filteredProducts = useMemo(() => {
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category');
    const species = searchParams.get('species')?.split(',') || [];
    const minPrice = Number(searchParams.get('min')) || 0;
    const maxPrice = Number(searchParams.get('max')) || Infinity;
    const isVaccinated = searchParams.get('vaccinated') === 'true';

    return approvedProducts.filter(p => {
      const matchSearch = !query ||
        p.productCategory.toLowerCase().includes(query) ||
        p.productSubCategory.toLowerCase().includes(query) ||
        p.productDescription?.toLowerCase().includes(query);

      const matchCategory = !category || category === 'All' || p.productType === category;
      const matchSpecies = species.length === 0 || species.includes(p.productCategory);
      const matchPrice = p.productPrice >= minPrice && (maxPrice === 0 || p.productPrice <= maxPrice);
      const matchVaccinated = !isVaccinated || p.productVaccinated;

      return matchSearch && matchCategory && matchSpecies && matchPrice && matchVaccinated;
    });
  }, [approvedProducts, searchParams]);

  const updateFilters = (key: string, value: any) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else {
      params.set(key, value as string);
    }
    setSearchParams(params);
  };

  if (loading) return (
     <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
           {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
     </div>
  );

  return (
    <div className="search-page-container">
      {/* Mobile Filter Control */}
      <div className="mobile-filter-bar">
        <button className="mobile-filter-btn" onClick={() => setIsSidebarOpen(true)}>
          <FiFilter /> Filters & Sort
        </button>
        <span className="results-count-mobile">{filteredProducts.length} Listings</span>
      </div>

      {/* Structured Discovery Tools */}
      <FilterSidebar
        resultsCount={filteredProducts.length}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onFilter={updateFilters}
        currentFilters={{
          category: searchParams.get('category') || 'All',
          species: searchParams.get('species')?.split(',') || [],
          min: searchParams.get('min') || '',
          max: searchParams.get('max') || '',
          vaccinated: searchParams.get('vaccinated') === 'true'
        }}
      />

      {/* Dynamic Results Grid - Unified Grid Feature */}
      <main className="search-results-main">
        <ListingGrid
          products={filteredProducts as any}
          columns={3}
          showEmpty={true}
        />
      </main>
    </div>
  );
};

export default SearchResults;
