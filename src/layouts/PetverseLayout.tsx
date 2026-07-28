import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePetverseCart } from '@/context/PetverseCartContext';
import { usePetverseWishlist } from '@/context/PetverseWishlistContext';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import SmartSearch from '@/features/petverse/enhancements/SmartSearch';
import DarkModeToggle from '@/features/petverse/enhancements/DarkModeToggle';
import NotificationPanel from '@/features/petverse/enhancements/NotificationPanel';
import ChatSupport from '@/features/petverse/enhancements/ChatSupport';
import '@/features/petverse/petverse.css';

const PetverseLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalQuantity } = usePetverseCart();
  const { items: wishlistItems } = usePetverseWishlist();

  const handleSearchSubmit = (term: string) => {
    navigate(`${PETVERSE_ROUTES.PRODUCTS}?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="pv-page">
      <header className="pv-topbar">
        <div className="pv-topbar-inner">
          <Link to={PETVERSE_ROUTES.HOME} className="pv-brand">
            <span className="pv-brand-badge">🐾</span> AniSell Store
          </Link>

          <div className="pv-search" style={{ display: 'flex', alignItems: 'center' }}>
            <SmartSearch onSearch={handleSearchSubmit} />
          </div>

          <div className="pv-topbar-actions">
            <Link to={PETVERSE_ROUTES.ENHANCEMENTS} className="pv-icon-link" title="New Features">
              <span style={{ fontSize: 18 }}>✨</span>
              Features
            </Link>

            <Link to={PETVERSE_ROUTES.WISHLIST} className="pv-icon-link">
              <span style={{ fontSize: 18 }}>♡</span>
              Wishlist
              {wishlistItems.length > 0 && <span className="pv-badge">{wishlistItems.length}</span>}
            </Link>

            <Link to={PETVERSE_ROUTES.CART} className="pv-icon-link">
              <span style={{ fontSize: 18 }}>🛒</span>
              Cart
              {totalQuantity > 0 && <span className="pv-badge">{totalQuantity}</span>}
            </Link>

            <Link to={user ? PETVERSE_ROUTES.ORDERS : '/login'} className="pv-icon-link">
              <span style={{ fontSize: 18 }}>📦</span>
              Orders
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <NotificationPanel />
            </div>

            <DarkModeToggle />

            <Link to="/" className="pv-back-link">← Back to AniSell</Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
        🐾 AniSell Store — a dedicated pet-products marketplace inside AniSell. Independent cart, wishlist, orders & seller ecosystem.
      </footer>

      <ChatSupport />
    </div>
  );
};

export default PetverseLayout;
