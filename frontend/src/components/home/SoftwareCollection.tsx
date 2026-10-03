import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Building2, FolderOpen, Shield, type LucideIcon } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useBackendBrands } from '../../hooks/useBackendBrands';
import { productMatchesCatalog } from '../../utils/catalogMatch';
import { slugify } from '../../utils/slugify';
import ProductCard from '../common/ProductCard';
import type { BrandRecord } from '../../services/brandApi';

import excelLogo from '../../assets/logos/excel.svg';
import twinmotionLogo from '../../assets/logos/twinmotion.svg';
import autocadLogo from '../../assets/logos/autocad.svg';
import lumionLogo from '../../assets/logos/lumion.svg';
import sketchupLogo from '../../assets/logos/sketchup.svg';
import msofficeLogo from '../../assets/logos/msoffice.svg';
import revitLogo from '../../assets/logos/revit.svg';
import msprojectLogo from '../../assets/logos/msproject.svg';
import ebooksLogo from '../../assets/logos/ebooks.svg';
import teklaLogo from '../../assets/logos/tekla.svg';

type BrandMark = {
  image?: string;
  icon?: LucideIcon;
  color: string;
  label?: string;
};

const BRAND_MARKS: Record<string, BrandMark> = {
  autodesk: { image: '/mobilelogo/autocad.png', color: '#f59e0b', label: 'AutoDesk' },
  microsoft: { image: '/mobilelogo/Microsoft_Logo.png', color: '#3b82f6' },
  adobe: { image: '/mobilelogo/adobe.png', color: '#ec4899' },
  corel: { image: '/mobilelogo/corel.jpg', color: '#06b6d4', label: 'Corel' },
  coreldraw: { image: '/mobilelogo/corel.jpg', color: '#06b6d4', label: 'Corel' },
  antivirus: { icon: Shield, color: '#10b981' },
  projects: { icon: FolderOpen, color: '#a16207' },
  ebook: { icon: BookOpen, color: '#7c3aed' },
  'architectural-softwares': { icon: Building2, color: '#0ea5e9' },
  'structural-softwares': { icon: Building2, color: '#ea580c' },
};

const BRAND_ORDER = [
  'autodesk',
  'microsoft',
  'antivirus',
  'adobe',
  'projects',
  'structural-softwares',
  'architectural-softwares',
  'ebook',
];

const CATEGORY_LOGOS: Record<string, string> = {
  autocad: autocadLogo,
  'autocad-files': autocadLogo,
  revit: revitLogo,
  'revit-files': revitLogo,
  twinmotion: twinmotionLogo,
  sketchup: sketchupLogo,
  lumion: lumionLogo,
  tekla: teklaLogo,
  'excel-sheet-files': excelLogo,
  'microsoft-365': msofficeLogo,
  'visio-professional': msofficeLogo,
  windows: msofficeLogo,
  'microsoft-projects': msprojectLogo,
  'civil-engineering': ebooksLogo,
  'ai-prompts': ebooksLogo,
};

const brandMark = (slug: string): BrandMark =>
  BRAND_MARKS[slug] ?? { color: '#64748b' };

const MarkIcon: React.FC<{ mark: BrandMark; label: string; className: string }> = ({ mark, label, className }) => {
  if (mark.image) {
    return <img src={mark.image} alt={label} className={`${className} object-contain`} />;
  }
  if (mark.icon) {
    const Icon = mark.icon;
    return <Icon className={className} style={{ color: mark.color }} />;
  }
  return (
    <span className="text-xs font-black" style={{ color: mark.color }}>
      {label.slice(0, 2).toUpperCase()}
    </span>
  );
};

export const SoftwareCollection: React.FC = () => {
  const { allBrands, loading, error } = useBackendBrands();
  const { products } = useProducts();
  const [activeBrand, setActiveBrand] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const brands = useMemo(() => {
    const rank = (slug: string) => {
      const index = BRAND_ORDER.indexOf(slug);
      return index === -1 ? BRAND_ORDER.length : index;
    };
    return [...allBrands].sort((a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name));
  }, [allBrands]);

  useEffect(() => {
    if (!brands.length) return;
    if (!brands.some((brand) => brand.slug === activeBrand)) {
      setActiveBrand(brands[0].slug);
      setActiveCategory('');
    }
  }, [brands, activeBrand]);

  const selected = brands.find((brand) => brand.slug === activeBrand) ?? brands[0];
  const selectedMark = selected ? brandMark(selected.slug) : { color: '#64748b' };

  const visibleProducts = useMemo(() => {
    if (!selected) return [];
    const category = selected.categories.find((item) => item.slug === activeCategory);
    return products.filter((product) => {
      if (product.status === 'inactive' || product.status === 'draft') return false;
      if (category) return productMatchesCatalog(product, category, selected);
      const brandName = (product.brand || product.software || product.company || '').trim().toLowerCase();
      return brandName === selected.name.trim().toLowerCase() || slugify(brandName) === selected.slug;
    });
  }, [products, selected, activeCategory]);

  const selectBrand = (brand: BrandRecord) => {
    setActiveBrand(brand.slug);
    setActiveCategory('');
  };

  return (
    <section id="softwares" className="w-full bg-white text-slate-900 py-10 md:py-16 border-b border-slate-200">
      <div className="w-[92%] max-w-[1540px] mx-auto">
        <div className="text-center pb-6 md:pb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950">Shop by Brand</h2>
          <p className="mt-2 text-sm text-slate-500">Pick a brand, then open one of its categories.</p>
        </div>

        {loading && <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />}

        {!loading && error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center text-sm text-slate-600">
            {error}
          </div>
        )}

        {!loading && !error && brands.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
            No brands are published yet.
          </div>
        )}

        {!loading && !error && selected && (
          <>
            <div className="mb-6 md:mb-8">
              <div className="sm:hidden rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
                <div className="relative flex items-center gap-2">
                  <div
                    className="pointer-events-none flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${selectedMark.color}20` }}
                  >
                    <MarkIcon mark={selectedMark} label={selectedMark.label || selected.name} className="h-4 w-4" />
                  </div>
                  <select
                    aria-label="Select brand"
                    value={selected.slug}
                    onChange={(event) => {
                      const next = brands.find((brand) => brand.slug === event.target.value);
                      if (next) selectBrand(next);
                    }}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-transparent px-3 pr-9 text-sm font-semibold text-slate-900 outline-none"
                  >
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand.slug}>
                        {brandMark(brand.slug).label || brand.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">▼</span>
                </div>
              </div>

              <div className="hidden sm:flex sm:flex-wrap sm:justify-center gap-2 md:gap-6">
                {brands.map((brand) => {
                  const mark = brandMark(brand.slug);
                  const label = mark.label || brand.name;
                  const isActive = brand.slug === selected.slug;
                  return (
                    <button
                      key={brand._id}
                      type="button"
                      onClick={() => selectBrand(brand)}
                      className="relative flex min-w-[88px] md:min-w-[120px] flex-col items-center justify-center px-2 md:px-4 py-3 md:py-4 text-sm md:text-base font-semibold transition-all duration-300 hover:scale-105"
                      style={{ color: isActive ? '#0068ff' : '#0f172a' }}
                    >
                      <div
                        className="mb-2 flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-xl"
                        style={{ backgroundColor: isActive ? `${mark.color}20` : `${mark.color}10` }}
                      >
                        <MarkIcon mark={mark} label={label} className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <span className="leading-tight">{label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 h-[3px] w-[60%] -translate-x-1/2 rounded-full bg-[#0068ff]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selected.categories.length > 0 && (
              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    {selectedMark.label || selected.name} categories
                  </h3>
                  <Link
                    to={`/products?brand=${encodeURIComponent(selected.slug)}`}
                    className="text-xs font-bold text-[#0068ff] hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('')}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                      activeCategory === '' ? 'bg-[#0D1B2A] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    All
                  </button>
                  {selected.categories.map((category) => {
                    const logo = CATEGORY_LOGOS[category.slug];
                    const isActive = activeCategory === category.slug;
                    return (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => setActiveCategory(category.slug)}
                        className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-colors ${
                          isActive
                            ? 'border-[#0068ff] bg-[#0068ff]/10 text-[#0068ff]'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {logo ? (
                          <img src={logo} alt="" className="h-5 w-5 object-contain" />
                        ) : (
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black text-white"
                            style={{ backgroundColor: selectedMark.color }}
                          >
                            {category.name.slice(0, 1)}
                          </span>
                        )}
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {visibleProducts.length === 0 ? (
              <div className="rounded-lg bg-slate-50 py-12 text-center text-slate-500">
                <p className="text-lg">No products available in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
                {visibleProducts.slice(0, 10).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SoftwareCollection;
