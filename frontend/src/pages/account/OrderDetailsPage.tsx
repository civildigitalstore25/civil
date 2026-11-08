import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Circle, CreditCard, Printer, User, XCircle } from 'lucide-react';
import AnnouncementBar from '../../components/layout/AnnouncementBar';
import Header from '../../components/layout/Header';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import WhatsAppIcon from '../../components/common/WhatsAppIcon';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types/order';
import {
  CopyButton, ItemAction, ItemThumb, PaymentBadge, Pill, StatusBadge, SUPPORT_WHATSAPP, accessType, formatIst, inr,
  isFreeOrder, isPaid, itemName, orderRef, useOrderDownload,
} from '../../components/orders/orderUi';

type Step = { label: string; time?: string; state: 'done' | 'current' | 'failed' | 'todo' };

const buildTimeline = (o: Order): Step[] => {
  const failed = o.paymentStatus === 'Failed';
  const cancelled = o.status === 'Cancelled';
  const paid = isPaid(o);
  return [
    { label: 'Order placed', time: formatIst(o.createdAt), state: 'done' },
    {
      label: failed ? 'Payment failed' : paid ? (isFreeOrder(o) ? 'Free checkout' : 'Payment received') : 'Awaiting payment',
      time: paid ? formatIst(o.paidAt || o.createdAt) : failed ? formatIst(o.updatedAt) : undefined,
      state: failed ? 'failed' : paid ? 'done' : 'current',
    },
    cancelled
      ? { label: 'Cancelled', time: formatIst(o.updatedAt), state: 'failed' }
      : {
          label: o.status === 'Completed' ? 'Completed - files ready' : o.status === 'Processing' ? 'Processing' : 'Completion',
          time: o.status === 'Completed' ? formatIst(o.paidAt || o.updatedAt) : undefined,
          state: o.status === 'Completed' ? 'done' : o.status === 'Processing' ? 'current' : 'todo',
        },
  ];
};

const Card: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
  <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-xs print:rounded-none print:border-slate-300 print:shadow-none ${className}`}>
    <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-700">{icon}{title}</h2>
    {children}
  </section>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm">
    <dt className="shrink-0 text-slate-500">{label}</dt>
    <dd className="min-w-0 break-words text-right font-semibold text-slate-900">{value || '-'}</dd>
  </div>
);

export const OrderDetailsPage: React.FC = () => {
  const { orderId = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const dl = useOrderDownload();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void orderService.fetchOrder(orderId).then(({ order: o, status, error: e }) => {
      if (!active) return;
      setOrder(o);
      if (!o) setError(status === 403 || status === 404 ? 'We could not find this order in your account.' : e || 'Could not load this order.');
      setLoading(false);
    });
    return () => { active = false; };
  }, [orderId, reload]);

  const chrome = (body: React.ReactNode) => (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 print:bg-white">
      <header className="sticky top-0 z-50 w-full shadow-sm print:hidden">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-grow space-y-6 px-4 py-8 sm:px-6 md:py-12 lg:px-8 print:max-w-none print:p-0">{body}</main>
      <div className="print:hidden"><Footer /></div>
    </div>
  );

  const back = (
    <Link to="/account/orders" className="inline-flex items-center gap-1 text-xs font-bold text-[#D97706] hover:underline print:hidden">
      <ArrowLeft className="h-3.5 w-3.5" /> Back to My Orders
    </Link>
  );

  if (loading) {
    return chrome(
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2"><div className="h-40 rounded-3xl bg-slate-200" /><div className="h-40 rounded-3xl bg-slate-200" /></div>
        <div className="h-56 rounded-3xl bg-slate-200" />
      </div>
    );
  }

  if (!order) {
    return chrome(
      <>
        {back}
        <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-rose-200 bg-white p-10 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <p className="text-sm font-semibold text-slate-700">{error}</p>
          <button type="button" onClick={() => setReload((n) => n + 1)} className="rounded-xl bg-[#F5A623] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#e0951a]">Try again</button>
        </div>
      </>
    );
  }

  const ref = orderRef(order);
  const steps = buildTimeline(order);
  const discount = order.couponDiscount || 0;
  const method = isFreeOrder(order) ? 'Free' : order.paymentMethod && order.paymentMethod !== '-' ? order.paymentMethod : 'PhonePe';
  const waText = encodeURIComponent(`Hi, I need help with my order ${ref}.`);

  return chrome(
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          {back}
          <p className="hidden text-lg font-extrabold print:block">Civil Digital Store &middot; Invoice</p>
          <div className="flex items-center gap-1">
            <h1 className="font-mono text-xl font-extrabold text-slate-900 sm:text-2xl">{ref}</h1>
            <CopyButton value={ref} />
          </div>
          <p className="text-xs text-slate-500">Placed {formatIst(order.createdAt)}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <PaymentBadge order={order} />
            <StatusBadge order={order} />
            {isFreeOrder(order) && <Pill color="green">Free</Pill>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:border-[#F5A623]">
            <Printer className="h-4 w-4" /> Download invoice
          </button>
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] px-4 py-2 text-xs font-extrabold text-white shadow-xs transition-colors"
          >
            <WhatsAppIcon className="h-4 w-4 fill-white" /> WhatsApp Support
          </a>
        </div>
      </div>

      {dl.error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 print:hidden">
          <span>{dl.error}</span>
          <button type="button" onClick={() => dl.setError(null)} className="font-bold">Dismiss</button>
        </div>
      )}

      <Card title="Order timeline" className="print:hidden">
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.label} className="flex items-start gap-3">
              {s.state === 'done' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : s.state === 'failed' ? <XCircle className="h-5 w-5 shrink-0 text-rose-600" /> : <Circle className={`h-5 w-5 shrink-0 ${s.state === 'current' ? 'text-amber-500' : 'text-slate-300'}`} />}
              <div>
                <p className={`text-sm font-bold ${s.state === 'todo' ? 'text-slate-400' : 'text-slate-900'}`}>{s.label}</p>
                {s.time && <p className="text-[11px] text-slate-500">{s.time}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
        <Card title="Billing details" icon={<User className="h-4 w-4 text-[#D97706]" />}>
          <dl>
            <Row label="Name" value={order.customerName} />
            <Row label="Email" value={order.customerEmail} />
            <Row label="Phone" value={order.customerPhone} />
            <Row label="Address" value={order.shippingAddress} />
          </dl>
        </Card>
        <Card title="Payment" icon={<CreditCard className="h-4 w-4 text-[#D97706]" />}>
          <dl>
            <Row label="Method" value={method} />
            <Row label="Status" value={order.paymentStatus || 'Paid'} />
            {order.phonepeOrderId && <Row label="PhonePe ref" value={<span className="font-mono text-xs">{order.phonepeOrderId}</span>} />}
            <Row label="Paid at" value={isPaid(order) ? formatIst(order.paidAt || order.createdAt) : '-'} />
          </dl>
          {order.paymentStatus === 'Pending' && order.status === 'Pending' && (
            <Link to={`/payment/result/${encodeURIComponent(ref)}`} className="mt-3 inline-block text-xs font-extrabold text-[#D97706] hover:underline print:hidden">Check / complete payment &rarr;</Link>
          )}
        </Card>
      </div>

      <Card title={`Items (${order.items.length})`}>
        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id || item.productId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="print:hidden"><ItemThumb item={item} /></span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{itemName(item)}</p>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {accessType(item)} &middot; {item.fileFormat || 'ZIP Download'} &middot; {inr(item.price)} x {item.quantity}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-sm font-extrabold">{item.price > 0 ? inr(item.price * item.quantity) : 'Free'}</span>
                <ItemAction order={order} item={item} busy={dl.busyKey === `${ref}-${item.productId}`} onDownload={() => void dl.download(order, item)} />
              </div>
            </div>
          ))}
        </div>

        <dl className="ml-auto mt-4 max-w-sm border-t border-slate-200 pt-3">
          <Row label="Subtotal" value={inr(order.subtotal)} />
          {discount > 0 && <Row label={`Coupon${order.couponCode ? ` (${order.couponCode})` : ''}`} value={<span className="text-emerald-700">-{inr(discount)}</span>} />}
          <Row label="GST (18%)" value={inr(order.gst)} />
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold">
            <span>Total</span>
            <span>{isFreeOrder(order) ? `${inr(0)} (Free)` : inr(order.totalAmount)}</span>
          </div>
        </dl>
      </Card>

      <p className="hidden text-center text-xs text-slate-500 print:block">This is a computer-generated invoice. Printed {formatIst(new Date().toISOString())}.</p>
    </>
  );
};

export default OrderDetailsPage;