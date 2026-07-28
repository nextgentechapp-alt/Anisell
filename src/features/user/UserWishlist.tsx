import { useOutletContext, useNavigate } from 'react-router-dom';
import { FiHeart, FiSearch, FiMenu } from 'react-icons/fi';
import { ROUTES } from '@/constants/routes';

/**
 * User Wishlist Dashboard.
 * Isolates the saved item catalog logic.
 */
const UserWishlist: React.FC = () => {
  const { toggleMenu } = useOutletContext<{ toggleMenu: () => void }>();
  const navigate = useNavigate();

  return (
    <div className="user-profile-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>My Wishlist</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Keep track of your favorite pets and items for future acquisition.</p>
        </div>
        <button 
          className="mobileMenuTrigger" 
          onClick={toggleMenu}
          style={{ display: 'none', background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
        >
           <FiMenu size={24} color="#1e293b" />
        </button>
      </header>

      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
         <FiHeart size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
         <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Your Wishlist is Empty</h3>
         <p style={{ color: '#64748b', marginBottom: '24px' }}>You haven't saved any listings to your wishlist yet.</p>
         <button 
           onClick={() => navigate(ROUTES.MARKETPLACE)}
           style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
         >
           <FiSearch /> Discover Pets
         </button>
      </div>
    </div>
  );
};

export default UserWishlist;
