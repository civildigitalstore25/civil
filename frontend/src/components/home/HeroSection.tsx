import HeroBadge from './HeroBadge';
import FeaturedProductCard from './FeaturedProductCard';
import StatsCards from './StatsCards';

export const HeroSection = () => {
  return (
    <section className="relative w-full bg-[#0D1B2A] bg-grid-pattern text-white py-12 md:py-20 px-4 md:px-8 overflow-hidden min-h-[calc(100vh-160px)] flex items-center">
      {/* Right Ambient Warm Orange Glow */}
      <div className="absolute inset-0 hero-ambient-glow pointer-events-none" />

      {/* Hero Content Container */}
      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column (60% ~ 7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Badge */}
          <HeroBadge />

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Download Premium{' '}
            <span className="text-[#F5A623]">Software</span>{' '}
            <span className="text-[#F5A623]">Bundles</span>{' '}
            for Every Discipline
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-8 font-normal">
            AutoCAD, Revit, 3ds Max, SketchUp, STAAD Pro, ETABS, Estimation Sheets, eBooks — instant digital delivery with lifetime access.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            {/* Primary Button */}
            <a
              href="#explore"
              className="bg-[#F5A623] hover:bg-[#FFAA00] text-white font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Explore Full Collection</span>
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>

            {/* Secondary Button */}
            <a
              href="#softwares"
              className="bg-slate-900/60 hover:bg-slate-800/80 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl border border-slate-700/80 flex items-center justify-center transition-colors duration-200"
            >
              View Softwares
            </a>
          </div>
        </div>

        {/* Right Column (40% ~ 5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center w-full">
          <FeaturedProductCard />
          <StatsCards />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
