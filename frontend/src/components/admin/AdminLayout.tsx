import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Dashboard' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 flex flex-col font-sans selection:bg-[#F5A000] selection:text-white">
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Backdrop for Mobile Sidebar Drawer */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          />
        )}

        {/* Sidebar Navigation */}
        <div className="fixed inset-y-0 left-0 z-40 lg:static lg:block">
          <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header */}
          <AdminHeader title={title} onMenuToggle={() => setMobileOpen((prev) => !prev)} />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;
