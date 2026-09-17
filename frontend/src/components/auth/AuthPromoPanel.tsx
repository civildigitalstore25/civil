import React from 'react';
import AuthLogo from './AuthLogo';
import AuthStats from './AuthStats';

interface AuthPromoPanelProps {
  type: 'login' | 'register' | 'password';
}

export const AuthPromoPanel: React.FC<AuthPromoPanelProps> = ({ type }) => {
  const isLogin = type !== 'register';

  const loginBenefits = [
    'Instant digital download after payment',
    'Lifetime access — no expiry',
    '24/7 WhatsApp technical support',
    '10,000+ products across all disciplines',
  ];

  return (
    <aside className="relative flex flex-col justify-between w-full h-full bg-[#0B1B2E] text-white p-6 sm:p-8 lg:p-10 overflow-hidden font-sans select-none">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#F5A000]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Content Area */}
      <div className="relative z-10 space-y-6 sm:space-y-7">
        {/* Logo */}
        <div className="mb-6 sm:mb-8">
          <AuthLogo variant="white" />
        </div>

        {/* Small Orange Horizontal Accent Line */}
        <div className="w-9 h-1 bg-[#F5A000] rounded-full" />

        {/* Dynamic Heading & Description */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight whitespace-pre-line">
            {isLogin ? (
              <>
                India's Largest
                <span className="block text-[#F5A000]">Software Marketplace</span>
              </>
            ) : (
              <>
                Join 50,000+
                <span className="block text-[#F5A000]">Engineers Today</span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {isLogin
              ? 'Access 10,000+ civil engineering software bundles, CAD templates, 3D designs, and estimation sheets with instant delivery.'
              : "Create your free account and get instant access to India's largest civil engineering digital marketplace."}
          </p>
        </div>

        {/* Conditional Middle Content */}
        {isLogin ? (
          <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200">
            {loginBenefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-[#F5A000]/20 text-[#F5A000] shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="leading-snug font-medium text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>
        ) : (
          <AuthStats />
        )}
      </div>

      {/* Bottom Decorative Curved Lines */}
      <div className="relative z-10 pt-8 mt-auto">
        <svg
          className="w-full h-16 sm:h-20 text-[#F5A000]/20 opacity-70"
          viewBox="0 0 300 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-20 60 C 50 10, 150 70, 320 20"
            stroke="url(#promo-grad-1)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M-20 75 C 80 30, 200 85, 320 40"
            stroke="url(#promo-grad-2)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="4 2"
          />
          <defs>
            <linearGradient id="promo-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F5A000" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFA500" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="promo-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F5A000" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </aside>
  );
};

export default AuthPromoPanel;
