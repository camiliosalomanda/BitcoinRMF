/**
 * Executive Messages Database Service
 * 
 * Handles all database operations for inter-executive communications.
 * Falls back to local storage when Supabase is not configured.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { 
  ExecutiveMessage, 
  ExecutiveMessageInsert, 
  ExecutiveMessageUpdate 
} from '@/types/database';

export interface ExecutiveMessageService {
  getMessages: (companyId: string) => Promise<ExecutiveMessage[]>;
  getPendingMessages: (companyId: string) => Promise<ExecutiveMessage[]>;
  addMessage: (message: ExecutiveMessageInsert) => Promise<ExecutiveMessage | null>;
  updateMessage: (id: string, updates: ExecutiveMessageUpdate) => Promise<ExecutiveMessage | null>;
  markAsRead: (id: string) => Promise<boolean>;
  markAsActioned: (id: string) => Promise<boolean>;
}

// ============================================
// Supabase Implementation
// ============================================

const supabaseExecutiveMessageService: ExecutiveMessageService = {
  async getMessages(companyId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('executive_messages')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching executive messages:', error);
      return [];
    }

    return data;
  },

  async getPendingMessages(companyId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('executive_messages')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending messages:', error);
      return [];
    }

    return data;
  },

  async addMessage(message) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('executive_messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error('Error adding executive message:', error);
      return null;
    }

    return data;
  },

  async updateMessage(id, updates) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('executive_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating executive message:', error);
      return null;
    }

    return data;
  },

  async markAsRead(id) {
    const result = await this.updateMessage(id, { status: 'read' });
    return result !== null;
  },

  async markAsActioned(id) {
    const result = await this.updateMessage(id, { status: 'actioned' });
    return result !== null;
  },
};

// ============================================
// Local Storage Implementation (Fallback)
// ============================================

const LOCAL_STORAGE_KEY = 'bizai_executive_messages';

function getLocalMessages(): ExecutiveMessage[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalMessages(messages: ExecutiveMessage[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
}

const localExecutiveMessageService: ExecutiveMessageService = {
  async getMessages(companyId) {
    const messages = getLocalMessages();
    return messages
      .filter(m => m.company_id === companyId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getPendingMessages(companyId) {
    const messages = await this.getMessages(companyId);
    return messages.filter(m => m.status === 'pending');
  },

  async addMessage(message) {
    const messages = getLocalMessages();
    
    const newMessage: ExecutiveMessage = {
      ...message,
      id: crypto.randomUUID(),
      priority: message.priority || 'normal',
      type: message.type || 'info',
      status: message.status || 'pending',
      created_at: new Date().toISOString(),
    };
    
    messages.unshift(newMessage);
    saveLocalMessages(messages);
    
    return newMessage;
  },

  async updateMessage(id, updates) {
    const messages = getLocalMessages();
    const index = messages.findIndex(m => m.id === id);
    
    if (index === -1) return null;
    
    messages[index] = { ...messages[index], ...updates };
    saveLocalMessages(messages);
    
    return messages[index];
  },

  async markAsRead(id) {
    const result = await this.updateMessage(id, { status: 'read' });
    return result !== null;
  },

  async markAsActioned(id) {
    const result = await this.updateMessage(id, { status: 'actioned' });
    return result !== null;
  },
};

// ============================================
// Export the appropriate service
// ============================================

export const executiveMessageService: ExecutiveMessageService = isSupabaseConfigured
  ? supabaseExecutiveMessageService
  : localExecutiveMessageService;
