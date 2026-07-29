/**
 * PetVerse Store — Type Definitions
 * -----------------------------------------------------------------------
 * This module is completely isolated from AniSell's core `types/` folder.
 * Nothing here is imported by, or imports from, the existing marketplace
 * types so that AniSell's product/order/user types remain untouched.
 */

export type PetVerseCategorySlug =
  | 'dogs'
  | 'cats'
  | 'birds'
  | 'fish'
  | 'rabbit'
  | 'horse'
  | 'cow'
  | 'accessories'
  | 'food'
  | 'medicine'
  | 'supplements'
  | 'toys'
  | 'beds'
  | 'clothes'
  | 'training'
  | 'cleaning'
  | 'healthcare';

export interface PetCategory {
  id: string;
  slug: PetVerseCategorySlug;
  name: string;
  icon: string; // emoji fallback icon (no external asset dependency)
  heroImage: string;
  productCount?: number;
}

export interface PetBrand {
  id: string;
  name: string;
  logo: string;
}

export interface PetProductVariant {
  id: string;
  label: string; // e.g. "1kg", "Small / Red"
  priceDelta: number; // added/subtracted from base price
  stock: number;
}

export interface PetProductSpecification {
  label: string;
  value: string;
}

export interface PetProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  createdAt: string; // ISO string
  verifiedPurchase: boolean;
}

export interface PetSeller {
  id: string;
  storeName: string;
  rating: number;
  location: string;
}

export interface PetProduct {
  id: string;
  title: string;
  slug: string;
  categorySlug: PetVerseCategorySlug;
  brand: string;
  price: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  stock: number;
  images: string[];
  description: string;
  specifications: PetProductSpecification[];
  variants: PetProductVariant[];
  deliveryEtaDays: number;
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFlashSale: boolean;
  animalType: string; // used for the "Animal Type" filter
  weightKg?: number;
  ageGroup?: 'puppy/kitten' | 'adult' | 'senior' | 'all-ages';
  sellerId: string;
  sellerName: string;
  createdAt?: string;
}

export interface PetCartLine {
  productId: string;
  variantId?: string;
  quantity: number;
  addedAt: string;
}

export interface PetWishlistLine {
  productId: string;
  addedAt: string;
}

export type PetOrderStatus =
  | 'placed'
  | 'confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export interface PetOrderItem {
  productId: string;
  variantId?: string;
  title: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

export interface PetOrder {
  id: string;
  userId: string;
  items: PetOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: PetOrderStatus;
  couponCode?: string;
  shippingAddress: PetAddress;
  paymentMethod: 'cod' | 'card' | 'upi' | 'netbanking';
  paymentStatus: 'pending' | 'pending_verification' | 'paid' | 'failed' | 'refunded';
  utr?: string;
  placedAt: string;
  statusHistory: { status: PetOrderStatus; at: string }[];
  trackingId?: string;
}

export interface PetAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PetCoupon {
  code: string;
  description: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt: string;
  active: boolean;
}

export interface PetFilterState {
  priceMin?: number;
  priceMax?: number;
  brands: string[];
  animalTypes: string[];
  ratingsMin?: number;
  inStockOnly?: boolean;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}
