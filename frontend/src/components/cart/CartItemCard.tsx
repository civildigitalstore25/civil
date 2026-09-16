import React from 'react';
import { Link } from 'react-router-dom';
import type { CartItem } from '../../types/cart';
import { getProductBySlug } from '../../data/products';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const formattedPrice = item.price.toLocaleString('en-IN');
  const formattedOldPrice = item.oldPrice.toLocaleString('en-IN');
  const product = getProductBySlug(item.productId);
  const productSlug = product ? product.slug : item.productId;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
        {/* Left Section: Image + Info */}
        <div className="flex items-start gap-3 sm:gap-4 md:gap-5 flex-1 min-w-0 w-full sm:w-auto">
          {/* Thumbnail */}
          <Link to={`/${productSlug}/`} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden p-1 flex items-center justify-center group">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-contain max-h-full rounded-lg group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
            {/* Category */}
            <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-[#F5A623] bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
              {item.category}
            </span>

            {/* Product Title */}
            <Link to={`/${productSlug}/`} className="block">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#F5A623] transition-colors leading-snug line-clamp-2">
                {item.name}
              </h3>
            </Link>


            {/* Badges / Metadata */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] font-medium text-slate-600 pt-0.5">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200">
                {item.format}
              </span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {item.fileSize}
              </span>
              {item.instantDownload && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded font-semibold text-[11px]">
                  <svg className="w-3 h-3 fill-emerald-600" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Instant Download
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Quantity, Price & Remove (Flex arrangement for Mobile & Desktop) */}
        <div className="w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex items-center justify-between sm:justify-end gap-4 md:gap-8 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center space-x-1 border border-slate-200 rounded-xl bg-slate-50 p-1">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => onUpdateQuantity(item.id, -1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
            >
              −
            </button>
            <span className="w-8 text-center text-xs sm:text-sm font-extrabold text-slate-900">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => onUpdateQuantity(item.id, 1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
            >
              +
            </button>
          </div>

          {/* Price Section */}
          <div className="text-right min-w-[90px]">
            <div className="text-base sm:text-lg font-extrabold text-slate-900">
              ₹{formattedPrice}
            </div>
            <div className="text-xs text-slate-400 line-through font-medium">
              ₹{formattedOldPrice}
            </div>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            aria-label={`Remove ${item.name}`}
            onClick={() => onRemove(item.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-150 cursor-pointer flex items-center gap-1 group"
            title="Remove item"
          >
            <svg className="w-5 h-5 stroke-current group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden md:inline text-xs font-semibold">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
