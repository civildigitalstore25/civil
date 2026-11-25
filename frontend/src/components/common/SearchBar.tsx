import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { productApi, type ProductSuggestion } from '../../services/productApi';

const CATEGORY_ROUTE_MAP: Record<string, string> = {
  AutoCAD: '/autocad-software/',
  Revit: '/revit/',
  '3ds Max': '/3ds-max/',
  'Excel Sheets': '/excel-sheets/',
  eBooks: '/ebooks/',
};

export const SearchBar = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const urlSearch = searchParams.get('search') || searchParams.get('q') || '';
  const [category, setCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep header input aligned when navigating via URL ?search=...
  useEffect(() => {
    if (location.pathname === '/products') {
      setSearchTerm(urlSearch);
    }
  }, [location.pathname, urlSearch]);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, [location.pathname, location.search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced server-side auto-suggestions with request cancellation
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const items = await productApi.suggest(trimmed, category, 12, controller.signal);
        if (!controller.signal.aborted) {
          setSuggestions(items);
          setActiveIndex(-1);
        }
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError' && !controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm, category]);

  const navigateToSearchResults = () => {
    const trimmed = searchTerm.trim();
    setIsOpen(false);
    setActiveIndex(-1);

    if (trimmed) {
      const params = new URLSearchParams();
      params.set('search', trimmed);
      if (category !== 'All Categories') {
        params.set('category', category);
      }
      navigate(`/products?${params.toString()}`);
      return;
    }

    if (category !== 'All Categories') {
      navigate(CATEGORY_ROUTE_MAP[category] || `/products?category=${encodeURIComponent(category)}`);
      return;
    }

    navigate('/products');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      setIsOpen(false);
      navigate(`/${suggestions[activeIndex].slug}/`);
      return;
    }
    navigateToSearchResults();
  };

  const handleSelectSuggestion = (item: ProductSuggestion) => {
    setIsOpen(false);
    setActiveIndex(-1);
    navigate(`/${item.slug}/`);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
    if (location.pathname === '/products' && urlSearch) {
      navigate('/products');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && suggestions.length > 0) {
      setIsOpen(true);
      setActiveIndex(0);
      e.preventDefault();
      return;
    }

    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown = isOpen && searchTerm.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form
        onSubmit={handleSearch}
        className="w-full flex items-center bg-white border-2 border-[#F5A623] rounded-xl overflow-hidden shadow-sm focus-within:shadow-md focus-within:border-[#FFAA00] transition-all duration-200"
      >
        {/* Category Dropdown */}
        <div className="relative shrink-0 border-r border-slate-200">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter search by category"
            className="appearance-none bg-white py-2.5 pl-3 pr-7 sm:pl-3.5 sm:pr-8 text-xs md:text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="All Categories">All Categories</option>
            <option value="AutoCAD">AutoCAD</option>
            <option value="Revit">Revit</option>
            <option value="3ds Max">3ds Max</option>
            <option value="STAAD Pro">STAAD Pro</option>
            <option value="Excel Sheets">Excel Sheets</option>
            <option value="eBooks">eBooks</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 sm:right-2.5 flex items-center text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Input Field + Clear Button */}
        <div className="relative flex-1 flex items-center min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onFocus={() => {
              if (searchTerm.trim()) setIsOpen(true);
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search AutoCAD, Revit, 3ds Max, Excel Sheets, eBooks..."
            aria-label="Search products"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            autoComplete="off"
            className="w-full pl-3.5 pr-8 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-[#F5A623] hover:bg-[#FFAA00] text-white px-4 sm:px-5 py-3 flex items-center justify-center shrink-0 transition-colors duration-200 cursor-pointer"
          aria-label="Search"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 stroke-current" fill="none" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {/* Auto-Suggestion Dropdown */}
      {showDropdown && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        >
          {isLoading ? (
            <div className="px-4 py-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <span className="h-4 w-4 rounded-full border-2 border-[#F5A623] border-t-transparent animate-spin" />
              <span>Searching catalog...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-5 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">
                No products matched &ldquo;{searchTerm.trim()}&rdquo;
              </p>
              <p className="text-[11px] text-slate-400">
                Try another keyword or switch category filter.
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#0B1B2E]/70">
                {suggestions.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleSelectSuggestion(item)}
                      className={`w-full px-3.5 py-2.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                        isActive ? 'bg-amber-50/90' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">IMG</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#0B1B2E]">
                          {item.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs">
                          {item.isFree ? (
                            <span className="font-extrabold text-emerald-600">FREE</span>
                          ) : item.price > 0 ? (
                            <span className="font-bold text-slate-600">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-400">On request</span>
                          )}
                          {(item.brand || item.category) && (
                            <span className="truncate text-[11px] font-medium text-slate-400">
                              • {item.brand || item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={navigateToSearchResults}
                className="w-full border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-xs font-extrabold text-[#D97706] hover:bg-amber-50 transition-colors cursor-pointer"
              >
                View all results for &ldquo;{searchTerm.trim()}&rdquo; →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
