import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { fetchRecentPurchases, type RecentPurchase } from '../../services/recentPurchasesApi';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

const VISIBLE_MS = 5500;
const GAP_MS = 3500;
const REFRESH_MS = 5 * 60 * 1000;

const HIDDEN_PREFIXES = ['/admin', '/login', '/register', '/forgot-password', '/reset-password', '/change-password'];

const shouldHide = (pathname: string) =>
  HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/** Healargo-style bottom-left toast that cycles real paid purchases. */
export const RecentPurchaseToast: React.FC = () => {
  const { pathname } = useLocation();
  const hidden = shouldHide(pathname);

  const [purchases, setPurchases] = useState<RecentPurchase[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(() => {
    if (hidden) return;
    let cancelled = false;

    const load = async () => {
      const rows = await fetchRecentPurchases(12);
      if (!cancelled) {
        setPurchases(rows);
        setIndex(0);
      }
    };

    void load();
    const refreshId = setInterval(() => void load(), REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(refreshId);
    };
  }, [hidden]);

  useEffect(() => {
    clearTimers();
    if (hidden || purchases.length === 0) {
      setVisible(false);
      return;
    }

    setVisible(true);
    schedule(() => {
      setVisible(false);
      schedule(() => {
        setIndex((i) => (i + 1) % purchases.length);
      }, GAP_MS);
    }, VISIBLE_MS);

    return clearTimers;
  }, [hidden, purchases, index, clearTimers, schedule]);

  const dismiss = () => {
    clearTimers();
    setVisible(false);
    schedule(() => {
      setIndex((i) => (i + 1) % Math.max(purchases.length, 1));
    }, GAP_MS);
  };

  if (hidden || purchases.length === 0) return null;

  const item = purchases[index % purchases.length];
  if (!item) return null;

  return (
    <div
      className={`pointer-events-none fixed bottom-6 left-3 z-40 w-[min(100%-1.5rem,20rem)] transition-all duration-500 sm:bottom-6 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      aria-live="polite"
    >
      <div className="pointer-events-auto relative flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
        <button
          type="button"
          onClick={dismiss}
          className="absolute -right-1.5 -top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-800"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
          {item.productImage ? (
            <img src={item.productImage} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-sm font-extrabold text-[#F5A623]">CDS</span>
          )}
        </div>

        <div className="min-w-0 pr-3">
          <p className="text-xs font-semibold leading-snug text-slate-900">
            <span className="font-extrabold">{item.buyerName}</span>
            {' purchased '}
            <span className="font-bold text-slate-800">{item.productTitle}</span>
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">{formatTimeAgo(item.purchasedAt)}</p>
        </div>
      </div>
    </div>
  );
};

export default RecentPurchaseToast;
