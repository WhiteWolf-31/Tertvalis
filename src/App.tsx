import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ToastContainer from './components/Toast.jsx';

// Pages
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FinancialData from './pages/FinancialData.jsx';
import Forecasting from './pages/Forecasting.jsx';
import ScenarioPlanning from './pages/ScenarioPlanning.jsx';
import BudgetAnalysis from './pages/BudgetAnalysis.jsx';
import Analytics from './pages/Analytics.jsx';
import ScenarioComparison from './pages/ScenarioComparison.jsx';
import Reports from './pages/Reports.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <FinancialProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Enterprise Suite Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/financial-data" element={<FinancialData />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/scenarios" element={<ScenarioPlanning />} />
            <Route path="/budgets" element={<BudgetAnalysis />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/comparison" element={<ScenarioComparison />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </FinancialProvider>
  );
}

