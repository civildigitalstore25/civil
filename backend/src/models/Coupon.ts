import mongoose, { Schema, Document } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed';
export type CouponStatus = 'active' | 'inactive';

export interface ICoupon extends Document {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom: Date;
  validTo: Date;
  usageLimit: number;
  usageCount: number;
  applicableProducts: string[];
  applicableCategories?: string[];
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
      default: 100,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicableProducts: {
      type: [String],
      default: [],
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
export default Coupon;
