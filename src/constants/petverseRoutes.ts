/**
 * Centralized Route Map for the PetVerse Store module.
 * Kept entirely separate from '@/constants/routes' (AniSell's core routes)
 * so nothing existing is modified.
 */
export const PETVERSE_ROUTES = {
  HOME: '/petverse',
  PRODUCTS: '/petverse/products',
  CATEGORY: '/petverse/category/:categorySlug',
  categoryPath: (slug: string) => `/petverse/category/${slug}`,
  PRODUCT_DETAIL: '/petverse/product/:productId',
  productPath: (id: string) => `/petverse/product/${id}`,
  CART: '/petverse/cart',
  WISHLIST: '/petverse/wishlist',
  CHECKOUT: '/petverse/checkout',
  ORDERS: '/petverse/orders',
  ORDER_DETAIL: '/petverse/orders/:orderId',
  orderPath: (id: string) => `/petverse/orders/${id}`,
  PROFILE: '/petverse/profile',
  ADMIN: '/petverse/admin',
  SELLER: '/petverse/seller',
  ENHANCEMENTS: '/petverse/enhancements',
  COMPARE: '/petverse/compare',
  REVIEWS: '/petverse/reviews/:productId',
  reviewsPath: (id: string) => `/petverse/reviews/${id}`,
  ORDER_TRACKING: '/petverse/order-tracking/:orderId',
  orderTrackingPath: (id: string) => `/petverse/order-tracking/${id}`,
  PETS: '/petverse/pets',
  SUBSCRIPTIONS: '/petverse/subscriptions',
  LOYALTY: '/petverse/loyalty',
  COUPONS: '/petverse/coupons',
  REFER: '/petverse/refer',
  BLOG: '/petverse/blog',
  DELIVERY: '/petverse/delivery',
} as const;
