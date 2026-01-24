import { BaseExecutive, executiveRegistry } from '../shared/BaseExecutive';
import type {
  ExecutiveRole,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// COO-Specific Types
// ============================================

export interface OperationalProcess {
  id: string;
  companyId: string;
  name: string;
  department: string;
  description: string;
  owner: string;
  steps: ProcessStep[];
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  status: 'active' | 'under_review' | 'deprecated';
  metrics: ProcessMetrics;
  lastReviewDate: Date;
  nextReviewDate: Date;
  createdAt: Date;
}

export interface ProcessStep {
  id: string;
  order: number;
  name: string;
  description: string;
  responsible: string;
  estimatedDuration: number; // minutes
  dependencies: string[]; // step IDs
  tools?: string[];
  automatable: boolean;
}

export interface ProcessMetrics {
  avgCompletionTime: number; // minutes
  errorRate: number; // percentage
  throughput: number; // units per period
  bottleneckStep?: string;
  costPerUnit: number;
}

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  category: 'supplier' | 'service_provider' | 'contractor' | 'technology' | 'logistics';
  contactName: string;
  contactEmail: string;
  contractValue: number;
  contractStart: Date;
  contractEnd: Date;
  performanceScore: number; // 1-100
  status: 'active' | 'pending' | 'terminated' | 'under_review';
  notes: string;
  lastReviewDate: Date;
}

export interface VendorPerformance {
  vendorId: string;
  period: string;
  onTimeDelivery: number; // percentage
  qualityScore: number; // 1-100
  responsiveness: number; // 1-100
  costCompetitiveness: number; // 1-100
  issuesReported: number;
  issuesResolved: number;
}

export interface InventoryItem {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  leadTimeDays: number;
  supplier: string;
  location: string;
  lastRestocked: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
}

export interface CapacityPlan {
  id: string;
  companyId: string;
  resourceType: 'labor' | 'equipment' | 'space' | 'technology';
  resourceName: string;
  currentCapacity: number;
  currentUtilization: number; // percentage
  projectedDemand: ProjectedDemand[];
  constraints: string[];
  recommendations: string[];
  createdAt: Date;
}

export interface ProjectedDemand {
  period: string;
  expectedDemand: number;
  capacityNeeded: number;
  gap: number;
}

export interface OperationalInsight {
  id: string;
  companyId: string;
  type: 'efficiency' | 'bottleneck' | 'risk' | 'opportunity' | 'cost_saving';
  category: 'process' | 'vendor' | 'inventory' | 'capacity' | 'quality';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedSavings?: number;
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedExecutives?: ExecutiveRole[];
  createdAt: Date;
}

export interface QualityMetric {
  id: string;
  companyId: string;
  name: string;
  category: 'product' | 'service' | 'process';
  target: number;
  actual: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  lastMeasured: Date;
}

// ============================================
// COO System Prompt
// ============================================

const COO_SYSTEM_PROMPT = `You are the AI Chief Operating Officer (COO) for a small business. Your name is Morgan, and you serve as the operational backbone ensuring everything runs smoothly and efficiently.

## Your Role & Responsibilities

1. **Operations Management**: Oversee day-to-day operations and ensure business processes run efficiently
2. **Process Optimization**: Identify bottlenecks, streamline workflows, and implement improvements
3. **Vendor Management**: Manage supplier relationships, contracts, and performance
4. **Resource Planning**: Ensure adequate capacity (people, equipment, space) to meet demand
5. **Quality Control**: Maintain and improve quality standards across operations
6. **Cost Efficiency**: Find ways to reduce operational costs without sacrificing quality

## Communication Style

- Be practical, systematic, and solutions-oriented
- Use data and metrics to support recommendations
- Think in terms of processes, workflows, and systems
- Balance efficiency with quality and employee wellbeing
- Be direct about operational constraints and realistic timelines

## Key Behaviors

- Always consider the end-to-end process, not just individual steps
- Look for automation and efficiency opportunities
- Think about scalability—will this work when we're 2x or 10x bigger?
- Consider dependencies and downstream effects of changes
- Balance short-term fixes with long-term improvements
- Flag operational risks before they become crises

## Collaboration Protocol

When you need input from other executives:
- CFO: Budget for operational improvements, cost-benefit analysis, vendor payments
- CMO: Fulfillment capacity for promotions, customer experience alignment
- CHRO: Staffing needs, training requirements, workload concerns
- CTO: Systems integration, automation tools, technology infrastructure

Format collaboration requests clearly:
[COLLABORATION REQUEST]
To: [EXECUTIVE ROLE]
Subject: [Brief subject]
Request: [What you need]
Deadline: [If applicable]
[END REQUEST]

When receiving requests that impact operations:
- Assess feasibility and provide realistic timelines
- Flag capacity constraints immediately
- Suggest alternatives if the request isn't feasible as-is
- Consider impact on existing commitments

## Current Capabilities

You can help with:
- Process mapping and documentation
- Workflow optimization and automation identification
- Vendor evaluation and management
- Inventory and supply chain planning
- Capacity planning and resource allocation
- Quality management systems
- Operational metrics and KPIs
- Standard operating procedures (SOPs)
- Risk assessment and mitigation
- Cost reduction initiatives
- Operational budgeting
- Compliance and regulatory operations

## Frameworks You Use

- Lean Operations / Continuous Improvement
- Six Sigma (DMAIC: Define, Measure, Analyze, Improve, Control)
- Theory of Constraints
- Value Stream Mapping
- PDCA (Plan-Do-Check-Act)
- 5S Methodology (Sort, Set in order, Shine, Standardize, Sustain)
- Root Cause Analysis (5 Whys, Fishbone Diagrams)

## Operational Philosophy

- "You can't improve what you don't measure"
- "The best process is one that prevents problems, not one that fixes them"
- "Efficiency without effectiveness is worthless"
- "Small, consistent improvements beat big, sporadic changes"

Remember: Great operations are invisible when done well. Your job is to create systems that work reliably, scale gracefully, and enable the rest of the business to focus on growth.`;

// ============================================
// COO Executive Class
// ============================================

export class COOExecutive extends BaseExecutive {
  private operationalData: {
    processes: OperationalProcess[];
    vendors: Vendor[];
    inventory: InventoryItem[];
    capacityPlans: CapacityPlan[];
    insights: OperationalInsight[];
    qualityMetrics: QualityMetric[];
  };

  constructor() {
    super({
      role: 'COO',
      name: 'Morgan',
      description: 'AI Chief Operating Officer - Optimizing operations and ensuring efficiency',
      capabilities: [
        'process_optimization',
        'vendor_management',
        'inventory_management',
        'capacity_planning',
        'quality_management',
        'cost_reduction',
        'workflow_automation',
        'operational_metrics',
        'supply_chain',
        'resource_allocation',
      ],
      systemPrompt: COO_SYSTEM_PROMPT,
    });

    this.operationalData = {
      processes: [],
      vendors: [],
      inventory: [],
      capacityPlans: [],
      insights: [],
      qualityMetrics: [],
    };

    // Register with the executive registry
    executiveRegistry.register(this);
  }

  // ============================================
  // Process Management
  // ============================================

  async mapProcess(params: {
    name: string;
    department: string;
    description: string;
    currentSteps?: string[];
  }): Promise<OperationalProcess> {
    const prompt = `Help me map out this business process:
    
    Process Name: ${params.name}
    Department: ${params.department}
    Description: ${params.description}
    ${params.currentSteps ? `Current Steps (rough): ${params.currentSteps.join(' -> ')}` : ''}
    
    Please provide:
    1. Detailed step-by-step breakdown
    2. Who should be responsible for each step
    3. Estimated time for each step
    4. Dependencies between steps
    5. Potential automation opportunities
    6. Key metrics to track
    7. Common failure points to watch for`;

    const analysis = await this.chat(prompt);

    const process: OperationalProcess = {
      id: uuidv4(),
      companyId: 'default',
      name: params.name,
      department: params.department,
      description: params.description,
      owner: '',
      steps: [],
      frequency: 'continuous',
      status: 'under_review',
      metrics: {
        avgCompletionTime: 0,
        errorRate: 0,
        throughput: 0,
        costPerUnit: 0,
      },
      lastReviewDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      createdAt: new Date(),
    };

    this.operationalData.processes.push(process);
    return process;
  }

  async analyzeProcessEfficiency(processId: string): Promise<{
    process: OperationalProcess | null;
    analysis: string;
    bottlenecks: string[];
    improvements: string[];
    estimatedSavings: number;
  }> {
    const process = this.operationalData.processes.find(p => p.id === processId);

    if (!process) {
      return {
        process: null,
        analysis: 'Process not found',
        bottlenecks: [],
        improvements: [],
        estimatedSavings: 0,
      };
    }

    const prompt = `Analyze this operational process for efficiency:
    
    Process: ${process.name}
    Department: ${process.department}
    Steps: ${process.steps.length}
    Current Metrics:
    - Avg Completion Time: ${process.metrics.avgCompletionTime} minutes
    - Error Rate: ${process.metrics.errorRate}%
    - Throughput: ${process.metrics.throughput} units/period
    - Cost per Unit: $${process.metrics.costPerUnit}
    
    Identify:
    1. Bottlenecks slowing down the process
    2. Steps that could be automated
    3. Redundant or unnecessary steps
    4. Quality control gaps
    5. Specific improvement recommendations
    6. Estimated time/cost savings`;

    const analysis = await this.chat(prompt);

    return {
      process,
      analysis,
      bottlenecks: this.extractListItems(analysis, 'bottleneck'),
      improvements: this.extractListItems(analysis, 'improvement'),
      estimatedSavings: 0, // Would be calculated based on specific data
    };
  }

  async createSOP(params: {
    processName: string;
    purpose: string;
    scope: string;
    targetAudience: string;
  }): Promise<string> {
    const prompt = `Create a Standard Operating Procedure (SOP) document:
    
    Process: ${params.processName}
    Purpose: ${params.purpose}
    Scope: ${params.scope}
    Target Audience: ${params.targetAudience}
    
    Include:
    1. Document header (title, version, effective date, owner)
    2. Purpose and scope
    3. Definitions and acronyms
    4. Responsibilities
    5. Step-by-step procedure
    6. Safety/compliance considerations
    7. Related documents
    8. Revision history section
    
    Make it practical and easy to follow for ${params.targetAudience}.`;

    return await this.chat(prompt);
  }

  // ============================================
  // Vendor Management
  // ============================================

  async evaluateVendor(params: {
    vendorName: string;
    category: Vendor['category'];
    currentPerformance?: Partial<VendorPerformance>;
    concerns?: string[];
  }): Promise<{
    evaluation: string;
    score: number;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const prompt = `Evaluate this vendor relationship:
    
    Vendor: ${params.vendorName}
    Category: ${params.category}
    ${params.currentPerformance ? `
    Current Performance:
    - On-time Delivery: ${params.currentPerformance.onTimeDelivery || 'N/A'}%
    - Quality Score: ${params.currentPerformance.qualityScore || 'N/A'}/100
    - Responsiveness: ${params.currentPerformance.responsiveness || 'N/A'}/100
    - Issues Reported: ${params.currentPerformance.issuesReported || 0}
    ` : ''}
    ${params.concerns ? `Concerns: ${params.concerns.join(', ')}` : ''}
    
    Provide:
    1. Overall assessment
    2. Performance score (1-100)
    3. Key strengths
    4. Areas of concern
    5. Recommendations for improvement
    6. Risk level assessment
    7. Whether to continue, renegotiate, or terminate`;

    const evaluation = await this.chat(prompt);

    // Parse evaluation for score (simplified)
    const scoreMatch = evaluation.match(/score[:\s]+(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;

    return {
      evaluation,
      score,
      recommendations: this.extractListItems(evaluation, 'recommend'),
      riskLevel: score < 50 ? 'high' : score < 70 ? 'medium' : 'low',
    };
  }

  async negotiateVendorContract(params: {
    vendorName: string;
    currentTerms: string;
    desiredOutcomes: string[];
    leverage: string[];
  }): Promise<string> {
    const prompt = `Help me prepare for vendor contract negotiation:
    
    Vendor: ${params.vendorName}
    Current Terms: ${params.currentTerms}
    Desired Outcomes: ${params.desiredOutcomes.join(', ')}
    Our Leverage: ${params.leverage.join(', ')}
    
    Provide:
    1. Negotiation strategy
    2. Key points to emphasize
    3. Potential concessions we can offer
    4. Walk-away points
    5. Alternative vendors to mention
    6. Specific language/phrases to use
    7. Common vendor tactics to watch for`;

    return await this.chat(prompt);
  }

  // ============================================
  // Inventory & Supply Chain
  // ============================================

  async analyzeInventory(items?: InventoryItem[]): Promise<{
    analysis: string;
    lowStockAlerts: InventoryItem[];
    overstockItems: InventoryItem[];
    reorderRecommendations: Array<{ item: InventoryItem; quantity: number; urgency: string }>;
  }> {
    const inventory = items || this.operationalData.inventory;

    const lowStock = inventory.filter(i => i.status === 'low_stock' || i.currentStock <= i.reorderPoint);
    const overstock = inventory.filter(i => i.currentStock > i.reorderPoint * 3);

    const prompt = `Analyze this inventory situation:
    
    Total SKUs: ${inventory.length}
    Low Stock Items: ${lowStock.length}
    Overstock Items: ${overstock.length}
    
    ${lowStock.length > 0 ? `
    Critical Low Stock:
    ${lowStock.slice(0, 5).map(i => `- ${i.name}: ${i.currentStock} units (reorder point: ${i.reorderPoint})`).join('\n')}
    ` : ''}
    
    Provide:
    1. Overall inventory health assessment
    2. Immediate actions needed
    3. Reorder prioritization
    4. Cash flow impact of reorders
    5. Supplier consolidation opportunities
    6. Recommendations for inventory optimization`;

    const analysis = await this.chat(prompt);

    // Flag CFO for large reorder needs
    const totalReorderCost = lowStock.reduce((sum, i) => sum + (i.reorderQuantity * i.unitCost), 0);
    if (totalReorderCost > 10000) {
      await this.sendMessage(
        'CFO',
        'Large Inventory Reorder Required',
        `Inventory analysis shows ${lowStock.length} items need reordering. Estimated cost: $${totalReorderCost.toLocaleString()}. Please review cash flow availability.`,
        'high'
      );
    }

    return {
      analysis,
      lowStockAlerts: lowStock,
      overstockItems: overstock,
      reorderRecommendations: lowStock.map(item => ({
        item,
        quantity: item.reorderQuantity,
        urgency: item.currentStock === 0 ? 'critical' : item.currentStock < item.reorderPoint / 2 ? 'high' : 'normal',
      })),
    };
  }

  // ============================================
  // Capacity Planning
  // ============================================

  async planCapacity(params: {
    resourceType: CapacityPlan['resourceType'];
    resourceName: string;
    currentCapacity: number;
    currentUtilization: number;
    expectedGrowth: number; // percentage
    planningHorizon: 'quarter' | 'year';
  }): Promise<CapacityPlan> {
    const prompt = `Create a capacity plan:
    
    Resource: ${params.resourceName} (${params.resourceType})
    Current Capacity: ${params.currentCapacity}
    Current Utilization: ${params.currentUtilization}%
    Expected Growth: ${params.expectedGrowth}% over next ${params.planningHorizon}
    
    Analyze:
    1. When will we hit capacity constraints?
    2. What investment is needed to meet demand?
    3. What are alternatives to adding capacity?
    4. Phased scaling recommendations
    5. Cost implications
    6. Risk factors`;

    const analysis = await this.chat(prompt);

    const plan: CapacityPlan = {
      id: uuidv4(),
      companyId: 'default',
      resourceType: params.resourceType,
      resourceName: params.resourceName,
      currentCapacity: params.currentCapacity,
      currentUtilization: params.currentUtilization,
      projectedDemand: [],
      constraints: [],
      recommendations: this.extractListItems(analysis, 'recommend'),
      createdAt: new Date(),
    };

    // If capacity is critical, notify relevant executives
    if (params.currentUtilization > 85) {
      await this.sendMessage(
        'CFO',
        `Capacity Alert: ${params.resourceName}`,
        `${params.resourceName} is at ${params.currentUtilization}% utilization. Investment may be needed soon.`,
        'high'
      );

      if (params.resourceType === 'labor') {
        await this.sendMessage(
          'CHRO',
          `Staffing Need: ${params.resourceName}`,
          `${params.resourceName} team is at ${params.currentUtilization}% capacity. Please assess hiring needs.`,
          'high'
        );
      }
    }

    this.operationalData.capacityPlans.push(plan);
    return plan;
  }

  // ============================================
  // Core Abstract Method Implementations
  // ============================================

  async analyzeData(data: {
    processes?: OperationalProcess[];
    vendors?: Vendor[];
    inventory?: InventoryItem[];
    period?: string;
  }): Promise<{
    processEfficiency: number;
    vendorHealth: number;
    inventoryHealth: number;
    overallScore: number;
    criticalIssues: string[];
    recommendations: string[];
  }> {
    const processes = data.processes || this.operationalData.processes;
    const vendors = data.vendors || this.operationalData.vendors;
    const inventory = data.inventory || this.operationalData.inventory;

    // Calculate process efficiency (simplified)
    const processEfficiency = processes.length > 0
      ? 100 - (processes.reduce((sum, p) => sum + p.metrics.errorRate, 0) / processes.length)
      : 0;

    // Calculate vendor health
    const vendorHealth = vendors.length > 0
      ? vendors.reduce((sum, v) => sum + v.performanceScore, 0) / vendors.length
      : 0;

    // Calculate inventory health
    const healthyInventory = inventory.filter(i => i.status === 'in_stock').length;
    const inventoryHealth = inventory.length > 0
      ? (healthyInventory / inventory.length) * 100
      : 0;

    const overallScore = (processEfficiency + vendorHealth + inventoryHealth) / 3;

    const criticalIssues: string[] = [];
    if (processEfficiency < 90) criticalIssues.push('Process error rates need attention');
    if (vendorHealth < 70) criticalIssues.push('Vendor performance below standards');
    if (inventoryHealth < 80) criticalIssues.push('Inventory levels need rebalancing');

    return {
      processEfficiency,
      vendorHealth,
      inventoryHealth,
      overallScore,
      criticalIssues,
      recommendations: await this.generateOperationalRecommendations(),
    };
  }

  async generateReport(
    reportType: string,
    params?: Record<string, unknown>
  ): Promise<string> {
    const context = {
      reportType,
      params,
      processCount: this.operationalData.processes.length,
      vendorCount: this.operationalData.vendors.length,
      inventoryCount: this.operationalData.inventory.length,
    };

    const prompt = `Generate a ${reportType} operations report.
    
    Available data:
    - ${this.operationalData.processes.length} documented processes
    - ${this.operationalData.vendors.length} vendor relationships
    - ${this.operationalData.inventory.length} inventory items
    - ${this.operationalData.capacityPlans.length} capacity plans
    
    Include:
    1. Executive Summary
    2. Operational Metrics Overview
    3. Process Performance
    4. Vendor Scorecard
    5. Inventory Status
    6. Capacity Utilization
    7. Issues and Risks
    8. Improvement Initiatives
    9. Recommendations
    
    ${params ? `Additional context: ${JSON.stringify(params)}` : ''}`;

    return await this.chat(prompt, context);
  }

  async getInsights(): Promise<OperationalInsight[]> {
    const insights: OperationalInsight[] = [];

    // Check processes
    const highErrorProcesses = this.operationalData.processes.filter(p => p.metrics.errorRate > 5);
    highErrorProcesses.forEach(process => {
      insights.push({
        id: uuidv4(),
        companyId: process.companyId,
        type: 'bottleneck',
        category: 'process',
        title: `High Error Rate: ${process.name}`,
        description: `Process has ${process.metrics.errorRate}% error rate, above the 5% threshold.`,
        impact: 'high',
        actionRequired: true,
        suggestedActions: [
          'Conduct root cause analysis',
          'Review process documentation',
          'Implement additional quality checks',
          'Train team members',
        ],
        createdAt: new Date(),
      });
    });

    // Check vendors
    const underperformingVendors = this.operationalData.vendors.filter(v => v.performanceScore < 70);
    underperformingVendors.forEach(vendor => {
      insights.push({
        id: uuidv4(),
        companyId: vendor.companyId,
        type: 'risk',
        category: 'vendor',
        title: `Vendor Performance Issue: ${vendor.name}`,
        description: `Performance score of ${vendor.performanceScore}/100 is below acceptable threshold.`,
        impact: 'medium',
        actionRequired: true,
        suggestedActions: [
          'Schedule vendor performance review',
          'Document specific issues',
          'Research alternative vendors',
          'Negotiate improvement plan',
        ],
        relatedExecutives: ['CFO'],
        createdAt: new Date(),
      });
    });

    // Check inventory
    const criticalInventory = this.operationalData.inventory.filter(i => i.status === 'out_of_stock');
    if (criticalInventory.length > 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'risk',
        category: 'inventory',
        title: `${criticalInventory.length} Items Out of Stock`,
        description: `Critical inventory shortage affecting ${criticalInventory.map(i => i.name).join(', ')}.`,
        impact: 'high',
        actionRequired: true,
        suggestedActions: [
          'Place emergency orders',
          'Notify affected departments',
          'Review reorder points',
          'Consider safety stock increases',
        ],
        relatedExecutives: ['CFO'],
        createdAt: new Date(),
      });
    }

    // Check capacity
    const strainedCapacity = this.operationalData.capacityPlans.filter(c => c.currentUtilization > 85);
    strainedCapacity.forEach(plan => {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'risk',
        category: 'capacity',
        title: `Capacity Strain: ${plan.resourceName}`,
        description: `Operating at ${plan.currentUtilization}% utilization. Risk of bottleneck.`,
        impact: 'high',
        actionRequired: true,
        suggestedActions: [
          'Evaluate expansion options',
          'Identify efficiency improvements',
          'Consider outsourcing',
          'Prioritize resource allocation',
        ],
        relatedExecutives: plan.resourceType === 'labor' ? ['CHRO', 'CFO'] : ['CFO'],
        createdAt: new Date(),
      });
    });

    // No data insight
    if (this.operationalData.processes.length === 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'opportunity',
        category: 'process',
        title: 'Document Your Core Processes',
        description: 'Start by mapping your most critical business processes for optimization.',
        impact: 'medium',
        actionRequired: false,
        suggestedActions: [
          'Identify top 5 most frequent processes',
          'Document current workflows',
          'Measure baseline metrics',
          'Set improvement targets',
        ],
        createdAt: new Date(),
      });
    }

    this.operationalData.insights = insights;
    return insights;
  }

  // ============================================
  // Collaboration Detection Override
  // ============================================

  protected async processResponseForCollaboration(response: string): Promise<void> {
    const collaborationPatterns = [
      { pattern: /budget|cost|investment|expense|purchase/i, executive: 'CFO' as ExecutiveRole },
      { pattern: /marketing|promotion|campaign|customer demand/i, executive: 'CMO' as ExecutiveRole },
      { pattern: /hiring|staffing|training|workload|overtime/i, executive: 'CHRO' as ExecutiveRole },
      { pattern: /system|software|automation|technology|integration/i, executive: 'CTO' as ExecutiveRole },
    ];

    for (const { pattern, executive } of collaborationPatterns) {
      if (pattern.test(response)) {
        const actionIndicators = ['need', 'require', 'recommend', 'suggest', 'should', 'must'];
        if (actionIndicators.some(indicator => response.toLowerCase().includes(indicator))) {
          await this.sendMessage(
            executive,
            'Operations Update',
            `The COO has identified an operational matter requiring your attention: ${response.substring(0, 300)}...`,
            'normal'
          );
          break;
        }
      }
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private extractListItems(text: string, keyword: string): string[] {
    const items: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.toLowerCase().includes(keyword) || line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
        const cleaned = line.replace(/^[-\d.)\s]+/, '').trim();
        if (cleaned.length > 10 && cleaned.length < 200) {
          items.push(cleaned);
        }
      }
    }

    return items.slice(0, 5);
  }

  private async generateOperationalRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    if (this.operationalData.processes.length === 0) {
      recommendations.push('Start documenting core business processes');
    }

    if (this.operationalData.vendors.length === 0) {
      recommendations.push('Create a vendor management system');
    }

    const highUtilization = this.operationalData.capacityPlans.filter(c => c.currentUtilization > 80);
    if (highUtilization.length > 0) {
      recommendations.push('Address capacity constraints before they impact growth');
    }

    return recommendations;
  }

  // ============================================
  // Data Management
  // ============================================

  addProcess(process: OperationalProcess): void {
    this.operationalData.processes.push(process);
  }

  addVendor(vendor: Vendor): void {
    this.operationalData.vendors.push(vendor);
  }

  addInventoryItem(item: InventoryItem): void {
    this.operationalData.inventory.push(item);
  }

  updateInventoryStock(itemId: string, newStock: number): void {
    const item = this.operationalData.inventory.find(i => i.id === itemId);
    if (item) {
      item.currentStock = newStock;
      item.status = newStock === 0 ? 'out_of_stock' 
        : newStock <= item.reorderPoint ? 'low_stock' 
        : 'in_stock';
    }
  }

  getOperationalData() {
    return { ...this.operationalData };
  }
}

// Export singleton instance
export const cooExecutive = new COOExecutive();
