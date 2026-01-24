/**
 * Executive Orchestration Layer
 * Manages communication and coordination between AI executives
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ExecutiveRole,
  ExecutiveMessage,
  ExecutiveDecision,
  CompanyContext,
  MessagePriority,
} from '@/types/executives';
import { BaseExecutive } from '../executives/base-executive';
import { CFOExecutive, createCFO } from '../executives/cfo-executive';

interface MessageQueueItem {
  message: ExecutiveMessage;
  retries: number;
  maxRetries: number;
}

interface OrchestratorConfig {
  companyContext: CompanyContext;
  enableAutoRouting?: boolean;
  enableNotifications?: boolean;
}

export class ExecutiveOrchestrator {
  private executives: Map<ExecutiveRole, BaseExecutive> = new Map();
  private messageQueue: MessageQueueItem[] = [];
  private processedMessages: Map<string, ExecutiveMessage> = new Map();
  private decisions: ExecutiveDecision[] = [];
  private companyContext: CompanyContext;
  private enableAutoRouting: boolean;
  private enableNotifications: boolean;

  constructor(config: OrchestratorConfig) {
    this.companyContext = config.companyContext;
    this.enableAutoRouting = config.enableAutoRouting ?? true;
    this.enableNotifications = config.enableNotifications ?? true;
  }

  /**
   * Initialize all executives
   */
  initializeExecutives(): void {
    // Initialize CFO
    const cfo = createCFO();
    this.executives.set('CFO', cfo);

    // Future: Initialize other executives as they're built
    // this.executives.set('CMO', createCMO());
    // this.executives.set('COO', createCOO());
    // this.executives.set('CHRO', createCHRO());
    // this.executives.set('CTO', createCTO());

    console.log(`Initialized ${this.executives.size} executive(s)`);
  }

  /**
   * Get an executive by role
   */
  getExecutive(role: ExecutiveRole): BaseExecutive | undefined {
    return this.executives.get(role);
  }

  /**
   * Get CFO specifically (type-safe)
   */
  getCFO(): CFOExecutive | undefined {
    return this.executives.get('CFO') as CFOExecutive | undefined;
  }

  /**
   * Get all active executives
   */
  getActiveExecutives(): BaseExecutive[] {
    return Array.from(this.executives.values()).filter((exec) => exec.isActive);
  }

  /**
   * Send a message between executives
   */
  async sendMessage(message: ExecutiveMessage): Promise<ExecutiveMessage | null> {
    // Add to queue
    this.messageQueue.push({
      message,
      retries: 0,
      maxRetries: 3,
    });

    // Process immediately if auto-routing is enabled
    if (this.enableAutoRouting) {
      return this.processNextMessage();
    }

    return null;
  }

  /**
   * Broadcast a message to all executives
   */
  async broadcastMessage(
    fromExecutive: ExecutiveRole,
    subject: string,
    content: string,
    priority: MessagePriority = 'normal'
  ): Promise<void> {
    const message: ExecutiveMessage = {
      id: uuidv4(),
      fromExecutive,
      toExecutive: 'ALL',
      subject,
      content,
      priority,
      status: 'pending',
      requiresResponse: false,
      createdAt: new Date(),
    };

    // Send to all other executives
    for (const [role, executive] of this.executives) {
      if (role !== fromExecutive) {
        const targetedMessage = { ...message, toExecutive: role };
        await executive.handleIncomingMessage(targetedMessage);
      }
    }

    this.processedMessages.set(message.id, message);
  }

  /**
   * Process the next message in the queue
   */
  private async processNextMessage(): Promise<ExecutiveMessage | null> {
    const item = this.messageQueue.shift();
    if (!item) return null;

    const { message } = item;
    const targetExecutive = this.executives.get(message.toExecutive as ExecutiveRole);

    if (!targetExecutive) {
      console.warn(`Executive ${message.toExecutive} not found`);
      return null;
    }

    try {
      const response = await targetExecutive.handleIncomingMessage(message);
      
      // Mark as processed
      message.status = 'completed';
      this.processedMessages.set(message.id, message);

      // If there's a response, queue it
      if (response) {
        this.messageQueue.push({
          message: response,
          retries: 0,
          maxRetries: 3,
        });
      }

      return response;
    } catch (error) {
      console.error(`Error processing message: ${error}`);
      
      // Retry logic
      if (item.retries < item.maxRetries) {
        item.retries++;
        this.messageQueue.push(item);
      } else {
        message.status = 'blocked';
        this.processedMessages.set(message.id, message);
      }

      return null;
    }
  }

  /**
   * Process all pending messages
   */
  async processAllMessages(): Promise<void> {
    while (this.messageQueue.length > 0) {
      await this.processNextMessage();
    }
  }

  /**
   * Record a decision
   */
  recordDecision(decision: ExecutiveDecision): void {
    this.decisions.push(decision);

    // Notify impacted executives if notifications are enabled
    if (this.enableNotifications && decision.impactAreas.length > 0) {
      const fromExec = this.executives.get(decision.executiveRole);
      if (fromExec) {
        for (const impactedRole of decision.impactAreas) {
          const message = fromExec.createMessage(
            impactedRole,
            `Decision: ${decision.title}`,
            `${decision.summary}\n\n${decision.details}`,
            {
              priority: decision.actionRequired ? 'high' : 'normal',
              requiresResponse: decision.actionRequired,
            }
          );
          this.sendMessage(message);
        }
      }
    }
  }

  /**
   * Get all decisions
   */
  getDecisions(): ExecutiveDecision[] {
    return [...this.decisions];
  }

  /**
   * Get decisions by executive
   */
  getDecisionsByExecutive(role: ExecutiveRole): ExecutiveDecision[] {
    return this.decisions.filter((d) => d.executiveRole === role);
  }

  /**
   * Get pending decisions requiring action
   */
  getPendingDecisions(): ExecutiveDecision[] {
    return this.decisions.filter((d) => d.actionRequired);
  }

  /**
   * Update company context
   */
  updateCompanyContext(context: Partial<CompanyContext>): void {
    this.companyContext = {
      ...this.companyContext,
      ...context,
      updatedAt: new Date(),
    };
  }

  /**
   * Get company context
   */
  getCompanyContext(): CompanyContext {
    return { ...this.companyContext };
  }

  /**
   * Generate reports from all executives
   */
  async generateAllReports(): Promise<ExecutiveDecision[]> {
    const reports: ExecutiveDecision[] = [];

    for (const executive of this.executives.values()) {
      try {
        const report = await executive.generateReport(this.companyContext);
        reports.push(report);
        this.recordDecision(report);
      } catch (error) {
        console.error(`Error generating report for ${executive.role}: ${error}`);
      }
    }

    return reports;
  }

  /**
   * Clear all message history for all executives
   */
  clearAllHistory(): void {
    for (const executive of this.executives.values()) {
      executive.clearHistory();
    }
    this.processedMessages.clear();
    this.messageQueue = [];
  }
}

/**
 * Factory function to create an orchestrator with default settings
 */
export function createOrchestrator(companyContext: CompanyContext): ExecutiveOrchestrator {
  const orchestrator = new ExecutiveOrchestrator({ companyContext });
  orchestrator.initializeExecutives();
  return orchestrator;
}
