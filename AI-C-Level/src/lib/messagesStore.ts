import { create } from 'zustand';
import { ExecutiveRole } from '@/types/executives';
import { v4 as uuidv4 } from 'uuid';

// Message type definition
export interface ExecutiveMessage {
  id: string;
  fromExecutive: ExecutiveRole;
  toExecutive: ExecutiveRole | 'all';
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  type: 'info' | 'request' | 'approval' | 'alert';
  status: 'pending' | 'read' | 'actioned';
  timestamp: Date;
}

interface MessagesState {
  messages: ExecutiveMessage[];
  
  // Actions
  addMessage: (message: Omit<ExecutiveMessage, 'id' | 'timestamp' | 'status'>) => void;
  markAsRead: (messageId: string) => void;
  markAsActioned: (messageId: string) => void;
  clearMessages: () => void;
  
  // Selectors
  getMessagesByExecutive: (role: ExecutiveRole) => ExecutiveMessage[];
  getPendingMessages: () => ExecutiveMessage[];
  getUrgentMessages: () => ExecutiveMessage[];
}

// Demo messages for initial state - disabled for production
const createDemoMessages = (): ExecutiveMessage[] => {
  // Return empty array - messages will be generated through actual executive interactions
  return [];
};

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: createDemoMessages(),

  addMessage: (messageData) => {
    const message: ExecutiveMessage = {
      ...messageData,
      id: uuidv4(),
      timestamp: new Date(),
      status: 'pending',
    };

    set((state) => ({
      messages: [message, ...state.messages],
    }));
  },

  markAsRead: (messageId) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status: 'read' as const } : msg
      ),
    }));
  },

  markAsActioned: (messageId) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status: 'actioned' as const } : msg
      ),
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  getMessagesByExecutive: (role) => {
    return get().messages.filter(
      (msg) => msg.fromExecutive === role || msg.toExecutive === role || msg.toExecutive === 'all'
    );
  },

  getPendingMessages: () => {
    return get().messages.filter((msg) => msg.status === 'pending');
  },

  getUrgentMessages: () => {
    return get().messages.filter(
      (msg) => msg.priority === 'urgent' && msg.status === 'pending'
    );
  },
}));

// Hook to simulate executives generating messages during conversations
export function useExecutiveMessaging() {
  const { addMessage } = useMessagesStore();

  const simulateCollaboration = (
    fromExecutive: ExecutiveRole,
    responseContent: string
  ) => {
    // Detect collaboration triggers in the response
    const triggers = detectCollaborationTriggers(responseContent, fromExecutive);
    
    triggers.forEach((trigger) => {
      // Add a small delay to make it feel more natural
      setTimeout(() => {
        addMessage(trigger);
      }, 1000 + Math.random() * 2000);
    });
  };

  return { simulateCollaboration };
}

// Detect when an executive response suggests collaboration
function detectCollaborationTriggers(
  content: string,
  fromExecutive: ExecutiveRole
): Array<Omit<ExecutiveMessage, 'id' | 'timestamp' | 'status'>> {
  const triggers: Array<Omit<ExecutiveMessage, 'id' | 'timestamp' | 'status'>> = [];
  const contentLower = content.toLowerCase();

  // CFO triggers
  if (fromExecutive === 'CFO') {
    if (contentLower.includes('marketing budget') || contentLower.includes('marketing spend')) {
      triggers.push({
        fromExecutive: 'CFO',
        toExecutive: 'CMO',
        subject: 'Budget Discussion Needed',
        content: 'I\'ve been reviewing financial projections. Let\'s discuss the marketing budget allocation.',
        priority: 'normal',
        type: 'request',
      });
    }
    if (contentLower.includes('hiring') || contentLower.includes('headcount')) {
      triggers.push({
        fromExecutive: 'CFO',
        toExecutive: 'CHRO',
        subject: 'Headcount Budget Review',
        content: 'Need to align on hiring budget for the upcoming quarter.',
        priority: 'normal',
        type: 'request',
      });
    }
  }

  // CMO triggers
  if (fromExecutive === 'CMO') {
    if (contentLower.includes('budget') && contentLower.includes('approv')) {
      triggers.push({
        fromExecutive: 'CMO',
        toExecutive: 'CFO',
        subject: 'Campaign Budget Approval Request',
        content: 'Requesting budget approval for the proposed marketing campaign.',
        priority: 'high',
        type: 'approval',
      });
    }
    if (contentLower.includes('capacity') || contentLower.includes('fulfillment')) {
      triggers.push({
        fromExecutive: 'CMO',
        toExecutive: 'COO',
        subject: 'Fulfillment Capacity Check',
        content: 'Planning a campaign that may increase order volume. Need to verify fulfillment capacity.',
        priority: 'normal',
        type: 'info',
      });
    }
  }

  // COO triggers
  if (fromExecutive === 'COO') {
    if (contentLower.includes('staffing') || contentLower.includes('hire')) {
      triggers.push({
        fromExecutive: 'COO',
        toExecutive: 'CHRO',
        subject: 'Staffing Need Identified',
        content: 'Operational analysis indicates we need additional team members.',
        priority: 'normal',
        type: 'request',
      });
    }
    if (contentLower.includes('investment') || contentLower.includes('equipment')) {
      triggers.push({
        fromExecutive: 'COO',
        toExecutive: 'CFO',
        subject: 'Operational Investment Proposal',
        content: 'Identified efficiency improvements requiring capital investment.',
        priority: 'normal',
        type: 'approval',
      });
    }
  }

  // CTO triggers
  if (fromExecutive === 'CTO') {
    if (contentLower.includes('security') && (contentLower.includes('invest') || contentLower.includes('cost'))) {
      triggers.push({
        fromExecutive: 'CTO',
        toExecutive: 'CFO',
        subject: 'Security Investment Required',
        content: 'Security assessment indicates need for technology investment.',
        priority: 'high',
        type: 'approval',
      });
    }
    if (contentLower.includes('training') || contentLower.includes('team skill')) {
      triggers.push({
        fromExecutive: 'CTO',
        toExecutive: 'CHRO',
        subject: 'Technical Training Request',
        content: 'Team needs additional technical training for new systems.',
        priority: 'normal',
        type: 'request',
      });
    }
  }

  // CHRO triggers
  if (fromExecutive === 'CHRO') {
    if (contentLower.includes('compensation') || contentLower.includes('salary')) {
      triggers.push({
        fromExecutive: 'CHRO',
        toExecutive: 'CFO',
        subject: 'Compensation Review Discussion',
        content: 'Need to discuss compensation adjustments based on market analysis.',
        priority: 'normal',
        type: 'request',
      });
    }
    if (contentLower.includes('employer brand')) {
      triggers.push({
        fromExecutive: 'CHRO',
        toExecutive: 'CMO',
        subject: 'Employer Branding Collaboration',
        content: 'Would like to collaborate on employer branding initiatives.',
        priority: 'low',
        type: 'info',
      });
    }
  }

  return triggers;
}
