import { API_BASE_URL } from '../constants/auth';
import type {
  AdminReview,
  AdminReviewCounts,
  OwnReview,
  PublicReview,
  RecentReview,
  ReviewInput,
  ReviewPagination,
  ReviewSort,
  ReviewStatus,
  ReviewSummary,
} from '../types/review';

/** Result of every review API call. `status` is the HTTP status (0 = network failure). */
export type ReviewResult<T> =
  | ({ ok: true; status: number; message?: string } & T)
  | { ok: false; status: number; message: string; field?: string; sessionExpired?: boolean };

export const REVIEW_EVENTS = {
  /** Fired after any admin moderation so the sidebar badge can refresh. */
  changed: 'civil:reviews-changed',
} as const;

const OFFLINE_ERROR = 'You appear to be offline. Please check your internet connection and try again.';
const UNREACHABLE_ERROR =
  'Could not reach the server (it may be restarting or blocked by the browser). Please wait a moment and try again.';

/** fetch() only rejects when no HTTP response arrived: offline, server down/restarting, or a CORS block. */
const networkFailureMessage = () =>
  typeof navigator !== 'undefined' && navigator.onLine === false ? OFFLINE_ERROR : UNREACHABLE_ERROR;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const friendlyError = (status: number, message?: string): string => {
  if (status === 401) return 'Your session has expired. Please log in again to continue.';
  if (status === 403) return message || 'You do not have permission to do that.';
  if (status === 429) return message || 'Too many requests. Please wait a few minutes and try again.';
  if (status >= 500) return message || 'Something went wrong on our side. Please try again shortly.';
  return message || 'Something went wrong. Please try again.';
};

async function call<T>(path: string, init: RequestInit = {}): Promise<ReviewResult<T>> {
  let response: Response;
  try {
    const headers = new Headers(init.headers);
    // Only set JSON content-type when there is a body (approve used to send
    // Content-Type with an empty body, which forced an awkward preflight).
    if (init.body !== undefined && init.body !== null && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const send = () =>
      fetch(`${API_BASE_URL}${path}`, {
        ...init,
        credentials: 'include',
        headers,
      });
    // Retry idempotent methods (GET, PUT, DELETE) up to twice when no response arrives - covers a dev
    // server that is mid-restart (tsx watch). POST is never retried so a review can't be created twice.
    const method = (init.method || 'GET').toUpperCase();
    const retryDelays = method === 'POST' ? [] : [1500, 3000];
    for (let attempt = 0; ; attempt += 1) {
      try {
        response = await send();
        break;
      } catch (error) {
        const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
        if (offline || attempt >= retryDelays.length) throw error;
        await wait(retryDelays[attempt]);
      }
    }
  } catch {
    return { ok: false, status: 0, message: networkFailureMessage() };
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    data = {};
  }

  const message = typeof data.message === 'string' ? data.message : typeof data.error === 'string' ? data.error : undefined;
  if (!response.ok || data.success === false) {
    return {
      ok: false,
      status: response.status,
      message: friendlyError(response.status, message),
      ...(typeof data.field === 'string' ? { field: data.field } : {}),
      ...(response.status === 401 ? { sessionExpired: true } : {}),
    };
  }
  return { ...(data as T), ok: true, status: response.status, ...(message ? { message } : {}) };
}

const qs = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

const enc = encodeURIComponent;

export const reviewApi = {
  getProductReviews(
    productId: string,
    params: { page?: number; limit?: number; sort?: ReviewSort; rating?: number } = {},
  ) {
    return call<{ reviews: PublicReview[]; summary: ReviewSummary; pagination: ReviewPagination }>(
      `/reviews/product/${enc(productId)}${qs({ ...params, rating: params.rating || undefined })}`,
    );
  },

  getRecent(limit = 6) {
    return call<{ reviews: RecentReview[] }>(`/reviews/recent${qs({ limit })}`);
  },

  getMine(productId: string) {
    return call<{ review: OwnReview | null; hasPurchased: boolean; isAdmin: boolean }>(
      `/reviews/product/${enc(productId)}/mine`,
    );
  },

  /** Customers: creates (or updates) their review. Admins: publishes a review under `displayName`. */
  submit(productId: string, input: ReviewInput) {
    return call<{ review: OwnReview; updated?: boolean }>(`/reviews/product/${enc(productId)}`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(reviewId: string, input: ReviewInput) {
    return call<{ review: OwnReview; updated?: boolean }>(`/reviews/${enc(reviewId)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  remove(reviewId: string) {
    return call<Record<string, never>>(`/reviews/${enc(reviewId)}`, { method: 'DELETE' });
  },

  admin: {
    list(params: {
      page?: number;
      limit?: number;
      status?: ReviewStatus | 'all';
      product?: string;
      search?: string;
      rating?: string;
      source?: string;
    }) {
      return call<{
        reviews: AdminReview[];
        counts: AdminReviewCounts;
        sourceCounts?: { customer: number; admin: number; customerPending: number };
        pagination: ReviewPagination;
      }>(
        `/reviews/admin${qs(params)}`,
      );
    },
    pendingCount() {
      return call<{ count: number }>('/reviews/admin/pending-count');
    },
    create(input: ReviewInput & { productId: string; displayName: string }) {
      return call<{ review: AdminReview }>('/reviews/admin', { method: 'POST', body: JSON.stringify(input) });
    },
    update(reviewId: string, input: ReviewInput) {
      return call<{ review: AdminReview }>(`/reviews/admin/${enc(reviewId)}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
    },
    approve(reviewId: string) {
      return call<{ review: AdminReview }>(`/reviews/admin/${enc(reviewId)}/approve`, {
        method: 'PUT',
        body: JSON.stringify({}),
      });
    },
    reject(reviewId: string, reason: string) {
      return call<{ review: AdminReview }>(`/reviews/admin/${enc(reviewId)}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
    },
    remove(reviewId: string) {
      return call<Record<string, never>>(`/reviews/admin/${enc(reviewId)}`, { method: 'DELETE' });
    },
  },
};

export const notifyReviewsChanged = () => {
  window.dispatchEvent(new Event(REVIEW_EVENTS.changed));
};

export default reviewApi;
