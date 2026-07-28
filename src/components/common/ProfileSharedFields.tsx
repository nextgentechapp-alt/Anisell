import React from 'react';
import { Input } from '@/components/ui/Input';

interface ProfileSharedFieldsProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  // If `showDOBAndGender` is false, hide these elements, perfect for sellers if they don't explicitly require them,
  // although we'll include them if we want unification.
  showDOBAndGender?: boolean; 
}

/**
 * Encapsulated Core Profile Fields for Onboarding and Form Editing.
 * Ensures consistent UI and data structure across Buyer and Seller data handling.
 */
export const ProfileSharedFields: React.FC<ProfileSharedFieldsProps> = ({ 
   formData, handleInputChange, showDOBAndGender = true 
}) => {
   return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
         {/* Segment 1: Personal / Operational Identity */}
         <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
               1. Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
               <Input label="Phone Number *" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
               
               {showDOBAndGender && (
                  <>
                     <Input label="Date of Birth *" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleInputChange} />
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Gender</label>
                        <select name="gender" value={formData.gender || ''} onChange={handleInputChange} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}>
                           <option value="">Select Gender</option>
                           <option value="male">Male</option>
                           <option value="female">Female</option>
                           <option value="other">Other</option>
                        </select>
                     </div>
                  </>
               )}
            </div>
         </div>

         {/* Segment 2: Geographic Hub Context */}
         <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
               2. Primary Hub Location
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
               <div style={{ gridColumn: '1 / -1' }}>
                  <Input label="Address Line" name="addressLine" value={formData.addressLine || ''} onChange={handleInputChange} />
               </div>
               <Input label="Locality" name="locality" value={formData.locality || ''} onChange={handleInputChange} />
               <Input label="City *" name="city" value={formData.city || ''} onChange={handleInputChange} />
               <Input label="State" name="state" value={formData.state || ''} onChange={handleInputChange} />
               <Input label="Pincode *" name="pincode" value={formData.pincode || ''} onChange={handleInputChange} />
            </div>
         </div>
      </div>
   );
};
