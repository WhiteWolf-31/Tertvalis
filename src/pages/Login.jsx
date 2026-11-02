import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  TrendingUp,
  Layers,
  Calculator,
} from 'lucide-react';
import Logo from '../components/Logo';
import Modal from '../components/Modal';
import { useFinancial } from '../context/FinancialContext';
import { validateEmail } from '../utils/validation';

export default function Login() {
  const { currentUser, login, resetDemoPassword } = useFinancial();
  const navigate = useNavigate();

  const [email, setEmail] = useState('demo@tertvalis.net');
  const [password, setPassword] = useState('Demo@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Forgot password demo modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('demo@tertvalis.net');
  const [newPass, setNewPass] = useState('');
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' });

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const result = login(email, password, rememberMe);
    if (!result.success) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@tertvalis.net');
    setPassword('Demo@2026!');
    setError('');
  };

  const handleResetDemoPassword = (e) => {
    e.preventDefault();
    setResetMessage({ type: '', text: '' });

    const emailErr = validateEmail(resetEmail);
    if (emailErr) {
      setResetMessage({ type: 'error', text: emailErr });
      return;
    }
    if (!newPass || newPass.length < 6) {
      setResetMessage({
        type: 'error',
        text: 'Password must be at least 6 characters.',
      });
      return;
    }

    const res = resetDemoPassword(resetEmail, newPass);
    if (!res.success) {
      setResetMessage({ type: 'error', text: res.error });
    } else {
      setResetMessage({
        type: 'success',
        text: 'Password updated. You can now sign in.',
      });
      setPassword(newPass);
      setEmail(resetEmail);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0D0D0D] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <Logo size="lg" />
        <Link
          to="/signup"
          className="text-xs font-semibold text-[#050FD8] hover:underline"
        >
          Create Account →
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Feature Highlights */}
        <div className="lg:col-span-5 bg-[#050FD8] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-[#05F2AD]">
              tertvalis.net
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold mt-2 leading-tight">
              Financial Forecasting & Scenario Intelligence
            </h1>

            <div className="mt-6 space-y-4 pt-5 border-t border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-[#05F2AD]" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Rolling Forecasts</p>
                  <p className="text-[11px] text-white/75">
                    6 to 24-month dynamic projections
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-[#05F2AD]" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Scenario Modeling</p>
                  <p className="text-[11px] text-white/75">
                    Baseline, Optimistic & Conservative
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4 text-[#05F2AD]" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Variance Analytics</p>
                  <p className="text-[11px] text-white/75">
                    Real-time budget vs actual tracking
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-white/60 mt-6 pt-4 border-t border-white/15">
            Demo environment powered by browser LocalStorage.
          </p>
        </div>

        {/* Right Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-center shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-[#0D0D0D]">
                Sign In
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Access your financial workspace
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3 py-1.5 text-xs font-semibold text-[#050FD8] bg-[#050FD8]/8 hover:bg-[#050FD8]/15 rounded-lg transition-colors cursor-pointer"
            >
              Fill Demo Login
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-[#0D0D0D] mb-1.5"
              >
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@tertvalis.net"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-xl text-[#0D0D0D] focus:outline-none focus:border-[#050FD8] focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-[#0D0D0D]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || 'demo@tertvalis.net');
                    setResetMessage({ type: '', text: '' });
                    setForgotOpen(true);
                  }}
                  className="text-xs text-[#076CF2] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-xl text-[#0D0D0D] focus:outline-none focus:border-[#050FD8] focus:bg-white transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-neutral-400 hover:text-[#0D0D0D] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 text-xs text-neutral-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-neutral-300 text-[#050FD8] focus:ring-[#050FD8]"
                />
                <span>Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#050FD8] hover:bg-[#050FD8]/90 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500">
              Need an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-[#050FD8] hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-neutral-400 pt-2">
        © 2026 Tertvalis (tertvalis.net)
      </footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset Demo Password"
        subtitle="Update password in browser LocalStorage"
      >
        <form onSubmit={handleResetDemoPassword} className="space-y-4">
          {resetMessage.text && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                resetMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {resetMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{resetMessage.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
              Account Email
            </label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
              New Password
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8]"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-[#050FD8] text-white rounded-lg hover:bg-[#050FD8]/90 cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
