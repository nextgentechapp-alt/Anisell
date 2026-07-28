import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProfileSharedFields } from '@/components/common/ProfileSharedFields';
import { useOutletContext } from 'react-router-dom';
import { FiEdit3, FiMenu } from 'react-icons/fi';

/**
 * Account Details Discovery Hub.
 * Provides the interface for users to update their core identity records.
 */
const UserEdit: React.FC = () => {
  const { user, buyerData, updateBuyerProfile, updateProfile } = useAuth();
  const { toggleMenu } = useOutletContext<{ toggleMenu: () => void }>();
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState = {
     phone: buyerData?.phone || '',
     dateOfBirth: buyerData?.dateOfBirth || '',
     gender: buyerData?.gender || '',
     addressLine: buyerData?.addresses?.[0]?.addressLine || '',
     locality: buyerData?.addresses?.[0]?.locality || '',
     city: buyerData?.addresses?.[0]?.city || '',
     state: buyerData?.addresses?.[0]?.state || '',
     pincode: buyerData?.addresses?.[0]?.pincode || '',
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
        setMessage('Profile image updated successfully.');
     } catch (err: any) {
        console.error('Profile image upload failed:', err);
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
        await updateBuyerProfile({
           phone: formData.phone,
           dateOfBirth: formData.dateOfBirth,
           gender: formData.gender,
           addresses: [{
              name: buyerData?.addresses?.[0]?.name || 'Home',
              phone: formData.phone,
              addressLine: formData.addressLine,
              locality: formData.locality,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              type: 'home'
           }]
        });
        setMessage('Identity parameters synchronized successfully.');
        setIsEditing(false);
     } catch (err: any) {
        setMessage(`Update failed: ${err.message}`);
     } finally {
        setLoading(false);
     }
  };

  const InfoItem = ({ label, value }: { label: string, value: string }) => (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #f8fafc' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{value || 'Not Specified'}</div>
    </div>
  );

  return (
    <div className="user-profile-content">
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
           <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Account Details</h2>
           <button 
             className="mobileMenuTrigger" 
             onClick={toggleMenu}
             style={{ display: 'none', background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
           >
              <FiMenu size={24} color="#1e293b" />
           </button>
        </div>
        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '16px' }}>Manage your personal identity information and contact details.</p>
        
        {!isEditing && (
          <button 
             onClick={() => setIsEditing(true)}
             className="button-base" 
             style={{ background: '#2563eb10', color: '#2563eb', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiEdit3 /> Edit Profile
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
               <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{user?.displayName || 'Marketplace Member'}</h3>
               <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>{user?.email}</p>
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
           <div style={{ animation: 'fadeIn 0.3s ease' }}>
             <ProfileSharedFields formData={formData} handleInputChange={handleInputChange} />
             
             {message && <div style={{ marginTop: '24px', padding: '16px', background: message.includes('failed') ? '#fef2f2' : '#ecfdf5', color: message.includes('failed') ? '#991b1b' : '#065f46', borderRadius: '12px', fontWeight: 600 }}>{message}</div>}

             <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                <button className="button-base" onClick={handleCancel} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                   Cancel
                </button>
                <button className="button-base button-primary" onClick={handleUpdate} disabled={loading} style={{ padding: '12px 32px', borderRadius: '12px' }}>
                   {loading ? 'Saving Changes...' : 'Save Profile'}
                </button>
             </div>
           </div>
         ) : (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', animation: 'fadeIn 0.3s ease' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
               <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>Personal Information</h4>
               <InfoItem label="Phone Number" value={formData.phone} />
               <InfoItem label="Date of Birth" value={formData.dateOfBirth} />
               <InfoItem label="Gender" value={formData.gender} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
               <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>Address Details</h4>
               <InfoItem label="Street Address" value={formData.addressLine} />
               <InfoItem label="Locality" value={formData.locality} />
               <InfoItem label="City" value={formData.city} />
               <InfoItem label="State & Pincode" value={`${formData.state} ${formData.pincode}`} />
             </div>
           </div>
         )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default UserEdit;
