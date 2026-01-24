'use client';

/**
 * Settings Page
 * Edit company context and app preferences
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';

// Industry options
const INDUSTRIES = [
  'Technology / Software',
  'E-commerce / Retail',
  'Professional Services',
  'Healthcare',
  'Finance / Fintech',
  'Manufacturing',
  'Food & Beverage',
  'Real Estate',
  'Education',
  'Media / Entertainment',
  'Travel / Hospitality',
  'Non-profit',
  'Other',
];

// Employee count options
const EMPLOYEE_COUNTS = [
  { value: '1', label: 'Just me' },
  { value: '2-5', label: '2-5 employees' },
  { value: '6-10', label: '6-10 employees' },
  { value: '11-25', label: '11-25 employees' },
  { value: '26-50', label: '26-50 employees' },
  { value: '51-100', label: '51-100 employees' },
  { value: '100+', label: '100+ employees' },
];

// Revenue ranges
const REVENUE_RANGES = [
  { value: 'pre-revenue', label: 'Pre-revenue' },
  { value: '0-100k', label: '$0 - $100K' },
  { value: '100k-500k', label: '$100K - $500K' },
  { value: '500k-1m', label: '$500K - $1M' },
  { value: '1m-5m', label: '$1M - $5M' },
  { value: '5m-10m', label: '$5M - $10M' },
  { value: '10m+', label: '$10M+' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { companyContext, updateCompanyContext, setOnboarded } = useAppStore();
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    businessModel: 'b2b',
    location: '',
    employeeCount: '',
    revenueRange: '',
    stage: 'early',
    goals: [] as string[],
    challenges: [] as string[],
  });

  // Load existing context
  useEffect(() => {
    if (companyContext) {
      setFormData({
        name: companyContext.name || '',
        industry: companyContext.industry || '',
        businessModel: (companyContext as any).businessModel || 'b2b',
        location: (companyContext as any).location || '',
        employeeCount: (companyContext as any).employeeCount || '',
        revenueRange: String(companyContext.annualRevenue || ''),
        stage: (companyContext as any).stage || 'early',
        goals: companyContext.goals || [],
        challenges: companyContext.challenges || [],
      });
    }
  }, [companyContext]);

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    updateCompanyContext({
      name: formData.name,
      industry: formData.industry,
      businessModel: formData.businessModel as any,
      location: formData.location as any,
      employeeCount: formData.employeeCount as any,
      annualRevenue: formData.revenueRange,
      stage: formData.stage as any,
      goals: formData.goals,
      challenges: formData.challenges,
      updatedAt: new Date(),
    } as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetOnboarding = () => {
    setOnboarded(false);
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Saved
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Company Profile Section */}
        <section className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Company Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Acme Inc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select an industry...</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Business Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Model
              </label>
              <select
                value={formData.businessModel}
                onChange={(e) => updateField('businessModel', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="b2b">B2B (Sell to businesses)</option>
                <option value="b2c">B2C (Sell to consumers)</option>
                <option value="both">Both B2B and B2C</option>
              </select>
            </div>
          </div>
        </section>

        {/* Size & Stage Section */}
        <section className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Size & Stage</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employee Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employees
              </label>
              <select
                value={formData.employeeCount}
                onChange={(e) => updateField('employeeCount', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                {EMPLOYEE_COUNTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Revenue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Revenue
              </label>
              <select
                value={formData.revenueRange}
                onChange={(e) => updateField('revenueRange', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                {REVENUE_RANGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => updateField('stage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="pre_revenue">Pre-revenue</option>
                <option value="early">Early Stage</option>
                <option value="growth">Growth</option>
                <option value="mature">Mature</option>
              </select>
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Business Goals</h2>
          <p className="text-sm text-gray-500 mb-4">
            What are you focused on achieving?
          </p>
          
          <div className="space-y-2">
            {formData.goals.map((goal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">{goal}</span>
                <button
                  onClick={() =>
                    updateField(
                      'goals',
                      formData.goals.filter((_, i) => i !== index)
                    )
                  }
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
            {formData.goals.length === 0 && (
              <p className="text-gray-400 text-sm italic">No goals set yet</p>
            )}
          </div>
        </section>

        {/* Challenges Section */}
        <section className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Current Challenges</h2>
          <p className="text-sm text-gray-500 mb-4">
            What obstacles are you facing?
          </p>
          
          <div className="flex flex-wrap gap-2">
            {formData.challenges.map((challenge, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {challenge}
                <button
                  onClick={() =>
                    updateField(
                      'challenges',
                      formData.challenges.filter((_, i) => i !== index)
                    )
                  }
                  className="hover:text-blue-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
            {formData.challenges.length === 0 && (
              <p className="text-gray-400 text-sm italic">No challenges set yet</p>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-bold text-red-600 mb-2">Reset</h2>
          <p className="text-sm text-gray-500 mb-4">
            Start fresh with the onboarding process
          </p>
          
          <button
            onClick={handleResetOnboarding}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors"
          >
            Restart Onboarding
          </button>
        </section>
      </main>
    </div>
  );
}
