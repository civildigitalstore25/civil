import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { useProducts } from '../../context/ProductContext';
import { useBackendBrands } from '../../hooks/useBackendBrands';
import { productMatchesCatalog } from '../../utils/catalogMatch';
import { getBestSellerProducts, getNewArrivalProducts } from '../../utils/productSelectors';
import type { Product } from '../../types/product';

type ShowcaseTab = {
  id: string;
  label: string;
  count: number;
  href?: string;
  products?: Product[];
};

export const HomeProductShowcase: React.FC = () => {
  const { products } = useProducts();
  const { brands } = useBackendBrands();

  const [activeTab, setActiveTab] = useState<string>('all');

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.status !== 'inactive' && p.status !== 'draft');
  }, [products]);

  const tabs = useMemo(() => {
    const list: ShowcaseTab[] = [
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

    brands.forEach((brand) => {
      brand.categories.forEach((category) => {
        const matches = activeProducts.filter((product) => productMatchesCatalog(product, category, brand));
        if (matches.length === 0) return;
        list.push({
          id: `${brand.slug}:${category.slug}`,
          label: category.name,
          count: matches.length,
          href: `/products?brand=${encodeURIComponent(brand.slug)}&category=${encodeURIComponent(category.slug)}`,
          products: matches,
        });
      });
    });

    return list;
  }, [activeProducts, brands]);

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

    const matchedTab = tabs.find((tab) => tab.id === activeTab);
    return (matchedTab?.products ?? activeProducts).slice(0, 8);
  }, [activeTab, activeProducts, tabs]);

  const currentTabObj = useMemo(() => {
    return tabs.find((t) => t.id === activeTab) || tabs[0];
  }, [activeTab, tabs]);

  const viewAllUrl = useMemo(() => {
    if (activeTab === 'best-sellers') return '/products?filter=best-seller';
    if (activeTab === 'new-arrivals') return '/products?filter=new-arrivals';
    if (currentTabObj?.href) return currentTabObj.href;
    return '/products';
  }, [activeTab, currentTabObj]);

  return (
    <section id="explore" className="w-full bg-white text-slate-900 py-12 md:py-20 border-b border-slate-200">
      <div className="w-[90%] max-w-[1540px] mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-1">
          <div>
            <span className="text-xs font-extrabold text-[#D97706] uppercase tracking-wider block mb-1">
              DIGITAL STORE CATALOGUE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {currentTabObj?.label ?? 'All Products'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Showing {displayedProducts.length} top products in this section
            </p>
          </div>

          <Link
            to={viewAllUrl}
            className="group bg-slate-100 hover:bg-[#F5A623] hover:text-white text-slate-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#F5A623] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>View All {currentTabObj?.label ?? 'Products'}</span>
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
