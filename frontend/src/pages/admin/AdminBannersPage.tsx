import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminButtonClass } from '../../components/admin/AdminPageToolbar';
import { bannerApi, type BannerRecord, type BannerSlot } from '../../services/bannerApi';

const slots: { id: BannerSlot; title: string; hint: string }[] = [
  { id: 'left', title: 'Left banner', hint: 'Wide image, about 1200 × 600 px.' },
  { id: 'right', title: 'Right banner', hint: 'Taller image, about 480 × 600 px.' },
];

const SlotEditor: React.FC<{
  slot: BannerSlot;
  title: string;
  hint: string;
  banners: BannerRecord[];
  onChange: () => Promise<void>;
}> = ({ slot, title, hint, banners, onChange }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const addBanner = async () => {
    if (!imageUrl.trim()) {
      setError('Image URL is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await bannerApi.create({ slot, imageUrl: imageUrl.trim(), linkUrl: linkUrl.trim() });
      setImageUrl('');
      setLinkUrl('');
      await onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{hint} Paste an image URL. The link opens when a visitor clicks the banner.</p>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-bold text-slate-700">Image URL</span>
        <input
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs"
        />
      </label>
      {imageUrl.trim() && (
        <img src={imageUrl.trim()} alt="" className="h-28 w-full rounded-xl border border-slate-200 object-cover" />
      )}

      <label className="block space-y-1">
        <span className="text-xs font-bold text-slate-700">Link URL</span>
        <input
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          placeholder="/products or https://..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs"
        />
      </label>
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
      <button type="button" onClick={() => void addBanner()} disabled={saving} className={adminButtonClass.primary}>
        {saving ? 'Adding...' : 'Add banner'}
      </button>

      <div className="space-y-3 border-t border-slate-100 pt-4">
        {banners.length === 0 && <p className="text-sm text-slate-400">No banners in this slot yet.</p>}
        {banners.map((banner) => (
          <article key={banner.id} className="rounded-xl border border-slate-200 p-3">
            <img src={banner.imageUrl} alt="" className="h-24 w-full rounded-lg object-cover" />
            <p className="mt-2 truncate text-xs font-mono text-slate-500">{banner.linkUrl || 'No link'}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={banner.isActive}
                  onChange={(event) => void bannerApi.update(banner.id, { isActive: event.target.checked }).then(onChange)}
                  className="h-4 w-4 accent-[#F5A000]"
                />
                Show on homepage
              </label>
              <button
                type="button"
                onClick={() => void bannerApi.remove(banner.id).then(onChange)}
                className="text-xs font-bold text-rose-600"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setBanners(await bannerApi.listAll());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load banners');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <AdminLayout title="Homepage Banners">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Homepage banners</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add an image URL and a link. Active banners appear at the top of the homepage, wide on the left and short on the right.
          </p>
          {error && <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p>}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {slots.map((slot) => (
            <SlotEditor
              key={slot.id}
              slot={slot.id}
              title={slot.title}
              hint={slot.hint}
              banners={banners.filter((banner) => banner.slot === slot.id)}
              onChange={load}
            />
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBannersPage;
