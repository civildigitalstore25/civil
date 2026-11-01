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

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
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

    try {
      // Save order locally and sync to MongoDB database
      await orderService.createOrderAsync({
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

      clearCart();
      setIsProcessing(false);
      navigate('/account/orders');
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to complete order. Please try again.');
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
            <p className="text-xs text-slate-500 font-normal">Complete your payment details to receive immediate digital access.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Left Side */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              
              <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4">1. Contact & Customer Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                    <div>
                      <label className="block mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5">Email Address (Downloads sent here) *</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1.5">Phone Number (For payment receipt) *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1.5">Billing Address</label>
                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Address, City, State, PIN"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4">2. Select Payment Method</h3>
                  
                  <div className="space-y-3">
                    {[
                      'UPI / QR Code',
                      'UPI / GooglePay / PhonePe',
                      'Credit / Debit Card',
                      'Net Banking',
                    ].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${
                          paymentMethod === method
                            ? 'bg-amber-50/50 border-[#F5A623] text-slate-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="w-4 h-4 text-[#F5A623] focus:ring-[#F5A623]"
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#F5A623] hover:bg-[#e0951a] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment & Order...</span>
                    </>
                  ) : (
                    <span>Pay ₹{summary.totalPayable.toLocaleString('en-IN')} & Download Instantly</span>
                  )}
                </button>
              </form>

            </div>

            {/* Order Summary Right Side */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                Order Review ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Items List */}
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3 text-xs">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-lg shrink-0">
                        📄
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Format: {item.format || 'ZIP'} • Qty: {item.quantity}</p>
                    </div>
                    <div className="font-extrabold text-slate-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{summary.subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {summary.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{summary.couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Estimated GST (18%)</span>
                  <span className="font-bold text-slate-900">₹{summary.gst.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-3">
                  <span>Total Payable</span>
                  <span className="text-[#F5A623]">₹{summary.totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>Instant Digital Delivery</span>
                </div>
                <p className="text-amber-800/80 text-[10px]">
                  Files will be available immediately for download on the order success page and saved to your account.
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CheckoutPage;
