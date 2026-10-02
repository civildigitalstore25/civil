import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bannerApi, type BannerRecord, type BannerSlot } from '../../services/bannerApi';

const BannerFrame: React.FC<{ banner: BannerRecord; className: string }> = ({ banner, className }) => {
  const image = (
    <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
  );
  const href = banner.linkUrl.trim();
  let linked = image;
  if (href.startsWith('/')) {
    linked = <Link to={href} className="block h-full w-full">{image}</Link>;
  } else if (href) {
    linked = (
      <a href={href} target="_blank" rel="noreferrer" className="block h-full w-full">
        {image}
      </a>
    );
  }

  return <div className={`overflow-hidden rounded-2xl bg-slate-100 ${className}`}>{linked}</div>;
};

const BannerSlotView: React.FC<{ slides: BannerRecord[]; className: string }> = ({ slides, className }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];
  if (!slide) return null;

  return (
    <div className="relative h-full">
      <BannerFrame banner={slide} className={className} />
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {slides.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show banner ${itemIndex + 1}`}
              onClick={() => setIndex(itemIndex)}
              className={`h-1.5 rounded-full ${itemIndex === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
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

  const bySlot = (slot: BannerSlot) => banners.filter((item) => item.slot === slot);
  const left = bySlot('left');
  const right = bySlot('right');

  return (
    <section className="bg-[#F7F8FA] px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-stretch">
        {left.length > 0 && (
          <div className="min-h-[220px] w-full lg:min-h-[360px] lg:w-3/4">
            <BannerSlotView slides={left} className="h-full min-h-[220px] lg:min-h-[360px]" />
          </div>
        )}
        {right.length > 0 && (
          <div className="min-h-[220px] w-full lg:min-h-[360px] lg:w-1/4">
            <BannerSlotView slides={right} className="h-full min-h-[220px] lg:min-h-[360px]" />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeBanners;
