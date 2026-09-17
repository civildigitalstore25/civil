import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AnnouncementBar from '../../components/layout/AnnouncementBar';
import Header from '../../components/layout/Header';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { useAuth } from '../../hooks/useAuth';

export const AccountPage: React.FC = () => {
  const { currentUser, isAdmin, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const accessDenied = (location.state as any)?.accessDenied;

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const email = currentUser?.email || '';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setToastMessage('Profile updated successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        
        {/* Access Denied Toast if redirected from AdminRoute */}
        {accessDenied && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center justify-between animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">⛔</span>
              <span>Access Denied: You do not have administrator permissions to access that page.</span>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {toastMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in shadow-xs">
            <span>✅</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Profile Card Banner */}
        <div className="bg-[#0B1B2E] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F5A000] text-slate-950 flex items-center justify-center text-2xl font-black shadow-md border-2 border-amber-300">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{currentUser?.name}</h1>
              <p className="text-xs text-slate-400 font-medium">{currentUser?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-md border border-amber-400/30">
                  {currentUser?.role === 'admin' ? 'Administrator' : 'Standard Member'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="bg-[#F5A000] hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
              >
                Admin Dashboard →
              </Link>
            )}

            <Link
              to="/account/orders"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-white/20"
            >
              My Orders
            </Link>

            <Link
              to="/account/password"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-white/20"
            >
              Change Password
            </Link>

            <button
              onClick={handleLogout}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-rose-500/30 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900">Personal Account Details</h2>
            <p className="text-xs text-slate-500">Update your name and mobile number stored in LocalStorage.</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4 max-w-xl">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address (Read Only)</label>
              <input
                type="email"
                readOnly
                value={email}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mobile Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#F5A000] hover:bg-[#e0951a] text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default AccountPage;
