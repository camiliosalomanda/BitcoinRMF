import { BaseExecutive, executiveRegistry } from '../shared/BaseExecutive';
import type {
  ExecutiveRole,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// CHRO-Specific Types
// ============================================

export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
  employmentType: 'full_time' | 'part_time' | 'contractor' | 'intern';
  startDate: Date;
  manager?: string;
  salary?: number;
  status: 'active' | 'on_leave' | 'terminated' | 'offboarding';
  skills: string[];
  certifications: string[];
  lastReviewDate?: Date;
  nextReviewDate?: Date;
}

export interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  department: string;
  level: Employee['level'];
  employmentType: Employee['employmentType'];
  description: string;
  requirements: string[];
  niceToHave: string[];
  salaryRange?: { min: number; max: number };
  location: 'remote' | 'hybrid' | 'onsite';
  status: 'draft' | 'open' | 'paused' | 'closed' | 'filled';
  postedDate?: Date;
  applicantCount: number;
  interviewCount: number;
  createdAt: Date;
}

export interface Candidate {
  id: string;
  jobPostingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  source: 'job_board' | 'referral' | 'linkedin' | 'website' | 'agency' | 'other';
  status: 'new' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  rating?: number; // 1-5
  notes: string;
  interviewFeedback: InterviewFeedback[];
  appliedDate: Date;
}

export interface InterviewFeedback {
  id: string;
  interviewerId: string;
  interviewerName: string;
  date: Date;
  type: 'phone_screen' | 'technical' | 'behavioral' | 'culture_fit' | 'final';
  rating: number; // 1-5
  strengths: string[];
  concerns: string[];
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
  notes: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  reviewDate: Date;
  overallRating: number; // 1-5
  categories: PerformanceCategory[];
  strengths: string[];
  areasForImprovement: string[];
  goals: PerformanceGoal[];
  compensation?: CompensationRecommendation;
  status: 'draft' | 'submitted' | 'acknowledged' | 'completed';
}

export interface PerformanceCategory {
  name: string;
  rating: number; // 1-5
  weight: number; // percentage
  comments: string;
}

export interface PerformanceGoal {
  id: string;
  description: string;
  targetDate: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'missed';
  progress: number; // percentage
}

export interface CompensationRecommendation {
  currentSalary: number;
  recommendedSalary: number;
  increasePercentage: number;
  effectiveDate: Date;
  justification: string;
  status: 'pending' | 'approved' | 'denied' | 'modified';
}

export interface TrainingProgram {
  id: string;
  companyId: string;
  name: string;
  description: string;
  type: 'onboarding' | 'skills' | 'compliance' | 'leadership' | 'professional_development';
  format: 'in_person' | 'online' | 'hybrid' | 'self_paced';
  duration: number; // hours
  mandatory: boolean;
  targetAudience: string[];
  completionRate: number;
  status: 'active' | 'archived' | 'development';
}

export interface EmployeeEngagement {
  id: string;
  companyId: string;
  surveyDate: Date;
  overallScore: number; // 1-100
  responseRate: number; // percentage
  categories: EngagementCategory[];
  topStrengths: string[];
  topConcerns: string[];
  actionItems: string[];
}

export interface EngagementCategory {
  name: string;
  score: number; // 1-100
  trend: 'improving' | 'stable' | 'declining';
  benchmark?: number;
}

export interface HRPolicy {
  id: string;
  companyId: string;
  name: string;
  category: 'time_off' | 'compensation' | 'conduct' | 'benefits' | 'remote_work' | 'safety' | 'dei';
  description: string;
  effectiveDate: Date;
  lastReviewDate: Date;
  nextReviewDate: Date;
  status: 'draft' | 'active' | 'under_review' | 'archived';
}

export interface HRInsight {
  id: string;
  companyId: string;
  type: 'retention' | 'engagement' | 'hiring' | 'compliance' | 'culture' | 'development';
  category: 'workforce' | 'talent' | 'culture' | 'compliance' | 'compensation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedExecutives?: ExecutiveRole[];
  createdAt: Date;
}

// ============================================
// CHRO System Prompt
// ============================================

const CHRO_SYSTEM_PROMPT = `You are the AI Chief Human Resources Officer (CHRO) for a small business. Your name is Taylor, and you serve as the people strategist, culture champion, and trusted advisor on all things related to the workforce.

## Your Role & Responsibilities

1. **Talent Acquisition**: Attract, recruit, and hire the right people for the organization
2. **Employee Development**: Foster growth through training, mentorship, and career pathing
3. **Culture & Engagement**: Build and maintain a positive, productive workplace culture
4. **Performance Management**: Design and implement fair, effective performance systems
5. **Compensation & Benefits**: Ensure competitive, equitable compensation packages
6. **HR Compliance**: Maintain compliance with employment laws and regulations
7. **Employee Relations**: Support managers and employees through workplace challenges

## Communication Style

- Be empathetic, approachable, and people-focused
- Balance employee advocacy with business needs
- Use data to support decisions but remember the human element
- Be direct but tactful when addressing sensitive issues
- Maintain confidentiality and build trust

## Key Behaviors

- Always consider the employee experience and impact
- Think about diversity, equity, and inclusion in all decisions
- Balance consistency with flexibility for individual circumstances
- Stay current on employment law and HR best practices
- Build scalable HR processes that grow with the company
- Document everything—good HR is proactive HR

## Collaboration Protocol

When you need input from other executives:
- CFO: Compensation budgets, benefits costs, headcount planning
- CMO: Employer branding, recruitment marketing
- COO: Workforce planning, operational staffing needs
- CTO: Technical hiring, skills assessment, team structure

Format collaboration requests clearly:
[COLLABORATION REQUEST]
To: [EXECUTIVE ROLE]
Subject: [Brief subject]
Request: [What you need]
Deadline: [If applicable]
[END REQUEST]

When receiving staffing requests:
- Assess job requirements and market conditions
- Provide realistic timeline estimates
- Flag budget or compliance concerns
- Suggest alternatives if needed (contractors, restructuring)

## Current Capabilities

You can help with:
- Job description writing and optimization
- Interview question development
- Hiring process design
- Onboarding program creation
- Performance review frameworks
- Compensation benchmarking guidance
- Employee handbook policies
- Training program development
- Culture initiatives
- Employee engagement strategies
- Conflict resolution guidance
- Termination and offboarding processes
- HR compliance checklists
- Diversity and inclusion programs
- Remote work policies
- Employee recognition programs

## HR Principles

1. **People First**: Employees are the company's greatest asset
2. **Fairness**: Consistent, equitable treatment for all
3. **Transparency**: Clear communication builds trust
4. **Development**: Invest in people's growth
5. **Compliance**: Follow the law, always
6. **Documentation**: If it isn't documented, it didn't happen
7. **Confidentiality**: Protect sensitive information

## For Small Business Context

- Focus on practical, scalable HR practices
- Recommend cost-effective benefits and perks
- Balance formal processes with startup flexibility
- Prioritize compliance essentials first
- Suggest when to bring in HR specialists or legal counsel
- Build culture intentionally, even with a small team

## Legal Disclaimer

While I can provide HR guidance and best practices, I am not a lawyer. For specific legal questions about employment law, discrimination claims, terminations, or compliance matters, I recommend consulting with an employment attorney or HR legal specialist.

Remember: Great HR is about creating an environment where people can do their best work. Your job is to be the champion of both the employee experience and organizational effectiveness.`;

// ============================================
// CHRO Executive Class
// ============================================

export class CHROExecutive extends BaseExecutive {
  private hrData: {
    employees: Employee[];
    jobPostings: JobPosting[];
    candidates: Candidate[];
    performanceReviews: PerformanceReview[];
    trainingPrograms: TrainingProgram[];
    engagementSurveys: EmployeeEngagement[];
    policies: HRPolicy[];
    insights: HRInsight[];
  };

  constructor() {
    super({
      role: 'CHRO',
      name: 'Taylor',
      description: 'AI Chief Human Resources Officer - Building teams and nurturing culture',
      capabilities: [
        'talent_acquisition',
        'employee_development',
        'performance_management',
        'compensation_planning',
        'culture_building',
        'hr_compliance',
        'employee_relations',
        'training_development',
        'engagement_programs',
        'policy_creation',
      ],
      systemPrompt: CHRO_SYSTEM_PROMPT,
    });

    this.hrData = {
      employees: [],
      jobPostings: [],
      candidates: [],
      performanceReviews: [],
      trainingPrograms: [],
      engagementSurveys: [],
      policies: [],
      insights: [],
    };

    // Register with the executive registry
    executiveRegistry.register(this);
  }

  // ============================================
  // Talent Acquisition
  // ============================================

  async createJobDescription(params: {
    title: string;
    department: string;
    level: Employee['level'];
    responsibilities: string[];
    requirements?: string[];
    location: JobPosting['location'];
    salaryRange?: { min: number; max: number };
  }): Promise<{
    jobDescription: string;
    interviewQuestions: string[];
    scoringCriteria: string[];
  }> {
    const prompt = `Create a comprehensive job posting:
    
    Title: ${params.title}
    Department: ${params.department}
    Level: ${params.level}
    Location: ${params.location}
    ${params.salaryRange ? `Salary Range: $${params.salaryRange.min.toLocaleString()} - $${params.salaryRange.max.toLocaleString()}` : ''}
    
    Key Responsibilities:
    ${params.responsibilities.map(r => `- ${r}`).join('\n')}
    
    ${params.requirements ? `Initial Requirements:\n${params.requirements.map(r => `- ${r}`).join('\n')}` : ''}
    
    Please provide:
    1. A compelling job description that attracts quality candidates
    2. Clear requirements (must-have vs. nice-to-have)
    3. Information about company culture and benefits
    4. 5 behavioral interview questions for this role
    5. Key evaluation criteria for candidate scoring
    
    Make it appealing for a small business environment—emphasize impact, growth, and culture.`;

    const response = await this.chat(prompt);

    return {
      jobDescription: response,
      interviewQuestions: this.extractListItems(response, 'interview', 'question'),
      scoringCriteria: this.extractListItems(response, 'criteri', 'evaluat'),
    };
  }

  async screenCandidate(params: {
    jobTitle: string;
    candidateSummary: string;
    resumeHighlights: string[];
    concerns?: string[];
  }): Promise<{
    assessment: string;
    fitScore: number;
    strengths: string[];
    concerns: string[];
    interviewFocus: string[];
    recommendation: 'advance' | 'consider' | 'pass';
  }> {
    const prompt = `Screen this candidate:
    
    Position: ${params.jobTitle}
    
    Candidate Summary:
    ${params.candidateSummary}
    
    Resume Highlights:
    ${params.resumeHighlights.map(h => `- ${h}`).join('\n')}
    
    ${params.concerns ? `Initial Concerns:\n${params.concerns.map(c => `- ${c}`).join('\n')}` : ''}
    
    Provide:
    1. Overall assessment of candidate fit
    2. Fit score (1-100)
    3. Key strengths for this role
    4. Potential concerns to explore
    5. Specific areas to focus on in the interview
    6. Recommendation: advance, consider, or pass`;

    const assessment = await this.chat(prompt);

    // Parse fit score
    const scoreMatch = assessment.match(/(\d+)\s*(?:\/\s*100|%|out of 100)/i);
    const fitScore = scoreMatch ? parseInt(scoreMatch[1]) : 70;

    // Determine recommendation
    let recommendation: 'advance' | 'consider' | 'pass' = 'consider';
    if (assessment.toLowerCase().includes('advance') || fitScore >= 80) {
      recommendation = 'advance';
    } else if (assessment.toLowerCase().includes('pass') || fitScore < 50) {
      recommendation = 'pass';
    }

    return {
      assessment,
      fitScore,
      strengths: this.extractListItems(assessment, 'strength', 'strong'),
      concerns: this.extractListItems(assessment, 'concern', 'risk', 'weakness'),
      interviewFocus: this.extractListItems(assessment, 'focus', 'explore', 'ask'),
      recommendation,
    };
  }

  async createInterviewPlan(params: {
    jobTitle: string;
    interviewRound: 'phone_screen' | 'technical' | 'behavioral' | 'culture_fit' | 'final';
    duration: number; // minutes
    interviewerRole: string;
  }): Promise<string> {
    const prompt = `Create an interview plan:
    
    Position: ${params.jobTitle}
    Interview Round: ${params.interviewRound.replace('_', ' ')}
    Duration: ${params.duration} minutes
    Interviewer: ${params.interviewerRole}
    
    Provide:
    1. Interview structure and timing
    2. Opening (build rapport)
    3. Core questions (with follow-ups)
    4. Candidate questions time
    5. Evaluation criteria
    6. Red flags to watch for
    7. Closing script
    8. Post-interview scoring template
    
    Include specific questions appropriate for a small business environment.`;

    return await this.chat(prompt);
  }

  // ============================================
  // Onboarding & Development
  // ============================================

  async createOnboardingPlan(params: {
    role: string;
    department: string;
    startDate: Date;
    isRemote: boolean;
  }): Promise<string> {
    const prompt = `Create a 90-day onboarding plan:
    
    Role: ${params.role}
    Department: ${params.department}
    Start Date: ${params.startDate.toLocaleDateString()}
    Work Arrangement: ${params.isRemote ? 'Remote' : 'In-office'}
    
    Provide a detailed plan covering:
    
    **Pre-boarding (before Day 1):**
    - Equipment and access setup
    - Welcome communications
    - First day logistics
    
    **Week 1: Orientation**
    - Day 1 schedule
    - Key meetings and introductions
    - Essential training
    - Initial goals
    
    **Days 8-30: Foundation**
    - Role-specific training
    - Key relationships to build
    - First projects/tasks
    - Check-in cadence
    
    **Days 31-60: Integration**
    - Increasing responsibilities
    - Cross-functional exposure
    - Feedback loops
    - Skill development
    
    **Days 61-90: Contribution**
    - Full role expectations
    - Performance milestones
    - 90-day review preparation
    - Long-term goal setting
    
    Make it practical for a small business without a formal HR department.`;

    return await this.chat(prompt);
  }

  async designTrainingProgram(params: {
    topic: string;
    targetAudience: string;
    learningObjectives: string[];
    format: TrainingProgram['format'];
    duration: number;
  }): Promise<string> {
    const prompt = `Design a training program:
    
    Topic: ${params.topic}
    Target Audience: ${params.targetAudience}
    Format: ${params.format}
    Duration: ${params.duration} hours
    
    Learning Objectives:
    ${params.learningObjectives.map(o => `- ${o}`).join('\n')}
    
    Provide:
    1. Program overview and goals
    2. Module breakdown with timing
    3. Content outline for each module
    4. Interactive elements and exercises
    5. Assessment methods
    6. Materials needed
    7. Facilitator guide highlights
    8. Success metrics
    
    Keep it engaging and practical for adult learners in a small business.`;

    return await this.chat(prompt);
  }

  // ============================================
  // Performance Management
  // ============================================

  async createPerformanceFramework(params: {
    companySize: number;
    reviewCycle: 'annual' | 'semi_annual' | 'quarterly';
    existingChallenges?: string[];
  }): Promise<string> {
    const prompt = `Design a performance management framework:
    
    Company Size: ${params.companySize} employees
    Review Cycle: ${params.reviewCycle.replace('_', '-')}
    ${params.existingChallenges ? `Current Challenges:\n${params.existingChallenges.map(c => `- ${c}`).join('\n')}` : ''}
    
    Provide:
    1. Philosophy and principles
    2. Goal-setting framework (OKRs, SMART, etc.)
    3. Continuous feedback mechanisms
    4. Formal review structure
    5. Rating scale and definitions
    6. Calibration process
    7. Development planning integration
    8. Compensation linkage guidance
    9. Manager training needs
    10. Templates and tools needed
    
    Design for simplicity and effectiveness in a small business.`;

    return await this.chat(prompt);
  }

  async writePerformanceReview(params: {
    employeeRole: string;
    reviewPeriod: string;
    accomplishments: string[];
    challenges: string[];
    rating: number; // 1-5
  }): Promise<string> {
    const prompt = `Help write a performance review:
    
    Role: ${params.employeeRole}
    Review Period: ${params.reviewPeriod}
    Overall Rating: ${params.rating}/5
    
    Key Accomplishments:
    ${params.accomplishments.map(a => `- ${a}`).join('\n')}
    
    Challenges/Areas for Growth:
    ${params.challenges.map(c => `- ${c}`).join('\n')}
    
    Provide:
    1. Opening summary statement
    2. Detailed accomplishment highlights with impact
    3. Constructive feedback on growth areas
    4. Specific, actionable development goals
    5. Career discussion talking points
    6. Closing encouragement
    
    Use a balanced, constructive tone that motivates and develops.`;

    return await this.chat(prompt);
  }

  // ============================================
  // Culture & Engagement
  // ============================================

  async assessCulture(params: {
    currentValues?: string[];
    observedBehaviors?: string[];
    concerns?: string[];
  }): Promise<{
    assessment: string;
    strengths: string[];
    risks: string[];
    recommendations: string[];
  }> {
    const prompt = `Assess organizational culture:
    
    ${params.currentValues ? `Stated Values:\n${params.currentValues.map(v => `- ${v}`).join('\n')}` : ''}
    
    ${params.observedBehaviors ? `Observed Behaviors:\n${params.observedBehaviors.map(b => `- ${b}`).join('\n')}` : ''}
    
    ${params.concerns ? `Concerns Raised:\n${params.concerns.map(c => `- ${c}`).join('\n')}` : ''}
    
    Analyze:
    1. Alignment between stated values and behaviors
    2. Cultural strengths to amplify
    3. Cultural risks to address
    4. Impact on retention and performance
    5. Specific improvement recommendations
    6. Quick wins vs. long-term initiatives
    
    Consider this is a small business where culture is built daily through actions.`;

    const assessment = await this.chat(prompt);

    return {
      assessment,
      strengths: this.extractListItems(assessment, 'strength', 'positive', 'strong'),
      risks: this.extractListItems(assessment, 'risk', 'concern', 'challenge'),
      recommendations: this.extractListItems(assessment, 'recommend'),
    };
  }

  async createEngagementSurvey(params: {
    focus?: string[];
    anonymous: boolean;
  }): Promise<string> {
    const prompt = `Create an employee engagement survey:
    
    ${params.focus ? `Focus Areas: ${params.focus.join(', ')}` : ''}
    Anonymous: ${params.anonymous ? 'Yes' : 'No'}
    
    Provide:
    1. Survey introduction and instructions
    2. 15-20 core questions covering:
       - Job satisfaction
       - Manager relationship
       - Team dynamics
       - Growth opportunities
       - Company direction
       - Work-life balance
       - Recognition
       - Resources and tools
    3. Rating scale recommendations
    4. 3-5 open-ended questions
    5. Demographic questions (optional)
    6. Closing message
    7. Tips for maximizing response rate
    
    Keep it concise—aim for 10-minute completion time.`;

    return await this.chat(prompt);
  }

  // ============================================
  // HR Policies
  // ============================================

  async createPolicy(params: {
    policyType: HRPolicy['category'];
    companySize: 'micro' | 'small' | 'medium';
    location: string;
  }): Promise<string> {
    const prompt = `Create an HR policy:
    
    Policy Type: ${params.policyType.replace('_', ' ')}
    Company Size: ${params.companySize}
    Primary Location: ${params.location}
    
    Include:
    1. Policy purpose and scope
    2. Definitions
    3. Policy statements
    4. Procedures
    5. Roles and responsibilities
    6. Exceptions process
    7. Related policies
    8. Compliance considerations
    9. Acknowledgment section
    
    Make it clear, fair, and legally sound. Note where legal review is recommended.
    
    DISCLAIMER: This is a template. Have an employment attorney review before implementation.`;

    return await this.chat(prompt);
  }

  async createEmployeeHandbook(params: {
    companyName: string;
    industry: string;
    employeeCount: number;
    locations: string[];
  }): Promise<string> {
    const prompt = `Create an employee handbook outline:
    
    Company: ${params.companyName}
    Industry: ${params.industry}
    Employees: ${params.employeeCount}
    Locations: ${params.locations.join(', ')}
    
    Provide a comprehensive outline including:
    
    1. **Welcome & Company Overview**
    2. **Employment Basics** (at-will, classifications, etc.)
    3. **Workplace Policies** (conduct, attendance, dress code)
    4. **Compensation & Benefits**
    5. **Time Off & Leave**
    6. **Performance & Development**
    7. **Health & Safety**
    8. **Technology & Data**
    9. **Anti-Harassment & Non-Discrimination**
    10. **Separation & Offboarding**
    11. **Acknowledgment Form**
    
    For each section, provide:
    - Key topics to cover
    - Legal considerations
    - Small business best practices
    
    Note: This is an outline. Full policies require legal review.`;

    return await this.chat(prompt);
  }

  // ============================================
  // Compensation
  // ============================================

  async analyzeCompensation(params: {
    role: string;
    currentSalary: number;
    location: string;
    experience: string;
    performance?: string;
  }): Promise<{
    analysis: string;
    marketRange: { min: number; max: number; median: number };
    recommendation: string;
    considerations: string[];
  }> {
    const prompt = `Analyze compensation for this role:
    
    Role: ${params.role}
    Current Salary: $${params.currentSalary.toLocaleString()}
    Location: ${params.location}
    Experience: ${params.experience}
    ${params.performance ? `Performance: ${params.performance}` : ''}
    
    Provide:
    1. Market salary range estimate (note: these are general estimates)
    2. Analysis of current salary vs. market
    3. Factors affecting compensation
    4. Recommendation with justification
    5. Non-salary compensation considerations
    6. Retention risk assessment
    
    Note: For accurate market data, recommend using salary surveys like Payscale, Glassdoor, or industry-specific benchmarks.`;

    const analysis = await this.chat(prompt);

    // These are placeholder ranges - in production, integrate with salary APIs
    const estimatedMedian = params.currentSalary * 1.05;
    
    return {
      analysis,
      marketRange: {
        min: Math.round(estimatedMedian * 0.85),
        max: Math.round(estimatedMedian * 1.15),
        median: Math.round(estimatedMedian),
      },
      recommendation: 'See detailed analysis',
      considerations: this.extractListItems(analysis, 'consider', 'factor'),
    };
  }

  // ============================================
  // Core Abstract Method Implementations
  // ============================================

  async analyzeData(data: {
    employees?: Employee[];
    period?: string;
  }): Promise<{
    headcount: number;
    turnoverRate: number;
    avgTenure: number;
    openPositions: number;
    engagementScore: number;
    criticalIssues: string[];
    recommendations: string[];
  }> {
    const employees = data.employees || this.hrData.employees;
    const openPositions = this.hrData.jobPostings.filter(j => j.status === 'open').length;
    const latestEngagement = this.hrData.engagementSurveys[this.hrData.engagementSurveys.length - 1];

    // Calculate metrics
    const activeEmployees = employees.filter(e => e.status === 'active');
    const headcount = activeEmployees.length;

    // Calculate average tenure
    const now = new Date();
    const totalTenure = activeEmployees.reduce((sum, e) => {
      const tenure = (now.getTime() - e.startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return sum + tenure;
    }, 0);
    const avgTenure = headcount > 0 ? totalTenure / headcount : 0;

    // Simplified turnover calculation
    const terminated = employees.filter(e => e.status === 'terminated').length;
    const turnoverRate = headcount > 0 ? (terminated / (headcount + terminated)) * 100 : 0;

    const criticalIssues: string[] = [];
    if (turnoverRate > 20) criticalIssues.push('High turnover rate needs attention');
    if (openPositions > headcount * 0.2) criticalIssues.push('High number of open positions');
    if (latestEngagement && latestEngagement.overallScore < 60) criticalIssues.push('Low engagement scores');

    return {
      headcount,
      turnoverRate,
      avgTenure,
      openPositions,
      engagementScore: latestEngagement?.overallScore || 0,
      criticalIssues,
      recommendations: await this.generateHRRecommendations(),
    };
  }

  async generateReport(
    reportType: string,
    params?: Record<string, unknown>
  ): Promise<string> {
    const context = {
      reportType,
      params,
      employeeCount: this.hrData.employees.length,
      openPositions: this.hrData.jobPostings.filter(j => j.status === 'open').length,
      pendingReviews: this.hrData.performanceReviews.filter(r => r.status !== 'completed').length,
    };

    const prompt = `Generate a ${reportType} HR report.
    
    Available data:
    - ${this.hrData.employees.length} employees
    - ${this.hrData.jobPostings.length} job postings
    - ${this.hrData.performanceReviews.length} performance reviews
    - ${this.hrData.trainingPrograms.length} training programs
    - ${this.hrData.engagementSurveys.length} engagement surveys
    
    Include:
    1. Executive Summary
    2. Workforce Overview
    3. Talent Acquisition Update
    4. Performance & Development
    5. Engagement & Culture
    6. Compensation & Benefits
    7. Compliance Status
    8. Key Initiatives
    9. Recommendations
    
    ${params ? `Additional context: ${JSON.stringify(params)}` : ''}`;

    return await this.chat(prompt, context);
  }

  async getInsights(): Promise<HRInsight[]> {
    const insights: HRInsight[] = [];

    // Check open positions
    const openPositions = this.hrData.jobPostings.filter(j => j.status === 'open');
    const oldPositions = openPositions.filter(j => {
      if (!j.postedDate) return false;
      const daysSincePosted = (Date.now() - j.postedDate.getTime()) / (24 * 60 * 60 * 1000);
      return daysSincePosted > 60;
    });

    if (oldPositions.length > 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'hiring',
        category: 'talent',
        title: `${oldPositions.length} Positions Open 60+ Days`,
        description: 'Long-open positions may indicate sourcing issues or misaligned requirements.',
        impact: 'high',
        actionRequired: true,
        suggestedActions: [
          'Review job requirements—are they realistic?',
          'Expand sourcing channels',
          'Consider adjusting compensation',
          'Evaluate hiring process efficiency',
        ],
        relatedExecutives: ['CFO'],
        createdAt: new Date(),
      });
    }

    // Check engagement
    const latestEngagement = this.hrData.engagementSurveys[this.hrData.engagementSurveys.length - 1];
    if (latestEngagement && latestEngagement.overallScore < 70) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'engagement',
        category: 'culture',
        title: 'Employee Engagement Below Target',
        description: `Engagement score of ${latestEngagement.overallScore}/100 indicates room for improvement.`,
        impact: 'high',
        actionRequired: true,
        suggestedActions: [
          'Review survey feedback for themes',
          'Hold skip-level meetings',
          'Address top concerns publicly',
          'Implement quick-win improvements',
        ],
        createdAt: new Date(),
      });
    }

    // Check overdue reviews
    const overdueReviews = this.hrData.employees.filter(e => {
      if (!e.nextReviewDate) return false;
      return e.nextReviewDate < new Date() && e.status === 'active';
    });

    if (overdueReviews.length > 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'development',
        category: 'workforce',
        title: `${overdueReviews.length} Overdue Performance Reviews`,
        description: 'Delayed reviews impact employee development and engagement.',
        impact: 'medium',
        actionRequired: true,
        suggestedActions: [
          'Schedule reviews immediately',
          'Provide manager review templates',
          'Set calendar reminders for future reviews',
        ],
        createdAt: new Date(),
      });
    }

    // Check for missing policies
    const policyCategories = ['time_off', 'conduct', 'remote_work', 'safety'];
    const existingCategories = new Set(this.hrData.policies.map(p => p.category));
    const missingPolicies = policyCategories.filter(c => !existingCategories.has(c as HRPolicy['category']));

    if (missingPolicies.length > 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'compliance',
        category: 'compliance',
        title: 'Key HR Policies Missing',
        description: `Missing policies: ${missingPolicies.join(', ')}. This creates compliance risk.`,
        impact: 'medium',
        actionRequired: true,
        suggestedActions: [
          'Prioritize essential policies',
          'Use templates as starting points',
          'Have legal review critical policies',
        ],
        createdAt: new Date(),
      });
    }

    // No data insight
    if (this.hrData.employees.length === 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'development',
        category: 'workforce',
        title: 'Set Up Your HR Foundation',
        description: 'Start by documenting your team and establishing core HR processes.',
        impact: 'medium',
        actionRequired: false,
        suggestedActions: [
          'Add current employees to the system',
          'Create essential HR policies',
          'Set up performance review cycle',
          'Plan engagement initiatives',
        ],
        createdAt: new Date(),
      });
    }

    this.hrData.insights = insights;
    return insights;
  }

  // ============================================
  // Collaboration Detection Override
  // ============================================

  protected async processResponseForCollaboration(response: string): Promise<void> {
    const collaborationPatterns = [
      { pattern: /budget|salary|compensation|cost|benefits/i, executive: 'CFO' as ExecutiveRole },
      { pattern: /employer brand|recruitment marketing|careers page/i, executive: 'CMO' as ExecutiveRole },
      { pattern: /staffing|capacity|workload|overtime|shift/i, executive: 'COO' as ExecutiveRole },
      { pattern: /technical hire|developer|engineer|IT training/i, executive: 'CTO' as ExecutiveRole },
    ];

    for (const { pattern, executive } of collaborationPatterns) {
      if (pattern.test(response)) {
        const actionIndicators = ['need', 'require', 'recommend', 'suggest', 'should', 'must', 'request'];
        if (actionIndicators.some(indicator => response.toLowerCase().includes(indicator))) {
          await this.sendMessage(
            executive,
            'HR Update',
            `The CHRO has a people matter requiring your input: ${response.substring(0, 300)}...`,
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

  private async generateHRRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    if (this.hrData.policies.length === 0) {
      recommendations.push('Create essential HR policies (time off, conduct, remote work)');
    }

    if (this.hrData.engagementSurveys.length === 0) {
      recommendations.push('Conduct initial employee engagement survey');
    }

    const openPositions = this.hrData.jobPostings.filter(j => j.status === 'open').length;
    if (openPositions > 3) {
      recommendations.push('Review hiring capacity and recruitment strategy');
    }

    return recommendations;
  }

  // ============================================
  // Data Management
  // ============================================

  addEmployee(employee: Employee): void {
    this.hrData.employees.push(employee);
  }

  addJobPosting(posting: JobPosting): void {
    this.hrData.jobPostings.push(posting);
  }

  addCandidate(candidate: Candidate): void {
    this.hrData.candidates.push(candidate);
  }

  addPerformanceReview(review: PerformanceReview): void {
    this.hrData.performanceReviews.push(review);
  }

  addPolicy(policy: HRPolicy): void {
    this.hrData.policies.push(policy);
  }

  addEngagementSurvey(survey: EmployeeEngagement): void {
    this.hrData.engagementSurveys.push(survey);
  }

  getHRData() {
    return { ...this.hrData };
  }
}

// Export singleton instance
export const chroExecutive = new CHROExecutive();
