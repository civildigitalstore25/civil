import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SupportCard from './SupportCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';

export const HeaderActions: React.FC = () => {
  const { summary } = useCart();
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-4 lg:gap-6 shrink-0">
      {/* Action Items */}
      <div className="flex items-center gap-4 text-slate-700">
        
        {/* Account / Profile Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          {isAuthenticated ? (
            <div>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 hover:text-[#F5A000] transition-colors duration-200 group cursor-pointer text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#0B1B2E] text-white flex items-center justify-center font-bold text-xs shadow-sm border border-amber-400/40">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden xl:flex flex-col">
                  <span className="text-[11px] text-slate-400 font-medium leading-none">Hi, {currentUser?.name.split(' ')[0]}</span>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#F5A000] transition-colors">
                    {isAdmin ? 'Admin' : 'Account'} ▾
                  </span>
                </div>
              </button>

              {/* Account Dropdown Menu Box */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                        Admin Account
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#F5A000] hover:bg-amber-50 transition-colors"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                        </svg>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/account/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>My Orders</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-2 hover:text-[#F5A000] transition-colors duration-200 group cursor-pointer"
              >
                <div className="p-2 rounded-full bg-slate-100 group-hover:bg-amber-50 transition-colors">
                  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span className="hidden xl:inline text-xs font-semibold">Sign In</span>
              </Link>
            </div>
          )}
        </div>

        {/* Cart Link */}
        <Link
          to="/cart"
          className="relative flex items-center gap-2 hover:text-[#F5A000] transition-colors duration-200 group cursor-pointer"
        >
          <div className="p-2 rounded-full bg-slate-100 group-hover:bg-amber-50 transition-colors relative">
            <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {/* Badge */}
            <span className="absolute -top-1 -right-1 bg-[#F5A000] text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border border-white">
              {summary.totalItemsCount}
            </span>
          </div>
          <span className="hidden xl:inline text-xs font-semibold">Cart</span>
        </Link>
      </div>

      {/* Support Card */}
      <SupportCard />
    </div>
  );
};

export default HeaderActions;
