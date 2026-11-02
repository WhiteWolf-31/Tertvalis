import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Percent,
  Plus,
  ArrowRight,
  GitCompare,
  FileSpreadsheet,
  Calendar,
  Activity,
  Database,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import { useFinancial } from '../context/FinancialContext';
import {
  filterRecordsByPeriod,
  calculateKPIs,
  getMonthlySeries,
  formatCurrency,
  formatPercentage,
} from '../utils/calculations';

const PERIOD_OPTIONS = [
  { id: 'all', label: 'All Periods' },
  { id: '6m', label: 'Last 6 Months' },
  { id: '3m', label: 'Last 3 Months' },
  { id: 'q2', label: 'Q2 2026' },
  { id: 'q1', label: 'Q1 2026' },
];

export default function Dashboard() {
  const {
    records,
    budgets,
    budgetVarianceYearly,
    preferences,
    activityLog,
  } = useFinancial();
  const navigate = useNavigate();

  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const filteredRecords = useMemo(
    () => filterRecordsByPeriod(records, selectedPeriod),
    [records, selectedPeriod]
  );

  const periodKPIs = useMemo(
    () => calculateKPIs(filteredRecords, budgets),
    [filteredRecords, budgets]
  );

  const monthlyChartData = useMemo(
    () => getMonthlySeries(filteredRecords),
    [filteredRecords]
  );

  const recentTransactions = useMemo(() => {
    return [...filteredRecords]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [filteredRecords]);

  const currency = preferences.currencySymbol || '$';
  const isCompact = preferences.numberFormat === 'compact';

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0D0D0D]">
            Financial Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time KPIs, cash flow & budget health
          </p>
        </div>

        {/* Period Filter & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-neutral-200 rounded-xl px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-[#050FD8] shrink-0" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              aria-label="Select reporting period"
              className="text-xs font-medium text-[#0D0D0D] bg-transparent focus:outline-none cursor-pointer"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => navigate('/financial-data?action=new')}
            className="px-3.5 py-2 bg-[#050FD8] hover:bg-[#050FD8]/90 text-white text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/forecasting')}
            className="px-3 py-2 bg-white hover:bg-neutral-50 text-[#0D0D0D] border border-neutral-200 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#076CF2]" />
            <span className="hidden sm:inline">Forecast</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/comparison')}
            className="px-3 py-2 bg-white hover:bg-neutral-50 text-[#0D0D0D] border border-neutral-200 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5 text-[#076CF2]" />
            <span className="hidden sm:inline">Compare</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="px-3 py-2 bg-white hover:bg-neutral-50 text-[#0D0D0D] border border-neutral-200 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#050FD8]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(periodKPIs.totalRevenue, currency, isCompact)}
          trendLabel="+14.2%"
          trendPositive={true}
          subtext={`${filteredRecords.filter((r) => r.type === 'Income').length} entries`}
          icon={DollarSign}
          accentColor="#050FD8"
          delay={0.01}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(periodKPIs.totalExpenses, currency, isCompact)}
          trendLabel="+4.1%"
          trendPositive={true}
          subtext={`${filteredRecords.filter((r) => r.type === 'Expense').length} entries`}
          icon={TrendingDown}
          accentColor="#076CF2"
          delay={0.02}
        />
        <StatCard
          label="Net Profit"
          value={formatCurrency(periodKPIs.netProfit, currency, isCompact)}
          trendLabel={periodKPIs.netProfit >= 0 ? 'Surplus' : 'Deficit'}
          trendPositive={periodKPIs.netProfit >= 0}
          subtext="Net income"
          icon={TrendingUp}
          accentColor="#059669"
          delay={0.03}
        />
        <StatCard
          label="Cash Flow"
          value={formatCurrency(periodKPIs.cashFlow, currency, isCompact)}
          trendLabel="96% conv."
          trendPositive={periodKPIs.cashFlow >= 0}
          subtext="Operating"
          icon={Wallet}
          accentColor="#050FD8"
          delay={0.04}
        />
        <StatCard
          label="Budget Used"
          value={formatPercentage(periodKPIs.budgetUtilization, 1)}
          trendLabel={periodKPIs.budgetUtilization <= 100 ? 'On track' : 'Over'}
          trendPositive={periodKPIs.budgetUtilization <= 100}
          subtext={formatCurrency(periodKPIs.totalExpenseBudget, currency, true)}
          icon={PieChart}
          accentColor="#076CF2"
          delay={0.05}
        />
        <StatCard
          label="Profit Margin"
          value={formatPercentage(periodKPIs.profitMargin, 1)}
          trendLabel={periodKPIs.profitMargin >= 25 ? 'Healthy' : 'Moderate'}
          trendPositive={periodKPIs.profitMargin >= 0}
          subtext="Net ratio"
          icon={Percent}
          accentColor="#059669"
          delay={0.06}
        />
      </div>

      {/* Empty State if no records */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center">
          <Database className="w-9 h-9 text-[#050FD8] mx-auto mb-2.5" />
          <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
            No Records Found
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Add a financial record or switch the period filter.
          </p>
          <button
            type="button"
            onClick={() => navigate('/financial-data?action=new')}
            className="mt-4 px-4 py-2 bg-[#050FD8] text-white text-xs font-medium rounded-xl hover:bg-[#050FD8]/90 cursor-pointer"
          >
            Add Record
          </button>
        </div>
      ) : (
        <>
          {/* Primary Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Revenue & Expenses Overview Chart */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-7 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
                    Revenue vs Expenses
                  </h2>
                  <p className="text-xs text-neutral-500">Monthly trend</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#050FD8]" />
                    Revenue
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#076CF2]" />
                    Expenses
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyChartData}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#050FD8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#050FD8" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#076CF2" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#076CF2" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis
                      dataKey="shortLabel"
                      tick={{ fontSize: 11, fill: '#737373' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(val) => `${currency}${Math.round(val / 1000)}k`}
                      tick={{ fontSize: 11, fill: '#737373' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val) => formatCurrency(val, currency)}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E5E5',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#050FD8"
                      strokeWidth={2.2}
                      fillOpacity={1}
                      fill="url(#revGrad)"
                      isAnimationActive={preferences.chartAnimations}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#076CF2"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#expGrad)"
                      isAnimationActive={preferences.chartAnimations}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Monthly Financial Performance Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-5 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5"
            >
              <div className="mb-4">
                <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
                  Monthly Profit & Cash
                </h2>
                <p className="text-xs text-neutral-500">Net performance</p>
              </div>

              <div className="h-64 sm:h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyChartData}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis
                      dataKey="shortLabel"
                      tick={{ fontSize: 11, fill: '#737373' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(val) => `${currency}${Math.round(val / 1000)}k`}
                      tick={{ fontSize: 11, fill: '#737373' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val) => formatCurrency(val, currency)}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E5E5',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar
                      dataKey="profit"
                      name="Net Profit"
                      fill="#050FD8"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={preferences.chartAnimations}
                    />
                    <Bar
                      dataKey="cashFlow"
                      name="Cash Flow"
                      fill="#05F2AD"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={preferences.chartAnimations}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Second Row: Cash Flow + Budget Progress + Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            {/* Cash Flow Chart */}
            <div className="md:col-span-2 lg:col-span-5 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
                      Cash Flow Trajectory
                    </h2>
                    <p className="text-xs text-neutral-500">Monthly & cumulative</p>
                  </div>
                  <Link
                    to="/analytics"
                    className="text-xs font-medium text-[#050FD8] hover:underline flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="h-52 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyChartData}
                      margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                      <XAxis
                        dataKey="shortLabel"
                        tick={{ fontSize: 11, fill: '#737373' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(val) => `${currency}${Math.round(val / 1000)}k`}
                        tick={{ fontSize: 11, fill: '#737373' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(val) => formatCurrency(val, currency)}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E5E5',
                          borderRadius: '10px',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cashFlow"
                        name="Monthly Cash"
                        stroke="#076CF2"
                        strokeWidth={2.2}
                        dot={{ r: 3, fill: '#076CF2' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulativeCash"
                        name="Cumulative"
                        stroke="#050FD8"
                        strokeWidth={2.2}
                        strokeDasharray="4 4"
                        dot={{ r: 3, fill: '#050FD8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Avg Rev</span>
                  <span className="font-mono-num font-semibold text-[#0D0D0D] truncate block">
                    {formatCurrency(
                      monthlyChartData.length > 0
                        ? periodKPIs.totalRevenue / monthlyChartData.length
                        : 0,
                      currency,
                      true
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Avg Burn</span>
                  <span className="font-mono-num font-semibold text-[#0D0D0D] truncate block">
                    {formatCurrency(
                      monthlyChartData.length > 0
                        ? periodKPIs.totalExpenses / monthlyChartData.length
                        : 0,
                      currency,
                      true
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Rev/Exp Ratio</span>
                  <span className="font-mono-num font-semibold text-emerald-600 block">
                    {periodKPIs.totalExpenses > 0
                      ? `${(periodKPIs.totalRevenue / periodKPIs.totalExpenses).toFixed(2)}x`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Progress Card */}
            <div className="lg:col-span-4 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
                      Budget Progress
                    </h2>
                    <p className="text-xs text-neutral-500">Top categories</p>
                  </div>
                  <Link
                    to="/budgets"
                    className="text-xs font-medium text-[#050FD8] hover:underline flex items-center gap-1"
                  >
                    <span>Budgets</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {budgetVarianceYearly.expenseItems.slice(0, 5).map((item) => {
                    const pct = Math.min(100, Math.max(0, item.utilization));
                    const isOver = item.utilization > 100;
                    const isHigh = item.utilization >= 85 && !isOver;

                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#0D0D0D] truncate pr-2">
                            {item.category}
                          </span>
                          <span className="font-mono-num text-neutral-500 shrink-0 text-[11px]">
                            {item.utilization}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.35 }}
                            className={`h-full rounded-full ${
                              isOver
                                ? 'bg-red-600'
                                : isHigh
                                ? 'bg-amber-500'
                                : 'bg-[#050FD8]'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Total Expense Budget</span>
                <span className="font-mono-num font-semibold text-[#0D0D0D]">
                  {formatCurrency(budgetVarianceYearly.summary.totalBudget, currency)}
                </span>
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="lg:col-span-3 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
                    Activity
                  </h2>
                  <Activity className="w-4 h-4 text-[#076CF2]" />
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {activityLog.slice(0, 5).map((act) => (
                    <div
                      key={act.id}
                      className="pb-2.5 border-b border-neutral-100 last:border-none last:pb-0"
                    >
                      <p className="text-xs font-semibold text-[#0D0D0D] truncate">
                        {act.action}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {act.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-neutral-400">
                Synced with LocalStorage
              </div>
            </div>
          </div>

          {/* Recent Transactions (Desktop Table + Mobile Cards) */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-neutral-200 flex items-center justify-between gap-2">
              <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
                Recent Transactions
              </h2>
              <Link
                to="/financial-data"
                className="text-xs font-semibold text-[#050FD8] hover:underline inline-flex items-center gap-1"
              >
                <span>View All ({records.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#FAFAFA] text-[11px] font-semibold text-neutral-500">
                    <th className="py-2.5 px-4">ID</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {recentTransactions.map((rec) => (
                    <tr key={rec.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono-num text-neutral-400 whitespace-nowrap">
                        {rec.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#0D0D0D]">
                        {rec.description}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 whitespace-nowrap">
                        {rec.category}
                      </td>
                      <td className="py-3 px-4 font-mono-num text-neutral-500 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td
                        className={`py-3 px-4 font-mono-num font-semibold text-right whitespace-nowrap ${
                          rec.type === 'Income'
                            ? 'text-emerald-600'
                            : 'text-[#0D0D0D]'
                        }`}
                      >
                        {rec.type === 'Income' ? '+' : '-'}
                        {formatCurrency(rec.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-neutral-100">
              {recentTransactions.map((rec) => (
                <div key={rec.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0D0D0D] truncate">
                      {rec.description}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {rec.category} · {rec.date}
                    </p>
                  </div>
                  <span
                    className={`font-mono-num text-xs font-bold shrink-0 ${
                      rec.type === 'Income' ? 'text-emerald-600' : 'text-[#0D0D0D]'
                    }`}
                  >
                    {rec.type === 'Income' ? '+' : '-'}
                    {formatCurrency(rec.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
