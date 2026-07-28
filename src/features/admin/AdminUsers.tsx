import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchData } from '@/hooks/useSearchData';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FiX } from 'react-icons/fi';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { User } from '@/types';

/**
 * Platform User Administration Hub.
 * Manages global identity governance, account suspension, and detailed registry view.
 */
const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { users, buyers, sellers, loading } = useSearchData();
  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (loading) return (
     <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {[...Array(10)].map((_, i) => <SkeletonTableRow key={i} columns={4} />)}
     </div>
  );

  const filteredUsers = users.filter(user => 
    roleFilter === 'all' || user.role === roleFilter
  );

  const handleStatusChange = async (uid: string, action: 'activate' | 'suspend') => {
    if (!window.confirm(`Are you certain you want to ${action} this identity?`)) return;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { status: action === 'suspend' ? 'suspended' : 'active' });
      if (selectedUser && selectedUser.uid === uid) {
        setSelectedUser({ ...selectedUser, status: action === 'suspend' ? 'suspended' : 'active' });
      }
    } catch (error) {
      console.error(`Error updating user status to ${action}:`, error);
      alert(`Failed to ${action} user. Check database permissions.`);
    }
  };

  const userColumns = [
    { 
      header: 'Identity / Contact', 
      key: 'displayName',
      render: (u: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <img 
             src={u.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} 
             alt="" 
             style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
           />
           <div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.displayName || 'Marketplace User'}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{u.email}</div>
           </div>
        </div>
      )
    },
    { 
      header: 'Assigned Role', 
      key: 'role', 
      render: (u: User) => (
        <Badge 
          label={u.role === 'admin' ? 'Administrator' : u.role === 'seller' ? 'Verified Merchant' : 'Customer'} 
          variant={u.role === 'admin' ? 'primary' : u.role === 'seller' ? 'success' : 'neutral'} 
        />
      )
    },
    { 
      header: 'Account Status', 
      key: 'status', 
      render: (u: User) => (
        <Badge 
          label={u.status === 'suspended' ? 'Suspended' : 'Active'} 
          variant={u.status === 'suspended' ? 'error' : 'success'} 
        />
      )
    },
    {
      header: 'State',
      key: 'state',
      render: (u: User) => {
        if (u.role === 'seller') {
          const seller = sellers.find(s => s.sellerId === u.uid);
          if (!seller || !seller.sellerLocation) return <span style={{ color: '#94a3b8', fontSize: '13px' }}>N/A</span>;
          const parts = seller.sellerLocation.split(',').map(s => s.trim());
          if (parts.length >= 2) {
            const last = parts[parts.length - 1];
            if (/^\d+$/.test(last)) {
              return <span style={{ fontWeight: 600, color: '#475569', fontSize: '13px' }}>{parts[parts.length - 2] || 'N/A'}</span>;
            }
            return <span style={{ fontWeight: 600, color: '#475569', fontSize: '13px' }}>{last}</span>;
          }
          return <span style={{ fontWeight: 600, color: '#475569', fontSize: '13px' }}>{seller.sellerLocation}</span>;
        } else if (u.role === 'buyer') {
          const buyer = buyers.find(b => b.buyerId === u.uid);
          const state = buyer?.addresses?.[0]?.state;
          return state ? (
            <span style={{ fontWeight: 600, color: '#475569', fontSize: '13px' }}>{state}</span>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>N/A</span>
          );
        }
        return <span style={{ color: '#94a3b8', fontSize: '13px' }}>N/A</span>;
      }
    },
    { 
      header: 'Joined Date', 
      key: 'joinDate', 
      render: (u: User) => (
        <span style={{ color: '#64748b', fontSize: '13px' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}</span>
      )
    }
  ];

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Identity Control</h1>
           <p style={{ color: '#64748b', fontSize: '15px' }}>Govern user roles, track platform adoption, and manage ecosystem security.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <select 
             value={roleFilter} 
             onChange={(e) => setRoleFilter(e.target.value as any)}
             style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600 }}
           >
             <option value="all">Every Identity</option>
             <option value="buyer">Customers Only</option>
             <option value="seller">Merchants Only</option>
             <option value="admin">Administrators Only</option>
           </select>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table data={filteredUsers} columns={userColumns} onRowClick={(u) => setSelectedUser(u)} />
      </div>

      {selectedUser && (() => {
        const matchingBuyer = buyers.find(b => b.buyerId === selectedUser.uid);
        const matchingSeller = sellers.find(s => s.sellerId === selectedUser.uid);
        
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
             <div style={{ background: '#fff', width: '100%', maxWidth: '520px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={() => setSelectedUser(null)}
                  style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                >
                  <FiX size={20} color="#64748b" />
                </button>
                
                <div style={{ padding: '60px 40px 40px', textAlign: 'center' }}>
                   <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 28px' }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 800, color: '#fff', border: '4px solid #fff', boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.2)' }}>
                         {selectedUser.photoURL ? (
                            <img src={selectedUser.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                         ) : (
                            selectedUser.displayName?.[0] || 'U'
                         )}
                      </div>
                      <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '30px', height: '30px', background: selectedUser.status === 'suspended' ? '#ef4444' : '#10b981', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                   </div>

                   <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>{selectedUser.displayName}</h2>
                   <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '40px', fontWeight: 500 }}>{selectedUser.email}</p>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#f1f5f9', borderRadius: '24px', padding: '2px', marginBottom: '32px', overflow: 'hidden' }}>
                      <div style={{ background: '#fff', padding: '20px', textAlign: 'center' }}>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, marginBottom: '10px' }}>Role Profile</h4>
                         <Badge label={selectedUser.role.toUpperCase()} variant={selectedUser.role === 'admin' ? 'primary' : 'neutral'} />
                      </div>
                      <div style={{ background: '#fff', padding: '20px', textAlign: 'center' }}>
                         <h4 style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, marginBottom: '10px' }}>Current State</h4>
                         <Badge label={selectedUser.status === 'suspended' ? 'Suspended' : 'Verified Active'} variant={selectedUser.status === 'suspended' ? 'error' : 'success'} />
                      </div>
                   </div>

                   <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', marginBottom: '40px', textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                         <h4 style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '6px' }}>Onboarding Date</h4>
                         <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Alpha Cohort'}
                         </div>
                      </div>
                      <div>
                         <h4 style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '6px' }}>Network Identity</h4>
                         <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                            {selectedUser.uid.substring(0, 12).toUpperCase()}...
                         </div>
                      </div>
                      <div>
                         <h4 style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '6px' }}>Primary Contact</h4>
                         <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                            {matchingBuyer?.phone || matchingSeller?.sellerNumber || 'Private Line'}
                         </div>
                      </div>
                      <div>
                         <h4 style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '6px' }}>{selectedUser.role === 'seller' ? 'Shop Branding' : 'Logistics State'}</h4>
                         <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                            {matchingSeller?.shopName || (matchingBuyer?.orders?.length || 0) + ' Order Cycles'}
                         </div>
                      </div>
                   </div>

                   <div style={{ display: 'flex', gap: '16px' }}>
                      <button 
                         onClick={() => navigate(`/profile/users/${selectedUser.uid}`)}
                         style={{ flex: 1.2, padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)' }}
                         onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.23)';
                         }}
                         onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(37, 99, 235, 0.39)';
                         }}
                      >
                         Full User Dossier
                      </button>
                      {selectedUser.status === 'suspended' ? (
                         <button 
                            onClick={() => handleStatusChange(selectedUser.uid, 'activate')}
                            style={{ flex: 1, padding: '16px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                         >
                            Restore Access
                         </button>
                      ) : (
                         <button 
                            onClick={() => handleStatusChange(selectedUser.uid, 'suspend')}
                            style={{ flex: 1, padding: '16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                         >
                            Suspend Identity
                         </button>
                      )}
                   </div>
                </div>
             </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminUsers;
