import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CheckCheck,
  Trash2,
  FileText,
  Layers,
  PieChart,
  Compass,
  X,
} from 'lucide-react';
import Logo from './Logo';
import Modal from './Modal';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/calculations';

const NAV_PAGES = [
  { title: 'Dashboard Overview', path: '/dashboard', section: 'Navigation' },
  { title: 'Financial Data Management', path: '/financial-data', section: 'Navigation' },
  { title: 'Financial Forecasting', path: '/forecasting', section: 'Navigation' },
  { title: 'Scenario Planning', path: '/scenarios', section: 'Navigation' },
  { title: 'Budget & Variance Analysis', path: '/budgets', section: 'Navigation' },
  { title: 'Financial Performance Analytics', path: '/analytics', section: 'Navigation' },
  { title: 'Scenario Comparison', path: '/comparison', section: 'Navigation' },
  { title: 'Reports & Exports', path: '/reports', section: 'Navigation' },
  { title: 'My Profile', path: '/profile', section: 'Account' },
  { title: 'Workspace Settings', path: '/settings', section: 'Account' },
];

export default function Header({ onOpenMobileMenu }) {
  const {
    currentUser,
    logout,
    records,
    scenarios,
    budgets,
    notifications,
    preferences,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useFinancial();

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search results across Records, Scenarios, Budgets, and Navigation
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { pages: [], records: [], scenarios: [], budgets: [] };

    const matchedPages = NAV_PAGES.filter((p) =>
      p.title.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedRecords = records
      .filter(
        (r) =>
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      )
      .slice(0, 4);

    const matchedScenarios = scenarios
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedBudgets = budgets
      .filter((b) => b.category.toLowerCase().includes(q))
      .slice(0, 3);

    return {
      pages: matchedPages,
      records: matchedRecords,
      scenarios: matchedScenarios,
      budgets: matchedBudgets,
      totalCount:
        matchedPages.length +
        matchedRecords.length +
        matchedScenarios.length +
        matchedBudgets.length,
    };
  }, [searchQuery, records, scenarios, budgets]);

  const handleSelectSearchResult = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const userInitials = useMemo(() => {
    if (!currentUser?.fullName) return 'TV';
    return currentUser.fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [currentUser]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-40 px-4 sm:px-6 flex items-center justify-between gap-4 no-print">
        {/* Left: Hamburger + Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-[#0D0D0D] hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="focus:outline-none">
            <Logo />
          </Link>
        </div>

        {/* Center: Global Search across records, scenarios, budgets, and modules */}
        <div ref={searchRef} className="relative flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search records, scenarios, budgets, or pages..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg text-[#0D0D0D] placeholder:text-neutral-400 focus:outline-none focus:border-[#050FD8] focus:bg-white transition-colors"
              aria-label="Global workspace search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-neutral-400 hover:text-[#0D0D0D] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {searchOpen && searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
              >
                {searchResults.totalCount === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    No matching records, scenarios, or budgets found for "{searchQuery}".
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {searchResults.pages.length > 0 && (
                      <div className="p-2">
                        <div className="px-2.5 py-1 text-[11px] font-medium text-neutral-400">
                          Modules
                        </div>
                        {searchResults.pages.map((page) => (
                          <button
                            key={page.path}
                            type="button"
                            onClick={() => handleSelectSearchResult(page.path)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-xs text-[#0D0D0D] hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#050FD8] shrink-0" />
                            <span className="font-medium">{page.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.records.length > 0 && (
                      <div className="p-2">
                        <div className="px-2.5 py-1 text-[11px] font-medium text-neutral-400">
                          Financial Records
                        </div>
                        {searchResults.records.map((rec) => (
                          <button
                            key={rec.id}
                            type="button"
                            onClick={() =>
                              handleSelectSearchResult(
                                `/financial-data?q=${encodeURIComponent(rec.description)}`
                              )
                            }
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left text-xs hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-[#0D0D0D] truncate">
                                {rec.description}
                              </p>
                              <p className="text-[11px] text-neutral-500">
                                {rec.category} · {rec.date}
                              </p>
                            </div>
                            <span
                              className={`font-mono-num font-semibold shrink-0 ${
                                rec.type === 'Income'
                                  ? 'text-emerald-700'
                                  : 'text-[#0D0D0D]'
                              }`}
                            >
                              {rec.type === 'Income' ? '+' : '-'}
                              {formatCurrency(rec.amount, preferences.currencySymbol)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.scenarios.length > 0 && (
                      <div className="p-2">
                        <div className="px-2.5 py-1 text-[11px] font-medium text-neutral-400">
                          Scenarios
                        </div>
                        {searchResults.scenarios.map((scen) => (
                          <button
                            key={scen.id}
                            type="button"
                            onClick={() => handleSelectSearchResult('/scenarios')}
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left text-xs hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Layers className="w-3.5 h-3.5 text-[#076CF2] shrink-0" />
                              <span className="font-medium text-[#0D0D0D] truncate">
                                {scen.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-500 font-mono-num shrink-0">
                              +{scen.revenueGrowthRate}% Rev
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.budgets.length > 0 && (
                      <div className="p-2">
                        <div className="px-2.5 py-1 text-[11px] font-medium text-neutral-400">
                          Budgets
                        </div>
                        {searchResults.budgets.map((bdg) => (
                          <button
                            key={bdg.id}
                            type="button"
                            onClick={() => handleSelectSearchResult('/budgets')}
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left text-xs hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <PieChart className="w-3.5 h-3.5 text-[#050FD8] shrink-0" />
                              <span className="font-medium text-[#0D0D0D] truncate">
                                {bdg.category}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-600 font-mono-num shrink-0">
                              {formatCurrency(bdg.amount, preferences.currencySymbol)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Notifications, Help, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Panel Trigger */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              className="relative p-2 rounded-lg text-neutral-600 hover:text-[#0D0D0D] hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#050FD8] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-neutral-200 bg-[#FAFAFA] flex items-center justify-between">
                    <div>
                      <h4 className="font-heading text-sm font-semibold text-[#0D0D0D]">
                        Notifications
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        {unreadCount} unread alerts
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="text-xs text-[#050FD8] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={clearNotifications}
                          className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          title="Clear notifications"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-neutral-500">
                        No notifications right now.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            setNotifOpen(false);
                            if (notif.link) navigate(notif.link);
                          }}
                          className={`p-3.5 hover:bg-neutral-50 transition-colors cursor-pointer ${
                            !notif.read ? 'bg-[#050FD8]/[0.03]' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-[#0D0D0D]">
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-neutral-400 whitespace-nowrap shrink-0">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Help / Formula Guide Button */}
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="p-2 rounded-lg text-neutral-600 hover:text-[#0D0D0D] hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Financial Methodology and Help"
            title="Financial Methodology & Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* User Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-neutral-200"
              aria-label="User account menu"
            >
              <div className="w-8 h-8 rounded-lg bg-[#050FD8] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[#0D0D0D] leading-tight whitespace-nowrap">
                  {currentUser?.fullName || 'Eleanor Vance'}
                </p>
                <p className="text-[11px] text-neutral-500 leading-tight truncate max-w-[130px]">
                  {currentUser?.companyName || 'Vance Meridian'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 hidden sm:block" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-neutral-100 bg-[#FAFAFA]">
                    <p className="text-xs font-semibold text-[#0D0D0D] truncate">
                      {currentUser?.fullName}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {currentUser?.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#0D0D0D] hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4 text-neutral-500" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#0D0D0D] hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neutral-500" />
                      <span>Settings</span>
                    </Link>
                  </div>
                  <div className="p-1.5 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Help & Financial Methodology Modal */}
      <Modal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="Tertvalis Financial Methodology & Workspace Guide"
        subtitle="Reference documentation for forecasting formulas, budget variance logic, and local storage persistence"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <div className="p-4 bg-[#FAFAFA] border border-neutral-200 rounded-lg">
            <h4 className="font-heading font-semibold text-[#0D0D0D] text-sm">
              1. Real-Time Ledger & Unified State
            </h4>
            <p className="mt-1 text-xs text-neutral-600">
              All 8 modules are connected to a single financial ledger stored in your browser's LocalStorage. Adding, editing, or deleting a record in <strong>Financial Data Management</strong> immediately recalculates KPIs, Forecasts, Scenario Projections, Budget Variances, Analytics, and Reports.
            </p>
          </div>

          <div className="p-4 bg-[#FAFAFA] border border-neutral-200 rounded-lg">
            <h4 className="font-heading font-semibold text-[#0D0D0D] text-sm">
              2. Budget & Variance Equations
            </h4>
            <p className="mt-1 text-xs text-neutral-600">
              Tertvalis computes category variances using standard FP&A conventions:
            </p>
            <ul className="mt-2 space-y-1 text-xs font-mono-num bg-white p-3 rounded border border-neutral-200">
              <li>• Budget Variance = Actual Amount − Budget Amount</li>
              <li>• Variance Percentage = (Budget Variance / Budget Amount) × 100</li>
              <li>• Expense Favourability: Variance ≤ 0 is Favourable (under budget)</li>
              <li>• Revenue Favourability: Variance ≥ 0 is Favourable (above target)</li>
            </ul>
          </div>

          <div className="p-4 bg-[#FAFAFA] border border-neutral-200 rounded-lg">
            <h4 className="font-heading font-semibold text-[#0D0D0D] text-sm">
              3. Forecasting & Scenario Intelligence Disclaimer
            </h4>
            <p className="mt-1 text-xs text-neutral-600">
              Forecasts and multi-scenario comparisons are analytical projections derived from historical run-rates and user-configured growth assumptions. They are not guaranteed financial outcomes. Furthermore, authentication and data persistence in this workspace use browser LocalStorage for demonstration purposes—do not store confidential production credentials.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setHelpModalOpen(false)}
              className="px-4 py-2 bg-[#050FD8] text-white text-xs font-medium rounded-lg hover:bg-[#050FD8]/90 transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
