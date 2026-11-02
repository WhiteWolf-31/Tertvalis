import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  GitCompare,
  CheckSquare,
  Square,
  AlertTriangle,
  Sliders,
} from 'lucide-react';
import Modal from '../components/Modal';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatPercentage } from '../utils/calculations';
import { validateScenarioForm } from '../utils/validation';

const INITIAL_SCENARIO_FORM = {
  name: '',
  description: '',
  status: 'Active',
  type: 'Custom',
  revenueGrowthRate: 5.0,
  expenseGrowthRate: 2.5,
  forecastMonths: 12,
  cashConversionRate: 92,
  opexMultiplier: 1.0,
  capexMonthly: 15000,
  selectedForComparison: true,
};

export default function ScenarioPlanning() {
  const {
    evaluatedScenarios,
    preferences,
    addScenario,
    updateScenario,
    deleteScenario,
    toggleScenarioComparison,
  } = useFinancial();

  const navigate = useNavigate();
  const currency = preferences.currencySymbol || '$';

  const [formOpen, setFormOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [formData, setFormData] = useState(INITIAL_SCENARIO_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [detailScenario, setDetailScenario] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const selectedCount = evaluatedScenarios.filter(
    (s) => s.selectedForComparison
  ).length;

  const handleOpenCreate = () => {
    setEditingScenario(null);
    setFormData(INITIAL_SCENARIO_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleOpenEdit = (scen) => {
    setEditingScenario(scen);
    setFormData({
      name: scen.name,
      description: scen.description,
      status: scen.status || 'Active',
      type: scen.type || 'Custom',
      revenueGrowthRate: scen.revenueGrowthRate,
      expenseGrowthRate: scen.expenseGrowthRate,
      forecastMonths: scen.forecastMonths || 12,
      cashConversionRate: scen.cashConversionRate || 92,
      opexMultiplier: scen.opexMultiplier || 1.0,
      capexMonthly: scen.capexMonthly || 14000,
      selectedForComparison: Boolean(scen.selectedForComparison),
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateScenarioForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    if (editingScenario) {
      updateScenario(editingScenario.id, formData);
    } else {
      addScenario(formData);
    }
    setFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteScenario(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleQuickAdjust = (scen, field, delta) => {
    const currentVal = Number(scen[field]) || 0;
    const nextVal = Number((currentVal + delta).toFixed(1));
    updateScenario(scen.id, {
      ...scen,
      [field]: nextVal,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0D0D0D]">
            Scenario Planning
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Model and stress-test financial growth assumptions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/comparison')}
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-[#0D0D0D] border border-neutral-200 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5 text-[#076CF2]" />
            <span>Compare ({selectedCount})</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#050FD8] hover:bg-[#050FD8]/90 text-white text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Scenario</span>
          </button>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {evaluatedScenarios.map((scen, idx) => (
          <motion.div
            key={scen.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: idx * 0.03 }}
            className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md ${
              scen.selectedForComparison
                ? 'border-[#050FD8]/40'
                : 'border-neutral-200/90'
            }`}
          >
            <div>
              {/* Top Meta & Compare Checkbox */}
              <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 mb-2">
                <span>
                  {scen.status} · {scen.forecastMonths}m
                </span>
                <button
                  type="button"
                  onClick={() => toggleScenarioComparison(scen.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#050FD8] hover:underline cursor-pointer"
                >
                  {scen.selectedForComparison ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#050FD8]" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                  <span>Compare</span>
                </button>
              </div>

              <h2 className="font-heading text-lg font-bold text-[#0D0D0D]">
                {scen.name}
              </h2>
              <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                {scen.description}
              </p>

              {/* Interactive Steppers */}
              <div className="mt-4 p-3 bg-[#FAFAFA] border border-neutral-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-[#050FD8]" />
                    Rev Growth
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickAdjust(scen, 'revenueGrowthRate', -0.5)
                      }
                      className="w-6 h-6 rounded-md bg-white border border-neutral-200 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono-num font-bold text-[#050FD8] min-w-[44px] text-center">
                      +{scen.revenueGrowthRate}%
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickAdjust(scen, 'revenueGrowthRate', 0.5)
                      }
                      className="w-6 h-6 rounded-md bg-white border border-neutral-200 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-[#076CF2]" />
                    Exp Growth
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickAdjust(scen, 'expenseGrowthRate', -0.5)
                      }
                      className="w-6 h-6 rounded-md bg-white border border-neutral-200 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono-num font-bold text-[#076CF2] min-w-[44px] text-center">
                      +{scen.expenseGrowthRate}%
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickAdjust(scen, 'expenseGrowthRate', 0.5)
                      }
                      className="w-6 h-6 rounded-md bg-white border border-neutral-200 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Projections Grid */}
              <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 border border-neutral-100 bg-[#FAFAFA]/50 rounded-xl">
                  <span className="text-neutral-400 text-[11px] block">Revenue</span>
                  <span className="font-mono-num text-sm font-bold text-[#0D0D0D] mt-0.5 block truncate">
                    {formatCurrency(scen.projectedRevenue, currency, true)}
                  </span>
                </div>
                <div className="p-2.5 border border-neutral-100 bg-[#FAFAFA]/50 rounded-xl">
                  <span className="text-neutral-400 text-[11px] block">Expenses</span>
                  <span className="font-mono-num text-sm font-bold text-[#0D0D0D] mt-0.5 block truncate">
                    {formatCurrency(scen.projectedExpenses, currency, true)}
                  </span>
                </div>
                <div className="p-2.5 border border-neutral-100 bg-[#FAFAFA]/50 rounded-xl">
                  <span className="text-neutral-400 text-[11px] block">Net Profit</span>
                  <span
                    className={`font-mono-num text-sm font-bold mt-0.5 block truncate ${
                      scen.projectedProfit >= 0
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(scen.projectedProfit, currency, true)}
                  </span>
                </div>
                <div className="p-2.5 border border-neutral-100 bg-[#FAFAFA]/50 rounded-xl">
                  <span className="text-neutral-400 text-[11px] block">Cash Flow</span>
                  <span className="font-mono-num text-sm font-bold text-[#050FD8] mt-0.5 block truncate">
                    {formatCurrency(scen.projectedCashFlow, currency, true)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-neutral-400 font-mono-num">
                Margin: {formatPercentage(scen.projectedMargin, 1)}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDetailScenario(scen)}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(scen)}
                  className="px-2.5 py-1.5 text-xs font-medium text-[#050FD8] hover:bg-[#050FD8]/10 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(scen)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Scenario"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create / Edit Scenario Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingScenario ? 'Edit Scenario' : 'New Scenario'}
        subtitle="Configure growth assumptions and horizon"
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Scenario Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g., Q4 Expansion"
                className="w-full px-3.5 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8]"
              />
              {formErrors.name && (
                <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, status: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Stress Test">Stress Test</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Brief summary of assumptions..."
              className="w-full px-3.5 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8]"
            />
            {formErrors.description && (
              <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Revenue Growth (%/mo)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.revenueGrowthRate}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    revenueGrowthRate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm font-mono-num bg-[#FAFAFA] border border-neutral-200 rounded-lg"
              />
              {formErrors.revenueGrowthRate && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.revenueGrowthRate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Expense Growth (%/mo)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.expenseGrowthRate}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    expenseGrowthRate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm font-mono-num bg-[#FAFAFA] border border-neutral-200 rounded-lg"
              />
              {formErrors.expenseGrowthRate && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.expenseGrowthRate}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Horizon
              </label>
              <select
                value={formData.forecastMonths}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    forecastMonths: Number(e.target.value),
                  }))
                }
                className="w-full px-2.5 py-2 text-sm font-mono-num bg-[#FAFAFA] border border-neutral-200 rounded-lg"
              >
                <option value={6}>6m</option>
                <option value={12}>12m</option>
                <option value={18}>18m</option>
                <option value={24}>24m</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Cash Conv. (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={formData.cashConversionRate}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    cashConversionRate: e.target.value,
                  }))
                }
                className="w-full px-2.5 py-2 text-sm font-mono-num bg-[#FAFAFA] border border-neutral-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                CapEx ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.capexMonthly}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    capexMonthly: e.target.value,
                  }))
                }
                className="w-full px-2.5 py-2 text-sm font-mono-num bg-[#FAFAFA] border border-neutral-200 rounded-lg"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.selectedForComparison}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  selectedForComparison: e.target.checked,
                }))
              }
              className="rounded border-neutral-300 text-[#050FD8]"
            />
            <span>Include in Scenario Comparison</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-[#050FD8] hover:bg-[#050FD8]/90 text-white rounded-lg cursor-pointer"
            >
              {editingScenario ? 'Save Changes' : 'Create Scenario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Scenario Schedule Details Modal */}
      <Modal
        isOpen={Boolean(detailScenario)}
        onClose={() => setDetailScenario(null)}
        title={detailScenario ? detailScenario.name : ''}
        subtitle={
          detailScenario
            ? `+${detailScenario.revenueGrowthRate}%/mo Rev · +${detailScenario.expenseGrowthRate}%/mo Exp`
            : ''
        }
        maxWidth="max-w-2xl"
      >
        {detailScenario && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Revenue</span>
                <span className="font-mono-num font-bold text-[#0D0D0D] mt-0.5 block">
                  {formatCurrency(detailScenario.projectedRevenue, currency, true)}
                </span>
              </div>
              <div className="p-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Expenses</span>
                <span className="font-mono-num font-bold text-[#0D0D0D] mt-0.5 block">
                  {formatCurrency(detailScenario.projectedExpenses, currency, true)}
                </span>
              </div>
              <div className="p-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Net Profit</span>
                <span className="font-mono-num font-bold text-emerald-600 mt-0.5 block">
                  {formatCurrency(detailScenario.projectedProfit, currency, true)}
                </span>
              </div>
              <div className="p-2.5 bg-[#FAFAFA] border border-neutral-200 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Cash Flow</span>
                <span className="font-mono-num font-bold text-[#050FD8] mt-0.5 block">
                  {formatCurrency(detailScenario.projectedCashFlow, currency, true)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-xl max-h-72">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAFAFA] border-b border-neutral-200 text-[11px] text-neutral-500 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Month</th>
                    <th className="py-2 px-3 text-right">Revenue</th>
                    <th className="py-2 px-3 text-right">Expenses</th>
                    <th className="py-2 px-3 text-right">Net Profit</th>
                    <th className="py-2 px-3 text-right">Cash Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {detailScenario.monthlyProjections.map((m) => (
                    <tr key={m.monthIndex} className="hover:bg-neutral-50">
                      <td className="py-2 px-3 font-medium text-[#0D0D0D]">
                        {m.label}
                      </td>
                      <td className="py-2 px-3 font-mono-num text-right">
                        {formatCurrency(m.revenue, currency)}
                      </td>
                      <td className="py-2 px-3 font-mono-num text-right text-neutral-600">
                        {formatCurrency(m.expenses, currency)}
                      </td>
                      <td className="py-2 px-3 font-mono-num font-semibold text-right text-emerald-600">
                        {formatCurrency(m.profit, currency)}
                      </td>
                      <td className="py-2 px-3 font-mono-num text-right text-[#050FD8]">
                        {formatCurrency(m.cashFlow, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDetailScenario(null)}
                className="px-4 py-2 text-xs font-medium bg-[#0D0D0D] text-white rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Scenario Confirmation */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Scenario"
        subtitle="Remove this scenario from workspace?"
        maxWidth="max-w-md"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>Delete "{deleteTarget.name}"?</span>
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
                className="px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
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
