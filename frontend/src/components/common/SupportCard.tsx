export const SupportCard = () => {
  return (
    <div className="bg-[#0D1B2A] text-white px-3.5 py-2 rounded-xl flex items-center gap-3 border border-slate-800 shadow-sm shrink-0">
      {/* Phone Icon Box */}
      <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center text-white shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      </div>

      {/* Support Details */}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-slate-400 font-medium">24/7 Support</span>
        <span className="text-xs md:text-sm font-bold tracking-tight text-white">+91 88074 23228</span>
      </div>
    </div>
  );
};

export default SupportCard;
