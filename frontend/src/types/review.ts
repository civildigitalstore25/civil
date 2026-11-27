export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ReviewSort = 'newest' | 'oldest' | 'highest' | 'lowest';

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export interface PublicReview {
  id: string;
  displayName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  /** Only sent to admins (product page moderation). */
  isAdminCreated?: boolean;
}

export interface OwnReview extends PublicReview {
  status: ReviewStatus;
  rejectionReason: string;
}

export interface RecentReview extends PublicReview {
  product: { name: string; slug: string };
}

export interface AdminReview extends OwnReview {
  isAdminCreated: boolean;
  orderRef: string;
  approvedAt: string | null;
  product: { id: string; name: string; slug: string };
  user: { id: string; name: string; email: string } | null;
}

export interface ReviewPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export interface ReviewInput {
  rating: number;
  title: string;
  comment: string;
  displayName?: string;
  /** Admin-only custom review date (ISO). */
  createdAt?: string;
}

export interface AdminReviewCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
}

export const REVIEW_LIMITS = {
  titleMax: 100,
  commentMin: 10,
  commentMax: 2000,
  nameMin: 2,
  nameMax: 60,
  rejectionReasonMax: 300,
} as const;

export const EMPTY_REVIEW_SUMMARY: ReviewSummary = {
  averageRating: 0,
  totalReviews: 0,
  distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
};
