import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/common/ProductCard';
import FilterSidebar from '../components/filter/FilterSidebar';
import MobileFilterDrawer from '../components/filter/MobileFilterDrawer';
import WhatsAppButton from '../components/common/WhatsAppButton';
import { useProducts } from '../context/ProductContext';
import type { CategoryDefinition } from '../data/categories';
import type { FilterState, ProductCategory, SoftwareCompatibility } from '../types/product';

const INITIAL_FILTERS: FilterState = {
  categories: [],
  software: [],
  fileFormats: [],
  minPrice: 0,
  maxPrice: 20000,
  minRating: 0,
  sortBy: 'featured',
  searchQuery: ''
};

const CATEGORY_PILLS: { label: string; value: ProductCategory | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Softwares', value: 'Softwares' },
  { label: 'Excel Sheets', value: 'Excel Sheets' },
  { label: 'eBooks', value: 'eBooks' },
  { label: 'Projects', value: 'Projects' }
];

interface ProductListingPageProps {
  categoryDef?: CategoryDefinition;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({ categoryDef }) => {
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter')?.toLowerCase();

  const [filters, setFilters] = useState<FilterState>(() => {
    if (!categoryDef) return INITIAL_FILTERS;
    if (categoryDef.filterType === 'software') {
      return { ...INITIAL_FILTERS, software: [categoryDef.filterValue as SoftwareCompatibility] };
    }
    if (categoryDef.filterType === 'category') {
      return { ...INITIAL_FILTERS, categories: [categoryDef.filterValue as ProductCategory] };
    }
    return INITIAL_FILTERS;
  });

  useEffect(() => {
    if (categoryDef) {
      if (categoryDef.filterType === 'software') {
        setFilters({ ...INITIAL_FILTERS, software: [categoryDef.filterValue as SoftwareCompatibility] });
      } else if (categoryDef.filterType === 'category') {
        setFilters({ ...INITIAL_FILTERS, categories: [categoryDef.filterValue as ProductCategory] });
      }
    } else {
      setFilters(INITIAL_FILTERS);
    }
  }, [categoryDef]);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleQuickCategorySelect = (cat: ProductCategory | 'All') => {
    if (cat === 'All') {
      setFilters((prev) => ({ ...prev, categories: [] }));
    } else {
      setFilters((prev) => ({ ...prev, categories: [cat] }));
    }
  };

  // Filter & Sort Logic using dynamic products array
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.status === 'inactive') return false;

      // Handle URL Filter parameter (?filter=best-seller or ?filter=new-arrivals)
      if (filterParam === 'best-seller' || filterParam === 'best-sellers') {
        if (!product.isBestSeller && product.badge !== 'Bestseller') return false;
      } else if (filterParam === 'new-arrivals' || filterParam === 'new-arrival') {
        if (!product.isNewArrival && product.badge !== 'New') return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }
      // Software filter
      if (filters.software.length > 0 && !filters.software.includes(product.software)) {
        return false;
      }
      // File Format filter
      if (filters.fileFormats.length > 0) {
        const hasFormat = filters.fileFormats.some((fmt) =>
          product.format.toUpperCase().includes(fmt.toUpperCase())
        );
        if (!hasFormat) return false;
      }
      // Price range
      if (product.price > filters.maxPrice) {
        return false;
      }
      // Rating filter
      if (filters.minRating > 0 && product.rating < filters.minRating) {
        return false;
      }
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesSoftware = product.software.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesSoftware) return false;
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0; // featured default order
    });
  }, [products, filters, filterParam]);

  const activeCategoryPill =
    filters.categories.length === 1 ? filters.categories[0] : 'All';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      {/* Hero Header Banner */}
      <div className="w-full bg-white border-b border-slate-200 py-6 sm:py-8 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-[#F5A623] transition-colors">Home</Link>
            <span>/</span>
            {categoryDef ? (
              <>
                <Link to="/products" className="hover:text-[#F5A623] transition-colors">Products</Link>
                <span>/</span>
                <span className="text-[#F5A623] font-bold">{categoryDef.name}</span>
              </>
            ) : (
              <span className="text-[#F5A623] font-bold">All Products</span>
            )}
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {categoryDef
                  ? `${categoryDef.name} Digital Bundles`
                  : filterParam === 'best-seller' || filterParam === 'best-sellers'
                  ? 'Best Sellers Collection'
                  : filterParam === 'new-arrivals' || filterParam === 'new-arrival'
                  ? 'Newly Arrived Releases'
                  : 'All Software Products'}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                {categoryDef
                  ? categoryDef.description
                  : filterParam === 'best-seller' || filterParam === 'best-sellers'
                  ? 'Top-rated digital software packages and CAD/BIM libraries trusted by engineers.'
                  : filterParam === 'new-arrivals' || filterParam === 'new-arrival'
                  ? 'Explore the latest added CAD drawings, Revit families, and civil calculation tools.'
                  : 'Explore 100% digital AutoCAD bundles, Revit families, Excel BOQs, & civil engineering packages.'}
              </p>
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden w-full sm:w-auto bg-[#F5A623] hover:bg-amber-500 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filter Products</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Filter & Product Grid Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar (3 cols lg) */}
          <div className="hidden lg:block lg:col-span-3">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Product Area (9 cols lg) */}
          <div className="lg:col-span-9 space-y-6">
            {/* Top Toolbar: Search + Quick Category Pills + Sort Dropdown */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              {/* Category Quick Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {CATEGORY_PILLS.map((pill) => (
                  <button
                    key={pill.label}
                    type="button"
                    onClick={() => handleQuickCategorySelect(pill.value)}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      activeCategoryPill === pill.value
                        ? 'bg-[#F5A623] text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Count & Sort Selector */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                <span className="text-xs font-semibold text-slate-500">
                  Showing <strong className="text-slate-900">{filteredProducts.length}</strong> products
                </span>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium hidden sm:inline">Sort by:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange({
                        sortBy: e.target.value as FilterState['sortBy']
                      })
                    }
                    className="bg-white text-slate-900 font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#F5A623] cursor-pointer shadow-sm"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            ) : (
              <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
                <div className="text-4xl">🔍</div>
                <h3 className="text-lg font-bold text-slate-900">No products found matching your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your filter selection or searching for a different software keyword.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="bg-[#F5A623] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md hover:bg-amber-500 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        resultsCount={filteredProducts.length}
      />

      {/* Reusable Footer */}
      <Footer />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default ProductListingPage;
