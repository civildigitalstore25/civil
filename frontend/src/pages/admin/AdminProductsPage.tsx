import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../types/product';

export const AdminProductsPage: React.FC = () => {
  const { products, deleteProduct } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [highlightFilter, setHighlightFilter] = useState<'all' | 'bestsellers' | 'newarrivals'>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.software.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesHighlight = true;
      if (highlightFilter === 'bestsellers') {
        matchesHighlight = p.isBestSeller === true || p.badge === 'Bestseller';
      } else if (highlightFilter === 'newarrivals') {
        matchesHighlight = p.isNewArrival === true || p.badge === 'New';
      }

      return matchesSearch && matchesCat && matchesHighlight;
    });
  }, [products, searchQuery, selectedCategory, highlightFilter]);

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <AdminLayout title="Product Management">
      {/* Top Header & Search Bar Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Products ({filteredProducts.length})</h2>
            <p className="text-xs text-slate-500">Manage software bundles, CAD drawings, eBooks & templates</p>
          </div>

          <Link
            to="/admin/products/add"
            className="bg-[#F5A000] hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="text-base leading-none">+</span>
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Highlight Filter Tabs & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setHighlightFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                highlightFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Products ({products.length})
            </button>

            <button
              type="button"
              onClick={() => setHighlightFilter('bestsellers')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                highlightFilter === 'bestsellers'
                  ? 'bg-[#F5A000] text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span>★</span>
              <span>Best Sellers ({products.filter((p) => p.isBestSeller || p.badge === 'Bestseller').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setHighlightFilter('newarrivals')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                highlightFilter === 'newarrivals'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <span>✨</span>
              <span>New Arrivals ({products.filter((p) => p.isNewArrival || p.badge === 'New').length})</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 transition-all"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Dropdown */}
            <div className="w-full sm:w-44">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30 cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    Cat: {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-center">Best Seller</th>
                <th className="py-3 px-4 text-center">New Arrival</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thumbnail Image */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={product.images[0] || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="py-3 px-4 max-w-xs">
                      <Link
                        to={`/${product.slug}/`}
                        target="_blank"
                        className="font-bold text-slate-900 hover:text-[#F5A000] transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <span>/{product.slug}/</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      <div>{product.category}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{product.software}</span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      ₹{product.price.toLocaleString('en-IN')}
                      {product.oldPrice > product.price && (
                        <div className="text-[10px] font-normal text-slate-400 line-through">
                          ₹{product.oldPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Best Seller Column Indicator */}
                    <td className="py-3 px-4 text-center">
                      {product.isBestSeller ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-[#D97706] font-extrabold text-[10px] rounded-md border border-amber-200">
                          ✓ Best Seller
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">—</span>
                      )}
                    </td>

                    {/* New Arrival Column Indicator */}
                    <td className="py-3 px-4 text-center">
                      {product.isNewArrival ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-md border border-blue-200">
                          ✓ New Arrival
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => setProductToDelete(product)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action will remove it from the digital store and all category pages.`}
        confirmText="Yes, Delete Product"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </AdminLayout>
  );
};

export default AdminProductsPage;
