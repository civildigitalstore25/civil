import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Coupon, CouponFormData, CouponValidationResult } from '../types/coupon';
import { couponService } from '../services/couponService';

interface CouponContextType {
  coupons: Coupon[];
  refreshCoupons: () => void;
  getCouponById: (id: string) => Coupon | undefined;
  getCouponByCode: (code: string) => Coupon | undefined;
  generateCouponCode: () => string;
  addCoupon: (data: CouponFormData) => { success: boolean; coupon?: Coupon; error?: string };
  updateCoupon: (id: string, data: Partial<CouponFormData>) => { success: boolean; coupon?: Coupon; error?: string };
  deleteCoupon: (id: string) => { success: boolean; error?: string };
  toggleStatus: (id: string) => { success: boolean; status?: 'active' | 'inactive'; error?: string };
  validateCouponCode: (code: string, cartItems: Array<{ productId: string; price: number; quantity: number }>) => CouponValidationResult;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coupons, setCoupons] = useState<Coupon[]>(() => couponService.getCoupons());

  const refreshCoupons = useCallback(() => {
    setCoupons(couponService.getCoupons());
  }, []);

  const getCouponById = useCallback(
    (id: string) => coupons.find((c) => c.id === id || c._id === id),
    [coupons]
  );

  const getCouponByCode = useCallback(
    (code: string) => {
      const clean = code.trim().toUpperCase();
      return coupons.find((c) => c.code.toUpperCase() === clean);
    },
    [coupons]
  );

  const generateCouponCode = useCallback(() => couponService.generateCouponCode(), []);

  const addCoupon = useCallback((data: CouponFormData) => {
    const result = couponService.addCoupon(data);
    if (result.success) {
      setCoupons(couponService.getCoupons());
    }
    return result;
  }, []);

  const updateCoupon = useCallback((id: string, data: Partial<CouponFormData>) => {
    const result = couponService.updateCoupon(id, data);
    if (result.success) {
      setCoupons(couponService.getCoupons());
    }
    return result;
  }, []);

  const deleteCoupon = useCallback((id: string) => {
    const result = couponService.deleteCoupon(id);
    if (result.success) {
      setCoupons(couponService.getCoupons());
    }
    return result;
  }, []);

  const toggleStatus = useCallback((id: string) => {
    const result = couponService.toggleStatus(id);
    if (result.success) {
      setCoupons(couponService.getCoupons());
    }
    return result;
  }, []);

  const validateCouponCode = useCallback(
    (code: string, cartItems: Array<{ productId: string; price: number; quantity: number }>) => {
      return couponService.validateCouponCode(code, cartItems);
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      coupons,
      refreshCoupons,
      getCouponById,
      getCouponByCode,
      generateCouponCode,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleStatus,
      validateCouponCode,
    }),
    [
      coupons,
      refreshCoupons,
      getCouponById,
      getCouponByCode,
      generateCouponCode,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleStatus,
      validateCouponCode,
    ]
  );

  return <CouponContext.Provider value={contextValue}>{children}</CouponContext.Provider>;
};

export const useCoupons = (): CouponContextType => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupons must be used within a CouponProvider');
  }
  return context;
};

export default CouponContext;
