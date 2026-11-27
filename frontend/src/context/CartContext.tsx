import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import type { CartItem, AppliedCoupon, CartSummary } from '../types/cart';
import type { Product } from '../types/product';
import { cartService } from '../services/cartService';
import { couponService } from '../services/couponService';
import { apiRequest } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import { isScheduleActive } from '../utils/productDisplay';

type AddToCartProduct = Product & {
  brand?: string;
  license?: string;
};

interface CartContextType {
  cartItems: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addToCart: (product: AddToCartProduct, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  summary: CartSummary;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const extractLicenseLabel = (name: string, productId: string, explicit?: string): string => {
  if (explicit && explicit.trim()) return explicit.trim();
  const match = /\(([^()]+)\)\s*$/.exec(name.trim());
  if (match && match[1]) return match[1].trim();
  const planPart = productId.includes('::') ? productId.split('::')[1]?.trim() : '';
  if (!planPart) return 'Standard';
  if (planPart === 'lifetime') return 'Lifetime';
  if (planPart === 'membership') return 'Membership';
  if (planPart === 'ebook') return 'eBook';
  return planPart;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => cartService.getCart());
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const hydratedUserIdRef = useRef<string | null>(null);
  const skipNextSyncRef = useRef(false);
  const cartItemsRef = useRef<CartItem[]>(cartItems);
  cartItemsRef.current = cartItems;

  // Sync to LocalStorage on every cart update
  useEffect(() => {
    cartService.saveCart(cartItems);
  }, [cartItems]);

  // Hydrate and merge cart with backend when user authenticates; clear on logout
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) {
      if (hydratedUserIdRef.current) {
        hydratedUserIdRef.current = null;
        skipNextSyncRef.current = true;
        setCartItems([]);
        cartService.clearCart();
        setAppliedCoupon(null);
      }
      return;
    }

    if (hydratedUserIdRef.current === currentUser.id) return;

    let cancelled = false;
    const userId = currentUser.id;
    const localItems = cartItemsRef.current;

    void cartService.fetchMyCart().then((serverItems) => {
      if (cancelled) return;
      hydratedUserIdRef.current = userId;

      if (serverItems === null) {
        return;
      }

      const mergedMap = new Map<string, CartItem>();
      for (const item of serverItems) {
        mergedMap.set(item.productId || item.id, item);
      }
      for (const item of localItems) {
        const key = item.productId || item.id;
        if (!mergedMap.has(key)) {
          mergedMap.set(key, item);
        }
      }

      const merged = Array.from(mergedMap.values());
      const hasLocalAdditions = localItems.some(
        (local) => !serverItems.some((srv) => (srv.productId || srv.id) === (local.productId || local.id))
      );

      skipNextSyncRef.current = true;
      setCartItems(merged);

      if (hasLocalAdditions) {
        void cartService.syncMyCart(merged);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, currentUser?.id]);

  // Push cart updates to backend whenever an authenticated user modifies their cart
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;
    if (hydratedUserIdRef.current !== currentUser.id) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void cartService.syncMyCart(cartItems);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [cartItems, isAuthenticated, currentUser?.id]);

  // Free offers (like civil-ecommerce): re-check each cart product so items whose free window is
  // live show as ₹0. The server re-verifies the window at checkout, so this is display only.
  const cartProductKey = cartItems.map((item) => item.productId.split('::')[0]).join('|');
  useEffect(() => {
    const ids = Array.from(new Set(cartProductKey.split('|').filter(Boolean)));
    if (!ids.length) return;
    let cancelled = false;
    void Promise.all(
      ids.map(async (id) => {
        try {
          const { response, data } = await apiRequest<{ success: boolean; product?: Partial<Product> }>(`/products/${id}`);
          const p = response.ok ? data.product : undefined;
          const free = Boolean(
            p && isScheduleActive(p.isFreeProduct, p.freeProductStartDate, p.freeProductStartTime, p.freeProductEndDate, p.freeProductEndTime)
          );
          return [id, free] as const;
        } catch {
          return [id, false] as const;
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const freeIds = new Set(results.filter(([, free]) => free).map(([id]) => id));
      if (!freeIds.size) return;
      setCartItems((prev) => {
        let changed = false;
        const next = prev.map((item) => {
          if (!freeIds.has(item.productId.split('::')[0]) || item.price === 0) return item;
          changed = true;
          return { ...item, oldPrice: Math.max(item.oldPrice, item.price), price: 0 };
        });
        return changed ? next : prev;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [cartProductKey]);

  const addToCart = (product: AddToCartProduct, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.productId === product.id || item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        brand: product.brand || product.company || product.software || '',
        category: product.category,
        license: extractLicenseLabel(product.name, product.id, product.license),
        image: product.images[0] || '',
        format: product.format,
        fileSize: product.fileSize,
        price: product.price,
        oldPrice: product.oldPrice,
        quantity,
        instantDownload: true
      };

      return [...prevItems, newItem];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id || item.productId === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id && item.productId !== id));
  };

  const clearCart = () => {
    skipNextSyncRef.current = true;
    setCartItems([]);
    cartService.clearCart();
    setAppliedCoupon(null);
    if (isAuthenticated && currentUser?.id) {
      void cartService.clearServerCart();
    }
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const items = cartItems.map((item) => ({
      productId: item.productId,
      price: item.price,
      quantity: item.quantity,
    }));
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const result = await couponService.validateCouponCode(code, items, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon({
        code: result.coupon.code,
        discountPercent: result.coupon.discountType === 'percentage' ? result.coupon.discountValue : undefined,
        discountAmount: result.coupon.discountType === 'fixed' ? result.coupon.discountValue : undefined,
        description: result.coupon.discountType === 'percentage'
          ? `${result.coupon.discountValue}% Off Applied!`
          : `₹${result.coupon.discountValue} Off Applied!`,
      });
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const summary = useMemo<CartSummary>(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const oldTotal = cartItems.reduce((acc, item) => acc + item.oldPrice * item.quantity, 0);
    const msrpSavings = Math.max(0, oldTotal - subtotal);

    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountPercent) {
        couponDiscount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
      } else if (appliedCoupon.discountAmount) {
        couponDiscount = Math.min(subtotal, appliedCoupon.discountAmount);
      }
    }

    const netSubtotal = Math.max(0, subtotal - couponDiscount);
    const gst = Math.round(netSubtotal * 0.18);
    const totalPayable = netSubtotal + gst;
    const totalSavings = msrpSavings + couponDiscount;
    const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return {
      subtotal,
      savings: totalSavings,
      gst,
      delivery: 'FREE',
      couponDiscount,
      totalPayable,
      totalItemsCount
    };
  }, [cartItems, appliedCoupon]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        appliedCoupon,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        summary
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
