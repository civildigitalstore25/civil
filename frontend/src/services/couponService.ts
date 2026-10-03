import { STORAGE_KEYS, storageService } from './storageService';
import type { Coupon, CouponFormData, CouponValidationResult } from '../types/coupon';
import { generateId } from '../utils/generateId';

// Default initial coupons if storage is empty
const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'SAVE2024',
    name: 'New Year Special Discount 2024',
    description: 'Get 20% flat discount on all digital assets and CAD bundles across the store.',
    discountType: 'percentage',
    discountValue: 20,
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    usageLimit: 100,
    usageCount: 35,
    applicableProducts: [],
    applicableCategories: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coup-2',
    code: 'WELCOME10',
    name: 'New User Welcome Discount',
    description: 'Welcome 10% discount for first time shoppers.',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    usageLimit: 200,
    usageCount: 82,
    applicableProducts: [],
    applicableCategories: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coup-3',
    code: 'SAVE200',
    name: 'Flat ₹200 Instant Off',
    description: 'Flat ₹200 off on cart orders above ₹500.',
    discountType: 'fixed',
    discountValue: 200,
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    usageLimit: 100,
    usageCount: 45,
    applicableProducts: [],
    applicableCategories: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coup-4',
    code: 'CIVIL10',
    name: 'Civil Engineering Special',
    description: '10% instant discount on all civil engineering software & elevation bundles.',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    usageLimit: 500,
    usageCount: 140,
    applicableProducts: [],
    applicableCategories: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const couponService = {
  getCoupons(): Coupon[] {
    let coupons = storageService.getItem<Coupon[]>(STORAGE_KEYS.COUPONS, []);
    if (!coupons || coupons.length === 0) {
      coupons = INITIAL_COUPONS;
      storageService.setItem<Coupon[]>(STORAGE_KEYS.COUPONS, coupons);
    }
    return coupons;
  },

  saveCoupons(coupons: Coupon[]): void {
    storageService.setItem<Coupon[]>(STORAGE_KEYS.COUPONS, coupons);
  },

  getCouponById(id: string): Coupon | undefined {
    return this.getCoupons().find((c) => c.id === id || c._id === id);
  },

  getCouponByCode(code: string): Coupon | undefined {
    const clean = code.trim().toUpperCase();
    return this.getCoupons().find((c) => c.code.toUpperCase() === clean);
  },

  generateCouponCode(): string {
    const prefixes = ['SAVE', 'WELCOME', 'DIGITAL', 'OFFER', 'SALE', 'PROMO', 'CIVIL', 'MEGA'];
    const numbers = [10, 15, 20, 25, 30, 50, 100, 200, 2025, 2026];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = numbers[Math.floor(Math.random() * numbers.length)];
    const generated = `${prefix}${num}`;

    // Check if code exists, append random letter if so
    const existing = this.getCouponByCode(generated);
    if (existing) {
      const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      return `${generated}${char}`;
    }
    return generated;
  },

  addCoupon(data: CouponFormData): { success: boolean; coupon?: Coupon; error?: string } {
    const coupons = this.getCoupons();
    const cleanCode = data.code.trim().toUpperCase();

    if (!cleanCode) {
      return { success: false, error: 'Coupon Code is required.' };
    }

    if (/\s/.test(cleanCode)) {
      return { success: false, error: 'Coupon Code must not contain spaces.' };
    }

    if (coupons.some((c) => c.code.toUpperCase() === cleanCode)) {
      return { success: false, error: `Coupon code "${cleanCode}" already exists. Please choose a unique code.` };
    }

    if (!data.name.trim()) {
      return { success: false, error: 'Coupon Name is required.' };
    }

    if (Number(data.discountValue) <= 0) {
      return { success: false, error: 'Discount Value must be greater than 0.' };
    }

    if (data.discountType === 'percentage' && Number(data.discountValue) > 100) {
      return { success: false, error: 'Percentage discount cannot exceed 100%.' };
    }

    if (!data.validFrom || !data.validTo) {
      return { success: false, error: 'Valid From and Valid To dates are required.' };
    }

    if (new Date(data.validTo) < new Date(data.validFrom)) {
      return { success: false, error: 'Valid To date cannot be earlier than Valid From date.' };
    }

    if (Number(data.usageLimit) <= 0) {
      return { success: false, error: 'Usage Limit must be a positive integer.' };
    }

    const newCoupon: Coupon = {
      id: generateId('coup'),
      code: cleanCode,
      name: data.name.trim(),
      description: data.description.trim(),
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      validFrom: data.validFrom,
      validTo: data.validTo,
      usageLimit: Number(data.usageLimit),
      usageCount: 0,
      applicableProducts: data.applicableProducts || [],
      applicableCategories: data.applicableCategories || [],
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newCoupon, ...coupons];
    this.saveCoupons(updated);

    return { success: true, coupon: newCoupon };
  },

  updateCoupon(id: string, data: Partial<CouponFormData>): { success: boolean; coupon?: Coupon; error?: string } {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.id === id || c._id === id);

    if (index === -1) {
      return { success: false, error: 'Coupon not found.' };
    }

    if (data.code) {
      const cleanCode = data.code.trim().toUpperCase();
      if (/\s/.test(cleanCode)) {
        return { success: false, error: 'Coupon Code must not contain spaces.' };
      }
      const duplicate = coupons.find(
        (c) => (c.id !== id && c._id !== id) && c.code.toUpperCase() === cleanCode
      );
      if (duplicate) {
        return { success: false, error: `Coupon code "${cleanCode}" is already taken by another coupon.` };
      }
      data.code = cleanCode;
    }

    if (data.discountValue !== undefined && Number(data.discountValue) <= 0) {
      return { success: false, error: 'Discount Value must be greater than 0.' };
    }

    const targetDiscountType = data.discountType || coupons[index].discountType;
    const targetDiscountValue = data.discountValue !== undefined ? Number(data.discountValue) : coupons[index].discountValue;

    if (targetDiscountType === 'percentage' && targetDiscountValue > 100) {
      return { success: false, error: 'Percentage discount cannot exceed 100%.' };
    }

    const targetValidFrom = data.validFrom || coupons[index].validFrom;
    const targetValidTo = data.validTo || coupons[index].validTo;

    if (new Date(targetValidTo) < new Date(targetValidFrom)) {
      return { success: false, error: 'Valid To date cannot be earlier than Valid From date.' };
    }

    if (data.usageLimit !== undefined && Number(data.usageLimit) <= 0) {
      return { success: false, error: 'Usage limit must be a positive integer.' };
    }

    const updatedCoupon: Coupon = {
      ...coupons[index],
      ...data,
      code: data.code ? data.code.trim().toUpperCase() : coupons[index].code,
      name: data.name !== undefined ? data.name.trim() : coupons[index].name,
      description: data.description !== undefined ? data.description.trim() : coupons[index].description,
      discountValue: targetDiscountValue,
      usageLimit: data.usageLimit !== undefined ? Number(data.usageLimit) : coupons[index].usageLimit,
      updatedAt: new Date().toISOString(),
    };

    coupons[index] = updatedCoupon;
    this.saveCoupons(coupons);

    return { success: true, coupon: updatedCoupon };
  },

  deleteCoupon(id: string): { success: boolean; error?: string } {
    const coupons = this.getCoupons();
    const exists = coupons.some((c) => c.id === id || c._id === id);

    if (!exists) {
      return { success: false, error: 'Coupon not found.' };
    }

    const updated = coupons.filter((c) => c.id !== id && c._id !== id);
    this.saveCoupons(updated);

    return { success: true };
  },

  toggleStatus(id: string): { success: boolean; status?: 'active' | 'inactive'; error?: string } {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.id === id || c._id === id);

    if (index === -1) {
      return { success: false, error: 'Coupon not found.' };
    }

    const newStatus = coupons[index].status === 'active' ? 'inactive' : 'active';
    coupons[index].status = newStatus;
    coupons[index].updatedAt = new Date().toISOString();

    this.saveCoupons(coupons);
    return { success: true, status: newStatus };
  },

  validateCouponCode(code: string, cartItems: Array<{ productId: string; price: number; quantity: number }>): CouponValidationResult {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { valid: false, message: 'Please enter a coupon code.' };
    }

    const coupon = this.getCouponByCode(clean);

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code. Please check and try again.' };
    }

    if (coupon.status !== 'active') {
      return { valid: false, message: 'This coupon code is currently inactive.' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (coupon.validFrom && todayStr < coupon.validFrom) {
      return { valid: false, message: 'This coupon is not yet active.' };
    }

    if (coupon.validTo && todayStr > coupon.validTo) {
      return { valid: false, message: 'This coupon has expired.' };
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon usage limit has been reached.' };
    }

    // Check targeting
    let eligibleSubtotal = 0;
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const eligibleItems = cartItems.filter((item) =>
        coupon.applicableProducts.includes(item.productId)
      );

      if (eligibleItems.length === 0) {
        return {
          valid: false,
          message: 'This coupon is not applicable to any items currently in your cart.',
        };
      }
      eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    } else {
      eligibleSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((eligibleSubtotal * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(eligibleSubtotal, coupon.discountValue);
    }

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
      message: `Coupon "${coupon.code}" applied successfully!`,
    };
  },
};
