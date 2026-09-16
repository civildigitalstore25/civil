import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { CartItem, AppliedCoupon, CartSummary } from '../types/cart';
import type { Product } from '../types/product';
import { VALID_COUPONS } from '../data/cartData';
import { cartService } from '../services/cartService';

interface CartContextType {
  cartItems: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  summary: CartSummary;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => cartService.getCart());
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Sync to LocalStorage on every cart update
  useEffect(() => {
    cartService.saveCart(cartItems);
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.productId === product.id || item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        category: product.category,
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
    setCartItems([]);
    cartService.clearCart();
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code.' };
    }
    const coupon = VALID_COUPONS[cleanCode];
    if (coupon) {
      setAppliedCoupon(coupon);
      return { success: true, message: `Coupon "${cleanCode}" applied successfully!` };
    }
    return { success: false, message: 'Invalid coupon code. Try CIVIL10 or SAVE200.' };
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
