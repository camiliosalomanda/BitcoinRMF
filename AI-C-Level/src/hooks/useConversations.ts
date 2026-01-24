/**
 * useConversations Hook
 * 
 * Provides database-backed conversation management.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { conversationService } from '@/lib/db';
import { useCompany } from './useCompany';
import type { Conversation, Message } from '@/types/database';
import type { ExecutiveRole } from '@/types/executives';

interface UseConversationsReturn {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  loadConversation: (executive: ExecutiveRole) => Promise<void>;
  sendMessage: (content: string, executive: ExecutiveRole) => Promise<void>;
  clearConversation: (conversationId: string) => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
  const { company } = useCompany();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all conversations for the company
  useEffect(() => {
    if (company) {
      loadAllConversations();
    }
  }, [company]);

  const loadAllConversations = async () => {
    if (!company) return;

    try {
      const data = await conversationService.getConversations(company.id);
      setConversations(data);
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  // Load or create conversation for an executive
  const loadConversation = useCallback(async (executive: ExecutiveRole) => {
    if (!company) {
      setError('No company context');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to get existing conversation
      let conversation = await conversationService.getConversationByExecutive(
        company.id,
        executive
      );

      // Create new if doesn't exist
      if (!conversation) {
        conversation = await conversationService.createConversation({
          company_id: company.id,
          executive,
          title: `Chat with ${executive}`,
        });
      }

      if (conversation) {
        setCurrentConversation(conversation);
        
        // Load messages
        const msgs = await conversationService.getMessages(conversation.id);
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [company]);

  // Send a message and get response
  const sendMessage = useCallback(async (content: string, executive: ExecutiveRole) => {
    if (!currentConversation) {
      await loadConversation(executive);
    }

    if (!currentConversation) {
      setError('No active conversation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to database
      const userMessage = await conversationService.addMessage({
        conversation_id: currentConversation.id,
        role: 'user',
        content,
        executive,
      });

      if (userMessage) {
        setMessages(prev => [...prev, userMessage]);
      }

      // Note: The actual AI response is handled by the useExecutive hook
      // This hook focuses on database persistence
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, loadConversation]);

  // Add assistant message (called after API response)
  const addAssistantMessage = useCallback(async (content: string, executive: ExecutiveRole) => {
    if (!currentConversation) return;

    try {
      const assistantMessage = await conversationService.addMessage({
        conversation_id: currentConversation.id,
        role: 'assistant',
        content,
        executive,
      });

      if (assistantMessage) {
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Error adding assistant message:', err);
    }
  }, [currentConversation]);

  // Clear/delete a conversation
  const clearConversation = useCallback(async (conversationId: string) => {
    try {
      const success = await conversationService.deleteConversation(conversationId);
      
      if (success) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error clearing conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear conversation');
    }
  }, [currentConversation]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    loadConversation,
    sendMessage,
    clearConversation,
  };
}
