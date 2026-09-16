import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { useCategories } from '../../context/CategoryContext';
import { useProducts } from '../../context/ProductContext';
import { getCategoryProducts } from '../../utils/productSelectors';

export const CategoryProductsSection: React.FC = () => {
  const { categories } = useCategories();
  const { products } = useProducts();

  return (
    <div className="w-full bg-white text-slate-900 py-12 md:py-16 space-y-16 border-b border-slate-200">
      {categories.map((category) => {
        const catProducts = getCategoryProducts(products, category, 4);

        // Hide empty category sections automatically
        if (catProducts.length === 0) return null;

        return (
          <section key={category.slug} className="w-[90%] max-w-[1540px] mx-auto space-y-6">
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-extrabold text-[#D97706] uppercase tracking-wider block mb-1">
                  {category.name.toUpperCase()}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Popular {category.name} Products
                </h3>
              </div>

              <Link
                to={`/${category.slug}/`}
                className="group bg-slate-100 hover:bg-[#F5A623] hover:text-white text-slate-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#F5A623] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>View All</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Product Grid - Fully Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {catProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default CategoryProductsSection;
