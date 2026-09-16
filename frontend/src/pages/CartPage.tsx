import React from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartHeader from '../components/cart/CartHeader';
import CartItemCard from '../components/cart/CartItemCard';
import CouponCard from '../components/cart/CouponCard';
import OrderSummaryCard from '../components/cart/OrderSummaryCard';
import WhatsAppButton from '../components/common/WhatsAppButton';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const {
    cartItems,
    appliedCoupon,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    summary
  } = useCart();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      {/* Dark Navy Cart Page Header */}
      <CartHeader itemCount={summary.totalItemsCount} />

      {/* Main Cart Body */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items List (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Table Column Labels Header (Desktop) */}
              <div className="hidden sm:flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <span className="flex-1">PRODUCT</span>
                <div className="flex items-center gap-12 shrink-0">
                  <span className="w-24 text-center">QUANTITY</span>
                  <span className="w-20 text-right">PRICE</span>
                </div>
              </div>

              {/* Cart Items Cards */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F5A623] hover:text-[#e0951a] transition-colors group cursor-pointer"
                >
                  <span className="transition-transform group-hover:-translate-x-1">←</span>
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary & Coupon (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Apply Coupon */}
              <CouponCard
                appliedCoupon={appliedCoupon}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
              />

              {/* Order Summary Card */}
              <OrderSummaryCard summary={summary} />
            </div>

          </div>
        ) : (
          /* Empty Cart State */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-16 text-center space-y-6 max-w-xl mx-auto my-8 shadow-sm">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-4xl text-[#F5A623]">
              🛒
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">Your cart is empty</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Looks like you haven't added any civil engineering software bundles, CAD templates, or eBooks to your cart yet.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-block bg-[#F5A623] hover:bg-[#e0951a] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Browse Digital Store
            </Link>
          </div>
        )}
      </main>

      {/* Reusable Footer */}
      <Footer />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default CartPage;
