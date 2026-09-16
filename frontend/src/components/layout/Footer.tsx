import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo_white_text.png';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0D1624] text-slate-300 border-t border-slate-800/80 font-sans">
      {/* Top Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* COLUMN 1: Logo + Description + Statistics (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Logo */}
            <Link to="/" className="inline-block group">
              <img
                src={logoImg}
                alt="Civil DigitalStore Logo"
                className="h-10 md:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            {/* Marketplace Description */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              India's largest digital marketplace for civil engineering software, CAD templates, 3D elevation designs, estimation sheets, and eBooks. Instant download, lifetime access.
            </p>

            {/* Statistics Cards (2x2 Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#162235] border border-slate-800 rounded-xl p-3 text-center space-y-0.5">
                <div className="text-base sm:text-lg font-extrabold text-[#F5A623]">10K+</div>
                <div className="text-[11px] font-medium text-slate-400">Products</div>
              </div>
              <div className="bg-[#162235] border border-slate-800 rounded-xl p-3 text-center space-y-0.5">
                <div className="text-base sm:text-lg font-extrabold text-[#F5A623]">50K+</div>
                <div className="text-[11px] font-medium text-slate-400">Downloads</div>
              </div>
              <div className="bg-[#162235] border border-slate-800 rounded-xl p-3 text-center space-y-0.5">
                <div className="text-base sm:text-lg font-extrabold text-[#F5A623]">4.9★</div>
                <div className="text-[11px] font-medium text-slate-400">Avg Rating</div>
              </div>
              <div className="bg-[#162235] border border-slate-800 rounded-xl p-3 text-center space-y-0.5">
                <div className="text-base sm:text-lg font-extrabold text-[#F5A623]">24/7</div>
                <div className="text-[11px] font-medium text-slate-400">Support</div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Quick Links (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-medium">
              <li>
                <Link to="/" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products?category=Softwares" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  Softwares
                </Link>
              </li>
              <li>
                <Link to="/autocad-software/" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  Softwares
                </Link>
              </li>
              <li>
                <Link to="/excel-sheets/" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  Excel Sheets
                </Link>
              </li>
              <li>
                <Link to="/ebooks/" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  eBooks
                </Link>
              </li>
              <li>
                <Link to="/projects/" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  3D Elevation
                </Link>
              </li>
              <li>
                <Link to="/projects/" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  Projects
                </Link>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#refund" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group">
                  <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Software Directory (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              SOFTWARE DIRECTORY
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-medium">
              {[
                { name: 'AutoCAD', path: '/autocad-software/' },
                { name: 'Revit', path: '/revit/' },
                { name: '3ds Max', path: '/3ds-max/' },
                { name: 'SketchUp', path: '/sketchup/' },
                { name: 'Lumion', path: '/lumion/' },
                { name: 'Tekla Structures', path: '/tekla/' },
                { name: 'MS Office', path: '/ms-office/' },
                { name: 'Excel Sheets', path: '/excel-sheets/' },
                { name: 'eBooks', path: '/ebooks/' },
                { name: 'Projects', path: '/projects/' }
              ].map((sw) => (
                <li key={sw.name}>
                  <Link
                    to={sw.path}
                    className="hover:text-[#F5A623] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                    {sw.name}
                  </Link>
                </li>
              ))}

            </ul>
          </div>

          {/* COLUMN 4: Support & Contact (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              SUPPORT & CONTACT
            </h4>

            {/* Email & Call Info */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#162235] text-[#F5A623] shrink-0 mt-0.5">
                  <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400">Email Support</div>
                  <a href="mailto:support@civildigitalstore.in" className="text-slate-200 font-bold hover:text-[#F5A623] transition-colors">
                    support@civildigitalstore.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#162235] text-[#F5A623] shrink-0 mt-0.5">
                  <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400">Call / WhatsApp</div>
                  <a href="https://wa.me/918807423228" target="_blank" rel="noreferrer" className="text-slate-200 font-bold hover:text-[#F5A623] transition-colors">
                    +91 88074 23228
                  </a>
                </div>
              </div>
            </div>

            {/* Chat on WhatsApp Button */}
            <a
              href="https://wa.me/918807423228"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              <span>Chat on WhatsApp</span>
            </a>

            {/* Download Our App / Google Play Badge */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">Download Our App</span>
              <a
                href="#app-download"
                className="inline-flex items-center gap-3 bg-[#162235] hover:bg-[#1f2d42] border border-slate-700 rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6 fill-[#F5A623]" viewBox="0 0 24 24">
                  <path d="M3 20.5v-17c0-.55.45-1 1-1h.2l9.8 8.5-9.8 8.5H4c-.55 0-1-.45-1-1zm12.3-7.5L20 9.5c.6-.4.6-1.1 0-1.5l-4.7-3.5-2.8 2.5 2.8 6zm-2.8 2.5l2.8 2.5 4.7-3.5c.6-.4.6-1.1 0-1.5l-4.7-3.5-2.8 6zm-10.8 4l9.8-8.5-9.8-8.5v17z" />
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[10px] font-medium text-slate-400 uppercase">GET IT ON</div>
                  <div className="text-xs font-extrabold text-white">Google Play</div>
                </div>
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Copyright & Trust Bar */}
      <div className="w-full bg-[#08101C] border-t border-slate-800/80 py-5 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            © 2026 <span className="text-slate-200 font-bold">Civil DigitalStore</span>. All Rights Reserved. Instant Download & Lifetime Access.
          </div>
          
          <div className="flex items-center gap-3 text-slate-400">
            <span className="bg-[#162235] px-2.5 py-1 rounded text-[10px] font-bold border border-slate-800">VISA</span>
            <span className="bg-[#162235] px-2.5 py-1 rounded text-[10px] font-bold border border-slate-800">MasterCard</span>
            <span className="bg-[#162235] px-2.5 py-1 rounded text-[10px] font-bold border border-slate-800">UPI</span>
            <span className="bg-[#162235] px-2.5 py-1 rounded text-[10px] font-bold border border-slate-800">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
