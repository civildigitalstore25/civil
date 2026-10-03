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

export const isScheduleActive = (
  enabled: boolean | undefined,
  startDate?: string,
  startTime?: string,
  endDate?: string,
  endTime?: string,
) => {
  if (!enabled) return false;
  if (!startDate && !endDate) return true;
  const now = Date.now();
  if (startDate) {
    const start = new Date(`${startDate}T${startTime || '00:00'}`).getTime();
    if (!Number.isNaN(start) && now < start) return false;
  }
  if (endDate) {
    const end = new Date(`${endDate}T${endTime || '23:59'}`).getTime();
    if (!Number.isNaN(end) && now > end) return false;
  }
  return true;
};

export type AccessPlan = {
  id: string;
  label: string;
  priceINR: number;
  compareINR?: number;
  note?: string;
};

const pricedRow = (row: SubscriptionDuration) => positiveAmount(row.priceINR || row.price);

export const buildAccessPlans = (product: Product): AccessPlan[] => {
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
  if (freeOn) return [{ id: 'free', label: 'Free', priceINR: 0 }];

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
