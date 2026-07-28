import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PetWishlistService } from '@/services/api/petverse/PetWishlistService';
import type { PetWishlistLine } from '@/types/petverse';

const GUEST_WISHLIST_KEY = 'petverse_guest_wishlist_v1';

function readGuestWishlist(): PetWishlistLine[] {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as PetWishlistLine[]) : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(items: PetWishlistLine[]) {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
}

interface PetverseWishlistContextType {
  items: PetWishlistLine[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
}

const PetverseWishlistContext = createContext<PetverseWishlistContextType | undefined>(undefined);

export const PetverseWishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<PetWishlistLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (user?.uid) {
        const remote = await PetWishlistService.getWishlist(user.uid);
        const guest = readGuestWishlist();
        let merged = remote;
        if (guest.length > 0) {
          const ids = new Set(remote.map((i) => i.productId));
          const additions = guest.filter((g) => !ids.has(g.productId));
          merged = [...remote, ...additions];
          await PetWishlistService.saveWishlist(user.uid, merged);
          localStorage.removeItem(GUEST_WISHLIST_KEY);
        }
        if (!cancelled) setItems(merged);
      } else {
        if (!cancelled) setItems(readGuestWishlist());
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const persist = useCallback(
    (next: PetWishlistLine[]) => {
      setItems(next);
      if (user?.uid) {
        void PetWishlistService.saveWishlist(user.uid, next);
      } else {
        writeGuestWishlist(next);
      }
    },
    [user?.uid]
  );

  const isWishlisted = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.productId === productId);
        const next = exists
          ? prev.filter((i) => i.productId !== productId)
          : [...prev, { productId, addedAt: new Date().toISOString() }];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const value = useMemo(
    () => ({ items, loading, isWishlisted, toggleWishlist }),
    [items, loading, isWishlisted, toggleWishlist]
  );

  return <PetverseWishlistContext.Provider value={value}>{children}</PetverseWishlistContext.Provider>;
};

export const usePetverseWishlist = (): PetverseWishlistContextType => {
  const ctx = useContext(PetverseWishlistContext);
  if (!ctx) throw new Error('usePetverseWishlist must be used within a PetverseWishlistProvider');
  return ctx;
};
