import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  FiGrid, FiUsers, FiShoppingBag, FiArchive, 
  FiDollarSign, FiPieChart, FiBell, FiBriefcase, FiTag
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { getMainDomainUrl } from '@/utils/subdomain';
import styles from './AdminLayout.module.css';

/**
 * Admin Workspace Layout.
 * Orchestrates the administrative oversight Experience with a consistent 
 * sidebar navigation and governance branding.
 */
const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = React.useState(true);
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/profile';

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    handleResize(); // Initial check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', padding: '40px',
        textAlign: 'center', background: '#f8fafc', color: '#1e293b'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🖥️</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Admin Workspace Restricted</h1>
        <p style={{ marginTop: '16px', color: '#64748b', maxWidth: '400px' }}>
          For security and data integrity, the Platform Governance Hub is exclusive to desktop systems. 
          Please switch to a laptop or workstation to manage the AniSell ecosystem.
        </p>
        <button 
          className="button-base button-primary" 
          style={{ marginTop: '30px' }}
          onClick={() => window.location.href = getMainDomainUrl()}
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const navItems = [
    { path: `${basePath}`, icon: <FiGrid />, label: 'Overview' },
    { path: `${basePath}/users`, icon: <FiUsers />, label: 'User Management' },
    { path: `${basePath}/sellers`, icon: <FiBriefcase />, label: 'Seller Directory' },
    { path: `${basePath}/products`, icon: <FiShoppingBag />, label: 'Product Control' },
    { path: `${basePath}/orders`, icon: <FiArchive />, label: 'Order Tracking' },
    { path: `${basePath}/payments`, icon: <FiDollarSign />, label: 'Payments & Revenue' },
    { path: `${basePath}/analytics`, icon: <FiPieChart />, label: 'Platform Analytics' },
    { path: `${basePath}/coupons`, icon: <FiTag />, label: 'Coupons & Delivery' },
    { path: `${basePath}/settings`, icon: <FiBell />, label: 'Alerts & Settings' },
  ];

  return (
    <div className={styles.layout}>
      {/* 1. Governance Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>A</div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>AniSell</span>
            <span className={styles.brandRole}>Governance Hub</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${(location.pathname === item.path || (item.path !== '/profile' && location.pathname.startsWith(item.path))) ? styles.navItemActive : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <footer className={styles.sidebarFooter}>
           <div className={styles.adminProfile}>
             <img src={user?.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} alt="" className={styles.avatar} />
             <div className={styles.profileInfo}>
                <div className={styles.profileName}>{user?.displayName || 'Admin User'}</div>
                <div className={styles.profileRole}>Super Administrator</div>
             </div>
           </div>
        </footer>
      </aside>

      {/* 2. Main Workspace Outlet */}
      <main className={styles.main}>
        <header className={styles.topBar}>
           <div className={styles.searchBar}>
             <input type="text" placeholder="Search platform identities..." className={styles.searchInput} />
           </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
