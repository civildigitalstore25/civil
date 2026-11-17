import React, { useEffect } from 'react';
import { CheckCircle2, Clock3, Loader2, Pencil, Star, X, XCircle } from 'lucide-react';
import ReviewForm from '../review/ReviewForm';
import type { OrderItem } from '../../types/order';
import type { OrderReviewsState } from './useOrderReviews';

const STATUS = {
  pending: { label: 'Review pending', icon: Clock3, cls: 'border-amber-200 bg-amber-50 text-amber-800' },
  approved: { label: 'Reviewed', icon: CheckCircle2, cls: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  rejected: { label: 'Not approved', icon: XCircle, cls: 'border-rose-200 bg-rose-50 text-rose-800' },
} as const;

/**
 * Review action shown in an order item's action area, next to "Download Files".
 * Same height as the download button; renders nothing for deleted / non-reviewable products.
 */
export const OrderItemReview: React.FC<{ item: OrderItem; state: OrderReviewsState }> = ({ item, state }) => {
  if (!state.eligible) return null;
  const productId = String(item.productId || '');

  if (state.loading) {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-[7px] text-xs font-bold text-slate-400 print:hidden">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Review
      </span>
    );
  }

  const product = state.productInfo(productId);
  const review = state.reviewFor(productId);
  // Deleted product (or an id we cannot resolve): nothing to review.
  if (!product) return null;
  // Product no longer on sale and never reviewed: the backend would refuse a new review.
  if (!review && !product.reviewable) return null;

  if (!review) {
    return (
      <button
        type="button"
        onClick={() => state.open(item)}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#F5A623] bg-white px-3.5 py-[7px] text-xs font-extrabold text-[#D97706] transition-colors hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/50 print:hidden"
      >
        <Star className="h-3.5 w-3.5" /> Write a review
      </button>
    );
  }

  const status = STATUS[review.status];
  const Icon = status.icon;
  const tooltip =
    review.status === 'rejected'
      ? `${review.rejectionReason ? `Reason: ${review.rejectionReason}. ` : ''}You can edit and resubmit your review.`
      : review.status === 'pending'
        ? 'Your review will appear on the product page once an admin approves it.'
        : 'Your review is live on the product page.';

  return (
    <div className={`inline-flex items-stretch overflow-hidden rounded-xl border text-xs font-extrabold print:hidden ${status.cls}`} title={tooltip}>
      <span className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-3 py-[7px]">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {status.label}
        {review.status === 'approved' && (
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-current" />
            {review.rating}
          </span>
        )}
      </span>
      {product.reviewable && (
        <button
          type="button"
          onClick={() => state.open(item)}
          aria-label="Edit your review"
          className="inline-flex items-center gap-1 border-l border-current/20 bg-white/70 px-2.5 text-slate-700 transition-colors hover:bg-white hover:text-[#D97706]"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      )}
    </div>
  );
};

/** Modal with the shared review form, used for both writing and editing from the order page. */
export const OrderReviewModal: React.FC<{ state: OrderReviewsState }> = ({ state }) => {
  const { editing, close } = state;

  useEffect(() => {
    if (!editing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [editing, close]);

  if (!editing) return null;
  const review = editing.review;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-xs sm:items-center sm:p-4 print:hidden"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={review ? 'Edit your review' : 'Write a review'}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-2 shadow-2xl sm:max-w-lg sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
        <ReviewForm
          key={`${editing.productId}-${review?.id || 'new'}`}
          heading={review ? 'Edit your review' : 'Write a review'}
          submitLabel={review ? 'Update review' : 'Submit review'}
          autoFocus={false}
          {...(review ? { initial: { rating: review.rating, title: review.title, comment: review.comment } } : {})}
          note={
            <>
              <span className="font-bold text-slate-800">{editing.name}</span>
              <br />
              {review
                ? 'Edited reviews go back to admin approval before they are shown again.'
                : 'Reviews are published after admin approval.'}
            </>
          }
          onSubmit={state.submit}
          onCancel={close}
        />
      </div>
    </div>
  );
};
