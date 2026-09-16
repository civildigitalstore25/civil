export const AnnouncementBar = () => {
  return (
    <div className="w-full bg-[#0B1928] text-xs font-medium text-slate-300 border-b border-slate-800/60 min-h-[40px] flex items-center px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2 py-1.5">
        {/* Left Side */}
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#F5A623] animate-pulse inline-block shrink-0" />
          <span className="text-slate-200 tracking-wide text-[11px] sm:text-xs text-center sm:text-left">
            All Kinds of Software Available — Instant Digital Delivery Nationwide
          </span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-slate-400">
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
      </div>
    </div>
  );
};

export default AnnouncementBar;
