import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  ArrowUpDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import Modal from '../components/Modal';
import { useFinancial } from '../context/FinancialContext';
import { CATEGORIES, ALL_CATEGORIES } from '../utils/storage';
import { formatCurrency } from '../utils/calculations';
import { validateRecordForm } from '../utils/validation';

const INITIAL_FORM = {
  description: '',
  category: 'Enterprise SaaS Subscriptions',
  type: 'Income',
  amount: '',
  date: '2026-06-30',
  notes: '',
};

export default function FinancialData() {
  const {
    records,
    preferences,
    addRecord,
    updateRecord,
    deleteRecord,
  } = useFinancial();

  const [searchParams, setSearchParams] = useSearchParams();

  // Filter & Sort states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [viewRecord, setViewRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const currency = preferences.currencySymbol || '$';

  // Open new record modal if navigated with ?action=new
  useEffect(() => {
    const action = searchParams.get('action');
    const queryParam = searchParams.get('q');
    if (queryParam !== null) {
      setSearchTerm(queryParam);
    }
    if (action === 'new') {
      handleOpenAdd();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return records
      .filter((r) => {
        if (q) {
          const matchesDesc = r.description.toLowerCase().includes(q);
          const matchesCat = r.category.toLowerCase().includes(q);
          const matchesId = r.id.toLowerCase().includes(q);
          const matchesNotes = r.notes && r.notes.toLowerCase().includes(q);
          if (!matchesDesc && !matchesCat && !matchesId && !matchesNotes) {
            return false;
          }
        }
        if (categoryFilter !== 'All' && r.category !== categoryFilter) {
          return false;
        }
        if (typeFilter !== 'All' && r.type !== typeFilter) {
          return false;
        }
        if (startDate && r.date < startDate) {
          return false;
        }
        if (endDate && r.date > endDate) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
          comparison = a.date.localeCompare(b.date);
        } else if (sortBy === 'amount') {
          comparison = (Number(a.amount) || 0) - (Number(b.amount) || 0);
        } else if (sortBy === 'description') {
          comparison = a.description.localeCompare(b.description);
        } else if (sortBy === 'category') {
          comparison = a.category.localeCompare(b.category);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [records, searchTerm, categoryFilter, typeFilter, startDate, endDate, sortBy, sortOrder]);

  // Summary totals for current filtered set
  const filteredTotals = useMemo(() => {
    const income = filteredRecords
      .filter((r) => r.type === 'Income')
      .reduce((s, r) => s + Number(r.amount), 0);
    const expense = filteredRecords
      .filter((r) => r.type === 'Expense')
      .reduce((s, r) => s + Number(r.amount), 0);
    return {
      income,
      expense,
      net: income - expense,
    };
  }, [filteredRecords]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safePage, pageSize]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setTypeFilter('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      description: record.description,
      category: record.category,
      type: record.type,
      amount: String(record.amount),
      date: record.date,
      notes: record.notes || '',
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleTypeChangeInForm = (newType) => {
    const defaultCategory = CATEGORIES[newType]?.[0] || ALL_CATEGORIES[0];
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: CATEGORIES[newType]?.includes(prev.category)
        ? prev.category
        : defaultCategory,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const validation = validateRecordForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    if (editingRecord) {
      updateRecord(editingRecord.id, formData);
    } else {
      addRecord(formData);
    }
    setFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteRecord(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-neutral-200 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Module 02</span>
            <span>·</span>
            <span>Institutional Ledger & Transactions</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#0D0D0D] mt-1">
            Financial Data Management
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#050FD8] hover:bg-[#050FD8]/90 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Financial Record</span>
        </button>
      </div>

      {/* Filtered Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <span className="text-xs text-neutral-500">Matching Records</span>
          <p className="text-xl font-bold font-mono-num text-[#0D0D0D] mt-1">
            {filteredRecords.length}{' '}
            <span className="text-xs font-normal text-neutral-400">
              of {records.length}
            </span>
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <span className="text-xs text-neutral-500">Filtered Income</span>
          <p className="text-xl font-bold font-mono-num text-emerald-700 mt-1">
            +{formatCurrency(filteredTotals.income, currency)}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <span className="text-xs text-neutral-500">Filtered Expenses</span>
          <p className="text-xl font-bold font-mono-num text-[#0D0D0D] mt-1">
            -{formatCurrency(filteredTotals.expense, currency)}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <span className="text-xs text-neutral-500">Filtered Net Balance</span>
          <p
            className={`text-xl font-bold font-mono-num mt-1 ${
              filteredTotals.net >= 0 ? 'text-[#050FD8]' : 'text-red-600'
            }`}
          >
            {formatCurrency(filteredTotals.net, currency)}
          </p>
        </div>
      </div>

      {/* Search & Multi-Filter Control Panel */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search description, ID, category, notes..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by category"
              className="w-full px-3 py-2 text-xs bg-[#FAFAFA] border border-neutral-200 rounded-lg text-[#0D0D0D] focus:outline-none focus:border-[#050FD8]"
            >
              <option value="All">All Categories</option>
              <optgroup label="Income Categories">
                {CATEGORIES.Income.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Expense Categories">
                {CATEGORIES.Expense.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div className="md:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by transaction type"
              className="w-full px-3 py-2 text-xs bg-[#FAFAFA] border border-neutral-200 rounded-lg text-[#0D0D0D] focus:outline-none focus:border-[#050FD8]"
            >
              <option value="All">All Types</option>
              <option value="Income">Income Only</option>
              <option value="Expense">Expense Only</option>
            </select>
          </div>

          {/* Date Filters */}
          <div className="md:col-span-3 flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Start date filter"
              className="w-full px-2.5 py-2 text-xs bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8]"
            />
            <span className="text-xs text-neutral-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="End date filter"
              className="w-full px-2.5 py-2 text-xs bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8]"
            />
          </div>
        </div>

        {/* Sort & Reset Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Sort by:</span>
            {['date', 'amount', 'description', 'category'].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => handleSort(col)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize inline-flex items-center gap-1 transition-colors cursor-pointer ${
                  sortBy === col
                    ? 'bg-[#050FD8]/10 text-[#050FD8]'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>{col}</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-neutral-500 hover:text-[#0D0D0D] inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Desktop Data Table & Mobile Card List */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {paginatedRecords.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-9 h-9 text-neutral-400 mx-auto mb-2" />
            <h3 className="font-heading text-base font-bold text-[#0D0D0D]">
              No Matching Financial Records
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              No records match your current search or filter criteria. Try resetting the filters or add a new financial transaction.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 border border-neutral-200 rounded-lg text-xs font-medium text-[#0D0D0D] hover:bg-neutral-50 cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-2 bg-[#050FD8] text-white rounded-lg text-xs font-medium hover:bg-[#050FD8]/90 cursor-pointer"
              >
                Add Record
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#FAFAFA] text-[11px] font-semibold text-neutral-500">
                    <th className="py-3 px-4">Record ID</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {paginatedRecords.map((rec) => (
                    <motion.tr
                      key={rec.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-neutral-50/90 transition-colors ${
                        preferences.compactTables ? 'h-9' : 'h-12'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono-num text-neutral-500 whitespace-nowrap">
                        {rec.id}
                      </td>
                      <td className="py-2.5 px-4">
                        <p className="font-medium text-[#0D0D0D]">
                          {rec.description}
                        </p>
                        {rec.notes && (
                          <p className="text-[11px] text-neutral-400 truncate max-w-xs">
                            {rec.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-600 whitespace-nowrap">
                        {rec.category}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            rec.type === 'Income'
                              ? 'text-emerald-700'
                              : 'text-neutral-700'
                          }`}
                        >
                          {rec.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono-num text-neutral-500 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td
                        className={`py-2.5 px-4 font-mono-num font-semibold text-right whitespace-nowrap ${
                          rec.type === 'Income'
                            ? 'text-emerald-700'
                            : 'text-[#0D0D0D]'
                        }`}
                      >
                        {rec.type === 'Income' ? '+' : '-'}
                        {formatCurrency(rec.amount, currency)}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewRecord(rec)}
                            className="p-1.5 text-neutral-500 hover:text-[#050FD8] hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                            title="View Details"
                            aria-label={`View details for ${rec.description}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 text-neutral-500 hover:text-[#076CF2] hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                            title="Edit Record"
                            aria-label={`Edit ${rec.description}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(rec)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Record"
                            aria-label={`Delete ${rec.description}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-neutral-200">
              {paginatedRecords.map((rec) => (
                <div key={rec.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono-num text-neutral-400">
                        {rec.id} · {rec.date}
                      </span>
                      <h4 className="text-sm font-semibold text-[#0D0D0D] mt-0.5">
                        {rec.description}
                      </h4>
                    </div>
                    <span
                      className={`font-mono-num text-sm font-bold shrink-0 ${
                        rec.type === 'Income'
                          ? 'text-emerald-700'
                          : 'text-[#0D0D0D]'
                      }`}
                    >
                      {rec.type === 'Income' ? '+' : '-'}
                      {formatCurrency(rec.amount, currency)}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-500">
                    {rec.category} · {rec.type}
                  </div>

                  {rec.notes && (
                    <p className="text-xs text-neutral-600 bg-[#FAFAFA] p-2 rounded border border-neutral-100">
                      {rec.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setViewRecord(rec)}
                      className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rec)}
                      className="px-2.5 py-1.5 text-xs font-medium text-[#050FD8] bg-[#050FD8]/10 rounded-md cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(rec)}
                      className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-3 border-t border-neutral-200 bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-600">
                <span>
                  Showing {(safePage - 1) * pageSize + 1}–
                  {Math.min(safePage * pageSize, filteredRecords.length)} of{' '}
                  {filteredRecords.length}
                </span>
                <span>·</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Rows per page"
                  className="bg-white border border-neutral-200 rounded px-2 py-1 text-xs"
                >
                  <option value={8}>8 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-mono-num font-medium text-[#0D0D0D]">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Financial Record Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingRecord ? 'Edit Financial Record' : 'Add Financial Record'}
        subtitle={
          editingRecord
            ? `Updating ledger record ${editingRecord.id}`
            : 'Record a new institutional income or expense transaction'
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          {/* Transaction Type Segmented Control */}
          <div>
            <label className="block text-xs font-medium text-[#0D0D0D] mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAFAFA] border border-neutral-200 rounded-lg">
              {['Income', 'Expense'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChangeInForm(t)}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    formData.type === t
                      ? 'bg-[#050FD8] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-[#0D0D0D]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="e.g., Q3 Enterprise Platform Subscriptions"
              className="w-full px-3.5 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white"
            />
            {formErrors.description && (
              <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white"
              >
                {(CATEGORIES[formData.type] || ALL_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="50000"
                className="w-full px-3.5 py-2 text-sm font-mono-num bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white"
              />
              {formErrors.amount && (
                <p className="text-xs text-red-600 mt-1">{formErrors.amount}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full px-3.5 py-2 text-sm font-mono-num bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white"
            />
            {formErrors.date && (
              <p className="text-xs text-red-600 mt-1">{formErrors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
              Audit Notes & Reference
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Add contextual notes, contract references, or cost center codes..."
              className="w-full px-3.5 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setFormModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-[#050FD8] hover:bg-[#050FD8]/90 text-white rounded-lg transition-colors cursor-pointer"
            >
              {editingRecord ? 'Save Record Changes' : 'Add Financial Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Record Details Modal */}
      <Modal
        isOpen={Boolean(viewRecord)}
        onClose={() => setViewRecord(null)}
        title="Financial Record Details"
        subtitle={viewRecord ? `Ledger Reference: ${viewRecord.id}` : ''}
      >
        {viewRecord && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#FAFAFA] border border-neutral-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-neutral-500 block">Transaction Amount</span>
                <span
                  className={`text-2xl font-bold font-mono-num mt-0.5 block ${
                    viewRecord.type === 'Income'
                      ? 'text-emerald-700'
                      : 'text-[#0D0D0D]'
                  }`}
                >
                  {viewRecord.type === 'Income' ? '+' : '-'}
                  {formatCurrency(viewRecord.amount, currency)}
                </span>
              </div>
              <span className="text-xs font-semibold text-neutral-700">
                {viewRecord.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 border border-neutral-200 rounded-xl">
              <div>
                <span className="text-neutral-400 block">Record ID</span>
                <span className="font-mono-num font-semibold text-[#0D0D0D] mt-0.5 block">
                  {viewRecord.id}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block">Settlement Date</span>
                <span className="font-mono-num font-semibold text-[#0D0D0D] mt-0.5 block">
                  {viewRecord.date}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-400 block">Description</span>
                <span className="font-semibold text-[#0D0D0D] mt-0.5 block text-sm">
                  {viewRecord.description}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-400 block">Category</span>
                <span className="font-medium text-[#0D0D0D] mt-0.5 block">
                  {viewRecord.category}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-400 block">Audit Notes</span>
                <p className="text-neutral-700 mt-0.5 leading-relaxed">
                  {viewRecord.notes || 'No supplemental notes provided.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const rec = viewRecord;
                  setViewRecord(null);
                  handleOpenEdit(rec);
                }}
                className="px-4 py-2 text-xs font-medium text-[#050FD8] bg-[#050FD8]/10 rounded-lg hover:bg-[#050FD8]/15 cursor-pointer"
              >
                Edit Record
              </button>
              <button
                type="button"
                onClick={() => setViewRecord(null)}
                className="px-4 py-2 text-xs font-medium bg-[#0D0D0D] text-white rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Record Deletion"
        subtitle="This action will immediately recalculate all dependent KPIs, budgets, and forecasts."
        maxWidth="max-w-md"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  Delete "{deleteTarget.description}"?
                </p>
                <p className="mt-1">
                  ID: {deleteTarget.id} · Amount:{' '}
                  {formatCurrency(deleteTarget.amount, currency)} ({deleteTarget.type})
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
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
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
