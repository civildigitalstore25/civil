import React from 'react';

interface StatItem {
  number: string;
  label: string;
  icon: React.ReactNode;
}

export const AuthStats: React.FC = () => {
  const stats: StatItem[] = [
    {
      number: '10K+',
      label: 'Products',
      icon: (
        <svg className="w-4 h-4 text-[#F5A000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      number: '50K+',
      label: 'Downloads',
      icon: (
        <svg className="w-4 h-4 text-[#F5A000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )
    },
    {
      number: '4.9/5',
      label: 'Rating',
      icon: (
        <svg className="w-4 h-4 text-[#F5A000]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    },
    {
      number: '24/7',
      label: 'Support',
      icon: (
        <svg className="w-4 h-4 text-[#F5A000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 pt-1">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-[#142640]/80 border border-slate-700/50 rounded-xl p-2.5 sm:p-3 text-left transition-colors duration-200 hover:border-slate-600/80"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <div className="p-1 rounded-md bg-[#0B1B2E] border border-slate-800 shrink-0">
              {item.icon}
            </div>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#F5A000] tracking-tight leading-none">
            {item.number}
          </div>
          <div className="text-[11px] font-medium text-slate-300 mt-1">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthStats;
