import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { FiEdit3, FiMenu } from 'react-icons/fi';
import { ProfileSharedFields } from '@/components/common/ProfileSharedFields';
import { Input } from '@/components/ui/Input';
import { AuthService } from '@/services/api/AuthService';

/**
 * Merchant Profile Editing Hub.
 * Manages store branding, contact logic, and global operation details.
 */
const SellerEdit: React.FC = () => {
  const { toggleMenu } = useOutletContext<{ toggleMenu: () => void }>();
  const { user, sellerData, buyerData, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const seller = useMemo(() => {
    return {
      sellerId: user?.uid,
      shopName: sellerData?.shopName || user?.displayName,
      sellerLocation: sellerData?.sellerLocation || '',
      sellerNumber: sellerData?.sellerNumber || buyerData?.phone || '',
    };
  }, [user, sellerData, buyerData]);

  const [addrLine = '', loc = '', cty = '', st = '', pin = ''] = (seller.sellerLocation || '').split(', ');

  const initialFormState = {
     shopName: seller.shopName || '',
     phone: seller.sellerNumber || '',
     addressLine: addrLine || '',
     locality: loc || '',
     city: cty || '',
     state: st || '',
     pincode: pin || ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     setImageLoading(true);
     setMessage('');
     try {
        const { uploadToCloudinary } = await import('@/services/cloudinary');
        const imageUrl = await uploadToCloudinary(file);
        
        await updateProfile({ photoURL: imageUrl });
        setMessage('Store logo synchronized successfully.');
     } catch (err: any) {
        console.error('Logo upload failed:', err);
        setMessage(`Upload failed: ${err.message}`);
     } finally {
        setImageLoading(false);
     }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setMessage('');
  };

  const handleUpdate = async () => {
     setLoading(true);
     setMessage('');
     try {
        const formattedLocation = [formData.addressLine, formData.locality, formData.city, formData.state, formData.pincode]
           .filter(Boolean)
           .join(', ');

        // Sync to User collection
        await updateProfile({
           displayName: formData.shopName,
        });

        // Sync to Buyer collection if exists (Parity Sync)
        if (buyerData) {
           await AuthService.updateBuyerInfo(user!.uid, {
              phone: formData.phone
           });
        }

        // Sync to Seller collection
        if (sellerData?.sellerId) {
           await AuthService.updateSellerInfo(sellerData.sellerId, {
              shopName: formData.shopName,
              sellerNumber: formData.phone,
              sellerLocation: formattedLocation
           });
        }
        
        setMessage('Store details synchronized successfully.');
        setIsEditing(false);
     } catch (err: any) {
        setMessage(`Update failed: ${err.message}`);
     } finally {
        setLoading(false);
     }
  };

  const InfoItem = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #f8fafc' }}>
      <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon} {value || 'N/A'}
      </div>
    </div>
  );

  return (
    <div className="seller-dashboard-content">
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
           <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Store Profile</h2>
           <button 
             className="mobileMenuTrigger" 
             onClick={toggleMenu}
             style={{ display: 'none', background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
           >
              <FiMenu size={24} color="#1e293b" />
           </button>
        </div>
        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '16px' }}>Configure your storefront identity and core operational details.</p>
        
        {!isEditing && (
          <button 
             onClick={() => setIsEditing(true)}
             className="button-base" 
             style={{ background: '#2563eb10', color: '#2563eb', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiEdit3 /> Manage Storefront
          </button>
        )}
      </header>

      <div style={{ padding: '40px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid #f1f5f9' }}>
             <div style={{ position: 'relative' }}>
                <img 
                   src={user?.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'} 
                   alt="" 
                   style={{ width: '100px', height: '100px', borderRadius: '32px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                />
                {imageLoading && (
                   <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="spinner-small" style={{ width: '24px', height: '24px', border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                   </div>
                )}
                {isEditing && (
                  <button 
                    onClick={triggerFileInput}
                    style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  >
                    <FiEdit3 size={14} color="#2563eb" />
                  </button>
                )}
             </div>
             <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{sellerData?.shopName || user?.displayName || 'Merchant Partner'}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Verified Merchant Portal</span>
                  <div style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 700 }}>Active Status</span>
                </div>
             </div>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
             />
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {isEditing ? (
            <div style={{ animation: 'slideUp 0.3s ease' }}>
               <div style={{ marginBottom: '32px' }}>
                  <Input label="Store Display Name *" name="shopName" value={formData.shopName} onChange={handleInputChange} />
               </div>

               <ProfileSharedFields formData={formData} handleInputChange={handleInputChange} showDOBAndGender={false} />

               {message && <div style={{ marginTop: '24px', padding: '16px', background: message.includes('failed') ? '#fef2f2' : '#ecfdf5', color: message.includes('failed') ? '#991b1b' : '#065f46', borderRadius: '12px', fontWeight: 600 }}>{message}</div>}

               <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                  <button className="button-base" onClick={handleCancel} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                     Discard Changes
                  </button>
                  <button className="button-base button-primary" onClick={handleUpdate} disabled={loading} style={{ padding: '12px 32px', borderRadius: '12px' }}>
                     {loading ? 'Committing Changes...' : 'Save Merchant Identity'}
                  </button>
               </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '48px', animation: 'fadeIn 0.3s ease' }}>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>Store Branding</h4>
                <InfoItem label="Official Shop Name" value={seller.shopName || ''} />
                <InfoItem label="Merchant Contact" value={seller.sellerNumber} />
                <InfoItem label="Cloud Registry ID" value={seller.sellerId || ''} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>Global Presence</h4>
                <InfoItem label="Business Headquarters" value={seller.sellerLocation} />
                <InfoItem label="Primary Region" value={formData.city || 'N/A'} />
                <InfoItem label="Logistic Range" value={formData.state || 'N/A'} />
              </div>
            </div>
          )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default SellerEdit;
