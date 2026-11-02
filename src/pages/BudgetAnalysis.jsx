import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Edit3,
  Trash2,
  Calculator,
  Wallet,
  PieChart,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { useFinancial } from '../context/FinancialContext';
import { CATEGORIES, ALL_CATEGORIES } from '../utils/storage';
import {
  calculateBudgetVariance,
  formatCurrency,
  formatPercentage,
} from '../utils/calculations';
import { validateBudgetForm } from '../utils/validation';

const INITIAL_BUDGET_FORM = {
  category: 'Cloud & Data Infrastructure',
  type: 'Expense',
  period: 'Yearly',
  amount: '90000',
  monthlyAllocation: '15000',
  notes: '',
};

export default function BudgetAnalysis() {
  const {
    budgets,
    records,
    preferences,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useFinancial();

  const [periodMode, setPeriodMode] = useState('Yearly');
  const [typeTab, setTypeTab] = useState('All');

  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState(INITIAL_BUDGET_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const currency = preferences.currencySymbol || '$';
  const isCompact = preferences.numberFormat === 'compact';

  const varianceAnalysis = useMemo(
    () => calculateBudgetVariance(budgets, records, periodMode),
    [budgets, records, periodMode]
  );

  const displayedItems = useMemo(() => {
    if (typeTab === 'Expense') return varianceAnalysis.expenseItems;
    if (typeTab === 'Income') return varianceAnalysis.incomeItems;
    return varianceAnalysis.items;
  }, [varianceAnalysis, typeTab]);

  const chartData = useMemo(() => {
    return displayedItems.map((item) => ({
      name:
        item.category.length > 15
          ? `${item.category.slice(0, 14)}…`
          : item.category,
      Budget: item.budgetAmount,
      Actual: item.actualAmount,
    }));
  }, [displayedItems]);

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setFormData(INITIAL_BUDGET_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      type: budget.type || 'Expense',
      period: budget.period || 'Yearly',
      amount: String(budget.amount),
      monthlyAllocation: String(
        budget.monthlyAllocation || Math.round(Number(budget.amount) / 6)
      ),
      notes: budget.notes || '',
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleTypeSelect = (newType) => {
    const defaultCat = CATEGORIES[newType]?.[0] || ALL_CATEGORIES[0];
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: CATEGORIES[newType]?.includes(prev.category)
        ? prev.category
        : defaultCat,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateBudgetForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, formData);
    } else {
      addBudget(formData);
    }
    setFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteBudget(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0D0D0D]">
            Budget & Variance Analysis
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Variance = Actual − Budget · Expense &lt; 0 is Favourable · Income &gt; 0 is Favourable
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-[#FAFAFA] border border-neutral-200 rounded-xl">
            {['Yearly', 'Monthly'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPeriodMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  periodMode === mode
                    ? 'bg-[#050FD8] text-white'
                    : 'text-neutral-600 hover:text-[#0D0D0D]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#050FD8] hover:bg-[#050FD8]/90 text-white text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Budget</span>
          </button>
        </div>
      </div>

      {/* 4 Expense Budget KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          label={`Total Budget (${periodMode})`}
          value={formatCurrency(
            varianceAnalysis.summary.totalBudget,
            currency,
            isCompact
          )}
          trendLabel={`${varianceAnalysis.expenseItems.length} categories`}
          trendPositive={true}
          subtext="Allocated"
          icon={Calculator}
          accentColor="#050FD8"
        />
        <StatCard
          label={`Actual Spend (${periodMode})`}
          value={formatCurrency(
            varianceAnalysis.summary.actualSpending,
            currency,
            isCompact
          )}
          trendLabel={
            varianceAnalysis.summary.totalVariance <= 0 ? 'Under budget' : 'Over budget'
          }
          trendPositive={varianceAnalysis.summary.totalVariance <= 0}
          subtext="Ledger actuals"
          icon={TrendingDown}
          accentColor="#076CF2"
        />
        <StatCard
          label="Remaining Budget"
          value={formatCurrency(
            varianceAnalysis.summary.remainingBudget,
            currency,
            isCompact
          )}
          trendLabel={
            varianceAnalysis.summary.remainingBudget >= 0 ? 'Available' : 'Overrun'
          }
          trendPositive={varianceAnalysis.summary.remainingBudget >= 0}
          subtext="Balance"
          icon={Wallet}
          accentColor="#059669"
        />
        <StatCard
          label="Utilization"
          value={formatPercentage(varianceAnalysis.summary.utilization, 1)}
          trendLabel={`${formatPercentage(
            varianceAnalysis.summary.totalVariancePct,
            1,
            true
          )} var`}
          trendPositive={varianceAnalysis.summary.utilization <= 100}
          subtext="Used %"
          icon={PieChart}
          accentColor="#050FD8"
        />
      </div>

      {/* Budget vs Actual Chart + Utilization Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
              Budget vs Actual ({periodMode})
            </h2>

            <div className="flex items-center p-1 bg-[#FAFAFA] border border-neutral-200 rounded-xl self-start sm:self-auto">
              {['All', 'Expense', 'Income'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTypeTab(tab)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    typeTab === tab
                      ? 'bg-white text-[#0D0D0D] shadow-xs'
                      : 'text-neutral-600 hover:text-[#0D0D0D]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -10, bottom: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis
                  dataKey="name"
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
                <Bar
                  dataKey="Budget"
                  name="Budget"
                  fill="#050FD8"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={preferences.chartAnimations}
                />
                <Bar
                  dataKey="Actual"
                  name="Actual"
                  fill="#076CF2"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={preferences.chartAnimations}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Utilization Progress Bars */}
        <div className="lg:col-span-4 min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-[#0D0D0D] mb-3.5">
              Category Utilization
            </h2>

            <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
              {displayedItems.map((item) => {
                const barWidth = Math.min(100, Math.max(0, item.utilization));
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
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.35 }}
                        className={`h-full rounded-full ${
                          item.isFavourable ? 'bg-[#050FD8]' : 'bg-red-600'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span>Alert Threshold</span>
            <span className="font-mono-num font-semibold text-[#0D0D0D]">
              {preferences.budgetAlertThreshold}%
            </span>
          </div>
        </div>
      </div>

      {/* Variance Analysis (Desktop Table + Mobile Cards) */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-neutral-200">
          <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
            Variance Schedule ({periodMode})
          </h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#FAFAFA] text-[11px] font-semibold text-neutral-500">
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 text-right">Budget</th>
                <th className="py-2.5 px-4 text-right">Actual</th>
                <th className="py-2.5 px-4 text-right">Variance ($)</th>
                <th className="py-2.5 px-4 text-right">Variance (%)</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {displayedItems.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="py-3 px-4 font-medium text-[#0D0D0D]">
                    {item.category}
                  </td>
                  <td className="py-3 px-4 text-neutral-500">{item.type}</td>
                  <td className="py-3 px-4 font-mono-num text-right text-[#0D0D0D]">
                    {formatCurrency(item.budgetAmount, currency)}
                  </td>
                  <td className="py-3 px-4 font-mono-num text-right text-[#0D0D0D]">
                    {formatCurrency(item.actualAmount, currency)}
                  </td>
                  <td
                    className={`py-3 px-4 font-mono-num font-semibold text-right ${
                      item.isFavourable ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {item.variance > 0 ? '+' : ''}
                    {formatCurrency(item.variance, currency)}
                  </td>
                  <td
                    className={`py-3 px-4 font-mono-num font-semibold text-right ${
                      item.isFavourable ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {item.budgetAmount === 0
                      ? '0.0%'
                      : formatPercentage(item.variancePercentage, 1, true)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        item.isFavourable ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {item.isFavourable ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{item.isFavourable ? 'Favourable' : 'Unfavourable'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-neutral-500 hover:text-[#050FD8] hover:bg-neutral-100 rounded-md cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-neutral-100">
          {displayedItems.map((item) => (
            <div key={item.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-[#0D0D0D]">{item.category}</p>
                  <p className="text-[11px] text-neutral-500">{item.type}</p>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    item.isFavourable ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {item.isFavourable ? 'Favourable' : 'Unfavourable'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-neutral-400 block">Budget</span>
                  <span className="font-mono-num font-medium">
                    {formatCurrency(item.budgetAmount, currency, true)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block">Actual</span>
                  <span className="font-mono-num font-medium">
                    {formatCurrency(item.actualAmount, currency, true)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block">Variance</span>
                  <span
                    className={`font-mono-num font-semibold ${
                      item.isFavourable ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {formatPercentage(item.variancePercentage, 1, true)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="px-2.5 py-1 text-xs font-medium text-[#050FD8] bg-[#050FD8]/10 rounded-md cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Budget Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingBudget ? 'Edit Budget' : 'New Budget'}
        subtitle="Set yearly and monthly allocations"
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAFAFA] border border-neutral-200 rounded-lg">
            {['Expense', 'Income'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeSelect(t)}
                className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  formData.type === t
                    ? 'bg-[#050FD8] text-white'
                    : 'text-neutral-600 hover:text-[#0D0D0D]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((p) => ({ ...p, category: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg"
            >
              {(CATEGORIES[formData.type] || ALL_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Yearly Budget ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.amount}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((p) => ({
                    ...p,
                    amount: val,
                    monthlyAllocation: String(Math.round((Number(val) || 0) / 6)),
                  }));
                }}
                className="w-full px-3 py-2 text-sm font-mono-num bg-[#FAFAFA] border border-neutral-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Monthly ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.monthlyAllocation}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    monthlyAllocation: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm font-mono-num bg-[#FAFAFA] border border-neutral-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-[#050FD8] text-white rounded-lg hover:bg-[#050FD8]/90 cursor-pointer"
            >
              {editingBudget ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Budget"
        subtitle="Remove this budget allocation?"
        maxWidth="max-w-md"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
              Delete budget for <strong>{deleteTarget.category}</strong>?
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
