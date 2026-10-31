import React from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export const FeaturedProductCard: React.FC = () => {
  const { products, loading } = useProducts();

  const featuredProduct =
    products.find((p) => p.status === 'active' && p.isBestSeller) ||
    products.find((p) => p.status === 'active') ||
    products[0];

  if (loading) {
    return (
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 shadow-2xl shadow-slate-950/60 animate-pulse">
        <div className="w-full aspect-video bg-slate-800 rounded-xl mb-4" />
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
        <div className="h-6 bg-slate-800 rounded w-3/4 mb-4" />
        <div className="h-8 bg-slate-800 rounded w-1/2" />
      </div>
    );
  }

  if (!featuredProduct) {
    return (
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 shadow-2xl shadow-slate-950/60 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-[#F5A623]">
          <PackageOpen className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No products available</h3>
        <p className="text-xs text-slate-400">
          Products will appear here once added in the store catalog.
        </p>
      </div>
    );
  }

  const image =
    featuredProduct.images?.[0] ||
    featuredProduct.imageUrl ||
    '';
  const price = featuredProduct.price;
  const oldPrice = featuredProduct.oldPrice;
  const discountPercent =
    featuredProduct.discountPercent ||
    (oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
  const categoryLabel = featuredProduct.software || featuredProduct.category || 'Featured';

  return (
    <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 hover:border-[#F5A623]/50 rounded-2xl p-4 shadow-2xl shadow-slate-950/60 transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Container */}
      <Link
        to={`/${featuredProduct.slug}/`}
        className="block relative w-full aspect-video rounded-xl overflow-hidden mb-4 border border-slate-800 bg-slate-950"
      >
        {image ? (
          <img
            src={image}
            alt={featuredProduct.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800 text-xs">
            {featuredProduct.name}
          </div>
        )}
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

        {/* Bestseller Badge */}
        {featuredProduct.isBestSeller && (
          <span className="absolute top-3 left-3 bg-[#F5A623] text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-md shadow-md tracking-wider">
            Bestseller
          </span>
        )}
      </Link>

      {/* Content Area */}
      <div className="px-1 space-y-2.5">
        {/* Category */}
        <div className="text-[11px] font-extrabold tracking-widest text-[#F5A623] uppercase">
          {categoryLabel}
        </div>

        {/* Product Title */}
        <Link to={`/${featuredProduct.slug}/`} className="block">
          <h3 className="text-lg md:text-xl font-bold text-white leading-snug hover:text-[#F5A623] transition-colors line-clamp-2">
            {featuredProduct.name}
          </h3>
        </Link>

        {/* Price & Discount Section */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black text-white">₹{price.toLocaleString('en-IN')}</span>
            {oldPrice && oldPrice > price ? (
              <span className="text-sm font-semibold text-slate-400 line-through">
                ₹{oldPrice.toLocaleString('en-IN')}
              </span>
            ) : null}
          </div>

          {discountPercent > 0 && (
            <span className="bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30 text-xs font-bold px-2.5 py-1 rounded-md">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick Add / Buy Button inside Card */}
        <Link
          to={`/${featuredProduct.slug}/`}
          className="w-full mt-3 bg-gradient-to-r from-[#F5A623] to-[#FFAA00] hover:from-[#FFAA00] hover:to-[#F5A623] text-white font-bold py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <span>Get Instant Access Now</span>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedProductCard;
