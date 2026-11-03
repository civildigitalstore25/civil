/**
 * Deal / free-offer windows are entered in the admin form as separate date + time strings in IST.
 * The server always evaluates them itself (never trusts the client) with an explicit +05:30 offset.
 */
const IST_OFFSET = '+05:30';

const toInstant = (date: unknown, time: unknown, fallbackTime: string): number => {
  const d = String(date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return Number.NaN;
  const t = /^\d{2}:\d{2}$/.test(String(time || '').trim()) ? String(time).trim() : fallbackTime;
  return new Date(`${d}T${t}:00${IST_OFFSET}`).getTime();
};

export const isScheduleActive = (
  enabled: unknown,
  startDate?: unknown,
  startTime?: unknown,
  endDate?: unknown,
  endTime?: unknown,
  now: number = Date.now(),
): boolean => {
  if (!enabled) return false;
  const start = toInstant(startDate, startTime, '00:00');
  const end = toInstant(endDate, endTime, '23:59');
  if (!Number.isNaN(start) && now < start) return false;
  if (!Number.isNaN(end) && now > end) return false;
  return true;
};

export const isFreeOfferActive = (p: any, now?: number) =>
  isScheduleActive(p?.isFreeProduct, p?.freeProductStartDate, p?.freeProductStartTime, p?.freeProductEndDate, p?.freeProductEndTime, now);

export const isDealActive = (p: any, now?: number) =>
  isScheduleActive(p?.isDeal, p?.dealStartDate, p?.dealStartTime, p?.dealEndDate, p?.dealEndTime, now);
