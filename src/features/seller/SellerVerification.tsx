import React from 'react';
import { FiShield, FiUploadCloud } from 'react-icons/fi';

/**
 * Merchant Verification Portal.
 * Dedicated interface for uploading official certificates and KYC compliance.
 */
const SellerVerification: React.FC = () => {
  return (
    <div className="seller-dashboard-content">
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Store Verification</h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Upload your breeder certification and business licenses to unlock a verified badge.</p>
      </header>

      <div style={{ padding: '40px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e2e8f0' }}>
           <div style={{ padding: '16px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb' }}>
             <FiShield size={32} />
           </div>
           <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>Verification Status: <span style={{ color: '#f59e0b' }}>Pending Documents</span></h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
                Your store currently holds baseline visibility. To establish marketplace trust and prioritize your listings in the search registry, you must submit valid kennel/breeder certificates or relevant business documentation.
              </p>
           </div>
        </div>

        <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #cbd5e1', borderRadius: '12px', background: '#f8fafc' }}>
           <FiUploadCloud size={40} color="#94a3b8" style={{ marginBottom: '16px' }} />
           <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#475569' }}>Upload Official Certificates (PDF, JPG)</h4>
           <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>Max file size 10MB per document.</p>
           <button style={{ padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Select Files</button>
        </div>
      </div>
    </div>
  );
};

export default SellerVerification;
