import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PETVERSE_PRODUCTS } from '@/data/petverseCatalog';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import styles from './SmartSearch.module.css';

const RECENT_KEY = 'pv_recent_searches';

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function saveRecent(term: string) {
  const recent = getRecent().filter((r) => r !== term);
  recent.unshift(term);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8)));
}

interface SmartSearchProps {
  onSearch?: (term: string) => void;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>(getRecent());
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = query.trim().length > 0
    ? PETVERSE_PRODUCTS.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.categorySlug.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const popular = ['Royal Canin Dog Food', 'Cat Toy', 'Bird Cage', 'Fish Tank', 'Dog Leash'];

  const dropdownItems = focused && query.trim().length === 0
    ? recent.length > 0 ? [] : popular
    : suggestions;

  const handleSelect = useCallback((term: string) => {
    setQuery(term);
    saveRecent(term);
    setRecent(getRecent());
    setFocused(false);
    setSelectedIdx(-1);
    if (onSearch) {
      onSearch(term);
    } else {
      navigate(`${PETVERSE_ROUTES.PRODUCTS}?q=${encodeURIComponent(term)}`);
    }
  }, [onSearch, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = dropdownItems;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIdx >= 0 && items[selectedIdx]) {
      e.preventDefault();
      const item = items[selectedIdx];
      handleSelect(typeof item === 'string' ? item : item.title);
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showDropdown = focused && (dropdownItems.length > 0 || (query.trim().length === 0 && recent.length > 0));

  return (
    <div className={styles.wrapper} ref={ref}>
      <div className={styles.inputWrap}>
        <span className={styles.icon}>🔍</span>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder="Search food, toys, accessories..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedIdx(-1); }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button className={styles.clearBtn} type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>✕</button>
        )}
      </div>
      {showDropdown && (
        <div className={styles.dropdown}>
          {query.trim().length === 0 && recent.length > 0 && (
            <>
              <div className={styles.dropdownHeader}>Recent Searches</div>
              {recent.map((term, i) => (
                <button key={term} className={`${styles.dropdownItem} ${i === selectedIdx ? styles.active : ''}`} type="button" onClick={() => handleSelect(term)}>
                  <span className={styles.recentIcon}>🕐</span> {term}
                </button>
              ))}
            </>
          )}
          {query.trim().length === 0 && recent.length === 0 && (
            <>
              <div className={styles.dropdownHeader}>Popular Searches</div>
              {popular.map((term, i) => (
                <button key={term} className={`${styles.dropdownItem} ${i === selectedIdx ? styles.active : ''}`} type="button" onClick={() => handleSelect(term)}>
                  <span className={styles.recentIcon}>🔥</span> {term}
                </button>
              ))}
            </>
          )}
          {suggestions.map((p, i) => (
            <button key={p.id} className={`${styles.dropdownItem} ${i === selectedIdx ? styles.active : ''}`} type="button" onClick={() => handleSelect(p.title)}>
              <img src={p.images[0]} alt="" className={styles.suggestionImg} />
              <div className={styles.suggestionInfo}>
                <span className={styles.suggestionTitle}>{p.title}</span>
                <span className={styles.suggestionMeta}>{p.categorySlug} · ₹{p.price}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
