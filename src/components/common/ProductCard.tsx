import React from 'react';
import './ProductCard.css';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';
import { FiCalendar, FiMapPin} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import type { Product } from '@/types';

// --- Types ---
interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isMale = product.productGender.toLowerCase() === 'male';
  
  // Navigation handler
  const handleCardClick = () => {
    window.open(`/product/${product.productId}`, '_blank');
  };

  return (
    <article className="product-card" onClick={handleCardClick}>
      {/* Media Content */}
      <div className="product-card-image-section">
        <img 
          src={product.productMedia[0]} 
          alt={product.productSubCategory} 
          className="product-card-image" 
        />
      </div>
      
      {/* Information Section */}
      <div className="product-card-body">
        <div className="product-card-header">
          <h2 className="product-card-title">
            {product.productSubCategory}
            
            {/* Badges/Icons Row */}
            <div className="card-badge-row">
              {product.productVaccinated && (
                <MdVerified className="verified-badge-icon" title="Vaccinated" />
              )}
              {product.productIsPair ? (
                <FaVenusMars className="gender-icon-pair" />
              ) : isMale ? (
                <FaMars className="gender-icon-male" />
              ) : (
                <FaVenus className="gender-icon-female" />
              )}
            </div>
          </h2>
        </div>
        
        <p className="product-card-description">{product.productDescription}</p>

        <div className="product-card-price-section">
          <span className="price-currency">₹</span>
          <span className="price-value">{product.productPrice.toLocaleString('en-IN')}</span>
        </div>

        {/* Info Chips Footer */}
        <footer className="product-card-footer">
          <div className="info-chip">
            <FiMapPin className="chip-icon" />
            <span>{product.sellerLocation || 'Bangalore, KA'}</span>
          </div>
          <div className="info-chip">
            <FiCalendar className="chip-icon" />
            <span>{product.productAge}</span>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default ProductCard;
