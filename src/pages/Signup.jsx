import React, { useState, useMemo } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Building2,
  Lock,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useFinancial } from '../context/FinancialContext';
import { validateEmail, evaluatePasswordStrength } from '../utils/validation';

export default function Signup() {
  const { currentUser, signup } = useFinancial();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    if (!companyName || companyName.trim().length < 2) {
      setError('Please enter your company or organization name.');
      return;
    }

    if (strength.score < 3) {
      setError('Please choose a stronger password meeting at least 3 security criteria.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the demonstration terms and conditions to continue.');
      return;
    }

    const result = signup({ fullName, email, companyName, password });
    if (!result.success) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0D0D0D] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Logo size="lg" />
        <div className="text-xs text-neutral-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#050FD8] hover:underline ml-1"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl w-full mx-auto my-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs"
        >
          <div className="mb-6">
            <p className="text-xs font-medium text-[#050FD8]">
              Tertvalis Enterprise Onboarding
            </p>
            <h1 className="font-heading text-2xl font-bold text-[#0D0D0D] mt-1">
              Create Your Financial Workspace
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Set up a local demo account with pre-configured enterprise forecasting and scenario templates.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-medium text-[#0D0D0D] mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Eleanor Vance"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-company"
                  className="block text-xs font-medium text-[#0D0D0D] mb-1.5"
                >
                  Company Name
                </label>
                <div className="relative flex items-center">
                  <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="signup-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Vance Meridian Holdings"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-medium text-[#0D0D0D] mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-medium text-[#0D0D0D] mb-1.5"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
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

              <div>
                <label
                  htmlFor="signup-confirm"
                  className="block text-xs font-medium text-[#0D0D0D] mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="signup-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-lg focus:outline-none focus:border-[#050FD8] focus:bg-white transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 text-neutral-400 hover:text-[#0D0D0D] cursor-pointer"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            <div className="p-3.5 bg-[#FAFAFA] border border-neutral-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 font-medium">
                  Password Strength
                </span>
                <span
                  className="font-semibold"
                  style={{ color: password ? strength.color : '#737373' }}
                >
                  {password ? strength.label : 'Enter a password'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 h-1.5">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className="rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor:
                        password && strength.score >= bar
                          ? strength.color
                          : '#E5E5E5',
                    }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <Check
                    className={`w-3 h-3 ${
                      strength.checks.minLength
                        ? 'text-emerald-600'
                        : 'text-neutral-300'
                    }`}
                  />
                  8+ characters
                </span>
                <span className="flex items-center gap-1">
                  <Check
                    className={`w-3 h-3 ${
                      strength.checks.hasUpper
                        ? 'text-emerald-600'
                        : 'text-neutral-300'
                    }`}
                  />
                  Uppercase
                </span>
                <span className="flex items-center gap-1">
                  <Check
                    className={`w-3 h-3 ${
                      strength.checks.hasNumber
                        ? 'text-emerald-600'
                        : 'text-neutral-300'
                    }`}
                  />
                  Number
                </span>
                <span className="flex items-center gap-1">
                  <Check
                    className={`w-3 h-3 ${
                      strength.checks.hasSpecial
                        ? 'text-emerald-600'
                        : 'text-neutral-300'
                    }`}
                  />
                  Symbol
                </span>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-neutral-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300 text-[#050FD8] focus:ring-[#050FD8]"
                />
                <span>
                  I understand this is a LocalStorage demonstration application for Tertvalis and I agree to the Terms of Use.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#050FD8] hover:bg-[#050FD8]/90 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Create Account & Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 p-3 rounded-lg bg-[#FAFAFA] border border-neutral-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Demo credentials are saved only in your browser's LocalStorage. Never use real sensitive passwords.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-neutral-400 border-t border-neutral-200/70 pt-4">
        © 2026 Tertvalis (tertvalis.net) · Financial Forecasting & Scenario Intelligence
      </footer>
    </div>
  );
}
