import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Coupon, CouponFormData, CouponValidationResult } from '../types/coupon';
import { couponService } from '../services/couponService';

interface CouponContextType {
  coupons: Coupon[];
  isLoading: boolean;
  refreshCoupons: () => Promise<void>;
  getCouponById: (id: string) => Coupon | undefined;
  getCouponByCode: (code: string) => Coupon | undefined;
  generateCouponCode: () => string;
  addCoupon: (data: CouponFormData) => Promise<{ success: boolean; coupon?: Coupon; error?: string }>;
  updateCoupon: (id: string, data: Partial<CouponFormData>) => Promise<{ success: boolean; coupon?: Coupon; error?: string }>;
  deleteCoupon: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleStatus: (id: string) => Promise<{ success: boolean; status?: 'active' | 'inactive'; error?: string }>;
  validateCouponCode: (
    code: string,
    cartItems: Array<{ productId: string; price: number; quantity: number }>,
    subtotal?: number
  ) => Promise<CouponValidationResult>;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coupons, setCoupons] = useState<Coupon[]>(() => couponService.getCoupons());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await couponService.fetchCoupons();
      setCoupons(loaded);
    } catch (err) {
      console.warn('Failed to refresh coupons from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch from backend on initial mount
  useEffect(() => {
    void refreshCoupons();
  }, [refreshCoupons]);

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

  const addCoupon = useCallback(async (data: CouponFormData) => {
    const result = await couponService.addCoupon(data);
    if (result.success) {
      setCoupons(couponService.getCoupons());
    }
    return result;
  }, []);

  const updateCoupon = useCallback(async (id: string, data: Partial<CouponFormData>) => {
    const result = await couponService.updateCoupon(id, data);
    if (result.success) {
      setCoupons(couponService.getCoupons());
    }
    return result;
  }, []);

  const deleteCoupon = useCallback(async (id: string) => {
    const result = await couponService.deleteCoupon(id);
    if (result.success) {
      setCoupons(couponService.getCoupons());
    }
    return result;
  }, []);

  const toggleStatus = useCallback(async (id: string) => {
    const result = await couponService.toggleStatus(id);
    if (result.success) {
      setCoupons(couponService.getCoupons());
    }
    return result;
  }, []);

  const validateCouponCode = useCallback(
    async (
      code: string,
      cartItems: Array<{ productId: string; price: number; quantity: number }>,
      subtotal?: number
    ) => {
      return await couponService.validateCouponCode(code, cartItems, subtotal);
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      coupons,
      isLoading,
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
      isLoading,
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
