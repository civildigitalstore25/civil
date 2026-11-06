import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronRight, Download, PackageOpen, Receipt, Search, Wallet, X } from 'lucide-react';
import AnnouncementBar from '../../components/layout/AnnouncementBar';
import Header from '../../components/layout/Header';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types/order';
import {
  CopyButton, ItemAction, ItemThumb, PaymentBadge, Pill, StatusBadge, accessType, canDownload, formatIst, inr,
  isFreeOrder, itemName, matchesFilter, orderRef, useOrderDownload, type StatusFilter,
} from '../../components/orders/orderUi';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Failed', label: 'Failed / Cancelled' },
];

const Skeleton = () => (
  <div className="animate-pulse space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
    <div className="flex justify-between"><div className="h-4 w-48 rounded bg-slate-200" /><div className="h-4 w-20 rounded bg-slate-200" /></div>
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><div className="h-12 w-12 rounded-xl bg-slate-200" /><div className="h-3 w-1/2 rounded bg-slate-200" /></div>
  </div>
);

export const MyOrdersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [successNotice, setSuccessNotice] = useState<string | null>(
    (location.state as any)?.paymentSuccess || null
  );
  const [orders, setOrders] = useState<Order[]>(() => orderService.getUserOrders(currentUser?.id, currentUser?.email));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [query, setQuery] = useState('');
  const { busyKey, error, setError, download } = useOrderDownload();

  const load = () => {
    setLoading(true);
    setLoadError(null);
    orderService
      .fetchUserOrders(currentUser?.id, currentUser?.email)
      .then((latest) => setOrders(latest))
      .catch((err: any) => setLoadError(err?.message || 'Could not load your orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    orderService
      .fetchUserOrders(currentUser?.id, currentUser?.email)
      .then((latest) => { if (active) setOrders(latest); })
      .catch((err: any) => { if (active) setLoadError(err?.message || 'Could not load your orders.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [currentUser]);

  const sorted = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );

  const stats = useMemo(() => {
    const paid = sorted.filter(canDownload);
    return {
      total: sorted.length,
      spent: paid.reduce((sum, o) => sum + o.totalAmount, 0),
      downloads: paid.reduce((sum, o) => sum + o.items.length, 0),
    };
  }, [sorted]);

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.key, sorted.filter((o) => matchesFilter(o, f.key)).length])) as Record<StatusFilter, number>,
    [sorted]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter(
      (o) =>
        matchesFilter(o, filter) &&
        (!q || orderRef(o).toLowerCase().includes(q) || o.items.some((it) => it.title.toLowerCase().includes(q)))
    );
  }, [sorted, filter, query]);

  const showSkeleton = loading && orders.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 selection:bg-[#F5A623] selection:text-white">
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-grow space-y-6 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/account" className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-[#D97706] hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Account
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Orders</h1>
            <p className="text-xs text-slate-500 sm:text-sm">Track your purchases, download files and view invoices.</p>
          </div>
        </div>

        {successNotice && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm font-bold text-emerald-800 animate-fade-in shadow-2xs">
            <span className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </span>
            <button
              type="button"
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Receipt, label: 'Total orders', value: String(stats.total) },
            { icon: Wallet, label: 'Total spent', value: inr(stats.spent) },
            { icon: Download, label: 'Downloads available', value: String(stats.downloads) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[#D97706] sm:flex">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</p>
                <p className="truncate text-base font-extrabold text-slate-900 sm:text-lg">{showSkeleton ? '-' : value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter orders by status">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  filter === f.key
                    ? 'border-[#F5A623] bg-[#F5A623] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#F5A623]/60'
                }`}
              >
                {f.label} <span className="opacity-75">({counts[f.key] ?? 0})</span>
              </button>
            ))}
          </div>
          <label className="relative block md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order ID or product"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
        </div>

        {(error || loadError) && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
            <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error || loadError}</span>
            <span className="flex shrink-0 gap-3">
              {loadError && <button type="button" onClick={load} className="font-bold underline">Retry</button>}
              <button type="button" onClick={() => { setError(null); setLoadError(null); }} aria-label="Dismiss"><X className="h-4 w-4" /></button>
            </span>
          </div>
        )}

        {showSkeleton ? (
          <div className="space-y-4"><Skeleton /><Skeleton /></div>
        ) : sorted.length === 0 ? (
          <div className="mx-auto my-8 max-w-xl space-y-5 rounded-3xl border border-slate-200 bg-white p-8 text-center md:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-[#F5A623]"><PackageOpen className="h-9 w-9" /></div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">No orders yet</h2>
              <p className="mx-auto max-w-md text-xs text-slate-500 sm:text-sm">
                Browse the store for AutoCAD drawings, Revit BIM families and Excel calculation sheets. Your purchases will show up here.
              </p>
            </div>
            <Link to="/products" className="inline-block rounded-xl bg-[#F5A623] px-8 py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-[#e0951a] sm:text-sm">
              Browse products
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No orders match this filter.{' '}
            <button type="button" className="font-bold text-[#D97706] hover:underline" onClick={() => { setFilter('All'); setQuery(''); }}>Clear filters</button>
          </div>
        ) : (
          <div className="space-y-5">
            {visible.map((order) => {
              const ref = orderRef(order);
              return (
                <article key={ref} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="truncate font-mono text-sm font-extrabold text-slate-900">{ref}</span>
                        <CopyButton value={ref} />
                      </div>
                      <p className="text-[11px] font-medium text-slate-500">Placed {formatIst(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PaymentBadge order={order} />
                      <StatusBadge order={order} />
                      {isFreeOrder(order) && <Pill color="green">Free</Pill>}
                      <span className="ml-1 text-base font-extrabold text-slate-900">{inr(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 px-5">
                    {order.items.map((item) => (
                      <div key={item.id || item.productId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <ItemThumb item={item} />
                          <div className="min-w-0">
                            <h3 className="line-clamp-1 text-sm font-bold text-slate-900">{itemName(item)}</h3>
                            <p className="text-[11px] font-semibold text-slate-500">
                              {accessType(item)} &middot; {item.fileFormat || 'ZIP Download'} &middot; Qty {item.quantity} &middot; {item.price > 0 ? inr(item.price * item.quantity) : 'Free'}
                            </p>
                          </div>
                        </div>
                        <ItemAction order={order} item={item} busy={busyKey === `${ref}-${item.productId}`} onDownload={() => void download(order, item)} />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end border-t border-slate-100 px-5 py-3">
                    <Link to={`/account/orders/${encodeURIComponent(ref)}`} className="inline-flex items-center gap-1 text-xs font-extrabold text-[#D97706] hover:underline">
                      View details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default MyOrdersPage;