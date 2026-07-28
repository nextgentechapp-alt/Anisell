import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Loading } from '@/components/common/Loading';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { ROUTES } from '@/constants/routes';
import { isAdminSubdomain, getAdminSubdomainUrl, isVercel } from '@/utils/subdomain';
import { PetverseProviders } from '@/context/PetverseProviders';

// --- Specialized Route Configs ---
import { adminRoutes } from './admin.routes';
import { sellerRoutes } from './seller.routes';
import { userRoutes } from './user.routes';
import { publicRoutes } from './public.routes';
import { petverseRoutes } from './petverse.routes';

// --- Portal Layouts ---
const RootLayout = lazy(() => import('@/layouts/RootLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const SellerLayout = lazy(() => import('@/layouts/SellerLayout'));
const PetverseLayout = lazy(() => import('@/layouts/PetverseLayout'));
const SellerOnboarding = lazy(() => import('@/features/seller/SellerOnboarding'));
const BuyerOnboarding = lazy(() => import('@/features/user/BuyerOnboarding'));
const UserLayout = lazy(() => import('@/layouts/UserLayout'));
const Checkout = lazy(() => import('@/features/user/Checkout'));
const Login = lazy(() => import('@/features/public/Login'));

/**
 * Platform routing engine.
 * Orchestrates Role-Based Access Control (RBAC) and performance-optimized code splitting 
 * across distinct Admin, Seller, and Customer portals through specialized route modules.
 */
// --- 1. CORE MARKETPLACE ROUTER ---
const mainRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading fullScreen={true} />}>
        <RootLayout />
      </Suspense>
    ),
    children: publicRoutes,
  },
  // --- PetVerse Store: isolated module, mounted additively ---
  {
    path: '/petverse',
    element: (
      <Suspense fallback={<Loading fullScreen={true} />}>
        <PetverseProviders>
          <PetverseLayout />
        </PetverseProviders>
      </Suspense>
    ),
    children: petverseRoutes,
  },
  {
    path: '/seller-profile',
    element: (
      <ProtectedRoute allowedRoles={['seller']}>
        <Suspense fallback={<Loading />}>
          <SellerLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: sellerRoutes,
  },

  // 4. --- Seller Onboarding Identity (Strict Restriction intercept) ---
  {
    path: '/seller-onboarding',
    element: (
      <ProtectedRoute allowedRoles={['seller']}>
        <Suspense fallback={<Loading />}>
          <RootLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SellerOnboarding /> }
    ]
  },

  // 4a. --- Buyer Onboarding Identity (Strict Restriction intercept) ---
  {
    path: '/buyer-onboarding',
    element: (
      <ProtectedRoute allowedRoles={['buyer']}>
        <Suspense fallback={<Loading />}>
          <RootLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <BuyerOnboarding /> }
    ]
  },

  // 5. --- Customer Experience (Account Management) ---
  {
    path: '/profile',
    element: (
      <ProtectedRoute allowedRoles={['buyer']}>
        <Suspense fallback={<Loading />}>
          <UserLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: userRoutes,
  },

  // 5. --- Checkout Portal (Secure Acquisition) ---
  {
    path: ROUTES.CHECKOUT,
    element: (
      <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
        <Suspense fallback={<Loading fullScreen={true} />}>
          <Checkout />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: isVercel() ? <Navigate to="/admin/profile" replace /> : <Navigate to={getAdminSubdomainUrl()} replace />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

// --- 2. DEDICATED ADMIN SUBDOMAIN ROUTER ---
const createAdminRouter = (isVercelDeployment: boolean) => createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<Loading fullScreen={true} />}>
        <RootLayout />
      </Suspense>
    ),
    children: [{ index: true, element: <Login /> }]
  },
  {
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Suspense fallback={<Loading />}>
          <AdminLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/profile" replace /> },
      ...adminRoutes
    ]
  },
  {
    path: '/profile', // Root profile for admin on subdomain
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Suspense fallback={<Loading />}>
          <AdminLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: adminRoutes
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
], isVercelDeployment ? { basename: '/admin' } : {});

export const AppRouter: React.FC = () => {
  const isAdm = isAdminSubdomain();
  const onVercel = isVercel();
  const adminRouter = React.useMemo(() => createAdminRouter(onVercel), [onVercel]);
  
  React.useEffect(() => {
    if (isAdm) {
      // Prevent indexation of any admin subdomains (e.g. admin.anisell.in, admin.localhost)
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow, noarchive');
    }
  }, [isAdm]);
  
  return <RouterProvider router={isAdm ? adminRouter : mainRouter} />;
};
