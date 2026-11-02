// Input validation utilities for authentication, financial records, budgets, and scenarios

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email address is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid corporate or personal email address.';
  return '';
}

export function evaluatePasswordStrength(password = '') {
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  let label = 'Too Weak';
  let color = '#DC2626';

  if (score >= 5) {
    label = 'Strong';
    color = '#059669';
  } else if (score === 4) {
    label = 'Good';
    color = '#076CF2';
  } else if (score === 3) {
    label = 'Fair';
    color = '#D97706';
  }

  return {
    score,
    checks,
    label,
    color,
  };
}

export function validateRecordForm(formData) {
  const errors = {};
  if (!formData.description || formData.description.trim().length < 3) {
    errors.description = 'Description must be at least 3 characters.';
  }
  if (!formData.category || !formData.category.trim()) {
    errors.category = 'Please select a financial category.';
  }
  if (!formData.type || !['Income', 'Expense'].includes(formData.type)) {
    errors.type = 'Transaction type must be Income or Expense.';
  }
  const amt = Number(formData.amount);
  if (Number.isNaN(amt) || amt <= 0) {
    errors.amount = 'Amount must be a positive number greater than zero.';
  }
  if (!formData.date || !/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
    errors.date = 'Please provide a valid transaction date (YYYY-MM-DD).';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateScenarioForm(formData) {
  const errors = {};
  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = 'Scenario name must be at least 3 characters.';
  }
  if (!formData.description || formData.description.trim().length < 5) {
    errors.description = 'Please provide a brief description of scenario assumptions.';
  }
  const revRate = Number(formData.revenueGrowthRate);
  if (Number.isNaN(revRate) || revRate < -50 || revRate > 100) {
    errors.revenueGrowthRate = 'Revenue growth rate must be between -50% and +100%.';
  }
  const expRate = Number(formData.expenseGrowthRate);
  if (Number.isNaN(expRate) || expRate < -50 || expRate > 100) {
    errors.expenseGrowthRate = 'Expense growth rate must be between -50% and +100%.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateBudgetForm(formData) {
  const errors = {};
  if (!formData.category || !formData.category.trim()) {
    errors.category = 'Please choose a budget category.';
  }
  const amount = Number(formData.amount);
  if (Number.isNaN(amount) || amount < 0) {
    errors.amount = 'Budget amount must be 0 or a positive number.';
  }
  const monthly = Number(formData.monthlyAllocation);
  if (Number.isNaN(monthly) || monthly < 0) {
    errors.monthlyAllocation = 'Monthly allocation must be 0 or a positive number.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
