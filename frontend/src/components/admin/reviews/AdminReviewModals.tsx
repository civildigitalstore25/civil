import React, { useMemo, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import ReviewForm, { type ReviewFormResult } from '../../review/ReviewForm';
import { REVIEW_LIMITS, type AdminReview, type ReviewInput } from '../../../types/review';
import type { Product } from '../../../types/product';

const ModalShell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({
  title,
  onClose,
  children,
  wide,
}) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-xs sm:items-center sm:p-4" onClick={onClose}>
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
      className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  </div>
);

interface ReviewEditorModalProps {
  /** null = create a new admin review */
  review: AdminReview | null;
  products: Product[];
  onClose: () => void;
  onSubmit: (input: ReviewInput & { productId: string }) => Promise<ReviewFormResult>;
}

export const ReviewEditorModal: React.FC<ReviewEditorModalProps> = ({ review, products, onClose, onSubmit }) => {
  const creating = !review;
  const [productId, setProductId] = useState(review?.product.id || '');
  const [productSearch, setProductSearch] = useState('');
  const [productError, setProductError] = useState('');

  const options = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    return [...products]
      .filter((p) => p.status !== 'draft')
      .filter((p) => !term || p.name.toLowerCase().includes(term) || p.id === productId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, productSearch, productId]);

  const nameEditable = creating || Boolean(review?.isAdminCreated);

  const handleSubmit = async (input: ReviewInput): Promise<ReviewFormResult> => {
    if (creating && !productId) {
      setProductError('Please select a product.');
      return { ok: false };
    }
    setProductError('');
    const result = await onSubmit({ ...input, productId });
    if (!result.ok && result.field === 'productId') {
      setProductError(result.message || 'Please select a valid product.');
      return { ok: false };
    }
    return result;
  };

  return (
    <ModalShell title={creating ? 'Add review' : 'Edit review'} onClose={onClose} wide>
      {creating ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label htmlFor="admin-review-product" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Product <span className="text-rose-500">*</span>
          </label>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
            />
          </div>
          <select
            id="admin-review-product"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setProductError('');
            }}
            className={`h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 ${
              productError ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-[#F5A000]/30'
            }`}
          >
            <option value="">{options.length ? 'Select a product' : 'No products match your search'}</option>
            {options.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.status === 'inactive' ? ' (inactive)' : ''}
              </option>
            ))}
          </select>
          {productError && <p className="mt-1 text-xs font-semibold text-rose-600">{productError}</p>}
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <p>
            Product: <span className="font-bold text-slate-900">{review.product.name || 'Deleted product'}</span>
          </p>
          <p className="mt-0.5">
            Reviewer: <span className="font-bold text-slate-900">{review.displayName}</span>
            {!nameEditable && ' (customer name cannot be changed)'}
          </p>
        </div>
      )}
      <ReviewForm
        heading={creating ? 'Review details' : 'Review content'}
        submitLabel={creating ? 'Publish review' : 'Save changes'}
        showNameField={nameEditable}
        autoFocus={false}
        initial={
          review
            ? { rating: review.rating, title: review.title, comment: review.comment, displayName: review.displayName }
            : { displayName: '' }
        }
        note={
          creating
            ? 'Admin reviews are approved instantly and appear like normal customer reviews.'
            : 'Saving keeps the current status of this review.'
        }
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </ModalShell>
  );
};

interface RejectReviewModalProps {
  review: AdminReview;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<boolean>;
}

export const RejectReviewModal: React.FC<RejectReviewModalProps> = ({ review, onClose, onConfirm }) => {
  const [reason, setReason] = useState(review.rejectionReason || '');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const ok = await onConfirm(reason.trim());
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <ModalShell title="Reject review" onClose={() => !busy && onClose()}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-xs leading-relaxed text-slate-600">
          The review by <span className="font-bold text-slate-900">{review.displayName}</span> will be hidden from the product page.
          {review.user ? ' The customer will see that it was not approved, with the reason below.' : ''}
        </p>
        <div>
          <label htmlFor="reject-reason" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Reason <span className="font-medium normal-case text-slate-400">(optional, shown to the customer)</span>
          </label>
          <textarea
            id="reject-reason"
            rows={3}
            maxLength={REVIEW_LIMITS.rejectionReasonMax}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Please remove contact details / links and resubmit."
            className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#F5A000] focus:outline-none focus:ring-2 focus:ring-[#F5A000]/25"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">
            {reason.trim().length}/{REVIEW_LIMITS.rejectionReasonMax}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={busy} className="h-10 rounded-xl px-4 text-xs font-bold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-extrabold text-white shadow-md hover:bg-rose-700 disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Reject review
          </button>
        </div>
      </form>
    </ModalShell>
  );
};
