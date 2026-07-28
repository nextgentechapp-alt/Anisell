import React from 'react';
import { FiX } from 'react-icons/fi';

interface FilterSidebarProps {
  resultsCount: number;
  isOpen: boolean;
  onClose: () => void;
  onFilter: (key: string, value: any) => void;
  currentFilters: {
    category: string;
    species: string[];
    min: string;
    max: string;
    vaccinated: boolean;
  };
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  resultsCount, 
  isOpen, 
  onClose,
  onFilter,
  currentFilters
}) => {
  const handleSpeciesChange = (species: string) => {
    const newSpecies = currentFilters.species.includes(species)
      ? currentFilters.species.filter(s => s !== species)
      : [...currentFilters.species, species];
    onFilter('species', newSpecies.join(','));
  };

  return (
    <>
      <div 
        className={`filter-sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />
      <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <header className="sidebar-header">
          <div className="sidebar-title-row">
            <span>Filters</span>
            <button className="sidebar-close-btn" onClick={onClose}>
              <FiX />
            </button>
            <span className="sidebar-results-count">{resultsCount} Listings</span>
          </div>
        </header>

      {/* Structured Discovery Tools */}
      <div className="filter-group">
        <h3>Product Category</h3>
        <div className="filter-options">
          {['All', 'Pets', 'Accessories'].map(cat => (
            <label key={cat} className="filter-option">
              <input 
                type="radio" 
                name="category" 
                checked={currentFilters.category === cat}
                onChange={() => onFilter('category', cat)}
              />
              <span className="radio-custom"></span>
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>Species</h3>
        <div className="filter-options">
          {['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'].map(type => (
            <label key={type} className="filter-option">
              <input 
                type="checkbox" 
                checked={currentFilters.species.includes(type)}
                onChange={() => handleSpeciesChange(type)}
              />
              <span className="checkbox-custom"></span>
              <span>{type}s</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>Price Range</h3>
        <div className="price-inputs">
          <div className="price-input-wrapper">
             <span>₹</span>
             <input 
               type="number" 
               placeholder="Min" 
               className="price-input" 
               value={currentFilters.min}
               onChange={(e) => onFilter('min', e.target.value)}
             />
          </div>
          <div className="price-input-wrapper">
             <span>₹</span>
             <input 
               type="number" 
               placeholder="Max" 
               className="price-input" 
               value={currentFilters.max}
               onChange={(e) => onFilter('max', e.target.value)}
             />
          </div>
        </div>
      </div>

      <div className="filter-group">
        <h3>Vaccination</h3>
        <div className="filter-options">
          <label className="filter-option">
            <input 
              type="checkbox" 
              checked={currentFilters.vaccinated}
              onChange={(e) => onFilter('vaccinated', e.target.checked ? 'true' : 'false')}
            />
            <span className="checkbox-custom"></span>
            <span>Vaccinated Only</span>
          </label>
        </div>
      </div>

      <button 
        className="button-base button-outline" 
        style={{ width: '100%', marginTop: '20px' }}
        onClick={() => {
           // Clear all filters but keep search query if any
           onFilter('category', '');
           onFilter('species', '');
           onFilter('min', '');
           onFilter('max', '');
           onFilter('vaccinated', '');
        }}
      >
        Reset All Discovery Tools
      </button>

      </aside>
    </>
  );
};

export default FilterSidebar;
