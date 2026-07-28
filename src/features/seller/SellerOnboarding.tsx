import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { uploadToCloudinary } from '@/services/cloudinary';
import { Input } from '@/components/ui/Input';
import { ProfileSharedFields } from '@/components/common/ProfileSharedFields';
import { FiUploadCloud, FiEye, FiTrash2, FiX } from 'react-icons/fi';
import styles from './SellerOnboarding.module.css';

/**
 * Dedicated Merchant Onboarding Hub.
 */
const SellerOnboarding: React.FC = () => {
   const { user, sellerData } = useAuth();
   
   const [formData, setFormData] = useState({
      phone: '', 
      shopName: '',
      addressLine: '',
      locality: '',
      city: '',
      state: '',
      pincode: ''
   });
   
   // Staging area for files before final binary push
   const [certStaging, setCertStaging] = useState<{ file: File; preview: string } | null>(null);
   const [photoStaging, setPhotoStaging] = useState<{ file: File; preview: string }[]>([]);
   
   const [uploadingStatus, setUploadingStatus] = useState<string | null>(null);
   const [error, setError] = useState<string>('');
   const [activeMedia, setActiveMedia] = useState<string | null>(null);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
   };

   // --- Staging logic (No Network overhead) ---
   const stageFile = (file: File): Promise<string> => {
      return new Promise((resolve) => {
         const reader = new FileReader();
         reader.onloadend = () => resolve(reader.result as string);
         reader.readAsDataURL(file);
      });
   };

   const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
      const file = (e as any).target?.files?.[0] || (e as any).dataTransfer?.files?.[0];
      if (!file) return;
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
         return setError('Only image files (.jpg, .jpeg, .png, .webp) are allowed for document upload.');
      }

      setError('');
      const preview = await stageFile(file);
      setCertStaging({ file, preview });
   };

   const handleShopPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
      const files = (e as any).target?.files || (e as any).dataTransfer?.files;
      if (!files || files.length === 0) return;
      
      const newStaged = await Promise.all(
         Array.from(files as FileList).map(async (file) => ({
            file,
            preview: await stageFile(file)
         }))
      );
      setPhotoStaging(prev => [...prev, ...newStaged]);
   };

   const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
   };

   const handleDrop = (e: React.DragEvent, type: 'cert' | 'photo') => {
      e.preventDefault();
      e.stopPropagation();
      if (type === 'cert') handleCertificateUpload(e);
      else handleShopPhotoUpload(e);
   };

   const removePhoto = (index: number) => {
      setPhotoStaging(prev => prev.filter((_, i) => i !== index));
   };

   const handleCompleteRegistration = async () => {
      setError('');
      if (!formData.shopName || !formData.phone || !formData.city || !formData.pincode || !certStaging || photoStaging.length === 0) {
         return setError('Please complete all fields and select required documents.');
      }

      const formattedLocation = [formData.addressLine, formData.locality, formData.city, formData.state, formData.pincode]
         .filter(Boolean)
         .join(', ');

      setUploadingStatus('Initiating secure media synchronization...');
      try {
         // Batch trigger the Cloudinary pushes only now!
         setUploadingStatus('Uploading primary certificate...');
         const finalCertUrl = await uploadToCloudinary(certStaging.file);

         const finalPhotoUrls = await Promise.all(
            photoStaging.map(async (item, i) => {
               setUploadingStatus(`Uploading shop gallery (${i + 1}/${photoStaging.length})...`);
               return await uploadToCloudinary(item.file);
            })
         );

         setUploadingStatus('Committing identity to decentralized registry...');
         // Committing identity to decentralized registry
         const sellerRef = doc(db, 'sellers', sellerData!.sellerId);
         await updateDoc(sellerRef, {
            shopName: formData.shopName,
            sellerNumber: formData.phone,
            sellerLocation: formattedLocation,
            sellerCertificateUrl: finalCertUrl,
            shopPhotoUrls: finalPhotoUrls,
            status: 'pending'
         });
         
         window.location.href = ROUTES.SELLER_DASHBOARD;
      } catch (err: any) { 
         setError(`Synchronization Failed: ${err.message}`); 
         setUploadingStatus(null); 
      }
   };

   // Remove the isPdf check since we only allow images now
   // const isPdf = (url: string) => url.startsWith('data:application/pdf') || url.toLowerCase().endsWith('.pdf') || url.includes('/v1/pdf/');

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <h1 className={styles.title}>Welcome, {user?.displayName}</h1>
            <p className={styles.subtitle}>Complete your Merchant configuration parameters to unlock full access to the Dashboard.</p>
         </div>

         {error && <div className={styles.error}>{error}</div>}

         <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>1. Operational Identity</h3>
            <div className={styles.inputGrid} style={{ gridTemplateColumns: '1fr', gap: '16px', marginBottom: '32px' }}>
               <Input label="Store Name *" name="shopName" value={formData.shopName} onChange={handleInputChange} />
            </div>

            <ProfileSharedFields formData={formData} handleInputChange={handleInputChange} showDOBAndGender={false} />
         </div>

         <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>3. Compliance Documentation</h3>
            <div className={styles.inputGrid} style={{ gridTemplateColumns: '1fr', gap: '32px' }}>
               
               {/* 2.1 Certificate Segment */}
               <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#64748b', fontWeight: 700 }}>OFFICIAL BUSINESS CERTIFICATE (IMAGE ONLY)</h4>
                  <label 
                     className={styles.dropzone}
                     onDragOver={handleDragOver}
                     onDrop={(e) => handleDrop(e, 'cert')}
                  >
                     <FiUploadCloud size={32} color="#3b82f6" />
                     <div className={styles.uploadLabel}>Drop Certificate Image or Click Header</div>
                     <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" style={{ display: 'none' }} onChange={handleCertificateUpload} />
                  </label>
                  {certStaging && (
                     <div className={styles.previewGrid}>
                        <div className={styles.previewItem}>
                           <div onClick={() => setActiveMedia(certStaging.preview)} style={{ width: '100%', height: '100%' }}>
                              <img src={certStaging.preview} className={styles.previewImg} alt="Certificate" />
                              <div className={styles.previewOverlay}><FiEye size={20} /></div>
                           </div>
                           <button onClick={() => setCertStaging(null)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(239, 68, 68, 0.9)', border: 'none', borderRadius: '4px', color: 'white', padding: '4px', cursor: 'pointer', zIndex: 10 }}>
                              <FiTrash2 size={14} />
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               {/* 2.2 Photo Gallery Segment */}
               <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#64748b', fontWeight: 700 }}>SHOP & STOREFRONT GALLERY</h4>
                  <label 
                     className={styles.dropzone}
                     onDragOver={handleDragOver}
                     onDrop={(e) => handleDrop(e, 'photo')}
                  >
                     <FiUploadCloud size={32} color="#3b82f6" />
                     <div className={styles.uploadLabel}>Drop Shop Photos or Click to Browse</div>
                     <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleShopPhotoUpload} />
                  </label>
                  <div className={styles.previewGrid}>
                     {photoStaging.map((item, i) => (
                        <div key={i} className={styles.previewItem}>
                           <img src={item.preview} className={styles.previewImg} alt="Shop" onClick={() => setActiveMedia(item.preview)} />
                           <div className={styles.previewOverlay} onClick={() => setActiveMedia(item.preview)}><FiEye size={20} /></div>
                           <button onClick={(e) => { e.stopPropagation(); removePhoto(i); }} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(239, 68, 68, 0.9)', border: 'none', borderRadius: '4px', color: 'white', padding: '4px', cursor: 'pointer', zIndex: 10 }}>
                              <FiTrash2 size={14} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <button 
           className={`${styles.submitBtn} ${uploadingStatus ? styles.btnUploading : ''}`} 
           disabled={!!uploadingStatus} 
           onClick={handleCompleteRegistration}
         >
            {uploadingStatus ? (
               <div className={styles.loaderContainer}>
                  <div className={styles.spinner}></div>
                  <span>{uploadingStatus}</span>
               </div>
            ) : (
               'Submit for Verification'
            )}
         </button>

         {/* Lightbox Rendering */}
         {activeMedia && (
            <div className={styles.lightbox} onClick={() => setActiveMedia(null)}>
               <button className={styles.closeLightbox}><FiX /></button>
               <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                  <img src={activeMedia} className={styles.lightboxImg} alt="Fullscreen preview" />
               </div>
            </div>
         )}
      </div>
   );
};

export default SellerOnboarding;
