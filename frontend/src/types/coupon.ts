export type DiscountType = 'percentage' | 'fixed';
export type CouponStatus = 'active' | 'inactive';

export interface Coupon {
  id: string;
  _id?: string;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usageCount: number;
  applicableProducts: string[]; // Product IDs. Empty array = site-wide
  applicableCategories?: string[]; // Optional category IDs/slugs
  status: CouponStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponFormData {
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  applicableProducts: string[];
  applicableCategories: string[];
  status: CouponStatus;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    name: string;
    discountType: DiscountType;
    discountValue: number;
    discountAmount: number;
  };
  message: string;
}
