import React from 'react';
import type { Coupon } from '../../../types/coupon';

interface CouponStatusBadgeProps {
  coupon: Coupon;
}

export const CouponStatusBadge: React.FC<CouponStatusBadgeProps> = ({ coupon }) => {
  const now = new Date().toISOString().split('T')[0];
  const isExpired = coupon.validTo && coupon.validTo < now;
  const isLimitReached = coupon.usageCount >= coupon.usageLimit;

  if (coupon.status === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Inactive
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        Expired
      </span>
    );
  }

  if (isLimitReached) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Limit Reached
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      Active
    </span>
  );
};

export default CouponStatusBadge;
