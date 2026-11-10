import { OfficialSocialBadges } from '../common/SocialLinks';

export const AnnouncementBar = () => {
  return (
    <div className="w-full bg-[#0B1928] text-xs font-medium text-slate-300 border-b border-slate-800/60 min-h-[36px] sm:min-h-[40px] flex items-center px-3 sm:px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#F5A623] animate-pulse inline-block shrink-0" />
          <span className="truncate text-[10px] tracking-wide text-slate-200 sm:text-[11px] md:text-xs">
            All Kinds of Software Available — Instant Digital Delivery Nationwide
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 sm:gap-5 text-[11px] sm:text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-slate-400 hidden md:inline">Follow Us:</span>
            <OfficialSocialBadges />
          </div>
          <span className="text-slate-700">|</span>
          <a href="#privacy" className="hover:text-[#F5A623] transition-colors duration-200">
            Privacy Policy
          </a>
          <a href="#about" className="hover:text-[#F5A623] transition-colors duration-200">
            About Us
          </a>
          <a href="#contact" className="hover:text-[#F5A623] transition-colors duration-200">
            Contact Us
          </a>
        </div>

        <div className="flex sm:hidden shrink-0">
          <OfficialSocialBadges />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
