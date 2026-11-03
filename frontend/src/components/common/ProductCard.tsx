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

  // Re-evaluate free/deal windows live so the card flips state exactly at start/end (interval cleaned up).
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!plan || product.isOutOfStock) {
      navigate(`/${product.slug}/`);
      return;
    }
    // Same cart line as the detail page: the live plan price (deal price, or ₹0 while free).
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
    <div className="group w-full bg-white border border-slate-200 hover:border-[#F5A623]/80 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
      <div>
        {/* Image Container with Badge */}
        <Link to={`/${product.slug}/`} className="block relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-4 border border-slate-100 bg-slate-50">
          {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">No image</div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

          {/* Badges Container */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10 max-w-[80%]">
            {freeOn && (
              <span className="bg-emerald-600 text-white text-[10px] sm:text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-md tracking-wider">
                FREE
              </span>
            )}
            {dealOn && (
              <span className="bg-rose-600 text-white text-[10px] sm:text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-md tracking-wider">
                DEAL
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-[#F5A623] text-white text-[10px] sm:text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-md tracking-wider">
                BESTSELLER
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-blue-600 text-white text-[10px] sm:text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-md tracking-wider">
                NEW
              </span>
            )}
            {!product.isBestSeller && !product.isNewArrival && product.badge && (
              <span className="bg-[#F5A623] text-white text-[10px] sm:text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-md tracking-wider">
                {product.badge}
              </span>
            )}
          </div>

          {/* Instant Download Pill */}
          <span className="absolute bottom-2.5 left-2.5 bg-slate-900/85 backdrop-blur-md text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Instant Download
          </span>
        </Link>

        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-extrabold tracking-wider text-[#F5A623] uppercase">
            {displayText(product.brand) || displayText(product.software) || displayText(product.category) || 'Product'}
          </span>
          {reviewStats(product) && (
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <span>★</span>
            <span className="font-bold text-slate-800 text-[11px]">{reviewStats(product)!.rating.toFixed(1)}</span>
            <span className="text-slate-500 text-[10px]">({reviewStats(product)!.count})</span>
          </div>
          )}
        </div>

        {/* Title */}
        <Link to={`/${product.slug}/`} className="block">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#F5A623] transition-colors leading-snug line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Meta format & size */}
        {(displayText(product.format) || displayText(product.fileSize)) && (
        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-4 font-medium">
          {displayText(product.format) && (
          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold">
            {displayText(product.format)}
          </span>
          )}
          {displayText(product.fileSize) && <span>{displayText(product.fileSize)}</span>}
        </div>
        )}
      </div>

      {/* Price & Action */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {freeOn ? (
              <span className="text-xl font-black text-emerald-600">FREE</span>
            ) : (
              <span className="text-xl font-black text-slate-900">
                {price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Price on request'}
              </span>
            )}
            {compare > 0 && (
              <span className="text-xs font-semibold text-slate-400 line-through">
                ₹{compare.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {offPercent > 0 && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                freeOn
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-[#F5A623]/15 text-[#D97706] border-[#F5A623]/30'
              }`}
            >
              {freeOn ? '100% OFF' : `-${offPercent}% OFF`}
            </span>
          )}
        </div>

        <div className="mb-3 space-y-1.5">
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
          className={`w-full font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
            isAdded
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              : 'bg-gradient-to-r from-[#F5A623] to-[#FFAA00] hover:from-[#FFAA00] hover:to-[#F5A623] text-white shadow-amber-500/20 hover:-translate-y-0.5'
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <span>{freeOn ? 'Get it Free' : isAdded ? '✓ Added to Cart' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
