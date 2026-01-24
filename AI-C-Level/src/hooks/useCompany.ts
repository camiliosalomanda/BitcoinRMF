/**
 * useCompany Hook
 * 
 * Provides database-backed company context management.
 * Syncs between local state and database.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { companyService, dbCompanyToAppContext, appContextToDbCompany } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Company } from '@/types/database';

interface UseCompanyReturn {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
  isDbConnected: boolean;
  saveCompany: (data: any) => Promise<boolean>;
  refreshCompany: () => Promise<void>;
}

export function useCompany(): UseCompanyReturn {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { companyContext, setCompanyContext, isOnboarded } = useAppStore();

  // Load company from database
  const loadCompany = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dbCompany = await companyService.getCompany();
      
      if (dbCompany) {
        setCompany(dbCompany);
        // Sync to local store
        const appContext = dbCompanyToAppContext(dbCompany);
        setCompanyContext(appContext as any);
      } else if (companyContext) {
        // No DB company but we have local context - create in DB
        const newCompany = await companyService.createCompany(
          appContextToDbCompany(companyContext)
        );
        if (newCompany) {
          setCompany(newCompany);
        }
      }
    } catch (err) {
      console.error('Error loading company:', err);
      setError(err instanceof Error ? err.message : 'Failed to load company');
    } finally {
      setIsLoading(false);
    }
  }, [companyContext, setCompanyContext]);

  // Initial load
  useEffect(() => {
    if (isOnboarded) {
      loadCompany();
    } else {
      setIsLoading(false);
    }
  }, [isOnboarded, loadCompany]);

  // Save company to database
  const saveCompany = useCallback(async (data: any): Promise<boolean> => {
    setError(null);

    try {
      const dbData = appContextToDbCompany(data);

      if (company) {
        // Update existing
        const updated = await companyService.updateCompany(company.id, dbData);
        if (updated) {
          setCompany(updated);
          setCompanyContext(dbCompanyToAppContext(updated) as any);
          return true;
        }
      } else {
        // Create new
        const created = await companyService.createCompany(dbData);
        if (created) {
          setCompany(created);
          setCompanyContext(dbCompanyToAppContext(created) as any);
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error('Error saving company:', err);
      setError(err instanceof Error ? err.message : 'Failed to save company');
      return false;
    }
  }, [company, setCompanyContext]);

  // Refresh from database
  const refreshCompany = useCallback(async () => {
    await loadCompany();
  }, [loadCompany]);

  return {
    company,
    isLoading,
    error,
    isDbConnected: isSupabaseConfigured,
    saveCompany,
    refreshCompany,
  };
}
