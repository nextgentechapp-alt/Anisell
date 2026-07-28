import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiStar, FiMessageSquare, FiPlayCircle, FiCalendar, FiMapPin, FiX, FiSend } from 'react-icons/fi';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';
import { MdEmail, MdVerified } from 'react-icons/md';
import { ProductCard } from '@/components/ui/ProductCard';
import { useSearchData } from '@/hooks/useSearchData';
import { InquiryService } from '@/services/api/InquiryService';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { Product, User, Review } from '@/types';
import './ProductDetail.css';

import { useSEO } from '@/hooks/useSEO';

// --- Sub-Components ---


/**
 * Review Item Component
 */
const ReviewCard: React.FC<{ review: any; user: User | null }> = ({ review, user }) => (
  <div className="review-card">
    <div className="review-user-info">
      <div className="review-user-avatar">
        <img
          src={user?.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'}
          alt={user?.displayName || 'User'}
          className="review-avatar-img"
        />
      </div>
      <div className="user-details">
        <span className="user-name">{user?.displayName || 'Anonymous'}</span>
        <span className="review-date">{review.datetime}</span>
      </div>
      <div className="review-rating">
        {[...Array(5)].map((_, i) => (
          <FiStar key={i} className={i < review.rating ? "star-filled" : "star-empty"} />
        ))}
      </div>
    </div>
    <p className="review-comment">{review.comment}</p>
  </div>
);

/**
 * Contact Seller Modal — captures buyer info and sends to admin queue
 */
const ContactSellerModal: React.FC<{
  product: Product;
  onClose: () => void;
}> = ({ product, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await InquiryService.saveInquiry({
        productId: product.productId,
        productName: product.productSubCategory,
        productImage: product.productMedia?.[0] || '',
        productPrice: product.productPrice,
        sellerName: product.sellerName || 'Verified Merchant',
        buyerName: form.name,
        buyerEmail: form.email,
        buyerPhone: form.phone,
        message: form.message || 'No specific inquiries provided.'
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inquiry-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="inquiry-card">
        <div className="inquiry-header">
          <div>
            <h3 className="inquiry-title">Contact Seller</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Your inquiry will be reviewed by our team first</p>
          </div>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        {submitted ? (
          <div className="success-view">
            <div className="success-icon">✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Inquiry Sent!</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6 }}>
              Your request for <strong>{product.productSubCategory}</strong> has been received.
              Our admin team will verify and forward it to the seller within 24 hours.
            </p>
            <button onClick={onClose} className="btn-post-review" style={{ marginTop: 24 }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="inquiry-form" style={{ padding: 0 }}>
            <div className="inquiry-product-strip">
              <img src={product.productMedia?.[0]} alt="" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{product.productSubCategory}</div>
                <div className="price">₹{product.productPrice.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Seller: {product.sellerName}</div>
              </div>
            </div>

            <div style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && (
                <div style={{ background: '#fff1f1', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#dc2626' }}>
                  {error}
                </div>
              )}

              {[
                { name: 'name', label: 'Your Name *', type: 'text', placeholder: 'e.g. Arjun Kumar' },
                { name: 'email', label: 'Email Address *', type: 'email', placeholder: 'e.g. arjun@email.com' },
                { name: 'phone', label: 'Phone Number *', type: 'tel', placeholder: 'e.g. +91 9988776655' },
              ].map(field => (
                <div key={field.name}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {field.label}
                  </label>
                  <input
                    name={field.name} type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Message (optional)
                </label>
                <textarea
                  name="message"
                  placeholder="Any specific questions or preferences?"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
                🔒 Your details are shared only with the verified seller after admin review.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="btn-contact-seller"
                style={{ width: '100%', margin: 0 }}
              >
                <FiSend /> {loading ? 'Sending...' : 'Send Marketplace Inquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, users, loading } = useSearchData();
  const [product, setProduct] = useState<Product | null>(null);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (!loading && products.length > 0) {
      const found = products.find(p => p.productId === id);
      setProduct(found || null);
      setActiveMediaIndex(0);
    }
  }, [id, products, loading]);

  const formatLocation = (loc?: string) => {
    if (!loc || loc === 'Global Marketplace') return 'Global';
    const parts = loc.split(',').map(p => p.trim()).filter(p => p.length > 0);
    const hasDigits = (s: string) => /\d/.test(s);
    let cityIndex = parts.length - 2;
    let stateIndex = parts.length - 1;
    if (parts.length >= 3 && hasDigits(parts[parts.length - 1])) {
      cityIndex = parts.length - 3;
      stateIndex = parts.length - 2;
    }
    return (cityIndex >= 0 && stateIndex >= 0) ? `${parts[cityIndex]}, ${parts[stateIndex]}` : loc;
  };

  const seoTitle = useMemo(() => {
    if (!product) return 'Pet Listing for Sale';
    const genderStr = product.productIsPair ? 'Pair' : product.productGender;
    const locationStr = formatLocation(product.sellerLocation);
    return `${product.productSubCategory} (${genderStr}) for Sale in ${locationStr}`;
  }, [product]);

  const seoDescription = useMemo(() => {
    if (!product) return '';
    const formattedPrice = product.productPrice.toLocaleString('en-IN');
    const locationStr = formatLocation(product.sellerLocation);
    const vaccinatedStr = product.productVaccinated ? 'fully vaccinated' : 'not vaccinated';
    return `Buy verified, healthy ${product.productSubCategory} in ${locationStr} for ₹${formattedPrice}. This pet is ${product.productAge} old, ${product.productGender.toLowerCase()}, and ${vaccinatedStr}. Secure breeder chat on Anisell.`;
  }, [product]);

  const seoKeywords = useMemo(() => {
    if (!product) return '';
    const locationStr = formatLocation(product.sellerLocation);
    return `buy ${product.productSubCategory.toLowerCase()} online, ${product.productSubCategory.toLowerCase()} puppies for sale, buy ${product.productSubCategory.toLowerCase()} in ${locationStr.toLowerCase()}, verified ${product.productSubCategory.toLowerCase()} breeders, anisell`;
  }, [product]);

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    canonical: product ? `https://anisell.in/product/${product.productId}` : undefined
  });

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.productCategory === product.productCategory && p.productId !== product.productId)
      .slice(0, 4);
  }, [product, products]);

  if (loading || !product) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const isVideo = (url: string) => url.toLowerCase().endsWith('.mp4');

  return (
    <div className="product-page">
      <main className="product-detail-container">
        <nav className="breadcrumb">
          <button onClick={() => navigate(-1)} className="back-btn"><FiChevronLeft /> Back to Search</button>
        </nav>

        <section className="product-main">
          {/* Visuals */}
          <div className="product-visuals">
            <div className="main-image-wrapper">
              {isVideo(product.productMedia[activeMediaIndex]) ? (
                <video src={product.productMedia[activeMediaIndex]} className="main-image" controls autoPlay loop muted />
              ) : (
                <img src={product.productMedia[activeMediaIndex]} alt="" className="main-image" />
              )}
            </div>
            <div className="thumbnail-list">
              {product.productMedia.map((url, idx) => (
                <div key={idx} className={`thumbnail ${idx === activeMediaIndex ? 'active' : ''}`} onClick={() => setActiveMediaIndex(idx)}>
                  {isVideo(url) ? <div className="video-thumbnail-placeholder"><FiPlayCircle className="play-icon" /></div> : <img src={url} alt="" />}
                </div>
              ))}
            </div>
          </div>

          {/* Info Panel */}
          <div className="product-info-panel">
            <div className="title-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <h1 className="product-page-title" style={{ margin: 0, fontSize: '32px' }}>
                {product.productSubCategory}
              </h1>
              <div 
                className={`gender-badge ${product.productIsPair ? 'pair' : (product.productGender.toLowerCase() === 'male' ? 'male' : 'female')}`} 
                style={{ marginBottom: 0, flexShrink: 0 }}
              >
                {product.productIsPair ? <FaVenusMars className="gender-icon" /> : (product.productGender.toLowerCase() === 'male' ? <FaMars className="gender-icon" /> : <FaVenus className="gender-icon" />)}
                <span className="gender-text">{product.productIsPair ? 'Pair' : product.productGender}</span>
              </div>
            </div>
            
            {authUser?.role === 'seller' && (
              <div style={{ 
                background: '#fef2f2', 
                border: '1px solid #fee2e2', 
                borderRadius: '8px', 
                padding: '10px 14px', 
                marginBottom: '20px',
                fontSize: '13px',
                color: '#991b1b',
                fontWeight: 500
              }}>
                Sellers cannot contact other sellers. Switching to a Buyer account is required for inquiries.
              </div>
            )}

            <div className="product-page-price">₹{product.productPrice.toLocaleString('en-IN')}</div>

            <div className="detail-section">
              <h3 className="section-heading">Description</h3>
              <p className="section-text">{product.productDescription}</p>
            </div>

            <div className="detail-section">
              <h3 className="section-heading">Specifications</h3>
              <ul className="spec-list">
                <li className="spec-list-item">
                  <MdVerified className={`spec-list-icon ${product.productVaccinated ? 'is-verified' : 'not-verified'}`} />
                  <span className="spec-label">Vaccinated:</span><span className="spec-value">{product.productVaccinated ? 'Yes' : 'No'}</span>
                </li>
                <li className="spec-list-item"><FiCalendar className="spec-list-icon" /><span className="spec-label">Age:</span><span className="spec-value">{product.productAge}</span></li>
                <li className="spec-list-item"><FiMapPin className="spec-list-icon" /><span className="spec-label">Location:</span><span className="spec-value">{formatLocation(product.sellerLocation)}</span></li>
              </ul>
            </div>

            <div className="action-button-group" style={{ display: 'flex' }}>
              <button 
                className="btn-contact-seller" 
                onClick={() => navigate(`/checkout/${product.productId}`)}
                style={{ width: '100%' }}
                disabled={authUser?.role === 'seller'}
              >
                <MdEmail /> {authUser?.role === 'seller' ? 'Seller Contact Disabled' : 'Contact Seller'}
              </button>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="related-section">
          <h2 className="related-title">Related Products</h2>
          <div className="related-products-grid">
            {related.map(item => <ProductCard key={item.productId} product={item} />)}
          </div>
        </section>

        {/* Reviews */}
        <section className="reviews-section">
          <h2 className="section-title-with-icon">
            <FiMessageSquare className="title-icon" /> <span>Reviews ({product.productReviews?.length || 0})</span>
          </h2>
          <div className="reviews-layout">
            <div className="reviews-list" style={{ flex: 1.5 }}>
              {product.productReviews?.length ? product.productReviews.map((r, i) => (
                <ReviewCard key={i} review={r} user={users.find(u => u.uid === r.userId) || null} />
              )) : <div className="no-reviews"><p>No reviews yet.</p></div>}
            </div>
            <div className="post-review-card" style={{ flex: 1 }}>
              <h3>Post a Review</h3>
              <div className="rating-selector">
                <span>Rating:</span>
                <div className="stars-input">
                  {[1,2,3,4,5].map(num => (
                    <FiStar key={num} className={num <= rating ? "star-input-icon active" : "star-input-icon"} onClick={() => setRating(num)} />
                  ))}
                </div>
              </div>
              <textarea placeholder="Share your thoughts..." className="review-textarea" value={newComment} onChange={e => setNewComment(e.target.value)} />
              <button className="btn-post-review" disabled={reviewSubmitting} onClick={async () => {
                if (!authUser) { alert('Please log in to submit a review.'); return; }
                if (rating === 0) { alert('Please select a rating.'); return; }
                if (!newComment.trim()) { alert('Please write a comment.'); return; }
                setReviewSubmitting(true);
                try {
                  const newReview: Review = {
                    userId: authUser.uid,
                    rating,
                    comment: newComment.trim(),
                    datetime: new Date().toLocaleDateString(),
                  };
                  const productRef = doc(db, 'products', product.productId);
                  await updateDoc(productRef, {
                    productReviews: arrayUnion(newReview)
                  });
                  setNewComment('');
                  setRating(0);
                } catch (err: any) {
                  console.error('Review submission failed:', err);
                  alert('Failed to submit review. Please try again.');
                } finally {
                  setReviewSubmitting(false);
                }
              }}>{reviewSubmitting ? 'Submitting...' : 'Submit Review'}</button>
            </div>
          </div>
        </section>
      </main>

      {/* Contact Seller Modal */}
      {contactOpen && (
        <ContactSellerModal product={product} onClose={() => setContactOpen(false)} />
      )}
    </div>
  );
};

export default ProductDetail;
