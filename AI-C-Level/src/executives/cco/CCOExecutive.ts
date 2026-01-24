import { BaseExecutive, executiveRegistry } from '../shared/BaseExecutive';
import type { ExecutiveRole } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// CCO-Specific Types
// ============================================

export interface ComplianceFramework {
  id: string;
  companyId: string;
  name: string;
  description: string;
  category: 'financial' | 'privacy' | 'industry' | 'employment' | 'general';
  applicableIndustries: string[];
  requirements: ComplianceRequirement[];
  effectiveDate?: Date;
  lastAssessmentDate?: Date;
  overallScore?: number;
  status: 'not_started' | 'in_progress' | 'compliant' | 'non_compliant' | 'partial';
}

export interface ComplianceRequirement {
  id: string;
  frameworkId: string;
  name: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_assessed';
  evidence?: string[];
  dueDate?: Date;
  assignedTo?: string;
  notes?: string;
}

export interface RiskAssessment {
  id: string;
  companyId: string;
  name: string;
  assessmentDate: Date;
  assessor: string;
  overallRiskScore: number; // 1-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  categories: RiskCategory[];
  findings: RiskFinding[];
  recommendations: string[];
  nextAssessmentDate?: Date;
}

export interface RiskCategory {
  name: string;
  score: number; // 1-100
  weight: number; // percentage
  findings: number;
  status: 'acceptable' | 'needs_attention' | 'critical';
}

export interface RiskFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskScore: number;
  currentControls: string[];
  recommendedControls: string[];
  status: 'open' | 'mitigated' | 'accepted' | 'transferred';
  owner?: string;
  dueDate?: Date;
}

export interface CompliancePolicy {
  id: string;
  companyId: string;
  name: string;
  category: 'data_privacy' | 'information_security' | 'financial' | 'hr' | 'operations' | 'ethics' | 'vendor';
  version: string;
  effectiveDate: Date;
  reviewDate: Date;
  nextReviewDate: Date;
  owner: string;
  approver: string;
  status: 'draft' | 'pending_approval' | 'active' | 'under_review' | 'archived';
  content?: string;
  relatedFrameworks: string[];
}

export interface AuditRecord {
  id: string;
  companyId: string;
  auditType: 'internal' | 'external' | 'regulatory';
  auditName: string;
  auditor: string;
  startDate: Date;
  endDate?: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'findings_open';
  scope: string[];
  findings: AuditFinding[];
  overallResult?: 'pass' | 'pass_with_findings' | 'fail';
}

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: 'observation' | 'minor' | 'major' | 'critical';
  requirement: string;
  remediation: string;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'remediated' | 'verified';
  owner?: string;
}

export interface RegulatoryUpdate {
  id: string;
  regulation: string;
  title: string;
  description: string;
  effectiveDate: Date;
  impactLevel: 'low' | 'medium' | 'high';
  applicableAreas: string[];
  actionRequired: boolean;
  actions: string[];
  status: 'new' | 'reviewed' | 'implementing' | 'compliant';
}

export interface ComplianceInsight {
  id: string;
  companyId: string;
  type: 'risk' | 'gap' | 'deadline' | 'regulatory' | 'policy' | 'training';
  category: 'compliance' | 'risk' | 'audit' | 'policy' | 'regulatory';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedExecutives?: ExecutiveRole[];
  deadline?: Date;
  createdAt: Date;
}

// ============================================
// Common Compliance Frameworks
// ============================================

const COMPLIANCE_FRAMEWORKS = {
  GDPR: {
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    category: 'privacy',
    industries: ['all'],
    description: 'EU data protection and privacy regulation',
  },
  CCPA: {
    name: 'CCPA',
    fullName: 'California Consumer Privacy Act',
    category: 'privacy',
    industries: ['all'],
    description: 'California data privacy law',
  },
  HIPAA: {
    name: 'HIPAA',
    fullName: 'Health Insurance Portability and Accountability Act',
    category: 'industry',
    industries: ['healthcare'],
    description: 'US healthcare data protection requirements',
  },
  PCI_DSS: {
    name: 'PCI-DSS',
    fullName: 'Payment Card Industry Data Security Standard',
    category: 'industry',
    industries: ['retail', 'e-commerce', 'finance'],
    description: 'Payment card data security requirements',
  },
  SOX: {
    name: 'SOX',
    fullName: 'Sarbanes-Oxley Act',
    category: 'financial',
    industries: ['public_companies'],
    description: 'Financial reporting and internal controls',
  },
  SOC2: {
    name: 'SOC 2',
    fullName: 'Service Organization Control 2',
    category: 'industry',
    industries: ['technology', 'saas'],
    description: 'Security, availability, and confidentiality controls',
  },
};

// ============================================
// CCO System Prompt
// ============================================

const CCO_SYSTEM_PROMPT = `You are the AI Chief Compliance Officer (CCO) for a small business. Your name is Casey, and you serve as the guardian of regulatory compliance, risk management, and corporate governance.

## Your Role & Responsibilities

1. **Regulatory Compliance**: Ensure the business meets all applicable laws and regulations
2. **Risk Management**: Identify, assess, and mitigate compliance and business risks
3. **Policy Development**: Create and maintain corporate policies and procedures
4. **Audit Support**: Prepare for and support internal and external audits
5. **Training & Awareness**: Guide compliance training and culture
6. **Regulatory Monitoring**: Track regulatory changes that affect the business
7. **Governance**: Support corporate governance and ethical standards

## Core Compliance Frameworks

You have expertise in:
- **Data Privacy**: GDPR, CCPA, state privacy laws, international data transfers
- **Financial**: SOX, GAAP, tax compliance, anti-money laundering
- **Industry-Specific**: HIPAA (healthcare), PCI-DSS (payments), FINRA (finance)
- **Employment**: EEOC, ADA, FMLA, FLSA, OSHA, state labor laws
- **General Business**: Licensing, contracts, insurance, export controls

## Communication Style

- Be precise and thorough—compliance requires accuracy
- Explain regulations in plain language
- Provide actionable recommendations
- Flag deadlines and urgent matters clearly
- Balance risk mitigation with business practicality
- Document everything—if it's not documented, it didn't happen

## Key Behaviors

- Always identify which regulations apply to the business
- Prioritize risks by likelihood and impact
- Provide specific, actionable compliance steps
- Reference actual regulations when possible
- Recommend when to involve legal counsel
- Consider the cost of compliance vs. risk of non-compliance

## Risk Assessment Framework

When assessing risks, consider:
1. **Likelihood**: How probable is this risk occurring?
2. **Impact**: What's the potential damage (financial, reputational, operational)?
3. **Controls**: What safeguards exist or are needed?
4. **Residual Risk**: What risk remains after controls?

Risk Score = Likelihood × Impact

## Collaboration Protocol

When you need input from other executives:
- CFO: Financial compliance, SOX, tax matters, audit budgets
- CHRO: Employment law compliance, HR policies, training
- CTO: Data security, privacy technical controls, IT compliance
- COO: Operational compliance, vendor management, process controls
- CMO: Advertising compliance, data collection practices

Format collaboration requests clearly:
[COLLABORATION REQUEST]
To: [EXECUTIVE ROLE]
Subject: [Brief subject]
Request: [What you need]
Deadline: [If applicable]
Compliance Implication: [Why this matters]
[END REQUEST]

## Current Capabilities

You can help with:
- Compliance gap assessments
- Risk assessments and heat maps
- Regulatory requirement checklists
- Policy and procedure templates
- Audit preparation and support
- Compliance training recommendations
- Regulatory change impact analysis
- Vendor compliance reviews
- Data privacy assessments
- Employment law guidance
- Industry-specific compliance roadmaps

## Important Disclaimers

1. **Not Legal Advice**: I provide compliance guidance, not legal advice. For specific legal questions, litigation, or regulatory enforcement matters, consult with qualified legal counsel.

2. **Jurisdiction Matters**: Regulations vary by jurisdiction. Always verify requirements for your specific location(s).

3. **Changing Regulations**: Laws and regulations change. Verify current requirements before making compliance decisions.

4. **Industry Specifics**: Some industries have specialized requirements beyond general compliance frameworks.

## Compliance Principles

1. **Proactive, Not Reactive**: Prevent issues before they become violations
2. **Documentation**: Maintain evidence of compliance efforts
3. **Continuous Monitoring**: Compliance is ongoing, not one-time
4. **Culture of Compliance**: Everyone's responsibility, not just leadership
5. **Proportionality**: Match controls to risk level
6. **Transparency**: Report issues promptly and honestly

Remember: Good compliance protects the business, builds trust with customers and partners, and creates sustainable competitive advantage. Your job is to help the business succeed within the bounds of applicable laws and ethical standards.`;

// ============================================
// CCO Executive Class
// ============================================

export class CCOExecutive extends BaseExecutive {
  private complianceData: {
    frameworks: ComplianceFramework[];
    riskAssessments: RiskAssessment[];
    policies: CompliancePolicy[];
    audits: AuditRecord[];
    regulatoryUpdates: RegulatoryUpdate[];
    insights: ComplianceInsight[];
  };

  constructor() {
    super({
      role: 'CCO',
      name: 'Casey',
      description: 'AI Chief Compliance Officer - Ensuring regulatory compliance and managing risk',
      capabilities: [
        'regulatory_compliance',
        'risk_management',
        'policy_development',
        'audit_support',
        'compliance_training',
        'regulatory_monitoring',
        'governance',
        'vendor_compliance',
        'data_privacy',
        'employment_compliance',
      ],
      systemPrompt: CCO_SYSTEM_PROMPT,
    });

    this.complianceData = {
      frameworks: [],
      riskAssessments: [],
      policies: [],
      audits: [],
      regulatoryUpdates: [],
      insights: [],
    };

    // Register with the executive registry
    executiveRegistry.register(this);
  }

  // ============================================
  // Compliance Assessment
  // ============================================

  async assessCompliance(params: {
    industry: string;
    location: string;
    businessActivities: string[];
    dataTypes?: string[];
    employeeCount?: number;
  }): Promise<{
    applicableFrameworks: string[];
    assessment: string;
    priorityActions: string[];
    riskAreas: string[];
  }> {
    const prompt = `Assess compliance requirements for this business:
    
    Industry: ${params.industry}
    Location: ${params.location}
    Business Activities: ${params.businessActivities.join(', ')}
    ${params.dataTypes ? `Data Types Handled: ${params.dataTypes.join(', ')}` : ''}
    ${params.employeeCount ? `Employee Count: ${params.employeeCount}` : ''}
    
    Please provide:
    1. List of applicable compliance frameworks and regulations
    2. Assessment of current compliance posture (based on typical gaps)
    3. Priority actions to address most critical compliance needs
    4. Key risk areas to monitor
    5. Recommended timeline for compliance initiatives
    
    Focus on practical, actionable guidance for a small business.`;

    const assessment = await this.chat(prompt);

    // Extract framework names
    const applicableFrameworks: string[] = [];
    for (const [key, framework] of Object.entries(COMPLIANCE_FRAMEWORKS)) {
      if (assessment.toLowerCase().includes(framework.name.toLowerCase())) {
        applicableFrameworks.push(key);
      }
    }

    return {
      applicableFrameworks,
      assessment,
      priorityActions: this.extractListItems(assessment, 'priority', 'action', 'immediate'),
      riskAreas: this.extractListItems(assessment, 'risk', 'concern', 'gap'),
    };
  }

  async performRiskAssessment(params: {
    scope: string;
    areas?: string[];
  }): Promise<RiskAssessment> {
    const prompt = `Perform a compliance risk assessment:
    
    Scope: ${params.scope}
    ${params.areas ? `Focus Areas: ${params.areas.join(', ')}` : ''}
    
    Assess risks across these categories:
    1. Regulatory Compliance
    2. Data Privacy
    3. Financial Controls
    4. Employment Practices
    5. Operational Compliance
    6. Vendor/Third-Party Risk
    7. Cybersecurity Compliance
    
    For each category provide:
    - Risk score (1-100)
    - Key findings
    - Status (acceptable/needs_attention/critical)
    
    Then provide:
    - Overall risk score
    - Top 5 risk findings with severity
    - Prioritized recommendations
    
    Be specific and actionable.`;

    const response = await this.chat(prompt);

    // Parse risk score
    const scoreMatch = response.match(/overall.*?(\d+)\s*(?:\/\s*100|%)/i);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 65;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (overallScore >= 80) riskLevel = 'low';
    else if (overallScore >= 60) riskLevel = 'medium';
    else if (overallScore >= 40) riskLevel = 'high';
    else riskLevel = 'critical';

    const assessment: RiskAssessment = {
      id: uuidv4(),
      companyId: 'default',
      name: `Risk Assessment - ${params.scope}`,
      assessmentDate: new Date(),
      assessor: 'CCO (Casey)',
      overallRiskScore: overallScore,
      riskLevel,
      categories: [],
      findings: [],
      recommendations: this.extractListItems(response, 'recommend'),
      nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    };

    this.complianceData.riskAssessments.push(assessment);

    // Alert CFO if high risk
    if (riskLevel === 'high' || riskLevel === 'critical') {
      await this.sendMessage(
        'CFO',
        `Compliance Risk Alert: ${riskLevel.toUpperCase()}`,
        `Risk assessment completed with ${riskLevel} overall risk level (score: ${overallScore}/100). Immediate attention may be required for compliance investments.`,
        'urgent'
      );
    }

    return assessment;
  }

  // ============================================
  // Policy Management
  // ============================================

  async createPolicy(params: {
    policyType: CompliancePolicy['category'];
    policyName: string;
    requirements?: string[];
  }): Promise<string> {
    const prompt = `Create a compliance policy:
    
    Policy Type: ${params.policyType.replace('_', ' ')}
    Policy Name: ${params.policyName}
    ${params.requirements ? `Specific Requirements:\n${params.requirements.map(r => `- ${r}`).join('\n')}` : ''}
    
    Create a comprehensive policy document including:
    1. Policy Statement & Purpose
    2. Scope & Applicability
    3. Definitions
    4. Roles & Responsibilities
    5. Policy Requirements (detailed)
    6. Procedures
    7. Compliance Monitoring
    8. Violations & Consequences
    9. Exceptions Process
    10. Related Policies
    11. Review Schedule
    12. Approval & Version History
    
    Make it practical for a small business while meeting compliance standards.
    
    IMPORTANT: This is a template. Have legal counsel review before finalizing.`;

    return await this.chat(prompt);
  }

  async reviewPolicy(params: {
    policyName: string;
    policyContent: string;
    applicableRegulations?: string[];
  }): Promise<{
    review: string;
    gaps: string[];
    recommendations: string[];
    complianceScore: number;
  }> {
    const prompt = `Review this policy for compliance:
    
    Policy: ${params.policyName}
    ${params.applicableRegulations ? `Applicable Regulations: ${params.applicableRegulations.join(', ')}` : ''}
    
    Policy Content:
    ${params.policyContent.substring(0, 3000)}...
    
    Provide:
    1. Overall assessment of policy adequacy
    2. Gaps or missing elements
    3. Specific improvement recommendations
    4. Compliance score (1-100)
    5. Priority fixes needed
    
    Focus on practical improvements.`;

    const review = await this.chat(prompt);

    const scoreMatch = review.match(/(\d+)\s*(?:\/\s*100|%)/i);
    const complianceScore = scoreMatch ? parseInt(scoreMatch[1]) : 70;

    return {
      review,
      gaps: this.extractListItems(review, 'gap', 'missing', 'lack'),
      recommendations: this.extractListItems(review, 'recommend', 'suggest', 'should'),
      complianceScore,
    };
  }

  // ============================================
  // Audit Support
  // ============================================

  async prepareForAudit(params: {
    auditType: AuditRecord['auditType'];
    auditScope: string[];
    auditDate: Date;
  }): Promise<string> {
    const prompt = `Prepare for an upcoming audit:
    
    Audit Type: ${params.auditType}
    Scope: ${params.auditScope.join(', ')}
    Date: ${params.auditDate.toLocaleDateString()}
    
    Provide a comprehensive audit preparation plan:
    
    1. **Pre-Audit Checklist**
       - Documentation to gather
       - Systems to review
       - Personnel to brief
    
    2. **Evidence Collection**
       - Required documentation by scope area
       - Format requirements
       - Organization method
    
    3. **Gap Assessment**
       - Common findings to proactively address
       - Quick fixes before audit
       - Items to disclose proactively
    
    4. **Team Preparation**
       - Roles and responsibilities
       - Interview preparation
       - Escalation procedures
    
    5. **Day-of Logistics**
       - Space and equipment
       - Point of contact
       - Information request process
    
    6. **Timeline**
       - Week-by-week tasks leading to audit
    
    Focus on practical preparation for a small business.`;

    return await this.chat(prompt);
  }

  async generateComplianceChecklist(params: {
    framework: string;
    scope?: string;
  }): Promise<string> {
    const frameworkInfo = COMPLIANCE_FRAMEWORKS[params.framework as keyof typeof COMPLIANCE_FRAMEWORKS];

    const prompt = `Generate a compliance checklist for ${params.framework}:
    
    Framework: ${frameworkInfo?.fullName || params.framework}
    ${frameworkInfo?.description ? `Description: ${frameworkInfo.description}` : ''}
    ${params.scope ? `Scope: ${params.scope}` : ''}
    
    Create a detailed checklist with:
    1. Categories of requirements
    2. Specific control objectives
    3. Evidence needed for each
    4. Typical implementation steps
    5. Common gaps to watch for
    
    Format as an actionable checklist suitable for self-assessment.
    
    Note: This is guidance only. Verify current regulatory requirements.`;

    return await this.chat(prompt);
  }

  // ============================================
  // Regulatory Monitoring
  // ============================================

  async analyzeRegulatoryChange(params: {
    regulation: string;
    changeDescription: string;
    effectiveDate?: Date;
  }): Promise<{
    analysis: string;
    impactLevel: 'low' | 'medium' | 'high';
    actionItems: string[];
    affectedAreas: string[];
  }> {
    const prompt = `Analyze this regulatory change:
    
    Regulation: ${params.regulation}
    Change: ${params.changeDescription}
    ${params.effectiveDate ? `Effective Date: ${params.effectiveDate.toLocaleDateString()}` : ''}
    
    Provide:
    1. Summary of the change and its implications
    2. Impact assessment (low/medium/high) with justification
    3. Affected business areas
    4. Required actions to achieve compliance
    5. Timeline for implementation
    6. Resources needed
    7. Related executives to involve
    
    Focus on practical impact for a small business.`;

    const analysis = await this.chat(prompt);

    // Determine impact level
    let impactLevel: 'low' | 'medium' | 'high' = 'medium';
    if (analysis.toLowerCase().includes('high impact') || analysis.toLowerCase().includes('significant')) {
      impactLevel = 'high';
    } else if (analysis.toLowerCase().includes('low impact') || analysis.toLowerCase().includes('minimal')) {
      impactLevel = 'low';
    }

    // Notify relevant executives for high impact
    if (impactLevel === 'high') {
      await this.sendMessage(
        'CFO',
        `High-Impact Regulatory Change: ${params.regulation}`,
        `A regulatory change may require significant compliance investment. Please review.`,
        'high'
      );
    }

    return {
      analysis,
      impactLevel,
      actionItems: this.extractListItems(analysis, 'action', 'must', 'required', 'need'),
      affectedAreas: this.extractListItems(analysis, 'affect', 'impact', 'area'),
    };
  }

  // ============================================
  // Vendor Compliance
  // ============================================

  async assessVendorCompliance(params: {
    vendorName: string;
    serviceType: string;
    dataAccess: string[];
    certifications?: string[];
  }): Promise<string> {
    const prompt = `Assess vendor compliance risk:
    
    Vendor: ${params.vendorName}
    Service Type: ${params.serviceType}
    Data Access: ${params.dataAccess.join(', ')}
    ${params.certifications ? `Certifications: ${params.certifications.join(', ')}` : ''}
    
    Provide:
    1. Compliance risk assessment
    2. Required due diligence items
    3. Contractual protections needed
    4. Ongoing monitoring requirements
    5. Red flags to watch for
    6. Recommended vendor questionnaire topics
    
    Consider data privacy, security, and regulatory requirements.`;

    // Notify COO about vendor review
    await this.sendMessage(
      'COO',
      `Vendor Compliance Review: ${params.vendorName}`,
      `Conducting compliance assessment for vendor providing ${params.serviceType}. May need operational input.`,
      'normal'
    );

    return await this.chat(prompt);
  }

  // ============================================
  // Training
  // ============================================

  async createTrainingPlan(params: {
    topic: string;
    audience: string;
    complianceRequirements?: string[];
  }): Promise<string> {
    const prompt = `Create a compliance training plan:
    
    Topic: ${params.topic}
    Audience: ${params.audience}
    ${params.complianceRequirements ? `Compliance Requirements: ${params.complianceRequirements.join(', ')}` : ''}
    
    Develop a training program including:
    1. Learning objectives
    2. Training content outline
    3. Delivery method recommendations
    4. Duration and frequency
    5. Assessment methods
    6. Documentation requirements
    7. Tracking and reporting
    8. Refresher schedule
    
    Make it engaging and practical for busy employees.`;

    // Notify CHRO about training need
    await this.sendMessage(
      'CHRO',
      `Compliance Training Needed: ${params.topic}`,
      `Developing compliance training for ${params.audience}. Will need HR support for scheduling and tracking.`,
      'normal'
    );

    return await this.chat(prompt);
  }

  // ============================================
  // Core Abstract Method Implementations
  // ============================================

  async analyzeData(data: {
    frameworks?: ComplianceFramework[];
    assessments?: RiskAssessment[];
  }): Promise<{
    overallComplianceScore: number;
    riskLevel: string;
    openFindings: number;
    upcomingDeadlines: number;
    criticalIssues: string[];
    recommendations: string[];
  }> {
    const frameworks = data.frameworks || this.complianceData.frameworks;
    const assessments = data.assessments || this.complianceData.riskAssessments;

    // Calculate overall compliance
    const frameworkScores = frameworks
      .filter(f => f.overallScore !== undefined)
      .map(f => f.overallScore!);
    const overallComplianceScore = frameworkScores.length > 0
      ? Math.round(frameworkScores.reduce((a, b) => a + b, 0) / frameworkScores.length)
      : 0;

    // Get latest risk assessment
    const latestAssessment = assessments[assessments.length - 1];
    const riskLevel = latestAssessment?.riskLevel || 'not_assessed';

    const criticalIssues: string[] = [];
    if (overallComplianceScore > 0 && overallComplianceScore < 60) {
      criticalIssues.push('Overall compliance score below acceptable threshold');
    }
    if (riskLevel === 'critical' || riskLevel === 'high') {
      criticalIssues.push(`Risk level is ${riskLevel} - immediate attention required`);
    }

    return {
      overallComplianceScore,
      riskLevel,
      openFindings: 0,
      upcomingDeadlines: 0,
      criticalIssues,
      recommendations: await this.generateComplianceRecommendations(),
    };
  }

  async generateReport(
    reportType: string,
    params?: Record<string, unknown>
  ): Promise<string> {
    const prompt = `Generate a ${reportType} compliance report.
    
    Include:
    1. Executive Summary
    2. Compliance Posture Overview
    3. Risk Assessment Summary
    4. Framework-by-Framework Status
    5. Open Findings and Remediation Status
    6. Policy Review Status
    7. Training Completion
    8. Upcoming Deadlines
    9. Regulatory Changes
    10. Recommendations
    
    ${params ? `Additional context: ${JSON.stringify(params)}` : ''}`;

    return await this.chat(prompt);
  }

  async getInsights(): Promise<ComplianceInsight[]> {
    const insights: ComplianceInsight[] = [];

    // Check for missing risk assessment
    if (this.complianceData.riskAssessments.length === 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'risk',
        category: 'risk',
        title: 'No Risk Assessment on File',
        description: 'A compliance risk assessment has not been performed. This is essential for understanding your compliance posture.',
        impact: 'high',
        urgency: 'high',
        actionRequired: true,
        suggestedActions: [
          'Schedule initial compliance risk assessment',
          'Identify applicable regulations for your business',
          'Document current compliance controls',
        ],
        createdAt: new Date(),
      });
    }

    // Check for policy gaps
    const policyCategories = ['data_privacy', 'information_security', 'hr', 'ethics'];
    const existingPolicies = new Set(this.complianceData.policies.map(p => p.category));
    const missingPolicies = policyCategories.filter(c => !existingPolicies.has(c as any));

    if (missingPolicies.length > 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'policy',
        category: 'compliance',
        title: 'Essential Policies Missing',
        description: `Missing policies: ${missingPolicies.join(', ')}. These are foundational for compliance.`,
        impact: 'medium',
        urgency: 'medium',
        actionRequired: true,
        suggestedActions: [
          'Prioritize data privacy and security policies',
          'Use policy templates as starting points',
          'Have legal review critical policies',
        ],
        createdAt: new Date(),
      });
    }

    // No data prompt
    if (this.complianceData.frameworks.length === 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'gap',
        category: 'compliance',
        title: 'Establish Your Compliance Foundation',
        description: 'Start by identifying which regulations apply to your business and performing an initial assessment.',
        impact: 'medium',
        urgency: 'medium',
        actionRequired: false,
        suggestedActions: [
          'Complete compliance assessment questionnaire',
          'Identify applicable frameworks (GDPR, CCPA, etc.)',
          'Create compliance roadmap',
        ],
        createdAt: new Date(),
      });
    }

    this.complianceData.insights = insights;
    return insights;
  }

  // ============================================
  // Collaboration Detection Override
  // ============================================

  protected async processResponseForCollaboration(response: string): Promise<void> {
    const collaborationPatterns = [
      { pattern: /financial.*compliance|sox|audit.*cost|compliance.*budget/i, executive: 'CFO' as ExecutiveRole },
      { pattern: /employee.*training|hr.*policy|employment.*law|workplace/i, executive: 'CHRO' as ExecutiveRole },
      { pattern: /data.*security|encryption|access.*control|cyber/i, executive: 'CTO' as ExecutiveRole },
      { pattern: /vendor.*compliance|operational.*control|process.*compliance/i, executive: 'COO' as ExecutiveRole },
      { pattern: /privacy.*notice|marketing.*compliance|advertising.*regulation/i, executive: 'CMO' as ExecutiveRole },
    ];

    for (const { pattern, executive } of collaborationPatterns) {
      if (pattern.test(response)) {
        const urgentIndicators = ['immediate', 'urgent', 'critical', 'violation', 'breach'];
        const isUrgent = urgentIndicators.some(ind => response.toLowerCase().includes(ind));

        await this.sendMessage(
          executive,
          'Compliance Matter Requiring Attention',
          `The CCO has identified a compliance matter in your area: ${response.substring(0, 300)}...`,
          isUrgent ? 'urgent' : 'normal'
        );
        break;
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
        const cleaned = line.replace(/^[-\d.)\s*]+/, '').trim();
        if (cleaned.length > 10 && cleaned.length < 300) {
          items.push(cleaned);
        }
      }
    }

    return [...new Set(items)].slice(0, 7);
  }

  private async generateComplianceRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    if (this.complianceData.riskAssessments.length === 0) {
      recommendations.push('Perform initial compliance risk assessment');
    }

    if (this.complianceData.policies.length < 3) {
      recommendations.push('Develop essential compliance policies (privacy, security, ethics)');
    }

    if (this.complianceData.frameworks.length === 0) {
      recommendations.push('Identify and document applicable compliance frameworks');
    }

    return recommendations;
  }

  // ============================================
  // Data Management
  // ============================================

  addFramework(framework: ComplianceFramework): void {
    this.complianceData.frameworks.push(framework);
  }

  addPolicy(policy: CompliancePolicy): void {
    this.complianceData.policies.push(policy);
  }

  addAudit(audit: AuditRecord): void {
    this.complianceData.audits.push(audit);
  }

  getComplianceData() {
    return { ...this.complianceData };
  }
}

// Export singleton instance
export const ccoExecutive = new CCOExecutive();
