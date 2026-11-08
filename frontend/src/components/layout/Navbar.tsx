import { Link, useLocation } from 'react-router-dom';
import WhatsAppIcon from '../common/WhatsAppIcon';

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
            to="/#softwares"
            className="py-4 shrink-0 text-slate-200 hover:text-[#F5A623] transition-colors"
          >
            Categories
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
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs md:text-sm font-extrabold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-sm hover:shadow-[#25D366]/30 transition-all duration-200 cursor-pointer"
          >
            {/* Official WhatsApp Icon */}
            <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
            <span>WhatsApp Order Now</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
