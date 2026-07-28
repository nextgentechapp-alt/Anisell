import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const SellerDashboard = lazy(() => import('@/features/seller/SellerDashboard'));
const SellerReviews = lazy(() => import('@/features/seller/SellerReviews'));
const SellerEdit = lazy(() => import('@/features/seller/SellerEdit'));
const SellerSettings = lazy(() => import('@/features/seller/SellerSettings'));

/**
 * Merchant Portal Route Configuration.
 */
export const sellerRoutes: RouteObject[] = [
  {
    index: true,
    element: <SellerDashboard />,
  },
  {
    path: 'products',
    element: <SellerDashboard />,
  },
  {
    path: 'orders',
    element: <SellerDashboard />,
  },
  {
    path: 'reviews',
    element: <SellerReviews />,
  },
  {
    path: 'edit',
    element: <SellerEdit />,
  },
  {
    path: 'settings',
    element: <SellerSettings />,
  },
];
