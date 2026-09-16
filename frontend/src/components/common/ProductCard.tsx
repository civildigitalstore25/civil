import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className="group w-full bg-white border border-slate-200 hover:border-[#F5A623]/80 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
      <div>
        {/* Image Container with Badge */}
        <Link to={`/${product.slug}/`} className="block relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-4 border border-slate-100 bg-slate-50">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

          {/* Badges Container */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10 max-w-[80%]">
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
            {product.software || product.category}
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <span>★</span>
            <span className="font-bold text-slate-800 text-[11px]">{product.rating}</span>
            <span className="text-slate-500 text-[10px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/${product.slug}/`} className="block">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#F5A623] transition-colors leading-snug line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Meta format & size */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-4 font-medium">
          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold">
            {product.format}
          </span>
          <span>•</span>
          <span>{product.fileSize}</span>
        </div>
      </div>

      {/* Price & Action */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900">₹{product.price.toLocaleString()}</span>
            <span className="text-xs font-semibold text-slate-400 line-through">
              ₹{product.oldPrice.toLocaleString()}
            </span>
          </div>

          <span className="bg-[#F5A623]/15 text-[#D97706] border border-[#F5A623]/30 text-[11px] font-bold px-2 py-0.5 rounded-md">
            -{product.discountPercent}% OFF
          </span>
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
          <span>{isAdded ? '✓ Added to Cart' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
