import { useAuth } from '@/context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { FiMapPin, FiPlus, FiMenu } from 'react-icons/fi';

/**
 * Saved Addresses Management Hub.
 * Isolates the logistics and delivery location tracking logic from the main profile.
 */
const UserAddresses: React.FC = () => {
  const { toggleMenu } = useOutletContext<{ toggleMenu: () => void }>();
  const { buyerData } = useAuth();
  const addresses = buyerData?.addresses || [];

  return (
    <div className="user-profile-content">
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
           <div>
             <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Saved Addresses</h2>
             <p style={{ color: '#64748b', fontSize: '15px' }}>Manage your delivery locations for faster checkout experiences.</p>
           </div>
           <button 
             className="mobileMenuTrigger" 
             onClick={toggleMenu}
             style={{ display: 'none', background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
           >
              <FiMenu size={24} color="#1e293b" />
           </button>
        </div>
        <button className="button-base button-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiPlus /> Add New Location
        </button>
      </header>

      {addresses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
           <FiMapPin size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
           <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No Saved Locations</h3>
           <p style={{ color: '#64748b' }}>You haven't added any delivery addresses yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' }}>
          {addresses.map((addr, idx) => (
            <div key={idx} style={{ padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{addr.name}</h4>
                  {addr.type && <span style={{ fontSize: '11px', padding: '4px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>{addr.type}</span>}
                </div>
                <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '14px' }}>{addr.addressLine}, {addr.locality}</p>
                <p style={{ color: '#64748b', margin: '0 0 12px 0', fontSize: '14px' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                <p style={{ color: '#475569', margin: 0, fontSize: '14px', fontWeight: 600 }}>Phone: {addr.phone}</p>
              </div>
              <div>
                <button className="button-base" style={{ color: '#2563eb', background: 'transparent', padding: '8px', fontSize: '14px', fontWeight: 600 }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAddresses;
