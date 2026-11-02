import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Sliders,
  RotateCcw,
  Save,
  Info,
  Calendar,
  DollarSign,
  Wallet,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import { useFinancial } from '../context/FinancialContext';
import { DEFAULT_FORECAST_ASSUMPTIONS } from '../utils/storage';
import {
  generateForecastData,
  formatCurrency,
  formatPercentage,
} from '../utils/calculations';

export default function Forecasting() {
  const {
    records,
    assumptions,
    preferences,
    updateAssumptions,
  } = useFinancial();

  const [draft, setDraft] = useState(() => ({ ...assumptions }));
  const [tableFilter, setTableFilter] = useState('all');

  const currency = preferences.currencySymbol || '$';
  const isCompact = preferences.numberFormat === 'compact';

  const liveForecast = useMemo(
    () => generateForecastData(records, draft),
    [records, draft]
  );

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAssumptions = (e) => {
    e.preventDefault();
    updateAssumptions(draft);
  };

  const handleResetDefaults = () => {
    setDraft({ ...DEFAULT_FORECAST_ASSUMPTIONS });
    updateAssumptions(DEFAULT_FORECAST_ASSUMPTIONS);
  };

  const tableRows = useMemo(() => {
    if (draft.viewGranularity === 'yearly') {
      return liveForecast.yearlySeries;
    }
    if (tableFilter === 'historical') {
      return liveForecast.historicalPoints;
    }
    if (tableFilter === 'projected') {
      return liveForecast.projectedPoints;
    }
    return liveForecast.combinedSeries;
  }, [liveForecast, draft.viewGranularity, tableFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0D0D0D]">
            Financial Forecasting
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Projections depend on historical data and configured assumptions
          </p>
        </div>

        {/* Period Horizon & Granularity Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-[#FAFAFA] border border-neutral-200 rounded-xl">
            {['monthly', 'yearly'].map((gran) => (
              <button
                key={gran}
                type="button"
                onClick={() => handleFieldChange('viewGranularity', gran)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                  draft.viewGranularity === gran
                    ? 'bg-[#050FD8] text-white'
                    : 'text-neutral-600 hover:text-[#0D0D0D]'
                }`}
              >
                {gran}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-neutral-200 rounded-xl px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-[#050FD8]" />
            <select
              value={draft.forecastDuration}
              onChange={(e) =>
                handleFieldChange('forecastDuration', Number(e.target.value))
              }
              aria-label="Select forecast horizon"
              className="text-xs font-medium text-[#0D0D0D] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
              <option value={18}>18 Months</option>
              <option value={24}>24 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Forecast KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          label={`Projected Revenue (${draft.forecastDuration}m)`}
          value={formatCurrency(
            liveForecast.summary.totalProjectedRevenue,
            currency,
            isCompact
          )}
          trendLabel={`+${draft.revenueGrowthRate}%/mo`}
          trendPositive={draft.revenueGrowthRate >= 0}
          subtext="Projected"
          icon={DollarSign}
          accentColor="#050FD8"
        />
        <StatCard
          label={`Projected Expenses (${draft.forecastDuration}m)`}
          value={formatCurrency(
            liveForecast.summary.totalProjectedExpenses,
            currency,
            isCompact
          )}
          trendLabel={`+${draft.expenseGrowthRate}%/mo`}
          trendPositive={draft.expenseGrowthRate <= draft.revenueGrowthRate}
          subtext={`+${draft.inflationAdjustment}% infl.`}
          icon={TrendingUp}
          accentColor="#076CF2"
        />
        <StatCard
          label={`Projected Profit (${draft.forecastDuration}m)`}
          value={formatCurrency(
            liveForecast.summary.totalProjectedProfit,
            currency,
            isCompact
          )}
          trendLabel={`${formatPercentage(liveForecast.summary.projectedMargin, 1)} margin`}
          trendPositive={liveForecast.summary.totalProjectedProfit >= 0}
          subtext="Net surplus"
          icon={Percent}
          accentColor="#059669"
        />
        <StatCard
          label={`Projected Cash Flow (${draft.forecastDuration}m)`}
          value={formatCurrency(
            liveForecast.summary.totalProjectedCashFlow,
            currency,
            isCompact
          )}
          trendLabel={`${draft.cashConversionRate}% conv.`}
          trendPositive={liveForecast.summary.totalProjectedCashFlow >= 0}
          subtext="Operating cash"
          icon={Wallet}
          accentColor="#050FD8"
        />
      </div>

      {/* Main Split: Left Editable Assumptions + Right Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Editable Forecast Assumptions */}
        <form
          onSubmit={handleSaveAssumptions}
          className="lg:col-span-4 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#050FD8]" />
              <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
                Assumptions
              </h2>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-neutral-500 hover:text-[#0D0D0D] inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Expected Revenue Growth Rate */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="rev-growth-slider" className="font-medium text-[#0D0D0D]">
                Revenue Growth (%/mo)
              </label>
              <span className="font-mono-num font-bold text-[#050FD8]">
                {draft.revenueGrowthRate}%
              </span>
            </div>
            <input
              id="rev-growth-slider"
              type="range"
              min="-5"
              max="15"
              step="0.1"
              value={draft.revenueGrowthRate}
              onChange={(e) =>
                handleFieldChange('revenueGrowthRate', Number(e.target.value))
              }
              className="w-full accent-[#050FD8] cursor-pointer"
            />
          </div>

          {/* Expected Expense Growth Rate */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="exp-growth-slider" className="font-medium text-[#0D0D0D]">
                Expense Growth (%/mo)
              </label>
              <span className="font-mono-num font-bold text-[#076CF2]">
                {draft.expenseGrowthRate}%
              </span>
            </div>
            <input
              id="exp-growth-slider"
              type="range"
              min="-5"
              max="12"
              step="0.1"
              value={draft.expenseGrowthRate}
              onChange={(e) =>
                handleFieldChange('expenseGrowthRate', Number(e.target.value))
              }
              className="w-full accent-[#076CF2] cursor-pointer"
            />
          </div>

          {/* Cost Inflation Buffer */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="inflation-slider" className="font-medium text-[#0D0D0D]">
                Cost Inflation (%)
              </label>
              <span className="font-mono-num font-semibold text-neutral-700">
                {draft.inflationAdjustment}%
              </span>
            </div>
            <input
              id="inflation-slider"
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={draft.inflationAdjustment}
              onChange={(e) =>
                handleFieldChange('inflationAdjustment', Number(e.target.value))
              }
              className="w-full accent-[#050FD8] cursor-pointer"
            />
          </div>

          {/* Cash Flow Conversion */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="cash-conv-slider" className="font-medium text-[#0D0D0D]">
                Cash Conversion (%)
              </label>
              <span className="font-mono-num font-semibold text-emerald-600">
                {draft.cashConversionRate}%
              </span>
            </div>
            <input
              id="cash-conv-slider"
              type="range"
              min="60"
              max="100"
              step="1"
              value={draft.cashConversionRate}
              onChange={(e) =>
                handleFieldChange('cashConversionRate', Number(e.target.value))
              }
              className="w-full accent-[#050FD8] cursor-pointer"
            />
          </div>

          {/* Working Capital Reserve */}
          <div>
            <label
              htmlFor="capex-buffer"
              className="block text-xs font-medium text-[#0D0D0D] mb-1"
            >
              Monthly Reserve ({currency})
            </label>
            <input
              id="capex-buffer"
              type="number"
              min="0"
              step="1000"
              value={draft.workingCapitalBuffer}
              onChange={(e) =>
                handleFieldChange('workingCapitalBuffer', Number(e.target.value))
              }
              className="w-full px-3 py-2 text-xs font-mono-num bg-[#FAFAFA] border border-neutral-200 rounded-xl focus:outline-none focus:border-[#050FD8]"
            />
          </div>

          {/* Seasonality Toggle */}
          <label className="flex items-center justify-between text-xs cursor-pointer select-none p-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-xl">
            <span className="font-medium text-[#0D0D0D]">Quarterly Seasonality</span>
            <input
              type="checkbox"
              checked={draft.seasonalityEnabled}
              onChange={(e) =>
                handleFieldChange('seasonalityEnabled', e.target.checked)
              }
              className="rounded border-neutral-300 text-[#050FD8]"
            />
          </label>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#050FD8] hover:bg-[#050FD8]/90 text-white text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Assumptions</span>
          </button>
        </form>

        {/* Right: Forecast Charts */}
        <div className="lg:col-span-8 min-w-0 space-y-5">
          {/* Chart 1: Historical vs Projected */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 min-w-0"
          >
            <div className="mb-3">
              <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
                Historical vs Projected Trajectory
              </h2>
              <p className="text-xs text-neutral-500">
                Solid: Actuals · Dashed: Projected
              </p>
            </div>

            <div className="h-64 sm:h-72 w-full min-w-0">
              {draft.viewGranularity === 'yearly' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={liveForecast.yearlySeries}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis
                      dataKey="label"
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
                    <Bar dataKey="revenue" name="Revenue" fill="#050FD8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#076CF2" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Net Profit" fill="#05F2AD" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={liveForecast.combinedSeries}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#737373' }}
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
                      formatter={(val) =>
                        val !== null ? formatCurrency(val, currency) : null
                      }
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
                      dataKey="actualRevenue"
                      name="Actual Rev"
                      stroke="#050FD8"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#050FD8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedRevenue"
                      name="Proj. Rev"
                      stroke="#050FD8"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={{ r: 2.5, fill: '#050FD8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actualExpenses"
                      name="Actual Exp"
                      stroke="#076CF2"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#076CF2' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedExpenses"
                      name="Proj. Exp"
                      stroke="#076CF2"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 2.5, fill: '#076CF2' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Chart 2: Profit & Cash Flow Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 min-w-0"
          >
            <div className="mb-3">
              <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
                Projected Profit & Cash Flow
              </h2>
            </div>

            <div className="h-56 sm:h-60 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={liveForecast.projectedPoints}
                  margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#737373' }}
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
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Projected Profit"
                    stroke="#050FD8"
                    fill="#050FD8"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="cashFlow"
                    name="Projected Cash Flow"
                    stroke="#059669"
                    strokeWidth={2.2}
                    dot={{ r: 3, fill: '#059669' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Forecast Schedule (Desktop Table + Mobile Cards) */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
            Forecast Schedule
          </h2>

          {draft.viewGranularity === 'monthly' && (
            <div className="flex items-center p-1 bg-[#FAFAFA] border border-neutral-200 rounded-xl self-start sm:self-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'historical', label: 'Actuals' },
                { id: 'projected', label: 'Projected' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTableFilter(tab.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    tableFilter === tab.id
                      ? 'bg-white text-[#0D0D0D] shadow-xs'
                      : 'text-neutral-600 hover:text-[#0D0D0D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#FAFAFA] text-[11px] font-semibold text-neutral-500">
                <th className="py-2.5 px-4">Period</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 text-right">Revenue</th>
                <th className="py-2.5 px-4 text-right">Expenses</th>
                <th className="py-2.5 px-4 text-right">Net Profit</th>
                <th className="py-2.5 px-4 text-right">Cash Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {tableRows.map((row) => (
                <tr
                  key={row.periodKey || row.label}
                  className={`hover:bg-neutral-50 ${
                    row.isProjected ? 'bg-[#050FD8]/[0.015]' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 font-medium text-[#0D0D0D]">
                    {row.label}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`font-medium ${
                        row.isProjected ? 'text-[#050FD8]' : 'text-neutral-500'
                      }`}
                    >
                      {row.isProjected ? 'Projected' : 'Actual'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono-num text-right text-[#0D0D0D]">
                    {formatCurrency(row.revenue, currency)}
                  </td>
                  <td className="py-2.5 px-4 font-mono-num text-right text-neutral-600">
                    {formatCurrency(row.expenses, currency)}
                  </td>
                  <td
                    className={`py-2.5 px-4 font-mono-num font-semibold text-right ${
                      row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(row.profit, currency)}
                  </td>
                  <td className="py-2.5 px-4 font-mono-num text-right text-[#0D0D0D]">
                    {formatCurrency(row.cashFlow, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-neutral-100">
          {tableRows.map((row) => (
            <div key={row.periodKey || row.label} className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0D0D0D]">{row.label}</span>
                <span
                  className={`text-[11px] font-medium ${
                    row.isProjected ? 'text-[#050FD8]' : 'text-neutral-500'
                  }`}
                >
                  {row.isProjected ? 'Projected' : 'Actual'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-400 text-[11px] block">Revenue</span>
                  <span className="font-mono-num font-medium">
                    {formatCurrency(row.revenue, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[11px] block">Net Profit</span>
                  <span
                    className={`font-mono-num font-semibold ${
                      row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(row.profit, currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
