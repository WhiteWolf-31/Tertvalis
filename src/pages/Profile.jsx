import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Phone,
  Globe,
  Save,
  Edit3,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { validateEmail } from '../utils/validation';

export default function Profile() {
  const { currentUser, records, scenarios, budgets, updateProfile } =
    useFinancial();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || 'Eleanor Vance',
    email: currentUser?.email || 'demo@tertvalis.net',
    companyName: currentUser?.companyName || 'Vance Meridian Holdings',
    role: currentUser?.role || 'VP of FP&A',
    department: currentUser?.department || 'Corporate Finance',
    phone: currentUser?.phone || '+1 (415) 890-4321',
    timezone: currentUser?.timezone || 'America/New_York',
    bio:
      currentUser?.bio ||
      'Enterprise scenario modeling and financial forecasting.',
  });
  const [error, setError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      setError('Full name is required.');
      return;
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    if (!formData.companyName || formData.companyName.trim().length < 2) {
      setError('Company name is required.');
      return;
    }

    updateProfile(formData);
    setIsEditing(false);
  };

  const initials = (formData.fullName || 'TV')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0D0D0D]">
            My Profile
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Account details & workspace summary
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing((prev) => !prev)}
          className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
            isEditing
              ? 'bg-neutral-100 text-[#0D0D0D]'
              : 'bg-[#050FD8] text-white hover:bg-[#050FD8]/90'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 bg-white border border-neutral-200/90 rounded-2xl p-5 flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#050FD8] text-white text-lg font-bold flex items-center justify-center">
              {initials}
            </div>
            <h2 className="font-heading text-lg font-bold text-[#0D0D0D] mt-3.5">
              {currentUser?.fullName}
            </h2>
            <p className="text-xs font-medium text-[#076CF2] mt-0.5">
              {currentUser?.role}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {currentUser?.companyName}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Records</span>
              <span className="font-mono-num font-bold text-[#0D0D0D]">
                {records.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Scenarios</span>
              <span className="font-mono-num font-bold text-[#050FD8]">
                {scenarios.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Budgets</span>
              <span className="font-mono-num font-bold text-[#0D0D0D]">
                {budgets.length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white border border-neutral-200/90 rounded-2xl p-5"
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, fullName: e.target.value }))
                    }
                    className="w-full pl-10 pr-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-xl disabled:opacity-75 focus:outline-none focus:border-[#050FD8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full pl-10 pr-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-xl disabled:opacity-75 focus:outline-none focus:border-[#050FD8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                  Company
                </label>
                <div className="relative flex items-center">
                  <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, companyName: e.target.value }))
                    }
                    className="w-full pl-10 pr-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-xl disabled:opacity-75 focus:outline-none focus:border-[#050FD8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                  Role
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, role: e.target.value }))
                    }
                    className="w-full pl-10 pr-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-xl disabled:opacity-75 focus:outline-none focus:border-[#050FD8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                  Phone
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full pl-10 pr-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-xl disabled:opacity-75 focus:outline-none focus:border-[#050FD8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D0D0D] mb-1">
                  Timezone
                </label>
                <div className="relative flex items-center">
                  <Globe className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, timezone: e.target.value }))
                    }
                    className="w-full pl-10 pr-3 py-2 text-sm bg-[#FAFAFA] border border-neutral-200 rounded-xl disabled:opacity-75 focus:outline-none focus:border-[#050FD8]"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-[#050FD8] hover:bg-[#050FD8]/90 text-white rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
