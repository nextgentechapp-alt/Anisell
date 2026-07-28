import React from 'react';
import { PetverseCartProvider } from '@/context/PetverseCartContext';
import { PetverseWishlistProvider } from '@/context/PetverseWishlistContext';

/**
 * Wraps only the /petverse route subtree with PetVerse-specific state
 * (cart + wishlist). AniSell's root <App /> and its <AuthProvider> are
 * untouched — this mounts underneath the existing AuthProvider so it can
 * still read the logged-in user via useAuth().
 */
export const PetverseProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PetverseCartProvider>
    <PetverseWishlistProvider>{children}</PetverseWishlistProvider>
  </PetverseCartProvider>
);
