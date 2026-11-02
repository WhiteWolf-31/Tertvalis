import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  CheckSquare,
  Square,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
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
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatPercentage } from '../utils/calculations';

const SCENARIO_COLORS = ['#050FD8', '#059669', '#076CF2', '#D97706', '#7C3AED'];

export default function ScenarioComparison() {
  const {
    evaluatedScenarios,
    preferences,
    toggleScenarioComparison,
  } = useFinancial();

  const [metricView, setMetricView] = useState('profit');

  const currency = preferences.currencySymbol || '$';

  const comparedScenarios = useMemo(() => {
    const selected = evaluatedScenarios.filter((s) => s.selectedForComparison);
    if (selected.length >= 2) return selected;
    return evaluatedScenarios.slice(0, Math.min(3, evaluatedScenarios.length));
  }, [evaluatedScenarios]);

  const baselineScenario = comparedScenarios[0] || null;

  const aggregateComparisonData = useMemo(() => {
    return comparedScenarios.map((s) => ({
      name: s.name.replace(' Scenario', ''),
      Revenue: s.projectedRevenue,
      Expenses: s.projectedExpenses,
      'Net Profit': s.projectedProfit,
      'Cash Flow': s.projectedCashFlow,
    }));
  }, [comparedScenarios]);

  const trajectoryData = useMemo(() => {
    if (comparedScenarios.length === 0) return [];
    const maxMonths = Math.max(
      ...comparedScenarios.map((s) => s.monthlyProjections?.length || 0)
    );
    const points = [];
    for (let i = 0; i < maxMonths; i++) {
      const firstProj = comparedScenarios[0]?.monthlyProjections?.[i];
      const row = {
        label: firstProj ? firstProj.label : `M${i + 1}`,
      };
      comparedScenarios.forEach((scen) => {
        const m = scen.monthlyProjections?.[i];
        row[scen.name] = m ? m[metricView] : null;
      });
      points.push(row);
    }
    return points;
  }, [comparedScenarios, metricView]);

  const metricExtremes = useMemo(() => {
    const getHighLow = (field) => {
      if (comparedScenarios.length === 0) return { maxId: null, minId: null };
      let maxVal = -Infinity;
      let minVal = Infinity;
      let maxId = null;
      let minId = null;
      comparedScenarios.forEach((s) => {
        const val = Number(s[field]) || 0;
        if (val > maxVal) {
          maxVal = val;
          maxId = s.id;
        }
        if (val < minVal) {
          minVal = val;
          minId = s.id;
        }
      });
      return { maxId, minId, maxVal, minVal };
    };

    return {
      projectedRevenue: getHighLow('projectedRevenue'),
      projectedExpenses: getHighLow('projectedExpenses'),
      projectedProfit: getHighLow('projectedProfit'),
      projectedCashFlow: getHighLow('projectedCashFlow'),
      projectedMargin: getHighLow('projectedMargin'),
    };
  }, [comparedScenarios]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0D0D0D]">
            Scenario Comparison
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Suitability depends on business objectives and risk tolerance
          </p>
        </div>

        <Link
          to="/scenarios"
          className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-[#0D0D0D] border border-neutral-200 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Layers className="w-3.5 h-3.5 text-[#050FD8]" />
          <span>Manage Scenarios</span>
        </Link>
      </div>

      {/* Scenario Selector Bar */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-xs font-semibold text-[#0D0D0D]">
          Compared Scenarios (Ref: {baselineScenario?.name || 'Baseline'})
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {evaluatedScenarios.map((scen) => {
            const isSelected = comparedScenarios.some((c) => c.id === scen.id);
            return (
              <button
                key={scen.id}
                type="button"
                onClick={() => toggleScenarioComparison(scen.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#050FD8] text-white border-[#050FD8]'
                    : 'bg-[#FAFAFA] text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>{scen.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Scenario Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {comparedScenarios.map((scen, idx) => {
          const isRef = idx === 0;
          const profitDelta = baselineScenario
            ? scen.projectedProfit - baselineScenario.projectedProfit
            : 0;
          const profitDeltaPct =
            baselineScenario && baselineScenario.projectedProfit !== 0
              ? (profitDelta / Math.abs(baselineScenario.projectedProfit)) * 100
              : 0;

          return (
            <motion.div
              key={scen.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: idx * 0.03 }}
              className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{isRef ? 'Benchmark' : 'Compared'}</span>
                  <span className="font-mono-num">
                    +{scen.revenueGrowthRate}% Rev · +{scen.expenseGrowthRate}% Exp
                  </span>
                </div>

                <h3 className="font-heading text-lg font-bold text-[#0D0D0D] mt-1">
                  {scen.name}
                </h3>

                <div className="mt-3.5 space-y-2 pt-3 border-t border-neutral-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Revenue</span>
                    <span className="font-mono-num font-semibold text-[#0D0D0D]">
                      {formatCurrency(scen.projectedRevenue, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Expenses</span>
                    <span className="font-mono-num font-semibold text-[#0D0D0D]">
                      {formatCurrency(scen.projectedExpenses, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Net Profit</span>
                    <span
                      className={`font-mono-num font-bold ${
                        scen.projectedProfit >= 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(scen.projectedProfit, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Cash Flow</span>
                    <span className="font-mono-num font-semibold text-[#050FD8]">
                      {formatCurrency(scen.projectedCashFlow, currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-neutral-100 text-xs flex items-center justify-between">
                <span className="text-neutral-400">Profit vs Ref</span>
                {isRef ? (
                  <span className="font-mono-num text-neutral-500">Baseline</span>
                ) : (
                  <span
                    className={`font-mono-num font-semibold inline-flex items-center gap-0.5 ${
                      profitDelta >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {profitDelta >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {formatPercentage(profitDeltaPct, 1, true)}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
          <h2 className="font-heading text-base font-bold text-[#0D0D0D] mb-3">
            Aggregate Scenario Comparison
          </h2>
          <div className="h-64 sm:h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aggregateComparisonData}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis
                  dataKey="name"
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
                <Bar dataKey="Revenue" fill="#050FD8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#076CF2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Profit" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cash Flow" fill="#05F2AD" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
              Monthly Horizon Trajectory
            </h2>

            <div className="flex items-center p-1 bg-[#FAFAFA] border border-neutral-200 rounded-xl self-start sm:self-auto">
              {[
                { id: 'profit', label: 'Profit' },
                { id: 'revenue', label: 'Rev' },
                { id: 'expenses', label: 'Exp' },
                { id: 'cashFlow', label: 'Cash' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetricView(m.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    metricView === m.id
                      ? 'bg-white text-[#0D0D0D] shadow-xs'
                      : 'text-neutral-600 hover:text-[#0D0D0D]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trajectoryData}
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
                {comparedScenarios.map((scen, idx) => (
                  <Line
                    key={scen.id}
                    type="monotone"
                    dataKey={scen.name}
                    stroke={SCENARIO_COLORS[idx % SCENARIO_COLORS.length]}
                    strokeWidth={2.3}
                    dot={{ r: 3 }}
                    isAnimationActive={preferences.chartAnimations}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison Matrix (Desktop Table + Mobile Cards) */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-neutral-200">
          <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
            Comparison Matrix
          </h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#FAFAFA] text-[11px] font-semibold text-neutral-500">
                <th className="py-2.5 px-4">Scenario</th>
                <th className="py-2.5 px-4 text-right">Rev Growth</th>
                <th className="py-2.5 px-4 text-right">Exp Growth</th>
                <th className="py-2.5 px-4 text-right">Revenue</th>
                <th className="py-2.5 px-4 text-right">Expenses</th>
                <th className="py-2.5 px-4 text-right">Net Profit</th>
                <th className="py-2.5 px-4 text-right">Cash Flow</th>
                <th className="py-2.5 px-4 text-right">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {comparedScenarios.map((scen) => {
                const isMaxProfit =
                  metricExtremes.projectedProfit.maxId === scen.id;
                const isMinProfit =
                  metricExtremes.projectedProfit.minId === scen.id &&
                  comparedScenarios.length > 1;
                const isMaxRev =
                  metricExtremes.projectedRevenue.maxId === scen.id;

                return (
                  <tr key={scen.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 font-semibold text-[#0D0D0D]">
                      {scen.name}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-right text-[#050FD8]">
                      +{scen.revenueGrowthRate}%
                    </td>
                    <td className="py-3 px-4 font-mono-num text-right text-[#076CF2]">
                      +{scen.expenseGrowthRate}%
                    </td>
                    <td className="py-3 px-4 font-mono-num text-right">
                      <span className="font-semibold text-[#0D0D0D]">
                        {formatCurrency(scen.projectedRevenue, currency)}
                      </span>
                      {isMaxRev && (
                        <span className="block text-[10px] text-emerald-600">
                          Highest
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-right text-[#0D0D0D]">
                      {formatCurrency(scen.projectedExpenses, currency)}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-right">
                      <span
                        className={`font-bold ${
                          scen.projectedProfit >= 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(scen.projectedProfit, currency)}
                      </span>
                      {isMaxProfit && (
                        <span className="block text-[10px] text-emerald-600">
                          Highest
                        </span>
                      )}
                      {isMinProfit && !isMaxProfit && (
                        <span className="block text-[10px] text-amber-600">
                          Lowest
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-right font-semibold text-[#050FD8]">
                      {formatCurrency(scen.projectedCashFlow, currency)}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-right font-medium text-[#0D0D0D]">
                      {scen.projectedMargin}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-neutral-100">
          {comparedScenarios.map((scen) => (
            <div key={scen.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0D0D0D]">{scen.name}</span>
                <span className="text-[11px] font-mono-num text-neutral-500">
                  Margin: {scen.projectedMargin}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-neutral-400 block">Revenue</span>
                  <span className="font-mono-num font-semibold">
                    {formatCurrency(scen.projectedRevenue, currency, true)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block">Net Profit</span>
                  <span className="font-mono-num font-bold text-emerald-600">
                    {formatCurrency(scen.projectedProfit, currency, true)}
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
