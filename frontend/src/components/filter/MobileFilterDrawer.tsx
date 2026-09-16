import React from 'react';
import type { FilterState } from '../../types/product';
import FilterSidebar from './FilterSidebar';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onClearFilters: () => void;
  resultsCount: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  resultsCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Top Sticky Header */}
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <h3 className="text-base font-extrabold text-slate-900">Filter Products</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-4 flex-grow">
          <FilterSidebar
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />
        </div>

        {/* Bottom Apply Action Bar */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#F5A623] hover:bg-amber-500 text-white font-extrabold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Apply Filters ({resultsCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterDrawer;
