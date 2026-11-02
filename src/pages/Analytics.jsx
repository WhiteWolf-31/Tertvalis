import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Percent,
  Wallet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import { useFinancial } from '../context/FinancialContext';
import { ALL_CATEGORIES } from '../utils/storage';
import {
  filterRecordsByPeriod,
  calculateKPIs,
  getMonthlySeries,
  getCategoryBreakdown,
  formatCurrency,
  formatPercentage,
} from '../utils/calculations';

const CHART_COLORS = [
  '#050FD8',
  '#076CF2',
  '#059669',
  '#0284C7',
  '#4F46E5',
  '#0D9488',
  '#6366F1',
];

export default function Analytics() {
  const { records, budgets, preferences } = useFinancial();

  const [periodFilter, setPeriodFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const currency = preferences.currencySymbol || '$';
  const isCompact = preferences.numberFormat === 'compact';

  const filteredRecords = useMemo(() => {
    const byPeriod = filterRecordsByPeriod(records, periodFilter);
    if (categoryFilter === 'All') return byPeriod;
    return byPeriod.filter((r) => r.category === categoryFilter);
  }, [records, periodFilter, categoryFilter]);

  const kpis = useMemo(
    () => calculateKPIs(filteredRecords, budgets),
    [filteredRecords, budgets]
  );

  const monthlySeries = useMemo(
    () => getMonthlySeries(filteredRecords),
    [filteredRecords]
  );

  const revenueCategories = useMemo(
    () => getCategoryBreakdown(filteredRecords, 'Income'),
    [filteredRecords]
  );

  const expenseCategories = useMemo(
    () => getCategoryBreakdown(filteredRecords, 'Expense'),
    [filteredRecords]
  );

  const periodGrowthMetrics = useMemo(() => {
    if (monthlySeries.length < 2) {
      return { revChange: 0, expChange: 0, profitChange: 0 };
    }
    const first = monthlySeries[0];
    const last = monthlySeries[monthlySeries.length - 1];

    const revChange =
      first.revenue > 0
        ? ((last.revenue - first.revenue) / first.revenue) * 100
        : 0;
    const expChange =
      first.expenses > 0
        ? ((last.expenses - first.expenses) / first.expenses) * 100
        : 0;
    const profitChange =
      first.profit !== 0
        ? ((last.profit - first.profit) / Math.abs(first.profit)) * 100
        : 0;

    return {
      revChange: Number(revChange.toFixed(1)),
      expChange: Number(expChange.toFixed(1)),
      profitChange: Number(profitChange.toFixed(1)),
      startLabel: first.shortLabel,
      endLabel: last.shortLabel,
    };
  }, [monthlySeries]);

  return (
    <div className="space-y-5">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0D0D0D]">
            Performance Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Revenue, expense, profitability & category trends
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-neutral-200 rounded-xl px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-[#050FD8]" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              aria-label="Filter analytics by period"
              className="text-xs font-medium text-[#0D0D0D] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Periods</option>
              <option value="6m">Last 6 Months</option>
              <option value="3m">Last 3 Months</option>
              <option value="q2">Q2 2026</option>
              <option value="q1">Q1 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-neutral-200 rounded-xl px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-[#076CF2]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter analytics by category"
              className="text-xs font-medium text-[#0D0D0D] bg-transparent focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              <option value="All">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          label="Revenue Growth"
          value={formatPercentage(periodGrowthMetrics.revChange, 1, true)}
          trendLabel={
            periodGrowthMetrics.startLabel
              ? `${periodGrowthMetrics.startLabel}–${periodGrowthMetrics.endLabel}`
              : 'Period'
          }
          trendPositive={periodGrowthMetrics.revChange >= 0}
          subtext={formatCurrency(kpis.totalRevenue, currency, isCompact)}
          icon={DollarSign}
          accentColor="#050FD8"
        />
        <StatCard
          label="Expense Change"
          value={formatPercentage(periodGrowthMetrics.expChange, 1, true)}
          trendLabel="Cost trajectory"
          trendPositive={periodGrowthMetrics.expChange <= periodGrowthMetrics.revChange}
          subtext={formatCurrency(kpis.totalExpenses, currency, isCompact)}
          icon={TrendingUp}
          accentColor="#076CF2"
        />
        <StatCard
          label="Profit Growth"
          value={formatPercentage(periodGrowthMetrics.profitChange, 1, true)}
          trendLabel={`${formatPercentage(kpis.profitMargin, 1)} margin`}
          trendPositive={periodGrowthMetrics.profitChange >= 0}
          subtext={formatCurrency(kpis.netProfit, currency, isCompact)}
          icon={Percent}
          accentColor="#059669"
        />
        <StatCard
          label="Operating Cash"
          value={formatCurrency(kpis.cashFlow, currency, isCompact)}
          trendLabel={`${filteredRecords.length} entries`}
          trendPositive={kpis.cashFlow >= 0}
          subtext="Net liquidity"
          icon={Wallet}
          accentColor="#050FD8"
        />
      </div>

      {/* Row 1: Bar Chart + Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-6 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5"
        >
          <h2 className="font-heading text-base font-bold text-[#0D0D0D] mb-3">
            Monthly Revenue vs Expenses
          </h2>
          <div className="h-64 sm:h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySeries}
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
                  dataKey="revenue"
                  name="Revenue"
                  fill="#050FD8"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={preferences.chartAnimations}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#076CF2"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={preferences.chartAnimations}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-6 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5"
        >
          <h2 className="font-heading text-base font-bold text-[#0D0D0D] mb-3">
            Profitability & Cash Trend
          </h2>
          <div className="h-64 sm:h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlySeries}
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
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke="#050FD8"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#050FD8' }}
                  isAnimationActive={preferences.chartAnimations}
                />
                <Line
                  type="monotone"
                  dataKey="cashFlow"
                  name="Cash Flow"
                  stroke="#059669"
                  strokeWidth={2.2}
                  dot={{ r: 3, fill: '#059669' }}
                  isAnimationActive={preferences.chartAnimations}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Pie Chart + Donut Chart + Area Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Pie Chart */}
        <div className="lg:col-span-4 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
          <h2 className="font-heading text-base font-bold text-[#0D0D0D] mb-2">
            Revenue Mix (Pie)
          </h2>

          {revenueCategories.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-neutral-400">
              No revenue data
            </div>
          ) : (
            <>
              <div className="h-48 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueCategories}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      isAnimationActive={preferences.chartAnimations}
                    >
                      {revenueCategories.map((entry, index) => (
                        <Cell
                          key={entry.category}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => formatCurrency(val, currency)}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E5E5',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2 border-t border-neutral-100 pt-2.5">
                {revenueCategories.slice(0, 4).map((item, idx) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 truncate pr-2 text-neutral-600">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            CHART_COLORS[idx % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate">{item.category}</span>
                    </span>
                    <span className="font-mono-num font-semibold text-[#0D0D0D] shrink-0">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-4 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
          <h2 className="font-heading text-base font-bold text-[#0D0D0D] mb-2">
            Expense Mix (Donut)
          </h2>

          {expenseCategories.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-neutral-400">
              No expense data
            </div>
          ) : (
            <>
              <div className="h-48 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={2}
                      isAnimationActive={preferences.chartAnimations}
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell
                          key={entry.category}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => formatCurrency(val, currency)}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E5E5',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2 border-t border-neutral-100 pt-2.5">
                {expenseCategories.slice(0, 4).map((item, idx) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 truncate pr-2 text-neutral-600">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            CHART_COLORS[idx % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate">{item.category}</span>
                    </span>
                    <span className="font-mono-num font-semibold text-[#0D0D0D] shrink-0">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Area Chart */}
        <div className="md:col-span-2 lg:col-span-4 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-[#0D0D0D] mb-2">
              Cumulative Cash (Area)
            </h2>
            <div className="h-56 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlySeries}
                  margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="cumCashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#050FD8" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#050FD8" stopOpacity={0.0} />
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
                    dataKey="cumulativeCash"
                    name="Cumulative Cash"
                    stroke="#050FD8"
                    strokeWidth={2.2}
                    fill="url(#cumCashGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Ending Reserve</span>
            <span className="font-mono-num font-bold text-[#050FD8]">
              {formatCurrency(
                monthlySeries.length > 0
                  ? monthlySeries[monthlySeries.length - 1].cumulativeCash
                  : 0,
                currency
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown (Desktop Table + Mobile Cards) */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-neutral-200">
          <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
            Category Breakdown
          </h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#FAFAFA] text-[11px] font-semibold text-neutral-500">
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 text-right">Entries</th>
                <th className="py-2.5 px-4 text-right">Total Volume</th>
                <th className="py-2.5 px-4 text-right">Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[...revenueCategories, ...expenseCategories].map((cat) => (
                <tr key={cat.category} className="hover:bg-neutral-50">
                  <td className="py-3 px-4 font-medium text-[#0D0D0D]">
                    {cat.category}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-medium ${
                        cat.type === 'Income'
                          ? 'text-emerald-600'
                          : 'text-neutral-600'
                      }`}
                    >
                      {cat.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-num text-right text-neutral-500">
                    {cat.count}
                  </td>
                  <td className="py-3 px-4 font-mono-num font-semibold text-right text-[#0D0D0D]">
                    {formatCurrency(cat.amount, currency)}
                  </td>
                  <td className="py-3 px-4 font-mono-num text-right font-medium text-[#050FD8]">
                    {cat.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-neutral-100">
          {[...revenueCategories, ...expenseCategories].map((cat) => (
            <div
              key={cat.category}
              className="p-3.5 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0D0D0D] truncate">
                  {cat.category}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {cat.type} · {cat.count} entries
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono-num text-xs font-bold text-[#0D0D0D]">
                  {formatCurrency(cat.amount, currency)}
                </p>
                <p className="font-mono-num text-[11px] text-[#050FD8]">
                  {cat.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
