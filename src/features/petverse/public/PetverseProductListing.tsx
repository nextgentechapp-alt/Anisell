import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PetProductService } from '@/services/api/petverse/PetProductService';
import { PETVERSE_CATEGORIES } from '@/data/petverseCatalog';
import { ProductCard } from '@/features/petverse/components/ProductCard';
import type { PetProduct, PetVerseCategorySlug } from '@/types/petverse';
import '@/features/petverse/petverse.css';

const PetverseProductListing: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug?: PetVerseCategorySlug }>();
  const [searchParams] = useSearchParams();
  const queryTerm = searchParams.get('q') ?? '';

  const [allProducts, setAllProducts] = useState<PetProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [ratingMin, setRatingMin] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('relevance');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const data = queryTerm
        ? await PetProductService.searchProducts(queryTerm)
        : categorySlug
        ? await PetProductService.getProductsByCategory(categorySlug)
        : await PetProductService.getAllProducts();
      if (!cancelled) {
        setAllProducts(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categorySlug, queryTerm]);

  const availableBrands = useMemo(() => Array.from(new Set(allProducts.map((p) => p.brand))).sort(), [allProducts]);
  const availableAnimals = useMemo(() => Array.from(new Set(allProducts.map((p) => p.animalType))).sort(), [allProducts]);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    const min = priceMin ? Number(priceMin) : undefined;
    const max = priceMax ? Number(priceMax) : undefined;

    if (min !== undefined) list = list.filter((p) => p.price >= min);
    if (max !== undefined) list = list.filter((p) => p.price <= max);
    if (selectedBrands.length) list = list.filter((p) => selectedBrands.includes(p.brand));
    if (selectedAnimals.length) list = list.filter((p) => selectedAnimals.includes(p.animalType));
    if (ratingMin > 0) list = list.filter((p) => p.rating >= ratingMin);
    if (inStockOnly) list = list.filter((p) => p.stock > 0);

    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
        break;
      default:
        break;
    }
    return list;
  }, [allProducts, priceMin, priceMax, selectedBrands, selectedAnimals, ratingMin, inStockOnly, sortBy]);

  const categoryMeta = categorySlug ? PETVERSE_CATEGORIES.find((c) => c.slug === categorySlug) : undefined;

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
  };
  const toggleAnimal = (animal: string) => {
    setSelectedAnimals((prev) => (prev.includes(animal) ? prev.filter((a) => a !== animal) : [...prev, animal]));
  };

  return (
    <div className="pv-container pv-section">
      <div className="pv-section-header">
        <div>
          <h1 className="pv-section-title">
            {queryTerm ? `Results for "${queryTerm}"` : categoryMeta ? `${categoryMeta.icon} ${categoryMeta.name}` : 'All Products'}
          </h1>
          <p className="pv-section-subtitle">{loading ? 'Loading…' : `${filtered.length} products`}</p>
        </div>
      </div>

      <div className="pv-shop-layout">
        <aside className="pv-filters">
          <div className="pv-filter-group">
            <h4>Price</h4>
            <div className="pv-price-inputs">
              <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
              <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
            </div>
          </div>

          <div className="pv-filter-group">
            <h4>Brand</h4>
            {availableBrands.map((brand) => (
              <label key={brand} className="pv-filter-row">
                <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
                {brand}
              </label>
            ))}
          </div>

          <div className="pv-filter-group">
            <h4>Animal Type</h4>
            {availableAnimals.map((animal) => (
              <label key={animal} className="pv-filter-row">
                <input type="checkbox" checked={selectedAnimals.includes(animal)} onChange={() => toggleAnimal(animal)} />
                {animal}
              </label>
            ))}
          </div>

          <div className="pv-filter-group">
            <h4>Ratings</h4>
            {[4, 3, 2].map((r) => (
              <label key={r} className="pv-filter-row">
                <input type="radio" name="rating" checked={ratingMin === r} onChange={() => setRatingMin(r)} />
                {r}★ & above
              </label>
            ))}
            <label className="pv-filter-row">
              <input type="radio" name="rating" checked={ratingMin === 0} onChange={() => setRatingMin(0)} />
              All ratings
            </label>
          </div>

          <div className="pv-filter-group">
            <h4>Availability</h4>
            <label className="pv-filter-row">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
              In stock only
            </label>
          </div>
        </aside>

        <div>
          <div className="pv-toolbar">
            <span className="pv-result-count">{filtered.length} results</span>
            <select className="pv-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
              <option value="relevance">Sort: Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {loading ? (
            <div className="pv-loading">Loading products…</div>
          ) : filtered.length === 0 ? (
            <div className="pv-empty-state">
              <div className="pv-empty-icon">🐾</div>
              <p>No products match your filters. Try adjusting them.</p>
            </div>
          ) : (
            <div className="pv-product-grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetverseProductListing;
