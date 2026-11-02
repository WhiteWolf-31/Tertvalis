import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useFinancial } from '../context/FinancialContext';

export default function ProtectedRoute() {
  const { currentUser } = useFinancial();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-[#0D0D0D] flex flex-col overflow-x-hidden">
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <main
        className={`flex-1 w-full pt-16 transition-all duration-200 print-container ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className="max-w-[1440px] w-full mx-auto p-3.5 sm:p-6 lg:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
