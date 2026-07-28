import React, { useState } from 'react';
import { FiX, FiUpload, FiTrash2, FiCheck } from 'react-icons/fi';
import { ProductService } from '@/services/api/ProductService';
import { uploadToCloudinary } from '@/services/cloudinary';
import { Input } from '@/components/ui/Input';


interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  sellerId: string;
}

/**
 * Pet Listing Submission Workspace.
 * Orchestrates product entry, media management via Cloudinary, and platform synchronization.
 * Categorized and structured based on platform data-schema specifications.
 */
export const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSuccess, sellerId }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingVideo, setPendingVideo] = useState<File | null>(null);
  const [previews, setPreviews] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  
  const [formData, setFormData] = useState({
    productType: 'Pets',
    productCategory: 'Dog',
    customCategory: '',
    productSubCategory: '',
    customSubCategory: '',
    productPrice: 0,
    productDob: '',
    productGender: 'Male',
    productDescription: '',
    productVaccinated: false,
    productIsPair: false,
  });

  const categoryOptions: Record<string, string[]> = {
    Dog: ['Golden Retriever', 'German Shepherd', 'Labrador', 'Poodle', 'Husky', 'Other'],
    Cat: ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Ragdoll', 'Other'],
    Bird: ['Parrot', 'Canary', 'Cockatiel', 'Lovebird', 'Finch', 'Other'],
    Fish: ['Goldfish', 'Betta', 'Guppy', 'Angelfish', 'Tetra', 'Other'],
    'Small Pets': ['Hamster', 'Guinea Pig', 'Rabbit', 'Ferret', 'Gerbil', 'Other'],
    Other: ['Other']
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: finalValue };
      if (name === 'productCategory') {
        updated.productSubCategory = '';
        updated.customSubCategory = '';
      }
      return updated;
    });
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (years === 0 && months === 0) {
      const diffTime = Math.abs(today.getTime() - birthDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} Days`;
    }
    
    if (years === 0) return `${months} Months`;
    if (months === 0) return `${years} Years`;
    return `${years} Years ${months} Months`;
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
     const files = e.target.files;
     if (!files || files.length === 0) return;

     const fileList = Array.from(files);

     if (type === 'image' && (pendingImages.length + fileList.length) > 4) {
        setError('Registry Constraint: A maximum of 4 photographic records is permitted.');
        return;
     }

     setError('');
     
     fileList.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        if (type === 'image') {
           setPendingImages(prev => [...prev, file]);
           setPreviews(prev => [...prev, { url: previewUrl, type: 'image' }]);
        } else {
           setPendingVideo(file);
           setPreviews(prev => [...prev.filter(p => p.type !== 'video'), { url: previewUrl, type: 'video' }]);
        }
     });
  };

  const removeImage = (index: number) => {
     setPendingImages(prev => prev.filter((_, i) => i !== index));
     setPreviews(prev => {
        const imagePreviews = prev.filter(p => p.type === 'image');
        const targetPreview = imagePreviews[index];
        URL.revokeObjectURL(targetPreview.url);
        return prev.filter(p => p.url !== targetPreview.url);
     });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = [];
    if (pendingImages.length < 4) errors.push('Minimum requirements unmet: 4 images are mandatory.');
    if (!pendingVideo) errors.push('Minimum requirements unmet: 1 video record (evidence) is mandatory.');
    
    const subCatValue = formData.productSubCategory === 'Other' ? formData.customSubCategory : formData.productSubCategory;
    if (!subCatValue || subCatValue.trim() === '') {
      errors.push('Registry Constraint: Genetic Breed (Sub-category) cannot be empty.');
    }

    if (!formData.productDob) errors.push('Chronological error: Date of birth is mandatory.');
    if (formData.productPrice <= 0) errors.push('Valuation error: Market Price must be greater than 0.');

    if (errors.length > 0) {
       setError(errors.join(' '));
       return;
    }

    setLoading(true);
    setStatus('Initializing Media Uplink...');
    setError('');
    
    try {
      // PHASE 1: Delayed Media Upload to Cloudinary (Concurrent Stream)
      // Only triggered when 'Commit Official Listing' is actioned
      
      const imageUrls = await Promise.all(
        pendingImages.map(async (file, i) => {
          setStatus(`Uploading Portfolio Image (${i + 1}/${pendingImages.length})...`);
          return await uploadToCloudinary(file);
        })
      );
      
      let videoUrl = '';
      if (pendingVideo) {
        setStatus('Finalizing Cinematic Evidence Record...');
        videoUrl = await uploadToCloudinary(pendingVideo);
      }
      
      setStatus('Committing Listing to Platform Registry...');

      const finalProductData = {
        productType: formData.productType,
        productCategory: formData.productCategory === 'Other' ? formData.customCategory : formData.productCategory,
        productSubCategory: subCatValue,
        productPrice: formData.productPrice,
        productAge: calculateAge(formData.productDob),
        productGender: formData.productGender,
        productDescription: formData.productDescription,
        productVaccinated: formData.productVaccinated,
        productIsPair: formData.productIsPair,
        productMedia: [...imageUrls, videoUrl].filter(Boolean),
      };

      await ProductService.createProduct(sellerId, finalProductData as any);
      setStatus('Synchronization Complete. Listing finalized.');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError('Platform Registry Error: ' + err.message);
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '4px', height: '16px', background: '#2563eb', borderRadius: '2px' }}></div>
      <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</span>
    </div>
  );

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="modal-container" style={{ background: '#fff', width: '100%', maxWidth: '750px', maxHeight: '95vh', overflowY: 'auto', borderRadius: '32px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)', position: 'relative' }}>
        
        <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
           <div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Establish Marketplace Presence</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 }}>Create a high-fidelity listing for administrative approval.</p>
           </div>
           <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }}><FiX size={22}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
           <SectionTitle>Identity & Biological Mapping</SectionTitle>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div>
                 <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Market Segment</label>
                 <select name="productType" value={formData.productType} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b', background: '#fcfdfe' }}>
                    <option value="Pets">Pets</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Toys">Toys</option>
                 </select>
              </div>
              <div>
                 <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Species Segment</label>
                 <select name="productCategory" value={formData.productCategory} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b', background: '#fcfdfe' }}>
                    <option value="Dog">Dogs</option>
                    <option value="Cat">Cats</option>
                    <option value="Bird">Birds</option>
                    <option value="Fish">Fish</option>
                    <option value="Small Pets">Small Pets</option>
                    <option value="Other">Other / Custom</option>
                 </select>
                 {formData.productCategory === 'Other' && (
                   <input type="text" name="customCategory" value={formData.customCategory} onChange={handleInputChange} placeholder="Enter Species..." style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                 )}
              </div>
              <div>
                 <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Genetic Breed</label>
                 <select name="productSubCategory" value={formData.productSubCategory} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b', background: '#fcfdfe' }}>
                    <option value="">Select Breed</option>
                    {(categoryOptions[formData.productCategory] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                 </select>
                 {formData.productSubCategory === 'Other' && (
                   <input type="text" name="customSubCategory" value={formData.customSubCategory} onChange={handleInputChange} placeholder="Enter Breed..." style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                 )}
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
              <div>
                 <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Date of Birth</label>
                 <input type="date" name="productDob" value={formData.productDob} onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b' }} />
              </div>
              <div>
                 <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Gender</label>
                 <div style={{ display: 'flex', gap: '12px' }}>
                    {['Male', 'Female'].map(g => (
                      <button key={g} type="button" onClick={() => setFormData(p => ({ ...p, productGender: g }))} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid', borderColor: formData.productGender === g ? '#2563eb' : '#e2e8f0', background: formData.productGender === g ? '#eff6ff' : '#fff', color: formData.productGender === g ? '#2563eb' : '#475569', fontWeight: 700, cursor: 'pointer' }}>{g}</button>
                    ))}
                 </div>
              </div>
           </div>

           <SectionTitle>Market Values & Specifications</SectionTitle>
           <div style={{ marginBottom: '32px' }}>
              <Input label="Market Valuation (₹) *" type="number" name="productPrice" value={formData.productPrice.toString()} onChange={(e) => setFormData(prev => ({ ...prev, productPrice: Number(e.target.value) }))} />
           </div>

           <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Detailed Listing Description *</label>
              <textarea name="productDescription" value={formData.productDescription} onChange={handleInputChange} rows={4} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '15px', fontWeight: 500, lineHeight: '1.6', background: '#fcfdfe' }} placeholder="Contextualize the pet heritage, temperament, and health status..." />
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '40px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '14px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                 <input type="checkbox" name="productVaccinated" checked={formData.productVaccinated} onChange={handleInputChange} style={{ width: '20px', height: '20px', accentColor: '#2563eb' }} />
                 <span style={{ fontSize: '13px', fontWeight: 700 }}>Verified Immunization</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '14px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                 <input type="checkbox" name="productIsPair" checked={formData.productIsPair} onChange={handleInputChange} style={{ width: '20px', height: '20px', accentColor: '#2563eb' }} />
                 <span style={{ fontSize: '13px', fontWeight: 700 }}>Bonded Identity (Pair)</span>
              </label>
           </div>

           <SectionTitle>Evidence Portfolio (4 Images, 1 Video)</SectionTitle>
           <div style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '24px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>PHOTOGRAPHIC RECORDS</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: pendingImages.length === 4 ? '#10b981' : '#f59e0b' }}>{pendingImages.length} / 4 REQUIRED</span>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {previews.filter(p => p.type === 'image').map((p, i) => (
                       <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', border: '2px solid #f1f5f9' }}>
                          <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '6px', right: '6px', background: '#fff', color: '#dc2626', border: 'none', borderRadius: '10px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={14}/></button>
                       </div>
                    ))}
                    {pendingImages.length < 4 && (
                       <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', aspectRatio: '1/1', border: '2px dashed #cbd5e1', borderRadius: '16px', cursor: 'pointer', background: '#f8fafc' }}>
                          <input type="file" multiple onChange={(e) => handleMediaUpload(e, 'image')} accept="image/*" style={{ display: 'none' }} />
                          <FiUpload size={24} color="#64748b" />
                       </label>
                    )}
                 </div>
              </div>

              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>CINEMATIC EVIDENCE</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: pendingVideo ? '#10b981' : '#f59e0b' }}>{pendingVideo ? 1 : 0} / 1 REQUIRED</span>
                 </div>
                 {pendingVideo ? (
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                       <video src={previews.find(p => p.type === 'video')?.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls />
                       <button type="button" onClick={() => { setPendingVideo(null); setPreviews(prev => prev.filter(p => p.type !== 'video')); }} style={{ position: 'absolute', top: '10px', right: '10px', background: '#fff', color: '#dc2626', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={16}/></button>
                    </div>
                 ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '160px', border: '2px dashed #cbd5e1', borderRadius: '16px', cursor: 'pointer', background: '#f8fafc' }}>
                       <input type="file" onChange={(e) => handleMediaUpload(e, 'video')} accept="video/*" style={{ display: 'none' }} />
                       <FiUpload size={24} color="#64748b" />
                       <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginTop: '12px' }}>UPLOAD MANDATORY VIDEO</span>
                    </label>
                 )}
              </div>
           </div>

           {error && <div style={{ marginBottom: '32px', padding: '16px 20px', background: '#fef2f2', color: '#991b1b', borderRadius: '14px', fontSize: '14px', fontWeight: 700, border: '1px solid #fee2e2' }}>{error}</div>}

           <div style={{ display: 'flex', gap: '16px', position: 'sticky', bottom: '-40px', background: '#fff', padding: '24px 0', borderTop: '1px solid #f1f5f9', marginTop: '20px' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '16px', background: '#f1f5f9', color: '#475569', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Discard Listing</button>
              <button type="submit" disabled={loading} style={{ flex: 2, padding: '16px', background: '#2563eb', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                 {loading ? (
                    <>
                       <div className="mini-spinner"></div>
                       <span style={{ fontSize: '13px' }}>{status}</span>
                    </>
                 ) : (
                    <>
                       <FiCheck size={20} />
                       <span>Commit Official Listing</span>
                    </>
                 )}
              </button>
           </div>
        </form>
      </div>
      <style>{`
        .mini-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: mini-spin 0.6s linear infinite; }
        @keyframes mini-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
