import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../context/CategoryContext';
import { useProducts } from '../../context/ProductContext';
import { getCategoryProductCount } from '../../utils/productSelectors';

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

const LOGO_MAP: Record<string, string> = {
  'autocad-software': autocadLogo,
  autocad: autocadLogo,
  revit: revitLogo,
  'excel-sheets': excelLogo,
  '3ds-max': twinmotionLogo,
  sketchup: sketchupLogo,
  lumion: lumionLogo,
  'ms-office': msofficeLogo,
  tekla: teklaLogo,
  ebooks: ebooksLogo,
  projects: msprojectLogo,
};

export const SoftwareCollection: React.FC = () => {
  const { categories } = useCategories();
  const { products } = useProducts();

  return (
    <section className="w-full bg-white text-slate-900 py-12 md:py-20 border-b border-slate-200/80">
      <div className="w-[90%] max-w-[1540px] mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight">
            Software Categories
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Browse our wide library of digital CAD drawings, BIM family models, structural calculators & software bundles.
          </p>
        </div>

        {/* Dynamic Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const count = getCategoryProductCount(products, category);
            const logoSrc = LOGO_MAP[category.slug.toLowerCase()] || LOGO_MAP[category.name.toLowerCase()] || autocadLogo;

            return (
              <Link
                key={category.slug}
                to={`/${category.slug}/`}
                className="group bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-[#F5A623] p-5 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              >
                {/* Logo Icon Container */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-3 p-2 bg-white rounded-xl shadow-2xs border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={logoSrc}
                    alt={`${category.name} logo`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Category Name */}
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#F5A623] transition-colors leading-snug">
                  {category.name}
                </h3>

                {/* Dynamic Product Count */}
                <span className="text-xs font-semibold text-slate-500 mt-1 bg-slate-200/60 group-hover:bg-amber-50 group-hover:text-amber-700 px-2.5 py-0.5 rounded-full transition-colors">
                  {count} {count === 1 ? 'Product' : 'Products'}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SoftwareCollection;
