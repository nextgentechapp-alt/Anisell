import { FiBell, FiAlertCircle, FiMessageCircle, FiLogOut } from 'react-icons/fi';
import { AuthService } from '@/services/api/AuthService';
import { useNavigate } from 'react-router-dom';

/**
 * System Settings & Alerts Configuration Hub.
 */
const AdminSettings: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Terminate administrative session and protect the registry?')) {
      await AuthService.logout();
      navigate('/login');
    }
  };

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Alerts & Administration Sync</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Manage high-priority system pings and core architectural settings.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
           <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '50%', color: '#dc2626' }}><FiAlertCircle size={24} /></div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Global Governance Flags</h4>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>The platform requires manual intervention on 12 blocked storefront records. Verify KYC pipelines to release merchant endpoints.</p>
              <button className="button-base button-outline" style={{ fontSize: '13px' }}>Resolve Compliance Action</button>
           </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
           <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '50%', color: '#d97706' }}><FiBell size={24} /></div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Notification Distribution Matrix</h4>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>Define rules for how critical transaction state changes notify global administrators.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                 <button className="button-base" style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>Configure Delivery</button>
                 <button className="button-base button-outline" style={{ fontSize: '13px' }}>Silence Alerts</button>
              </div>
           </div>
        </div>
        
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
           <div style={{ padding: '12px', background: '#dbeafe', borderRadius: '50%', color: '#2563eb' }}><FiMessageCircle size={24} /></div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Active Merchant Queries (Inquiry Hub Engine)</h4>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>Unresolved help tickets from primary merchants regarding commission deductions and payout schedules.</p>
              <button className="button-base button-primary" style={{ fontSize: '13px' }}>Open Service Portal</button>
           </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '20px', borderTop: '4px solid #ef4444' }}>
           <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '50%', color: '#ef4444' }}><FiLogOut size={24} /></div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>System Exit & Session Security</h4>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>Safely terminate your current administrative session to protect the primary architectural registry.</p>
              <button onClick={handleLogout} className="button-base" style={{ padding: '10px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                Logout Profile
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
