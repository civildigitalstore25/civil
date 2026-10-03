import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminButtonClass } from '../../components/admin/AdminPageToolbar';
import { DualBannerRow } from '../../components/home/HomeBanners';
import { bannerApi, type BannerRecord, type BannerSlot } from '../../services/bannerApi';

const slots: { id: BannerSlot; title: string; hint: string }[] = [
  { id: 'left', title: 'Left (wide)', hint: '1200 × 600 px (2:1). This is the large carousel.' },
  { id: 'right', title: 'Right (short)', hint: '480 × 600 px (4:5). This sits beside the large carousel.' },
];

const fieldClass = 'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm';

const SlotEditor: React.FC<{
  slot: BannerSlot;
  title: string;
  hint: string;
  banners: BannerRecord[];
  onChange: () => Promise<void>;
}> = ({ slot, title, hint, banners, onChange }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
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
      await bannerApi.create({
        slot,
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim(),
        headline: headline.trim(),
        subheadline: subheadline.trim(),
        ctaLabel: ctaLabel.trim(),
      });
      setImageUrl('');
      setLinkUrl('');
      setHeadline('');
      setSubheadline('');
      setCtaLabel('');
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
        <p className="mt-1 text-xs text-slate-500">{hint} Overlay text is optional. Empty fields use the default headline and button.</p>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-bold text-slate-700">Image URL</span>
        <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className={`${fieldClass} font-mono text-xs`} />
      </label>
      {imageUrl.trim() && <img src={imageUrl.trim()} alt="" className="h-28 w-full rounded-xl border border-slate-200 object-cover" />}

      <label className="block space-y-1">
        <span className="text-xs font-bold text-slate-700">Navigation link</span>
        <input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="/products or https://..." className={`${fieldClass} font-mono text-xs`} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-bold text-slate-700">Headline</span>
        <input value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="Premium software, ready to download" className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-bold text-slate-700">Subheadline</span>
        <input value={subheadline} onChange={(event) => setSubheadline(event.target.value)} placeholder="Instant digital delivery after purchase" className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-bold text-slate-700">Button text</span>
        <input value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} placeholder="Shop now" className={fieldClass} />
      </label>
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
      <button type="button" onClick={() => void addBanner()} disabled={saving} className={adminButtonClass.primary}>
        {saving ? 'Adding...' : 'Add slide'}
      </button>

      <div className="space-y-3 border-t border-slate-100 pt-4">
        {banners.length === 0 && <p className="text-sm text-slate-400">No slides in this slot yet.</p>}
        {banners.map((banner) => (
          <ExistingSlide key={banner.id} banner={banner} onChange={onChange} />
        ))}
      </div>
    </section>
  );
};

const ExistingSlide: React.FC<{ banner: BannerRecord; onChange: () => Promise<void> }> = ({ banner, onChange }) => {
  const [headline, setHeadline] = useState(banner.headline || '');
  const [subheadline, setSubheadline] = useState(banner.subheadline || '');
  const [ctaLabel, setCtaLabel] = useState(banner.ctaLabel || '');
  const [linkUrl, setLinkUrl] = useState(banner.linkUrl || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHeadline(banner.headline || '');
    setSubheadline(banner.subheadline || '');
    setCtaLabel(banner.ctaLabel || '');
    setLinkUrl(banner.linkUrl || '');
  }, [banner]);

  const save = async () => {
    setSaving(true);
    try {
      await bannerApi.update(banner.id, {
        headline: headline.trim(),
        subheadline: subheadline.trim(),
        ctaLabel: ctaLabel.trim(),
        linkUrl: linkUrl.trim(),
      });
      await onChange();
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="space-y-2 rounded-xl border border-slate-200 p-3">
      <img src={banner.imageUrl} alt="" className="h-24 w-full rounded-lg object-cover" />
      <input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="Link URL" className={`${fieldClass} font-mono text-xs`} />
      <input value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="Headline" className={fieldClass} />
      <input value={subheadline} onChange={(event) => setSubheadline(event.target.value)} placeholder="Subheadline" className={fieldClass} />
      <input value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} placeholder="Button text" className={fieldClass} />
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <input
            type="checkbox"
            checked={banner.isActive}
            onChange={(event) => void bannerApi.update(banner.id, { isActive: event.target.checked }).then(onChange)}
            className="h-4 w-4 accent-[#F5A000]"
          />
          Show on homepage
        </label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void save()} disabled={saving} className="text-xs font-bold text-[#B45309]">
            {saving ? 'Saving...' : 'Save text'}
          </button>
          <button type="button" onClick={() => void bannerApi.remove(banner.id).then(onChange)} className="text-xs font-bold text-rose-600">
            Remove
          </button>
        </div>
      </div>
    </article>
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

  const active = banners.filter((banner) => banner.isActive);

  return (
    <AdminLayout title="Homepage Banners">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Homepage carousel</h2>
          <p className="mt-1 text-sm text-slate-500">
            The homepage shows a wide carousel on the left and a shorter card on the right. Add a headline, short line, and button for each slide.
          </p>
          {error && <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p>}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Homepage preview
          </div>
          {active.length > 0 ? (
            <DualBannerRow banners={active} />
          ) : (
            <p className="px-4 py-8 text-sm text-slate-400">Turn on a slide to preview it here.</p>
          )}
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
