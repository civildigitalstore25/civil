import React from 'react';
import type { FilterState, ProductCategory, SoftwareCompatibility } from '../../types/product';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

const CATEGORY_OPTIONS: ProductCategory[] = ['Softwares', 'Excel Sheets', 'eBooks', 'Projects'];
const SOFTWARE_OPTIONS: SoftwareCompatibility[] = ['AutoCAD', 'Revit', 'SketchUp', '3ds Max', 'Lumion', 'Tekla'];
const FORMAT_OPTIONS = ['RFA', 'RVT', 'DWG', 'XLSX', 'PDF', 'SKP', 'MAX', 'MPP'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const handleCategoryToggle = (cat: ProductCategory) => {
    const isSelected = filters.categories.includes(cat);
    const newCategories = isSelected
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onFilterChange({ categories: newCategories });
  };

  const handleSoftwareToggle = (soft: SoftwareCompatibility) => {
    const isSelected = filters.software.includes(soft);
    const newSoftware = isSelected
      ? filters.software.filter((s) => s !== soft)
      : [...filters.software, soft];
    onFilterChange({ software: newSoftware });
  };

  const handleFormatToggle = (fmt: string) => {
    const isSelected = filters.fileFormats.includes(fmt);
    const newFormats = isSelected
      ? filters.fileFormats.filter((f) => f !== fmt)
      : [...filters.fileFormats, fmt];
    onFilterChange({ fileFormats: newFormats });
  };

  return (
    <aside className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
      {/* Header & Clear Filters Button */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Products
        </h3>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-bold text-[#F5A623] hover:underline cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={filters.categories.length === 0}
              onChange={() => onFilterChange({ categories: [] })}
              className="accent-[#F5A623] rounded w-4 h-4"
            />
            <span>All Categories</span>
          </label>
          {CATEGORY_OPTIONS.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => handleCategoryToggle(cat)}
                className="accent-[#F5A623] rounded w-4 h-4"
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Software Compatibility Filter */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Software Compatibility</h4>
        <div className="space-y-2">
          {SOFTWARE_OPTIONS.map((soft) => (
            <label key={soft} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900">
              <input
                type="checkbox"
                checked={filters.software.includes(soft)}
                onChange={() => handleSoftwareToggle(soft)}
                className="accent-[#F5A623] rounded w-4 h-4"
              />
              <span>{soft}</span>
            </label>
          ))}
        </div>
      </div>

      {/* File Format Filter */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">File Format</h4>
        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((fmt) => {
            const isSelected = filters.fileFormats.includes(fmt);
            return (
              <button
                key={fmt}
                type="button"
                onClick={() => handleFormatToggle(fmt)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#F5A623] text-white border-[#F5A623]'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {fmt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          <span>Price Range</span>
          <span className="text-[#D97706]">Up to ₹{filters.maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="0"
          max="20000"
          step="500"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
          className="w-full accent-[#F5A623] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
          <span>₹0</span>
          <span>₹20,000</span>
        </div>
      </div>

      {/* Customer Rating Filter */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Customer Rating</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={filters.minRating === 4}
              onChange={() => onFilterChange({ minRating: filters.minRating === 4 ? 0 : 4 })}
              className="accent-[#F5A623] rounded w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <span className="text-amber-500 font-bold">4★ & above</span>
            </span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={filters.minRating === 3}
              onChange={() => onFilterChange({ minRating: filters.minRating === 3 ? 0 : 3 })}
              className="accent-[#F5A623] rounded w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <span className="text-amber-500 font-bold">3★ & above</span>
            </span>
          </label>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
