import { Link } from 'react-router-dom';
import bundleImage from '../../assets/autocad_bundle.png';

export const FeaturedProductCard = () => {
  return (
    <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 hover:border-[#F5A623]/50 rounded-2xl p-4 shadow-2xl shadow-slate-950/60 transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Container */}
      <Link to="/autocad-2007/" className="block relative w-full aspect-video rounded-xl overflow-hidden mb-4 border border-slate-800">
        <img
          src={bundleImage}
          alt="AutoCAD Architecture Complete Bundle 2024"
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

        {/* Bestseller Badge */}
        <span className="absolute top-3 left-3 bg-[#F5A623] text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-md shadow-md tracking-wider">
          Bestseller
        </span>
      </Link>

      {/* Content Area */}
      <div className="px-1 space-y-2.5">
        {/* Category */}
        <div className="text-[11px] font-extrabold tracking-widest text-[#F5A623] uppercase">
          AutoCAD
        </div>

        {/* Product Title */}
        <Link to="/autocad-2007/" className="block">
          <h3 className="text-lg md:text-xl font-bold text-white leading-snug hover:text-[#F5A623] transition-colors">
            AutoCAD Architecture Complete Bundle 2024
          </h3>
        </Link>

        {/* Price & Discount Section */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black text-white">₹1,499</span>
            <span className="text-sm font-semibold text-slate-400 line-through">₹3,999</span>
          </div>

          <span className="bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30 text-xs font-bold px-2.5 py-1 rounded-md">
            -62%
          </span>
        </div>

        {/* Quick Add / Buy Button inside Card */}
        <Link
          to="/autocad-2007/"
          className="w-full mt-3 bg-gradient-to-r from-[#F5A623] to-[#FFAA00] hover:from-[#FFAA00] hover:to-[#F5A623] text-white font-bold py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <span>Get Instant Access Now</span>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedProductCard;
