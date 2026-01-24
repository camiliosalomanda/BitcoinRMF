/**
 * Base Executive Class
 * All AI executives inherit from this class
 */

import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import {
  Executive,
  ExecutiveRole,
  ExecutiveMessage,
  ExecutiveDecision,
  CompanyContext,
  MessagePriority,
} from '@/types/executives';

export abstract class BaseExecutive implements Executive {
  id: string;
  role: ExecutiveRole;
  name: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  isActive: boolean;
  createdAt: Date;

  protected client: Anthropic;
  protected conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [];

  constructor(config: {
    role: ExecutiveRole;
    name: string;
    description: string;
    capabilities: string[];
    systemPrompt: string;
  }) {
    this.id = uuidv4();
    this.role = config.role;
    this.name = config.name;
    this.description = config.description;
    this.capabilities = config.capabilities;
    this.systemPrompt = config.systemPrompt;
    this.isActive = true;
    this.createdAt = new Date();

    // Initialize Anthropic client
    this.client = new Anthropic();
  }

  /**
   * Build the full system prompt including company context
   */
  protected buildSystemPrompt(companyContext?: CompanyContext): string {
    let prompt = this.systemPrompt;

    if (companyContext) {
      prompt += `\n\n## Company Context
- Company Name: ${companyContext.name}
- Industry: ${companyContext.industry}
- Company Size: ${companyContext.size} (${companyContext.employeeCount || 'Unknown'} employees)
- Annual Revenue: ${companyContext.annualRevenue ? `$${companyContext.annualRevenue.toLocaleString()}` : 'Not specified'}
- Fiscal Year End: ${companyContext.fiscalYearEnd}
- Currency: ${companyContext.currency}
- Timezone: ${companyContext.timezone}

### Company Goals
${companyContext.goals.map((g) => `- ${g}`).join('\n')}

### Current Challenges
${companyContext.challenges.map((c) => `- ${c}`).join('\n')}
`;
    }

    return prompt;
  }

  /**
   * Process a user message and generate a response
   */
  async processMessage(
    userMessage: string,
    companyContext?: CompanyContext
  ): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: this.buildSystemPrompt(companyContext),
        messages: this.conversationHistory,
      });

      const assistantMessage =
        response.content[0].type === 'text'
          ? response.content[0].text
          : 'I apologize, but I was unable to generate a response.';

      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      return assistantMessage;
    } catch (error) {
      console.error(`Error in ${this.role} processing:`, error);
      throw error;
    }
  }

  /**
   * Create a message to send to another executive
   */
  createMessage(
    toExecutive: ExecutiveRole | 'ALL',
    subject: string,
    content: string,
    options: {
      priority?: MessagePriority;
      requiresResponse?: boolean;
      parentMessageId?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): ExecutiveMessage {
    return {
      id: uuidv4(),
      fromExecutive: this.role,
      toExecutive,
      subject,
      content,
      priority: options.priority || 'normal',
      status: 'pending',
      requiresResponse: options.requiresResponse || false,
      parentMessageId: options.parentMessageId,
      metadata: options.metadata,
      createdAt: new Date(),
    };
  }

  /**
   * Create a decision/recommendation
   */
  createDecision(
    type: ExecutiveDecision['type'],
    title: string,
    summary: string,
    details: string,
    options: {
      confidence?: number;
      impactAreas?: ExecutiveRole[];
      actionRequired?: boolean;
      deadline?: Date;
      supportingData?: Record<string, unknown>;
    } = {}
  ): ExecutiveDecision {
    return {
      id: uuidv4(),
      executiveRole: this.role,
      type,
      title,
      summary,
      details,
      confidence: options.confidence || 0.8,
      impactAreas: options.impactAreas || [],
      actionRequired: options.actionRequired || false,
      deadline: options.deadline,
      supportingData: options.supportingData,
      createdAt: new Date(),
    };
  }

  /**
   * Handle an incoming message from another executive
   */
  abstract handleIncomingMessage(message: ExecutiveMessage): Promise<ExecutiveMessage | null>;

  /**
   * Generate a periodic report
   */
  abstract generateReport(companyContext: CompanyContext): Promise<ExecutiveDecision>;

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get current conversation history
   */
  getHistory(): { role: 'user' | 'assistant'; content: string }[] {
    return [...this.conversationHistory];
  }
}
