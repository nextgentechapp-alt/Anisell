import { useOutletContext } from 'react-router-dom';
import { FiCreditCard, FiBell, FiShield, FiMenu } from 'react-icons/fi';

/**
 * Merchant Operations Settings.
 * Central registry for payment payouts, business notification rules, and structural security.
 */
const SellerSettings: React.FC = () => {
  const { toggleMenu } = useOutletContext<{ toggleMenu: () => void }>();

  return (
    <div className="seller-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Merchant Settings</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Configure bank routing, notification frequency, and store privacy parameters.</p>
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
           <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '50%', color: '#d97706' }}><FiCreditCard size={24} /></div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Payout Routing (Bank Accounts)</h4>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>Define bank details to receive accumulated marketplace earnings from verified transactions.</p>
              <button className="button-base button-outline" style={{ fontSize: '13px' }}>Configure Bank Sync</button>
           </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
           <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '50%', color: '#2563eb' }}><FiBell size={24} /></div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Merchant Notification Rules</h4>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>Manage how your store receives alerts about incoming orders, inquiries, and platform news.</p>
              <button className="button-base button-outline" style={{ fontSize: '13px' }}>Optimize Alerts</button>
           </div>
        </div>
        
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
           <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '50%', color: '#10b981' }}><FiShield size={24} /></div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Account Security Protocols</h4>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>Strengthen your storefront defense with 2FA, session tracking, and password rotations.</p>
              <button className="button-base button-outline" style={{ fontSize: '13px' }}>Enhance Security</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;
