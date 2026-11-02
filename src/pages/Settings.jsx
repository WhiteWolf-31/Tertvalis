import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sliders,
  Bell,
  Globe,
  RotateCcw,
  Download,
  Save,
  AlertTriangle,
} from 'lucide-react';
import Modal from '../components/Modal';
import { useFinancial } from '../context/FinancialContext';
import { exportToJSON } from '../utils/reportExport';

export default function Settings() {
  const {
    preferences,
    records,
    scenarios,
    budgets,
    assumptions,
    updatePreferences,
    resetWorkspaceData,
    showToast,
  } = useFinancial();

  const [formState, setFormState] = useState({ ...preferences });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleToggle = (key) => {
    setFormState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updatePreferences(formState);
  };

  const handleExportFullBackup = () => {
    exportToJSON('Tertvalis_Backup.json', {
      exportedAt: new Date().toISOString(),
      preferences: formState,
      assumptions,
      records,
      scenarios,
      budgets,
    });
    showToast('Backup Exported', 'Saved workspace JSON.', 'success');
  };

  const handleConfirmReset = () => {
    resetWorkspaceData();
    setResetConfirmOpen(false);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0D0D0D]">
            Settings
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Display, formatting & workspace controls
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-[#050FD8] hover:bg-[#050FD8]/90 text-white text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* 1. Number, Currency & Date Display Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center gap-2 pb-2.5 border-t-0 border-b border-neutral-100">
            <Globe className="w-4 h-4 text-[#050FD8]" />
            <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
              Currency & Formatting
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Currency
              </label>
              <select
                value={formState.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-xl"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (CA$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Number Display
              </label>
              <select
                value={formState.numberFormat}
                onChange={(e) => handleChange('numberFormat', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-xl"
              >
                <option value="standard">Standard ($1,245,000)</option>
                <option value="compact">Compact ($1.25M)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* 2. Appearance & Interaction Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-100">
            <Sliders className="w-4 h-4 text-[#076CF2]" />
            <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
              Appearance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-[#FAFAFA] border border-neutral-200 rounded-xl cursor-pointer">
              <span className="font-medium text-[#0D0D0D]">Compact Tables</span>
              <input
                type="checkbox"
                checked={formState.compactTables}
                onChange={() => handleToggle('compactTables')}
                className="rounded border-neutral-300 text-[#050FD8]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#FAFAFA] border border-neutral-200 rounded-xl cursor-pointer">
              <span className="font-medium text-[#0D0D0D]">Chart Animations</span>
              <input
                type="checkbox"
                checked={formState.chartAnimations}
                onChange={() => handleToggle('chartAnimations')}
                className="rounded border-neutral-300 text-[#050FD8]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#FAFAFA] border border-neutral-200 rounded-xl cursor-pointer">
              <span className="font-medium text-[#0D0D0D]">Reduced Motion</span>
              <input
                type="checkbox"
                checked={formState.reducedMotion}
                onChange={() => handleToggle('reducedMotion')}
                className="rounded border-neutral-300 text-[#050FD8]"
              />
            </label>
          </div>
        </motion.div>

        {/* 3. Notification & Governance Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-3.5"
        >
          <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-100">
            <Bell className="w-4 h-4 text-[#050FD8]" />
            <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
              Budget Alerts
            </h2>
          </div>

          <div className="text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-[#0D0D0D]">
                Warning Threshold
              </span>
              <span className="font-mono-num font-bold text-[#050FD8]">
                {formState.budgetAlertThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={formState.budgetAlertThreshold}
              onChange={(e) =>
                handleChange('budgetAlertThreshold', Number(e.target.value))
              }
              className="w-full accent-[#050FD8] cursor-pointer"
            />
          </div>
        </motion.div>
      </form>

      {/* 4. LocalStorage Demo Data Management */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-[#0D0D0D]">
            Demo Workspace Data
          </h2>
          <p className="text-xs text-neutral-500">
            Export JSON backup or restore default dataset
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportFullBackup}
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-[#0D0D0D] border border-neutral-200 text-xs font-medium rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#076CF2]" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-medium rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      <Modal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        title="Reset Demo Data"
        subtitle="Restore default records, budgets, and scenarios?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Restore default Tertvalis financial dataset?</span>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResetConfirmOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="px-4 py-2 text-xs font-medium bg-[#050FD8] text-white rounded-lg hover:bg-[#050FD8]/90 cursor-pointer"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
