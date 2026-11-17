import { STORAGE_KEYS, storageService } from './storageService';
import type { Coupon, CouponFormData, CouponValidationResult } from '../types/coupon';
import { apiRequest } from './apiClient';

// Helper to sanitize coupons from local cache, filtering out legacy mock entries
const sanitizeCoupons = (coupons: Coupon[]): Coupon[] => {
  if (!Array.isArray(coupons)) return [];
  return coupons.filter(
    (c) =>
      c &&
      c.code &&
      !String(c.id || c._id || '').startsWith('coup-')
  );
};

const mapBackendCoupon = (raw: any): Coupon => ({
  id: String(raw._id || raw.id || ''),
  _id: String(raw._id || raw.id || ''),
  code: String(raw.code || '').trim().toUpperCase(),
  name: String(raw.name || '').trim(),
  description: raw.description ? String(raw.description).trim() : '',
  discountType: raw.discountType === 'fixed' ? 'fixed' : 'percentage',
  discountValue: Number(raw.discountValue) || 0,
  validFrom: raw.validFrom ? new Date(raw.validFrom).toISOString().split('T')[0] : '',
  validTo: raw.validTo ? new Date(raw.validTo).toISOString().split('T')[0] : '',
  usageLimit: Number(raw.usageLimit) || 0,
  usageCount: Number(raw.usageCount) || 0,
  applicableProducts: Array.isArray(raw.applicableProducts) ? raw.applicableProducts : [],
  applicableCategories: Array.isArray(raw.applicableCategories) ? raw.applicableCategories : [],
  status: raw.status === 'inactive' ? 'inactive' : 'active',
  createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : undefined,
  updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : undefined,
});

export const couponService = {
  /**
   * Returns locally cached coupons (sanitized to remove any legacy hardcoded entries).
   * Defaults to empty array — no default or hardcoded coupons.
   */
  getCoupons(): Coupon[] {
    const stored = storageService.getItem<Coupon[]>(STORAGE_KEYS.COUPONS, []);
    const clean = sanitizeCoupons(stored);
    if (stored && clean.length !== stored.length) {
      storageService.setItem<Coupon[]>(STORAGE_KEYS.COUPONS, clean);
    }
    return clean;
  },

  saveCoupons(coupons: Coupon[]): void {
    const clean = sanitizeCoupons(coupons);
    storageService.setItem<Coupon[]>(STORAGE_KEYS.COUPONS, clean);
  },

  /**
   * Fetches the real coupons from the backend database.
   * Updates local storage cache and returns the fresh list.
   */
  async fetchCoupons(): Promise<Coupon[]> {
    try {
      const { response, data } = await apiRequest<any>('/coupons');
      if (response.ok) {
        const rawList = Array.isArray(data) ? data : Array.isArray(data?.coupons) ? data.coupons : [];
        const mapped = rawList.map(mapBackendCoupon);
        const clean = sanitizeCoupons(mapped);
        this.saveCoupons(clean);
        return clean;
      }
    } catch {
      // Backend unavailable; fallback to sanitized local cache
    }
    return this.getCoupons();
  },

  getCouponById(id: string): Coupon | undefined {
    return this.getCoupons().find((c) => c.id === id || c._id === id);
  },

  getCouponByCode(code: string): Coupon | undefined {
    const clean = code.trim().toUpperCase();
    return this.getCoupons().find((c) => c.code.toUpperCase() === clean);
  },

  generateCouponCode(): string {
    const prefixes = ['PROMO', 'OFFER', 'DISCOUNT', 'SPECIAL', 'DEAL', 'MEGA'];
    const numbers = [10, 15, 20, 25, 30, 50, 100];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = numbers[Math.floor(Math.random() * numbers.length)];
    const generated = `${prefix}${num}`;

    const existing = this.getCouponByCode(generated);
    if (existing) {
      const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      return `${generated}${char}`;
    }
    return generated;
  },

  async addCoupon(data: CouponFormData): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
    const cleanCode = data.code.trim().toUpperCase();

    if (!cleanCode) {
      return { success: false, error: 'Coupon Code is required.' };
    }

    if (/\s/.test(cleanCode)) {
      return { success: false, error: 'Coupon Code must not contain spaces.' };
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

    try {
      const { response, data: resData } = await apiRequest<any>('/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: cleanCode,
          name: data.name.trim(),
          description: data.description ? data.description.trim() : '',
          discountType: data.discountType,
          discountValue: Number(data.discountValue),
          validFrom: data.validFrom,
          validTo: data.validTo,
          usageLimit: Number(data.usageLimit),
          applicableProducts: data.applicableProducts || [],
          applicableCategories: data.applicableCategories || [],
          status: data.status || 'active',
        }),
      });

      if (!response.ok || !resData) {
        return {
          success: false,
          error: resData?.message || resData?.error || 'Failed to create coupon.',
        };
      }

      const created = mapBackendCoupon(resData);
      const current = this.getCoupons();
      this.saveCoupons([created, ...current]);
      return { success: true, coupon: created };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to connect to server.' };
    }
  },

  async updateCoupon(
    id: string,
    data: Partial<CouponFormData>
  ): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
    if (data.code) {
      const cleanCode = data.code.trim().toUpperCase();
      if (/\s/.test(cleanCode)) {
        return { success: false, error: 'Coupon Code must not contain spaces.' };
      }
      data.code = cleanCode;
    }

    if (data.discountValue !== undefined && Number(data.discountValue) <= 0) {
      return { success: false, error: 'Discount Value must be greater than 0.' };
    }

    if (data.discountType === 'percentage' && Number(data.discountValue) > 100) {
      return { success: false, error: 'Percentage discount cannot exceed 100%.' };
    }

    if (data.validFrom && data.validTo && new Date(data.validTo) < new Date(data.validFrom)) {
      return { success: false, error: 'Valid To date cannot be earlier than Valid From date.' };
    }

    if (data.usageLimit !== undefined && Number(data.usageLimit) <= 0) {
      return { success: false, error: 'Usage limit must be a positive integer.' };
    }

    try {
      const { response, data: resData } = await apiRequest<any>(`/coupons/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (!response.ok || !resData) {
        return {
          success: false,
          error: resData?.message || resData?.error || 'Failed to update coupon.',
        };
      }

      const updated = mapBackendCoupon(resData);
      const current = this.getCoupons();
      const updatedList = current.map((c) => (c.id === id || c._id === id ? updated : c));
      this.saveCoupons(updatedList);
      return { success: true, coupon: updated };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to connect to server.' };
    }
  },

  async deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { response, data } = await apiRequest<any>(`/coupons/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || data?.error || 'Failed to delete coupon.',
        };
      }

      const current = this.getCoupons();
      const filtered = current.filter((c) => c.id !== id && c._id !== id);
      this.saveCoupons(filtered);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to connect to server.' };
    }
  },

  async toggleStatus(id: string): Promise<{ success: boolean; status?: 'active' | 'inactive'; error?: string }> {
    try {
      const { response, data } = await apiRequest<any>(`/coupons/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
      });

      if (!response.ok || !data) {
        return {
          success: false,
          error: data?.message || data?.error || 'Failed to toggle status.',
        };
      }

      const updated = mapBackendCoupon(data);
      const current = this.getCoupons();
      const updatedList = current.map((c) => (c.id === id || c._id === id ? updated : c));
      this.saveCoupons(updatedList);
      return { success: true, status: updated.status };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to connect to server.' };
    }
  },

  async validateCouponCode(
    code: string,
    cartItems: Array<{ productId: string; price: number; quantity: number }>,
    subtotal?: number
  ): Promise<CouponValidationResult> {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { valid: false, message: 'Please enter a coupon code.' };
    }

    const productIds = cartItems.map((item) => item.productId);
    const calculatedSubtotal =
      subtotal !== undefined
        ? subtotal
        : cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const { response, data } = await apiRequest<{
        valid: boolean;
        coupon?: {
          id: string;
          code: string;
          name: string;
          discountType: 'percentage' | 'fixed';
          discountValue: number;
          discountAmount: number;
        };
        message?: string;
      }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: clean,
          productIds,
          subtotal: calculatedSubtotal,
          items: cartItems,
        }),
      });

      if (response.ok && data?.valid && data.coupon) {
        return {
          valid: true,
          coupon: {
            id: String(data.coupon.id),
            code: data.coupon.code,
            name: data.coupon.name,
            discountType: data.coupon.discountType,
            discountValue: Number(data.coupon.discountValue),
            discountAmount: Number(data.coupon.discountAmount),
          },
          message: data.message || `Coupon "${data.coupon.code}" applied successfully!`,
        };
      }

      return {
        valid: false,
        message: data?.message || 'Invalid coupon code. Please check and try again.',
      };
    } catch {
      // Backend unreachable: validate against local active coupons
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

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { valid: false, message: 'This coupon usage limit has been reached.' };
      }

      let eligibleSubtotal = calculatedSubtotal;
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        const eligibleItems = cartItems.filter((item) => {
          const baseId = item.productId.split('::')[0] || '';
          return coupon.applicableProducts.includes(item.productId) || coupon.applicableProducts.includes(baseId);
        });

        if (eligibleItems.length === 0) {
          return {
            valid: false,
            message: 'This coupon is not applicable to any items currently in your cart.',
          };
        }
        eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
    }
  },
};
