// LocalStorage keys for Tertvalis
export const STORAGE_KEYS = {
  USERS: 'tertvalis_demo_users_v1',
  SESSION: 'tertvalis_active_session_v1',
  RECORDS: 'tertvalis_financial_records_v1',
  ASSUMPTIONS: 'tertvalis_forecast_assumptions_v1',
  SCENARIOS: 'tertvalis_scenarios_v1',
  BUDGETS: 'tertvalis_budgets_v1',
  PREFERENCES: 'tertvalis_preferences_v1',
  NOTIFICATIONS: 'tertvalis_notifications_v1',
  ACTIVITY: 'tertvalis_activity_log_v1',
};

export const CATEGORIES = {
  Income: [
    'Enterprise SaaS Subscriptions',
    'Annual Platform Licenses',
    'Advisory & Implementation',
    'Data Intelligence Add-ons',
    'Partner Channel Revenue',
    'Treasury & Interest Income',
  ],
  Expense: [
    'Cloud & Data Infrastructure',
    'R&D & Engineering Payroll',
    'Sales & Enterprise Marketing',
    'Customer Success & Support',
    'General & Administrative',
    'Legal, Audit & Compliance',
    'Security & IT Operations',
  ],
};

export const ALL_CATEGORIES = [...CATEGORIES.Income, ...CATEGORIES.Expense];

export const DEFAULT_DEMO_USER = {
  id: 'usr_demo_01',
  fullName: 'Eleanor Vance',
  email: 'demo@tertvalis.net',
  companyName: 'Vance Meridian Holdings',
  role: 'VP of Financial Planning & Analysis',
  department: 'Corporate Finance & Strategy',
  phone: '+1 (415) 890-4321',
  timezone: 'America/New_York (EST/EDT)',
  bio: 'Leading enterprise scenario modeling, rolling 24-month cash flow forecasting, and capital allocation across global operating units.',
  passwordDemo: 'Demo@2026!', // Demo-only local credential
  createdAt: '2026-01-10T09:00:00.000Z',
};

export const DEFAULT_FINANCIAL_RECORDS = [
  // January 2026
  {
    id: 'REC-2026-001',
    description: 'Q1 Enterprise Core Platform Renewals — North America',
    category: 'Enterprise SaaS Subscriptions',
    type: 'Income',
    amount: 245000,
    date: '2026-01-12',
    notes: 'Multi-year enterprise tier renewals across 18 institutional clients.',
  },
  {
    id: 'REC-2026-002',
    description: 'Strategic Implementation & Onboarding Retainers',
    category: 'Advisory & Implementation',
    type: 'Income',
    amount: 64000,
    date: '2026-01-24',
    notes: 'Custom ERP data connector deployment for 4 new enterprise accounts.',
  },
  {
    id: 'REC-2026-003',
    description: 'Engineering & Quantitative Research Payroll',
    category: 'R&D & Engineering Payroll',
    type: 'Expense',
    amount: 118000,
    date: '2026-01-28',
    notes: 'Monthly core engineering, product architecture, and QA compensation.',
  },
  {
    id: 'REC-2026-004',
    description: 'Multi-Region Cloud Compute & Data Warehouse Cluster',
    category: 'Cloud & Data Infrastructure',
    type: 'Expense',
    amount: 34500,
    date: '2026-01-30',
    notes: 'Production Kubernetes clusters, analytical storage, and failover nodes.',
  },
  // February 2026
  {
    id: 'REC-2026-005',
    description: 'EMEA Enterprise License Expansion',
    category: 'Annual Platform Licenses',
    type: 'Income',
    amount: 268000,
    date: '2026-02-10',
    notes: 'Seat expansion and scenario engine module upgrades in Frankfurt & London.',
  },
  {
    id: 'REC-2026-006',
    description: 'Predictive Telemetry Add-on Subscriptions',
    category: 'Data Intelligence Add-ons',
    type: 'Income',
    amount: 52000,
    date: '2026-02-19',
    notes: 'Automated variance intelligence pack recurring billing.',
  },
  {
    id: 'REC-2026-007',
    description: 'Engineering & Quantitative Research Payroll',
    category: 'R&D & Engineering Payroll',
    type: 'Expense',
    amount: 121000,
    date: '2026-02-26',
    notes: 'Includes two new senior financial data engineers.',
  },
  {
    id: 'REC-2026-008',
    description: 'Enterprise Demand Gen & Executive Summit Sponsorship',
    category: 'Sales & Enterprise Marketing',
    type: 'Expense',
    amount: 46000,
    date: '2026-02-27',
    notes: 'CFO Leadership Forum sponsorship and outbound ABM campaigns.',
  },
  // March 2026
  {
    id: 'REC-2026-009',
    description: 'Global SaaS Subscription Cohort — March Billing',
    category: 'Enterprise SaaS Subscriptions',
    type: 'Income',
    amount: 289000,
    date: '2026-03-11',
    notes: 'Strong net dollar retention (118%) across mid-market and enterprise cohorts.',
  },
  {
    id: 'REC-2026-010',
    description: 'Global Systems Integrator Channel Royalties',
    category: 'Partner Channel Revenue',
    type: 'Income',
    amount: 58500,
    date: '2026-03-22',
    notes: 'Co-sell partner referrals closed in Q1.',
  },
  {
    id: 'REC-2026-011',
    description: 'Engineering & Quantitative Research Payroll',
    category: 'R&D & Engineering Payroll',
    type: 'Expense',
    amount: 122500,
    date: '2026-03-28',
    notes: 'March engineering payroll and contractor settlements.',
  },
  {
    id: 'REC-2026-012',
    description: 'SOC 2 Type II & ISO 27001 Annual Compliance Audit',
    category: 'Legal, Audit & Compliance',
    type: 'Expense',
    amount: 29000,
    date: '2026-03-30',
    notes: 'External regulatory audit, penetration testing, and legal filings.',
  },
  {
    id: 'REC-2026-013',
    description: 'Cloud Infrastructure & Real-Time Analytics Engine',
    category: 'Cloud & Data Infrastructure',
    type: 'Expense',
    amount: 36800,
    date: '2026-03-31',
    notes: 'High-availability compute nodes and encrypted backup snapshots.',
  },
  // April 2026
  {
    id: 'REC-2026-014',
    description: 'Q2 Enterprise Platform Subscriptions',
    category: 'Enterprise SaaS Subscriptions',
    type: 'Income',
    amount: 312000,
    date: '2026-04-09',
    notes: 'Includes 5 new Fortune 1000 finance teams onboarded.',
  },
  {
    id: 'REC-2026-015',
    description: 'Advisory & Custom Forecasting Model Calibration',
    category: 'Advisory & Implementation',
    type: 'Income',
    amount: 74000,
    date: '2026-04-18',
    notes: 'Bespoke treasury modeling workshops for institutional clients.',
  },
  {
    id: 'REC-2026-016',
    description: 'Engineering & Quantitative Research Payroll',
    category: 'R&D & Engineering Payroll',
    type: 'Expense',
    amount: 125000,
    date: '2026-04-28',
    notes: 'Monthly R&D salary and benefits disbursement.',
  },
  {
    id: 'REC-2026-017',
    description: 'Customer Success & Dedicated Solution Architects',
    category: 'Customer Success & Support',
    type: 'Expense',
    amount: 42000,
    date: '2026-04-29',
    notes: 'Enterprise account management and 24/7 SLA support operations.',
  },
  // May 2026
  {
    id: 'REC-2026-018',
    description: 'Annual Platform Licenses — APAC & North America',
    category: 'Annual Platform Licenses',
    type: 'Income',
    amount: 334000,
    date: '2026-05-14',
    notes: 'Upfront annual license agreements with 12% expansion uplift.',
  },
  {
    id: 'REC-2026-019',
    description: 'Data Intelligence Add-ons & API Volume Tier',
    category: 'Data Intelligence Add-ons',
    type: 'Income',
    amount: 69000,
    date: '2026-05-21',
    notes: 'High-frequency scenario simulation usage billing.',
  },
  {
    id: 'REC-2026-020',
    description: 'Engineering & Quantitative Research Payroll',
    category: 'R&D & Engineering Payroll',
    type: 'Expense',
    amount: 126500,
    date: '2026-05-28',
    notes: 'Core R&D team compensation.',
  },
  {
    id: 'REC-2026-021',
    description: 'Global Digital Acquisition & Field Events',
    category: 'Sales & Enterprise Marketing',
    type: 'Expense',
    amount: 51500,
    date: '2026-05-29',
    notes: 'Q2 pipeline acceleration and regional finance roundtables.',
  },
  {
    id: 'REC-2026-022',
    description: 'HQ Facilities, Insurance & Executive Operations',
    category: 'General & Administrative',
    type: 'Expense',
    amount: 31000,
    date: '2026-05-30',
    notes: 'Corporate lease, D&O insurance, and administrative software.',
  },
  // June 2026
  {
    id: 'REC-2026-023',
    description: 'Mid-Year Enterprise Subscription Cohort',
    category: 'Enterprise SaaS Subscriptions',
    type: 'Income',
    amount: 358000,
    date: '2026-06-12',
    notes: 'Record mid-year recurring subscription settlements.',
  },
  {
    id: 'REC-2026-024',
    description: 'Partner Channel Revenue & Treasury Yield',
    category: 'Treasury & Interest Income',
    type: 'Income',
    amount: 66000,
    date: '2026-06-25',
    notes: 'Short-term treasury bill yield on operating cash reserves.',
  },
  {
    id: 'REC-2026-025',
    description: 'Engineering & Quantitative Research Payroll',
    category: 'R&D & Engineering Payroll',
    type: 'Expense',
    amount: 129000,
    date: '2026-06-28',
    notes: 'June engineering compensation and performance accruals.',
  },
  {
    id: 'REC-2026-026',
    description: 'Cloud Infrastructure & Zero-Trust Security Upgrade',
    category: 'Security & IT Operations',
    type: 'Expense',
    amount: 44000,
    date: '2026-06-29',
    notes: 'Hardware security modules, SIEM monitoring, and cloud hosting.',
  },
  {
    id: 'REC-2026-027',
    description: 'Customer Success & Enterprise Enablement',
    category: 'Customer Success & Support',
    type: 'Expense',
    amount: 43500,
    date: '2026-06-30',
    notes: 'Customer training academy and dedicated TAM staffing.',
  },
];

export const DEFAULT_FORECAST_ASSUMPTIONS = {
  revenueGrowthRate: 4.5, // Monthly compound %
  expenseGrowthRate: 2.2, // Monthly compound %
  forecastDuration: 12, // Months (6, 12, 18, 24)
  inflationAdjustment: 0.3, // Monthly cost inflation buffer %
  cashConversionRate: 92.0, // % of Net Profit / Operating flow realized in cash
  workingCapitalBuffer: 15000, // Monthly fixed reserve / capex allocation
  seasonalityEnabled: true,
  viewGranularity: 'monthly', // 'monthly' | 'yearly'
  lastUpdated: '2026-06-30T14:20:00.000Z',
};

export const DEFAULT_SCENARIOS = [
  {
    id: 'SCEN-BASELINE',
    name: 'Baseline Scenario',
    description: 'Continues current historical trajectory with steady enterprise SaaS retention, disciplined R&D hiring, and standard cloud scaling.',
    status: 'Active',
    isDefault: true,
    type: 'Baseline',
    revenueGrowthRate: 4.2,
    expenseGrowthRate: 2.3,
    forecastMonths: 12,
    cashConversionRate: 92,
    opexMultiplier: 1.0,
    capexMonthly: 14000,
    selectedForComparison: true,
    updatedAt: '2026-06-28',
  },
  {
    id: 'SCEN-OPTIMISTIC',
    name: 'Optimistic Scenario',
    description: 'Models accelerated enterprise up-selling, strong partner channel expansion (+6.8% monthly revenue growth), and improved cloud unit economics.',
    status: 'Active',
    isDefault: true,
    type: 'Optimistic',
    revenueGrowthRate: 6.8,
    expenseGrowthRate: 2.9,
    forecastMonths: 12,
    cashConversionRate: 95,
    opexMultiplier: 1.05,
    capexMonthly: 18000,
    selectedForComparison: true,
    updatedAt: '2026-06-29',
  },
  {
    id: 'SCEN-CONSERVATIVE',
    name: 'Conservative Scenario',
    description: 'Stress-tests elongated enterprise procurement cycles (+1.8% monthly revenue growth), sticky infrastructure costs, and heightened compliance spend.',
    status: 'Active',
    isDefault: true,
    type: 'Conservative',
    revenueGrowthRate: 1.8,
    expenseGrowthRate: 2.6,
    forecastMonths: 12,
    cashConversionRate: 86,
    opexMultiplier: 0.96,
    capexMonthly: 10000,
    selectedForComparison: true,
    updatedAt: '2026-06-30',
  },
];

export const DEFAULT_BUDGETS = [
  {
    id: 'BDG-001',
    category: 'R&D & Engineering Payroll',
    type: 'Expense',
    period: 'Yearly',
    amount: 800000,
    monthlyAllocation: 130000,
    notes: 'Core engineering, data science, and platform architecture headcount budget.',
  },
  {
    id: 'BDG-002',
    category: 'Cloud & Data Infrastructure',
    type: 'Expense',
    period: 'Yearly',
    amount: 90000,
    monthlyAllocation: 38000,
    notes: 'Multi-region compute clusters, database replicas, and CDN bandwidth.',
  },
  {
    id: 'BDG-003',
    category: 'Sales & Enterprise Marketing',
    type: 'Expense',
    period: 'Yearly',
    amount: 110000,
    monthlyAllocation: 48000,
    notes: 'Executive field events, digital demand generation, and analyst relations.',
  },
  {
    id: 'BDG-004',
    category: 'Customer Success & Support',
    type: 'Expense',
    period: 'Yearly',
    amount: 95000,
    monthlyAllocation: 45000,
    notes: 'Implementation specialists, TAM coverage, and customer onboarding.',
  },
  {
    id: 'BDG-005',
    category: 'Legal, Audit & Compliance',
    type: 'Expense',
    period: 'Yearly',
    amount: 35000,
    monthlyAllocation: 15000,
    notes: 'SOC 2 Type II, ISO 27001, GDPR counsel, and corporate governance.',
  },
  {
    id: 'BDG-006',
    category: 'General & Administrative',
    type: 'Expense',
    period: 'Yearly',
    amount: 45000,
    monthlyAllocation: 25000,
    notes: 'Facilities, corporate insurance, finance tooling, and workplace ops.',
  },
  {
    id: 'BDG-007',
    category: 'Security & IT Operations',
    type: 'Expense',
    period: 'Yearly',
    amount: 50000,
    monthlyAllocation: 22000,
    notes: 'Zero-trust network security, endpoint protection, and threat telemetry.',
  },
  {
    id: 'BDG-008',
    category: 'Enterprise SaaS Subscriptions',
    type: 'Income',
    period: 'Yearly',
    amount: 1150000,
    monthlyAllocation: 295000,
    notes: 'Target recurring subscription revenue for H1/Annual baseline.',
  },
  {
    id: 'BDG-009',
    category: 'Annual Platform Licenses',
    type: 'Income',
    period: 'Yearly',
    amount: 580000,
    monthlyAllocation: 280000,
    notes: 'Target upfront multi-year and annual enterprise licensing.',
  },
];

export const DEFAULT_PREFERENCES = {
  currency: 'USD',
  currencySymbol: '$',
  numberFormat: 'standard', // 'standard' | 'compact'
  dateFormat: 'MMM DD, YYYY',
  fiscalYearStart: 'January',
  compactTables: false,
  chartAnimations: true,
  reducedMotion: false,
  budgetAlertThreshold: 85,
  emailDigestEnabled: true,
  varianceAlertsEnabled: true,
  scenarioAutoRecalc: true,
};

export const DEFAULT_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    title: 'June Enterprise Cohort Settled',
    message: 'Mid-Year Enterprise Subscription Cohort ($358,000) recorded and reconciled against Q2 forecast.',
    type: 'success',
    timestamp: '2 hours ago',
    read: false,
    link: '/financial-data',
  },
  {
    id: 'NOTIF-02',
    title: 'R&D Payroll Approaching H1 Budget Threshold',
    message: 'R&D & Engineering Payroll is at 92.8% of the H1 allocation ($742,000 / $800,000).',
    type: 'warning',
    timestamp: '5 hours ago',
    read: false,
    link: '/budgets',
  },
  {
    id: 'NOTIF-03',
    title: 'Scenario Models Recalculated',
    message: 'Baseline, Optimistic, and Conservative scenarios have been synchronized with June ledger actuals.',
    type: 'info',
    timestamp: '1 day ago',
    read: true,
    link: '/comparison',
  },
];

export const DEFAULT_ACTIVITY = [
  {
    id: 'ACT-01',
    action: 'Added Financial Record',
    detail: 'Mid-Year Enterprise Subscription Cohort (+$358,000)',
    timestamp: '2026-06-30 16:40',
    category: 'Financial Data',
  },
  {
    id: 'ACT-02',
    action: 'Updated Scenario Assumptions',
    detail: 'Optimistic Scenario revenue growth calibrated to 6.8%/mo',
    timestamp: '2026-06-29 11:15',
    category: 'Scenario Planning',
  },
  {
    id: 'ACT-03',
    action: 'Reconciled Budget Variance',
    detail: 'Cloud & Data Infrastructure reviewed (-20.8% favourable variance)',
    timestamp: '2026-06-28 09:30',
    category: 'Budget Analysis',
  },
  {
    id: 'ACT-04',
    action: 'Generated Board Report',
    detail: 'Exported Q2 Profit & Loss Summary CSV',
    timestamp: '2026-06-27 17:05',
    category: 'Reports & Exports',
  },
];

// Safe LocalStorage Getter
export function getStorageItem(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return fallback;
  }
}

// Safe LocalStorage Setter
export function setStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`Error writing localStorage key "${key}":`, err);
    return false;
  }
}

// Initialize default storage if empty
export function initializeStorage() {
  const existingUsers = getStorageItem(STORAGE_KEYS.USERS, null);
  if (!existingUsers || !Array.isArray(existingUsers) || existingUsers.length === 0) {
    setStorageItem(STORAGE_KEYS.USERS, [DEFAULT_DEMO_USER]);
  }

  // On very first visit, initialize demo session so dashboard pages work out of the box
  const hasInitSession = window.localStorage.getItem('tertvalis_init_flag_v1');
  if (!hasInitSession) {
    window.localStorage.setItem('tertvalis_init_flag_v1', 'true');
    if (!getStorageItem(STORAGE_KEYS.SESSION, null)) {
      setStorageItem(STORAGE_KEYS.SESSION, {
        id: DEFAULT_DEMO_USER.id,
        fullName: DEFAULT_DEMO_USER.fullName,
        email: DEFAULT_DEMO_USER.email,
        companyName: DEFAULT_DEMO_USER.companyName,
        role: DEFAULT_DEMO_USER.role,
        department: DEFAULT_DEMO_USER.department,
        phone: DEFAULT_DEMO_USER.phone,
        timezone: DEFAULT_DEMO_USER.timezone,
        bio: DEFAULT_DEMO_USER.bio,
        loggedInAt: new Date().toISOString(),
      });
    }
  }

  const existingRecords = getStorageItem(STORAGE_KEYS.RECORDS, null);
  if (!existingRecords || !Array.isArray(existingRecords)) {
    setStorageItem(STORAGE_KEYS.RECORDS, DEFAULT_FINANCIAL_RECORDS);
  }

  const existingAssumptions = getStorageItem(STORAGE_KEYS.ASSUMPTIONS, null);
  if (!existingAssumptions || typeof existingAssumptions !== 'object') {
    setStorageItem(STORAGE_KEYS.ASSUMPTIONS, DEFAULT_FORECAST_ASSUMPTIONS);
  }

  const existingScenarios = getStorageItem(STORAGE_KEYS.SCENARIOS, null);
  if (!existingScenarios || !Array.isArray(existingScenarios) || existingScenarios.length === 0) {
    setStorageItem(STORAGE_KEYS.SCENARIOS, DEFAULT_SCENARIOS);
  }

  const existingBudgets = getStorageItem(STORAGE_KEYS.BUDGETS, null);
  if (!existingBudgets || !Array.isArray(existingBudgets)) {
    setStorageItem(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
  }

  const existingPrefs = getStorageItem(STORAGE_KEYS.PREFERENCES, null);
  if (!existingPrefs || typeof existingPrefs !== 'object') {
    setStorageItem(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  }

  const existingNotifs = getStorageItem(STORAGE_KEYS.NOTIFICATIONS, null);
  if (!existingNotifs || !Array.isArray(existingNotifs)) {
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  }

  const existingActivity = getStorageItem(STORAGE_KEYS.ACTIVITY, null);
  if (!existingActivity || !Array.isArray(existingActivity)) {
    setStorageItem(STORAGE_KEYS.ACTIVITY, DEFAULT_ACTIVITY);
  }
}

export function resetAllDemoData() {
  setStorageItem(STORAGE_KEYS.RECORDS, DEFAULT_FINANCIAL_RECORDS);
  setStorageItem(STORAGE_KEYS.ASSUMPTIONS, DEFAULT_FORECAST_ASSUMPTIONS);
  setStorageItem(STORAGE_KEYS.SCENARIOS, DEFAULT_SCENARIOS);
  setStorageItem(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
  setStorageItem(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  setStorageItem(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  setStorageItem(STORAGE_KEYS.ACTIVITY, DEFAULT_ACTIVITY);
}

export function generateUniqueId(prefix = 'ID') {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timePart = Date.now().toString().slice(-4);
  return `${prefix}-${timePart}-${randomPart}`;
}
