import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { useProducts } from '../../context/ProductContext';
import { getBestSellerProducts } from '../../utils/productSelectors';

export const BestSellersSection: React.FC = () => {
  const { products } = useProducts();
  const bestSellers = getBestSellerProducts(products);

  if (bestSellers.length === 0) return null;

  return (
    <section className="w-full bg-white text-slate-900 py-12 md:py-20 border-b border-slate-200">
      <div className="w-[90%] max-w-[1540px] mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#D97706] text-xs font-extrabold uppercase tracking-wider mb-1">
              <span>★</span>
              <span>TOP CHOICE BUNDLES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Popular software bundles trusted by civil engineers & architects
            </p>
          </div>

          <Link
            to="/products?filter=best-seller"
            className="group bg-slate-100 hover:bg-[#F5A623] hover:text-white text-slate-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#F5A623] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>View All</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Product Cards Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default BestSellersSection;
