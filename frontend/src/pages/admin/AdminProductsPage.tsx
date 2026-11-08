import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Star,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle2,
  EyeOff,
  FileEdit,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageToolbar, { adminButtonClass } from '../../components/admin/AdminPageToolbar';
import { downloadExcel, downloadJson, exportDateStamp } from '../../utils/adminExport';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { ProductDetailsModal } from '../../components/admin/ProductDetailsModal';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../types/product';

export const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    deleteProduct,
    bulkDeleteProducts,
    toggleBestSeller,
    toggleOutOfStock,
  } = useProducts();

  // Raw Filter Inputs
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedBrand, setSelectedBrand] = useState<string>('All Brands');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [isBestSellerOnly, setIsBestSellerOnly] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selection & Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [singleDeleteProduct, setSingleDeleteProduct] = useState<Product | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Product status metrics for KPI cards
  const productStats = useMemo(() => {
    const totalCount = products.length;
    const activeCount = products.filter(
      (p) => p.status === 'active' || (!p.status && p.status !== 'inactive' && p.status !== 'draft')
    ).length;
    const inactiveCount = products.filter((p) => p.status === 'inactive').length;
    const draftCount = products.filter((p) => p.status === 'draft').length;

    return {
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
      draft: draftCount,
    };
  }, [products]);

  // Search Debounce Handler (~400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Unique Categories list from API/Products
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ['All Categories', ...Array.from(set)];
  }, [products]);

  // Unique Brands/Companies list from API/Products
  const brandsList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
      else if (p.software) set.add(p.software);
    });
    return ['All Brands', ...Array.from(set)];
  }, [products]);

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const isDraft = p.status === 'draft';

      // Status filtering
      let matchesStatus = true;
      if (selectedStatus === 'Active') {
        matchesStatus = p.status === 'active' || (!p.status && p.status !== 'inactive' && !isDraft);
      } else if (selectedStatus === 'Inactive') {
        matchesStatus = p.status === 'inactive';
      } else if (selectedStatus === 'Draft') {
        matchesStatus = isDraft;
      } else if (selectedStatus === 'All Status') {
        matchesStatus = true;
      }

      // Search matching (Name, Version, Company, Brand, Category, Short Description, Long Description, Tags)
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.version?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        p.software?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.longDescription?.toLowerCase().includes(q) ||
        p.seoKeywords?.some((k) => k.toLowerCase().includes(q));

      // Category filter
      const matchesCategory =
        selectedCategory === 'All Categories' || p.category === selectedCategory;

      // Brand/Company filter
      const matchesBrand =
        selectedBrand === 'All Brands' ||
        p.brand === selectedBrand ||
        p.software === selectedBrand ||
        p.company === selectedBrand;

      // Best Seller Checkbox
      const matchesBestSeller = !isBestSellerOnly || Boolean(p.isBestSeller);

      return matchesStatus && matchesSearch && matchesCategory && matchesBrand && matchesBestSeller;
    });
  }, [products, debouncedSearch, selectedCategory, selectedBrand, selectedStatus, isBestSellerOnly]);

  // Reset page when filter or items-per-page changes
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedCategory('All Categories');
    setSelectedBrand('All Brands');
    setSelectedStatus('All Status');
    setIsBestSellerOnly(false);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = filteredProducts.length > 0 ? (validCurrentPage - 1) * itemsPerPage : 0;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, startIndex, itemsPerPage]);
  const displayEndIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);

  // Multi-Select Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allPaginatedIds = paginatedProducts.map((p) => p.id);
      const combined = Array.from(new Set([...selectedProductIds, ...allPaginatedIds]));
      setSelectedProductIds(combined);
    } else {
      const paginatedSet = new Set(paginatedProducts.map((p) => p.id));
      setSelectedProductIds(selectedProductIds.filter((id) => !paginatedSet.has(id)));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((item) => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const isAllPaginatedSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedProductIds.includes(p.id));

  // Delete Actions
  const handleSingleDeleteConfirm = () => {
    if (singleDeleteProduct) {
      deleteProduct(singleDeleteProduct.id);
      setSelectedProductIds((prev) => prev.filter((id) => id !== singleDeleteProduct.id));
      setSingleDeleteProduct(null);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedProductIds.length > 0) {
      bulkDeleteProducts(selectedProductIds);
      setSelectedProductIds([]);
      setIsBulkDeleteModalOpen(false);
    }
  };

  // Export to Excel
  const handleExportExcel = (mode: 'filtered' | 'all' = 'filtered') => {
    const listToExport =
      selectedProductIds.length > 0
        ? products.filter((p) => selectedProductIds.includes(p.id))
        : mode === 'all'
        ? products
        : filteredProducts;

    const exportData = listToExport.map((p) => ({
      ID: p.id,
      Name: p.name,
      Version: p.version || '',
      Slug: p.slug || '',
      Brand: p.brand || p.software || '',
      Company: p.company || '',
      Category: p.category,
      Status: p.status || 'active',
      PriceINR: p.ebookPriceINR || p.price || 0,
      LifetimePriceINR: p.lifetimePriceINR || p.lifetimePrice || '',
      MembershipPriceINR: p.membershipPriceINR || p.membershipPrice || '',
      BestSeller: p.isBestSeller ? 'Yes' : 'No',
      OutOfStock: p.isOutOfStock ? 'Yes' : 'No',
      HasDownloadLink: Boolean(p.driveLink) ? 'Yes' : 'No',
      CreatedAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
    }));

    const fileSuffix =
      selectedProductIds.length > 0
        ? 'selected'
        : mode === 'all'
        ? 'all'
        : selectedStatus.toLowerCase().replace(/\s+/g, '_');

    downloadExcel(exportData, 'Products', `products_${fileSuffix}_${exportDateStamp()}`);
  };

  const handleExportJSON = () => {
    const exportData =
      selectedProductIds.length > 0
        ? products.filter((p) => selectedProductIds.includes(p.id))
        : filteredProducts;

    downloadJson(exportData, `products_${exportDateStamp()}`);
  };

  return (
    <AdminLayout title="Product Management">
      <div className="space-y-6">
        {/* Product Menu & Quick Nav Navigation Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5 shrink-0">
              <Layers className="w-4 h-4 text-[#F5A000]" />
              <span>Catalogue Menu:</span>
            </span>

            {/* Quick Status Filters */}
            <button
              type="button"
              onClick={() => handleFilterChange(setSelectedStatus, 'All Status')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedStatus === 'All Status'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Products ({productStats.total})
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange(setSelectedStatus, 'Active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedStatus === 'Active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Active ({productStats.active})
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange(setSelectedStatus, 'Inactive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedStatus === 'Inactive'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Inactive ({productStats.inactive})
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange(setSelectedStatus, 'Draft')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedStatus === 'Draft'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              Drafts ({productStats.draft})
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleExportExcel('all')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Export complete product catalogue to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export All ({productStats.total})</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/products/drafts')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-xs font-bold text-purple-800 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Draft Manager</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/products/add')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F5A000] hover:bg-amber-600 text-xs font-extrabold text-white shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* KPI / Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Products Card */}
          <button
            type="button"
            onClick={() => handleFilterChange(setSelectedStatus, 'All Status')}
            className={`text-left bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              selectedStatus === 'All Status'
                ? 'border-[#F5A000] ring-2 ring-[#F5A000]/30 shadow-md'
                : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Products
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {productStats.total}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Complete store catalogue
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-2.5">
              <span>All catalog items</span>
              <span
                className={`font-bold ${
                  selectedStatus === 'All Status' ? 'text-[#F5A000]' : 'text-slate-500'
                }`}
              >
                {selectedStatus === 'All Status' ? 'Active Filter' : 'Click to filter'}
              </span>
            </div>
          </button>

          {/* Active Products Card */}
          <button
            type="button"
            onClick={() => handleFilterChange(setSelectedStatus, 'Active')}
            className={`text-left bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              selectedStatus === 'Active'
                ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                : 'border-slate-200/80 hover:border-emerald-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Active Products
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {productStats.active}
                </h3>
                <p className="text-xs font-semibold text-emerald-600 mt-1">
                  Published & live on store
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-2.5">
              <span>Ready for checkout</span>
              <span
                className={`font-bold ${
                  selectedStatus === 'Active' ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {selectedStatus === 'Active' ? 'Active Filter' : 'Filter active'}
              </span>
            </div>
          </button>

          {/* Inactive Products Card */}
          <button
            type="button"
            onClick={() => handleFilterChange(setSelectedStatus, 'Inactive')}
            className={`text-left bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              selectedStatus === 'Inactive'
                ? 'border-slate-600 ring-2 ring-slate-600/30 shadow-md'
                : 'border-slate-200/80 hover:border-slate-400 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Inactive Products
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {productStats.inactive}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Hidden / Temporarily offline
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <EyeOff className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-2.5">
              <span>Hidden from buyers</span>
              <span
                className={`font-bold ${
                  selectedStatus === 'Inactive' ? 'text-slate-700' : 'text-slate-500'
                }`}
              >
                {selectedStatus === 'Inactive' ? 'Active Filter' : 'Filter inactive'}
              </span>
            </div>
          </button>

          {/* Draft Products Card */}
          <button
            type="button"
            onClick={() => handleFilterChange(setSelectedStatus, 'Draft')}
            className={`text-left bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              selectedStatus === 'Draft'
                ? 'border-purple-500 ring-2 ring-purple-500/30 shadow-md'
                : 'border-slate-200/80 hover:border-purple-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                  Draft Products
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {productStats.draft}
                </h3>
                <p className="text-xs font-semibold text-purple-600 mt-1">
                  Unpublished drafts
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileEdit className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-2.5">
              <span>Pending publication</span>
              <span
                className={`font-bold ${
                  selectedStatus === 'Draft' ? 'text-purple-600' : 'text-slate-500'
                }`}
              >
                {selectedStatus === 'Draft' ? 'Active Filter' : 'Filter drafts'}
              </span>
            </div>
          </button>
        </div>

        {/* Search, Filter Toolbar & Export Options */}
        <AdminPageToolbar
          title="Products"
          description="Search, filter, and export catalogue items with real-time stock and status toggles."
          count={filteredProducts.length}
          countLabel="items"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search product name, brand, version, or category"
          filters={[
            {
              id: 'category',
              ariaLabel: 'Filter by category',
              value: selectedCategory,
              onChange: (value) => handleFilterChange(setSelectedCategory, value),
              options: categoriesList.map((item) => ({ value: item, label: item })),
            },
            {
              id: 'brand',
              ariaLabel: 'Filter by brand',
              value: selectedBrand,
              onChange: (value) => handleFilterChange(setSelectedBrand, value),
              options: brandsList.map((item) => ({ value: item, label: item })),
            },
            {
              id: 'status',
              ariaLabel: 'Filter by status',
              value: selectedStatus,
              onChange: (value) => handleFilterChange(setSelectedStatus, value),
              options: [
                { value: 'All Status', label: 'All status' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Draft', label: 'Draft' },
              ],
            },
          ]}
          extra={
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSellerOnly}
                onChange={(event) => handleFilterChange(setIsBestSellerOnly, event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#F5A000] focus:ring-[#F5A000]"
              />
              Best sellers only
            </label>
          }
          onClear={handleClearFilters}
          onExportExcel={() => handleExportExcel('filtered')}
          onExportJson={handleExportJSON}
          actions={
            <button
              type="button"
              onClick={() => navigate('/admin/products/add')}
              className={adminButtonClass.primary}
            >
              <Plus className="h-4 w-4" />
              Add product
            </button>
          }
        />

        {/* Selected Products Banner */}
        {selectedProductIds.length > 0 && (
          <div className="bg-[#F5A000] text-slate-950 px-5 py-3 rounded-2xl shadow-md flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 font-black text-xs">
              <CheckCircle className="w-4 h-4 text-slate-950" />
              <span>{selectedProductIds.length} product(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportExcel('filtered')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Selected</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bulk Delete</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedProductIds([])}
                className="px-3 py-1.5 bg-slate-800/20 hover:bg-slate-800/30 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* Products Table Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllPaginatedSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#F5A000] border-slate-300 rounded focus:ring-[#F5A000] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4 text-center">Best Seller</th>
                  <th className="py-3 px-4 text-center">Out of Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    const brandName = product.brand || product.software || 'CAD Software';
                    const companyName = product.company || brandName;
                    const isDraft = product.status === 'draft';
                    const isInactive = product.status === 'inactive';

                    return (
                      <tr
                        key={product.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-amber-50/50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* 1. Selection Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(product.id)}
                            className="w-4 h-4 text-[#F5A000] border-slate-300 rounded focus:ring-[#F5A000] cursor-pointer"
                          />
                        </td>

                        {/* 2. Product Column (Image, Name, Version, Best Seller Badge, Rating & Count) */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                              <img
                                src={
                                  product.imageUrl ||
                                  (product.images && product.images.length > 0
                                    ? product.images[0]
                                    : 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80')
                                }
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-slate-900 truncate">
                                  {product.name}
                                </span>
                                {product.version && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                                    v{product.version}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                {product.isBestSeller && (
                                  <span className="px-1.5 py-0.5 bg-amber-100 text-[#D97706] font-extrabold text-[9px] rounded-md flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    <span>Best Seller</span>
                                  </span>
                                )}

                                <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                                  <span>★ {product.rating || 4.8}</span>
                                  <span className="text-slate-400 font-normal">
                                    ({product.reviewCount || 1})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Status Badge Column */}
                        <td className="py-3.5 px-4">
                          {isDraft ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 font-extrabold text-[10px] rounded-lg border border-purple-200">
                              <FileEdit className="w-3 h-3" />
                              <span>Draft</span>
                            </span>
                          ) : isInactive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 font-extrabold text-[10px] rounded-lg border border-slate-200">
                              <EyeOff className="w-3 h-3" />
                              <span>Inactive</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          )}
                        </td>

                        {/* 4. Brand Column */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          <div className="font-bold text-slate-900">{brandName}</div>
                          {companyName !== brandName && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              Company: {companyName}
                            </div>
                          )}
                        </td>

                        {/* 5. Category Column */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded-lg border border-slate-200/60 inline-block mb-1">
                            {product.category}
                          </span>

                          {product.seoKeywords && product.seoKeywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {product.seoKeywords.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md truncate max-w-[80px]"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* 6. Pricing Column */}
                        <td className="py-3.5 px-4 font-semibold">
                          {product.subscriptionDurations && product.subscriptionDurations.length > 0 ? (
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-900 text-xs block">
                                ₹{product.subscriptionDurations[0].priceINR || product.subscriptionDurations[0].price} / {product.subscriptionDurations[0].duration}
                              </span>
                              {product.subscriptionDurations.length > 1 && (
                                <span className="text-[10px] text-amber-600 font-bold block">
                                  +{product.subscriptionDurations.length - 1} plan option(s)
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-900 text-xs block">
                                ₹{(product.ebookPriceINR || product.price).toLocaleString('en-IN')}
                              </span>
                              {product.oldPrice > product.price && (
                                <span className="text-[10px] font-normal text-slate-400 line-through block">
                                  ₹{product.oldPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          )}

                          {product.hasLifetime && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md inline-block mt-0.5 border border-emerald-200">
                              Lifetime: ₹{product.lifetimePriceINR || product.lifetimePrice || '4,999'}
                            </span>
                          )}
                        </td>

                        {/* 7. Best Seller Inline Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(product.isBestSeller)}
                              onChange={() => toggleBestSeller(product.id)}
                              className="w-4 h-4 text-[#F5A000] border-slate-300 rounded focus:ring-[#F5A000]"
                              aria-label={`Toggle Best Seller for ${product.name}`}
                            />
                            <span
                              className={`text-xs font-bold ${
                                product.isBestSeller ? 'text-amber-700' : 'text-slate-400'
                              }`}
                            >
                              {product.isBestSeller ? 'Yes' : 'No'}
                            </span>
                          </label>
                        </td>

                        {/* 8. Out of Stock Inline Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(product.isOutOfStock)}
                              onChange={() => toggleOutOfStock(product.id)}
                              className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                              aria-label={`Toggle Out of Stock for ${product.name}`}
                            />
                            <span
                              className={`text-xs font-bold ${
                                product.isOutOfStock ? 'text-rose-700' : 'text-slate-400'
                              }`}
                            >
                              {product.isOutOfStock ? 'Yes' : 'No'}
                            </span>
                          </label>
                        </td>

                        {/* 9. Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => {
                                setViewingProduct(product);
                                setIsDetailsModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                              title="View Product Details"
                              aria-label={`View ${product.name}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isDraft
                                  ? 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                                  : 'bg-amber-50 hover:bg-amber-100 text-[#F5A000]'
                              }`}
                              title={isDraft ? 'Edit & Publish Draft' : 'Edit Product'}
                              aria-label={`Edit ${product.name}`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setSingleDeleteProduct(product)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                      {products.length === 0 ? (
                        'No products available. Click "Add Product" above to add products to your store.'
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Package className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                          <p className="text-sm font-bold text-slate-600">No products found</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            No products match your current search or status filter.
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} to{' '}
                {displayEndIndex} of {filteredProducts.length} items
              </span>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="text-slate-400">Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - validCurrentPage) <= 1;
                  })
                  .map((pageNum, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && pageNum - prev > 1;

                    return (
                      <React.Fragment key={pageNum}>
                        {showEllipsis && <span className="px-1 text-slate-400 font-bold">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            validCurrentPage === pageNum
                              ? 'bg-[#F5A000] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ProductDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setViewingProduct(null);
          }}
          product={viewingProduct}
          onEdit={(prod) => navigate(`/admin/products/${prod.id}/edit`)}
        />

        <ConfirmModal
          isOpen={!!singleDeleteProduct}
          title="Delete Product"
          message={`Are you sure you want to delete "${singleDeleteProduct?.name}"? This action will remove it permanently.`}
          confirmText="Yes, Delete Product"
          onConfirm={handleSingleDeleteConfirm}
          onCancel={() => setSingleDeleteProduct(null)}
        />

        <ConfirmModal
          isOpen={isBulkDeleteModalOpen}
          title="Bulk Delete Products"
          message={`Are you sure you want to delete ${selectedProductIds.length} selected products? This action cannot be undone.`}
          confirmText="Yes, Delete Selected"
          onConfirm={handleBulkDeleteConfirm}
          onCancel={() => setIsBulkDeleteModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
