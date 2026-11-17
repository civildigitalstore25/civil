import { useCallback, useEffect, useRef, useState } from 'react';

export type ReviewToastType = 'success' | 'error' | 'info';
export interface ReviewToastState {
  id: number;
  message: string;
  type: ReviewToastType;
}

/** Small self-contained toast (the app has no global toast provider). */
export const useReviewToast = () => {
  const [toast, setToast] = useState<ReviewToastState | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string, type: ReviewToastType = 'success') => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, type });
    timer.current = window.setTimeout(() => setToast(null), type === 'error' ? 6000 : 4500);
  }, []);

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current);
    setToast(null);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { toast, showToast, dismiss };
};

export default useReviewToast;
