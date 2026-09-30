import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { brandApi, type BrandRecord } from '../../services/brandApi';

export const AdminBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [brandName, setBrandName] = useState('');
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

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
      await brandApi.create(brandName.trim());
      setBrandName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add brand');
    }
  };

  const addCategory = async (brandId: string) => {
    const name = categoryNames[brandId]?.trim();
    if (!name) return;
    try {
      await brandApi.addCategory(brandId, name);
      setCategoryNames((current) => ({ ...current, [brandId]: '' }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add category');
    }
  };

  return (
    <AdminLayout title="Brands">
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Add a brand</h2>
          <p className="mt-1 text-sm text-slate-500">A brand is the company. Categories sit inside that brand, like Autodesk → AutoCAD.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
              placeholder="Brand name, for example Autodesk"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
            />
            <button type="button" onClick={() => void addBrand()} className="rounded-xl bg-[#F5A000] px-4 py-2.5 text-sm font-extrabold text-white">
              Add brand
            </button>
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
        </div>

        {brands.map((brand) => (
          <section key={brand._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-extrabold text-slate-900">{brand.name}</h3>
              <button type="button" onClick={() => void brandApi.remove(brand._id).then(load)} className="text-xs font-bold text-rose-600">
                Remove brand
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {brand.categories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => void brandApi.removeCategory(brand._id, category.slug).then(load)}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                  title="Remove category"
                >
                  {category.name} ×
                </button>
              ))}
              {brand.categories.length === 0 && <p className="text-sm text-slate-400">No categories yet.</p>}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={categoryNames[brand._id] || ''}
                onChange={(event) => setCategoryNames((current) => ({ ...current, [brand._id]: event.target.value }))}
                placeholder="Category inside this brand"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => void addCategory(brand._id)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                Add category
              </button>
            </div>
          </section>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminBrandsPage;
