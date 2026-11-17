import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { reviewApi } from '../../services/reviewApi';
import type { Order, OrderItem } from '../../types/order';
import type { OwnReview, ReviewInput } from '../../types/review';
import type { ReviewFormResult } from '../review/ReviewForm';
import { useReviewToast } from '../review/useReviewToast';
import { canDownload, itemName } from './orderUi';

const OBJECT_ID = /^[a-f\d]{24}$/i;

export interface OrderReviewTarget {
  productId: string;
  name: string;
  review: OwnReview | null;
}

type ReviewData = {
  key: string;
  reviews: Record<string, OwnReview>;
  products: Record<string, { slug: string; reviewable: boolean }>;
  error: string;
};

/**
 * Review state for the items of one order. Only successful orders (paid and not cancelled - the same rule
 * the backend uses for "verified purchase", free checkouts included) can be reviewed from the order page.
 * Admins viewing their own order review like a customer (asCustomer: no custom name, moderated).
 */
export const useOrderReviews = (order: Order | null) => {
  const { logout } = useAuth();
  const { toast, showToast, dismiss } = useReviewToast();
  const eligible = Boolean(order && canDownload(order));

  const productIds = useMemo(
    () => [...new Set((order?.items || []).map((item) => String(item.productId || '').trim()).filter((id) => OBJECT_ID.test(id)))],
    [order],
  );
  const key = eligible ? productIds.join(',') : '';

  const [data, setData] = useState<ReviewData | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [editing, setEditing] = useState<OrderReviewTarget | null>(null);

  useEffect(() => {
    if (!key) return;
    let active = true;
    void reviewApi.getMineForProducts(key.split(',')).then(async (result) => {
      if (!active) return;
      if (!result.ok) {
        setData({ key, reviews: {}, products: {}, error: result.message });
        if (result.sessionExpired) await logout();
        return;
      }
      setData({ key, reviews: result.reviews, products: result.products, error: '' });
    });
    return () => {
      active = false;
    };
  }, [key, reloadTick, logout]);

  const current = data && data.key === key ? data : null;
  const loading = Boolean(key) && !current;

  const retry = useCallback(() => setReloadTick((n) => n + 1), []);

  const setReview = (productId: string, review: OwnReview | null) => {
    setData((prev) => {
      if (!prev) return prev;
      const reviews = { ...prev.reviews };
      if (review) reviews[productId] = review;
      else delete reviews[productId];
      return { ...prev, reviews };
    });
  };

  const open = (item: OrderItem) => {
    const productId = String(item.productId || '');
    setEditing({ productId, name: itemName(item), review: current?.reviews[productId] || null });
  };

  const close = () => setEditing(null);

  const submit = async (input: ReviewInput): Promise<ReviewFormResult> => {
    if (!editing) return { ok: false };
    const { productId, review } = editing;
    const wasEditing = Boolean(review);
    const result = review
      ? await reviewApi.update(review.id, input, { asCustomer: true })
      : await reviewApi.submit(productId, input, { asCustomer: true });

    if (!result.ok) {
      if (result.sessionExpired) {
        showToast(result.message, 'error');
        setEditing(null);
        await logout();
        return { ok: false };
      }
      if (result.status === 404 && wasEditing) {
        showToast('Your review no longer exists. It may have been removed by an admin. You can write a new one.', 'error');
        setReview(productId, null);
        setEditing({ ...editing, review: null });
        return { ok: false };
      }
      if (!result.field) showToast(result.message, 'error');
      return { ok: false, ...(result.field ? { field: result.field } : {}), message: result.message };
    }

    setEditing(null);
    setReview(productId, result.review);
    const unchanged = result.message === 'No changes to save.';
    showToast(
      unchanged
        ? 'No changes to save.'
        : wasEditing || result.updated
          ? 'Your review has been updated and sent for admin approval. It will be visible once approved.'
          : 'Thank you! Your review has been submitted and is pending admin approval.',
      unchanged ? 'info' : 'success',
    );
    return { ok: true };
  };

  return {
    eligible,
    loading,
    error: current?.error || '',
    retry,
    reviewFor: (productId: string) => current?.reviews[productId] || null,
    productInfo: (productId: string) => current?.products[productId] || null,
    editing,
    open,
    close,
    submit,
    toast,
    dismissToast: dismiss,
  };
};

export type OrderReviewsState = ReturnType<typeof useOrderReviews>;
