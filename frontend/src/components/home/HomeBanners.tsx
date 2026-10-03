import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { bannerApi, type BannerRecord, type BannerSlot } from '../../services/bannerApi';

const SITE_BADGE = 'CIVIL';
const AUTOPLAY_MS = 4500;

const OVERLAY_DEFAULTS: Record<BannerSlot, { headline: string; subheadline: string; cta: string }> = {
  left: {
    headline: 'Premium software, ready to download',
    subheadline: 'CAD, BIM, and project files with instant digital delivery.',
    cta: 'Shop now',
  },
  right: {
    headline: 'Featured pick',
    subheadline: 'Browse the latest bundles in the catalog.',
    cta: 'Explore',
  },
};

const isExternalLink = (url: string) => /^https?:\/\//i.test(url);

const BannerSlide: React.FC<{ banner: BannerRecord; compact?: boolean }> = ({ banner, compact = false }) => {
  const defaults = OVERLAY_DEFAULTS[banner.slot];
  const headline = banner.headline?.trim() || defaults.headline;
  const subheadline = banner.subheadline?.trim() || defaults.subheadline;
  const cta = banner.ctaLabel?.trim() || defaults.cta;
  const href = banner.linkUrl.trim();

  const content = (
    <>
      <img
        src={banner.imageUrl}
        alt={banner.altText?.trim() || headline}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/slide:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 via-[#0D1B2A]/25 to-[#0D1B2A]/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/50 via-transparent to-transparent" />
      <div className="absolute left-0 top-0 h-full w-1 bg-[#F5A623]" />
      <div className={`absolute inset-x-0 bottom-0 z-[1] flex flex-col items-start ${compact ? 'gap-1.5 p-3 sm:p-4' : 'gap-2 p-4 sm:gap-3 sm:p-6 lg:p-8'}`}>
        <span className={`inline-flex items-center rounded-full border border-white/25 bg-white/10 font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]'}`}>
          {SITE_BADGE}
        </span>
        <h2 className={`max-w-xl font-bold leading-tight text-white drop-shadow-sm ${compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl lg:text-4xl'}`}>
          {headline}
        </h2>
        <p className={compact ? 'line-clamp-2 text-xs leading-snug text-white/80' : 'max-w-md text-sm leading-relaxed text-white/85 sm:text-base'}>
          {subheadline}
        </p>
        <span className={`mt-1 inline-flex items-center gap-1.5 bg-[#F5A623] font-semibold text-[#0D1B2A] ${compact ? 'rounded-full px-3 py-1.5 text-xs' : 'rounded-full px-4 py-2 text-sm sm:px-5 sm:py-2.5'}`}>
          {cta}
          <ArrowRight className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        </span>
      </div>
    </>
  );

  const className = 'group/slide relative block h-full w-full overflow-hidden';
  if (href.startsWith('/')) {
    return <Link to={href} className={className}>{content}</Link>;
  }
  if (href && isExternalLink(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }
  return <div className={className}>{content}</div>;
};

const BannerCarousel: React.FC<{ slides: BannerRecord[]; compact?: boolean; label: string }> = ({
  slides,
  compact = false,
  label,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];
  if (!slide) return null;

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-2xl border border-slate-200/80 shadow-lg ring-1 ring-slate-900/5" aria-label={label}>
      <BannerSlide banner={slide} compact={compact} />
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-[#0D1B2A]/40 text-white backdrop-blur-md transition hover:bg-[#F5A623] hover:text-[#0D1B2A]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => (current + 1) % slides.length)}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-[#0D1B2A]/40 text-white backdrop-blur-md transition hover:bg-[#F5A623] hover:text-[#0D1B2A]"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute right-3 top-3 z-10 flex gap-1.5">
            {slides.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to slide ${itemIndex + 1}`}
                onClick={() => setIndex(itemIndex)}
                className={`h-1.5 rounded-full transition-all ${itemIndex === index ? 'w-5 bg-[#F5A623]' : 'w-1.5 bg-white/55 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const DualBannerRow: React.FC<{ banners: BannerRecord[] }> = ({ banners }) => {
  const left = banners.filter((item) => item.slot === 'left');
  const right = banners.filter((item) => item.slot === 'right');
  if (left.length === 0 && right.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#FFF8EE] via-[#FFF8EE] to-white pt-4 pb-3 sm:pt-5 sm:pb-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(245,166,35,0.16),_transparent_60%)]" />
      <div className="relative mx-auto w-full px-4 sm:px-6 lg:px-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B45309]">Curated for you</p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4">
          {left.length > 0 && (
            <div className="w-full lg:w-3/4">
              <div className="aspect-[2/1] min-h-[240px] w-full sm:min-h-[320px] lg:min-h-[420px]">
                <BannerCarousel slides={left} label="Main promotional carousel" />
              </div>
            </div>
          )}
          {right.length > 0 && (
            <div className="w-full lg:w-1/4">
              <div className="aspect-[2/1] min-h-[240px] w-full sm:min-h-[320px] lg:aspect-auto lg:h-full lg:min-h-[420px]">
                <BannerCarousel slides={right} compact label="Secondary promotional carousel" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const HomeBanners: React.FC = () => {
  const [banners, setBanners] = useState<BannerRecord[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    bannerApi
      .listActive()
      .then((items) => {
        if (!cancelled) setBanners(items);
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!banners || banners.length === 0) return null;
  return <DualBannerRow banners={banners} />;
};

export default HomeBanners;
