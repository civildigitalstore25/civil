import HeroBadge from './HeroBadge';
import FeaturedProductCard from './FeaturedProductCard';
import StatsCards from './StatsCards';

export const HeroSection = () => {
  return (
    <section className="relative w-full bg-[#0D1B2A] bg-grid-pattern text-white py-14 md:py-20 px-4 md:px-8 overflow-hidden flex items-center">
      {/* Right Ambient Warm Orange Glow */}
      <div className="absolute inset-0 hero-ambient-glow pointer-events-none" />

      {/* Hero Content Container */}
      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column (60% ~ 7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Badge */}
          <HeroBadge />

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-6">
            Download Premium{' '}
            <em className="text-[#F5A623] not-italic italic">Software Bundles</em>{' '}
            for Every Discipline
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-base sm:text-lg max-w-md leading-relaxed mb-8 font-normal">
            Browse the software, project files, and learning packs currently in the catalog. Instant digital delivery after purchase.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            {/* Primary Button */}
            <a
              href="#explore"
              className="bg-[#F5A623] hover:bg-[#FFAA00] text-[#0D1B2A] font-semibold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <span>Explore Full Collection</span>
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>

            {/* Secondary Button */}
            <a
              href="#softwares"
              className="bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-full border border-white/20 flex items-center justify-center transition-colors duration-200"
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
