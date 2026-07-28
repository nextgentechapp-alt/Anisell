import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchData } from '@/hooks/useSearchData';
import { SkeletonProfile } from '@/components/ui/Skeleton';
import { UserOrders } from '@/features/user/UserOrders';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { FiPackage, FiSearch, FiMenu } from 'react-icons/fi';
import styles from './Profile.module.css';

/**
 * User Profile Dashboard Content.
 * Orchestrates the customer-facing history view, leveraging the UserOrders 
 * feature to isolate purchase activity and fulfillment tracking.
 * Fixed to read orders from buyerData (buyers collection) rather than user document.
 */
const Profile: React.FC = () => {
  const { toggleMenu } = useOutletContext<{ toggleMenu: () => void }>();
  const { buyerData } = useAuth();
  const { products, loading: dataLoading } = useSearchData();
  const navigate = useNavigate();

  // Orders live in the buyers collection, not the users collection
  const orders = buyerData?.orders || [];

  if (dataLoading) return (
     <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
       <SkeletonProfile />
     </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>History Central</h2>
          <button 
             className={styles.mobileMenuTrigger} 
             onClick={toggleMenu}
             style={{ display: 'none', background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
          >
             <FiMenu size={24} color="#1e293b" />
          </button>
        </div>
        <p>Track your previous pet acquisitions and active marketplace activity.</p>
      </header>

      {/* 1. Fulfillment Discovery - Unified UserOrders Feature */}
      <UserOrders 
        orders={orders as any} 
        products={products as any} 
        onTrack={(id) => navigate(`/profile/order/${id}`)}
      />

      {/* 2. Secondary Discovery - Empty State Helper */}
      {orders.length === 0 && (
        <div className={styles.emptyState}>
           <FiPackage size={48} color="#cbd5e1" />
           <h3>Purchase History Clear</h3>
           <p>It looks like you haven't brought a pet home yet!</p>
           <button 
             onClick={() => navigate(ROUTES.MARKETPLACE)}
             className={styles.browseBtn}
           >
             <FiSearch /> Browse Marketplace
           </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
