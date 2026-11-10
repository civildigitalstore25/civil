import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import WhatsAppIcon from '../common/WhatsAppIcon';

const links = [
  { to: '/', label: 'Home', match: (path: string) => path === '/' },
  { to: '/products', label: 'All Products', match: (path: string) => path.startsWith('/products') },
  { to: '/#softwares', label: 'Categories', match: () => false },
  { to: '/contact', label: 'Contact Us', match: (path: string) => path.startsWith('/contact') },
] as const;

export const MobileNavToggle: React.FC<{ open: boolean; onToggle: () => void }> = ({ open, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="lg:hidden inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-800 hover:bg-amber-50 hover:text-[#F5A000] transition-colors"
    aria-label={open ? 'Close menu' : 'Open menu'}
    aria-expanded={open}
  >
    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
  </button>
);

export const MobileNavDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, location.hash]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="lg:hidden absolute left-0 right-0 top-full z-[60] h-screen bg-black/45"
        aria-label="Close menu overlay"
        onClick={onClose}
      />
      <div className="lg:hidden absolute left-0 right-0 top-full z-[70] max-h-[min(70vh,28rem)] overflow-y-auto border-b border-slate-700/60 bg-[#13233F] text-white shadow-2xl">
        <div className="mx-auto max-w-7xl space-y-1 px-3 py-3">
          {links.map((link) => {
            const active = link.match(location.pathname);
            return (
              <Link
                key={link.label}
                to={link.to}
                onClick={onClose}
                className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-bold transition-colors ${
                  active ? 'bg-[#F5A623]/15 text-[#F5A623]' : 'text-slate-100 hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623]" />}
              </Link>
            );
          })}
          <a
            href="https://wa.me/918807423228"
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3.5 py-3 text-sm font-extrabold text-white"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" />
            WhatsApp Order Now
          </a>
        </div>
      </div>
    </>
  );
};

/** Hook used by the white header to own mobile menu state. */
export const useMobileNav = () => {
  const [open, setOpen] = useState(false);
  return {
    open,
    toggle: () => setOpen((value) => !value),
    close: () => setOpen(false),
  };
};

export default MobileNavDrawer;
