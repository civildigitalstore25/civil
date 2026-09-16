import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';
import type { CustomerReview } from '../../types/product';

export const HomeReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);

  useEffect(() => {
    setReviews(reviewService.getRecentReviews(6));
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="w-full bg-white text-slate-900 py-16 md:py-24 border-t border-slate-200">
      <div className="w-[90%] max-w-[1540px] mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#D97706] text-xs font-extrabold uppercase tracking-wider">
            <span>💬</span>
            <span>VERIFIED FEEDBACK</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Real feedback from civil engineers, structural designers & contractors using Civil Digital Store downloads.
          </p>
        </div>

        {/* Reviews Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-50 border border-slate-200 hover:border-[#F5A623] p-6 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="space-y-3">
                {/* Header: Avatar, Name & Rating */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F5A623] to-amber-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {rev.avatar || rev.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{rev.userName}</h4>
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <span>✓</span> Verified Buyer
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex text-amber-500 text-sm tracking-tight">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-slate-700 text-xs sm:text-sm font-normal leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Footer: Product Name & Date */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold text-slate-800 truncate max-w-[65%]">
                  {rev.productName}
                </span>
                <span className="font-mono text-slate-400">
                  {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HomeReviewsSection;
