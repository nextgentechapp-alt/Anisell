import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const UserProfile = lazy(() => import('@/features/user/Profile'));
const OrderDetail = lazy(() => import('@/features/user/OrderDetail'));
const UserEdit = lazy(() => import('@/features/user/UserEdit'));
const UserAddresses = lazy(() => import('@/features/user/UserAddresses'));
const UserWishlist = lazy(() => import('@/features/user/UserWishlist'));
const UserSettings = lazy(() => import('@/features/user/UserSettings'));

/**
 * Customer Portal Route Configuration.
 */
export const userRoutes: RouteObject[] = [
  {
    index: true,
    element: <UserProfile />,
  },
  {
    path: 'order/:id',
    element: <OrderDetail />,
  },
  {
    path: 'edit',
    element: <UserEdit />,
  },
  {
    path: 'addresses',
    element: <UserAddresses />,
  },
  {
    path: 'wishlist',
    element: <UserWishlist />,
  },
  {
    path: 'settings',
    element: <UserSettings />,
  },
];
