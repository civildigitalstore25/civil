import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Dashboard' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Scroll right panel back to top when navigating across pages
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  return (
    <div className="h-screen h-[100dvh] bg-[#F7F8FA] text-slate-900 flex overflow-hidden font-sans selection:bg-[#F5A000] selection:text-white">
      
      {/* Backdrop for Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Fixed Left Sidebar Navigation */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Independently Scrollable Right Panel */}
      <div
        ref={scrollContainerRef}
        className="flex-1 lg:ml-64 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden"
      >
        {/* Sticky Header at the top of the scrollable right area */}
        <AdminHeader title={title} onMenuToggle={() => setMobileOpen((prev) => !prev)} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 pb-16">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
