import React, { useState } from 'react';
import type { Coupon } from '../../../types/coupon';
import CouponStatusBadge from './CouponStatusBadge';

interface CouponTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
  onCreateClick: () => void;
}

export const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  onEdit,
  onDelete,
  onToggleStatus,
  onCreateClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'fixed'>('all');

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && coupon.status === 'active') ||
      (statusFilter === 'inactive' && coupon.status === 'inactive');

    const matchesType = typeFilter === 'all' || coupon.discountType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getApplicableProductsText = (applicableProducts: string[]) => {
    if (!applicableProducts || applicableProducts.length === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
          🌐 Site-wide
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
        📦 {applicableProducts.length} {applicableProducts.length === 1 ? 'Product' : 'Products'}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search coupon code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
        </div>
      </div>

      {/* Coupons Table / Cards Container */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-amber-50 text-[#F5A000] rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
            🏷️
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">No coupons found</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mt-1">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No coupons match your filter criteria. Try adjusting your search.'
                : 'Create your first coupon to start offering discounts to your customers.'}
            </p>
          </div>
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 bg-[#F5A000] hover:bg-amber-600 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>+ Create New Coupon</span>
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Coupon</th>
                    <th className="py-3.5 px-4">Discount</th>
                    <th className="py-3.5 px-4">Validity</th>
                    <th className="py-3.5 px-4">Usage</th>
                    <th className="py-3.5 px-4">Target</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id || coupon._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Code & Name */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-extrabold text-xs text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md tracking-wider inline-block">
                            {coupon.code}
                          </span>
                          <p className="font-bold text-slate-800 text-xs line-clamp-1">{coupon.name}</p>
                          {coupon.description && (
                            <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                              {coupon.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg inline-block">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`}
                        </span>
                      </td>

                      {/* Validity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-[11px] font-semibold text-slate-600 space-y-0.5">
                          <div>
                            <span className="text-slate-400 font-normal">From: </span>
                            {formatDate(coupon.validFrom)}
                          </div>
                          <div>
                            <span className="text-slate-400 font-normal">To: </span>
                            {formatDate(coupon.validTo)}
                          </div>
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="font-extrabold text-xs text-slate-800">
                            {coupon.usageCount} / {coupon.usageLimit}
                          </span>
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                            <div
                              className="bg-[#F5A000] h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getApplicableProductsText(coupon.applicableProducts)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <CouponStatusBadge coupon={coupon} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active Status */}
                          <button
                            type="button"
                            title={coupon.status === 'active' ? 'Deactivate Coupon' : 'Activate Coupon'}
                            onClick={() => onToggleStatus(coupon)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                              coupon.status === 'active'
                                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => onEdit(coupon)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer border border-slate-200"
                          >
                            Edit
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => onDelete(coupon)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg transition-colors cursor-pointer border border-rose-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="lg:hidden space-y-3">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id || coupon._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-mono font-extrabold text-xs text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md tracking-wider inline-block">
                      {coupon.code}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm">{coupon.name}</h3>
                  </div>
                  <CouponStatusBadge coupon={coupon} />
                </div>

                {coupon.description && (
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {coupon.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium text-[11px] block">Discount</span>
                    <span className="font-extrabold text-emerald-700">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium text-[11px] block">Target</span>
                    {getApplicableProductsText(coupon.applicableProducts)}
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium text-[11px] block">Validity</span>
                    <span className="font-semibold text-slate-700 text-[11px]">
                      {formatDate(coupon.validFrom)} to {formatDate(coupon.validTo)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium text-[11px] block">Usage</span>
                    <span className="font-bold text-slate-800">
                      {coupon.usageCount} / {coupon.usageLimit} used
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(coupon)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                      coupon.status === 'active'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(coupon)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(coupon)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-rose-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CouponTable;
