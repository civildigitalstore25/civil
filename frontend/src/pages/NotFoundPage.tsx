import React from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-16 text-center flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-5xl border border-amber-200 shadow-inner">
          🔎
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F5A623]">
            ERROR 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Page or Product Not Found
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
            The category or product slug you requested does not exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/"
            className="bg-[#0D1B2A] hover:bg-[#1B2D50] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md cursor-pointer"
          >
            Go to Home
          </Link>
          <Link
            to="/products"
            className="bg-[#F5A623] hover:bg-[#e0951a] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md cursor-pointer"
          >
            Browse All Products
          </Link>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default NotFoundPage;
