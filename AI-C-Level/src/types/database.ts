/**
 * Database Types
 * 
 * TypeScript types for Supabase database tables.
 * These types match the SQL schema defined in supabase/schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          industry: string | null;
          business_model: 'b2b' | 'b2c' | 'both' | null;
          location: string | null;
          size: 'micro' | 'small' | 'medium' | null;
          employee_count: string | null;
          annual_revenue: string | null;
          stage: 'pre_revenue' | 'early' | 'growth' | 'mature' | null;
          currency: string;
          timezone: string;
          fiscal_year_end: string;
          goals: string[];
          challenges: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          industry?: string | null;
          business_model?: 'b2b' | 'b2c' | 'both' | null;
          location?: string | null;
          size?: 'micro' | 'small' | 'medium' | null;
          employee_count?: string | null;
          annual_revenue?: string | null;
          stage?: 'pre_revenue' | 'early' | 'growth' | 'mature' | null;
          currency?: string;
          timezone?: string;
          fiscal_year_end?: string;
          goals?: string[];
          challenges?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          industry?: string | null;
          business_model?: 'b2b' | 'b2c' | 'both' | null;
          location?: string | null;
          size?: 'micro' | 'small' | 'medium' | null;
          employee_count?: string | null;
          annual_revenue?: string | null;
          stage?: 'pre_revenue' | 'early' | 'growth' | 'mature' | null;
          currency?: string;
          timezone?: string;
          fiscal_year_end?: string;
          goals?: string[];
          challenges?: string[];
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          executive: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          executive: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          executive?: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';
          title?: string | null;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          executive: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          executive?: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          executive?: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO' | null;
        };
      };
      executive_messages: {
        Row: {
          id: string;
          company_id: string;
          from_executive: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';
          to_executive: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO' | 'all';
          subject: string;
          content: string;
          priority: 'low' | 'normal' | 'high' | 'urgent';
          type: 'info' | 'request' | 'approval' | 'alert';
          status: 'pending' | 'read' | 'actioned';
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          from_executive: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';
          to_executive: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO' | 'all';
          subject: string;
          content: string;
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          type?: 'info' | 'request' | 'approval' | 'alert';
          status?: 'pending' | 'read' | 'actioned';
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          from_executive?: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';
          to_executive?: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO' | 'all';
          subject?: string;
          content?: string;
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          type?: 'info' | 'request' | 'approval' | 'alert';
          status?: 'pending' | 'read' | 'actioned';
        };
      };
      insights: {
        Row: {
          id: string;
          company_id: string;
          executive: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';
          type: string;
          category: string;
          title: string;
          description: string;
          impact: 'low' | 'medium' | 'high';
          action_required: boolean;
          suggested_actions: string[];
          related_executives: string[];
          status: 'active' | 'dismissed' | 'resolved';
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          executive: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';
          type: string;
          category: string;
          title: string;
          description: string;
          impact?: 'low' | 'medium' | 'high';
          action_required?: boolean;
          suggested_actions?: string[];
          related_executives?: string[];
          status?: 'active' | 'dismissed' | 'resolved';
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          executive?: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO';
          type?: string;
          category?: string;
          title?: string;
          description?: string;
          impact?: 'low' | 'medium' | 'high';
          action_required?: boolean;
          suggested_actions?: string[];
          related_executives?: string[];
          status?: 'active' | 'dismissed' | 'resolved';
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      executive_role: 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'CTO' | 'CCO' | 'CCO';
      message_priority: 'low' | 'normal' | 'high' | 'urgent';
      message_type: 'info' | 'request' | 'approval' | 'alert';
      message_status: 'pending' | 'read' | 'actioned';
      company_size: 'micro' | 'small' | 'medium';
      business_stage: 'pre_revenue' | 'early' | 'growth' | 'mature';
      business_model: 'b2b' | 'b2c' | 'both';
      impact_level: 'low' | 'medium' | 'high';
    };
  };
}

// Helper types for easier use
export type Company = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export type ExecutiveMessage = Database['public']['Tables']['executive_messages']['Row'];
export type ExecutiveMessageInsert = Database['public']['Tables']['executive_messages']['Insert'];
export type ExecutiveMessageUpdate = Database['public']['Tables']['executive_messages']['Update'];

export type Insight = Database['public']['Tables']['insights']['Row'];
export type InsightInsert = Database['public']['Tables']['insights']['Insert'];
export type InsightUpdate = Database['public']['Tables']['insights']['Update'];
