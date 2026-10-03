import React, { useState, useEffect } from 'react';
import type { Coupon, CouponFormData } from '../../../types/coupon';
import { useCategories } from '../../../context/CategoryContext';
import { useProducts } from '../../../context/ProductContext';
import { useCoupons } from '../../../context/CouponContext';

interface CouponModalProps {
  isOpen: boolean;
  couponToEdit?: Coupon | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  couponToEdit,
  onClose,
  onSubmitSuccess,
}) => {
  const { categories } = useCategories();
  const { products } = useProducts();
  const { addCoupon, updateCoupon, generateCouponCode } = useCoupons();

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number | ''>(0);
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | ''>(1);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or populate form
  useEffect(() => {
    if (couponToEdit) {
      setCode(couponToEdit.code);
      setName(couponToEdit.name);
      setDescription(couponToEdit.description || '');
      setDiscountType(couponToEdit.discountType);
      setDiscountValue(couponToEdit.discountValue);
      setValidFrom(couponToEdit.validFrom ? couponToEdit.validFrom.split('T')[0] : '');
      setValidTo(couponToEdit.validTo ? couponToEdit.validTo.split('T')[0] : '');
      setUsageLimit(couponToEdit.usageLimit);
      setSelectedProductIds(couponToEdit.applicableProducts || []);
      setStatus(couponToEdit.status);
    } else {
      // Default new form values
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setCode(generateCouponCode());
      setName('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue(10);
      setValidFrom(today);
      setValidTo(nextYear);
      setUsageLimit(100);
      setSelectedProductIds([]);
      setStatus('active');
    }
    setSelectedCategorySlug('all');
    setErrors({});
    setFormError(null);
  }, [couponToEdit, isOpen, generateCouponCode]);

  if (!isOpen) return null;

  // Code Generation Handler
  const handleGenerateCode = () => {
    const newCode = generateCouponCode();
    setCode(newCode);
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: '' }));
    }
  };

  // Filter products by selected category
  const filteredProducts = products.filter((p) => {
    if (selectedCategorySlug === 'all') return true;
    const cat = categories.find((c) => c.slug === selectedCategorySlug);
    if (!cat) return true;
    return (
      p.categorySlug.toLowerCase() === cat.slug.toLowerCase() ||
      p.category.toLowerCase() === cat.name.toLowerCase() ||
      p.software.toLowerCase() === cat.name.toLowerCase()
    );
  });

  // Toggle single product checkbox
  const handleProductToggle = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Remove chip handler
  const handleRemoveChip = (productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      newErrors.code = 'Coupon Code is required.';
    } else if (/\s/.test(cleanCode)) {
      newErrors.code = 'Coupon Code cannot contain spaces.';
    }

    if (!name.trim()) {
      newErrors.name = 'Coupon Name is required.';
    }

    const valNum = Number(discountValue);
    if (discountValue === '' || isNaN(valNum) || valNum <= 0) {
      newErrors.discountValue = 'Discount Value must be a positive number greater than 0.';
    } else if (discountType === 'percentage' && valNum > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%.';
    }

    if (!validFrom) {
      newErrors.validFrom = 'Valid From date is required.';
    }

    if (!validTo) {
      newErrors.validTo = 'Valid To date is required.';
    } else if (validFrom && new Date(validTo) < new Date(validFrom)) {
      newErrors.validTo = 'Valid To date must be equal to or after Valid From date.';
    }

    const limitNum = Number(usageLimit);
    if (usageLimit === '' || isNaN(limitNum) || limitNum <= 0) {
      newErrors.usageLimit = 'Usage Limit must be a positive integer greater than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      return;
    }

    const formData: CouponFormData = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      validFrom,
      validTo,
      usageLimit: Number(usageLimit),
      applicableProducts: selectedProductIds,
      applicableCategories: selectedCategorySlug !== 'all' ? [selectedCategorySlug] : [],
      status,
    };

    if (couponToEdit) {
      const result = updateCoupon(couponToEdit.id || couponToEdit._id!, formData);
      if (!result.success) {
        setFormError(result.error || 'Failed to update coupon.');
        return;
      }
    } else {
      const result = addCoupon(formData);
      if (!result.success) {
        setFormError(result.error || 'Failed to create coupon.');
        return;
      }
    }

    onSubmitSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      {/* Modal Dialog Container with internal vertical scroll */}
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-[#F5A000] font-extrabold flex items-center justify-center text-base">
              🏷️
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {couponToEdit ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Global Form Error Banner */}
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl animate-fade-in">
            ⚠️ {formError}
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          
          {/* A. COUPON CODE */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Coupon Code *</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="e.g. SAVE2024"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().replace(/\s+/g, ''));
                  if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
                }}
                className={`flex-1 px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-extrabold tracking-wider uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 transition-all ${
                  errors.code ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              <button
                type="button"
                onClick={handleGenerateCode}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
              >
                ⚡ Generate
              </button>
            </div>
            {errors.code && <p className="text-[11px] font-semibold text-rose-600">{errors.code}</p>}
          </div>

          {/* B. COUPON NAME */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Coupon Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Sale 2025"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 transition-all ${
                errors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="text-[11px] font-semibold text-rose-600">{errors.name}</p>}
          </div>

          {/* C. DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              rows={2}
              placeholder="Enter coupon description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 transition-all"
            />
          </div>

          {/* D & E. DISCOUNT TYPE + DISCOUNT VALUE (Side-by-side on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Discount Value * {discountType === 'percentage' ? '(1 to 100%)' : '(₹ Monetary)'}
              </label>
              <input
                type="number"
                required
                min={0}
                max={discountType === 'percentage' ? 100 : undefined}
                step={discountType === 'percentage' ? 1 : 10}
                placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 200'}
                value={discountValue}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setDiscountValue(val);
                  if (errors.discountValue) setErrors((prev) => ({ ...prev, discountValue: '' }));
                }}
                className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 transition-all ${
                  errors.discountValue ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {errors.discountValue && (
                <p className="text-[11px] font-semibold text-rose-600">{errors.discountValue}</p>
              )}
            </div>
          </div>

          {/* F & G. VALID FROM + VALID TO (Side-by-side on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Valid From *</label>
              <input
                type="date"
                required
                value={validFrom}
                onChange={(e) => {
                  setValidFrom(e.target.value);
                  if (errors.validFrom) setErrors((prev) => ({ ...prev, validFrom: '' }));
                }}
                className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 transition-all ${
                  errors.validFrom ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {errors.validFrom && (
                <p className="text-[11px] font-semibold text-rose-600">{errors.validFrom}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Valid To *</label>
              <input
                type="date"
                required
                value={validTo}
                onChange={(e) => {
                  setValidTo(e.target.value);
                  if (errors.validTo) setErrors((prev) => ({ ...prev, validTo: '' }));
                }}
                className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 transition-all ${
                  errors.validTo ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {errors.validTo && (
                <p className="text-[11px] font-semibold text-rose-600">{errors.validTo}</p>
              )}
            </div>
          </div>

          {/* H. USAGE LIMIT */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Usage Limit *</label>
            <input
              type="number"
              required
              min={1}
              value={usageLimit}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setUsageLimit(val);
                if (errors.usageLimit) setErrors((prev) => ({ ...prev, usageLimit: '' }));
              }}
              className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 transition-all ${
                errors.usageLimit ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            <p className="text-[11px] text-slate-500 font-medium leading-normal">
              Maximum number of times this coupon can be used. Coupon will automatically deactivate when limit is reached.
            </p>
            {errors.usageLimit && (
              <p className="text-[11px] font-semibold text-rose-600">{errors.usageLimit}</p>
            )}
          </div>

          {/* I. APPLICABLE PRODUCTS SECTION */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Applicable Products
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Leave empty for site-wide coupon. Pick a category below, then tick products. Selected products can be removed from the chips.
              </p>
            </div>

            {/* J. CATEGORY DROPDOWN */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Filter by Category</label>
              <select
                value={selectedCategorySlug}
                onChange={(e) => setSelectedCategorySlug(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
              >
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* K. PRODUCT SELECTION CHECKBOX LIST (Fixed height scrollable) */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-700 block">
                Select Products ({filteredProducts.length} available)
              </span>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-white space-y-1.5 shadow-inner">
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium text-center py-4">
                    No products found in this category.
                  </p>
                ) : (
                  filteredProducts.map((prod) => {
                    const isChecked = selectedProductIds.includes(prod.id || prod._id || '');
                    const prodId = prod.id || prod._id || '';

                    return (
                      <label
                        key={prodId}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-amber-50/80 border border-amber-200' : 'hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleProductToggle(prodId)}
                          className="w-4 h-4 text-[#F5A000] accent-[#F5A000] rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold text-slate-800 line-clamp-1 flex-1">
                          {prod.name}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {prod.category}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* L. SELECTED PRODUCT CHIPS */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700">
                  Selected Products ({selectedProductIds.length})
                </span>
                {selectedProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {selectedProductIds.length === 0 ? (
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-800 flex items-center gap-2">
                  <span>🌐</span>
                  <span>This is currently a <strong>Site-Wide Coupon</strong> (applies to all products).</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                  {selectedProductIds.map((id) => {
                    const matchedProd = products.find((p) => p.id === id || p._id === id);
                    const label = matchedProd ? matchedProd.name : id;

                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/90 text-amber-950 border border-amber-300/80 rounded-lg text-[11px] font-extrabold shadow-2xs"
                      >
                        <span className="max-w-[200px] truncate">{label}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChip(id)}
                          className="w-4 h-4 rounded-full bg-amber-200/80 hover:bg-rose-500 hover:text-white flex items-center justify-center text-[10px] font-black transition-colors cursor-pointer shrink-0"
                          title="Remove product"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* N. STATUS */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#F5A000] hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {couponToEdit ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponModal;
