/**
 * Company Database Service
 * 
 * Handles all database operations for company data.
 * Falls back to local storage when Supabase is not configured.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Company, CompanyInsert, CompanyUpdate } from '@/types/database';

// Temporary user ID for demo purposes (replace with auth when implemented)
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export interface CompanyService {
  getCompany: (userId?: string) => Promise<Company | null>;
  createCompany: (company: Omit<CompanyInsert, 'user_id'>) => Promise<Company | null>;
  updateCompany: (id: string, updates: CompanyUpdate) => Promise<Company | null>;
  deleteCompany: (id: string) => Promise<boolean>;
}

// ============================================
// Supabase Implementation
// ============================================

const supabaseCompanyService: CompanyService = {
  async getCompany(userId = DEMO_USER_ID) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching company:', error);
      return null;
    }

    return data;
  },

  async createCompany(company) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('companies')
      .insert({
        ...company,
        user_id: DEMO_USER_ID,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return null;
    }

    return data;
  },

  async updateCompany(id, updates) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      return null;
    }

    return data;
  },

  async deleteCompany(id) {
    if (!supabase) return false;

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting company:', error);
      return false;
    }

    return true;
  },
};

// ============================================
// Local Storage Implementation (Fallback)
// ============================================

const LOCAL_STORAGE_KEY = 'bizai_company';

const localCompanyService: CompanyService = {
  async getCompany() {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored) as Company;
    } catch {
      return null;
    }
  },

  async createCompany(company) {
    if (typeof window === 'undefined') return null;

    const newCompany: Company = {
      ...company,
      id: crypto.randomUUID(),
      user_id: DEMO_USER_ID,
      industry: company.industry || null,
      business_model: company.business_model || null,
      location: company.location || null,
      size: company.size || null,
      employee_count: company.employee_count || null,
      annual_revenue: company.annual_revenue || null,
      stage: company.stage || null,
      currency: company.currency || 'USD',
      timezone: company.timezone || 'UTC',
      fiscal_year_end: company.fiscal_year_end || 'December',
      goals: company.goals || [],
      challenges: company.challenges || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCompany));
    return newCompany;
  },

  async updateCompany(id, updates) {
    if (typeof window === 'undefined') return null;

    const existing = await this.getCompany();
    if (!existing || existing.id !== id) return null;

    const updated: Company = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async deleteCompany(id) {
    if (typeof window === 'undefined') return false;

    const existing = await this.getCompany();
    if (!existing || existing.id !== id) return false;

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return true;
  },
};

// ============================================
// Export the appropriate service
// ============================================

export const companyService: CompanyService = isSupabaseConfigured
  ? supabaseCompanyService
  : localCompanyService;

// Helper to convert between DB and app formats
export function dbCompanyToAppContext(company: Company) {
  return {
    id: company.id,
    name: company.name,
    industry: company.industry || '',
    size: company.size || 'small',
    annualRevenue: company.annual_revenue ? parseInt(company.annual_revenue) : undefined,
    employeeCount: company.employee_count ? parseInt(company.employee_count) : undefined,
    fiscalYearEnd: company.fiscal_year_end,
    currency: company.currency,
    timezone: company.timezone,
    goals: company.goals,
    challenges: company.challenges,
    createdAt: new Date(company.created_at),
    updatedAt: new Date(company.updated_at),
  };
}

export function appContextToDbCompany(context: any): Omit<CompanyInsert, 'user_id'> {
  return {
    name: context.name,
    industry: context.industry || null,
    business_model: context.businessModel || null,
    location: context.location || null,
    size: context.size || null,
    employee_count: context.employeeCount || null,
    annual_revenue: context.revenueRange || context.annualRevenue?.toString() || null,
    stage: context.stage || null,
    currency: context.currency || 'USD',
    timezone: context.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    fiscal_year_end: context.fiscalYearEnd || 'December',
    goals: context.goals || [],
    challenges: context.challenges || [],
  };
}
