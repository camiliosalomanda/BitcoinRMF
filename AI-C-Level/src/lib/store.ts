/**
 * Global State Store
 * Manages application state using Zustand
 * Conversations and messages are scoped per company
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ExecutiveRole,
  CompanyContext,
  ChatMessage,
  Conversation,
  ExecutiveDecision,
} from '@/types/executives';
import { v4 as uuidv4 } from 'uuid';

// Group chat message types
interface ExecutiveResponse {
  executive: ExecutiveRole;
  name: string;
  response: string;
  tokens: number;
}

interface GroupMessage {
  id: string;
  type: 'user' | 'responses' | 'unified';
  content?: string;
  responses?: ExecutiveResponse[];
  timestamp: Date;
}

// Company-scoped data structure
interface CompanyData {
  conversations: Record<ExecutiveRole, Conversation>;
  groupMessages: GroupMessage[];
  decisions: ExecutiveDecision[];
}

interface AppState {
  // Active Company ID
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;

  // Company Context
  companyContext: CompanyContext | null;
  setCompanyContext: (context: CompanyContext) => void;
  updateCompanyContext: (updates: Partial<CompanyContext>) => void;

  // Company-scoped data (keyed by company ID)
  companyData: Record<string, CompanyData>;

  // Conversations (scoped to active company)
  activeExecutive: ExecutiveRole | null;
  setActiveExecutive: (role: ExecutiveRole | null) => void;
  addMessage: (role: ExecutiveRole, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearConversation: (role: ExecutiveRole) => void;
  getConversation: (role: ExecutiveRole) => Conversation | undefined;
  getMessages: (role: ExecutiveRole) => ChatMessage[];

  // Group Chat (scoped to active company)
  getGroupMessages: () => GroupMessage[];
  addGroupMessage: (message: Omit<GroupMessage, 'id' | 'timestamp'>) => void;
  deleteGroupMessage: (id: string) => void;
  clearGroupMessages: () => void;

  // Decisions (scoped to active company)
  addDecision: (decision: ExecutiveDecision) => void;
  getDecisionsByExecutive: (role: ExecutiveRole) => ExecutiveDecision[];

  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Onboarding
  isOnboarded: boolean;
  setOnboarded: (onboarded: boolean) => void;
}

// Default company context for new users
const defaultCompanyContext: CompanyContext = {
  id: uuidv4(),
  name: '',
  industry: '',
  size: 'small',
  currency: 'USD',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  fiscalYearEnd: 'December',
  goals: [],
  challenges: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Create empty company data
function createEmptyCompanyData(): CompanyData {
  return {
    conversations: {} as Record<ExecutiveRole, Conversation>,
    groupMessages: [],
    decisions: [],
  };
}

// Create conversation for an executive
function createConversation(role: ExecutiveRole): Conversation {
  return {
    id: uuidv4(),
    executive: role,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Helper to get or create company data
function getCompanyData(state: AppState, companyId: string | null): CompanyData {
  if (!companyId) return createEmptyCompanyData();
  return state.companyData[companyId] || createEmptyCompanyData();
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Active Company ID
      activeCompanyId: null,
      setActiveCompanyId: (id) => set({ activeCompanyId: id }),

      // Company Context
      companyContext: null,
      setCompanyContext: (context) => set({ companyContext: context }),
      updateCompanyContext: (updates) =>
        set((state) => ({
          companyContext: state.companyContext
            ? { ...state.companyContext, ...updates, updatedAt: new Date() }
            : { ...defaultCompanyContext, ...updates },
        })),

      // Company-scoped data
      companyData: {},

      // Conversations
      activeExecutive: null,
      setActiveExecutive: (role) => set({ activeExecutive: role }),
      
      addMessage: (role, message) =>
        set((state) => {
          const companyId = state.activeCompanyId;
          if (!companyId) return state;

          const companyData = { ...state.companyData };
          if (!companyData[companyId]) {
            companyData[companyId] = createEmptyCompanyData();
          }

          const conversations = { ...companyData[companyId].conversations };
          let conversation = conversations[role];

          if (!conversation) {
            conversation = createConversation(role);
          } else {
            conversation = { ...conversation };
          }

          const newMessage: ChatMessage = {
            ...message,
            id: uuidv4(),
            timestamp: new Date(),
          };

          conversation.messages = [...conversation.messages, newMessage];
          conversation.updatedAt = new Date();
          conversations[role] = conversation;
          companyData[companyId] = { ...companyData[companyId], conversations };

          return { companyData };
        }),

      clearConversation: (role) =>
        set((state) => {
          const companyId = state.activeCompanyId;
          if (!companyId) return state;

          const companyData = { ...state.companyData };
          if (!companyData[companyId]) {
            companyData[companyId] = createEmptyCompanyData();
          }

          const conversations = { ...companyData[companyId].conversations };
          conversations[role] = createConversation(role);
          companyData[companyId] = { ...companyData[companyId], conversations };

          return { companyData };
        }),

      getConversation: (role) => {
        const state = get();
        const companyId = state.activeCompanyId;
        if (!companyId) return undefined;
        return state.companyData[companyId]?.conversations[role];
      },

      getMessages: (role) => {
        const state = get();
        const companyId = state.activeCompanyId;
        if (!companyId) return [];
        const conversation = state.companyData[companyId]?.conversations[role];
        return conversation?.messages || [];
      },

      // Group Chat
      getGroupMessages: () => {
        const state = get();
        const companyId = state.activeCompanyId;
        if (!companyId) return [];
        return state.companyData[companyId]?.groupMessages || [];
      },

      addGroupMessage: (message) =>
        set((state) => {
          const companyId = state.activeCompanyId;
          if (!companyId) return state;

          const companyData = { ...state.companyData };
          if (!companyData[companyId]) {
            companyData[companyId] = createEmptyCompanyData();
          }

          const newMessage: GroupMessage = {
            ...message,
            id: uuidv4(),
            timestamp: new Date(),
          };

          companyData[companyId] = {
            ...companyData[companyId],
            groupMessages: [...companyData[companyId].groupMessages, newMessage],
          };

          return { companyData };
        }),

      deleteGroupMessage: (id) =>
        set((state) => {
          const companyId = state.activeCompanyId;
          if (!companyId) return state;

          const companyData = { ...state.companyData };
          if (!companyData[companyId]) return state;

          companyData[companyId] = {
            ...companyData[companyId],
            groupMessages: companyData[companyId].groupMessages.filter((m) => m.id !== id),
          };

          return { companyData };
        }),

      clearGroupMessages: () =>
        set((state) => {
          const companyId = state.activeCompanyId;
          if (!companyId) return state;

          const companyData = { ...state.companyData };
          if (!companyData[companyId]) return state;

          companyData[companyId] = {
            ...companyData[companyId],
            groupMessages: [],
          };

          return { companyData };
        }),

      // Decisions
      addDecision: (decision) =>
        set((state) => {
          const companyId = state.activeCompanyId;
          if (!companyId) return state;

          const companyData = { ...state.companyData };
          if (!companyData[companyId]) {
            companyData[companyId] = createEmptyCompanyData();
          }

          companyData[companyId] = {
            ...companyData[companyId],
            decisions: [...companyData[companyId].decisions, decision],
          };

          return { companyData };
        }),

      getDecisionsByExecutive: (role) => {
        const state = get();
        const companyId = state.activeCompanyId;
        if (!companyId) return [];
        const decisions = state.companyData[companyId]?.decisions || [];
        return decisions.filter((d) => d.executiveRole === role);
      },

      // UI State
      isSidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // Onboarding
      isOnboarded: false,
      setOnboarded: (onboarded) => set({ isOnboarded: onboarded }),
    }),
    {
      name: 'bizai-storage',
      partialize: (state) => ({
        companyContext: state.companyContext,
        isOnboarded: state.isOnboarded,
        isSidebarOpen: state.isSidebarOpen,
        companyData: state.companyData,
        activeCompanyId: state.activeCompanyId,
      }),
    }
  )
);
