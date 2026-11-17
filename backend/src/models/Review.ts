import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export const REVIEW_LIMITS = {
  ratingMin: 1,
  ratingMax: 5,
  titleMax: 100,
  commentMin: 10,
  commentMax: 2000,
  nameMin: 2,
  nameMax: 60,
  rejectionReasonMax: 300,
} as const;

export interface IReview extends Document {
  product: Types.ObjectId;
  /** Customer who owns the review. Null for admin-created reviews posted under a custom name. */
  user: Types.ObjectId | null;
  /** Admin who created an admin review. */
  createdBy: Types.ObjectId | null;
  displayName: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  rejectionReason: string;
  isAdminCreated: boolean;
  verifiedPurchase: boolean;
  /** Merchant order id (Order.orderId) that proved the purchase, if any. */
  orderRef: string;
  approvedAt: Date | null;
  approvedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    displayName: {
      type: String,
      required: true,
      trim: true,
      // Admin custom names are checked for nameMin in the controller; customer names come from the account.
      minlength: 1,
      maxlength: REVIEW_LIMITS.nameMax,
    },
    rating: {
      type: Number,
      required: true,
      min: REVIEW_LIMITS.ratingMin,
      max: REVIEW_LIMITS.ratingMax,
      validate: { validator: Number.isInteger, message: 'Rating must be a whole number between 1 and 5' },
    },
    title: { type: String, trim: true, default: '', maxlength: REVIEW_LIMITS.titleMax },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: REVIEW_LIMITS.commentMin,
      maxlength: REVIEW_LIMITS.commentMax,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, trim: true, default: '', maxlength: REVIEW_LIMITS.rejectionReasonMax },
    isAdminCreated: { type: Boolean, default: false },
    verifiedPurchase: { type: Boolean, default: false },
    orderRef: { type: String, default: '' },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// One review per customer per product. Admin-created reviews (user = null) are excluded so an admin
// can post several reviews under different names.
reviewSchema.index(
  { product: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
