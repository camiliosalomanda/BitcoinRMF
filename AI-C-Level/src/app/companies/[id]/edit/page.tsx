'use client';

/**
 * Edit Company Page
 * Edit an existing company's details
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCompany } from '@/contexts/CompanyContext';
import { Company, COMPANY_SIZE_LABELS, INDUSTRY_OPTIONS } from '@/types/company';

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  
  const { companies, updateCompany } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: 'small' as Company['size'],
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load company data
  useEffect(() => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setFormData({
        name: company.name,
        industry: company.industry,
        size: company.size,
        description: company.description || '',
      });
      setIsLoading(false);
    } else if (companies.length > 0) {
      // Company not found, redirect
      router.push('/companies');
    }
  }, [companyId, companies, router]);

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await updateCompany(companyId, {
        name: formData.name.trim(),
        industry: formData.industry,
        size: formData.size,
        description: formData.description.trim() || undefined,
      });

      router.push('/companies');
    } catch (err) {
      console.error('Failed to update company:', err);
      setErrors({ submit: 'Failed to update company. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/companies"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Edit Company</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your company name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 ${
                  errors.industry ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select an industry</option>
                {INDUSTRY_OPTIONS.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="mt-1 text-sm text-red-500">{errors.industry}</p>
              )}
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(COMPANY_SIZE_LABELS) as Company['size'][]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({ ...formData, size })}
                    className={`px-4 py-3 border rounded-lg text-left transition-all ${
                      formData.size === size
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <p className={`text-sm font-medium ${
                      formData.size === size ? 'text-emerald-700' : 'text-gray-900'
                    }`}>
                      {COMPANY_SIZE_LABELS[size]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your company"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-gray-900"
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Link
                href="/companies"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
