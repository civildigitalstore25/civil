import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { paymentService, type PaymentStatusOrder } from '../services/paymentService';
import { orderService } from '../services/orderService';

const MAX_PENDING_CHECKS = 10;
const CHECK_INTERVAL_MS = 3000;
const AUTO_REDIRECT_SECONDS = 3;

export const PaymentResultPage: React.FC = () => {
  const { merchantOrderId = '' } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<PaymentStatusOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checks, setChecks] = useState(0);
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);
  const clearedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const check = async (attempt: number) => {
      try {
        const latest = await paymentService.getStatus(merchantOrderId);
        if (cancelled) return;
        setOrder(latest);
        setError(null);
        setChecks(attempt);
        if (latest.paymentStatus === 'Paid' && !clearedRef.current) {
          clearedRef.current = true;
          clearCart();
          try {
            const existing = orderService.getOrders();
            const exists = existing.some((o) => o.id === latest.orderId || o.orderId === latest.orderId);
            if (!exists) {
              orderService.saveOrders([latest as any, ...existing]);
            }
          } catch {
            // ignore localStorage error
          }
        }
        if (latest.paymentStatus === 'Pending' && attempt < MAX_PENDING_CHECKS) {
          timer = setTimeout(() => void check(attempt + 1), CHECK_INTERVAL_MS);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Unable to confirm payment status.');
      }
    };

    void check(1);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantOrderId]);

  const paid = order?.paymentStatus === 'Paid';
  const failed = order?.paymentStatus === 'Failed';
  const pending = !error && (!order || order.paymentStatus === 'Pending');

  // Automatic redirect countdown to My Orders once payment is confirmed
  useEffect(() => {
    if (!paid || !order) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/account/orders', {
            replace: true,
            state: {
              paymentSuccess: `Payment successful for Order #${order.orderId}! Your files are ready to download below.`,
            },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paid, order, navigate]);

  const handleGoToOrders = () => {
    navigate('/account/orders', {
      replace: true,
      state: {
        paymentSuccess: order
          ? `Payment successful for Order #${order.orderId}! Your files are ready to download below.`
          : undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      <main className="flex-grow max-w-xl mx-auto w-full px-4 py-16 text-center space-y-6">
        {pending && (
          <>
            <div className="w-12 h-12 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-2xl font-extrabold">Confirming your payment...</h2>
            <p className="text-xs text-slate-500">
              {checks >= MAX_PENDING_CHECKS
                ? 'PhonePe has not confirmed this payment yet. If money was debited, it will update shortly; check My Orders.'
                : 'Please wait while we confirm your PhonePe payment. Do not close this page.'}
            </p>
          </>
        )}

        {paid && order && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-4xl text-emerald-600 shadow-xs">
              &#10003;
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Payment Successful!</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Thank you! Your order <span className="font-bold text-slate-800">#{order.orderId}</span> is confirmed.
              </p>
            </div>

            {/* Purchased Items Preview */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-left divide-y divide-slate-100 shadow-2xs max-w-lg mx-auto">
                <div className="pb-2.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Purchased Products ({order.items.length})
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[11px] font-semibold text-emerald-600">✓ Download ready in My Orders</p>
                    </div>
                    <span className="font-extrabold text-slate-900 shrink-0">
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Countdown notice & Direct Navigate button */}
            <div className="space-y-4 pt-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-emerald-50 border border-emerald-200 py-2 px-4 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Redirecting to My Orders in <strong className="text-emerald-800">{countdown}s</strong>...</span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleGoToOrders}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-[#e0951a] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Go to My Orders & Download Files &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {(failed || error) && (
          <>
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-4xl text-rose-600">
              &#10007;
            </div>
            <h2 className="text-2xl font-extrabold">{failed ? 'Payment Failed' : 'Could not confirm payment'}</h2>
            <p className="text-xs text-slate-500">
              {error || 'Your PhonePe payment was not completed. No order has been placed; your cart is still saved.'}
            </p>
            <Link to="/checkout" className="inline-block bg-[#F5A623] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md">
              Try Again
            </Link>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PaymentResultPage;
