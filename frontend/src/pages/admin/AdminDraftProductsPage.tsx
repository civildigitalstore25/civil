import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { ProductDetailsModal } from '../../components/admin/ProductDetailsModal';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../types/product';

export const AdminDraftProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, deleteProduct } = useProducts();

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal States

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [deleteConfirmDraft, setDeleteConfirmDraft] = useState<Product | null>(null);

  // Search Debounce (~300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Draft Products Only
  const draftProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'draft') return false;

      const q = debouncedSearch.toLowerCase().trim();
      const matches =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.version?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        p.software?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.longDescription?.toLowerCase().includes(q);

      return matches;
    });
  }, [products, debouncedSearch]);

  const totalDraftCount = products.filter((p) => p.status === 'draft').length;

  const totalPages = Math.ceil(draftProducts.length / itemsPerPage) || 1;
  const paginatedDrafts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return draftProducts.slice(start, start + itemsPerPage);
  }, [draftProducts, currentPage, itemsPerPage]);

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const handleDeleteDraftConfirm = () => {
    if (deleteConfirmDraft) {
      deleteProduct(deleteConfirmDraft.id);
      setDeleteConfirmDraft(null);
    }
  };

  return (
    <AdminLayout title="Draft Products">
      <div className="space-y-6">

        {/* Top Header Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Draft Products Catalog
                </h2>
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 font-extrabold text-xs rounded-full">
                  {totalDraftCount} total drafts
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Work-in-progress product drafts. Save drafts for later or publish them to the active store.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin/products/add')}
                className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Draft</span>
              </button>
            </div>
          </div>

          {/* Search & Clear Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search draft products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Draft Table Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-4">Product Image</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Brand / Company</th>
                  <th className="py-3 px-4">Pricing Summary</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedDrafts.length > 0 ? (
                  paginatedDrafts.map((draft) => {
                    const brandName = draft.brand || draft.software || 'CAD Software';
                    const companyName = draft.company || brandName;
                    const createdStr = draft.createdAt
                      ? new Date(draft.createdAt).toLocaleDateString()
                      : 'Recently';

                    return (
                      <tr key={draft.id} className="hover:bg-purple-50/30 transition-colors">
                        {/* Image */}
                        <td className="py-3.5 px-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            <img
                              src={
                                draft.imageUrl ||
                                (draft.images && draft.images.length > 0
                                  ? draft.images[0]
                                  : 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80')
                              }
                              alt={draft.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{draft.name}</div>
                          <span className="text-[10px] text-purple-600 font-extrabold uppercase">
                            Draft
                          </span>
                        </td>

                        {/* Version */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                          {draft.version ? `v${draft.version}` : '—'}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[10px] border border-slate-200">
                            {draft.category}
                          </span>
                        </td>

                        {/* Brand / Company */}
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          <div>{brandName}</div>
                          {companyName !== brandName && (
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {companyName}
                            </span>
                          )}
                        </td>

                        {/* Pricing Summary */}
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          ₹{(draft.ebookPriceINR || draft.price || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 text-slate-500 font-semibold">
                          {createdStr}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingProduct(draft);
                                setIsDetailsModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                              title="View Draft"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate(`/admin/products/${draft.id}/edit`)}
                              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1"
                              title="Edit & Publish Draft"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit / Publish</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmDraft(draft)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg cursor-pointer"
                              title="Delete Draft"
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
                      No draft products found.
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
                Showing {draftProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
                {Math.min(currentPage * itemsPerPage, draftProducts.length)} of {draftProducts.length} drafts
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

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
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
          isOpen={!!deleteConfirmDraft}
          title="Delete Draft Product"
          message={`Are you sure you want to permanently delete draft "${deleteConfirmDraft?.name}"? This action cannot be undone.`}
          confirmText="Yes, Delete Draft"
          onConfirm={handleDeleteDraftConfirm}
          onCancel={() => setDeleteConfirmDraft(null)}
        />

      </div>
    </AdminLayout>
  );
};

export default AdminDraftProductsPage;
