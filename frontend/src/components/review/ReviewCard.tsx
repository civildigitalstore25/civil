import React, { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { StarRating } from './StarRating';
import type { PublicReview } from '../../types/review';
import { formatReviewDate, reviewInitials } from '../../utils/reviewFormat';

const COLLAPSE_AT = 320;

interface ReviewCardProps {
  review: PublicReview;
  highlight?: boolean;
  footer?: React.ReactNode;
  /** Top-right actions (admin edit / delete on the product page). */
  actions?: React.ReactNode;
}

/** Review card - layout follows civil-ecommerce's ProductDetailReviewCard (avatar, name, stars, date, expandable text). */
export const ReviewCard: React.FC<ReviewCardProps> = ({ review, highlight = false, footer, actions }) => {
  const [expanded, setExpanded] = useState(false);
  const long = review.comment.length > COLLAPSE_AT;
  const text = long && !expanded ? `${review.comment.slice(0, COLLAPSE_AT).trimEnd()}\u2026` : review.comment;

  return (
    <article
      className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
        highlight ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F5A623] to-amber-600 text-sm font-extrabold text-white shadow-sm sm:h-11 sm:w-11">
          {reviewInitials(review.displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h5 className="truncate text-sm font-bold text-slate-900 sm:text-base">{review.displayName}</h5>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <BadgeCheck className="h-3 w-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            {actions && <div className="-mr-1 -mt-1 flex shrink-0 items-center gap-1">{actions}</div>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-xs text-slate-500">{formatReviewDate(review.createdAt)}</span>
          </div>
          {review.title && <p className="mt-2 text-sm font-bold text-slate-900">{review.title}</p>}
          <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">{text}</p>
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs font-bold text-[#D97706] hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
          {footer && <div className="mt-3">{footer}</div>}
        </div>
      </div>
    </article>
  );
};

export default ReviewCard;
