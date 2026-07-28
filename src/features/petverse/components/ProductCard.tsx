import React from 'react';
import { Link } from 'react-router-dom';
import { PETVERSE_ROUTES } from '@/constants/petverseRoutes';
import { usePetverseWishlist } from '@/context/PetverseWishlistContext';
import type { PetProduct } from '@/types/petverse';

interface ProductCardProps {
  product: PetProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isWishlisted, toggleWishlist } = usePetverseWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <Link to={PETVERSE_ROUTES.productPath(product.id)} className="pv-product-card">
      <div className="pv-product-image-wrap">
        <img src={product.images[0]} alt={product.title} loading="lazy" />
        {product.isFlashSale && <span className="pv-badge-pill pv-badge-flash">Flash Sale</span>}
        {!product.isFlashSale && product.isNewArrival && <span className="pv-badge-pill">New</span>}
        <button
          type="button"
          className="pv-wishlist-btn"
          aria-label="Toggle wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="pv-product-body">
        <span className="pv-product-brand">{product.brand}</span>
        <span className="pv-product-title">{product.title}</span>
        <span className="pv-product-rating">★ {product.rating} ({product.ratingCount})</span>
        <div className="pv-product-price-row">
          <span className="pv-price">₹{product.price.toLocaleString('en-IN')}</span>
          {product.mrp > product.price && <span className="pv-mrp">₹{product.mrp.toLocaleString('en-IN')}</span>}
          {product.discountPercent > 0 && <span className="pv-discount">{product.discountPercent}% off</span>}
        </div>
        <span className="pv-delivery-eta">Delivery in {product.deliveryEtaDays} days</span>
      </div>
    </Link>
  );
};
