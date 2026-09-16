import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartSummary } from '../../types/cart';

interface OrderSummaryCardProps {
  summary: CartSummary;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ summary }) => {
  const navigate = useNavigate();
  const formattedSubtotal = summary.subtotal.toLocaleString('en-IN');
  const formattedSavings = summary.savings.toLocaleString('en-IN');
  const formattedGst = summary.gst.toLocaleString('en-IN');
  const formattedTotal = summary.totalPayable.toLocaleString('en-IN');

  const whatsappMessage = encodeURIComponent(
    `Hello! I would like to place an order for items in my cart worth ₹${formattedTotal}.`
  );

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
      <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
        Order Summary
      </h3>

      {/* Row Items */}
      <div className="space-y-3 text-xs sm:text-sm">
        {/* Subtotal */}
        <div className="flex justify-between text-slate-600 font-medium">
          <span>Subtotal ({summary.totalItemsCount} {summary.totalItemsCount === 1 ? 'item' : 'items'})</span>
          <span className="font-bold text-slate-900">₹{formattedSubtotal}</span>
        </div>

        {/* Total Savings */}
        <div className="flex justify-between text-emerald-600 font-medium">
          <span>Total Savings</span>
          <span className="font-bold">-₹{formattedSavings}</span>
        </div>

        {/* Coupon Discount if applied */}
        {summary.couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Coupon Discount</span>
            <span className="font-bold">-₹{summary.couponDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* GST */}
        <div className="flex justify-between text-slate-600 font-medium">
          <span>GST (18%)</span>
          <span className="font-bold text-slate-900">₹{formattedGst}</span>
        </div>

        {/* Delivery */}
        <div className="flex justify-between text-slate-600 font-medium">
          <span>Delivery</span>
          <span className="font-bold text-emerald-600 uppercase tracking-wider">{summary.delivery}</span>
        </div>
      </div>

      {/* Total Payable Divider */}
      <div className="border-t border-slate-200 pt-4 space-y-1">
        <div className="flex justify-between items-baseline">
          <span className="text-base font-extrabold text-slate-900">Total Payable</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ₹{formattedTotal}
          </span>
        </div>

        {summary.savings > 0 && (
          <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 pt-1">
            <svg className="w-4 h-4 fill-emerald-500" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            You save ₹{formattedSavings} on this order!
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {/* Checkout Button */}
        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="w-full bg-[#F5A623] hover:bg-[#e0951a] text-white font-extrabold text-sm sm:text-base py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Proceed to Checkout</span>
          <span className="text-lg leading-none">→</span>
        </button>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/918807423228?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
          className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-white font-extrabold text-sm sm:text-base py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
          </svg>
          <span>Order via WhatsApp</span>
        </a>
      </div>

      {/* Trust Information */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-around gap-2 text-slate-500 text-[11px] font-semibold">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-500 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>100% Secure Checkout</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#F5A623] stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Instant Download</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-blue-500 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Lifetime Access</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
