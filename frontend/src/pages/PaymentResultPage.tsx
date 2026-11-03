import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { paymentService, type PaymentStatusOrder } from '../services/paymentService';

const MAX_PENDING_CHECKS = 10;
const CHECK_INTERVAL_MS = 3000;

export const PaymentResultPage: React.FC = () => {
  const { merchantOrderId = '' } = useParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<PaymentStatusOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checks, setChecks] = useState(0);
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
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-4xl text-emerald-600">
              &#10003;
            </div>
            <h2 className="text-2xl font-extrabold">Payment Successful</h2>
            <p className="text-xs text-slate-500">
              Order <span className="font-bold">{order.orderId}</span> is confirmed. Your downloads are available in My Orders.
            </p>
            <Link to="/account/orders" className="inline-block bg-[#F5A623] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md">
              Go to My Orders
            </Link>
          </>
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