import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Download, FileArchive, Loader2, RefreshCw } from 'lucide-react';
import type { Order, OrderItem } from '../../types/order';
import { downloadService } from '../../services/downloadService';

export const RUPEE = '\u20b9';
export const SUPPORT_WHATSAPP = '918807423228';

export const inr = (value: number) => `${RUPEE}${(Number(value) || 0).toLocaleString('en-IN')}`;

export const formatIst = (iso?: string, withTime = true) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return (
    d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }) + (withTime ? ' IST' : '')
  );
};

export const orderRef = (order: Order) => order.orderId || order.id;
export const isPaid = (order: Order) => (order.paymentStatus || 'Paid') === 'Paid';
export const isFreeOrder = (order: Order) => order.totalAmount <= 0;
export const canDownload = (order: Order) => isPaid(order) && order.status !== 'Cancelled';

/** Pending PhonePe order that can still be checked / retried from the result page. */
export const awaitingPayment = (order: Order) => order.paymentStatus === 'Pending' && order.status === 'Pending';

export type StatusFilter = 'All' | 'Completed' | 'Pending' | 'Failed';
export const matchesFilter = (order: Order, filter: StatusFilter) => {
  if (filter === 'All') return true;
  if (filter === 'Completed') return canDownload(order) && order.status === 'Completed';
  if (filter === 'Pending') return order.status === 'Pending' || order.status === 'Processing' || order.paymentStatus === 'Pending';
  return order.status === 'Cancelled' || order.paymentStatus === 'Failed';
};

/** Access type from the cart line title, e.g. "Product (Lifetime access)". */
export const accessType = (item: OrderItem) => {
  const match = item.title.match(/\(([^()]+)\)\s*$/);
  const label = match?.[1]?.trim();
  if (!label || /^base price$|^price$/i.test(label)) return 'Single purchase';
  return label;
};
export const itemName = (item: OrderItem) => item.title.replace(/\s*\(([^()]+)\)\s*$/, '') || item.title;

const tone = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const Pill: React.FC<{ color: keyof typeof tone; children: React.ReactNode }> = ({ color, children }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${tone[color]}`}>
    {children}
  </span>
);

export const PaymentBadge: React.FC<{ order: Order }> = ({ order }) => {
  const s = order.paymentStatus || 'Paid';
  return <Pill color={s === 'Paid' ? 'green' : s === 'Failed' ? 'red' : 'amber'}>Payment {s}</Pill>;
};

export const StatusBadge: React.FC<{ order: Order }> = ({ order }) => (
  <Pill color={order.status === 'Completed' ? 'green' : order.status === 'Processing' ? 'blue' : order.status === 'Pending' ? 'amber' : 'red'}>
    {order.status}
  </Pill>
);

export const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/50 print:hidden"
      aria-label={copied ? 'Copied' : 'Copy order ID'}
      title={copied ? 'Copied' : 'Copy order ID'}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

/** Shared download state; uses the existing secure token flow (order + customer email). */
export const useOrderDownload = () => {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const download = async (order: Order, item: OrderItem) => {
    const key = `${orderRef(order)}-${item.productId}`;
    setBusyKey(key);
    setError(null);
    try {
      const result = await downloadService.startDownload(order, item.productId, order.customerEmail);
      if (!result.success) setError(result.error || `Could not prepare the download for "${itemName(item)}".`);
    } catch (err: any) {
      setError(err?.message || `Could not prepare the download for "${itemName(item)}".`);
    } finally {
      setBusyKey(null);
    }
  };
  return { busyKey, error, setError, download };
};

export const ItemAction: React.FC<{
  order: Order;
  item: OrderItem;
  busy: boolean;
  onDownload: () => void;
}> = ({ order, item, busy, onDownload }) => {
  if (canDownload(order)) {
    return (
      <button
        type="button"
        onClick={onDownload}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#F5A623] px-3.5 py-2 text-xs font-extrabold text-white shadow-xs transition-colors hover:bg-[#e0951a] disabled:cursor-wait disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/50 print:hidden"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        {busy ? 'Preparing...' : 'Download Files'}
      </button>
    );
  }
  if (awaitingPayment(order)) {
    return (
      <Link
        to={`/payment/result/${encodeURIComponent(orderRef(order))}`}
        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-extrabold text-amber-800 hover:bg-amber-100 print:hidden"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Check payment
      </Link>
    );
  }
  return (
    <span
      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-400 print:hidden"
      title={item ? 'Downloads are available only for paid orders' : undefined}
    >
      <Download className="h-3.5 w-3.5" /> Unavailable
    </span>
  );
};

export const ItemThumb: React.FC<{ item: OrderItem; size?: string }> = ({ item, size = 'h-12 w-12' }) =>
  item.image ? (
    <img src={item.image} alt="" className={`${size} shrink-0 rounded-xl border border-slate-200 object-cover`} loading="lazy" />
  ) : (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[#F5A623]`}>
      <FileArchive className="h-5 w-5" />
    </div>
  );