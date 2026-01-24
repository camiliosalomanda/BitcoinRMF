import { BaseExecutive, executiveRegistry } from '../shared/BaseExecutive';
import type {
  FinancialMetrics,
  FinancialInsight,
  CashFlowForecast,
  CashFlowProjection,
  Budget,
  Transaction,
  ExecutiveRole,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// CFO System Prompt
// ============================================

const CFO_SYSTEM_PROMPT = `You are the AI Chief Financial Officer (CFO) for a small business. Your name is Alex, and you serve as a trusted financial advisor and strategic partner.

## Your Role & Responsibilities

1. **Financial Oversight**: Monitor cash flow, manage budgets, and ensure financial health
2. **Strategic Planning**: Provide financial forecasts, scenario analysis, and growth recommendations
3. **Risk Management**: Identify financial risks and suggest mitigation strategies
4. **Reporting**: Generate clear, actionable financial reports for business owners
5. **Collaboration**: Work with other C-level executives to align financial strategy with business goals

## Communication Style

- Be direct and clear—small business owners are busy
- Always explain financial concepts in accessible terms
- Provide specific, actionable recommendations
- Flag urgent issues immediately with clear next steps
- Use numbers and data to support your advice

## Key Behaviors

- When asked about budgets, always consider cash flow impact
- Proactively alert about potential cash crunches or opportunities
- If a request from another executive (like CMO for marketing spend) exceeds budget, negotiate or flag it
- Consider seasonal patterns and industry benchmarks
- Always tie financial advice back to business objectives

## Collaboration Protocol

When you need input from other executives:
- CMO: Marketing budget requests, ROI on campaigns, customer acquisition costs
- COO: Operational expenses, efficiency improvements, vendor negotiations
- CHRO: Payroll planning, benefits costs, hiring budgets
- CTO: Technology investments, infrastructure costs

Format collaboration requests clearly:
[COLLABORATION REQUEST]
To: [EXECUTIVE ROLE]
Subject: [Brief subject]
Request: [What you need]
Deadline: [If applicable]
[END REQUEST]

## Current Capabilities

You can help with:
- Cash flow analysis and forecasting
- Budget creation and monitoring
- Expense categorization and tracking
- Financial health assessments
- Profit margin analysis
- Break-even calculations
- Financial scenario modeling
- Tax planning considerations (general guidance only—recommend professional for specifics)
- Investor-ready financial summaries

Remember: You're not just a number cruncher—you're a strategic partner helping this business thrive.`;

// ============================================
// CFO Executive Class
// ============================================

export class CFOExecutive extends BaseExecutive {
  private financialData: {
    transactions: Transaction[];
    budgets: Budget[];
    metrics: FinancialMetrics[];
    insights: FinancialInsight[];
  };

  constructor() {
    super({
      role: 'CFO',
      name: 'Alex',
      description: 'AI Chief Financial Officer - Managing financial strategy, budgets, and cash flow',
      capabilities: [
        'cash_flow_analysis',
        'budget_management',
        'financial_forecasting',
        'expense_tracking',
        'financial_reporting',
        'risk_assessment',
        'scenario_modeling',
        'profitability_analysis',
      ],
      systemPrompt: CFO_SYSTEM_PROMPT,
    });

    this.financialData = {
      transactions: [],
      budgets: [],
      metrics: [],
      insights: [],
    };

    // Register with the executive registry
    executiveRegistry.register(this);
  }

  // ============================================
  // Core Financial Analysis
  // ============================================

  async analyzeData(data: {
    transactions?: Transaction[];
    period?: string;
  }): Promise<FinancialMetrics> {
    const transactions = data.transactions || this.financialData.transactions;
    const period = data.period || 'current';

    // Calculate key metrics
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const metrics: FinancialMetrics = {
      companyId: transactions[0]?.companyId || 'default',
      period,
      revenue: income,
      expenses,
      netIncome: income - expenses,
      grossMargin: income > 0 ? ((income - expenses) / income) * 100 : 0,
      operatingMargin: income > 0 ? ((income - expenses) / income) * 100 : 0,
      currentRatio: 0, // Would need balance sheet data
      quickRatio: 0, // Would need balance sheet data
      burnRate: expenses,
      runway: expenses > 0 ? Math.floor(income / expenses) : undefined,
    };

    this.financialData.metrics.push(metrics);
    return metrics;
  }

  async generateCashFlowForecast(
    months: number = 3,
    transactions?: Transaction[]
  ): Promise<CashFlowForecast> {
    const txns = transactions || this.financialData.transactions;
    
    // Calculate average monthly income and expenses
    const monthlyIncome = txns
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(1, this.getUniqueMonths(txns));

    const monthlyExpenses = txns
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(1, this.getUniqueMonths(txns));

    // Generate projections
    const projections: CashFlowProjection[] = [];
    let runningBalance = monthlyIncome - monthlyExpenses;

    for (let i = 0; i < months; i++) {
      const projectionDate = new Date();
      projectionDate.setMonth(projectionDate.getMonth() + i + 1);

      projections.push({
        date: projectionDate,
        projectedIncome: monthlyIncome,
        projectedExpenses: monthlyExpenses,
        projectedBalance: runningBalance * (i + 1),
      });
    }

    const forecast: CashFlowForecast = {
      id: uuidv4(),
      companyId: txns[0]?.companyId || 'default',
      generatedAt: new Date(),
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
      projections,
      assumptions: [
        'Based on historical average income and expenses',
        'Assumes no major changes in business operations',
        'Does not account for seasonal variations',
      ],
      confidence: txns.length > 10 ? 'medium' : 'low',
    };

    return forecast;
  }

  // ============================================
  // Report Generation
  // ============================================

  async generateReport(
    reportType: string,
    params?: Record<string, unknown>
  ): Promise<string> {
    const context = {
      reportType,
      params,
      currentMetrics: this.financialData.metrics[this.financialData.metrics.length - 1],
      transactionCount: this.financialData.transactions.length,
    };

    const prompt = `Generate a ${reportType} report with the following context: ${JSON.stringify(context)}. 
    Format it clearly with sections for:
    1. Executive Summary
    2. Key Findings
    3. Recommendations
    4. Next Steps`;

    return await this.chat(prompt, context);
  }

  // ============================================
  // Insights Generation
  // ============================================

  async getInsights(): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];
    const metrics = this.financialData.metrics[this.financialData.metrics.length - 1];

    if (!metrics) {
      return [{
        id: uuidv4(),
        companyId: 'default',
        type: 'recommendation',
        title: 'No Financial Data',
        description: 'Add transactions to receive financial insights and recommendations.',
        impact: 'high',
        actionRequired: true,
        suggestedActions: ['Import bank statements', 'Add manual transactions', 'Connect accounting software'],
        createdAt: new Date(),
      }];
    }

    // Check for negative cash flow
    if (metrics.netIncome < 0) {
      insights.push({
        id: uuidv4(),
        companyId: metrics.companyId,
        type: 'warning',
        title: 'Negative Cash Flow Detected',
        description: `Current period shows expenses exceeding income by $${Math.abs(metrics.netIncome).toFixed(2)}`,
        impact: 'high',
        actionRequired: true,
        suggestedActions: [
          'Review and cut non-essential expenses',
          'Accelerate accounts receivable collection',
          'Consider short-term financing options',
        ],
        relatedExecutives: ['COO'],
        createdAt: new Date(),
      });
    }

    // Check burn rate vs runway
    if (metrics.runway && metrics.runway < 3) {
      insights.push({
        id: uuidv4(),
        companyId: metrics.companyId,
        type: 'warning',
        title: 'Low Runway Alert',
        description: `At current burn rate, runway is approximately ${metrics.runway} months`,
        impact: 'high',
        actionRequired: true,
        suggestedActions: [
          'Reduce operating expenses immediately',
          'Seek additional funding or credit lines',
          'Prioritize revenue-generating activities',
        ],
        createdAt: new Date(),
      });
    }

    // Positive trend opportunity
    if (metrics.grossMargin > 30) {
      insights.push({
        id: uuidv4(),
        companyId: metrics.companyId,
        type: 'opportunity',
        title: 'Strong Gross Margin',
        description: `Gross margin of ${metrics.grossMargin.toFixed(1)}% indicates healthy pricing`,
        impact: 'medium',
        actionRequired: false,
        suggestedActions: [
          'Consider strategic growth investments',
          'Evaluate marketing spend increase with CMO',
        ],
        relatedExecutives: ['CMO'],
        createdAt: new Date(),
      });
    }

    this.financialData.insights = insights;
    return insights;
  }

  // ============================================
  // Budget Management
  // ============================================

  async reviewBudgetRequest(
    department: ExecutiveRole,
    requestedAmount: number,
    purpose: string
  ): Promise<{
    approved: boolean;
    approvedAmount: number;
    reasoning: string;
    conditions?: string[];
  }> {
    const context = {
      requestingDepartment: department,
      requestedAmount,
      purpose,
      currentBudgets: this.financialData.budgets,
      financialHealth: this.financialData.metrics[this.financialData.metrics.length - 1],
    };

    const prompt = `A budget request has been submitted:
    
    From: ${department}
    Amount: $${requestedAmount}
    Purpose: ${purpose}
    
    Based on our current financial position, should this be approved? 
    Consider cash flow, existing budgets, and strategic priorities.
    Provide your recommendation with specific reasoning.`;

    const analysis = await this.chat(prompt, context);

    // Parse the AI response to extract structured decision
    // In production, you'd use function calling for structured output
    const approved = analysis.toLowerCase().includes('approve') && 
                    !analysis.toLowerCase().includes('cannot approve');
    
    return {
      approved,
      approvedAmount: approved ? requestedAmount : requestedAmount * 0.7,
      reasoning: analysis,
      conditions: approved ? undefined : ['Requires monthly ROI reporting', 'Phased rollout recommended'],
    };
  }

  // ============================================
  // Data Management
  // ============================================

  addTransactions(transactions: Transaction[]): void {
    this.financialData.transactions.push(...transactions);
  }

  addBudget(budget: Budget): void {
    this.financialData.budgets.push(budget);
  }

  getFinancialData() {
    return { ...this.financialData };
  }

  // ============================================
  // Collaboration Detection
  // ============================================

  protected async processResponseForCollaboration(response: string): Promise<void> {
    // Detect if CFO response suggests need for collaboration
    const collaborationPatterns = [
      { pattern: /marketing budget|advertising spend|campaign cost/i, executive: 'CMO' as ExecutiveRole },
      { pattern: /operational cost|efficiency|vendor/i, executive: 'COO' as ExecutiveRole },
      { pattern: /payroll|hiring|benefits/i, executive: 'CHRO' as ExecutiveRole },
      { pattern: /technology investment|software|infrastructure/i, executive: 'CTO' as ExecutiveRole },
    ];

    for (const { pattern, executive } of collaborationPatterns) {
      if (pattern.test(response)) {
        await this.sendMessage(
          executive,
          'Financial Review Required',
          `The CFO has flagged a matter requiring your input. Please review: ${response.substring(0, 200)}...`,
          'normal'
        );
      }
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private getUniqueMonths(transactions: Transaction[]): number {
    const months = new Set(
      transactions.map((t) => `${t.date.getFullYear()}-${t.date.getMonth()}`)
    );
    return months.size || 1;
  }
}

// Export singleton instance
export const cfoExecutive = new CFOExecutive();
