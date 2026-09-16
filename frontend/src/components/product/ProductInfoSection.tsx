import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';

interface ProductInfoSectionProps {
  product: Product;
}

export const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const savingsAmount = product.oldPrice - product.price;

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyItNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="flex flex-col text-slate-900 space-y-6">
      {/* Category & Status Badges */}
      <div className="flex items-center gap-2.5">
        <span className="bg-[#F5A623]/15 text-[#D97706] border border-[#F5A623]/30 text-xs font-black uppercase px-3 py-1 rounded-md tracking-wider">
          {product.software || product.category}
        </span>
        {product.badge && (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black uppercase px-3 py-1 rounded-md tracking-wider">
            {product.badge}
          </span>
        )}
      </div>

      {/* Product Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
        {product.name}
      </h1>

      {/* Rating & Downloads Bar */}
      <div className="flex items-center gap-4 flex-wrap text-sm text-slate-700">
        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
          <div className="flex text-amber-500 text-base">★★★★★</div>
          <span className="font-extrabold text-slate-900">{product.rating}</span>
          <span className="text-slate-500 text-xs">({product.reviewCount} reviews)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <svg className="w-4 h-4 text-emerald-600 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-slate-800 font-bold">{product.downloadsCount}</span> downloads
        </div>
      </div>

      {/* Price Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl sm:text-4xl font-black text-slate-900">
            ₹{(product.price * quantity).toLocaleString()}
          </span>
          <span className="text-lg text-slate-400 line-through font-semibold">
            ₹{(product.oldPrice * quantity).toLocaleString()}
          </span>
          <span className="bg-[#F5A623] text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full shadow-sm">
            -{product.discountPercent}% OFF
          </span>
        </div>

        {/* Green Savings Message Box */}
        {savingsAmount > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-bold">
            <svg className="w-4 h-4 shrink-0 fill-current text-emerald-600" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>You saved ₹{(savingsAmount * quantity).toLocaleString()} on this purchase!</span>
          </div>
        )}
      </div>

      {/* Feature Badges / Compact Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-2.5 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Format</span>
          <span className="text-xs font-bold text-slate-800">{product.format}</span>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-2.5 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Size</span>
          <span className="text-xs font-bold text-slate-800">{product.fileSize}</span>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-2.5 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery</span>
          <span className="text-xs font-bold text-emerald-600">Instant</span>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-2.5 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Access</span>
          <span className="text-xs font-bold text-[#D97706]">Lifetime</span>
        </div>
      </div>

      {/* Short Description */}
      <p className="text-slate-600 text-sm leading-relaxed font-normal">
        {product.shortDescription}
      </p>

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Quantity:</span>
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-200 text-slate-800 flex items-center justify-center text-base font-bold transition-colors cursor-pointer"
          >
            -
          </button>
          <span className="w-10 text-center font-extrabold text-slate-900 text-sm">{quantity}</span>
          <button
            type="button"
            onClick={handleIncrement}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-200 text-slate-800 flex items-center justify-center text-base font-bold transition-colors cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Purchase Actions */}
      <div className="space-y-3 pt-2">
        {/* ADD TO CART */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full font-extrabold text-base py-4 rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
            addedToCart
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-gradient-to-r from-[#F5A623] to-[#FFAA00] hover:from-[#FFAA00] hover:to-[#F5A623] text-white shadow-amber-500/25 hover:-translate-y-0.5'
          }`}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <span>{addedToCart ? '✓ Added to Cart!' : 'ADD TO CART'}</span>
        </button>

        {/* BUY IT NOW */}
        <button
          type="button"
          onClick={handleBuyItNow}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-base py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 transition-all duration-200 cursor-pointer shadow-sm"
        >
          BUY IT NOW
        </button>
      </div>

      {/* Trust / Service Information */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
        <div className="flex flex-col items-center gap-1 p-2">
          <svg className="w-5 h-5 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[11px] font-semibold text-slate-700">Secure Checkout</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[11px] font-semibold text-slate-700">Instant Delivery</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2">
          <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[11px] font-semibold text-slate-700">WhatsApp Support</span>
        </div>
      </div>

      {/* WhatsApp Direct Order Button */}
      <a
        href={`https://wa.me/918807423228?text=${encodeURIComponent(`Hi, I am interested in purchasing ${product.name}`)}`}
        target="_blank"
        rel="noreferrer"
        className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-white font-extrabold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-green-600/15 transition-all duration-200 cursor-pointer"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
        <span>Order on WhatsApp</span>
      </a>
    </div>
  );
};

export default ProductInfoSection;
