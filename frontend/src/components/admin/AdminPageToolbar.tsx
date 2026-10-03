import React from 'react';
import { FileCode, FileSpreadsheet, RotateCcw, Search } from 'lucide-react';

export const adminButtonClass = {
  primary:
    'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F5A000] px-4 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-amber-600',
  secondary:
    'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50',
  excel:
    'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100',
  json:
    'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50',
} as const;

export interface AdminFilterField {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}

interface AdminPageToolbarProps {
  title: string;
  description?: string;
  count?: number;
  countLabel?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: AdminFilterField[];
  extra?: React.ReactNode;
  onClear?: () => void;
  onExportExcel?: () => void;
  onExportJson?: () => void;
  actions?: React.ReactNode;
}

export const AdminPageToolbar: React.FC<AdminPageToolbarProps> = ({
  title,
  description,
  count,
  countLabel = 'records',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  filters = [],
  extra,
  onClear,
  onExportExcel,
  onExportJson,
  actions,
}) => {
  const showTools = onSearchChange || filters.length > 0 || extra || onClear;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">{title}</h2>
            {typeof count === 'number' && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {count} {countLabel}
              </span>
            )}
          </div>
          {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {onExportExcel && (
            <button type="button" onClick={onExportExcel} className={adminButtonClass.excel}>
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
          )}
          {onExportJson && (
            <button type="button" onClick={onExportJson} className={adminButtonClass.json}>
              <FileCode className="h-4 w-4" />
              <span>Export JSON</span>
            </button>
          )}
          {actions}
        </div>
      </div>

      {showTools && (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center">
          {onSearchChange && (
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
              />
            </div>
          )}

          {filters.map((filter) => (
            <select
              key={filter.id}
              aria-label={filter.ariaLabel}
              value={filter.value}
              onChange={(event) => filter.onChange(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 lg:w-44"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}

          {extra && <div className="flex h-10 items-center">{extra}</div>}

          {onClear && (
            <button type="button" onClick={onClear} className={`${adminButtonClass.secondary} lg:ml-auto`}>
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default AdminPageToolbar;
