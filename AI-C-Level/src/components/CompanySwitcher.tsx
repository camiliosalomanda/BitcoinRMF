'use client';

/**
 * Company Switcher Component
 * Dropdown for switching between companies
 * Syncs active company with the app store
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';

interface CompanySwitcherProps {
  compact?: boolean;
}

export default function CompanySwitcher({ compact = false }: CompanySwitcherProps) {
  const { companies, activeCompany, setActiveCompany, isLoading } = useCompany();
  const { setActiveCompanyId } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync active company ID with store whenever it changes
  useEffect(() => {
    if (activeCompany) {
      setActiveCompanyId(activeCompany.id);
    }
  }, [activeCompany, setActiveCompanyId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Handle company switch
  const handleCompanySwitch = (companyId: string) => {
    setActiveCompany(companyId);
    setActiveCompanyId(companyId); // Also update store
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-700 rounded-lg w-32" />
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <Link
        href="/companies/new"
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Company
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-800 ${
          compact ? 'justify-center' : ''
        }`}
      >
        {/* Company Avatar */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: getColor(activeCompany.name) }}
        >
          {activeCompany.logo ? (
            <img
              src={activeCompany.logo}
              alt={activeCompany.name}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            getInitials(activeCompany.name)
          )}
        </div>

        {!compact && (
          <>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-white truncate max-w-[120px]">
                {activeCompany.name}
              </p>
              <p className="text-xs text-gray-400 truncate max-w-[120px]">
                {activeCompany.industry}
              </p>
            </div>

            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
          {/* Current Company Header */}
          <div className="px-4 py-3 bg-gray-50 border-b">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Company
            </p>
          </div>

          {/* Company List */}
          <div className="max-h-64 overflow-y-auto">
            {companies.map((company) => {
              const isActive = company.id === activeCompany.id;

              return (
                <button
                  key={company.id}
                  onClick={() => handleCompanySwitch(company.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-emerald-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: getColor(company.name) }}
                  >
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      getInitials(company.name)
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {company.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {company.industry}
                    </p>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="border-t p-2">
            <Link
              href="/companies/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Company
            </Link>
            <Link
              href="/companies"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Companies
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
