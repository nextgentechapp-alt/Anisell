import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { ProfileSharedFields } from '@/components/common/ProfileSharedFields';
import styles from './BuyerOnboarding.module.css';
import type { Address } from '@/types';

/**
 * Dedicated Customer Onboarding Hub.
 * Requires mandatory profile parameters before accessing the platform.
 */
const BuyerOnboarding: React.FC = () => {
   const { user, updateBuyerProfile } = useAuth();
   const navigate = useNavigate();
   
   const [formData, setFormData] = useState({
      phone: '',
      dateOfBirth: '',
      gender: '',
      addressLine: '',
      locality: '',
      city: '',
      state: '',
      pincode: ''
   });
   
   const [status, setStatus] = useState<string | null>(null);
   const [error, setError] = useState<string>('');

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const handleCompleteRegistration = async () => {
      setError('');
      if (!formData.phone || !formData.dateOfBirth || !formData.city || !formData.pincode) {
         return setError('Please complete all required fields (Phone, DOB, City, Pincode).');
      }

      setStatus('Finalizing buyer profile...');
      try {
         const newAddress: Address = {
            name: user?.displayName || 'Home',
            phone: formData.phone,
            addressLine: formData.addressLine,
            locality: formData.locality,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            type: 'home'
         };

         await updateBuyerProfile({
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            addresses: [newAddress],
            status: 'active'
         });
         
         navigate(ROUTES.USER_PROFILE);
      } catch (err: any) { 
         setError(`Synchronization Failed: ${err.message}`); 
         setStatus(null); 
      }
   };

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <h1 className={styles.title}>Welcome, {user?.displayName}</h1>
            <p className={styles.subtitle}>Complete your profile setup to start acquiring premium pet listings.</p>
         </div>

         {error && <div className={styles.error}>{error}</div>}

         <div className={styles.formSection}>
            <ProfileSharedFields formData={formData} handleInputChange={handleInputChange} />
         </div>

         <button className={styles.submitBtn} disabled={!!status} onClick={handleCompleteRegistration}>
            {status || 'Complete Setup'}
         </button>
      </div>
   );
};

export default BuyerOnboarding;
