import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/features/admin/AdminUsers'));
const AdminUserDossier = lazy(() => import('@/features/admin/AdminUserDossier'));
const AdminSellers = lazy(() => import('@/features/admin/AdminSellers'));
const AdminProducts = lazy(() => import('@/features/admin/AdminProducts'));
const AdminOrders = lazy(() => import('@/features/admin/AdminOrders'));
const AdminPayments = lazy(() => import('@/features/admin/AdminPayments'));
const AdminAnalytics = lazy(() => import('@/features/admin/AdminAnalytics'));
const AdminCoupons = lazy(() => import('@/features/admin/AdminCoupons'));
const AdminSettings = lazy(() => import('@/features/admin/AdminSettings'));

/**
 * Admin Portal Route Configuration.
 */
export const adminRoutes: RouteObject[] = [
  {
    index: true,
    element: <AdminDashboard />,
  },
  {
    path: 'dashboard',
    element: <AdminDashboard />,
  },
  {
    path: 'users',
    element: <AdminUsers />,
  },
  {
    path: 'users/:id',
    element: <AdminUserDossier />,
  },
  {
    path: 'sellers',
    element: <AdminSellers />,
  },
  {
    path: 'products',
    element: <AdminProducts />,
  },
  {
    path: 'orders',
    element: <AdminOrders />,
  },
  {
    path: 'payments',
    element: <AdminPayments />,
  },
  {
    path: 'analytics',
    element: <AdminAnalytics />,
  },
  {
    path: 'coupons',
    element: <AdminCoupons />,
  },
  {
    path: 'settings',
    element: <AdminSettings />,
  },
];
