import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Plus,
  Search,
  FileSpreadsheet,
  FileCode,
  Trash2,
  Edit,
  Eye,
  Star,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { ProductDetailsModal } from '../../components/admin/ProductDetailsModal';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../types/product';

export const AdminProductsPage: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    toggleBestSeller,
    toggleOutOfStock
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

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [singleDeleteProduct, setSingleDeleteProduct] = useState<Product | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Search Debounce Handler (~500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 500);
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

  // Filtered Non-Draft Products Calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // DRAFT PRODUCTS MUST NOT APPEAR ON NORMAL PRODUCTS LIST PAGE
      if (p.status === 'draft') return false;

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

      // Status filter (Active / Inactive)
      let matchesStatus = true;
      if (selectedStatus === 'Active') matchesStatus = p.status === 'active' || !p.status;
      else if (selectedStatus === 'Inactive') matchesStatus = p.status === 'inactive';

      // Best Seller Checkbox
      const matchesBestSeller = !isBestSellerOnly || Boolean(p.isBestSeller);

      return matchesSearch && matchesCategory && matchesBrand && matchesStatus && matchesBestSeller;
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
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

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
  const handleExportExcel = () => {
    const exportData = (
      selectedProductIds.length > 0
        ? products.filter((p) => selectedProductIds.includes(p.id))
        : filteredProducts
    ).map((p) => ({
      ID: p.id,
      Name: p.name,
      Version: p.version || '',
      Brand: p.brand || p.software || '',
      Company: p.company || '',
      Category: p.category,
      PriceINR: p.ebookPriceINR || p.price,
      LifetimePriceINR: p.lifetimePriceINR || p.lifetimePrice || '',
      MembershipPriceINR: p.membershipPriceINR || p.membershipPrice || '',
      Status: p.status || 'active',
      BestSeller: p.isBestSeller ? 'Yes' : 'No',
      OutOfStock: p.isOutOfStock ? 'Yes' : 'No',
      CreatedAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, `products_catalog_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const exportData =
      selectedProductIds.length > 0
        ? products.filter((p) => selectedProductIds.includes(p.id))
        : filteredProducts;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `products_catalog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Form Submit Handler
  const handleFormSubmit = (
    data: Partial<Product> & { name: string; price: number },
    isDraft = false
  ) => {
    if (editingProduct) {
      return updateProduct(editingProduct.id, data, isDraft);
    } else {
      return addProduct(data, isDraft);
    }
  };

  return (
    <AdminLayout title="Product Management">
      <div className="space-y-6">

        {/* Header Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Products Management
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-100 text-[#F5A000] font-extrabold text-xs rounded-full">
                  {filteredProducts.length} items
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage civil engineering CAD files, software bundles, subscription plans & digital downloads
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportExcel}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Export products list to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Export products list to JSON (.json)"
              >
                <FileCode className="w-4 h-4 text-slate-600" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormModalOpen(true);
                }}
                className="bg-[#F5A000] hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Filter Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 items-center">
            {/* Search Input */}
            <div className="relative lg:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand / Company Filter */}
            <div>
              <select
                value={selectedBrand}
                onChange={(e) => handleFilterChange(setSelectedBrand, e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
              >
                {brandsList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Checkbox Best Sellers & Clear Filters */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isBestSellerOnly}
                  onChange={(e) => handleFilterChange(setIsBestSellerOnly, e.target.checked)}
                  className="w-4 h-4 text-[#F5A000] border-slate-300 rounded focus:ring-[#F5A000]"
                />
                <span>Best Sellers</span>
              </label>

              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Products Banner */}
        {selectedProductIds.length > 0 && (
          <div className="bg-amber-500 text-white px-5 py-3 rounded-2xl shadow-md flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 font-extrabold text-xs">
              <CheckCircle className="w-4 h-4" />
              <span>{selectedProductIds.length} product(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bulk Delete Selected</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedProductIds([])}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
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

                            <div className="overflow-hidden">
                              <div className="font-bold text-slate-900 line-clamp-1 flex items-center gap-1.5">
                                <span>{product.name}</span>
                                {product.version && (
                                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] rounded-md font-semibold">
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

                        {/* 3. Brand Column (Brand, Company when different) */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          <div className="font-bold text-slate-900">{brandName}</div>
                          {companyName !== brandName && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              Company: {companyName}
                            </div>
                          )}
                        </td>

                        {/* 4. Category Column (Category badge, Product tags) */}
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

                        {/* 5. Pricing Column */}
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

                        {/* 6. Best Seller Inline Checkbox (Show Yes/No) */}
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

                        {/* 7. Out of Stock Inline Checkbox (Show Yes/No) */}
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

                        {/* 8. Actions (View, Edit, Delete) with tooltips / accessible labels */}
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
                              onClick={() => {
                                setEditingProduct(product);
                                setIsFormModalOpen(true);
                              }}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-[#F5A000] rounded-lg transition-colors cursor-pointer"
                              title="Edit Product"
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
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No published products match your current search or filter criteria.
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
                Showing {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
              </span>

              <div className="flex items-center gap-1">
                <span className="text-slate-400">Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ProductFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onSubmit={handleFormSubmit}
        />

        <ProductDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setViewingProduct(null);
          }}
          product={viewingProduct}
          onEdit={(prod) => {
            setEditingProduct(prod);
            setIsFormModalOpen(true);
          }}
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
