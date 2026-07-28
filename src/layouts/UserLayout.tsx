import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  FiUser, FiPackage, FiMapPin, FiHeart, 
  FiSettings, FiLogOut 
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './SellerLayout.module.css'; // Reusing base layout styles for consistency

/**
 * Standardized Customer Account Layout.
 * Orchestrates the user experience through a dedicated account sidebar and main workspace,
 * leveraging a scoped styling architectural layer for platform consistency.
 */
const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'orders',    icon: <FiPackage />,  label: 'Orders & Tracking', path: ROUTES.USER_PROFILE },
    { id: 'profile',   icon: <FiUser />,     label: 'Account Details',   path: ROUTES.USER_PROFILE + '/edit' },
    { id: 'addresses', icon: <FiMapPin />,   label: 'Saved Addresses',   path: ROUTES.USER_PROFILE + '/addresses' },
    { id: 'wishlist',  icon: <FiHeart />,    label: 'My Wishlist',       path: ROUTES.USER_PROFILE + '/wishlist' },
    { id: 'settings',  icon: <FiSettings />, label: 'Preferences',       path: ROUTES.USER_PROFILE + '/settings' },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className={styles.layout}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.container}>
          
          {/* 1. Account Sidebar (Drawer for mobile) */}
          <div 
            className={`${styles.sidebarOverlay} ${isMobileMenuOpen ? styles.overlayActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className={`${styles.sidebarWrapper} ${isMobileMenuOpen ? styles.wrapperActive : ''}`}>
            <div className={styles.sidebar}>
               <div className={styles.profileSection}>
                  <img src={user?.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} alt="" className={styles.avatar} />
                  <div className={styles.profileInfo}>
                    <h4 className={styles.storeName}>{user?.displayName}</h4>
                    <span className={styles.storeBadge}>Customer Account</span>
                  </div>
               </div>
               
               <nav className={styles.nav}>
                  {menuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${styles.navItem} ${location.pathname === item.path ? styles.navItemActive : ''}`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                  <div className={styles.navDivider} />
                  <button 
                    onClick={async () => { await logout(); navigate(ROUTES.HOME); }}
                    className={`${styles.navItem} ${styles.logout}`}
                  >
                    <FiLogOut /> Logout
                  </button>
               </nav>
            </div>
          </aside>

          {/* 2. Feature Orchestration Outlet */}
          <section className={styles.content}>
             <Outlet context={{ toggleMenu: () => setIsMobileMenuOpen(true) }} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserLayout;
