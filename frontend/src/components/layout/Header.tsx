import Logo from '../common/Logo';
import SearchBar from '../common/SearchBar';
import HeaderActions from '../common/HeaderActions';
import { MobileNavDrawer, useMobileNav } from './MobileNavMenu';

export const Header = () => {
  const mobileNav = useMobileNav();

  return (
    <header className="w-full bg-white text-slate-900 shadow-sm py-2.5 sm:py-3.5 px-3 sm:px-4 md:px-8 border-b border-slate-100 relative z-30">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Top Row for Mobile / Left Section for Desktop */}
        <div className="w-full lg:w-auto flex items-center justify-between gap-3">
          <Logo />
          {/* Mobile Right Actions: account, cart, then hamburger */}
          <div className="lg:hidden flex items-center gap-1.5">
            <HeaderActions
              mobileNavOpen={mobileNav.open}
              onMobileNavToggle={mobileNav.toggle}
            />
          </div>
        </div>

        {/* Search Bar - Full width on mobile, centered on desktop */}
        <div className="w-full lg:flex-1 flex justify-center px-0 lg:px-6">
          <SearchBar />
        </div>

        {/* Desktop Header Actions */}
        <div className="hidden lg:flex items-center">
          <HeaderActions />
        </div>
      </div>

      <MobileNavDrawer open={mobileNav.open} onClose={mobileNav.close} />
    </header>
  );
};

export default Header;
