import React, { useEffect, useRef, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { StarPicker } from './StarRating';
import { REVIEW_LIMITS, type ReviewInput } from '../../types/review';

export interface ReviewFormResult {
  ok: boolean;
  field?: string;
  message?: string;
}

interface ReviewFormProps {
  heading: string;
  submitLabel: string;
  /** Admins can post under any name - shows the "Reviewer name" field. */
  showNameField?: boolean;
  initial?: Partial<ReviewInput>;
  note?: React.ReactNode;
  onSubmit: (input: ReviewInput) => Promise<ReviewFormResult>;
  onCancel?: () => void;
  autoFocus?: boolean;
}

type Errors = Partial<Record<'rating' | 'title' | 'comment' | 'displayName' | 'general', string>>;

const validate = (input: ReviewInput, showNameField: boolean): Errors => {
  const errors: Errors = {};
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    errors.rating = 'Please select a star rating.';
  }
  if (showNameField) {
    const name = (input.displayName || '').trim();
    if (name.length < REVIEW_LIMITS.nameMin) errors.displayName = `Reviewer name must be at least ${REVIEW_LIMITS.nameMin} characters.`;
    else if (name.length > REVIEW_LIMITS.nameMax) errors.displayName = `Reviewer name must be ${REVIEW_LIMITS.nameMax} characters or fewer.`;
  }
  if (input.title.trim().length > REVIEW_LIMITS.titleMax) {
    errors.title = `Title must be ${REVIEW_LIMITS.titleMax} characters or fewer.`;
  }
  const comment = input.comment.trim();
  if (comment.length < REVIEW_LIMITS.commentMin) {
    errors.comment = `Please write at least ${REVIEW_LIMITS.commentMin} characters about your experience.`;
  } else if (comment.length > REVIEW_LIMITS.commentMax) {
    errors.comment = `Review must be ${REVIEW_LIMITS.commentMax} characters or fewer.`;
  }
  return errors;
};

const inputClass = (invalid?: boolean) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
    invalid ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:border-[#F5A623] focus:ring-[#F5A623]/25'
  }`;

export const ReviewForm: React.FC<ReviewFormProps> = ({
  heading,
  submitLabel,
  showNameField = false,
  initial,
  note,
  onSubmit,
  onCancel,
  autoFocus = true,
}) => {
  const [rating, setRating] = useState(initial?.rating || 0);
  const [title, setTitle] = useState(initial?.title || '');
  const [comment, setComment] = useState(initial?.comment || '');
  const [displayName, setDisplayName] = useState(initial?.displayName || '');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const rootRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (autoFocus) rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [autoFocus]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const input: ReviewInput = {
      rating,
      title: title.trim(),
      comment: comment.trim(),
      ...(showNameField ? { displayName: displayName.trim() } : {}),
    };
    const nextErrors = validate(input, showNameField);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    const result = await onSubmit(input);
    setSubmitting(false);
    if (!result.ok && result.message) {
      const field = result.field as keyof Errors | undefined;
      setErrors(field && ['rating', 'title', 'comment', 'displayName'].includes(field) ? { [field]: result.message } : { general: result.message });
    }
  };

  const commentLength = comment.trim().length;

  return (
    <form
      ref={rootRef}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/70 to-white p-4 shadow-sm sm:p-6"
    >
      <h4 className="text-base font-extrabold text-slate-900 sm:text-lg">{heading}</h4>
      {note && <div className="mt-1.5 text-xs leading-relaxed text-slate-600">{note}</div>}

      <div className="mt-4 space-y-4">
        {showNameField && (
          <div>
            <label htmlFor="review-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
              Reviewer name <span className="text-rose-500">*</span>
            </label>
            <input
              id="review-name"
              type="text"
              value={displayName}
              maxLength={REVIEW_LIMITS.nameMax}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Name shown on the review"
              className={inputClass(Boolean(errors.displayName))}
              disabled={submitting}
            />
            {errors.displayName && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.displayName}</p>}
            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Admin only: published instantly and shown like a normal customer review.
            </p>
          </div>
        )}

        <div>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Your rating <span className="text-rose-500">*</span>
          </span>
          <StarPicker
            value={rating}
            onChange={(value) => {
              setRating(value);
              setErrors((prev) => ({ ...prev, rating: undefined }));
            }}
            disabled={submitting}
            invalid={Boolean(errors.rating)}
          />
          {errors.rating && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.rating}</p>}
        </div>

        <div>
          <label htmlFor="review-title" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Title <span className="font-medium normal-case text-slate-400">(optional)</span>
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            maxLength={REVIEW_LIMITS.titleMax}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            className={inputClass(Boolean(errors.title))}
            disabled={submitting}
          />
          {errors.title && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="review-comment" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Your review <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="review-comment"
            rows={4}
            value={comment}
            maxLength={REVIEW_LIMITS.commentMax}
            onChange={(e) => {
              setComment(e.target.value);
              if (errors.comment) setErrors((prev) => ({ ...prev, comment: undefined }));
            }}
            placeholder="What did you like or dislike? How did it help your work?"
            className={`${inputClass(Boolean(errors.comment))} min-h-[110px] resize-y leading-relaxed`}
            disabled={submitting}
          />
          <div className="mt-1 flex items-start justify-between gap-3">
            <p className="text-xs font-semibold text-rose-600">{errors.comment || ''}</p>
            <span className={`shrink-0 text-[11px] font-medium ${commentLength < REVIEW_LIMITS.commentMin ? 'text-slate-400' : 'text-emerald-600'}`}>
              {commentLength}/{REVIEW_LIMITS.commentMax}
            </span>
          </div>
        </div>

        {errors.general && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {errors.general}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 text-sm font-extrabold text-white shadow-md transition hover:bg-[#D97706] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Submitting\u2026' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReviewForm;
