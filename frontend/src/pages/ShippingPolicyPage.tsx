import React from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      {/* Fixed Sticky Top Header */}
      <header className="sticky top-0 z-50 w-full shadow-sm">
        <AnnouncementBar />
        <Header />
        <Navbar />
      </header>

      {/* Hero Breadcrumb Banner */}
      <div className="w-full bg-white border-b border-slate-200 py-6 sm:py-8 px-4 md:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto space-y-2">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-[#F5A623] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#F5A623] font-bold">Shipping & Delivery Policy</span>
          </nav>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Last updated July 10, 2023
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          
          {/* Terms intro alert */}
          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs sm:text-sm font-medium space-y-2">
            <p>
              This Shipping & Delivery Policy is part of our Terms and Conditions (“Terms”) and should be therefore read alongside our main Terms:{' '}
              <a href="https://www.civildigitalstore.com/terms-and-conditions/" target="_blank" rel="noreferrer" className="font-bold underline text-[#D97706] hover:text-amber-700">
                https://www.civildigitalstore.com/terms-and-conditions/
              </a>
            </p>
            <p>
              Please carefully review our Shipping & Delivery Policy when purchasing our products. This policy will apply to any order you place with us.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
              WHAT ARE MY SHIPPING & DELIVERY OPTIONS?
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="text-emerald-600">⚡</span> Free Shipping (Instant Digital Download)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                We offer free Instant Download shipping on all orders. All CAD bundles, Revit models, Excel sheets, and eBooks are delivered digitally with instant access links upon checkout completion.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
              DO YOU DELIVER INTERNATIONALLY?
            </h2>
            <p className="text-slate-600">
              We do not offer international physical shipping. All our products are 100% digital download assets accessible globally from anywhere with an internet connection.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
              QUESTIONS ABOUT RETURNS?
            </h2>
            <p className="text-slate-600">
              If you have questions about returns, please review our Return Policy:{' '}
              <a href="https://www.civildigitalstore.com/return-and-refund-policy" target="_blank" rel="noreferrer" className="font-bold text-[#F5A623] hover:underline">
                https://www.civildigitalstore.com/return-and-refund-policy
              </a>
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
              HOW CAN YOU CONTACT US ABOUT THIS POLICY?
            </h2>
            <p className="text-slate-600">
              If you have any further questions or comments, you may contact us by:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Phone</span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">+91 88074 23228</p>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">+91 90429 93986</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Email</span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">civildigitalstore@gmail.com</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Online Form</span>
                <Link to="/contact-us" className="block font-bold text-[#F5A623] hover:underline text-xs sm:text-sm">
                  Contact Us Page →
                </Link>
              </div>
            </div>
          </section>

        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default ShippingPolicyPage;
