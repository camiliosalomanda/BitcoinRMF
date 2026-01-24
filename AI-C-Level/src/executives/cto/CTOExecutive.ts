import { BaseExecutive, executiveRegistry } from '../shared/BaseExecutive';
import type {
  ExecutiveRole,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// CTO-Specific Types
// ============================================

export interface TechnologyStack {
  id: string;
  companyId: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'devops' | 'security' | 'analytics' | 'communication';
  name: string;
  version?: string;
  purpose: string;
  vendor?: string;
  monthlyCost: number;
  status: 'active' | 'deprecated' | 'evaluating' | 'planned';
  criticality: 'critical' | 'important' | 'nice_to_have';
  lastUpdated: Date;
  nextReviewDate: Date;
}

export interface TechProject {
  id: string;
  companyId: string;
  name: string;
  description: string;
  type: 'new_feature' | 'infrastructure' | 'security' | 'maintenance' | 'integration' | 'migration';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'planning' | 'in_progress' | 'testing' | 'deployed' | 'cancelled';
  estimatedHours: number;
  actualHours: number;
  startDate?: Date;
  targetDate?: Date;
  completedDate?: Date;
  assignedTo: string[];
  dependencies: string[];
  risks: ProjectRisk[];
  createdAt: Date;
}

export interface ProjectRisk {
  id: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'identified' | 'mitigated' | 'accepted' | 'occurred';
}

export interface SecurityAssessment {
  id: string;
  companyId: string;
  assessmentDate: Date;
  overallScore: number; // 1-100
  categories: SecurityCategory[];
  criticalFindings: SecurityFinding[];
  recommendations: string[];
  nextAssessmentDate: Date;
}

export interface SecurityCategory {
  name: string;
  score: number;
  findings: number;
  status: 'good' | 'needs_attention' | 'critical';
}

export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  dueDate?: Date;
}

export interface SystemHealth {
  id: string;
  systemName: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number; // percentage
  responseTime: number; // ms
  errorRate: number; // percentage
  lastIncident?: Date;
  lastChecked: Date;
}

export interface TechDebt {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: 'code_quality' | 'architecture' | 'dependencies' | 'documentation' | 'testing' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: number; // hours
  businessImpact: string;
  status: 'identified' | 'planned' | 'in_progress' | 'resolved';
  createdAt: Date;
}

export interface IntegrationConfig {
  id: string;
  companyId: string;
  name: string;
  type: 'api' | 'webhook' | 'file_transfer' | 'database' | 'oauth';
  sourceSystem: string;
  targetSystem: string;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'on_demand';
  status: 'active' | 'inactive' | 'error';
  lastSync?: Date;
  errorCount: number;
  dataVolume: string;
}

export interface TechInsight {
  id: string;
  companyId: string;
  type: 'security' | 'performance' | 'cost' | 'scalability' | 'maintenance' | 'opportunity';
  category: 'infrastructure' | 'application' | 'data' | 'security' | 'integration';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedCost?: number;
  estimatedSavings?: number;
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedExecutives?: ExecutiveRole[];
  createdAt: Date;
}

// ============================================
// CTO System Prompt
// ============================================

const CTO_SYSTEM_PROMPT = `You are the AI Chief Technology Officer (CTO) for a small business. Your name is Riley, and you serve as the technology strategist and guardian of the company's technical infrastructure.

## Your Role & Responsibilities

1. **Technology Strategy**: Define and execute technology roadmap aligned with business goals
2. **Architecture & Infrastructure**: Design scalable, secure, and maintainable systems
3. **Security & Compliance**: Protect company data and ensure regulatory compliance
4. **Vendor & Tool Selection**: Evaluate and recommend technology solutions
5. **Technical Leadership**: Guide technical decisions and best practices
6. **Innovation**: Identify emerging technologies that could benefit the business

## Communication Style

- Translate technical concepts into business language
- Be pragmatic—focus on solutions that fit the company's size and budget
- Emphasize security without creating fear
- Balance innovation with stability
- Be honest about trade-offs and limitations

## Key Behaviors

- Always consider security implications of any technology decision
- Think about total cost of ownership, not just initial cost
- Prioritize maintainability and simplicity over complexity
- Consider the team's ability to support and maintain solutions
- Plan for scale but don't over-engineer for current needs
- Document decisions and their rationale

## Collaboration Protocol

When you need input from other executives:
- CFO: Technology budgets, ROI analysis, vendor contracts
- CMO: Marketing technology stack, analytics, customer data platforms
- COO: Operational systems, automation, process integration
- CHRO: HR systems, employee tools, training needs

Format collaboration requests clearly:
[COLLABORATION REQUEST]
To: [EXECUTIVE ROLE]
Subject: [Brief subject]
Request: [What you need]
Deadline: [If applicable]
[END REQUEST]

When receiving technology requests:
- Assess technical feasibility and provide honest estimates
- Identify security and compliance implications
- Suggest alternatives if the request isn't optimal
- Flag technical debt implications

## Current Capabilities

You can help with:
- Technology stack evaluation and recommendations
- Architecture design and review
- Security assessment and recommendations
- Vendor/tool evaluation and comparison
- Build vs. buy decisions
- Technical project planning and estimation
- System integration strategy
- Data management and analytics architecture
- Cloud infrastructure planning
- DevOps and deployment strategies
- Technical debt assessment
- Disaster recovery and business continuity planning
- API strategy and design
- Mobile and web technology decisions

## Technology Principles

1. **Security First**: Every decision considers security implications
2. **Simplicity**: The simplest solution that meets requirements wins
3. **Scalability**: Build for 10x, not 100x—avoid premature optimization
4. **Maintainability**: Code and systems should be easy to understand and modify
5. **Data Integrity**: Protect and validate data at every layer
6. **Cost Efficiency**: Optimize cloud spend and tool costs continuously
7. **Documentation**: If it's not documented, it doesn't exist

## For Small Business Context

- Recommend cost-effective solutions (open source when appropriate)
- Consider limited IT resources when suggesting solutions
- Prioritize security essentials over enterprise features
- Focus on tools with good ROI for small teams
- Suggest managed services to reduce operational burden

Remember: Technology should enable the business, not complicate it. Your job is to find the right balance between innovation and stability, security and usability, cost and capability.`;

// ============================================
// CTO Executive Class
// ============================================

export class CTOExecutive extends BaseExecutive {
  private techData: {
    stack: TechnologyStack[];
    projects: TechProject[];
    securityAssessments: SecurityAssessment[];
    systemHealth: SystemHealth[];
    techDebt: TechDebt[];
    integrations: IntegrationConfig[];
    insights: TechInsight[];
  };

  constructor() {
    super({
      role: 'CTO',
      name: 'Riley',
      description: 'AI Chief Technology Officer - Guiding technology strategy and security',
      capabilities: [
        'technology_strategy',
        'architecture_design',
        'security_assessment',
        'vendor_evaluation',
        'technical_planning',
        'system_integration',
        'cloud_infrastructure',
        'devops_strategy',
        'data_architecture',
        'tech_debt_management',
      ],
      systemPrompt: CTO_SYSTEM_PROMPT,
    });

    this.techData = {
      stack: [],
      projects: [],
      securityAssessments: [],
      systemHealth: [],
      techDebt: [],
      integrations: [],
      insights: [],
    };

    // Register with the executive registry
    executiveRegistry.register(this);
  }

  // ============================================
  // Technology Stack Management
  // ============================================

  async evaluateTool(params: {
    toolName: string;
    category: TechnologyStack['category'];
    purpose: string;
    alternatives?: string[];
    budget?: number;
  }): Promise<{
    evaluation: string;
    recommendation: 'recommended' | 'consider' | 'not_recommended';
    pros: string[];
    cons: string[];
    alternatives: string[];
    estimatedCost: string;
  }> {
    const prompt = `Evaluate this technology tool for a small business:
    
    Tool: ${params.toolName}
    Category: ${params.category}
    Purpose: ${params.purpose}
    ${params.alternatives ? `Alternatives to consider: ${params.alternatives.join(', ')}` : ''}
    ${params.budget ? `Budget: $${params.budget}/month` : ''}
    
    Provide:
    1. Overall assessment and recommendation
    2. Key strengths (pros)
    3. Potential concerns (cons)
    4. Security considerations
    5. Total cost of ownership estimate
    6. Better alternatives if any
    7. Implementation complexity
    8. Maintenance requirements
    
    Consider this is for a small business with limited IT resources.`;

    const evaluation = await this.chat(prompt);

    // Parse recommendation from response
    const recLower = evaluation.toLowerCase();
    let recommendation: 'recommended' | 'consider' | 'not_recommended' = 'consider';
    if (recLower.includes('highly recommend') || recLower.includes('strongly recommend')) {
      recommendation = 'recommended';
    } else if (recLower.includes('not recommend') || recLower.includes('avoid')) {
      recommendation = 'not_recommended';
    }

    return {
      evaluation,
      recommendation,
      pros: this.extractListItems(evaluation, 'pro', 'strength', 'advantage'),
      cons: this.extractListItems(evaluation, 'con', 'concern', 'disadvantage', 'weakness'),
      alternatives: this.extractListItems(evaluation, 'alternative'),
      estimatedCost: 'See evaluation for details',
    };
  }

  async auditTechStack(): Promise<{
    audit: string;
    totalMonthlyCost: number;
    redundancies: string[];
    gaps: string[];
    recommendations: string[];
  }> {
    const stack = this.techData.stack;

    const prompt = `Audit this technology stack for a small business:
    
    Current Stack (${stack.length} tools):
    ${stack.map(t => `- ${t.name} (${t.category}): $${t.monthlyCost}/mo - ${t.purpose}`).join('\n') || 'No tools documented yet'}
    
    Analyze:
    1. Overall stack health and coherence
    2. Redundant tools or overlapping functionality
    3. Missing critical capabilities
    4. Security gaps
    5. Cost optimization opportunities
    6. Integration issues
    7. Recommendations for improvement
    
    Focus on practical advice for a small business.`;

    const audit = await this.chat(prompt);
    const totalMonthlyCost = stack.reduce((sum, t) => sum + t.monthlyCost, 0);

    return {
      audit,
      totalMonthlyCost,
      redundancies: this.extractListItems(audit, 'redundan', 'overlap', 'duplicate'),
      gaps: this.extractListItems(audit, 'gap', 'missing', 'lack'),
      recommendations: this.extractListItems(audit, 'recommend'),
    };
  }

  // ============================================
  // Security Management
  // ============================================

  async performSecurityAssessment(params: {
    focusAreas?: string[];
    knownConcerns?: string[];
  }): Promise<SecurityAssessment> {
    const prompt = `Perform a security assessment for a small business:
    
    ${params.focusAreas ? `Focus Areas: ${params.focusAreas.join(', ')}` : ''}
    ${params.knownConcerns ? `Known Concerns: ${params.knownConcerns.join(', ')}` : ''}
    
    Assess these security categories:
    1. Access Control & Authentication
    2. Data Protection & Encryption
    3. Network Security
    4. Application Security
    5. Employee Security Awareness
    6. Backup & Recovery
    7. Vendor/Third-party Risk
    8. Compliance (GDPR, PCI, etc. as applicable)
    
    For each category provide:
    - Current risk level
    - Key findings
    - Priority recommendations
    
    Focus on practical, cost-effective security measures for a small business.`;

    const assessmentResponse = await this.chat(prompt);

    const assessment: SecurityAssessment = {
      id: uuidv4(),
      companyId: 'default',
      assessmentDate: new Date(),
      overallScore: 70, // Would be calculated from detailed findings
      categories: [
        { name: 'Access Control', score: 70, findings: 2, status: 'needs_attention' },
        { name: 'Data Protection', score: 75, findings: 1, status: 'needs_attention' },
        { name: 'Network Security', score: 80, findings: 1, status: 'good' },
        { name: 'Application Security', score: 65, findings: 3, status: 'needs_attention' },
        { name: 'Employee Awareness', score: 60, findings: 2, status: 'needs_attention' },
        { name: 'Backup & Recovery', score: 85, findings: 0, status: 'good' },
      ],
      criticalFindings: [],
      recommendations: this.extractListItems(assessmentResponse, 'recommend'),
      nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.techData.securityAssessments.push(assessment);

    // Flag critical findings to CFO if budget needed
    if (assessment.overallScore < 60) {
      await this.sendMessage(
        'CFO',
        'Critical Security Investment Needed',
        `Security assessment scored ${assessment.overallScore}/100. Immediate investment in security improvements is recommended.`,
        'urgent'
      );
    }

    return assessment;
  }

  async createSecurityPolicy(params: {
    policyType: 'password' | 'data_handling' | 'acceptable_use' | 'incident_response' | 'remote_work' | 'byod';
    companySize: 'micro' | 'small' | 'medium';
  }): Promise<string> {
    const prompt = `Create a ${params.policyType.replace('_', ' ')} security policy for a ${params.companySize} business.
    
    Include:
    1. Policy purpose and scope
    2. Definitions
    3. Policy statements (specific rules)
    4. Roles and responsibilities
    5. Compliance requirements
    6. Exceptions process
    7. Enforcement and consequences
    8. Review schedule
    
    Make it practical and enforceable. Avoid overly complex requirements that won't be followed.
    Use clear, non-technical language where possible.`;

    return await this.chat(prompt);
  }

  // ============================================
  // Project & Architecture
  // ============================================

  async planTechProject(params: {
    projectName: string;
    description: string;
    type: TechProject['type'];
    requirements: string[];
    constraints?: string[];
  }): Promise<TechProject> {
    const prompt = `Plan this technology project:
    
    Project: ${params.projectName}
    Type: ${params.type}
    Description: ${params.description}
    Requirements: ${params.requirements.join(', ')}
    ${params.constraints ? `Constraints: ${params.constraints.join(', ')}` : ''}
    
    Provide:
    1. Project breakdown and phases
    2. Technical approach
    3. Resource requirements
    4. Time estimate (hours)
    5. Key milestones
    6. Dependencies
    7. Risks and mitigation strategies
    8. Success criteria
    
    Consider this is for a small business with limited technical resources.`;

    const planResponse = await this.chat(prompt);

    // Extract hours estimate from response
    const hoursMatch = planResponse.match(/(\d+)\s*(?:hours|hrs)/i);
    const estimatedHours = hoursMatch ? parseInt(hoursMatch[1]) : 40;

    const project: TechProject = {
      id: uuidv4(),
      companyId: 'default',
      name: params.projectName,
      description: params.description,
      type: params.type,
      priority: 'medium',
      status: 'planning',
      estimatedHours,
      actualHours: 0,
      assignedTo: [],
      dependencies: [],
      risks: [],
      createdAt: new Date(),
    };

    this.techData.projects.push(project);

    // Flag large projects to CFO
    if (estimatedHours > 100) {
      await this.sendMessage(
        'CFO',
        `Tech Project Budget Review: ${params.projectName}`,
        `New tech project estimated at ${estimatedHours} hours. Please review resource allocation and budget.`,
        'normal'
      );
    }

    return project;
  }

  async designArchitecture(params: {
    systemName: string;
    purpose: string;
    requirements: string[];
    scale: 'small' | 'medium' | 'large';
    budget: 'low' | 'medium' | 'high';
  }): Promise<string> {
    const prompt = `Design a system architecture:
    
    System: ${params.systemName}
    Purpose: ${params.purpose}
    Requirements: ${params.requirements.join(', ')}
    Expected Scale: ${params.scale}
    Budget Level: ${params.budget}
    
    Provide:
    1. High-level architecture overview
    2. Component breakdown
    3. Technology recommendations for each component
    4. Data flow description
    5. Security considerations
    6. Scalability approach
    7. Estimated infrastructure costs
    8. Build vs. buy recommendations
    9. Implementation phases
    
    Focus on practical, maintainable solutions appropriate for a small business.
    Prefer managed services and proven technologies over cutting-edge solutions.`;

    return await this.chat(prompt);
  }

  // ============================================
  // Integration & Data
  // ============================================

  async planIntegration(params: {
    sourceSystem: string;
    targetSystem: string;
    dataTypes: string[];
    frequency: IntegrationConfig['frequency'];
    bidirectional: boolean;
  }): Promise<{
    plan: string;
    approach: string;
    estimatedEffort: string;
    risks: string[];
  }> {
    const prompt = `Plan a system integration:
    
    Source: ${params.sourceSystem}
    Target: ${params.targetSystem}
    Data Types: ${params.dataTypes.join(', ')}
    Sync Frequency: ${params.frequency}
    Bidirectional: ${params.bidirectional ? 'Yes' : 'No'}
    
    Provide:
    1. Integration approach (API, webhook, file transfer, etc.)
    2. Data mapping considerations
    3. Authentication and security
    4. Error handling strategy
    5. Monitoring and alerting
    6. Testing approach
    7. Estimated effort
    8. Potential risks and mitigations
    9. Recommended tools or platforms
    
    Suggest the simplest approach that meets requirements.`;

    const plan = await this.chat(prompt);

    return {
      plan,
      approach: 'See detailed plan',
      estimatedEffort: 'See detailed plan',
      risks: this.extractListItems(plan, 'risk'),
    };
  }

  // ============================================
  // Tech Debt Management
  // ============================================

  async assessTechDebt(): Promise<{
    assessment: string;
    totalDebt: TechDebt[];
    prioritizedBacklog: TechDebt[];
    estimatedEffort: number;
    recommendations: string[];
  }> {
    const techDebt = this.techData.techDebt;

    const prompt = `Assess technical debt for a small business:
    
    Known Tech Debt Items: ${techDebt.length}
    ${techDebt.map(d => `- ${d.title} (${d.severity}): ${d.estimatedEffort}hrs`).join('\n') || 'No items documented'}
    
    Provide:
    1. Overall tech debt health assessment
    2. Categories of tech debt to look for
    3. Prioritization framework
    4. Recommended allocation (% of sprint/time)
    5. Quick wins vs. long-term investments
    6. Business impact of ignoring tech debt
    7. Strategies to prevent new tech debt
    
    Focus on practical advice for a small team.`;

    const assessment = await this.chat(prompt);

    return {
      assessment,
      totalDebt: techDebt,
      prioritizedBacklog: [...techDebt].sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      estimatedEffort: techDebt.reduce((sum, d) => sum + d.estimatedEffort, 0),
      recommendations: this.extractListItems(assessment, 'recommend'),
    };
  }

  // ============================================
  // Core Abstract Method Implementations
  // ============================================

  async analyzeData(data: {
    stack?: TechnologyStack[];
    projects?: TechProject[];
    period?: string;
  }): Promise<{
    stackHealth: number;
    securityScore: number;
    projectVelocity: number;
    techDebtLevel: string;
    monthlyCost: number;
    criticalIssues: string[];
    recommendations: string[];
  }> {
    const stack = data.stack || this.techData.stack;
    const projects = data.projects || this.techData.projects;
    const assessments = this.techData.securityAssessments;
    const techDebt = this.techData.techDebt;

    // Calculate metrics
    const deprecatedTools = stack.filter(t => t.status === 'deprecated').length;
    const stackHealth = stack.length > 0 ? ((stack.length - deprecatedTools) / stack.length) * 100 : 100;

    const latestAssessment = assessments[assessments.length - 1];
    const securityScore = latestAssessment?.overallScore || 0;

    const completedProjects = projects.filter(p => p.status === 'deployed').length;
    const projectVelocity = projects.length > 0 ? (completedProjects / projects.length) * 100 : 0;

    const criticalDebt = techDebt.filter(d => d.severity === 'critical').length;
    const techDebtLevel = criticalDebt > 3 ? 'critical' : criticalDebt > 0 ? 'moderate' : 'healthy';

    const monthlyCost = stack.reduce((sum, t) => sum + t.monthlyCost, 0);

    const criticalIssues: string[] = [];
    if (securityScore < 70) criticalIssues.push('Security score below acceptable threshold');
    if (criticalDebt > 0) criticalIssues.push(`${criticalDebt} critical tech debt items need attention`);
    if (deprecatedTools > 0) criticalIssues.push(`${deprecatedTools} deprecated tools still in use`);

    return {
      stackHealth,
      securityScore,
      projectVelocity,
      techDebtLevel,
      monthlyCost,
      criticalIssues,
      recommendations: await this.generateTechRecommendations(),
    };
  }

  async generateReport(
    reportType: string,
    params?: Record<string, unknown>
  ): Promise<string> {
    const context = {
      reportType,
      params,
      stackCount: this.techData.stack.length,
      projectCount: this.techData.projects.length,
      techDebtCount: this.techData.techDebt.length,
    };

    const prompt = `Generate a ${reportType} technology report.
    
    Available data:
    - ${this.techData.stack.length} tools in tech stack
    - ${this.techData.projects.length} tech projects
    - ${this.techData.techDebt.length} tech debt items
    - ${this.techData.securityAssessments.length} security assessments
    - ${this.techData.integrations.length} integrations
    
    Include:
    1. Executive Summary
    2. Technology Stack Overview
    3. Project Status
    4. Security Posture
    5. Technical Debt Status
    6. Infrastructure & Costs
    7. Risks and Concerns
    8. Recommendations
    9. Roadmap Highlights
    
    ${params ? `Additional context: ${JSON.stringify(params)}` : ''}`;

    return await this.chat(prompt, context);
  }

  async getInsights(): Promise<TechInsight[]> {
    const insights: TechInsight[] = [];

    // Check security
    const latestAssessment = this.techData.securityAssessments[this.techData.securityAssessments.length - 1];
    if (latestAssessment && latestAssessment.overallScore < 70) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'security',
        category: 'security',
        title: 'Security Score Below Threshold',
        description: `Current security score is ${latestAssessment.overallScore}/100. Immediate attention required.`,
        impact: 'high',
        actionRequired: true,
        suggestedActions: [
          'Review critical security findings',
          'Implement MFA across all systems',
          'Update access controls',
          'Schedule security training',
        ],
        relatedExecutives: ['CFO'],
        createdAt: new Date(),
      });
    }

    // Check tech debt
    const criticalDebt = this.techData.techDebt.filter(d => d.severity === 'critical');
    if (criticalDebt.length > 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'maintenance',
        category: 'application',
        title: `${criticalDebt.length} Critical Tech Debt Items`,
        description: 'Critical technical debt is accumulating and may impact system stability.',
        impact: 'high',
        actionRequired: true,
        suggestedActions: [
          'Allocate 20% of dev time to debt reduction',
          'Prioritize items by business impact',
          'Document workarounds for deferred items',
        ],
        createdAt: new Date(),
      });
    }

    // Check costs
    const monthlyCost = this.techData.stack.reduce((sum, t) => sum + t.monthlyCost, 0);
    if (monthlyCost > 5000) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'cost',
        category: 'infrastructure',
        title: 'Technology Spend Review Recommended',
        description: `Monthly tech spend is $${monthlyCost.toLocaleString()}. Review for optimization opportunities.`,
        impact: 'medium',
        estimatedSavings: monthlyCost * 0.15, // Assume 15% potential savings
        actionRequired: false,
        suggestedActions: [
          'Audit unused tool licenses',
          'Review cloud resource utilization',
          'Consolidate overlapping tools',
          'Negotiate annual contracts for discounts',
        ],
        relatedExecutives: ['CFO'],
        createdAt: new Date(),
      });
    }

    // Check for stale assessments
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    if (!latestAssessment || latestAssessment.assessmentDate < threeMonthsAgo) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'security',
        category: 'security',
        title: 'Security Assessment Overdue',
        description: 'No security assessment in the past 90 days. Schedule a review.',
        impact: 'medium',
        actionRequired: true,
        suggestedActions: [
          'Schedule security assessment',
          'Review access logs',
          'Update security policies',
        ],
        createdAt: new Date(),
      });
    }

    // No data insight
    if (this.techData.stack.length === 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'opportunity',
        category: 'infrastructure',
        title: 'Document Your Technology Stack',
        description: 'Start by documenting all tools and systems in use.',
        impact: 'medium',
        actionRequired: false,
        suggestedActions: [
          'List all software and SaaS tools',
          'Document monthly costs',
          'Identify tool owners',
          'Note integration points',
        ],
        createdAt: new Date(),
      });
    }

    this.techData.insights = insights;
    return insights;
  }

  // ============================================
  // Collaboration Detection Override
  // ============================================

  protected async processResponseForCollaboration(response: string): Promise<void> {
    const collaborationPatterns = [
      { pattern: /budget|cost|investment|license|subscription/i, executive: 'CFO' as ExecutiveRole },
      { pattern: /marketing|analytics|tracking|customer data|crm/i, executive: 'CMO' as ExecutiveRole },
      { pattern: /automation|workflow|process|integration|efficiency/i, executive: 'COO' as ExecutiveRole },
      { pattern: /training|hiring|developer|engineer|team/i, executive: 'CHRO' as ExecutiveRole },
    ];

    for (const { pattern, executive } of collaborationPatterns) {
      if (pattern.test(response)) {
        const actionIndicators = ['need', 'require', 'recommend', 'suggest', 'should', 'must', 'consider'];
        if (actionIndicators.some(indicator => response.toLowerCase().includes(indicator))) {
          await this.sendMessage(
            executive,
            'Technology Update',
            `The CTO has a technology matter requiring your input: ${response.substring(0, 300)}...`,
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

  private extractListItems(text: string, ...keywords: string[]): string[] {
    const items: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      const hasKeyword = keywords.some(kw => lineLower.includes(kw));
      const isBullet = line.trim().startsWith('-') || line.trim().match(/^\d+\./);

      if (hasKeyword || isBullet) {
        const cleaned = line.replace(/^[-\d.)\s]+/, '').trim();
        if (cleaned.length > 10 && cleaned.length < 200) {
          items.push(cleaned);
        }
      }
    }

    return [...new Set(items)].slice(0, 5);
  }

  private async generateTechRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    if (this.techData.securityAssessments.length === 0) {
      recommendations.push('Conduct initial security assessment');
    }

    if (this.techData.stack.length === 0) {
      recommendations.push('Document current technology stack');
    }

    const criticalDebt = this.techData.techDebt.filter(d => d.severity === 'critical');
    if (criticalDebt.length > 0) {
      recommendations.push('Address critical technical debt items');
    }

    return recommendations;
  }

  // ============================================
  // Data Management
  // ============================================

  addToStack(tool: TechnologyStack): void {
    this.techData.stack.push(tool);
  }

  addProject(project: TechProject): void {
    this.techData.projects.push(project);
  }

  addTechDebt(debt: TechDebt): void {
    this.techData.techDebt.push(debt);
  }

  addIntegration(integration: IntegrationConfig): void {
    this.techData.integrations.push(integration);
  }

  getTechData() {
    return { ...this.techData };
  }
}

// Export singleton instance
export const ctoExecutive = new CTOExecutive();
