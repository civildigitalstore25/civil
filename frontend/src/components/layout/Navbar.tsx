import { Link, useLocation } from 'react-router-dom';
import WhatsAppIcon from '../common/WhatsAppIcon';

const links = [
  { to: '/', label: 'Home', match: (path: string) => path === '/' },
  { to: '/products', label: 'All Products', match: (path: string) => path.startsWith('/products') },
  { to: '/#softwares', label: 'Categories', match: () => false },
  { to: '/contact', label: 'Contact Us', match: (path: string) => path.startsWith('/contact') },
] as const;

export const Navbar = () => {
  const location = useLocation();

  const linkClass = (active: boolean) =>
    `relative py-4 flex items-center justify-center shrink-0 transition-colors ${
      active ? 'text-[#F5A623]' : 'text-slate-200 hover:text-[#F5A623]'
    }`;

  return (
    <nav className="hidden lg:block w-full bg-[#1B2D50] border-b border-slate-700/50 px-4 md:px-8 text-white relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[58px]">
        <div className="flex items-center space-x-6 md:space-x-8 text-sm font-semibold py-2">
          {links.map((link) => {
            const active = link.match(location.pathname);
            return (
              <Link key={link.label} to={link.to} className={linkClass(active)}>
                {link.label}
                {active && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#F5A623] rounded-full" />}
              </Link>
            );
          })}
        </div>

        <a
          href="https://wa.me/918807423228"
          target="_blank"
          rel="noreferrer"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-extrabold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-sm hover:shadow-[#25D366]/30 transition-all duration-200 cursor-pointer"
          aria-label="WhatsApp Order Now"
        >
          <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
          <span>WhatsApp Order Now</span>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
