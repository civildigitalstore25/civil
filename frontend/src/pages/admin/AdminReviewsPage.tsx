import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquarePlus,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageToolbar, { adminButtonClass } from '../../components/admin/AdminPageToolbar';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { RejectReviewModal, ReviewEditorModal } from '../../components/admin/reviews/AdminReviewModals';
import type { ReviewFormResult } from '../../components/review/ReviewForm';
import ReviewToast from '../../components/review/ReviewToast';
import { useReviewToast } from '../../components/review/useReviewToast';
import { StarRating } from '../../components/review/StarRating';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../hooks/useAuth';
import { notifyReviewsChanged, reviewApi } from '../../services/reviewApi';
import { formatReviewDate } from '../../utils/reviewFormat';
import type { AdminReview, AdminReviewCounts, ReviewInput, ReviewStatus } from '../../types/review';

type StatusTab = ReviewStatus | 'all';
const PAGE_SIZE = 20;

const STATUS_TABS: { key: StatusTab; label: string; cls: string }[] = [
  { key: 'pending', label: 'Pending', cls: 'text-amber-700' },
  { key: 'approved', label: 'Approved', cls: 'text-emerald-700' },
  { key: 'rejected', label: 'Rejected', cls: 'text-rose-700' },
  { key: 'all', label: 'All reviews', cls: 'text-slate-700' },
];

const STATUS_PILL: Record<ReviewStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const EMPTY_COUNTS: AdminReviewCounts = { all: 0, pending: 0, approved: 0, rejected: 0 };

const StatusPill: React.FC<{ status: ReviewStatus }> = ({ status }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${STATUS_PILL[status]}`}>
    {status}
  </span>
);

export const AdminReviewsPage: React.FC = () => {
  const { products } = useProducts();
  const { logout } = useAuth();
  const { toast, showToast, dismiss } = useReviewToast();

  const [status, setStatus] = useState<StatusTab>('pending');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [source, setSource] = useState<'customer' | 'admin'>('customer');
  const [sourceCounts, setSourceCounts] = useState({ customer: 0, admin: 0, customerPending: 0 });
  const [page, setPage] = useState(1);

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [counts, setCounts] = useState<AdminReviewCounts>(EMPTY_COUNTS);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const [editor, setEditor] = useState<{ review: AdminReview | null } | null>(null);
  const [rejecting, setRejecting] = useState<AdminReview | null>(null);
  const [deleting, setDeleting] = useState<AdminReview | null>(null);
  const requestRef = useRef(0);

  // Debounce search typing.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError('');
    const result = await reviewApi.admin.list({
      page,
      limit: PAGE_SIZE,
      // Admin reviews are always approved, so status tabs only apply to customer reviews.
      status: source === 'admin' ? 'all' : status,
      search,
      product: productFilter === 'all' ? '' : productFilter,
      rating: ratingFilter,
      source,
    });
    if (requestId !== requestRef.current) return;
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      if (result.sessionExpired) await logout();
      return;
    }
    setReviews(result.reviews);
    setCounts(result.counts);
    if (result.sourceCounts) setSourceCounts(result.sourceCounts);
    setPages(result.pagination.pages);
    setTotal(result.pagination.total);
    if (page > result.pagination.pages) setPage(result.pagination.pages);
  }, [page, status, search, productFilter, ratingFilter, source, logout]);

  useEffect(() => {
    void load();
  }, [load]);

  const afterMutation = (message: string) => {
    showToast(message, 'success');
    notifyReviewsChanged();
    void load();
  };

  const handleFailure = async (result: { status: number; message: string; sessionExpired?: boolean }) => {
    showToast(result.message, 'error');
    if (result.sessionExpired) await logout();
    // 404 = already removed; 0 = no response (the request may still have reached the server) - re-sync.
    else if (result.status === 404 || result.status === 0) void load();
  };

  const approve = async (review: AdminReview) => {
    setBusyId(review.id);
    const result = await reviewApi.admin.approve(review.id);
    setBusyId('');
    if (!result.ok) return handleFailure(result);
    afterMutation(`Review by ${review.displayName} approved and now visible on the product page.`);
  };

  const reject = async (reason: string): Promise<boolean> => {
    if (!rejecting) return false;
    const result = await reviewApi.admin.reject(rejecting.id, reason);
    if (!result.ok) {
      await handleFailure(result);
      return result.status === 404 || result.status === 409;
    }
    afterMutation(`Review by ${rejecting.displayName} rejected.`);
    return true;
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    setBusyId(target.id);
    const result = await reviewApi.admin.remove(target.id);
    setBusyId('');
    if (!result.ok) return handleFailure(result);
    afterMutation('Review deleted successfully.');
  };

  const saveEditor = async (input: ReviewInput & { productId: string }): Promise<ReviewFormResult> => {
    const current = editor?.review || null;
    const result = current
      ? await reviewApi.admin.update(current.id, input)
      : await reviewApi.admin.create({ ...input, displayName: input.displayName || '' });
    if (!result.ok) {
      if (result.sessionExpired || result.status === 404) {
        await handleFailure(result);
        setEditor(null);
        return { ok: false };
      }
      if (!result.field) showToast(result.message, 'error');
      return { ok: false, ...(result.field ? { field: result.field } : {}), message: result.message };
    }
    setEditor(null);
    if (!current) {
      setSource('admin');
      setPage(1);
    }
    afterMutation(current ? 'Review updated successfully.' : 'Review published successfully. It is now live on the product page.');
    return { ok: true };
  };

  const productOptions = useMemo(
    () => [
      { value: 'all', label: 'All products' },
      ...[...products].sort((a, b) => a.name.localeCompare(b.name)).map((p) => ({ value: p.id, label: p.name })),
    ],
    [products],
  );

  const filtersActive = Boolean(searchInput || productFilter !== 'all' || ratingFilter !== 'all');

  const actionButtons = (review: AdminReview, compact = false) => {
    const busy = busyId === review.id;
    const base = `inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border text-[11px] font-bold transition disabled:opacity-50 ${compact ? 'h-9 flex-1 px-2' : 'h-8'}`;
    const textPad = compact ? '' : 'px-2';
    const iconOnly = compact ? '' : 'w-8';
    return (
      <div className={`flex ${compact ? 'w-full gap-2' : 'flex-nowrap items-center justify-end gap-1'}`}>
        {review.status !== 'approved' && (
          <button type="button" disabled={busy} onClick={() => void approve(review)} className={`${base} ${textPad} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Approve
          </button>
        )}
        {review.status !== 'rejected' && (
          <button type="button" disabled={busy} onClick={() => setRejecting(review)} className={`${base} ${textPad} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}>
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => setEditor({ review })} className={`${base} ${iconOnly} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`} aria-label="Edit review" title="Edit review">
          <Pencil className="h-3.5 w-3.5" />
          {compact ? 'Edit' : ''}
        </button>
        <button type="button" disabled={busy} onClick={() => setDeleting(review)} className={`${base} ${iconOnly} border-rose-200 bg-white text-rose-600 hover:bg-rose-50`} aria-label="Delete review" title="Delete review">
          <Trash2 className="h-3.5 w-3.5" />
          {compact ? 'Delete' : ''}
        </button>
      </div>
    );
  };

  const reviewer = (review: AdminReview) => (
    <div className="min-w-0">
      <p className="truncate text-xs font-bold text-slate-900">{review.displayName}</p>
      {review.user ? (
        <p className="truncate text-[11px] text-slate-500" title={review.user.email}>
          {review.user.email || review.user.name}
        </p>
      ) : review.isAdminCreated ? (
        <p className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700">
          <ShieldCheck className="h-3 w-3" /> Admin-created
        </p>
      ) : (
        <p className="text-[11px] text-slate-400">Account deleted</p>
      )}
    </div>
  );

  const productCell = (review: AdminReview) =>
    review.product.slug ? (
      <Link to={`/${review.product.slug}/`} target="_blank" className="line-clamp-2 text-xs font-bold text-slate-800 hover:text-[#F5A000]">
        {review.product.name}
      </Link>
    ) : (
      <span className="text-xs italic text-slate-400">Deleted product</span>
    );

  const content = (review: AdminReview) => (
    <div className="min-w-0 space-y-1">
      {review.title && <p className="text-xs font-bold text-slate-900">{review.title}</p>}
      <p className="line-clamp-3 whitespace-pre-line break-words text-xs leading-relaxed text-slate-600" title={review.comment}>
        {review.comment}
      </p>
      {review.status === 'rejected' && review.rejectionReason && (
        <p className="text-[11px] font-semibold text-rose-600">Reason: {review.rejectionReason}</p>
      )}
    </div>
  );

  return (
    <AdminLayout title="Reviews">
      <ReviewToast toast={toast} onClose={dismiss} />

      <AdminPageToolbar
        title="Product Reviews"
        description="Customer reviews stay hidden until you approve them. Reviews you add are published instantly under any name."
        count={total}
        countLabel={total === 1 ? 'review' : 'reviews'}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search by reviewer, email, product or review text"
        filters={[
          { id: 'product', ariaLabel: 'Filter by product', value: productFilter, onChange: (v) => { setProductFilter(v); setPage(1); }, options: productOptions },
          {
            id: 'rating',
            ariaLabel: 'Filter by rating',
            value: ratingFilter,
            onChange: (v) => { setRatingFilter(v); setPage(1); },
            options: [{ value: 'all', label: 'All ratings' }, ...[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? 's' : ''}` }))],
          },
        ]}
        {...(filtersActive
          ? {
              onClear: () => {
                setSearchInput('');
                setSearch('');
                setProductFilter('all');
                setRatingFilter('all');
                setPage(1);
              },
            }
          : {})}
        actions={
          <>
            <button type="button" onClick={() => void load()} className={adminButtonClass.secondary} aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button type="button" onClick={() => setEditor({ review: null })} className={adminButtonClass.primary}>
              <MessageSquarePlus className="h-4 w-4" />
              <span>Add review</span>
            </button>
          </>
        }
      />

      {/* Source switch: customer reviews (moderated) vs admin-created reviews (always approved) */}
      <div role="tablist" aria-label="Review source" className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:inline-grid sm:w-auto">
        {([
          { key: 'customer', label: 'Customer reviews', icon: Users, count: sourceCounts.customer, pending: sourceCounts.customerPending },
          { key: 'admin', label: 'Admin reviews', icon: ShieldCheck, count: sourceCounts.admin, pending: 0 },
        ] as const).map((tab) => {
          const active = source === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setSource(tab.key);
                setPage(1);
              }}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-extrabold transition sm:px-5 ${
                active ? 'bg-[#0B1B2E] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
              {tab.pending > 0 ? (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white" title={`${tab.pending} pending`} aria-label={`${tab.pending} pending`}>
                  {tab.pending}
                </span>
              ) : (
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'}`} title={`${tab.count} total`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {source === 'admin' ? (
        <p className="flex items-start gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Admin reviews are published instantly under the name you choose and appear like normal customer reviews. Edit or delete them here.
        </p>
      ) : (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatus(tab.key);
                setPage(1);
              }}
              className={`rounded-2xl border p-3 text-left transition sm:p-4 ${
                active ? 'border-[#F5A000] bg-amber-50 shadow-sm ring-1 ring-[#F5A000]/40' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className={`text-[11px] font-extrabold uppercase tracking-wide ${tab.cls}`}>{tab.label}</p>
              <p className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{counts[tab.key]}</p>
            </button>
          );
        })}
      </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertCircle className="h-7 w-7 text-rose-500" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button type="button" onClick={() => void load()} className={adminButtonClass.secondary}>
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        ) : loading && !reviews.length ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm font-semibold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading reviews&hellip;
          </div>
        ) : !reviews.length ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-slate-800">
              {filtersActive
                ? 'No reviews match your filters.'
                : source === 'admin'
                  ? 'No admin reviews yet. Use "Add review" to publish one.'
                  : status === 'pending'
                  ? 'No reviews waiting for approval.'
                  : status === 'all'
                    ? 'No reviews yet.'
                    : `No ${status} reviews.`}
            </p>
            {source === 'customer' && status !== 'all' && !filtersActive && (
              <button type="button" onClick={() => setStatus('all')} className="mt-2 text-xs font-bold text-[#F5A000] hover:underline">
                View all reviews
              </button>
            )}
          </div>
        ) : (
          <div className={loading ? 'opacity-60 transition-opacity' : ''}>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Product</th>
                    <th className="px-3 py-3">Reviewer</th>
                    <th className="w-px whitespace-nowrap px-3 py-3">Rating</th>
                    <th className="px-3 py-3">Review</th>
                    <th className="w-px whitespace-nowrap px-3 py-3">Status</th>
                    <th className="w-px whitespace-nowrap px-3 py-3">Date</th>
                    <th className="w-px whitespace-nowrap px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((review) => (
                    <tr key={review.id} className="align-top hover:bg-slate-50/60">
                      <td className="w-[15%] max-w-[170px] px-3 py-3">{productCell(review)}</td>
                      <td className="w-[15%] max-w-[170px] px-3 py-3">{reviewer(review)}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <StarRating rating={review.rating} size="xs" />
                        {review.verifiedPurchase && (
                          <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </p>
                        )}
                      </td>
                      <td className="min-w-[200px] px-3 py-3">{content(review)}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <StatusPill status={review.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[11px] text-slate-500">{formatReviewDate(review.createdAt)}</td>
                      <td className="whitespace-nowrap px-3 py-3">{actionButtons(review)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / tablet cards */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {reviews.map((review) => (
                <article key={review.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    {reviewer(review)}
                    <StatusPill status={review.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <BadgeCheck className="h-3 w-3" /> Verified purchase
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">{formatReviewDate(review.createdAt)}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">{productCell(review)}</div>
                  {content(review)}
                  {actionButtons(review, true)}
                </article>
              ))}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs font-semibold text-slate-600">
                <span>
                  Page {page} of {pages}
                </span>
                <div className="flex gap-2">
                  <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`${adminButtonClass.secondary} h-9 disabled:opacity-50`}>
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button type="button" disabled={page >= pages || loading} onClick={() => setPage((p) => Math.min(pages, p + 1))} className={`${adminButtonClass.secondary} h-9 disabled:opacity-50`}>
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {editor && (
        <ReviewEditorModal review={editor.review} products={products} onClose={() => setEditor(null)} onSubmit={saveEditor} />
      )}
      {rejecting && <RejectReviewModal review={rejecting} onClose={() => setRejecting(null)} onConfirm={reject} />}
      <ConfirmModal
        isOpen={!!deleting}
        title="Delete review?"
        message={`Delete the review by "${deleting?.displayName || ''}"${deleting?.product.name ? ` on ${deleting.product.name}` : ''}? This cannot be undone and the product rating will be recalculated.`}
        confirmText="Yes, delete review"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </AdminLayout>
  );
};

export default AdminReviewsPage;
