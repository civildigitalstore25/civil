import React, { useState } from 'react';
import type { AppliedCoupon } from '../../types/cart';

interface CouponCardProps {
  appliedCoupon: AppliedCoupon | null;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon
}) => {
  const [couponCode, setCouponCode] = useState('CIVIL10');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onApplyCoupon(couponCode);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#F5A623]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Apply Coupon
        </h3>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Code: CIVIL10 available
        </span>
      </div>

      {appliedCoupon ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center space-x-2.5">
            <span className="bg-emerald-600 text-white font-bold text-[11px] px-2 py-0.5 rounded">
              {appliedCoupon.code}
            </span>
            <span className="text-emerald-800 font-semibold">{appliedCoupon.description}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onRemoveCoupon();
              setFeedback(null);
            }}
            className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer ml-2"
          >
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setFeedback(null);
              }}
              placeholder="Enter coupon code"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold uppercase text-slate-800 tracking-wider focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="bg-[#F5A623] hover:bg-[#e0951a] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer shrink-0"
            >
              Apply
            </button>
          </div>

          {feedback && (
            <p
              className={`text-xs font-semibold ${
                feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {feedback.message}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default CouponCard;
