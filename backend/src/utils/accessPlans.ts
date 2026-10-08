export interface AccessPlanQuote {
  id: string;
  label: string;
  priceINR: number;
}

interface DurationRow {
  duration?: string;
  price?: string;
  priceINR?: string;
  trialDays?: string;
}

export interface CatalogPricing {
  price?: number;
  oldPrice?: number;
  ebookPriceINR?: string;
  strikethroughPriceINR?: string;
  subscriptionDurations?: DurationRow[];
  subscriptions?: DurationRow[];
  dealSubscriptionDurations?: DurationRow[];
  dealSubscriptions?: DurationRow[];
  hasLifetime?: boolean;
  lifetimePrice?: string;
  lifetimePriceINR?: string;
  dealLifetimePriceINR?: string;
  hasMembership?: boolean;
  membershipPrice?: string;
  membershipPriceINR?: string;
  dealMembershipPriceINR?: string;
  isDeal?: boolean;
  dealStartDate?: string;
  dealStartTime?: string;
  dealEndDate?: string;
  dealEndTime?: string;
  dealEbookPriceINR?: string;
  isFreeProduct?: boolean;
  freeProductStartDate?: string;
  freeProductStartTime?: string;
  freeProductEndDate?: string;
  freeProductEndTime?: string;
}

const positiveAmount = (value?: string | number) => {
  const amount = typeof value === 'number' ? value : Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

const isScheduleActive = (
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

const pricedRow = (row?: DurationRow) => positiveAmount(row?.priceINR || row?.price);

export const listAccessPlans = (product: CatalogPricing): AccessPlanQuote[] => {
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

  const plans: AccessPlanQuote[] = [];
  const ebook = positiveAmount(product.ebookPriceINR);
  const dealEbook = dealOn ? positiveAmount(product.dealEbookPriceINR) : 0;
  if (ebook || dealEbook) {
    plans.push({ id: 'base', label: 'Base price', priceINR: dealEbook || ebook });
  }

  const rows = product.subscriptionDurations?.length ? product.subscriptionDurations : product.subscriptions || [];
  const dealRows = product.dealSubscriptionDurations?.length
    ? product.dealSubscriptionDurations
    : product.dealSubscriptions || [];
  rows.forEach((row, index) => {
    const regular = pricedRow(row);
    const deal = dealOn ? pricedRow(dealRows[index]) : 0;
    const priceINR = deal || regular;
    if (!priceINR) return;
    plans.push({
      id: `subscription-${index}`,
      label: String(row.duration || '').trim() || 'Subscription',
      priceINR,
    });
  });

  if (product.hasLifetime) {
    const regular = positiveAmount(product.lifetimePriceINR || product.lifetimePrice);
    const deal = dealOn ? positiveAmount(product.dealLifetimePriceINR) : 0;
    const priceINR = deal || regular;
    if (priceINR) plans.push({ id: 'lifetime', label: 'Lifetime access', priceINR });
  }

  if (product.hasMembership) {
    const regular = positiveAmount(product.membershipPriceINR || product.membershipPrice);
    const deal = dealOn ? positiveAmount(product.dealMembershipPriceINR) : 0;
    const priceINR = deal || regular;
    if (priceINR) plans.push({ id: 'membership', label: 'Membership', priceINR });
  }

  if (!plans.length && (product.price || 0) > 0) {
    plans.push({ id: 'standard', label: 'Price', priceINR: product.price || 0 });
  }

  return plans;
};

const PLAN_ID_PATTERN = /^[a-z0-9-]+$/i;

export const parseCartProductId = (raw: string): { productId: string; planId: string } | null => {
  const [productId, planId = ''] = raw.split('::');
  if (!productId || !/^[a-fA-F0-9]{24}$/.test(productId)) return null;
  if (planId && !PLAN_ID_PATTERN.test(planId)) return null;
  return { productId, planId };
};

export const quoteAccessPlan = (
  product: CatalogPricing,
  planId: string,
): AccessPlanQuote | null => {
  const plans = listAccessPlans(product);
  if (!planId) return plans[0] || null;
  return plans.find((plan) => plan.id === planId) || null;
};
