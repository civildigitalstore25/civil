import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isProducts = location.pathname.startsWith('/products');

  return (
    <nav className="w-full bg-[#1B2D50] border-b border-slate-700/50 px-4 md:px-8 text-white relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[58px]">
        {/* Navigation Items */}
        <div className="flex items-center space-x-6 md:space-x-8 text-sm font-semibold overflow-x-auto no-scrollbar py-2">
          {/* Item: Home */}
          <Link
            to="/"
            className={`relative py-4 flex items-center justify-center shrink-0 transition-colors ${
              isHome ? 'text-[#F5A623]' : 'text-slate-200 hover:text-[#F5A623]'
            }`}
          >
            Home
            {isHome && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#F5A623] rounded-full" />}
          </Link>

          {/* Item: All Products */}
          <Link
            to="/products"
            className={`relative py-4 flex items-center justify-center shrink-0 transition-colors ${
              isProducts ? 'text-[#F5A623]' : 'text-slate-200 hover:text-[#F5A623]'
            }`}
          >
            All Products
            {isProducts && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#F5A623] rounded-full" />}
          </Link>

          <Link
            to="/autocad-software/"
            className={`py-4 shrink-0 transition-colors ${
              location.pathname === '/autocad-software/' || location.pathname === '/autocad-software'
                ? 'text-[#F5A623] font-bold'
                : 'text-slate-200 hover:text-[#F5A623]'
            }`}
          >
            AutoCAD
          </Link>

          <Link
            to="/revit/"
            className={`py-4 shrink-0 transition-colors ${
              location.pathname === '/revit/' || location.pathname === '/revit'
                ? 'text-[#F5A623] font-bold'
                : 'text-slate-200 hover:text-[#F5A623]'
            }`}
          >
            Revit
          </Link>

          <Link
            to="/excel-sheets/"
            className={`py-4 shrink-0 transition-colors ${
              location.pathname === '/excel-sheets/' || location.pathname === '/excel-sheets'
                ? 'text-[#F5A623] font-bold'
                : 'text-slate-200 hover:text-[#F5A623]'
            }`}
          >
            Excel Sheets
          </Link>

          <Link
            to="/ebooks/"
            className={`py-4 shrink-0 transition-colors ${
              location.pathname === '/ebooks/' || location.pathname === '/ebooks'
                ? 'text-[#F5A623] font-bold'
                : 'text-slate-200 hover:text-[#F5A623]'
            }`}
          >
            eBooks
          </Link>

          <Link
            to="/projects/"
            className={`py-4 shrink-0 transition-colors ${
              location.pathname === '/projects/' || location.pathname === '/projects'
                ? 'text-[#F5A623] font-bold'
                : 'text-slate-200 hover:text-[#F5A623]'
            }`}
          >
            Projects
          </Link>

          <a
            href="#contact"
            className="text-slate-200 hover:text-[#F5A623] transition-colors py-4 shrink-0"
          >
            Contact Us
          </a>

        </div>

        {/* Right Side: WhatsApp Navbar Button */}
        <div className="hidden sm:flex items-center shrink-0">
          <a
            href="https://wa.me/918807423228"
            target="_blank"
            rel="noreferrer"
            className="bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-sm hover:shadow-green-500/20 transition-all duration-200 cursor-pointer"
          >
            {/* WhatsApp Icon */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            <span>WhatsApp Order Now</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
