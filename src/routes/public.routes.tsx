import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const Home = lazy(() => import('@/features/public/Home'));
const SearchResults = lazy(() => import('@/features/public/SearchResults'));
const ProductDetail = lazy(() => import('@/features/public/ProductDetail'));
const SellerRegister = lazy(() => import('@/features/public/SellerRegister'));
const Login = lazy(() => import('@/features/public/Login'));

/**
 * Public Marketplace Route Configuration.
 */
export const publicRoutes: RouteObject[] = [
  { path: ROUTES.HOME, element: <Home /> },
  { path: ROUTES.MARKETPLACE, element: <SearchResults /> },
  { path: ROUTES.PRODUCT, element: <ProductDetail /> },
  { path: ROUTES.REGISTER, element: <SellerRegister /> },
  { path: ROUTES.LOGIN, element: <Login /> },
];
