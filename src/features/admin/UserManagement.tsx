import React from 'react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FiUserCheck, FiUserX } from 'react-icons/fi';
import type { User, Seller } from '@/types';
import styles from './UserManagement.module.css';

interface UserManagementProps {
  users: User[];
  sellers: Seller[];
  onVerify?: (id: string) => void;
  onSuspend?: (id: string) => void;
}

/**
 * Platform User Administration Feature.
 * Orchestrates platform-wide user growth and merchant verification oversight, 
 * leveraging the shared Table and Badge UI components.
 * Extracted from Admin.tsx to isolate administrative sub-features.
 */
export const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  sellers,
  onVerify,
  onSuspend
}) => {
  
  // Normalized consumer data visualization
  const userColumns = [
    { 
      header: 'Identity / Email', 
      key: 'displayName',
      render: (u: User) => (
        <div className={styles.userCell}>
           <img src={u.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} alt="" className={styles.avatar} />
           <div>
              <div className={styles.userName}>{u.displayName}</div>
              <div className={styles.userEmail}>{u.email}</div>
           </div>
        </div>
      )
    },
    { header: 'Account Type', key: 'role', render: (u: User) => <Badge label={u.role || 'Buyer'} variant="neutral" /> },
    { header: 'Join Date', key: 'uid', render: () => 'Mar 28, 2026' }, // Placeholder for join date
    { 
      header: 'Actions', 
      key: 'actions',
      render: (u: User) => (
        <div className={styles.btnGroup}>
           {u.role === 'seller' && (
             <button className={styles.actionBtn} onClick={() => onVerify?.(u.uid)}>
               <FiUserCheck />
             </button>
           )}
           <button className={`${styles.actionBtn} ${styles.suspendBtn}`} onClick={() => onSuspend?.(u.uid)}>
             <FiUserX />
           </button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Account Oversight</h2>
        <p className={styles.subtitle}>Manage global platform identities and merchant credentials.</p>
      </header>

      <div className={styles.tableCard}>
         <Table data={users} columns={userColumns} />
      </div>

      <footer className={styles.summary}>
         Total Registered Entities: <strong>{users.length}</strong> 
         <span style={{ margin: '0 12px', opacity: 0.3 }}>|</span>
         Verified Merchants: <strong>{sellers.length}</strong>
      </footer>
    </div>
  );
};
