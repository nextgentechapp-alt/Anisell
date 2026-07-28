import React, { useMemo } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { FiDollarSign, FiPercent, FiTrendingUp } from 'react-icons/fi';

/**
 * Platform Revenue and Merchant Payment Operations.
 * Isolates analytics into actionable payout routing and global financial tracing.
 */
const AdminPayments: React.FC = () => {
  const { sellers, orders, users, loading } = useSearchData();

  const financialCore = useMemo(() => {
    let globalRevenue = 0;
    let globalCommission = 0;

    const payouts = sellers.map(s => {
      // Aggregate real-time revenue from the active order ledger
      const sellerOrders = orders.filter((o: any) => o.sellerId === s.sellerId && o.status !== 'CANCELLED');
      const gmv = sellerOrders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
      
      globalRevenue += gmv;
      const commission = gmv * 0.15; // 15% platform cut architecture
      globalCommission += commission;

      return {
         ...s,
         gmv,
         commission,
         payout: gmv - commission,
         status: gmv > 0 ? 'Pending' : 'Settled'
      };
    }).sort((a, b) => b.gmv - a.gmv);

    return { globalRevenue, globalCommission, payouts };
  }, [sellers, orders]);

  if (loading) return (
     <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {[...Array(5)].map((_, i) => <SkeletonTableRow key={i} columns={5} />)}
     </div>
  );

  const payoutColumns = [
    { 
      header: 'Economic Entity (Store)', 
      key: 'sellerName',
      render: (s: any) => {
        const user = users.find(u => u.uid === s.sellerId);
        const avatarUrl = user?.photoURL || (s.shopPhotoUrls && s.shopPhotoUrls.length > 0 ? s.shopPhotoUrls[0] : 'https://via.placeholder.com/100?text=PS');
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <img 
                src={avatarUrl} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{s.shopName || 'Merchant'}</div>
          </div>
        );
      }
    },
    { 
      header: 'Gross Merchandise Volume (GMV)', 
      key: 'gmv', 
      render: (s: any) => (
        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '14px' }}>₹{s.gmv.toLocaleString()}</div>
      )
    },
    { 
      header: 'Fee Sync (-15%)', 
      key: 'commission', 
      render: (s: any) => (
        <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '13px' }}>-₹{s.commission.toLocaleString()}</div>
      )
    },
    { 
      header: 'Scheduled Payout', 
      key: 'payout', 
      render: (s: any) => (
        <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '15px' }}>₹{s.payout.toLocaleString()}</div>
      )
    },
    { 
      header: 'Routing State', 
      key: 'status', 
      render: (s: any) => <Badge label={s.status === 'Pending' ? 'Pending Transfer' : 'Audit Cleared'} variant={s.status === 'Pending' ? 'warning' : 'success'} />
    },
    { 
      header: 'Treasury Action', 
      key: 'actions',
      render: (s: any) => (
        <button 
           onClick={() => alert(`Treasury Control: Attempting to release ₹${s.payout.toLocaleString()} to ${s.shopName || 'Merchant'} (Demo)`)}
           disabled={s.gmv === 0}
           style={{ padding: '8px 16px', background: s.gmv === 0 ? '#f1f5f9' : '#10b981', color: s.gmv === 0 ? '#94a3b8' : '#fff', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '12px', cursor: s.gmv === 0 ? 'not-allowed' : 'pointer', letterSpacing: '0.02em' }}
        >
           INITIATE WIRE
        </button>
      )
    }
  ];

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Payments & Revenue Hub</h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Treasury oversight for global platform commissions and merchant payout settlements.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
         <StatCard label="Platform GMV" value={`₹${financialCore.globalRevenue.toLocaleString()}`} icon={<FiTrendingUp size={20}/>} color="#2563eb" variant="primary" />
         <StatCard label="Accrued Commissions" value={`₹${financialCore.globalCommission.toLocaleString()}`} icon={<FiPercent size={20}/>} color="#7c3aed" variant="neutral" />
         <StatCard label="Pending Store Wires" value={`₹${(financialCore.globalRevenue - financialCore.globalCommission).toLocaleString()}`} icon={<FiDollarSign size={20}/>} color="#059669" variant="success" />
      </div>

      <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Active Settlement Book</h3>
           <Badge label="15% Platform Cut Active" variant="primary" />
        </div>
        <Table data={financialCore.payouts} columns={payoutColumns} />
      </div>
    </div>
  );
};

export default AdminPayments;
