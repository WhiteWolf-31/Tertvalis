import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  STORAGE_KEYS,
  DEFAULT_DEMO_USER,
  DEFAULT_FINANCIAL_RECORDS,
  DEFAULT_FORECAST_ASSUMPTIONS,
  DEFAULT_SCENARIOS,
  DEFAULT_BUDGETS,
  DEFAULT_PREFERENCES,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_ACTIVITY,
  getStorageItem,
  setStorageItem,
  initializeStorage,
  resetAllDemoData,
  generateUniqueId,
} from '../utils/storage';
import {
  calculateKPIs,
  getMonthlySeries,
  generateForecastData,
  evaluateScenario,
  calculateBudgetVariance,
  formatCurrency,
} from '../utils/calculations';

const FinancialContext = createContext(null);

export function FinancialProvider({ children }) {
  const [users, setUsers] = useState(() => {
    initializeStorage();
    return getStorageItem(STORAGE_KEYS.USERS, [DEFAULT_DEMO_USER]);
  });
  const [currentUser, setCurrentUser] = useState(() =>
    getStorageItem(STORAGE_KEYS.SESSION, null)
  );
  const [records, setRecords] = useState(() =>
    getStorageItem(STORAGE_KEYS.RECORDS, DEFAULT_FINANCIAL_RECORDS)
  );
  const [assumptions, setAssumptions] = useState(() =>
    getStorageItem(STORAGE_KEYS.ASSUMPTIONS, DEFAULT_FORECAST_ASSUMPTIONS)
  );
  const [scenarios, setScenarios] = useState(() =>
    getStorageItem(STORAGE_KEYS.SCENARIOS, DEFAULT_SCENARIOS)
  );
  const [budgets, setBudgets] = useState(() =>
    getStorageItem(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS)
  );
  const [preferences, setPreferences] = useState(() =>
    getStorageItem(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES)
  );
  const [notifications, setNotifications] = useState(() =>
    getStorageItem(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS)
  );
  const [activityLog, setActivityLog] = useState(() =>
    getStorageItem(STORAGE_KEYS.ACTIVITY, DEFAULT_ACTIVITY)
  );
  const [toasts, setToasts] = useState([]);

  // Sync changes to LocalStorage
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.SESSION, currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.RECORDS, records);
  }, [records]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.ASSUMPTIONS, assumptions);
  }, [assumptions]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.SCENARIOS, scenarios);
  }, [scenarios]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.BUDGETS, budgets);
  }, [budgets]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.PREFERENCES, preferences);
    if (preferences.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [preferences]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.ACTIVITY, activityLog);
  }, [activityLog]);

  // Toast notification helper
  const showToast = (title, message = '', type = 'success') => {
    const id = generateUniqueId('TST');
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity & Notification helper
  const logActivity = (action, detail, category = 'System', createNotification = false, notifLink = '/dashboard') => {
    const now = new Date();
    const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const newEntry = {
      id: generateUniqueId('ACT'),
      action,
      detail,
      timestamp,
      category,
    };
    setActivityLog((prev) => [newEntry, ...prev.slice(0, 29)]);

    if (createNotification) {
      const newNotif = {
        id: generateUniqueId('NOTIF'),
        title: action,
        message: detail,
        type: 'info',
        timestamp: 'Just now',
        read: false,
        link: notifLink,
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
    }
  };

  // Authentication Actions
  const login = (email, password, rememberMe = true) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.passwordDemo === password
    );

    if (!matchedUser) {
      return {
        success: false,
        error: 'Invalid email or password. Use demo@tertvalis.net / Demo@2026! or create a new demo account.',
      };
    }

    const sessionUser = {
      id: matchedUser.id,
      fullName: matchedUser.fullName,
      email: matchedUser.email,
      companyName: matchedUser.companyName,
      role: matchedUser.role || 'Financial Analyst & Planner',
      department: matchedUser.department || 'Corporate Finance',
      phone: matchedUser.phone || '+1 (415) 890-0000',
      timezone: matchedUser.timezone || 'America/New_York (EST/EDT)',
      bio: matchedUser.bio || 'Enterprise forecasting and scenario modeling workspace.',
      rememberMe,
      loggedInAt: new Date().toISOString(),
    };

    setCurrentUser(sessionUser);
    logActivity('User Session Started', `Signed in as ${sessionUser.fullName} (${sessionUser.companyName})`, 'Auth');
    showToast('Welcome back to Tertvalis', `Signed in as ${sessionUser.fullName}`, 'success');
    return { success: true, user: sessionUser };
  };

  const signup = ({ fullName, email, companyName, password }) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return {
        success: false,
        error: 'An account with this email address already exists in local storage.',
      };
    }

    const newUser = {
      id: generateUniqueId('USR'),
      fullName: fullName.trim(),
      email: normalizedEmail,
      companyName: companyName.trim(),
      role: 'Director of Financial Planning',
      department: 'Strategic Finance',
      phone: '+1 (555) 234-5678',
      timezone: 'America/New_York (EST/EDT)',
      bio: `Financial planning and scenario intelligence lead at ${companyName.trim()}.`,
      passwordDemo: password,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);

    const sessionUser = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      companyName: newUser.companyName,
      role: newUser.role,
      department: newUser.department,
      phone: newUser.phone,
      timezone: newUser.timezone,
      bio: newUser.bio,
      loggedInAt: new Date().toISOString(),
    };

    setCurrentUser(sessionUser);
    logActivity('Account Created', `Registered demo workspace for ${newUser.companyName}`, 'Auth', true, '/profile');
    showToast('Demo Account Created', `Welcome to Tertvalis, ${newUser.fullName}`, 'success');
    return { success: true, user: sessionUser };
  };

  const resetDemoPassword = (email, newPassword) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const idx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
    if (idx === -1) {
      return {
        success: false,
        error: 'No saved demo account found with that email address.',
      };
    }
    const updatedUsers = [...users];
    updatedUsers[idx] = { ...updatedUsers[idx], passwordDemo: newPassword };
    setUsers(updatedUsers);
    showToast('Demo Password Updated', 'You can now sign in with your updated password.', 'success');
    return { success: true };
  };

  const logout = () => {
    logActivity('User Signed Out', 'Ended active demo session', 'Auth');
    setCurrentUser(null);
    showToast('Signed Out', 'Your demo session has ended safely.', 'info');
  };

  const updateProfile = (updates) => {
    if (!currentUser) return;
    const updatedSession = { ...currentUser, ...updates };
    setCurrentUser(updatedSession);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u))
    );
    logActivity('Updated Profile', `Saved profile changes for ${updatedSession.fullName}`, 'Profile');
    showToast('Profile Saved', 'Your account profile details have been updated.', 'success');
  };

  // Financial Records CRUD
  const addRecord = (recordData) => {
    const newRecord = {
      id: recordData.id || generateUniqueId('REC'),
      description: recordData.description.trim(),
      category: recordData.category,
      type: recordData.type,
      amount: Number(recordData.amount),
      date: recordData.date,
      notes: (recordData.notes || '').trim(),
    };
    setRecords((prev) => [newRecord, ...prev]);
    const formattedAmt = formatCurrency(newRecord.amount, preferences.currencySymbol);
    logActivity(
      'Added Financial Record',
      `${newRecord.description} (${newRecord.type === 'Income' ? '+' : '-'}${formattedAmt})`,
      'Financial Data',
      true,
      '/financial-data'
    );
    showToast('Record Added', `${newRecord.description} saved and KPIs recalculated.`, 'success');
    return newRecord;
  };

  const updateRecord = (id, updatedFields) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...updatedFields,
              amount: Number(updatedFields.amount),
            }
          : r
      )
    );
    logActivity(
      'Updated Financial Record',
      `Modified ${updatedFields.description || id}`,
      'Financial Data'
    );
    showToast('Record Updated', 'All charts, forecasts, and budgets have been refreshed.', 'success');
  };

  const deleteRecord = (id) => {
    const target = records.find((r) => r.id === id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    logActivity(
      'Deleted Financial Record',
      `Removed ${target ? target.description : id}`,
      'Financial Data'
    );
    showToast('Record Deleted', 'Financial record removed from workspace.', 'info');
  };

  // Forecast Assumptions Update
  const updateAssumptions = (newAssumptions) => {
    const merged = {
      ...assumptions,
      ...newAssumptions,
      lastUpdated: new Date().toISOString(),
    };
    setAssumptions(merged);
    logActivity(
      'Updated Forecast Assumptions',
      `Rev growth ${merged.revenueGrowthRate}%/mo, Exp growth ${merged.expenseGrowthRate}%/mo (${merged.forecastDuration}m horizon)`,
      'Forecasting'
    );
    showToast('Forecast Recalculated', 'Projections updated with new model assumptions.', 'success');
  };

  // Scenarios CRUD
  const addScenario = (scenarioData) => {
    const newScenario = {
      id: generateUniqueId('SCEN'),
      name: scenarioData.name.trim(),
      description: scenarioData.description.trim(),
      status: scenarioData.status || 'Active',
      isDefault: false,
      type: scenarioData.type || 'Custom',
      revenueGrowthRate: Number(scenarioData.revenueGrowthRate),
      expenseGrowthRate: Number(scenarioData.expenseGrowthRate),
      forecastMonths: Number(scenarioData.forecastMonths) || 12,
      cashConversionRate: Number(scenarioData.cashConversionRate) || 90,
      opexMultiplier: Number(scenarioData.opexMultiplier) || 1.0,
      capexMonthly: Number(scenarioData.capexMonthly) || 12000,
      selectedForComparison: Boolean(scenarioData.selectedForComparison ?? true),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setScenarios((prev) => [...prev, newScenario]);
    logActivity(
      'Created Scenario Model',
      `Added "${newScenario.name}" (+${newScenario.revenueGrowthRate}% rev / +${newScenario.expenseGrowthRate}% exp)`,
      'Scenario Planning',
      true,
      '/scenarios'
    );
    showToast('Scenario Created', `"${newScenario.name}" is now available for comparison.`, 'success');
    return newScenario;
  };

  const updateScenario = (id, updates) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              ...updates,
              revenueGrowthRate: Number(updates.revenueGrowthRate ?? s.revenueGrowthRate),
              expenseGrowthRate: Number(updates.expenseGrowthRate ?? s.expenseGrowthRate),
              forecastMonths: Number(updates.forecastMonths ?? s.forecastMonths),
              cashConversionRate: Number(updates.cashConversionRate ?? s.cashConversionRate),
              opexMultiplier: Number(updates.opexMultiplier ?? s.opexMultiplier),
              capexMonthly: Number(updates.capexMonthly ?? s.capexMonthly),
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : s
      )
    );
    logActivity('Updated Scenario', `Recalculated "${updates.name || id}"`, 'Scenario Planning');
    showToast('Scenario Updated', 'Scenario projections have been recalculated.', 'success');
  };

  const deleteScenario = (id) => {
    const target = scenarios.find((s) => s.id === id);
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    logActivity('Deleted Scenario', `Removed "${target ? target.name : id}"`, 'Scenario Planning');
    showToast('Scenario Deleted', 'Scenario removed from planning workspace.', 'info');
  };

  const toggleScenarioComparison = (id) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, selectedForComparison: !s.selectedForComparison } : s
      )
    );
  };

  // Budgets CRUD
  const addBudget = (budgetData) => {
    const newBudget = {
      id: generateUniqueId('BDG'),
      category: budgetData.category,
      type: budgetData.type || 'Expense',
      period: budgetData.period || 'Yearly',
      amount: Number(budgetData.amount),
      monthlyAllocation: Number(budgetData.monthlyAllocation) || Math.round(Number(budgetData.amount) / 6),
      notes: (budgetData.notes || '').trim(),
    };
    setBudgets((prev) => [...prev, newBudget]);
    logActivity(
      'Created Category Budget',
      `Allocated ${formatCurrency(newBudget.amount, preferences.currencySymbol)} for ${newBudget.category}`,
      'Budget Analysis',
      true,
      '/budgets'
    );
    showToast('Budget Created', `Budget allocation for ${newBudget.category} saved.`, 'success');
    return newBudget;
  };

  const updateBudget = (id, updates) => {
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              ...updates,
              amount: Number(updates.amount),
              monthlyAllocation: Number(updates.monthlyAllocation),
            }
          : b
      )
    );
    logActivity('Updated Budget', `Adjusted budget allocation for ${updates.category || id}`, 'Budget Analysis');
    showToast('Budget Updated', 'Variance analysis recalculated automatically.', 'success');
  };

  const deleteBudget = (id) => {
    const target = budgets.find((b) => b.id === id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    logActivity('Deleted Budget', `Removed budget for ${target ? target.category : id}`, 'Budget Analysis');
    showToast('Budget Removed', 'Budget allocation deleted.', 'info');
  };

  // Preferences Update
  const updatePreferences = (newPrefs) => {
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'CA$',
      AUD: 'A$',
    };
    const merged = {
      ...preferences,
      ...newPrefs,
    };
    if (newPrefs.currency && currencySymbols[newPrefs.currency]) {
      merged.currencySymbol = currencySymbols[newPrefs.currency];
    }
    setPreferences(merged);
    logActivity('Updated Preferences', 'Saved application display and alert settings', 'Settings');
    showToast('Preferences Saved', 'Your workspace settings have been updated.', 'success');
  };

  // Notifications Management
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Read', 'All notifications marked as read.', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Reset Demo Workspace
  const resetWorkspaceData = () => {
    resetAllDemoData();
    setRecords(DEFAULT_FINANCIAL_RECORDS);
    setAssumptions(DEFAULT_FORECAST_ASSUMPTIONS);
    setScenarios(DEFAULT_SCENARIOS);
    setBudgets(DEFAULT_BUDGETS);
    setPreferences(DEFAULT_PREFERENCES);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setActivityLog(DEFAULT_ACTIVITY);
    showToast('Demo Data Restored', 'All financial records, budgets, and scenarios reset to defaults.', 'success');
  };

  // Memoized Derived Computations across all modules
  const kpis = useMemo(() => calculateKPIs(records, budgets), [records, budgets]);
  const monthlySeries = useMemo(() => getMonthlySeries(records), [records]);
  const forecastData = useMemo(
    () => generateForecastData(records, assumptions),
    [records, assumptions]
  );
  const evaluatedScenarios = useMemo(
    () => scenarios.map((scen) => evaluateScenario(scen, records)),
    [scenarios, records]
  );
  const budgetVarianceYearly = useMemo(
    () => calculateBudgetVariance(budgets, records, 'Yearly'),
    [budgets, records]
  );
  const budgetVarianceMonthly = useMemo(
    () => calculateBudgetVariance(budgets, records, 'Monthly'),
    [budgets, records]
  );

  const value = {
    users,
    currentUser,
    records,
    assumptions,
    scenarios,
    evaluatedScenarios,
    budgets,
    budgetVarianceYearly,
    budgetVarianceMonthly,
    preferences,
    notifications,
    activityLog,
    toasts,
    kpis,
    monthlySeries,
    forecastData,
    // Actions
    login,
    signup,
    resetDemoPassword,
    logout,
    updateProfile,
    addRecord,
    updateRecord,
    deleteRecord,
    updateAssumptions,
    addScenario,
    updateScenario,
    deleteScenario,
    toggleScenarioComparison,
    addBudget,
    updateBudget,
    deleteBudget,
    updatePreferences,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    resetWorkspaceData,
    showToast,
    dismissToast,
    logActivity,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
