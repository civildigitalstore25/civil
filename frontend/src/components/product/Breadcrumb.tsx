import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface BreadcrumbProps {
  category: string;
  title: string;
  categorySlug?: string;
  productSlug?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  category,
  title,
  categorySlug,
  productSlug: _productSlug,
}) => {
  const navigate = useNavigate();
  const categoryPath = categorySlug ? `/${categorySlug}/` : '/products';

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/products');
    }
  };

  return (
    <nav className="w-full bg-slate-100 border-b border-slate-200 py-2.5 sm:py-3 px-3 sm:px-4 md:px-8 text-xs sm:text-sm text-slate-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 font-medium">
        {/* Left: Breadcrumb Trail */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#F5A623] transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link to={categoryPath} className="hover:text-[#F5A623] transition-colors truncate max-w-[40vw] sm:max-w-none">
            {category || 'Softwares'}
          </Link>
          <span className="hidden sm:inline">&gt;</span>
          <span className="hidden sm:inline text-slate-900 truncate max-w-md font-bold">
            {title}
          </span>
        </div>

        {/* Right: Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-900 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs group shrink-0"
        >
          <svg
            className="w-3.5 h-3.5 stroke-current transform group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
      </div>
    </nav>
  );
};

export default Breadcrumb;
