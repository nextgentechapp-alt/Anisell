import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PetCartService } from '@/services/api/petverse/PetCartService';
import type { PetCartLine } from '@/types/petverse';

const GUEST_CART_KEY = 'petverse_guest_cart_v1';

function readGuestCart(): PetCartLine[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as PetCartLine[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: PetCartLine[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function lineKey(productId: string, variantId?: string) {
  return `${productId}::${variantId ?? 'default'}`;
}

interface PetverseCartContextType {
  items: PetCartLine[];
  loading: boolean;
  totalQuantity: number;
  addToCart: (productId: string, variantId?: string, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
}

const PetverseCartContext = createContext<PetverseCartContextType | undefined>(undefined);

export const PetverseCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<PetCartLine[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart on mount / when auth state changes; merge guest cart into the
  // logged-in user's Firestore cart exactly once on login.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      if (user?.uid) {
        const remote = await PetCartService.getCart(user.uid);
        const guest = readGuestCart();

        let merged = remote;
        if (guest.length > 0) {
          const map = new Map(remote.map((i) => [lineKey(i.productId, i.variantId), i]));
          guest.forEach((g) => {
            const key = lineKey(g.productId, g.variantId);
            const existing = map.get(key);
            map.set(key, existing ? { ...existing, quantity: existing.quantity + g.quantity } : g);
          });
          merged = Array.from(map.values());
          await PetCartService.saveCart(user.uid, merged);
          localStorage.removeItem(GUEST_CART_KEY);
        }

        if (!cancelled) setItems(merged);
      } else {
        if (!cancelled) setItems(readGuestCart());
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const persist = useCallback(
    (next: PetCartLine[]) => {
      setItems(next);
      if (user?.uid) {
        void PetCartService.saveCart(user.uid, next);
      } else {
        writeGuestCart(next);
      }
    },
    [user?.uid]
  );

  const addToCart = useCallback(
    (productId: string, variantId?: string, quantity = 1) => {
      setItems((prev) => {
        const key = lineKey(productId, variantId);
        const existing = prev.find((i) => lineKey(i.productId, i.variantId) === key);
        let next: PetCartLine[];
        if (existing) {
          next = prev.map((i) =>
            lineKey(i.productId, i.variantId) === key ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          next = [...prev, { productId, variantId, quantity, addedAt: new Date().toISOString() }];
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      setItems((prev) => {
        const key = lineKey(productId, variantId);
        const next = quantity <= 0
          ? prev.filter((i) => lineKey(i.productId, i.variantId) !== key)
          : prev.map((i) => (lineKey(i.productId, i.variantId) === key ? { ...i, quantity } : i));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeFromCart = useCallback(
    (productId: string, variantId?: string) => {
      setItems((prev) => {
        const key = lineKey(productId, variantId);
        const next = prev.filter((i) => lineKey(i.productId, i.variantId) !== key);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const totalQuantity = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value: PetverseCartContextType = {
    items,
    loading,
    totalQuantity,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <PetverseCartContext.Provider value={value}>{children}</PetverseCartContext.Provider>;
};

export const usePetverseCart = (): PetverseCartContextType => {
  const ctx = useContext(PetverseCartContext);
  if (!ctx) throw new Error('usePetverseCart must be used within a PetverseCartProvider');
  return ctx;
};
