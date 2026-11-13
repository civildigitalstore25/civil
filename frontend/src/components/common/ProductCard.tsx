import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import {
  buildAccessPlans,
  cheapestPlan,
  dealState,
  displayText,
  formatIstDateTime,
  freeOfferState,
  hasLiveWindow,
  reviewStats,
} from '../../utils/productDisplay';
import { useNow } from '../../hooks/useNow';
import OfferCountdown from '../product/OfferCountdown';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);

  const now = useNow(hasLiveWindow(product));
  const free = freeOfferState(product, now);
  const deal = dealState(product, now);
  const freeOn = free.status === 'active';
  const dealOn = !freeOn && deal.status === 'active';
  const plans = useMemo(() => buildAccessPlans(product), [product, free.status, deal.status]); // eslint-disable-line react-hooks/exhaustive-deps
  const plan = cheapestPlan(plans);
  const price = plan?.priceINR ?? 0;
  const compare = plan?.compareINR && plan.compareINR > price ? plan.compareINR : 0;
  const offPercent = compare > 0 ? Math.round(((compare - price) / compare) * 100) : 0;
  const reviews = reviewStats(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!plan || product.isOutOfStock) {
      navigate(`/${product.slug}/`);
      return;
    }
    addToCart(
      {
        ...product,
        id: `${product.id}::${plan.id}`,
        name: plans.length > 1 ? `${product.name} (${plan.label})` : product.name,
        price,
        oldPrice: compare,
      },
      1,
    );
    if (freeOn) {
      navigate('/checkout');
      return;
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className="group flex h-full w-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all duration-300 hover:border-[#F5A623]/80 hover:shadow-xl sm:rounded-2xl sm:p-4 sm:shadow-md sm:hover:-translate-y-1">
      <div>
        <Link
          to={`/${product.slug}/`}
          className="relative mb-2 block aspect-square w-full overflow-hidden rounded-lg border border-slate-100 bg-gradient-to-b from-slate-50 to-white sm:mb-4 sm:aspect-[4/3] sm:rounded-xl"
        >
          {product.images[0] ? (
            <div className="flex h-full w-full items-center justify-center p-1.5 sm:p-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-400 sm:text-xs">
              No image
            </div>
          )}

          <div className="absolute left-1.5 top-1.5 z-10 flex max-w-[85%] flex-wrap gap-1 sm:left-2.5 sm:top-2.5">
            {freeOn && (
              <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-md sm:rounded-md sm:px-2 sm:text-[11px]">
                FREE
              </span>
            )}
            {dealOn && (
              <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-md sm:rounded-md sm:px-2 sm:text-[11px]">
                DEAL
              </span>
            )}
            {product.isBestSeller && (
              <span className="rounded bg-[#F5A623] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-md sm:rounded-md sm:px-2 sm:text-[11px]">
                BEST
              </span>
            )}
            {product.isNewArrival && (
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-md sm:rounded-md sm:px-2 sm:text-[11px]">
                NEW
              </span>
            )}
            {!product.isBestSeller && !product.isNewArrival && product.badge && (
              <span className="rounded bg-[#F5A623] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-md sm:rounded-md sm:px-2 sm:text-[11px]">
                {product.badge}
              </span>
            )}
          </div>

          <span className="absolute bottom-1.5 left-1.5 hidden items-center gap-1 rounded-md bg-slate-900/85 px-2 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-md sm:bottom-2.5 sm:left-2.5 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Instant Download
          </span>
        </Link>

        <div className="mb-1 flex items-center justify-between gap-1 sm:mb-2 sm:gap-2">
          <span className="truncate text-[9px] font-extrabold uppercase tracking-wider text-[#F5A623] sm:text-[11px]">
            {displayText(product.brand) || displayText(product.software) || displayText(product.category) || 'Product'}
          </span>
          {reviews && (
            <div className="hidden items-center gap-1 text-xs text-amber-500 sm:flex">
              <span>★</span>
              <span className="text-[11px] font-bold text-slate-800">{reviews.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-500">({reviews.count})</span>
            </div>
          )}
        </div>

        <Link to={`/${product.slug}/`} className="block">
          <h3 className="mb-1 line-clamp-2 text-[13px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#F5A623] sm:mb-2 sm:text-lg">
            {product.name}
          </h3>
        </Link>

        {(displayText(product.format) || displayText(product.fileSize)) && (
          <div className="mb-2 hidden items-center gap-2 text-[11px] font-medium text-slate-500 sm:mb-4 sm:flex">
            {displayText(product.format) && (
              <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                {displayText(product.format)}
              </span>
            )}
            {displayText(product.fileSize) && <span>{displayText(product.fileSize)}</span>}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-1.5 sm:pt-3">
        <div className="mb-1.5 flex items-center justify-between gap-1 sm:mb-2">
          <div className="flex min-w-0 items-baseline gap-1 sm:gap-2">
            {freeOn ? (
              <span className="text-sm font-black text-emerald-600 sm:text-xl">FREE</span>
            ) : (
              <span className="truncate text-sm font-black text-slate-900 sm:text-xl">
                {price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'On request'}
              </span>
            )}
            {compare > 0 && (
              <span className="hidden text-xs font-semibold text-slate-400 line-through sm:inline">
                ₹{compare.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {offPercent > 0 && (
            <span
              className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold sm:rounded-md sm:px-2 sm:text-[11px] ${
                freeOn
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-[#F5A623]/30 bg-[#F5A623]/15 text-[#D97706]'
              }`}
            >
              {freeOn ? '100% OFF' : `-${offPercent}%`}
            </span>
          )}
        </div>

        <div className="mb-1.5 hidden space-y-1.5 sm:mb-3 sm:block">
          {freeOn && free.endMs !== null && <OfferCountdown targetMs={free.endMs} label="Free offer ends in" tone="free" />}
          {dealOn && deal.endMs !== null && <OfferCountdown targetMs={deal.endMs} label="Deal ends in" tone="deal" />}
          {!freeOn && free.status === 'upcoming' && free.startMs !== null && (
            <p className="text-[11px] font-semibold text-emerald-700">Free from {formatIstDateTime(free.startMs)}</p>
          )}
          {!freeOn && !dealOn && deal.status === 'upcoming' && deal.startMs !== null && (
            <OfferCountdown targetMs={deal.startMs} label="Deal starts in" tone="upcoming" />
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold shadow-sm transition-all duration-200 sm:gap-2 sm:rounded-xl sm:py-2.5 sm:text-sm sm:shadow-md ${
            isAdded
              ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
              : 'bg-gradient-to-r from-[#F5A623] to-[#FFAA00] text-white shadow-amber-500/20 hover:from-[#FFAA00] hover:to-[#F5A623] sm:hover:-translate-y-0.5'
          }`}
        >
          <svg className="hidden h-4 w-4 fill-current sm:block" viewBox="0 0 24 24">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <span>{freeOn ? 'Get Free' : isAdded ? '✓ Added' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
