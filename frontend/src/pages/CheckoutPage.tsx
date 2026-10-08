import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { paymentService } from '../services/paymentService';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, summary, appliedCoupon } = useCart();
  const { currentUser } = useAuth();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('123 Civil Digital Hub, India');

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <header className="sticky top-0 z-50 w-full shadow-sm">
          <AnnouncementBar />
          <Header />
          <Navbar />
        </header>

        <main className="flex-grow max-w-xl mx-auto w-full px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-4xl text-[#F5A623]">
            🛒
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
          <Link
            to="/products"
            className="inline-block bg-[#F5A623] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md"
          >
            Browse Products
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError('Please fill in all required contact information.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const payment = await paymentService.initiate({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        couponCode: appliedCoupon?.code,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      if (payment.freeCheckout && payment.merchantOrderId) {
        navigate(`/payment/result/${payment.merchantOrderId}`);
        return;
      }

      window.location.assign(payment.redirectUrl || '/checkout');
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start PhonePe payment.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      {/* Main Checkout Section */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-6">
          
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Checkout Order</h1>
            <p className="text-xs text-slate-500">
              Pay securely with PhonePe. UPI, cards, and net banking open on the PhonePe checkout page.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Contact Info Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  1. Customer & Delivery Contact Information
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Email Address (For Files Delivery) *</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Billing / Delivery Address</label>
                    <input
                      type="text"
                      placeholder="123 Civil Engineering Hub, City, State"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#F5A623] rounded-3xl p-6 shadow-xs space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  2. Pay with PhonePe
                </h3>
                <p className="text-xs font-semibold text-slate-600">
                  You will be redirected to PhonePe&apos;s secure sandbox checkout. The order is confirmed only after PhonePe reports a successful payment.
                </p>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-slate-800">
                  PhonePe · UPI, cards, and net banking
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary Card (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Order Items ({summary.totalItemsCount})
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-bold text-[#F5A623] shrink-0">{item.quantity}x</span>
                      <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{summary.subtotal.toLocaleString('en-IN')}</span>
                </div>

                {summary.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Discount</span>
                    <span className="font-bold">-₹{summary.couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-bold text-slate-900">₹{summary.gst.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-emerald-600">FREE INSTANT DOWNLOAD</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{summary.totalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#F5A623] hover:bg-[#e0951a] text-white font-extrabold text-sm py-4 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? 'Redirecting to PhonePe...' : 'Pay with PhonePe →'}
              </button>

              <div className="text-center text-[11px] text-slate-400 font-medium">
                🔒 Amount is calculated on the server and confirmed with PhonePe.
              </div>
            </div>

          </form>

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CheckoutPage;
