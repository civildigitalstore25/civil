import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useCategories } from '../../context/CategoryContext';
import { useProducts } from '../../context/ProductContext';
import type { CategoryDefinition } from '../../data/categories';
import { slugify } from '../../utils/slugify';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { products } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDefinition | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [filterType, setFilterType] = useState<'software' | 'category'>('software');
  const [filterValue, setFilterValue] = useState('');
  const [description, setDescription] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryDefinition | null>(null);

  // Helper to get product count for each category dynamically
  const getProductCount = (category: CategoryDefinition) => {
    return products.filter(
      (p) =>
        p.categorySlug.toLowerCase() === category.slug.toLowerCase() ||
        p.category.toLowerCase() === category.name.toLowerCase() ||
        p.software.toLowerCase() === category.name.toLowerCase()
    ).length;
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setFilterType('software');
    setFilterValue('');
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryDefinition) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setFilterType(cat.filterType);
    setFilterValue(cat.filterValue);
    setDescription(cat.description);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Category Name is required.');
      return;
    }

    const generatedSlug = slug ? slugify(slug) : slugify(name);

    if (editingCategory) {
      const result = updateCategory(editingCategory.slug, {
        name: name.trim(),
        slug: generatedSlug,
        filterType,
        filterValue: (filterValue.trim() || name.trim()) as any,
        description: description.trim(),
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to update category.');
        return;
      }
    } else {
      const result = addCategory({
        name: name.trim(),
        slug: generatedSlug,
        filterType,
        filterValue: (filterValue.trim() || name.trim()) as any,
        description: description.trim(),
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to add category.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const handleDeleteAttempt = (cat: CategoryDefinition) => {
    const count = getProductCount(cat);
    if (count > 0) {
      setDeleteWarning(
        `Cannot delete category "${cat.name}" because ${count} product(s) are currently assigned to it. Please reassign or delete those products first.`
      );
      return;
    }
    setDeleteWarning(null);
    setCategoryToDelete(cat);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.slug);
      setCategoryToDelete(null);
    }
  };

  return (
    <AdminLayout title="Category Management">
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Categories ({categories.length})</h2>
          <p className="text-xs text-slate-500">Manage software compatibility & product category filters.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#F5A000] hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span className="text-base leading-none">+</span>
          <span>Add Category</span>
        </button>
      </div>

      {/* Warning Notice Banner */}
      {deleteWarning && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{deleteWarning}</span>
          </div>
          <button
            onClick={() => setDeleteWarning(null)}
            className="text-amber-700 hover:text-amber-950 font-extrabold text-sm px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Categories Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const productCount = getProductCount(category);

          return (
            <div
              key={category.slug}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                    {category.filterType} filter
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {productCount} {productCount === 1 ? 'Product' : 'Products'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{category.name}</h3>
                <p className="text-xs font-mono text-[#F5A000]">/{category.slug}/</p>
                <p className="text-xs text-slate-500 font-normal line-clamp-2">{category.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(category)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAttempt(category)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AutoCAD"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) setSlug(slugify(e.target.value));
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. autocad-software"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Filter Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                  >
                    <option value="software">Software</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Filter Target Value</label>
                  <input
                    type="text"
                    placeholder="AutoCAD"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Category description summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#F5A000] hover:bg-amber-600 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"?`}
        confirmText="Yes, Delete Category"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCategoryToDelete(null)}
      />
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
