/**
 * Centralized Route Map for the AniSell Platform.
 * Using typed constants ensures type-safety during navigation and route definition.
 */
export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/seller-register',
  MARKETPLACE: '/result',
  PRODUCT: '/product/:id',
  
  // Customer Routes (Role: buyer)
  USER_PROFILE: '/profile',
  CHECKOUT: '/checkout/:id',
  ORDER_DETAIL: '/profile/order/:id',
  
  // Seller Routes (Role: seller)
  SELLER_DASHBOARD: '/seller-profile',
  SELLER_STORE: '/seller-profile/:id',
  
  // Admin Routes (Role: admin)
  ADMIN_DASHBOARD: '/admin',
} as const;

export type RouteValue = typeof ROUTES[keyof typeof ROUTES];
