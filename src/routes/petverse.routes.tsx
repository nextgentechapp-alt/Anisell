import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const PetverseHome = lazy(() => import('@/features/petverse/public/PetverseHome'));
const PetverseProductListing = lazy(() => import('@/features/petverse/public/PetverseProductListing'));
const PetverseProductDetail = lazy(() => import('@/features/petverse/public/PetverseProductDetail'));
const PetverseCart = lazy(() => import('@/features/petverse/public/PetverseCart'));
const PetverseWishlist = lazy(() => import('@/features/petverse/public/PetverseWishlist'));
const PetverseCheckout = lazy(() => import('@/features/petverse/public/PetverseCheckout'));
const PetverseOrders = lazy(() => import('@/features/petverse/public/PetverseOrders'));
const PetverseOrderDetail = lazy(() => import('@/features/petverse/public/PetverseOrderDetail'));
const PetverseAdminDashboard = lazy(() => import('@/features/petverse/admin/PetverseAdminDashboard'));
const PetverseSellerDashboard = lazy(() => import('@/features/petverse/seller/PetverseSellerDashboard'));

// Enhancement feature pages
const EnhancementsHub = lazy(() => import('@/features/petverse/enhancements/EnhancementsHub'));
const ProductComparison = lazy(() => import('@/features/petverse/enhancements/ProductComparison'));
const ReviewSystem = lazy(() => import('@/features/petverse/enhancements/ReviewSystem'));
const OrderTrackingTimeline = lazy(() => import('@/features/petverse/enhancements/OrderTrackingTimeline'));
const PetProfiles = lazy(() => import('@/features/petverse/enhancements/PetProfiles'));
const SubscriptionPurchase = lazy(() => import('@/features/petverse/enhancements/SubscriptionPurchase'));
const LoyaltyRewards = lazy(() => import('@/features/petverse/enhancements/LoyaltyRewards'));
const CouponSystem = lazy(() => import('@/features/petverse/enhancements/CouponSystem'));
const ReferralSystem = lazy(() => import('@/features/petverse/enhancements/ReferralSystem'));
const BlogSection = lazy(() => import('@/features/petverse/enhancements/BlogSection'));
const DeliveryEstimation = lazy(() => import('@/features/petverse/enhancements/DeliveryEstimation'));

/**
 * Isolated route tree mounted at '/petverse'. Nothing here touches
 * AniSell's `public.routes.tsx`, `admin.routes.tsx`, `seller.routes.tsx`,
 * or `user.routes.tsx`.
 */
export const petverseRoutes: RouteObject[] = [
  { index: true, element: <PetverseHome /> },
  { path: 'products', element: <PetverseProductListing /> },
  { path: 'category/:categorySlug', element: <PetverseProductListing /> },
  { path: 'product/:productId', element: <PetverseProductDetail /> },
  { path: 'cart', element: <PetverseCart /> },
  { path: 'wishlist', element: <PetverseWishlist /> },
  { path: 'checkout', element: <PetverseCheckout /> },
  { path: 'orders', element: <PetverseOrders /> },
  { path: 'orders/:orderId', element: <PetverseOrderDetail /> },
  // Lightweight in-module gates: full pages check useAuth() themselves and
  // prompt login inline, so PetVerse stays browsable without an account
  // (matching the "Flipkart Grocery inside Flipkart" browsing experience).
  { path: 'admin', element: <PetverseAdminDashboard /> },
  { path: 'seller', element: <PetverseSellerDashboard /> },
  // Enhancement feature pages
  { path: 'enhancements', element: <EnhancementsHub /> },
  { path: 'compare', element: <ProductComparison /> },
  { path: 'reviews/:productId', element: <ReviewSystem /> },
  { path: 'order-tracking/:orderId', element: <OrderTrackingTimeline /> },
  { path: 'pets', element: <PetProfiles /> },
  { path: 'subscriptions', element: <SubscriptionPurchase /> },
  { path: 'loyalty', element: <LoyaltyRewards /> },
  { path: 'coupons', element: <CouponSystem /> },
  { path: 'refer', element: <ReferralSystem /> },
  { path: 'blog', element: <BlogSection /> },
  { path: 'delivery', element: <DeliveryEstimation /> },
];
