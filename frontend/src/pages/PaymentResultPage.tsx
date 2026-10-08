import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import type { Order } from '../types/order';

export const PaymentResultPage: React.FC = () => {
  const { merchantOrderId = '' } = useParams();
  const { clearCart } = useCart();
  const clearCartRef = useRef(clearCart);
  clearCartRef.current = clearCart;
  const recordedRef = useRef(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const nextOrder = await paymentService.getStatus(merchantOrderId);
        if (cancelled) return;
        setOrder(nextOrder);
        setError(null);

        if (nextOrder.paymentState === 'COMPLETED') {
          if (!recordedRef.current) {
            recordedRef.current = true;
            orderService.recordVerifiedOrder(nextOrder);
            clearCartRef.current();
          }
          setChecking(false);
          return;
        }

        if (nextOrder.paymentState === 'FAILED' || nextOrder.status === 'Cancelled') {
          setChecking(false);
          return;
        }

        attempts += 1;
        if (attempts >= 5) {
          setChecking(false);
          return;
        }
        window.setTimeout(() => {
          if (!cancelled) void checkStatus();
        }, 2000);
      } catch (statusError) {
        if (cancelled) return;
        setError(statusError instanceof Error ? statusError.message : 'Unable to confirm payment status.');
        setChecking(false);
      }
    };

    if (merchantOrderId) {
      void checkStatus();
    } else {
      setError('Payment reference is missing.');
      setChecking(false);
    }

    return () => {
      cancelled = true;
    };
  }, [merchantOrderId]);

  const paid = order?.paymentState === 'COMPLETED';
  const failed = order?.paymentState === 'FAILED' || order?.status === 'Cancelled';
  const paidOn = order
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-10 md:py-14 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-4xl">
            {checking ? '⏳' : paid ? '✅' : '⚠️'}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {checking ? 'Confirming your PhonePe payment' : paid ? 'Payment completed' : failed ? 'Payment was not completed' : 'Payment is still pending'}
          </h1>
          <p className="text-sm text-slate-500">
            {checking
              ? 'Please wait while we verify this payment with PhonePe.'
              : paid
                ? 'Your payment is completed. The order is now processing.'
                : failed
                  ? 'PhonePe did not complete this payment. You can return to checkout and try again.'
                  : 'PhonePe has not confirmed this payment yet. Refresh this page in a moment.'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        {paid && order && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Order reference</p>
                <p className="text-sm font-extrabold text-slate-900">{order.id}</p>
                <p className="text-xs text-slate-500 mt-1">{paidOn}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-[11px] font-extrabold uppercase text-emerald-800">
                  Payment completed
                </span>
                <span className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-[11px] font-extrabold uppercase text-blue-800">
                  Order {order.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold uppercase tracking-wide text-slate-400">Customer</p>
                <p className="mt-1 font-bold text-slate-900">{order.customerName}</p>
                <p className="text-slate-600">{order.customerEmail}</p>
                <p className="text-slate-600">{order.customerPhone}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wide text-slate-400">Billing address</p>
                <p className="mt-1 font-semibold text-slate-800">{order.shippingAddress || 'Not provided'}</p>
                <p className="mt-3 font-bold uppercase tracking-wide text-slate-400">Payment</p>
                <p className="mt-1 font-semibold text-slate-800">{order.paymentMethod}</p>
                {order.phonepeOrderId && (
                  <p className="text-slate-500">PhonePe order {order.phonepeOrderId}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Items</p>
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.title}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-slate-500">Qty {item.quantity}{item.fileFormat ? ` · ${item.fileFormat}` : ''}</p>
                  </div>
                  <span className="shrink-0 font-extrabold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {(order.couponDiscount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span className="font-bold">-₹{(order.couponDiscount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="font-bold text-slate-900">₹{order.gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-slate-200 pt-3">
                <span className="text-sm font-extrabold text-slate-900">Total paid</span>
                <span className="text-xl font-black text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {paid && (
            <Link to="/account/orders" className="inline-block cursor-pointer bg-[#F5A623] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md">
              View my orders
            </Link>
          )}
          {!checking && !paid && (
            <Link to="/checkout" className="inline-block cursor-pointer bg-[#F5A623] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md">
              Back to checkout
            </Link>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default PaymentResultPage;
