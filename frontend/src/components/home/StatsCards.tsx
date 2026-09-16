export const StatsCards = () => {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
      {/* Stat 1 */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-md">
        <span className="text-2xl md:text-3xl font-black text-[#F5A623]">10K+</span>
        <span className="text-xs font-semibold text-slate-400 mt-0.5">Products</span>
      </div>

      {/* Stat 2 */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-md">
        <span className="text-2xl md:text-3xl font-black text-[#F5A623]">50K+</span>
        <span className="text-xs font-semibold text-slate-400 mt-0.5">Downloads</span>
      </div>
    </div>
  );
};

export default StatsCards;
