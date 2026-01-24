/**
 * useExecutive Hook
 * Provides interface for chatting with AI executives
 */

import { useState, useCallback } from 'react';
import { ExecutiveRole, ChatMessage, CompanyContext } from '@/types/executives';
import { useAppStore } from '@/lib/store';
import { useExecutiveMessaging } from '@/lib/messagesStore';
import { useInsightGeneration } from '@/lib/insightsStore';

interface UseExecutiveOptions {
  executive: ExecutiveRole;
  companyContext?: CompanyContext;
}

interface UseExecutiveReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
}

export function useExecutive({
  executive,
  companyContext,
}: UseExecutiveOptions): UseExecutiveReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    getConversation,
    addMessage,
    clearConversation,
    companyContext: storedContext,
  } = useAppStore();

  const { simulateCollaboration } = useExecutiveMessaging();
  const { generateInsights } = useInsightGeneration();

  const conversation = getConversation(executive);
  const messages = conversation?.messages || [];
  const context = companyContext || storedContext;

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setIsLoading(true);
      setError(null);

      // Add user message
      addMessage(executive, {
        role: 'user',
        content,
        executive,
      });

      try {
        // Build conversation history for API
        const conversationHistory = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            executive,
            conversationHistory,
            companyContext: context,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get response');
        }

        const data = await response.json();

        // Add assistant message
        addMessage(executive, {
          role: 'assistant',
          content: data.message,
          executive,
        });

        // Check if this response should trigger collaboration with other executives
        simulateCollaboration(executive, data.message);
        
        // Generate insights from the response
        generateInsights(executive, data.message, content);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);

        // Add error message to chat
        addMessage(executive, {
          role: 'assistant',
          content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
          executive,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [executive, messages, context, addMessage, simulateCollaboration, generateInsights]
  );

  const clearHistory = useCallback(() => {
    clearConversation(executive);
    setError(null);
  }, [executive, clearConversation]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
  };
}
