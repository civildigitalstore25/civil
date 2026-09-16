import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title = 'Dashboard', onMenuToggle }) => {
  const { currentUser } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left side: Hamburger button + Page Title */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      </div>

      {/* Right side: Quick Website view + Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          to="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-[#F5A000] hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold transition-colors"
        >
          <span>Storefront</span>
          <span className="text-xs">↗</span>
        </Link>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#0B1B2E] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-amber-400">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
            <p className="text-[10px] text-slate-500 font-medium">
              {currentUser?.role === 'superadmin' ? '⚡ Super Admin' : 'Administrator'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
