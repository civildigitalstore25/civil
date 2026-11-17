import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

import type { ReviewToastState, ReviewToastType } from './useReviewToast';

const STYLES: Record<ReviewToastType, string> = {
  success: 'bg-emerald-900 text-emerald-50 border-emerald-700',
  error: 'bg-rose-900 text-rose-50 border-rose-700',
  info: 'bg-slate-900 text-slate-50 border-slate-700',
};

export const ReviewToast: React.FC<{ toast: ReviewToastState | null; onClose: () => void }> = ({ toast, onClose }) => {
  if (!toast) return null;
  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertTriangle : Info;
  return (
    <div
      key={toast.id}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`fixed left-1/2 top-4 z-[80] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl sm:left-auto sm:right-5 sm:top-5 sm:translate-x-0 ${STYLES[toast.type]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification" className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ReviewToast;
