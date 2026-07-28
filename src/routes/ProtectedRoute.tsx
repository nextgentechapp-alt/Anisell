import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/common/Loading';
import { ROUTES } from '@/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('buyer' | 'seller' | 'admin')[];
}

/**
 * Higher-Order Component for Role-Based Access Control (RBAC).
 * Handles authentication checks, generic onboarding interception, and role-specific redirection.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, isProfileComplete } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen={true} />;
  }

  // 1. Not Authenticated
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Generic Onboarding Constraint Flow (Buyer & Seller)
  if (!isProfileComplete) {
    const targetOnboarding = user.role === 'seller' ? '/seller-onboarding' : '/buyer-onboarding';
    
    if (location.pathname !== targetOnboarding) {
      return <Navigate to={targetOnboarding} replace />;
    }
  }

  // If profile is complete but trying to access onboarding, force dashboard
  if (isProfileComplete && (location.pathname === '/seller-onboarding' || location.pathname === '/buyer-onboarding')) {
     const redirectPath = user.role === 'admin' 
       ? ROUTES.ADMIN_DASHBOARD 
       : (user.role === 'seller' ? ROUTES.SELLER_DASHBOARD : ROUTES.USER_PROFILE);
     return <Navigate to={redirectPath} replace />;
  }

  // 3. System Role Check
  if (allowedRoles) {
    if (!allowedRoles.includes(user.role as any)) {
      // Redirect to their respective dashboards if they have their own but trying to access unauthorized one
      const redirectPath = user.role === 'admin' 
        ? ROUTES.ADMIN_DASHBOARD 
        : (user.role === 'seller' ? ROUTES.SELLER_DASHBOARD : ROUTES.USER_PROFILE);
        
      return <Navigate to={redirectPath} replace />;
    }
  }

  // 4. Authenticated and Authorized
  return <>{children}</>;
};
