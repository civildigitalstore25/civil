import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageToolbar, { adminButtonClass } from '../../components/admin/AdminPageToolbar';
import { brandApi, type BrandRecord } from '../../services/brandApi';
import { downloadExcel, downloadJson, exportDateStamp } from '../../utils/adminExport';
import { slugify } from '../../utils/slugify';

export const AdminBrandsPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [brandName, setBrandName] = useState('');
  const [brandSlug, setBrandSlug] = useState('');
  const [brandSlugTouched, setBrandSlugTouched] = useState(false);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [categorySlugs, setCategorySlugs] = useState<Record<string, string>>({});
  const [categorySlugTouched, setCategorySlugTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const load = async () => {
    try {
      setBrands(await brandApi.list());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load brands');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addBrand = async () => {
    if (!brandName.trim()) return;
    try {
      await brandApi.create(brandName.trim(), slugify(brandSlug || brandName));
      setBrandName('');
      setBrandSlug('');
      setBrandSlugTouched(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add brand');
    }
  };

  const addCategory = async (brandId: string) => {
    const name = categoryNames[brandId]?.trim();
    if (!name) return;
    try {
      await brandApi.addCategory(brandId, name, slugify(categorySlugs[brandId] || name));
      setCategoryNames((current) => ({ ...current, [brandId]: '' }));
      setCategorySlugs((current) => ({ ...current, [brandId]: '' }));
      setCategorySlugTouched((current) => ({ ...current, [brandId]: false }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add category');
    }
  };

  const visibleBrands = useMemo(() => {
    const query = search.trim().toLowerCase();
    return brands.filter((brand) => {
      const matchesQuery =
        !query ||
        brand.name.toLowerCase().includes(query) ||
        brand.slug.toLowerCase().includes(query) ||
        brand.categories.some(
          (category) =>
            category.name.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query),
        );
      const matchesFilter =
        categoryFilter === 'All' ||
        (categoryFilter === 'With categories' && brand.categories.length > 0) ||
        (categoryFilter === 'Without categories' && brand.categories.length === 0);
      return matchesQuery && matchesFilter;
    });
  }, [brands, search, categoryFilter]);

  const brandExportRows = visibleBrands.flatMap((brand) =>
    brand.categories.length
      ? brand.categories.map((category) => ({
          Brand: brand.name,
          BrandSlug: brand.slug,
          Category: category.name,
          CategorySlug: category.slug,
        }))
      : [{ Brand: brand.name, BrandSlug: brand.slug, Category: '', CategorySlug: '' }],
  );

  const content = (
    <div className="space-y-5">
      <AdminPageToolbar
        title="Brands and categories"
        description="Each brand holds its categories. Search by name or slug, then export the current list."
        count={visibleBrands.length}
        countLabel="brands"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search brand or category"
        filters={[
          {
            id: 'categories',
            ariaLabel: 'Filter brands by categories',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: 'All', label: 'All brands' },
              { value: 'With categories', label: 'With categories' },
              { value: 'Without categories', label: 'Without categories' },
            ],
          },
        ]}
        onClear={() => {
          setSearch('');
          setCategoryFilter('All');
        }}
        onExportExcel={() => downloadExcel(brandExportRows, 'Brands', `brands_${exportDateStamp()}`)}
        onExportJson={() => downloadJson(brandExportRows, `brands_${exportDateStamp()}`)}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900">Add a brand</h2>
        <p className="mt-1 text-sm text-slate-500">A brand holds its categories. Example: Autodesk, then AutoCAD inside it.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700">Brand name</span>
            <input
              value={brandName}
              onChange={(event) => {
                const value = event.target.value;
                setBrandName(value);
                if (!brandSlugTouched) setBrandSlug(slugify(value));
              }}
              placeholder="Autodesk"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700">Slug</span>
            <input
              value={brandSlug}
              onChange={(event) => {
                setBrandSlugTouched(true);
                setBrandSlug(slugify(event.target.value));
              }}
              placeholder="autodesk"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono"
            />
          </label>
          <button
            type="button"
            onClick={() => void addBrand()}
            className={`${adminButtonClass.primary} self-end`}
          >
            Add brand
          </button>
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
      </div>

      {visibleBrands.map((brand) => (
        <section key={brand._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{brand.name}</h3>
              <p className="text-xs font-mono text-slate-400">/{brand.slug}</p>
            </div>
            <button type="button" onClick={() => void brandApi.remove(brand._id).then(load)} className="text-xs font-bold text-rose-600">
              Remove brand
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {brand.categories.map((category) => (
              <div key={category.slug} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">{category.name}</p>
                  <p className="text-xs font-mono text-slate-400">/{category.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void brandApi.removeCategory(brand._id, category.slug).then(load)}
                  className="text-xs font-bold text-rose-600"
                >
                  Remove
                </button>
              </div>
            ))}
            {brand.categories.length === 0 && <p className="text-sm text-slate-400">No categories yet.</p>}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-700">Category name</span>
              <input
                value={categoryNames[brand._id] || ''}
                onChange={(event) => {
                  const value = event.target.value;
                  setCategoryNames((current) => ({ ...current, [brand._id]: value }));
                  if (!categorySlugTouched[brand._id]) {
                    setCategorySlugs((current) => ({ ...current, [brand._id]: slugify(value) }));
                  }
                }}
                placeholder="AutoCAD"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-700">Slug</span>
              <input
                value={categorySlugs[brand._id] || ''}
                onChange={(event) => {
                  setCategorySlugTouched((current) => ({ ...current, [brand._id]: true }));
                  setCategorySlugs((current) => ({ ...current, [brand._id]: slugify(event.target.value) }));
                }}
                placeholder="autocad"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
              />
            </label>
            <button
              type="button"
              onClick={() => void addCategory(brand._id)}
              className={`${adminButtonClass.secondary} self-end`}
            >
              Add category
            </button>
          </div>
        </section>
      ))}
    </div>
  );

  if (embedded) return content;

  return <AdminLayout title="Brands & Categories">{content}</AdminLayout>;
};

export default AdminBrandsPage;
