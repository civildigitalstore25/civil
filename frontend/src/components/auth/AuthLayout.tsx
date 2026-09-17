import React from 'react';
import AuthPromoPanel from './AuthPromoPanel';
import WhatsAppButton from '../common/WhatsAppButton';
import AnnouncementBar from '../layout/AnnouncementBar';
import Header from '../layout/Header';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

interface AuthLayoutProps {
  type: 'login' | 'register' | 'password';
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ type, children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F7F8FA] text-slate-800 font-sans antialiased relative">
      {/* Top Sticky Site Header */}
      <header className="sticky top-0 z-50 w-full shadow-md">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row w-full">
        {/* LEFT PROMOTIONAL PANEL (Desktop / Tablet) */}
        <div className="hidden md:block md:w-[290px] lg:w-[320px] xl:w-[350px] shrink-0 min-h-[calc(100vh-140px)]">
          <AuthPromoPanel type={type} />
        </div>

        {/* RIGHT AUTHENTICATION AREA */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 min-h-[calc(100vh-140px)] bg-slate-50">
          {/* Centered Form Wrapper */}
          <div className="w-full max-w-[340px] sm:max-w-[360px] my-auto py-6">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default AuthLayout;
