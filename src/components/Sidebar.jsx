import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Database,
  TrendingUp,
  Layers,
  Calculator,
  BarChart3,
  GitCompare,
  FileSpreadsheet,
  Settings,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import Logo from './Logo';

export const MAIN_NAV_ITEMS = [
  {
    number: '01',
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    number: '02',
    name: 'Financial Data Management',
    path: '/financial-data',
    icon: Database,
  },
  {
    number: '03',
    name: 'Financial Forecasting',
    path: '/forecasting',
    icon: TrendingUp,
  },
  {
    number: '04',
    name: 'Scenario Planning',
    path: '/scenarios',
    icon: Layers,
  },
  {
    number: '05',
    name: 'Budget & Variance Analysis',
    path: '/budgets',
    icon: Calculator,
  },
  {
    number: '06',
    name: 'Financial Performance Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
  {
    number: '07',
    name: 'Scenario Comparison',
    path: '/comparison',
    icon: GitCompare,
  },
  {
    number: '08',
    name: 'Reports & Exports',
    path: '/reports',
    icon: FileSpreadsheet,
  },
];

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const renderNavLinks = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full py-4 px-3">
      <div className="space-y-1">
        {!collapsed || isMobile ? (
          <div className="px-3 py-1.5 text-[11px] font-medium text-neutral-400">
            Core Intelligence Modules
          </div>
        ) : null}

        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (isMobile) onCloseMobile();
              }}
              title={collapsed && !isMobile ? item.name : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#050FD8] text-white shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-[#0D0D0D]'
                } ${collapsed && !isMobile ? 'justify-center' : ''}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {(!collapsed || isMobile) && (
                <span className="truncate">{item.name}</span>
              )}

              {/* Custom Tooltip when collapsed on desktop */}
              {collapsed && !isMobile && (
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-[#0D0D0D] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Settings & Profile Section + Collapse Button */}
      <div className="pt-4 mt-4 border-t border-neutral-200 space-y-1">
        <NavLink
          to="/profile"
          onClick={() => {
            if (isMobile) onCloseMobile();
          }}
          title={collapsed && !isMobile ? 'My Profile' : undefined}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-[#050FD8] text-white'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-[#0D0D0D]'
            } ${collapsed && !isMobile ? 'justify-center' : ''}`
          }
        >
          <UserCircle className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span className="truncate">My Profile</span>}
          {collapsed && !isMobile && (
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-[#0D0D0D] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
              My Profile
            </span>
          )}
        </NavLink>

        <NavLink
          to="/settings"
          onClick={() => {
            if (isMobile) onCloseMobile();
          }}
          title={collapsed && !isMobile ? 'Settings' : undefined}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-[#050FD8] text-white'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-[#0D0D0D]'
            } ${collapsed && !isMobile ? 'justify-center' : ''}`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span className="truncate">Settings</span>}
          {collapsed && !isMobile && (
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-[#0D0D0D] text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
              Settings
            </span>
          )}
        </NavLink>

        {!isMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-[#0D0D0D] transition-colors cursor-pointer mt-2 ${
              collapsed ? 'justify-center' : ''
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block fixed top-16 bottom-0 left-0 bg-white border-r border-neutral-200 z-30 transition-all duration-200 no-print ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderNavLinks(false)}
      </aside>

      {/* Mobile Slide-In Sidebar & Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-neutral-950/50 backdrop-blur-[1px]"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-72 max-w-[85vw] bg-white h-full border-r border-neutral-200 flex flex-col z-10 shadow-2xl"
            >
              <div className="h-16 px-4 border-b border-neutral-200 flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-2 rounded-lg text-neutral-500 hover:text-[#0D0D0D] hover:bg-neutral-100 cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{renderNavLinks(true)}</div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
