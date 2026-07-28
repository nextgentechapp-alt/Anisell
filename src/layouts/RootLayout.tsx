import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { isAdminSubdomain } from '@/utils/subdomain';

/**
 * Platform Root Layout.
 * Orchestrates the primary public experience with a consistent Navbar and Footer.
 * Conditionally suppresses navigation components for focused entry points like Admin Login.
 */
const RootLayout: React.FC = () => {
  const location = useLocation();
  const isAdm = isAdminSubdomain();
  
  // Only hide nav on login if we are in the administrative context
  const showNav = !(location.pathname === '/login' && isAdm);

  return (
    <div className="platform-root-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       {showNav && <Navbar />}
       <main style={{ flex: 1 }}>
          <Outlet />
       </main>
       {showNav && <Footer />}
    </div>
  );
};

export default RootLayout;
