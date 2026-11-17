import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewApi } from '../../services/reviewApi';
import type { RecentReview } from '../../types/review';
import { reviewInitials } from '../../utils/reviewFormat';

/** Latest admin-approved reviews from the backend (hidden when there are none). */
export const HomeReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<RecentReview[]>([]);

  useEffect(() => {
    let cancelled = false;
    void reviewApi.getRecent(6).then((result) => {
      if (!cancelled && result.ok) setReviews(result.reviews);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="w-full bg-white text-slate-900 py-10 sm:py-16 md:py-24 border-t border-slate-200">
      <div className="w-[94%] sm:w-[90%] max-w-[1540px] mx-auto space-y-7 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#D97706] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
            <span>💬</span>
            <span>VERIFIED FEEDBACK</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Real feedback from civil engineers, structural designers & contractors using Civil Digital Store downloads.
          </p>
        </div>

        {/* Reviews Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-50 border border-slate-200 hover:border-[#F5A623] p-4 sm:p-6 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="space-y-3">
                {/* Header: Avatar, Name & Rating */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F5A623] to-amber-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {reviewInitials(rev.displayName)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{rev.displayName}</h4>
                      {rev.verifiedPurchase && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <span>✓</span> Verified Buyer
                      </span>
                      )}
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex text-amber-500 text-sm tracking-tight">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>
                </div>

                {/* Review Text */}
                {rev.title && <p className="text-slate-900 text-sm font-bold">{rev.title}</p>}
                <p className="text-slate-700 text-xs sm:text-sm font-normal leading-relaxed italic line-clamp-5 whitespace-pre-line break-words">
                  "{rev.comment}"
                </p>
              </div>

              {/* Footer: Product Name & Date */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <Link to={`/${rev.product.slug}/`} className="font-bold text-slate-800 truncate max-w-[65%] hover:text-[#D97706]">
                  {rev.product.name}
                </Link>
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
