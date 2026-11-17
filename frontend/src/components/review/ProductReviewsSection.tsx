import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Loader2,
  LogIn,
  MessageSquarePlus,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { reviewApi } from '../../services/reviewApi';
import ConfirmModal from '../admin/ConfirmModal';
import { ReviewEditorModal } from '../admin/reviews/AdminReviewModals';
import { StarRating } from './StarRating';
import ReviewCard from './ReviewCard';
import ReviewForm, { type ReviewFormResult } from './ReviewForm';
import ReviewToast from './ReviewToast';
import { useReviewToast } from './useReviewToast';
import {
  EMPTY_REVIEW_SUMMARY,
  type AdminReview,
  type OwnReview,
  type PublicReview,
  type ReviewInput,
  type ReviewSort,
  type ReviewSummary,
} from '../../types/review';

const PAGE_SIZE = 5;

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest', label: 'Highest rating' },
  { value: 'lowest', label: 'Lowest rating' },
];

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  onSummaryChange?: (summary: ReviewSummary) => void;
}

type FormMode = 'closed' | 'create' | 'edit';

/**
 * Product reviews: civil-ecommerce layout (ratings sidebar + toolbar + review list) with civil's styling,
 * plus the moderation states (pending / rejected / approved) for the signed-in customer's own review.
 */
export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ productId, productName, onSummaryChange }) => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast, dismiss } = useReviewToast();

  const [summary, setSummary] = useState<ReviewSummary>(EMPTY_REVIEW_SUMMARY);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [sort, setSort] = useState<ReviewSort>('newest');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState('');

  const [mine, setMine] = useState<OwnReview | null>(null);
  const [mineLoading, setMineLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('closed');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const listRequest = useRef(0);
  const summaryCallback = useRef(onSummaryChange);
  useEffect(() => {
    summaryCallback.current = onSummaryChange;
  }, [onSummaryChange]);

  const loadReviews = useCallback(
    async (nextPage: number, append: boolean) => {
      const requestId = ++listRequest.current;
      if (append) setLoadingMore(true);
      else {
        setListLoading(true);
        setListError('');
      }
      const result = await reviewApi.getProductReviews(productId, {
        page: nextPage,
        limit: PAGE_SIZE,
        sort,
        rating: ratingFilter || undefined,
      });
      if (requestId !== listRequest.current) return; // a newer request (filter change) superseded this one
      setListLoading(false);
      setLoadingMore(false);
      if (!result.ok) {
        if (append) showToast(result.message, 'error');
        else setListError(result.message);
        return;
      }
      setSummary(result.summary);
      summaryCallback.current?.(result.summary);
      setReviews((prev) => (append ? [...prev, ...result.reviews.filter((r) => !prev.some((p) => p.id === r.id))] : result.reviews));
      setPage(result.pagination.page);
      setHasMore(result.pagination.hasMore);
      setFilteredTotal(result.pagination.total);
    },
    [productId, sort, ratingFilter, showToast],
  );

  const userId = currentUser?.id || '';

  const loadMine = useCallback(async () => {
    if (!userId || !isAuthenticated || isAdmin) {
      setMine(null);
      setHasPurchased(false);
      return;
    }
    setMineLoading(true);
    const result = await reviewApi.getMine(productId);
    setMineLoading(false);
    if (result.ok) {
      setMine(result.review);
      setHasPurchased(result.hasPurchased);
    } else if (result.status === 401) {
      // Stale local session - treat as logged out so the login prompt is shown.
      await logout();
    }
  }, [productId, userId, isAuthenticated, isAdmin, logout]);

  useEffect(() => {
    void loadReviews(1, false);
  }, [loadReviews]);

  useEffect(() => {
    void loadMine();
  }, [loadMine]);

  const goToLogin = () => {
    navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } } });
  };

  const handleSessionExpired = async (message: string) => {
    showToast(message, 'error');
    setFormMode('closed');
    await logout();
  };

  const openForm = () => {
    if (!isAuthenticated) {
      showToast('Please log in to write a review.', 'info');
      goToLogin();
      return;
    }
    setFormMode(mine ? 'edit' : 'create');
  };

  const handleSubmit = async (input: ReviewInput): Promise<ReviewFormResult> => {
    const editing = formMode === 'edit' && mine;
    const wasApproved = mine?.status === 'approved';
    const result = editing ? await reviewApi.update(mine.id, input) : await reviewApi.submit(productId, input);

    if (!result.ok) {
      if (result.sessionExpired) {
        await handleSessionExpired(result.message);
        return { ok: false };
      }
      if (result.status === 404 && editing) {
        showToast('Your review no longer exists. It may have been removed by an admin. You can write a new one.', 'error');
        setMine(null);
        setFormMode('create');
        return { ok: false };
      }
      if (!result.field) showToast(result.message, 'error');
      return { ok: false, ...(result.field ? { field: result.field } : {}), message: result.message };
    }

    setFormMode('closed');
    if (isAdmin) {
      showToast(result.message || 'Review published successfully.', 'success');
      void loadReviews(1, false);
      return { ok: true };
    }

    setMine(result.review);
    const unchanged = result.message === 'No changes to save.';
    showToast(
      unchanged
        ? 'No changes to save.'
        : editing || result.updated
          ? 'Your review has been updated and sent for admin approval. It will be visible once approved.'
          : 'Thank you! Your review has been submitted and is pending admin approval.',
      unchanged ? 'info' : 'success',
    );
    if (wasApproved && !unchanged) void loadReviews(1, false);
    return { ok: true };
  };

  /* ---------------------------------------------- admin moderation on the product page */

  const perms = currentUser?.permissions || [];
  const canModerate =
    isAdmin && (currentUser?.role === 'superadmin' || !perms.length || perms.includes('reviews') || perms.includes('products'));
  const [adminEditing, setAdminEditing] = useState<PublicReview | null>(null);
  const [adminDeleting, setAdminDeleting] = useState<PublicReview | null>(null);
  const [adminBusyId, setAdminBusyId] = useState('');

  const asAdminReview = (review: PublicReview): AdminReview => ({
    ...review,
    status: 'approved',
    rejectionReason: '',
    isAdminCreated: Boolean(review.isAdminCreated),
    orderRef: '',
    approvedAt: null,
    product: { id: productId, name: productName, slug: '' },
    user: review.isAdminCreated ? null : { id: '', name: review.displayName, email: '' },
  });

  const handleAdminFailure = async (result: { status: number; message: string; sessionExpired?: boolean }) => {
    if (result.sessionExpired) {
      await handleSessionExpired(result.message);
      return;
    }
    if (result.status === 404) {
      showToast('This review was already removed. The list has been refreshed.', 'info');
      void loadReviews(1, false);
      return;
    }
    showToast(result.message, 'error');
  };

  const saveAdminEdit = async (input: ReviewInput): Promise<ReviewFormResult> => {
    if (!adminEditing) return { ok: false };
    const payload: ReviewInput = adminEditing.isAdminCreated
      ? input
      : { rating: input.rating, title: input.title, comment: input.comment };
    const result = await reviewApi.admin.update(adminEditing.id, payload);
    if (!result.ok) {
      if (result.sessionExpired || result.status === 404) {
        setAdminEditing(null);
        await handleAdminFailure(result);
        return { ok: false };
      }
      if (!result.field) showToast(result.message, 'error');
      return { ok: false, ...(result.field ? { field: result.field } : {}), message: result.message };
    }
    setAdminEditing(null);
    showToast('Review updated successfully.', 'success');
    void loadReviews(1, false);
    return { ok: true };
  };

  const confirmAdminDelete = async () => {
    if (!adminDeleting || adminBusyId) return;
    const target = adminDeleting;
    setAdminBusyId(target.id);
    const result = await reviewApi.admin.remove(target.id);
    setAdminBusyId('');
    setAdminDeleting(null);
    if (!result.ok) {
      await handleAdminFailure(result);
      return;
    }
    showToast(`Review by ${target.displayName} deleted.`, 'success');
    void loadReviews(1, false);
  };

  const adminActions = (review: PublicReview) =>
    canModerate ? (
      <>
        <button
          type="button"
          onClick={() => setAdminEditing(review)}
          disabled={adminBusyId === review.id}
          title="Edit review"
          aria-label={`Edit review by ${review.displayName}`}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 transition hover:border-[#F5A623] hover:text-[#D97706] disabled:opacity-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          type="button"
          onClick={() => setAdminDeleting(review)}
          disabled={adminBusyId === review.id}
          title="Delete review"
          aria-label={`Delete review by ${review.displayName}`}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-200 bg-white px-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
        >
          {adminBusyId === review.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">Delete</span>
        </button>
      </>
    ) : null;

  const handleDelete = async () => {
    if (!mine || deleting) return;
    setDeleting(true);
    const wasApproved = mine.status === 'approved';
    const result = await reviewApi.remove(mine.id);
    setDeleting(false);
    setConfirmDelete(false);
    if (!result.ok) {
      if (result.sessionExpired) return handleSessionExpired(result.message);
      if (result.status === 404) {
        setMine(null);
        showToast('This review was already removed.', 'info');
        return;
      }
      showToast(result.message, 'error');
      return;
    }
    setMine(null);
    setFormMode('closed');
    showToast('Your review has been deleted.', 'success');
    if (wasApproved) void loadReviews(1, false);
  };

  const total = summary.totalReviews;
  const visibleReviews = mine?.status === 'approved' ? reviews.filter((r) => r.id !== mine.id) : reviews;

  /* ------------------------------------------------------------ pieces */

  const sidebar = (
    <aside className="lg:col-span-1">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-40">
        <h4 className="text-base font-extrabold text-slate-900">Customer Ratings</h4>
        <div className="mt-4 flex items-center gap-4 lg:flex-col lg:items-center lg:text-center">
          <div className="text-4xl font-black leading-none text-slate-900 sm:text-5xl">{total ? summary.averageRating.toFixed(1) : '0.0'}</div>
          <div className="space-y-1">
            <StarRating rating={summary.averageRating} size="lg" />
            <p className="text-xs font-semibold text-slate-500">
              {total ? `${summary.averageRating.toFixed(1)} out of 5 \u00b7 ` : ''}
              {total} customer rating{total === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.distribution[String(star) as keyof ReviewSummary['distribution']] || 0;
            const pct = total ? Math.round((count / total) * 100) : 0;
            const active = ratingFilter === star;
            return (
              <button
                key={star}
                type="button"
                disabled={!count}
                onClick={() => setRatingFilter(active ? 0 : star)}
                title={count ? `Show ${star}-star reviews` : undefined}
                className={`flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-xs transition ${
                  active ? 'bg-amber-100 ring-1 ring-amber-300' : count ? 'hover:bg-white' : 'cursor-default'
                }`}
              >
                <span className="w-12 shrink-0 text-left font-bold text-slate-700">{star} star</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <span className="block h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-9 shrink-0 text-right font-bold text-slate-500">{pct}%</span>
              </button>
            );
          })}
        </div>

        {formMode === 'closed' && (
          <div className="mt-5 border-t border-slate-200 pt-4">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={goToLogin}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#F5A623] bg-white text-sm font-bold text-[#D97706] transition hover:bg-[#F5A623] hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                Login to write a review
              </button>
            ) : isAdmin ? (
              <button
                type="button"
                onClick={() => setFormMode('create')}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#F5A623] bg-white text-sm font-bold text-[#D97706] transition hover:bg-[#F5A623] hover:text-white"
              >
                <MessageSquarePlus className="h-4 w-4" />
                Add a review
              </button>
            ) : (
              !mineLoading && (
                <button
                  type="button"
                  onClick={openForm}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#F5A623] bg-white text-sm font-bold text-[#D97706] transition hover:bg-[#F5A623] hover:text-white"
                >
                  {mine ? <Pencil className="h-4 w-4" /> : <MessageSquarePlus className="h-4 w-4" />}
                  {mine ? 'Edit your review' : 'Write a review'}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </aside>
  );

  const ownActions = mine && (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setFormMode('edit')}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-[#F5A623] hover:text-[#D97706]"
      >
        <Pencil className="h-3.5 w-3.5" />
        {mine.status === 'rejected' ? 'Edit & resubmit' : 'Edit'}
      </button>
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );

  const ownReviewPanel = (() => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Used {productName}?</p>
            <p className="text-xs text-slate-500">Log in to share your rating and help other engineers decide.</p>
          </div>
          <button
            type="button"
            onClick={goToLogin}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#D97706]"
          >
            <LogIn className="h-4 w-4" />
            Login to write a review
          </button>
        </div>
      );
    }

    if (isAdmin) {
      return formMode === 'closed' ? (
        <div className="flex items-start gap-2.5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <span className="font-bold">Admin mode:</span> reviews you add here are published immediately under the name you choose and look
            like normal customer reviews. Use <span className="font-bold">Edit</span> / <span className="font-bold">Delete</span> on any review below, and approve
            pending customer reviews from <span className="font-bold">Admin &rsaquo; Reviews</span>.
          </p>
        </div>
      ) : null;
    }

    if (mineLoading) {
      return (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your review&hellip;
        </div>
      );
    }

    if (!mine) {
      return formMode === 'closed' && hasPurchased ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-xs font-semibold text-emerald-900">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
            You purchased this product. Your review will carry a Verified Purchase badge.
          </p>
          <button
            type="button"
            onClick={openForm}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" /> Write a review
          </button>
        </div>
      ) : null;
    }

    if (formMode === 'edit') return null;

    const banner =
      mine.status === 'pending'
        ? {
            icon: <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />,
            cls: 'border-amber-200 bg-amber-50 text-amber-900',
            title: 'Your review is pending admin approval',
            text: 'Only you can see it right now. It will be visible to everyone once an admin approves it.',
          }
        : mine.status === 'rejected'
          ? {
              icon: <XCircle className="mt-0.5 h-4 w-4 shrink-0" />,
              cls: 'border-rose-200 bg-rose-50 text-rose-900',
              title: 'Your review was not approved',
              text: mine.rejectionReason
                ? `Reason: ${mine.rejectionReason}`
                : 'It did not meet our review guidelines. You can edit it and submit it again.',
            }
          : {
              icon: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />,
              cls: 'border-emerald-200 bg-emerald-50 text-emerald-900',
              title: 'Your review is live',
              text: 'Thanks for sharing! Editing it will send it for approval again.',
            };

    return (
      <div className="space-y-2">
        <div className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs ${banner.cls}`}>
          {banner.icon}
          <div>
            <p className="text-sm font-bold">{banner.title}</p>
            <p className="mt-0.5 leading-relaxed">{banner.text}</p>
          </div>
        </div>
        <ReviewCard review={mine} highlight footer={ownActions} />
      </div>
    );
  })();

  const form =
    formMode === 'closed' || !isAuthenticated ? null : (
      <ReviewForm
        key={`${formMode}-${mine?.id || 'new'}`}
        heading={isAdmin ? 'Add a review (admin)' : formMode === 'edit' ? 'Edit your review' : 'Write a review'}
        submitLabel={isAdmin ? 'Publish review' : formMode === 'edit' ? (mine?.status === 'rejected' ? 'Resubmit review' : 'Update review') : 'Submit review'}
        showNameField={isAdmin}
        initial={
          isAdmin
            ? { displayName: '' }
            : formMode === 'edit' && mine
              ? { rating: mine.rating, title: mine.title, comment: mine.comment }
              : undefined
        }
        note={
          isAdmin ? (
            <>Published instantly for <span className="font-bold">{productName}</span>.</>
          ) : formMode === 'edit' && mine?.status === 'approved' ? (
            'Saving changes sends your review for approval again. It will be hidden until an admin approves it.'
          ) : (
            <>
              Reviews are checked by our team before they appear publicly.
              {hasPurchased && <span className="font-semibold text-emerald-700"> Your review will show a Verified Purchase badge.</span>}
            </>
          )
        }
        onSubmit={handleSubmit}
        onCancel={() => setFormMode('closed')}
      />
    );

  const list = (() => {
    if (listLoading) {
      return (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-slate-200" />
                  <div className="h-3 w-1/4 rounded bg-slate-100" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-4/5 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (listError) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <AlertCircle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-800">{listError}</p>
          <button
            type="button"
            onClick={() => void loadReviews(1, false)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      );
    }

    if (!visibleReviews.length) {
      if (ratingFilter && total) {
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">No {ratingFilter}-star reviews yet.</p>
            <button type="button" onClick={() => setRatingFilter(0)} className="mt-2 text-xs font-bold text-[#D97706] hover:underline">
              Show all reviews
            </button>
          </div>
        );
      }
      if (mine?.status === 'approved') return null;
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
          <MessageSquarePlus className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-bold text-slate-800">No reviews yet</p>
          <p className="mt-1 text-xs text-slate-500">Be the first to review this product!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} actions={adminActions(review)} />
        ))}
        {hasMore && (
          <div className="pt-1 text-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => void loadReviews(page + 1, true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-[#F5A623] hover:text-[#D97706] disabled:opacity-60"
            >
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
              {loadingMore ? 'Loading\u2026' : `Show more reviews (${Math.max(0, filteredTotal - reviews.length)} more)`}
            </button>
          </div>
        )}
      </div>
    );
  })();

  return (
    <div className="space-y-4">
      <ReviewToast toast={toast} onClose={dismiss} />

      {total > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-800">
            {ratingFilter ? `${filteredTotal} of ${total}` : total} review{(ratingFilter ? filteredTotal : total) === 1 ? '' : 's'}
            {ratingFilter ? ` with ${ratingFilter} star${ratingFilter > 1 ? 's' : ''}` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ReviewSort)}
                className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              Ratings
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
              >
                <option value={0}>All ratings</option>
                {[5, 4, 3, 2, 1].map((star) => (
                  <option key={star} value={star}>
                    {star} star{star > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
        {sidebar}
        <div className="min-w-0 space-y-4 lg:col-span-3">
          {ownReviewPanel}
          {form}
          {list}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        title="Delete your review?"
        message="Your review will be permanently removed. You can write a new one later."
        confirmText={deleting ? 'Deleting\u2026' : 'Yes, delete review'}
        cancelText="Keep review"
        onConfirm={() => void handleDelete()}
        onCancel={() => !deleting && setConfirmDelete(false)}
      />

      {canModerate && adminEditing && (
        <ReviewEditorModal
          review={asAdminReview(adminEditing)}
          products={[]}
          onClose={() => setAdminEditing(null)}
          onSubmit={saveAdminEdit}
        />
      )}
      <ConfirmModal
        isOpen={canModerate && !!adminDeleting}
        title="Delete this review?"
        message={`The review by "${adminDeleting?.displayName || ''}" will be permanently removed and the product rating recalculated.`}
        confirmText={adminBusyId ? 'Deleting\u2026' : 'Yes, delete review'}
        cancelText="Cancel"
        onConfirm={() => void confirmAdminDelete()}
        onCancel={() => !adminBusyId && setAdminDeleting(null)}
      />
    </div>
  );
};

export default ProductReviewsSection;
