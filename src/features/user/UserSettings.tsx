import { useOutletContext } from 'react-router-dom';
import { FiBell, FiShield, FiSmartphone, FiMenu } from 'react-icons/fi';

/**
 * User Preferences & Integrity Dashboard.
 * Orchestrates settings like notifications and privacy parameters.
 */
const UserSettings: React.FC = () => {
  const { toggleMenu } = useOutletContext<{ toggleMenu: () => void }>();

  return (
    <div className="user-profile-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Account Preferences</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Configure marketplace notifications, security, and global visibility.</p>
        </div>
        <button 
          className="mobileMenuTrigger" 
          onClick={toggleMenu}
          style={{ display: 'none', background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
        >
           <FiMenu size={24} color="#1e293b" />
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
           <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '50%', color: '#2563eb' }}><FiBell size={24} /></div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Notification Center</h4>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>Manage how you receive alerts about orders, messages, and marketplace updates.</p>
              <button className="button-base button-outline" style={{ fontSize: '13px' }}>Configure Alerts</button>
           </div>
        </div>
        
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
           <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '50%', color: '#10b981' }}><FiShield size={24} /></div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Security & Trust</h4>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>Update your authentication methods and review recent session activity.</p>
              <button className="button-base button-outline" style={{ fontSize: '13px' }}>Review Security</button>
           </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
           <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '50%', color: '#8b5cf6' }}><FiSmartphone size={24} /></div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Active Sessions</h4>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>Terminate unrecognized connections across your associated marketplace devices.</p>
              <button className="button-base button-outline" style={{ fontSize: '13px' }}>Manage Devices</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
