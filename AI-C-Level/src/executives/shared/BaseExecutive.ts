import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import type {
  Executive,
  ExecutiveRole,
  ExecutiveMessage,
  ExecutiveRequest,
  ConversationMessage,
  ExecutiveAction,
  MessagePriority,
} from '@/types';

// ============================================
// Base Executive Class
// ============================================

export abstract class BaseExecutive implements Executive {
  id: string;
  role: ExecutiveRole;
  name: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  isActive: boolean = true;

  protected client: Anthropic;
  protected conversationHistory: ConversationMessage[] = [];
  protected pendingRequests: ExecutiveRequest[] = [];
  protected messageQueue: ExecutiveMessage[] = [];

  constructor(config: Omit<Executive, 'id' | 'isActive'>) {
    this.id = uuidv4();
    this.role = config.role;
    this.name = config.name;
    this.description = config.description;
    this.capabilities = config.capabilities;
    this.systemPrompt = config.systemPrompt;
    
    // Initialize Anthropic client
    this.client = new Anthropic();
  }

  // ============================================
  // Core AI Methods
  // ============================================

  async chat(userMessage: string, context?: Record<string, unknown>): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Build context-aware system prompt
    const enhancedSystemPrompt = this.buildSystemPrompt(context);

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: enhancedSystemPrompt,
        messages: this.conversationHistory.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })).filter((msg) => msg.role !== 'system') as Anthropic.MessageParam[],
      });

      const assistantMessage = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      // Add assistant response to history
      this.conversationHistory.push({
        id: uuidv4(),
        role: 'assistant',
        content: assistantMessage,
        executive: this.role,
        timestamp: new Date(),
      });

      // Check if response suggests inter-executive communication
      await this.processResponseForCollaboration(assistantMessage);

      return assistantMessage;
    } catch (error) {
      console.error(`[${this.role}] Error in chat:`, error);
      throw error;
    }
  }

  protected buildSystemPrompt(context?: Record<string, unknown>): string {
    let prompt = this.systemPrompt;

    // Add pending requests context
    if (this.pendingRequests.length > 0) {
      prompt += `\n\n## Pending Requests from Other Executives\n`;
      this.pendingRequests.forEach((req) => {
        prompt += `- From ${req.fromExecutive}: ${req.subject} (${req.requestType})\n`;
      });
    }

    // Add any additional context
    if (context) {
      prompt += `\n\n## Current Context\n${JSON.stringify(context, null, 2)}`;
    }

    return prompt;
  }

  // ============================================
  // Inter-Executive Communication
  // ============================================

  async sendMessage(
    toExecutive: ExecutiveRole | 'user' | 'all',
    subject: string,
    content: string,
    priority: MessagePriority = 'normal'
  ): Promise<ExecutiveMessage> {
    const message: ExecutiveMessage = {
      id: uuidv4(),
      fromExecutive: this.role,
      toExecutive,
      subject,
      content,
      priority,
      status: 'pending',
      createdAt: new Date(),
    };

    this.messageQueue.push(message);
    return message;
  }

  async requestApproval(
    toExecutive: ExecutiveRole,
    subject: string,
    details: string,
    requiredBy?: Date
  ): Promise<ExecutiveRequest> {
    const request: ExecutiveRequest = {
      id: uuidv4(),
      fromExecutive: this.role,
      toExecutive,
      requestType: 'approval',
      subject,
      details,
      requiredBy,
      status: 'pending',
      createdAt: new Date(),
    };

    return request;
  }

  receiveRequest(request: ExecutiveRequest): void {
    this.pendingRequests.push(request);
  }

  async processRequest(requestId: string, approved: boolean, response?: string): Promise<ExecutiveRequest | null> {
    const requestIndex = this.pendingRequests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) return null;

    const request = this.pendingRequests[requestIndex];
    request.status = approved ? 'approved' : 'denied';
    request.response = response;

    // Remove from pending
    this.pendingRequests.splice(requestIndex, 1);

    return request;
  }

  // ============================================
  // Abstract Methods (Implemented by Each Executive)
  // ============================================

  abstract analyzeData(data: unknown): Promise<unknown>;
  abstract generateReport(reportType: string, params?: Record<string, unknown>): Promise<unknown>;
  abstract getInsights(): Promise<unknown[]>;

  // ============================================
  // Protected Helper Methods
  // ============================================

  protected async processResponseForCollaboration(response: string): Promise<void> {
    // Override in subclasses to detect when collaboration is needed
    // e.g., CFO detects budget request that needs CMO input
  }

  protected async executeAction(action: ExecutiveAction): Promise<unknown> {
    // Override in subclasses for executive-specific actions
    console.log(`[${this.role}] Executing action: ${action.actionType}`);
    return null;
  }

  // ============================================
  // Utility Methods
  // ============================================

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  getPendingRequests(): ExecutiveRequest[] {
    return [...this.pendingRequests];
  }

  getMessageQueue(): ExecutiveMessage[] {
    return [...this.messageQueue];
  }

  toJSON(): Executive {
    return {
      id: this.id,
      role: this.role,
      name: this.name,
      description: this.description,
      capabilities: this.capabilities,
      systemPrompt: this.systemPrompt,
      isActive: this.isActive,
    };
  }
}

// ============================================
// Executive Registry (Singleton)
// ============================================

class ExecutiveRegistry {
  private static instance: ExecutiveRegistry;
  private executives: Map<ExecutiveRole, BaseExecutive> = new Map();

  private constructor() {}

  static getInstance(): ExecutiveRegistry {
    if (!ExecutiveRegistry.instance) {
      ExecutiveRegistry.instance = new ExecutiveRegistry();
    }
    return ExecutiveRegistry.instance;
  }

  register(executive: BaseExecutive): void {
    this.executives.set(executive.role, executive);
  }

  get(role: ExecutiveRole): BaseExecutive | undefined {
    return this.executives.get(role);
  }

  getAll(): BaseExecutive[] {
    return Array.from(this.executives.values());
  }

  async broadcast(
    fromExecutive: ExecutiveRole,
    subject: string,
    content: string,
    priority: MessagePriority = 'normal'
  ): Promise<void> {
    const sender = this.executives.get(fromExecutive);
    if (!sender) return;

    for (const [role, executive] of this.executives) {
      if (role !== fromExecutive) {
        await sender.sendMessage(role, subject, content, priority);
      }
    }
  }

  async routeRequest(request: ExecutiveRequest): Promise<void> {
    const targetExecutive = this.executives.get(request.toExecutive);
    if (targetExecutive) {
      targetExecutive.receiveRequest(request);
    }
  }
}

export const executiveRegistry = ExecutiveRegistry.getInstance();
