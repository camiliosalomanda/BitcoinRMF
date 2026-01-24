/**
 * Conversations Database Service
 * 
 * Handles all database operations for conversations and messages.
 * Falls back to local storage when Supabase is not configured.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { 
  Conversation, 
  ConversationInsert, 
  Message, 
  MessageInsert 
} from '@/types/database';
import type { ExecutiveRole } from '@/types/executives';

// Temporary user ID for demo purposes
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export interface ConversationService {
  getConversations: (companyId: string) => Promise<Conversation[]>;
  getConversation: (id: string) => Promise<Conversation | null>;
  getConversationByExecutive: (companyId: string, executive: ExecutiveRole) => Promise<Conversation | null>;
  createConversation: (conversation: Omit<ConversationInsert, 'user_id'>) => Promise<Conversation | null>;
  deleteConversation: (id: string) => Promise<boolean>;
  
  getMessages: (conversationId: string) => Promise<Message[]>;
  addMessage: (message: MessageInsert) => Promise<Message | null>;
}

// ============================================
// Supabase Implementation
// ============================================

const supabaseConversationService: ConversationService = {
  async getConversations(companyId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data;
  },

  async getConversation(id) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  },

  async getConversationByExecutive(companyId, executive) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('company_id', companyId)
      .eq('executive', executive)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  },

  async createConversation(conversation) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        ...conversation,
        user_id: DEMO_USER_ID,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  },

  async deleteConversation(id) {
    if (!supabase) return false;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }

    return true;
  },

  async getMessages(conversationId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data;
  },

  async addMessage(message) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', message.conversation_id);

    return data;
  },
};

// ============================================
// Local Storage Implementation (Fallback)
// ============================================

const LOCAL_STORAGE_KEY = 'bizai_conversations';

interface LocalConversationData {
  conversations: Record<string, Conversation>;
  messages: Record<string, Message[]>;
}

function getLocalData(): LocalConversationData {
  if (typeof window === 'undefined') {
    return { conversations: {}, messages: {} };
  }
  
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    return { conversations: {}, messages: {} };
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return { conversations: {}, messages: {} };
  }
}

function saveLocalData(data: LocalConversationData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

const localConversationService: ConversationService = {
  async getConversations(companyId) {
    const data = getLocalData();
    return Object.values(data.conversations)
      .filter(c => c.company_id === companyId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  async getConversation(id) {
    const data = getLocalData();
    return data.conversations[id] || null;
  },

  async getConversationByExecutive(companyId, executive) {
    const data = getLocalData();
    const conversations = Object.values(data.conversations)
      .filter(c => c.company_id === companyId && c.executive === executive)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return conversations[0] || null;
  },

  async createConversation(conversation) {
    const data = getLocalData();
    const newConversation: Conversation = {
      ...conversation,
      id: crypto.randomUUID(),
      user_id: DEMO_USER_ID,
      title: conversation.title || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    data.conversations[newConversation.id] = newConversation;
    data.messages[newConversation.id] = [];
    saveLocalData(data);
    
    return newConversation;
  },

  async deleteConversation(id) {
    const data = getLocalData();
    if (!data.conversations[id]) return false;
    
    delete data.conversations[id];
    delete data.messages[id];
    saveLocalData(data);
    
    return true;
  },

  async getMessages(conversationId) {
    const data = getLocalData();
    return data.messages[conversationId] || [];
  },

  async addMessage(message) {
    const data = getLocalData();
    
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      executive: message.executive || null,
      created_at: new Date().toISOString(),
    };
    
    if (!data.messages[message.conversation_id]) {
      data.messages[message.conversation_id] = [];
    }
    
    data.messages[message.conversation_id].push(newMessage);
    
    // Update conversation timestamp
    if (data.conversations[message.conversation_id]) {
      data.conversations[message.conversation_id].updated_at = new Date().toISOString();
    }
    
    saveLocalData(data);
    return newMessage;
  },
};

// ============================================
// Export the appropriate service
// ============================================

export const conversationService: ConversationService = isSupabaseConfigured
  ? supabaseConversationService
  : localConversationService;
