import React from 'react';
import type { Review } from '../../types/product';

interface CustomerReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  reviews,
  rating,
  reviewCount
}) => {
  const ratingDistribution = [
    { stars: 5, percentage: 72 },
    { stars: 4, percentage: 18 },
    { stars: 3, percentage: 7 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 2 }
  ];

  return (
    <div className="space-y-8">
      {/* Rating Summary & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 items-center">
        {/* Left Rating Box (4 cols) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200">
          <span className="text-5xl font-black text-slate-900">{rating}</span>
          <div className="flex text-amber-500 text-xl my-2">★★★★★</div>
          <span className="text-xs text-slate-500 font-semibold">Based on {reviewCount} customer reviews</span>
        </div>

        {/* Right Distribution Bars (8 cols) */}
        <div className="md:col-span-8 space-y-2">
          {ratingDistribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-xs">
              <span className="w-8 font-bold text-slate-700 flex items-center justify-end gap-1">
                {item.stars} <span className="text-amber-500 text-sm">★</span>
              </span>
              <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F5A623] rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-10 text-right font-bold text-slate-500">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Review Items */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-slate-900 mb-4">Customer Feedback ({reviews.length})</h4>
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar Initial */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5A623] to-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                  {rev.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{rev.author}</span>
                    {rev.verified && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">{rev.date}</span>
                </div>
              </div>

              {/* Star rating */}
              <div className="text-amber-500 text-sm font-bold">
                {'★'.repeat(rev.rating)}
                {'☆'.repeat(5 - rev.rating)}
              </div>
            </div>

            <p className="text-slate-700 text-sm italic font-normal leading-relaxed">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerReviewsSection;
