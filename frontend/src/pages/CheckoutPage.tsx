import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/orderService';
import type { OrderItem } from '../types/order';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, summary, clearCart } = useCart();
  const { currentUser } = useAuth();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('123 Civil Digital Hub, India');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');

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

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError('Please fill in all required contact information.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    const orderItems: OrderItem[] = cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      title: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      fileFormat: item.format,
    }));

    // Create Order object in LocalStorage
    orderService.createOrder({
      userId: currentUser?.id || 'guest_user',
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      items: orderItems,
      subtotal: summary.subtotal,
      gst: summary.gst,
      totalAmount: summary.totalPayable,
      status: 'Completed', // Instant digital download auto completes
      paymentMethod,
    });

    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      navigate('/account/orders');
    }, 1200);
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
              Frontend demo checkout. Orders are saved into <code className="bg-amber-100 px-1 rounded text-amber-900">civil_orders</code> LocalStorage key.
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

              {/* Payment Method Selector */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  2. Select Payment Mode (Frontend Demo)
                </h3>

                <div className="space-y-2">
                  {[
                    'UPI / GooglePay / PhonePe',
                    'Credit / Debit Card',
                    'Net Banking',
                    'Instant Digital Access (Free Demo)',
                  ].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === method
                          ? 'border-[#F5A623] bg-amber-50/50 font-bold text-slate-900'
                          : 'border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="w-4 h-4 text-[#F5A623] accent-[#F5A623]"
                      />
                      <span className="text-xs">{method}</span>
                    </label>
                  ))}
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
                {isProcessing ? 'Processing Order...' : 'Complete Purchase & Get Instant Download →'}
              </button>

              <div className="text-center text-[11px] text-slate-400 font-medium">
                🔒 256-bit encrypted secure LocalStorage checkout.
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
