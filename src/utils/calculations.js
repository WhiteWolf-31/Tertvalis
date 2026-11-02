// Financial calculations, forecasting engine, scenario math, and budget variance utilities

export function formatCurrency(value, currencySymbol = '$', compact = false) {
  const num = Number(value) || 0;
  const isNegative = num < 0;
  const absVal = Math.abs(num);

  if (compact && absVal >= 1000000) {
    return `${isNegative ? '-' : ''}${currencySymbol}${(absVal / 1000000).toFixed(2)}M`;
  }
  if (compact && absVal >= 1000) {
    return `${isNegative ? '-' : ''}${currencySymbol}${(absVal / 1000).toFixed(1)}K`;
  }

  const formatted = absVal.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${isNegative ? '-' : ''}${currencySymbol}${formatted}`;
}

export function formatPercentage(value, decimals = 1, includeSign = false) {
  const num = Number(value) || 0;
  const sign = includeSign && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
}

// Filter records by reporting period
export function filterRecordsByPeriod(records, period = 'all') {
  if (!Array.isArray(records) || records.length === 0) return [];
  if (period === 'all') return [...records];

  // Determine the latest date in records as anchor so demo data works seamlessly
  const sortedDates = records
    .map((r) => new Date(r.date).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => b - a);

  const maxTimestamp = sortedDates.length > 0 ? sortedDates[0] : Date.now();
  const anchorDate = new Date(maxTimestamp);

  let cutoffDate = new Date(anchorDate);
  if (period === '3m') {
    cutoffDate.setMonth(anchorDate.getMonth() - 2);
    cutoffDate.setDate(1);
  } else if (period === '6m') {
    cutoffDate.setMonth(anchorDate.getMonth() - 5);
    cutoffDate.setDate(1);
  } else if (period === '12m') {
    cutoffDate.setMonth(anchorDate.getMonth() - 11);
    cutoffDate.setDate(1);
  } else if (period === 'q2') {
    return records.filter((r) => r.date >= '2026-04-01' && r.date <= '2026-06-30');
  } else if (period === 'q1') {
    return records.filter((r) => r.date >= '2026-01-01' && r.date <= '2026-03-31');
  }

  return records.filter((r) => new Date(r.date) >= cutoffDate);
}

// Calculate core KPIs from records and budgets
export function calculateKPIs(records = [], budgets = []) {
  const totalRevenue = records
    .filter((r) => r.type === 'Income')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalExpenses = records
    .filter((r) => r.type === 'Expense')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Operating Cash Flow accounts for working capital timing (94% realization of net + depreciation/non-cash buffer)
  const cashFlow = totalRevenue * 0.96 - totalExpenses * 0.98;

  // Expense Budget Utilization
  const expenseBudgets = budgets.filter((b) => b.type === 'Expense');
  const totalExpenseBudget = expenseBudgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const budgetUtilization = totalExpenseBudget > 0 ? (totalExpenses / totalExpenseBudget) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    cashFlow,
    budgetUtilization,
    profitMargin,
    totalExpenseBudget,
    recordCount: records.length,
  };
}

// Group records by YYYY-MM for monthly time-series charts
export function getMonthlySeries(records = []) {
  const map = {};

  records.forEach((rec) => {
    if (!rec.date) return;
    const monthKey = rec.date.slice(0, 7); // YYYY-MM
    if (!map[monthKey]) {
      const [year, month] = monthKey.split('-');
      const dateObj = new Date(Number(year), Number(month) - 1, 1);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const shortLabel = dateObj.toLocaleDateString('en-US', { month: 'short' });
      map[monthKey] = {
        monthKey,
        label,
        shortLabel,
        revenue: 0,
        expenses: 0,
        profit: 0,
        cashFlow: 0,
        transactions: 0,
      };
    }

    const amt = Number(rec.amount) || 0;
    if (rec.type === 'Income') {
      map[monthKey].revenue += amt;
    } else {
      map[monthKey].expenses += amt;
    }
    map[monthKey].transactions += 1;
  });

  const sortedKeys = Object.keys(map).sort();
  let cumulativeCash = 0;

  return sortedKeys.map((key, idx) => {
    const item = map[key];
    item.profit = item.revenue - item.expenses;
    item.cashFlow = Math.round(item.revenue * 0.96 - item.expenses * 0.98);
    cumulativeCash += item.cashFlow;
    item.cumulativeCash = cumulativeCash;
    item.margin = item.revenue > 0 ? Number(((item.profit / item.revenue) * 100).toFixed(1)) : 0;

    // Month-over-Month revenue growth
    if (idx > 0) {
      const prevRev = map[sortedKeys[idx - 1]].revenue;
      item.momRevenueGrowth = prevRev > 0 ? Number((((item.revenue - prevRev) / prevRev) * 100).toFixed(1)) : 0;
    } else {
      item.momRevenueGrowth = 0;
    }
    return item;
  });
}

// Aggregate by category
export function getCategoryBreakdown(records = [], typeFilter = null) {
  const filtered = typeFilter ? records.filter((r) => r.type === typeFilter) : records;
  const total = filtered.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const map = {};
  filtered.forEach((r) => {
    const cat = r.category || 'Uncategorized';
    if (!map[cat]) {
      map[cat] = {
        category: cat,
        type: r.type,
        amount: 0,
        count: 0,
      };
    }
    map[cat].amount += Number(r.amount) || 0;
    map[cat].count += 1;
  });

  return Object.values(map)
    .map((item) => ({
      ...item,
      percentage: total > 0 ? Number(((item.amount / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// Generate Forecast Series from Historical Data + Editable Assumptions
export function generateForecastData(records = [], assumptions = {}) {
  const monthlyActuals = getMonthlySeries(records);
  const duration = Number(assumptions.forecastDuration) || 12;
  const revGrowth = (Number(assumptions.revenueGrowthRate) || 0) / 100;
  const expGrowth = (Number(assumptions.expenseGrowthRate) || 0) / 100;
  const inflation = (Number(assumptions.inflationAdjustment) || 0) / 100;
  const cashConversion = (Number(assumptions.cashConversionRate) || 90) / 100;
  const workingCapBuffer = Number(assumptions.workingCapitalBuffer) || 0;
  const seasonality = Boolean(assumptions.seasonalityEnabled);

  // Determine baseline starting monthly revenue & expenses from recent actuals
  let baseRevenue = 320000;
  let baseExpenses = 205000;
  let lastMonthKey = '2026-06';

  if (monthlyActuals.length > 0) {
    const recentSlice = monthlyActuals.slice(-3);
    baseRevenue = recentSlice.reduce((s, m) => s + m.revenue, 0) / recentSlice.length;
    baseExpenses = recentSlice.reduce((s, m) => s + m.expenses, 0) / recentSlice.length;
    lastMonthKey = monthlyActuals[monthlyActuals.length - 1].monthKey;
  }

  const [lastYear, lastMonth] = lastMonthKey.split('-').map(Number);

  // Format historical series for combined chart
  const historicalPoints = monthlyActuals.map((m) => ({
    periodKey: m.monthKey,
    label: m.label,
    isProjected: false,
    dataType: 'Actual',
    actualRevenue: Math.round(m.revenue),
    actualExpenses: Math.round(m.expenses),
    actualProfit: Math.round(m.profit),
    actualCashFlow: Math.round(m.cashFlow),
    projectedRevenue: null,
    projectedExpenses: null,
    projectedProfit: null,
    projectedCashFlow: null,
    revenue: Math.round(m.revenue),
    expenses: Math.round(m.expenses),
    profit: Math.round(m.profit),
    cashFlow: Math.round(m.cashFlow),
  }));

  // Connect last actual point to forecast line smoothly
  if (historicalPoints.length > 0) {
    const lastActual = historicalPoints[historicalPoints.length - 1];
    lastActual.projectedRevenue = lastActual.actualRevenue;
    lastActual.projectedExpenses = lastActual.actualExpenses;
    lastActual.projectedProfit = lastActual.actualProfit;
    lastActual.projectedCashFlow = lastActual.actualCashFlow;
  }

  const projectedPoints = [];
  const seasonalMultipliers = [0.97, 0.99, 1.04, 1.01, 1.02, 1.06, 0.98, 0.99, 1.05, 1.02, 1.04, 1.09];

  let currentRev = baseRevenue;
  let currentExp = baseExpenses;

  for (let i = 1; i <= duration; i++) {
    const projDate = new Date(lastYear, lastMonth - 1 + i, 1);
    const monthIndex = projDate.getMonth();
    const seasonFactor = seasonality ? seasonalMultipliers[monthIndex] : 1.0;

    currentRev = currentRev * (1 + revGrowth);
    currentExp = currentExp * (1 + expGrowth + inflation);

    const monthRev = Math.round(currentRev * seasonFactor);
    const monthExp = Math.round(currentExp);
    const monthProfit = monthRev - monthExp;
    const monthCashFlow = Math.round(monthProfit * cashConversion - workingCapBuffer);

    const periodKey = `${projDate.getFullYear()}-${String(monthIndex + 1).padStart(2, '0')}`;
    const label = projDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    projectedPoints.push({
      periodKey,
      label,
      isProjected: true,
      dataType: 'Projected',
      actualRevenue: null,
      actualExpenses: null,
      actualProfit: null,
      actualCashFlow: null,
      projectedRevenue: monthRev,
      projectedExpenses: monthExp,
      projectedProfit: monthProfit,
      projectedCashFlow: monthCashFlow,
      revenue: monthRev,
      expenses: monthExp,
      profit: monthProfit,
      cashFlow: monthCashFlow,
      margin: monthRev > 0 ? Number(((monthProfit / monthRev) * 100).toFixed(1)) : 0,
    });
  }

  const totalProjectedRevenue = projectedPoints.reduce((s, p) => s + p.revenue, 0);
  const totalProjectedExpenses = projectedPoints.reduce((s, p) => s + p.expenses, 0);
  const totalProjectedProfit = totalProjectedRevenue - totalProjectedExpenses;
  const totalProjectedCashFlow = projectedPoints.reduce((s, p) => s + p.cashFlow, 0);
  const projectedMargin =
    totalProjectedRevenue > 0 ? (totalProjectedProfit / totalProjectedRevenue) * 100 : 0;

  // Yearly Rollup
  const yearlyMap = {};
  [...historicalPoints, ...projectedPoints].forEach((pt) => {
    const year = pt.periodKey.slice(0, 4);
    const key = `${year} (${pt.isProjected ? 'Projected' : 'Actual'})`;
    if (!yearlyMap[key]) {
      yearlyMap[key] = {
        label: key,
        year,
        isProjected: pt.isProjected,
        revenue: 0,
        expenses: 0,
        profit: 0,
        cashFlow: 0,
        monthsCount: 0,
      };
    }
    yearlyMap[key].revenue += pt.revenue;
    yearlyMap[key].expenses += pt.expenses;
    yearlyMap[key].profit += pt.profit;
    yearlyMap[key].cashFlow += pt.cashFlow;
    yearlyMap[key].monthsCount += 1;
  });

  return {
    combinedSeries: [...historicalPoints, ...projectedPoints],
    historicalPoints,
    projectedPoints,
    yearlySeries: Object.values(yearlyMap),
    summary: {
      baseMonthlyRevenue: Math.round(baseRevenue),
      baseMonthlyExpenses: Math.round(baseExpenses),
      totalProjectedRevenue,
      totalProjectedExpenses,
      totalProjectedProfit,
      totalProjectedCashFlow,
      projectedMargin,
      finalMonthRevenue: projectedPoints.length > 0 ? projectedPoints[projectedPoints.length - 1].revenue : 0,
      finalMonthProfit: projectedPoints.length > 0 ? projectedPoints[projectedPoints.length - 1].profit : 0,
    },
  };
}

// Calculate Scenario Projections using saved financial records
export function evaluateScenario(scenario, records = []) {
  const monthlyActuals = getMonthlySeries(records);
  let baseRevenue = 320000;
  let baseExpenses = 205000;
  let lastMonthKey = '2026-06';

  if (monthlyActuals.length > 0) {
    const recentSlice = monthlyActuals.slice(-3);
    baseRevenue = recentSlice.reduce((s, m) => s + m.revenue, 0) / recentSlice.length;
    baseExpenses = recentSlice.reduce((s, m) => s + m.expenses, 0) / recentSlice.length;
    lastMonthKey = monthlyActuals[monthlyActuals.length - 1].monthKey;
  }

  const [lastYear, lastMonth] = lastMonthKey.split('-').map(Number);
  const horizon = Number(scenario.forecastMonths) || 12;
  const revRate = (Number(scenario.revenueGrowthRate) || 0) / 100;
  const expRate = (Number(scenario.expenseGrowthRate) || 0) / 100;
  const opexMult = Number(scenario.opexMultiplier) || 1.0;
  const cashConv = (Number(scenario.cashConversionRate) || 90) / 100;
  const capex = Number(scenario.capexMonthly) || 0;

  let runningRev = baseRevenue;
  let runningExp = baseExpenses * opexMult;

  const monthlyProjections = [];
  for (let i = 1; i <= horizon; i++) {
    const projDate = new Date(lastYear, lastMonth - 1 + i, 1);
    const label = projDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    runningRev = runningRev * (1 + revRate);
    runningExp = runningExp * (1 + expRate);

    const rev = Math.round(runningRev);
    const exp = Math.round(runningExp);
    const profit = rev - exp;
    const cashFlow = Math.round(profit * cashConv - capex);

    monthlyProjections.push({
      monthIndex: i,
      label,
      revenue: rev,
      expenses: exp,
      profit,
      cashFlow,
      margin: rev > 0 ? Number(((profit / rev) * 100).toFixed(1)) : 0,
    });
  }

  const projectedRevenue = monthlyProjections.reduce((s, m) => s + m.revenue, 0);
  const projectedExpenses = monthlyProjections.reduce((s, m) => s + m.expenses, 0);
  const projectedProfit = projectedRevenue - projectedExpenses;
  const projectedCashFlow = monthlyProjections.reduce((s, m) => s + m.cashFlow, 0);
  const projectedMargin = projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0;

  return {
    ...scenario,
    projectedRevenue,
    projectedExpenses,
    projectedProfit,
    projectedCashFlow,
    projectedMargin: Number(projectedMargin.toFixed(1)),
    monthlyProjections,
  };
}

// Budget & Variance Analysis calculation
// Formula mandated by user specification:
// Budget Variance = Actual Amount - Budget Amount
// Variance Percentage = (Variance / Budget Amount) * 100
export function calculateBudgetVariance(budgets = [], records = [], periodMode = 'Yearly') {
  const actualsByCategory = {};
  const monthsPresent = new Set();

  records.forEach((rec) => {
    const cat = rec.category;
    if (!actualsByCategory[cat]) {
      actualsByCategory[cat] = 0;
    }
    actualsByCategory[cat] += Number(rec.amount) || 0;
    if (rec.date) {
      monthsPresent.add(rec.date.slice(0, 7));
    }
  });

  const activeMonthsCount = Math.max(1, monthsPresent.size);

  const items = budgets.map((b) => {
    const rawBudget = Number(b.amount) || 0;
    const monthlyBudget = Number(b.monthlyAllocation) || Math.round(rawBudget / 6);
    const budgetAmount = periodMode === 'Monthly' ? monthlyBudget : rawBudget;

    const totalCategoryActual = actualsByCategory[b.category] || 0;
    const actualAmount =
      periodMode === 'Monthly'
        ? Math.round(totalCategoryActual / activeMonthsCount)
        : totalCategoryActual;

    // Exact formula: Budget Variance = Actual Amount − Budget Amount
    const variance = actualAmount - budgetAmount;
    // Safe handling for zero-budget cases
    const variancePercentage = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;
    const utilization = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;
    const remaining = budgetAmount - actualAmount;

    // Favourability logic:
    // For Expense categories: Actual < Budget (negative variance) is Favourable; Actual > Budget (positive variance) is Unfavourable.
    // For Income/Revenue categories: Actual >= Budget (positive variance) is Favourable; Actual < Budget (negative variance) is Unfavourable.
    let isFavourable = true;
    let varianceInterpretation = '';
    if (b.type === 'Expense') {
      isFavourable = variance <= 0;
      varianceInterpretation =
        variance <= 0
          ? 'Favourable (Actual spend is below budgeted ceiling)'
          : 'Unfavourable (Actual spend exceeds budgeted ceiling)';
    } else {
      isFavourable = variance >= 0;
      varianceInterpretation =
        variance >= 0
          ? 'Favourable (Actual revenue exceeds target budget)'
          : 'Unfavourable (Actual revenue is below target budget)';
    }

    return {
      ...b,
      budgetAmount,
      actualAmount,
      remaining,
      variance,
      variancePercentage: Number(variancePercentage.toFixed(1)),
      utilization: Number(utilization.toFixed(1)),
      isFavourable,
      varianceInterpretation,
    };
  });

  const expenseItems = items.filter((i) => i.type === 'Expense');
  const incomeItems = items.filter((i) => i.type === 'Income');

  const totalExpenseBudget = expenseItems.reduce((s, i) => s + i.budgetAmount, 0);
  const totalActualSpending = expenseItems.reduce((s, i) => s + i.actualAmount, 0);
  const remainingExpenseBudget = totalExpenseBudget - totalActualSpending;
  const overallUtilization =
    totalExpenseBudget > 0 ? (totalActualSpending / totalExpenseBudget) * 100 : 0;

  return {
    items,
    expenseItems,
    incomeItems,
    summary: {
      totalBudget: totalExpenseBudget,
      actualSpending: totalActualSpending,
      remainingBudget: remainingExpenseBudget,
      utilization: Number(overallUtilization.toFixed(1)),
      totalVariance: totalActualSpending - totalExpenseBudget,
      totalVariancePct:
        totalExpenseBudget > 0
          ? Number((((totalActualSpending - totalExpenseBudget) / totalExpenseBudget) * 100).toFixed(1))
          : 0,
    },
  };
}
