import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import '@/features/petverse/petverse.css';

/**
 * Non-destructive addition to AniSell's Home page — a Flipkart-style
 * segmented switcher between "AniSell Shopping" (existing marketplace)
 * and "AniSell Store" (new pet-products marketplace). Purely additive:
 * it renders above the existing Home content and does not alter it.
 */
export const MarketplaceSwitcher: React.FC = () => {
  const location = useLocation();
  const onPetverse = location.pathname.startsWith(PETVERSE_ROUTES.HOME);

  return (
    <div className="pv-switcher">
      <div className="pv-switcher-inner">
        <Link to="/" className={`pv-switcher-tab ${!onPetverse ? 'active' : ''}`}>
          🛍️ AniSell Shopping
        </Link>
        <Link to={PETVERSE_ROUTES.HOME} className={`pv-switcher-tab ${onPetverse ? 'active' : ''}`}>
          🐾 AniSell Store
        </Link>
      </div>
    </div>
  );
};
