import React, { useState, useEffect } from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { PetProductService } from '@/services/api/petverse/PetProductService';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FiX, FiShield, FiTrash2, FiPlus } from 'react-icons/fi';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { useAuth } from '@/context/AuthContext';

const InputField = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
  </div>
);

/**
 * Platform Supply Oversight.
 * Governs the marketplace catalog, category architecture, and stock policies.
 */
const AdminProducts: React.FC = () => {
  const { products, loading } = useSearchData();
  const { user } = useAuth();
  const [petverseProducts, setPetverseProducts] = useState<any[]>([]);
  const [petverseLoading, setPetverseLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [tab, setTab] = useState<'main' | 'petverse'>('petverse');
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);

  const [form, setForm] = useState({
    title: '',
    price: '',
    mrp: '',
    categorySlug: 'dogs',
    brand: 'Generic',
    stock: '10',
    animalType: 'Dog',
    imageUrl: '',
    description: '',
    productType: 'Pets',
    productCategory: 'Dog',
    productSubCategory: ''
  });

  useEffect(() => {
    PetProductService.getAllProducts().then((data) => {
      setPetverseProducts(data);
      setPetverseLoading(false);
    });
  }, []);

  if (loading || petverseLoading) return (
     <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {[...Array(8)].map((_, i) => <SkeletonTableRow key={i} columns={5} />)}
     </div>
  );

  const currentProducts: any[] = tab === 'petverse' ? petverseProducts : products;
  const uniqueTypes = ['All', ...Array.from(new Set(currentProducts.map((p: any) => p.productType || p.categorySlug || '')))].filter(Boolean);
  const filteredProducts = currentProducts.filter((p: any) => filterType === 'All' || p.productType === filterType || p.categorySlug === filterType);

  const handleAction = async (id: string, action: string) => {
    const targetName = (selectedProduct as any)?.productSubCategory || (selectedProduct as any)?.title || 'this listing';
    if (!window.confirm(`Are you sure you want to ${action === 'Delete' ? 'permanently delete' : action === 'Approve' ? 'approve' : 'reject'} "${targetName}"?`)) return;

    try {
      if (tab === 'main') {
        const productRef = doc(db, 'products', id);
        if (action === 'Delete') {
          await deleteDoc(productRef);
          setSelectedProduct(null);
        } else {
          await updateDoc(productRef, { status: action === 'Approve' ? 'APPROVED' : 'REJECTED' });
          setSelectedProduct((prev: any) => prev?.productId === id || prev?.id === id ? { ...prev, status: action === 'Approve' ? 'APPROVED' : 'REJECTED' } : prev);
        }
      } else {
        const statusMap: Record<string, 'APPROVED' | 'REJECTED'> = { Approve: 'APPROVED', Reject: 'REJECTED' };
        if (action === 'Delete') {
          await PetProductService.deleteProduct(id);
          setSelectedProduct(null);
        } else {
          await PetProductService.updateProduct(id, { status: statusMap[action] } as any);
          setSelectedProduct((prev: any) => prev?.productId === id || prev?.id === id ? { ...prev, status: statusMap[action] } : prev);
        }
        const updated = await PetProductService.getAllProducts();
        setPetverseProducts(updated);
      }
    } catch (error) {
      console.error(`Failed to ${action} product ${id}:`, error);
      alert(`Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddProduct = async () => {
    if (!form.title && !form.productSubCategory) return;
    setAdding(true);
    try {
      if (tab === 'main') {
        await addDoc(collection(db, 'products'), {
          productId: '',
          sellerId: user?.uid || 'admin',
          sellerName: user?.displayName || 'Admin',
          sellerLocation: 'Admin Panel',
          productPrice: Number(form.price) || 0,
          productCategory: form.productCategory,
          productSubCategory: form.productSubCategory || form.title,
          productType: form.productType,
          productAge: 'Adult',
          productGender: 'Male',
          productMedia: form.imageUrl ? [form.imageUrl] : [],
          productDescription: form.description,
          productVaccinated: false,
          productIsPair: false,
          status: 'APPROVED',
          newSalesCount: 0,
          productReviews: []
        });
      } else {
        const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        await PetProductService.createProduct({
          title: form.title,
          slug: slug || 'product',
          categorySlug: form.categorySlug as any,
          brand: form.brand,
          price: Number(form.price) || 0,
          mrp: Number(form.mrp) || Number(form.price) || 0,
          discountPercent: 0,
          rating: 0,
          ratingCount: 0,
          stock: Number(form.stock) || 10,
          images: form.imageUrl ? [form.imageUrl] : [],
          description: form.description,
          specifications: [],
          variants: [],
          deliveryEtaDays: 3,
          tags: [],
          isFeatured: false,
          isBestSeller: false,
          isNewArrival: false,
          isFlashSale: false,
          animalType: form.animalType,
          sellerId: user?.uid || 'admin',
          sellerName: user?.displayName || 'Admin'
        });
        const updated = await PetProductService.getAllProducts();
        setPetverseProducts(updated);
      }
      setShowAddForm(false);
      setForm({ title: '', price: '', mrp: '', categorySlug: 'dogs', brand: 'Generic', stock: '10', animalType: 'Dog', imageUrl: '', description: '', productType: 'Pets', productCategory: 'Dog', productSubCategory: '' });
    } catch (error) {
      alert(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAdding(false);
    }
  };

  const productColumns = [
    { 
      header: 'Listing Entity', 
      key: 'productSubCategory',
      render: (p: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img 
                src={p.productMedia?.[0] || p.images?.[0] || ''} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
           </div>
           <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{p.productSubCategory || p.title}</div>
        </div>
      )
    },
    { 
      header: 'Supply Status', 
      key: 'status', 
      render: (p: any) => {
        const variants: Record<string, any> = {
          'APPROVED': 'success',
          'PENDING': 'warning',
          'REJECTED': 'error',
          'SOLD': 'neutral'
        };
        const labels: Record<string, string> = {
          'APPROVED': 'Live Hub',
          'PENDING': 'KYC Required',
          'REJECTED': 'Restricted',
          'SOLD': 'Fulfillment Closed'
        };
        return <Badge label={labels[p.status] || p.status || 'Live'} variant={variants[p.status] || 'success'} />;
      }
    },
    { 
      header: 'Unit Value', 
      key: 'productPrice', 
      render: (p: any) => (
        <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '15px' }}>₹{(p.productPrice || p.price || 0).toLocaleString()}</div>
      )
    },
    { 
      header: 'Listing Category', 
      key: 'productCategory',
      render: (p: any) => (
        <div style={{ fontWeight: 600, color: '#64748b', fontSize: '14px' }}>{p.productCategory || p.categorySlug || 'General'}</div>
      )
    }
  ];

  return (
    <div className="admin-dashboard-content">
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
             <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Product Control</h1>
             <p style={{ color: '#64748b', fontSize: '15px' }}>Govern marketplace inventory, curate catalogs, and enforce listing quality.</p>
          </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setShowAddForm(true)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiPlus /> Add Product
              </button>
              <select 
               value={filterType} 
               onChange={(e) => setFilterType(e.target.value)}
               style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600 }}
             >
               {uniqueTypes.map(t => <option key={t} value={t}>{t} Records</option>)}
             </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('main')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: tab === 'main' ? '#1e293b' : '#f1f5f9', color: tab === 'main' ? '#fff' : '#475569' }}>Main Site ({products.length})</button>
          <button onClick={() => setTab('petverse')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: tab === 'petverse' ? '#1e293b' : '#f1f5f9', color: tab === 'petverse' ? '#fff' : '#475569' }}>Petverse Store ({petverseProducts.length})</button>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Table data={filteredProducts} columns={productColumns} onRowClick={(p) => setSelectedProduct(p)} />
      </div>

      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div style={{ background: '#fff', width: '100%', maxWidth: '560px', borderRadius: '24px', padding: '40px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', position: 'relative', maxHeight: '90vh', overflow: 'auto' }}>
              <button onClick={() => setShowAddForm(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer' }}><FiX /></button>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Add {tab === 'main' ? 'Main Site' : 'Petverse'} Product</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Create a new listing in the {tab === 'main' ? 'products' : 'petverse_products'} collection.</p>

              {tab === 'petverse' ? (
                <>
                  <InputField label="Title" value={form.title} onChange={(v: string) => setForm({ ...form, title: v })} />
                  <InputField label="Price (₹)" type="number" value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
                  <InputField label="MRP (₹)" type="number" value={form.mrp} onChange={(v: string) => setForm({ ...form, mrp: v })} />
                  <InputField label="Stock" type="number" value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} />
                  <InputField label="Brand" value={form.brand} onChange={(v: string) => setForm({ ...form, brand: v })} />
                  <InputField label="Animal Type" value={form.animalType} onChange={(v: string) => setForm({ ...form, animalType: v })} />
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Category</label>
                    <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff' }}>
                      {['dogs','cats','birds','fish','rabbit','horse','cow','accessories','food','medicine','supplements','toys','beds','clothes','training','cleaning','healthcare'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <InputField label="Image URL" value={form.imageUrl} onChange={(v: string) => setForm({ ...form, imageUrl: v })} />
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                </>
              ) : (
                <>
                  <InputField label="Product Subcategory / Breed" value={form.productSubCategory} onChange={(v: string) => setForm({ ...form, productSubCategory: v })} />
                  <InputField label="Price (₹)" type="number" value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Product Type</label>
                    <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff' }}>
                      <option value="Pets">Pets</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Toys">Toys</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Category</label>
                    <select value={form.productCategory} onChange={(e) => setForm({ ...form, productCategory: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff' }}>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Fish">Fish</option>
                      <option value="Small Pets">Small Pets</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <InputField label="Image URL" value={form.imageUrl} onChange={(v: string) => setForm({ ...form, imageUrl: v })} />
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                </>
              )}

              <button onClick={handleAddProduct} disabled={adding} style={{ width: '100%', padding: '14px', background: adding ? '#94a3b8' : '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: adding ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
                {adding ? 'Creating...' : 'Create Product'}
              </button>
           </div>
        </div>
      )}

      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div style={{ background: '#fff', width: '100%', maxWidth: '800px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer', zIndex: 10 }}
              >
                <FiX />
              </button>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
                 <div style={{ padding: '40px', background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                       <img 
                          src={(selectedProduct as any).productMedia?.[0] || (selectedProduct as any).images?.[0] || ''} 
                          alt="" 
                          style={{ width: '100%', aspectRatio: '1', borderRadius: '20px', objectFit: 'cover', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                       />
                    </div>
                 </div>

                  <div style={{ padding: '40px' }}>
                     <header style={{ marginBottom: '32px' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Inventory Operations Registry</div>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{(selectedProduct as any).productSubCategory || (selectedProduct as any).title}</h2>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{(selectedProduct as any).productCategory || (selectedProduct as any).categorySlug} • {(selectedProduct as any).productType || 'Standard'}</div>
                     </header>

                     <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '20px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Commercial Valuation</div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb' }}>₹{((selectedProduct as any).productPrice || (selectedProduct as any).price || 0).toLocaleString()}</div>
                     </div>

                     <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                           {selectedProduct.status !== 'APPROVED' && (
                             <button onClick={() => handleAction(selectedProduct.productId || selectedProduct.id, 'Approve')} style={{ flex: 1, padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                               <FiShield /> Approve Listing
                             </button>
                           )}
                           {selectedProduct.status !== 'REJECTED' && (
                             <button onClick={() => handleAction(selectedProduct.productId || selectedProduct.id, 'Reject')} style={{ flex: 1, padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                               Reject Listing
                             </button>
                           )}
                        </div>
                        <button onClick={() => handleAction(selectedProduct.productId || selectedProduct.id, 'Delete')} style={{ padding: '12px', background: '#fff', color: '#dc2626', border: '2px solid #fecaca', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <FiTrash2 /> Permanently Delete
                        </button>
                     </div>
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
