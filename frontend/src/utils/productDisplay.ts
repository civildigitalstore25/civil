import type { Product, SubscriptionDuration } from '../types/product';

const PLACEHOLDERS = new Set([
  'zip',
  'zip / cad / pdf',
  '100 mb',
  '250 mb',
  'latest',
  'windows 10/11',
  'windows 10 / 11 (64-bit)',
  'all recent versions',
  'instant digital download',
  'lifetime unlimited',
  '4gb ram',
  'digital download files',
  'installation guide',
]);

export const plainText = (value?: string) =>
  (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const displayText = (value?: string) => {
  const text = plainText(value);
  if (!text || PLACEHOLDERS.has(text.toLowerCase())) return '';
  return text;
};

export const positiveAmount = (value?: string | number) => {
  const amount = typeof value === 'number' ? value : Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

export const reviewStats = (product: Product) => {
  const list = product.reviews || [];
  if (list.length > 0) {
    const rating = list.reduce((sum, review) => sum + (review.rating || 0), 0) / list.length;
    return { rating, count: list.length };
  }
  const count = product.reviewCount || 0;
  const rating = product.rating || 0;
  if (count <= 0 || rating <= 0) return null;
  if (count === 1 && rating === 4.8) return null;
  return { rating, count };
};

/**
 * Deal/free windows are entered in IST (separate date + time strings). Evaluated with +05:30 so every
 * browser agrees with the server. Keep in sync with backend/src/utils/productSchedule.ts.
 */
export type ScheduleStatus = 'off' | 'upcoming' | 'active' | 'ended';
export interface ScheduleState {
  status: ScheduleStatus;
  startMs: number | null;
  endMs: number | null;
}

const istInstant = (date?: string, time?: string, fallbackTime = '00:00'): number | null => {
  const d = String(date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const tm = String(time || '').trim();
  const ms = new Date(`${d}T${/^\d{2}:\d{2}$/.test(tm) ? tm : fallbackTime}:00+05:30`).getTime();
  return Number.isNaN(ms) ? null : ms;
};

export const scheduleState = (
  enabled: boolean | undefined,
  startDate?: string,
  startTime?: string,
  endDate?: string,
  endTime?: string,
  now: number = Date.now(),
): ScheduleState => {
  const startMs = istInstant(startDate, startTime, '00:00');
  const endMs = istInstant(endDate, endTime, '23:59');
  if (!enabled) return { status: 'off', startMs, endMs };
  if (startMs !== null && now < startMs) return { status: 'upcoming', startMs, endMs };
  if (endMs !== null && now > endMs) return { status: 'ended', startMs, endMs };
  return { status: 'active', startMs, endMs };
};

export const isScheduleActive = (
  enabled: boolean | undefined,
  startDate?: string,
  startTime?: string,
  endDate?: string,
  endTime?: string,
) => scheduleState(enabled, startDate, startTime, endDate, endTime).status === 'active';

export const freeOfferState = (product: Product, now?: number) =>
  scheduleState(product.isFreeProduct, product.freeProductStartDate, product.freeProductStartTime, product.freeProductEndDate, product.freeProductEndTime, now);

export const dealState = (product: Product, now?: number) =>
  scheduleState(product.isDeal, product.dealStartDate, product.dealStartTime, product.dealEndDate, product.dealEndTime, now);

/** True while a free/deal window is upcoming or active, i.e. a boundary is still ahead of us. */
export const hasLiveWindow = (product: Product) =>
  ['upcoming', 'active'].includes(freeOfferState(product).status) || ['upcoming', 'active'].includes(dealState(product).status);

export const formatIstDateTime = (ms: number) =>
  new Date(ms).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' IST';

export type AccessPlan = {
  id: string;
  label: string;
  priceINR: number;
  compareINR?: number;
  note?: string;
  /** Live limited-time deal price (compareINR holds the regular price). */
  isDeal?: boolean;
  /** Free offer is live (compareINR holds the lowest regular price). */
  isFree?: boolean;
};

const pricedRow = (row: SubscriptionDuration) => positiveAmount(row.priceINR || row.price);

/** Cheapest plan, used by product cards for display and quick add-to-cart. */
export const cheapestPlan = (plans: AccessPlan[]) =>
  plans.reduce<AccessPlan | undefined>((best, plan) => (!best || plan.priceINR < best.priceINR ? plan : best), undefined);

export const buildAccessPlans = (product: Product, options: { ignoreFree?: boolean } = {}): AccessPlan[] => {
  const dealOn = isScheduleActive(
    product.isDeal,
    product.dealStartDate,
    product.dealStartTime,
    product.dealEndDate,
    product.dealEndTime,
  );
  const freeOn = isScheduleActive(
    product.isFreeProduct,
    product.freeProductStartDate,
    product.freeProductStartTime,
    product.freeProductEndDate,
    product.freeProductEndTime,
  );
  if (freeOn && !options.ignoreFree) {
    // Same as civil-ecommerce: during the free window the only option is Free, with the regular price struck out.
    const regular = cheapestPlan(buildAccessPlans(product, { ignoreFree: true }));
    return [{ id: 'free', label: 'Free', priceINR: 0, compareINR: regular?.priceINR || undefined, isFree: true }];
  }

  const plans: AccessPlan[] = [];
  const strike = positiveAmount(product.strikethroughPriceINR);
  const ebook = positiveAmount(product.ebookPriceINR);
  const dealEbook = dealOn ? positiveAmount(product.dealEbookPriceINR) : 0;
  if (ebook || dealEbook) {
    const priceINR = dealEbook || ebook;
    plans.push({
      id: 'base',
      label: 'Base price',
      priceINR,
      compareINR: dealEbook && ebook > priceINR ? ebook : strike > priceINR ? strike : undefined,
      isDeal: Boolean(dealEbook),
    });
  }

  const rows = product.subscriptionDurations?.length ? product.subscriptionDurations : product.subscriptions || [];
  const dealRows = product.dealSubscriptionDurations?.length
    ? product.dealSubscriptionDurations
    : product.dealSubscriptions || [];
  rows.forEach((row, index) => {
    const regular = pricedRow(row);
    const deal = dealOn ? pricedRow(dealRows[index] || { duration: '', price: '', priceINR: '', priceUSD: '' }) : 0;
    const priceINR = deal || regular;
    if (!priceINR) return;
    plans.push({
      id: `subscription-${index}`,
      label: displayText(row.duration) || 'Subscription',
      priceINR,
      compareINR: deal && regular > priceINR ? regular : undefined,
      isDeal: Boolean(deal),
      note: displayText(row.trialDays) ? `${row.trialDays} day trial` : undefined,
    });
  });

  if (product.hasLifetime) {
    const regular = positiveAmount(product.lifetimePriceINR || product.lifetimePrice);
    const deal = dealOn ? positiveAmount(product.dealLifetimePriceINR) : 0;
    const priceINR = deal || regular;
    if (priceINR) {
      plans.push({
        id: 'lifetime',
        label: 'Lifetime access',
        priceINR,
        compareINR: deal && regular > priceINR ? regular : undefined,
      isDeal: Boolean(deal),
      });
    }
  }

  if (product.hasMembership) {
    const regular = positiveAmount(product.membershipPriceINR || product.membershipPrice);
    const deal = dealOn ? positiveAmount(product.dealMembershipPriceINR) : 0;
    const priceINR = deal || regular;
    if (priceINR) {
      plans.push({
        id: 'membership',
        label: 'Membership',
        priceINR,
        compareINR: deal && regular > priceINR ? regular : undefined,
      isDeal: Boolean(deal),
      });
    }
  }

  if (!plans.length && product.price > 0) {
    plans.push({
      id: 'standard',
      label: 'Price',
      priceINR: product.price,
      compareINR: product.oldPrice > product.price ? product.oldPrice : undefined,
    });
  }

  return plans;
};

export const filledFeatures = (product: Product) =>
  (product.keyFeatures || []).filter((item) => displayText(item.title) || displayText(item.description));

export const filledRequirements = (product: Product) =>
  (product.systemRequirements || []).filter((item) => displayText(item.title) || displayText(item.description));

export const filledFaqs = (product: Product) =>
  (product.faqs || []).filter((item) => displayText(item.question) || displayText(item.answer));

export const includedFileList = (product: Product) =>
  (product.includedFiles || []).map((file) => displayText(file)).filter(Boolean);
