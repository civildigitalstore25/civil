import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import type { CategoryDefinition } from '../../data/categories';
import { getBestSellerProducts, getNewArrivalProducts, getCategoryProducts } from '../../utils/productSelectors';

export const HomeProductShowcase: React.FC = () => {
  const { products } = useProducts();
  const { categories } = useCategories();

  // Active filter tab: 'all' | 'best-sellers' | 'new-arrivals' | category.slug
  const [activeTab, setActiveTab] = useState<string>('all');

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.status !== 'inactive');
  }, [products]);

  // Tab definitions combining All, Highlights, and Categories
  const tabs = useMemo(() => {
    const list: { id: string; label: string; count: number; categoryDef?: CategoryDefinition }[] = [
      {
        id: 'all',
        label: 'All Products',
        count: activeProducts.length,
      },
      {
        id: 'best-sellers',
        label: 'Best Sellers',
        count: getBestSellerProducts(activeProducts).length,
      },
      {
        id: 'new-arrivals',
        label: 'Newly Arrived',
        count: getNewArrivalProducts(activeProducts).length,
      },
    ];

    categories.forEach((cat) => {
      const catProds = getCategoryProducts(activeProducts, cat, 100);
      if (catProds.length > 0) {
        list.push({
          id: cat.slug,
          label: cat.name,
          count: catProds.length,
          categoryDef: cat,
        });
      }
    });

    return list;
  }, [activeProducts, categories]);

  // Display products based on active tab
  const displayedProducts = useMemo(() => {
    if (activeTab === 'all') {
      return [...activeProducts].sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount)).slice(0, 8);
    }
    if (activeTab === 'best-sellers') {
      return getBestSellerProducts(activeProducts).slice(0, 8);
    }
    if (activeTab === 'new-arrivals') {
      return getNewArrivalProducts(activeProducts).slice(0, 8);
    }

    const matchedCat = categories.find((c) => c.slug === activeTab);
    if (matchedCat) {
      return getCategoryProducts(activeProducts, matchedCat, 8);
    }

    return activeProducts.slice(0, 8);
  }, [activeTab, activeProducts, categories]);

  // Get current active tab object for heading & view all link
  const currentTabObj = useMemo(() => {
    return tabs.find((t) => t.id === activeTab) || tabs[0];
  }, [activeTab, tabs]);

  // View All button URL
  const viewAllUrl = useMemo(() => {
    if (activeTab === 'best-sellers') return '/products?filter=best-seller';
    if (activeTab === 'new-arrivals') return '/products?filter=new-arrivals';
    if (currentTabObj?.categoryDef) return `/${currentTabObj.categoryDef.slug}/`;
    return '/products';
  }, [activeTab, currentTabObj]);

  return (
    <section className="w-full bg-white text-slate-900 py-12 md:py-20 border-b border-slate-200">
      <div className="w-[90%] max-w-[1540px] mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-1">
          <div>
            <span className="text-xs font-extrabold text-[#D97706] uppercase tracking-wider block mb-1">
              DIGITAL STORE CATALOGUE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {currentTabObj.label}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Showing {displayedProducts.length} top products in this section
            </p>
          </div>

          <Link
            to={viewAllUrl}
            className="group bg-slate-100 hover:bg-[#F5A623] hover:text-white text-slate-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#F5A623] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>View All {currentTabObj.label}</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Top Interactive Filter Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-[#0D1B2A] text-white shadow-md shadow-slate-900/10 border border-slate-900'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-[#F5A623] text-slate-950' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Product Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <div className="text-3xl">📦</div>
            <h3 className="text-base font-bold text-slate-900">No active products found in this category</h3>
            <p className="text-xs text-slate-500">Products assigned through Admin will appear here automatically.</p>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="bg-[#F5A623] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md hover:bg-amber-600 transition-all cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default HomeProductShowcase;
