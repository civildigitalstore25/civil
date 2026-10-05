import React from 'react';

interface CouponHeaderProps {
  totalCoupons: number;
  onCreateClick: () => void;
}

export const CouponHeader: React.FC<CouponHeaderProps> = ({ totalCoupons, onCreateClick }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Coupon Management
          </h1>
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200/60">
            {totalCoupons} {totalCoupons === 1 ? 'Coupon' : 'Coupons'}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Create and manage discount coupons for your digital products.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreateClick}
        className="bg-[#F5A000] hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
      >
        <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span>Create New Coupon</span>
      </button>
    </div>
  );
};

export default CouponHeader;
