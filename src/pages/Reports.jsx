import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  FileJson,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import {
  calculateKPIs,
  getMonthlySeries,
  formatCurrency,
  formatPercentage,
} from '../utils/calculations';
import {
  exportToCSV,
  exportToJSON,
  triggerPrintReport,
} from '../utils/reportExport';

const REPORT_TYPES = [
  { id: 'summary', name: 'Financial Summary Report' },
  { id: 'revenue', name: 'Revenue Report' },
  { id: 'expense', name: 'Expense Report' },
  { id: 'pnl', name: 'Profit & Loss Summary' },
  { id: 'cashflow', name: 'Cash Flow Report' },
  { id: 'budget', name: 'Budget Performance Report' },
  { id: 'scenarios', name: 'Scenario Comparison Report' },
];

export default function Reports() {
  const {
    records,
    budgets,
    budgetVarianceYearly,
    evaluatedScenarios,
    preferences,
    currentUser,
    showToast,
    logActivity,
  } = useFinancial();

  const [selectedReportId, setSelectedReportId] = useState('summary');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [exportSuccessBanner, setExportSuccessBanner] = useState('');

  const currency = preferences.currencySymbol || '$';

  const activeReportMeta = useMemo(
    () => REPORT_TYPES.find((r) => r.id === selectedReportId) || REPORT_TYPES[0],
    [selectedReportId]
  );

  const dateFilteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (startDate && r.date < startDate) return false;
        if (endDate && r.date > endDate) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [records, startDate, endDate]);

  const kpis = useMemo(
    () => calculateKPIs(dateFilteredRecords, budgets),
    [dateFilteredRecords, budgets]
  );

  const monthlySeries = useMemo(
    () => getMonthlySeries(dateFilteredRecords),
    [dateFilteredRecords]
  );

  const reportTable = useMemo(() => {
    if (selectedReportId === 'revenue') {
      const revRecords = dateFilteredRecords.filter((r) => r.type === 'Income');
      return {
        headers: ['ID', 'Date', 'Description', 'Category', 'Amount'],
        rows: revRecords.map((r) => [
          r.id,
          r.date,
          r.description,
          r.category,
          formatCurrency(r.amount, currency),
        ]),
        rawRowsForCSV: revRecords.map((r) => [
          r.id,
          r.date,
          r.description,
          r.category,
          r.amount,
        ]),
      };
    }

    if (selectedReportId === 'expense') {
      const expRecords = dateFilteredRecords.filter((r) => r.type === 'Expense');
      return {
        headers: ['ID', 'Date', 'Description', 'Category', 'Amount'],
        rows: expRecords.map((r) => [
          r.id,
          r.date,
          r.description,
          r.category,
          formatCurrency(r.amount, currency),
        ]),
        rawRowsForCSV: expRecords.map((r) => [
          r.id,
          r.date,
          r.description,
          r.category,
          r.amount,
        ]),
      };
    }

    if (selectedReportId === 'pnl' || selectedReportId === 'summary') {
      return {
        headers: ['Period', 'Entries', 'Revenue', 'Expenses', 'Net Profit', 'Margin'],
        rows: monthlySeries.map((m) => [
          m.label,
          m.transactions,
          formatCurrency(m.revenue, currency),
          formatCurrency(m.expenses, currency),
          formatCurrency(m.profit, currency),
          `${m.margin}%`,
        ]),
        rawRowsForCSV: monthlySeries.map((m) => [
          m.label,
          m.transactions,
          m.revenue,
          m.expenses,
          m.profit,
          m.margin,
        ]),
      };
    }

    if (selectedReportId === 'cashflow') {
      return {
        headers: ['Period', 'Inflows', 'Outflows', 'Operating Cash', 'Cumulative'],
        rows: monthlySeries.map((m) => [
          m.label,
          formatCurrency(m.revenue, currency),
          formatCurrency(m.expenses, currency),
          formatCurrency(m.cashFlow, currency),
          formatCurrency(m.cumulativeCash, currency),
        ]),
        rawRowsForCSV: monthlySeries.map((m) => [
          m.label,
          m.revenue,
          m.expenses,
          m.cashFlow,
          m.cumulativeCash,
        ]),
      };
    }

    if (selectedReportId === 'budget') {
      return {
        headers: ['Category', 'Type', 'Budget', 'Actual', 'Variance', 'Status'],
        rows: budgetVarianceYearly.items.map((b) => [
          b.category,
          b.type,
          formatCurrency(b.budgetAmount, currency),
          formatCurrency(b.actualAmount, currency),
          `${b.variancePercentage}%`,
          b.isFavourable ? 'Favourable' : 'Unfavourable',
        ]),
        rawRowsForCSV: budgetVarianceYearly.items.map((b) => [
          b.category,
          b.type,
          b.budgetAmount,
          b.actualAmount,
          b.variancePercentage,
          b.isFavourable ? 'Favourable' : 'Unfavourable',
        ]),
      };
    }

    if (selectedReportId === 'scenarios') {
      return {
        headers: ['Scenario', 'Horizon', 'Rev Growth', 'Revenue', 'Net Profit', 'Cash Flow'],
        rows: evaluatedScenarios.map((s) => [
          s.name,
          `${s.forecastMonths}m`,
          `+${s.revenueGrowthRate}%`,
          formatCurrency(s.projectedRevenue, currency),
          formatCurrency(s.projectedProfit, currency),
          formatCurrency(s.projectedCashFlow, currency),
        ]),
        rawRowsForCSV: evaluatedScenarios.map((s) => [
          s.name,
          s.forecastMonths,
          s.revenueGrowthRate,
          s.projectedRevenue,
          s.projectedProfit,
          s.projectedCashFlow,
        ]),
      };
    }

    return { headers: [], rows: [], rawRowsForCSV: [] };
  }, [
    selectedReportId,
    dateFilteredRecords,
    monthlySeries,
    budgetVarianceYearly,
    evaluatedScenarios,
    currency,
  ]);

  const handleDownloadCSV = () => {
    const filename = `Tertvalis_${selectedReportId}_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    exportToCSV(filename, reportTable.headers, reportTable.rawRowsForCSV);
    setExportSuccessBanner(`Downloaded ${filename}`);
    logActivity('Exported CSV Report', `Downloaded ${activeReportMeta.name}`, 'Reports');
    showToast('CSV Downloaded', filename, 'success');
  };

  const handleDownloadJSON = () => {
    const filename = `Tertvalis_${selectedReportId}_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    exportToJSON(filename, {
      reportTitle: activeReportMeta.name,
      generatedAt: new Date().toISOString(),
      organization: currentUser?.companyName || 'Tertvalis',
      dateRange: { startDate, endDate },
      summaryKPIs: kpis,
      headers: reportTable.headers,
      rows: reportTable.rawRowsForCSV,
    });
    setExportSuccessBanner(`Downloaded ${filename}`);
    logActivity('Exported JSON Report', `Downloaded ${activeReportMeta.name}`, 'Reports');
    showToast('JSON Downloaded', filename, 'success');
  };

  const handlePrint = () => {
    logActivity('Printed Report', activeReportMeta.name, 'Reports');
    triggerPrintReport();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 no-print">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0D0D0D]">
            Reports & Exports
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Preview and download live financial statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-[#050FD8] hover:bg-[#050FD8]/90 text-white text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="px-3 py-2 bg-white hover:bg-neutral-50 text-[#0D0D0D] border border-neutral-200 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-[#076CF2]" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-white hover:bg-neutral-50 text-[#0D0D0D] border border-neutral-200 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#0D0D0D]" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {exportSuccessBanner && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 no-print"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{exportSuccessBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportSuccessBanner('')}
            className="text-emerald-700 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Report Type Selector */}
        <div className="lg:col-span-3 bg-white border border-neutral-200/90 rounded-2xl p-3.5 space-y-1.5 no-print h-fit">
          <div className="px-2 py-1 text-xs font-semibold text-neutral-400">
            Report Templates
          </div>
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {REPORT_TYPES.map((rep) => {
              const active = rep.id === selectedReportId;
              return (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 shrink-0 lg:w-full cursor-pointer ${
                    active
                      ? 'bg-[#050FD8] text-white'
                      : 'bg-[#FAFAFA] text-[#0D0D0D] hover:bg-neutral-100'
                  }`}
                >
                  <FileSpreadsheet
                    className={`w-3.5 h-3.5 shrink-0 ${
                      active ? 'text-[#05F2AD]' : 'text-[#050FD8]'
                    }`}
                  />
                  <span className="whitespace-nowrap lg:whitespace-normal">
                    {rep.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Report Preview & Date Filter */}
        <div className="lg:col-span-9 min-w-0 space-y-4">
          {/* Date Range Filter Bar */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 no-print">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0D0D0D]">
              <Calendar className="w-4 h-4 text-[#050FD8]" />
              <span>Date Range</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Report start date"
                className="px-2.5 py-1.5 bg-[#FAFAFA] border border-neutral-200 rounded-lg font-mono-num"
              />
              <span className="text-neutral-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="Report end date"
                className="px-2.5 py-1.5 bg-[#FAFAFA] border border-neutral-200 rounded-lg font-mono-num"
              />
            </div>
          </div>

          {/* Printable Report Document Sheet */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 space-y-5 print-container">
            <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-[#050FD8]">
                  TERTVALIS STATEMENT
                </p>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[#0D0D0D] mt-0.5">
                  {activeReportMeta.name}
                </h2>
              </div>
              <div className="text-xs text-neutral-500 sm:text-right font-mono-num">
                <p className="font-semibold text-[#0D0D0D]">
                  {currentUser?.companyName || 'Vance Meridian Holdings'}
                </p>
                <p>
                  {startDate} — {endDate}
                </p>
              </div>
            </div>

            {/* Executive Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-[#FAFAFA] border border-neutral-200/80 rounded-xl">
                <span className="text-neutral-400 text-[11px] block">Revenue</span>
                <span className="font-mono-num text-sm font-bold text-[#0D0D0D] mt-0.5 block truncate">
                  {formatCurrency(kpis.totalRevenue, currency, true)}
                </span>
              </div>
              <div className="p-3 bg-[#FAFAFA] border border-neutral-200/80 rounded-xl">
                <span className="text-neutral-400 text-[11px] block">Expenses</span>
                <span className="font-mono-num text-sm font-bold text-[#0D0D0D] mt-0.5 block truncate">
                  {formatCurrency(kpis.totalExpenses, currency, true)}
                </span>
              </div>
              <div className="p-3 bg-[#FAFAFA] border border-neutral-200/80 rounded-xl">
                <span className="text-neutral-400 text-[11px] block">Net Profit</span>
                <span
                  className={`font-mono-num text-sm font-bold mt-0.5 block truncate ${
                    kpis.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(kpis.netProfit, currency, true)}
                </span>
              </div>
              <div className="p-3 bg-[#FAFAFA] border border-neutral-200/80 rounded-xl">
                <span className="text-neutral-400 text-[11px] block">Margin</span>
                <span className="font-mono-num text-sm font-bold text-[#050FD8] mt-0.5 block">
                  {formatPercentage(kpis.profitMargin, 1)}
                </span>
              </div>
            </div>

            {/* Report Data Table */}
            <div className="overflow-x-auto border border-neutral-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-neutral-200 text-[11px] font-semibold text-neutral-500">
                    {reportTable.headers.map((h) => (
                      <th key={h} className="py-2.5 px-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {reportTable.rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={reportTable.headers.length || 1}
                        className="py-8 text-center text-neutral-400"
                      >
                        No data in selected date range.
                      </td>
                    </tr>
                  ) : (
                    reportTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-neutral-50">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-2.5 px-3 whitespace-nowrap ${
                              typeof cell === 'string' &&
                              (cell.startsWith('$') ||
                                cell.startsWith('€') ||
                                cell.startsWith('£') ||
                                cell.endsWith('%'))
                                ? 'font-mono-num font-medium text-[#0D0D0D]'
                                : 'text-neutral-700'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
