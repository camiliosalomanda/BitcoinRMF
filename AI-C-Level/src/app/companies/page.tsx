'use client';

/**
 * Companies Management Page
 * View, create, edit, and delete companies
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useCompany } from '@/contexts/CompanyContext';
import { Company, COMPANY_SIZE_LABELS } from '@/types/company';

export default function CompaniesPage() {
  const { companies, activeCompany, setActiveCompany, deleteCompany, isLoading } = useCompany();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Get initials for company avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get color based on company name
  const getColor = (name: string) => {
    const colors = [
      '#10B981', '#8B5CF6', '#F59E0B', '#EC4899',
      '#3B82F6', '#6366F1', '#14B8A6', '#F97316',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Handle delete
  const handleDelete = async (companyId: string) => {
    await deleteCompany(companyId);
    setDeleteConfirm(null);
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
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Your Companies</h1>
                <p className="text-sm text-gray-500">
                  {companies.length} {companies.length === 1 ? 'company' : 'companies'}
                </p>
              </div>
            </div>
            <Link
              href="/companies/new"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Company
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {companies.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
            <p className="text-gray-500 mb-6">Add your first company to get started with BizAI</p>
            <Link
              href="/companies/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Company
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {companies.map((company) => {
              const isActive = activeCompany?.id === company.id;
              const isDeleting = deleteConfirm === company.id;

              return (
                <div
                  key={company.id}
                  className={`bg-white rounded-xl border p-6 transition-all ${
                    isActive ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Company Avatar */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                      style={{ backgroundColor: getColor(company.name) }}
                    >
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        getInitials(company.name)
                      )}
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {company.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            Active
                          </span>
                        )}
                        {!company.onboardingCompleted && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            Setup Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {company.industry} • {COMPANY_SIZE_LABELS[company.size]}
                      </p>
                      {company.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {company.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Created {company.createdAt.toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button
                          onClick={() => setActiveCompany(company.id)}
                          className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          Switch to
                        </button>
                      )}
                      <Link
                        href={`/companies/${company.id}/edit`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(company.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {isDeleting && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 mb-3">
                        Are you sure you want to delete <strong>{company.name}</strong>? This action cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
