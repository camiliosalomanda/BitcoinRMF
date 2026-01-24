/**
 * AI CFO Executive
 * Handles financial strategy, budgeting, cash flow, and financial reporting
 */

import { BaseExecutive } from './base-executive';
import {
  ExecutiveMessage,
  ExecutiveDecision,
  CompanyContext,
  FinancialMetric,
  BudgetItem,
  CashFlowProjection,
  FinancialReport,
} from '@/types/executives';
import { v4 as uuidv4 } from 'uuid';

const CFO_SYSTEM_PROMPT = `You are the AI Chief Financial Officer (CFO) for a small business. Your role is to provide strategic financial guidance, analysis, and recommendations.

## Your Core Responsibilities

### 1. Financial Strategy & Planning
- Develop and monitor financial strategies aligned with business goals
- Create financial forecasts and projections
- Advise on capital allocation and investment decisions
- Identify financial risks and opportunities

### 2. Cash Flow Management
- Monitor cash flow and working capital
- Forecast cash needs and runway
- Recommend strategies to optimize cash position
- Alert on potential cash flow issues

### 3. Budgeting & Cost Control
- Create and manage departmental budgets
- Track spending against budgets
- Identify cost-saving opportunities
- Approve or flag budget requests from other executives

### 4. Financial Reporting & Analysis
- Generate financial reports and KPIs
- Analyze financial performance trends
- Provide insights on profitability and efficiency
- Benchmark against industry standards

### 5. Cross-Executive Collaboration
- Review budget requests from CMO for marketing spend
- Advise COO on operational cost efficiency
- Support CHRO with compensation and benefits analysis
- Provide financial context for strategic decisions

## Communication Style
- Be clear, precise, and data-driven
- Explain financial concepts in accessible terms for non-finance stakeholders
- Always quantify impacts when possible
- Proactively flag risks and opportunities
- Be direct but diplomatic when delivering difficult financial news

## Decision Framework
When making recommendations:
1. Consider the financial impact (short-term and long-term)
2. Assess risk vs. reward
3. Evaluate alignment with company goals
4. Consider cash flow implications
5. Factor in market conditions and industry benchmarks

You are helpful, proactive, and focused on the financial health and growth of the business.`;

export class CFOExecutive extends BaseExecutive {
  private financialMetrics: FinancialMetric[] = [];
  private budgetItems: BudgetItem[] = [];
  private cashFlowProjections: CashFlowProjection[] = [];

  constructor() {
    super({
      role: 'CFO',
      name: 'AI Chief Financial Officer',
      description: 'Strategic financial management, budgeting, cash flow optimization, and financial reporting',
      capabilities: [
        'Financial strategy and planning',
        'Cash flow management and forecasting',
        'Budget creation and monitoring',
        'Financial reporting and KPI tracking',
        'Cost analysis and optimization',
        'Investment and capital allocation advice',
        'Risk assessment and mitigation',
        'Cross-departmental budget reviews',
      ],
      systemPrompt: CFO_SYSTEM_PROMPT,
    });
  }

  /**
   * Analyze a budget request from another executive
   */
  async analyzeBudgetRequest(
    request: {
      fromExecutive: string;
      amount: number;
      purpose: string;
      expectedROI?: string;
      timeline?: string;
    },
    companyContext: CompanyContext
  ): Promise<ExecutiveDecision> {
    const analysisPrompt = `Analyze this budget request and provide a recommendation:

From: ${request.fromExecutive}
Amount Requested: $${request.amount.toLocaleString()}
Purpose: ${request.purpose}
Expected ROI: ${request.expectedROI || 'Not specified'}
Timeline: ${request.timeline || 'Not specified'}

Please analyze this request considering:
1. Current financial position and cash flow
2. Alignment with company goals
3. Expected return on investment
4. Risk factors
5. Alternative approaches if any

Provide a clear recommendation (approve, approve with modifications, or decline) with reasoning.`;

    const analysis = await this.processMessage(analysisPrompt, companyContext);

    // Determine approval type based on response
    const isApproval = analysis.toLowerCase().includes('approve') && 
                       !analysis.toLowerCase().includes('decline');
    
    return this.createDecision(
      isApproval ? 'approval' : 'rejection',
      `Budget Request: ${request.purpose}`,
      isApproval 
        ? `Approved budget request for $${request.amount.toLocaleString()}`
        : `Budget request requires revision`,
      analysis,
      {
        confidence: 0.85,
        impactAreas: [request.fromExecutive as 'CMO' | 'COO' | 'CHRO' | 'CTO'],
        actionRequired: true,
        supportingData: { request },
      }
    );
  }

  /**
   * Generate cash flow analysis
   */
  async analyzeCashFlow(
    financialData: {
      currentCash: number;
      monthlyRevenue: number;
      monthlyExpenses: number;
      accountsReceivable?: number;
      accountsPayable?: number;
    },
    companyContext: CompanyContext
  ): Promise<CashFlowProjection> {
    const prompt = `Analyze this cash flow situation and provide insights:

Current Cash Position: $${financialData.currentCash.toLocaleString()}
Monthly Revenue: $${financialData.monthlyRevenue.toLocaleString()}
Monthly Expenses: $${financialData.monthlyExpenses.toLocaleString()}
Accounts Receivable: $${(financialData.accountsReceivable || 0).toLocaleString()}
Accounts Payable: $${(financialData.accountsPayable || 0).toLocaleString()}

Calculate:
1. Net monthly cash flow
2. Cash runway in months
3. Key risks and alerts
4. Recommendations for improvement`;

    const analysis = await this.processMessage(prompt, companyContext);
    
    const netCashFlow = financialData.monthlyRevenue - financialData.monthlyExpenses;
    const runwayMonths = netCashFlow >= 0 
      ? Infinity 
      : Math.floor(financialData.currentCash / Math.abs(netCashFlow));

    const projection: CashFlowProjection = {
      id: uuidv4(),
      period: new Date().toISOString().slice(0, 7),
      inflows: financialData.monthlyRevenue,
      outflows: financialData.monthlyExpenses,
      netCashFlow,
      runwayMonths: runwayMonths === Infinity ? 999 : runwayMonths,
      alerts: this.extractAlerts(analysis),
    };

    this.cashFlowProjections.push(projection);
    return projection;
  }

  /**
   * Handle incoming messages from other executives
   */
  async handleIncomingMessage(message: ExecutiveMessage): Promise<ExecutiveMessage | null> {
    // Analyze the incoming message
    const responsePrompt = `You received a message from the ${message.fromExecutive}:

Subject: ${message.subject}
Priority: ${message.priority}

Message:
${message.content}

Please provide a thoughtful response as the CFO, considering financial implications and providing actionable guidance.`;

    const response = await this.processMessage(responsePrompt);

    if (message.requiresResponse) {
      return this.createMessage(
        message.fromExecutive,
        `RE: ${message.subject}`,
        response,
        {
          priority: message.priority,
          parentMessageId: message.id,
        }
      );
    }

    return null;
  }

  /**
   * Generate a financial report
   */
  async generateReport(companyContext: CompanyContext): Promise<ExecutiveDecision> {
    const reportPrompt = `Generate a comprehensive financial status report for ${companyContext.name}.

Include:
1. Executive Summary
2. Key Financial Metrics & KPIs
3. Cash Flow Status
4. Budget Performance
5. Risks and Opportunities
6. Recommendations

Make it actionable and highlight any areas requiring immediate attention.`;

    const report = await this.processMessage(reportPrompt, companyContext);

    return this.createDecision(
      'recommendation',
      'Monthly Financial Report',
      'Financial status overview and recommendations',
      report,
      {
        confidence: 0.9,
        impactAreas: ['CMO', 'COO', 'CHRO', 'CTO'],
        actionRequired: false,
      }
    );
  }

  /**
   * Analyze a financial scenario
   */
  async analyzeScenario(
    scenario: string,
    companyContext: CompanyContext
  ): Promise<string> {
    const prompt = `Analyze this financial scenario and provide guidance:

${scenario}

Consider:
1. Financial impact (quantify if possible)
2. Risk assessment
3. Cash flow implications
4. Strategic alignment
5. Recommendations`;

    return this.processMessage(prompt, companyContext);
  }

  /**
   * Extract alerts from analysis text
   */
  private extractAlerts(analysis: string): string[] {
    const alerts: string[] = [];
    const alertKeywords = ['warning', 'alert', 'concern', 'risk', 'attention', 'critical'];
    
    const sentences = analysis.split(/[.!?]/);
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (alertKeywords.some(keyword => lowerSentence.includes(keyword))) {
        alerts.push(sentence.trim());
      }
    }
    
    return alerts.slice(0, 5); // Return top 5 alerts
  }

  /**
   * Add a financial metric
   */
  addMetric(metric: Omit<FinancialMetric, 'id'>): FinancialMetric {
    const newMetric: FinancialMetric = {
      ...metric,
      id: uuidv4(),
    };
    this.financialMetrics.push(newMetric);
    return newMetric;
  }

  /**
   * Get all financial metrics
   */
  getMetrics(): FinancialMetric[] {
    return [...this.financialMetrics];
  }

  /**
   * Add a budget item
   */
  addBudgetItem(item: Omit<BudgetItem, 'id'>): BudgetItem {
    const newItem: BudgetItem = {
      ...item,
      id: uuidv4(),
    };
    this.budgetItems.push(newItem);
    return newItem;
  }

  /**
   * Get budget items
   */
  getBudgetItems(): BudgetItem[] {
    return [...this.budgetItems];
  }

  /**
   * Get cash flow projections
   */
  getCashFlowProjections(): CashFlowProjection[] {
    return [...this.cashFlowProjections];
  }
}

// Export a factory function for creating CFO instances
export function createCFO(): CFOExecutive {
  return new CFOExecutive();
}
