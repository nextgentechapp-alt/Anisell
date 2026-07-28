import React from 'react';
import { Link } from 'react-router-dom';
import { FaMars, FaVenus, FaVenusMars } from 'react-icons/fa';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import type { Product } from '@/types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  showStatus?: boolean;
}

/**
 * Shared ProductCard UI Component.
 * Refined per user design specifications with refined hover physics,
 * integrated gender symbology, and localized metadata.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showStatus = false
}) => {
  const isMale = product.productGender?.toLowerCase() === 'male';
  
  // Display only the city and state from the location string (e.g., "Mumbai, Maharashtra")
  const formatLocation = (loc?: string) => {
    if (!loc || loc === 'Global Marketplace') return 'Global Hub';
    const parts = loc.split(',').map(p => p.trim()).filter(p => p.length > 0);
    
    // Reverse traverse to find the state and city (skipping PIN codes)
    const isPin = (s: string) => /^\d+$/.test(s);
    const geoParts = parts.filter(p => !isPin(p));
    
    if (geoParts.length >= 2) {
      const state = geoParts[geoParts.length - 1];
      const city = geoParts[geoParts.length - 2];
      return `${city}, ${state}`;
    }
    
    return loc;
  };

  // Standardize biological age to a single temporal unit (Years, Months, or Days)
  const formatAge = (ageStr?: string) => {
    if (!ageStr) return 'N/A';
    
    const years = parseInt((ageStr.match(/(\d+)\s*Years?/i) || [])[1] || '0');
    const months = parseInt((ageStr.match(/(\d+)\s*Months?/i) || [])[1] || '0');
    const days = parseInt((ageStr.match(/(\d+)\s*Days?/i) || [])[1] || '0');

    if (years > 0) return `${years} ${years === 1 ? 'Year' : 'Years'}`;
    if (months > 0) return `${months} ${months === 1 ? 'Month' : 'Months'}`;
    if (days > 0) return `${days} ${days === 1 ? 'Day' : 'Days'}`;
    
    return ageStr; // Fallback to raw string if no patterns match
  };

  const displayLocation = formatLocation(product.sellerLocation);
  const displayAge = formatAge(product.productAge);

  return (
    <Link 
      to={showStatus ? '#' : `/product/${product.productId}`} 
      className={styles.card}
      onClick={(e) => showStatus && e.preventDefault()}
    >
      {/* Media Portfolio */}
      <div className={styles.mediaWrapper}>
        <img 
          src={product.productMedia[0] || 'https://via.placeholder.com/300x300?text=AniSell'} 
          alt={product.productSubCategory} 
          className={styles.image}
          loading="lazy"
        />
      </div>

      {/* Information Section */}
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>
            {product.productSubCategory}
            
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '8px' }}>
              {product.productVaccinated && (
                <MdVerified className={styles.verifiedIcon} title="Verified / Vaccinated" />
              )}
              {product.productIsPair ? (
                <FaVenusMars className={styles.genderIconPair} title="Bonded Pair" />
              ) : isMale ? (
                <FaMars className={styles.genderIconMale} title="Male" />
              ) : (
                <FaVenus className={styles.genderIconFemale} title="Female" />
              )}
            </div>
          </h2>
        </div>
        
        <p className={styles.description}>{product.productDescription || `A healthy and playful ${product.productSubCategory} pet.`}</p>

        <div className={styles.priceSection}>
          <span className={styles.priceCurrency}>₹</span>
          <span className={styles.priceValue}>{product.productPrice.toLocaleString('en-IN')}</span>
        </div>

        {/* Info Chips Footer */}
        <footer className={styles.footer}>
          <div className={styles.infoChip}>
            <FiMapPin className={styles.chipIcon} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayLocation}</span>
          </div>
          <div className={styles.infoChip}>
            <FiCalendar className={styles.chipIcon} />
            <span>{displayAge}</span>
          </div>
        </footer>
      </div>
    </Link>
  );
};
