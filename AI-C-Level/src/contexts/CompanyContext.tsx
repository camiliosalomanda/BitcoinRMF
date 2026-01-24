'use client';

/**
 * Company Context
 * Global state management for multi-company support
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Company, DEFAULT_COMPANY_SETTINGS } from '@/types/company';

interface CompanyContextType {
  companies: Company[];
  activeCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  setActiveCompany: (companyId: string) => void;
  createCompany: (data: Partial<Company>) => Promise<Company>;
  updateCompany: (companyId: string, data: Partial<Company>) => Promise<Company>;
  deleteCompany: (companyId: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Demo companies for development
const DEMO_COMPANIES: Company[] = [
  {
    id: 'company-1',
    name: 'TechStart Inc',
    industry: 'Technology',
    size: 'small',
    description: 'A growing SaaS startup focused on productivity tools',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01'),
    isActive: true,
    settings: {
      ...DEFAULT_COMPANY_SETTINGS,
      currency: 'USD',
      timezone: 'America/Los_Angeles',
    },
    onboardingCompleted: true,
  },
  {
    id: 'company-2',
    name: 'Green Leaf Cafe',
    industry: 'Food & Beverage',
    size: 'small',
    description: 'Local coffee shop with three locations',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-11-15'),
    isActive: true,
    settings: {
      ...DEFAULT_COMPANY_SETTINGS,
      currency: 'USD',
      timezone: 'America/New_York',
      enabledExecutives: ['CFO', 'CMO', 'COO', 'CHRO'],
    },
    onboardingCompleted: true,
  },
];

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get active company
  const activeCompany = companies.find((c) => c.id === activeCompanyId) || null;

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load companies from storage/API
  const loadCompanies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, this would be an API call
      // For now, use localStorage + demo data
      const stored = localStorage.getItem('bizai_companies');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCompanies(parsed.map((c: Company) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        })));
      } else {
        // Use demo companies for first-time users
        setCompanies(DEMO_COMPANIES);
        localStorage.setItem('bizai_companies', JSON.stringify(DEMO_COMPANIES));
      }

      // Load active company ID
      const activeId = localStorage.getItem('bizai_active_company');
      if (activeId) {
        setActiveCompanyId(activeId);
      } else if (DEMO_COMPANIES.length > 0) {
        setActiveCompanyId(DEMO_COMPANIES[0].id);
        localStorage.setItem('bizai_active_company', DEMO_COMPANIES[0].id);
      }
    } catch (err) {
      setError('Failed to load companies');
      console.error('Error loading companies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Set active company
  const setActiveCompany = useCallback((companyId: string) => {
    setActiveCompanyId(companyId);
    localStorage.setItem('bizai_active_company', companyId);
  }, []);

  // Create new company
  const createCompany = useCallback(async (data: Partial<Company>): Promise<Company> => {
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: data.name || 'New Company',
      industry: data.industry || 'Other',
      size: data.size || 'small',
      description: data.description,
      logo: data.logo,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      settings: data.settings || DEFAULT_COMPANY_SETTINGS,
      onboardingCompleted: true, // Mark as completed since we're skipping onboarding
    };

    const updated = [...companies, newCompany];
    setCompanies(updated);
    localStorage.setItem('bizai_companies', JSON.stringify(updated));

    // Set as active if it's the first company
    if (companies.length === 0) {
      setActiveCompany(newCompany.id);
    }

    return newCompany;
  }, [companies, setActiveCompany]);

  // Update company
  const updateCompany = useCallback(async (companyId: string, data: Partial<Company>): Promise<Company> => {
    const updated = companies.map((c) => {
      if (c.id === companyId) {
        return { ...c, ...data, updatedAt: new Date() };
      }
      return c;
    });

    setCompanies(updated);
    localStorage.setItem('bizai_companies', JSON.stringify(updated));

    const updatedCompany = updated.find((c) => c.id === companyId);
    if (!updatedCompany) {
      throw new Error('Company not found');
    }

    return updatedCompany;
  }, [companies]);

  // Delete company
  const deleteCompany = useCallback(async (companyId: string): Promise<void> => {
    const updated = companies.filter((c) => c.id !== companyId);
    setCompanies(updated);
    localStorage.setItem('bizai_companies', JSON.stringify(updated));

    // If deleted company was active, switch to another
    if (activeCompanyId === companyId && updated.length > 0) {
      setActiveCompany(updated[0].id);
    } else if (updated.length === 0) {
      setActiveCompanyId(null);
      localStorage.removeItem('bizai_active_company');
    }
  }, [companies, activeCompanyId, setActiveCompany]);

  // Refresh companies
  const refreshCompanies = useCallback(async () => {
    await loadCompanies();
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        activeCompany,
        isLoading,
        error,
        setActiveCompany,
        createCompany,
        updateCompany,
        deleteCompany,
        refreshCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

// Custom hook to use company context
export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
