import { BaseExecutive, executiveRegistry } from '../shared/BaseExecutive';
import type {
  ExecutiveRole,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// CMO-Specific Types
// ============================================

export interface MarketingCampaign {
  id: string;
  companyId: string;
  name: string;
  objective: 'awareness' | 'engagement' | 'conversion' | 'retention';
  channels: MarketingChannel[];
  budget: number;
  spentAmount: number;
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: CampaignMetrics;
  createdAt: Date;
}

export interface MarketingChannel {
  name: string;
  type: 'social' | 'email' | 'content' | 'paid_ads' | 'seo' | 'events' | 'partnerships';
  budget: number;
  allocation: number; // percentage
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // click-through rate
  conversionRate: number;
  cpa: number; // cost per acquisition
  roas: number; // return on ad spend
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  size: number;
  characteristics: string[];
  preferredChannels: string[];
  avgLifetimeValue: number;
  acquisitionCost: number;
}

export interface ContentPiece {
  id: string;
  title: string;
  type: 'blog' | 'social_post' | 'email' | 'video' | 'infographic' | 'whitepaper' | 'case_study';
  status: 'idea' | 'draft' | 'review' | 'published';
  targetAudience: string;
  keywords: string[];
  publishDate?: Date;
  performance?: ContentPerformance;
}

export interface ContentPerformance {
  views: number;
  engagements: number;
  shares: number;
  leads: number;
  engagementRate: number;
}

export interface MarketingInsight {
  id: string;
  companyId: string;
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
  category: 'audience' | 'channel' | 'content' | 'competition' | 'budget';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  suggestedActions?: string[];
  relatedExecutives?: ExecutiveRole[];
  createdAt: Date;
}

export interface CompetitorAnalysis {
  id: string;
  competitorName: string;
  strengths: string[];
  weaknesses: string[];
  marketingChannels: string[];
  estimatedMarketShare: number;
  keyMessages: string[];
  lastUpdated: Date;
}

// ============================================
// CMO System Prompt
// ============================================

const CMO_SYSTEM_PROMPT = `You are the AI Chief Marketing Officer (CMO) for a small business. Your name is Jordan, and you serve as a strategic marketing leader and growth partner.

## Your Role & Responsibilities

1. **Marketing Strategy**: Develop and execute marketing strategies aligned with business goals
2. **Brand Management**: Build and protect brand identity, voice, and positioning
3. **Customer Acquisition**: Drive lead generation and customer acquisition across channels
4. **Content Strategy**: Guide content creation that resonates with target audiences
5. **Campaign Management**: Plan, execute, and optimize marketing campaigns
6. **Market Intelligence**: Monitor competitors, trends, and market opportunities

## Communication Style

- Be creative yet data-driven—balance inspiration with metrics
- Speak in terms of customer value and business impact
- Make complex marketing concepts accessible
- Always tie recommendations back to ROI and growth
- Be enthusiastic but realistic about expectations

## Key Behaviors

- Always consider the customer journey and touchpoints
- Think omnichannel—how do different channels work together?
- Balance brand-building (long-term) with performance marketing (short-term)
- Proactively suggest A/B tests and optimization opportunities
- Consider budget constraints and suggest scrappy alternatives when needed

## Collaboration Protocol

When you need input from other executives:
- CFO: Budget approvals, ROI discussions, customer acquisition cost targets
- COO: Fulfillment capacity for promotions, customer service alignment
- CHRO: Employer branding, internal communications, hiring for marketing team
- CTO: Marketing technology stack, website performance, data analytics

Format collaboration requests clearly:
[COLLABORATION REQUEST]
To: [EXECUTIVE ROLE]
Subject: [Brief subject]
Request: [What you need]
Deadline: [If applicable]
[END REQUEST]

When receiving budget requests or large spend proposals:
- Always flag items over $5,000 for CFO review
- Provide expected ROI/ROAS justification
- Suggest phased approaches for large initiatives

## Current Capabilities

You can help with:
- Marketing strategy development
- Campaign planning and optimization
- Content strategy and calendar planning
- Social media strategy
- Email marketing programs
- SEO/SEM guidance
- Brand positioning and messaging
- Customer segmentation and personas
- Competitive analysis
- Marketing budget allocation
- KPI setting and performance tracking
- Growth experiments and A/B testing

## Marketing Frameworks You Use

- AIDA (Attention, Interest, Desire, Action)
- Customer Journey Mapping
- Jobs-to-be-Done framework
- Value Proposition Canvas
- RACE (Reach, Act, Convert, Engage)
- Growth Loops and Flywheels

Remember: Great marketing is about understanding customers deeply and creating genuine value. You're not just driving metrics—you're building relationships between the brand and its customers.`;

// ============================================
// CMO Executive Class
// ============================================

export class CMOExecutive extends BaseExecutive {
  private marketingData: {
    campaigns: MarketingCampaign[];
    segments: CustomerSegment[];
    content: ContentPiece[];
    insights: MarketingInsight[];
    competitors: CompetitorAnalysis[];
  };

  constructor() {
    super({
      role: 'CMO',
      name: 'Jordan',
      description: 'AI Chief Marketing Officer - Driving growth through strategic marketing',
      capabilities: [
        'marketing_strategy',
        'campaign_management',
        'content_strategy',
        'brand_positioning',
        'customer_segmentation',
        'competitive_analysis',
        'performance_marketing',
        'social_media_strategy',
        'email_marketing',
        'seo_strategy',
      ],
      systemPrompt: CMO_SYSTEM_PROMPT,
    });

    this.marketingData = {
      campaigns: [],
      segments: [],
      content: [],
      insights: [],
      competitors: [],
    };

    // Register with the executive registry
    executiveRegistry.register(this);
  }

  // ============================================
  // Campaign Management
  // ============================================

  async createCampaign(params: {
    name: string;
    objective: MarketingCampaign['objective'];
    budget: number;
    channels: MarketingChannel[];
    startDate: Date;
    endDate?: Date;
  }): Promise<MarketingCampaign> {
    const campaign: MarketingCampaign = {
      id: uuidv4(),
      companyId: 'default',
      name: params.name,
      objective: params.objective,
      channels: params.channels,
      budget: params.budget,
      spentAmount: 0,
      startDate: params.startDate,
      endDate: params.endDate,
      status: 'draft',
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        conversionRate: 0,
        cpa: 0,
        roas: 0,
      },
      createdAt: new Date(),
    };

    // If budget exceeds threshold, flag for CFO review
    if (params.budget > 5000) {
      await this.requestApproval(
        'CFO',
        `Budget Approval: ${params.name}`,
        `Marketing campaign "${params.name}" requires budget of $${params.budget.toLocaleString()}. Objective: ${params.objective}. Channels: ${params.channels.map(c => c.name).join(', ')}.`,
        params.startDate
      );
    }

    this.marketingData.campaigns.push(campaign);
    return campaign;
  }

  async analyzeCampaignPerformance(campaignId: string): Promise<{
    campaign: MarketingCampaign | null;
    analysis: string;
    recommendations: string[];
  }> {
    const campaign = this.marketingData.campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return {
        campaign: null,
        analysis: 'Campaign not found',
        recommendations: [],
      };
    }

    const context = {
      campaign,
      benchmarks: {
        avgCTR: 2.5,
        avgConversionRate: 3.0,
        avgCPA: 50,
      },
    };

    const prompt = `Analyze this marketing campaign performance:
    
    Campaign: ${campaign.name}
    Objective: ${campaign.objective}
    Budget: $${campaign.budget} (Spent: $${campaign.spentAmount})
    
    Metrics:
    - Impressions: ${campaign.metrics.impressions.toLocaleString()}
    - Clicks: ${campaign.metrics.clicks.toLocaleString()}
    - CTR: ${campaign.metrics.ctr}%
    - Conversions: ${campaign.metrics.conversions}
    - Conversion Rate: ${campaign.metrics.conversionRate}%
    - CPA: $${campaign.metrics.cpa}
    - ROAS: ${campaign.metrics.roas}x
    
    Provide analysis and specific optimization recommendations.`;

    const analysis = await this.chat(prompt, context);

    return {
      campaign,
      analysis,
      recommendations: this.extractRecommendations(analysis),
    };
  }

  // ============================================
  // Content Strategy
  // ============================================

  async generateContentIdeas(params: {
    targetAudience: string;
    goals: string[];
    contentTypes?: ContentPiece['type'][];
    count?: number;
  }): Promise<string> {
    const prompt = `Generate ${params.count || 5} content ideas for:
    
    Target Audience: ${params.targetAudience}
    Goals: ${params.goals.join(', ')}
    ${params.contentTypes ? `Preferred Content Types: ${params.contentTypes.join(', ')}` : ''}
    
    For each idea, provide:
    1. Title/Topic
    2. Content Type
    3. Key Message
    4. Target Keywords
    5. Expected Outcome
    
    Focus on ideas that are actionable for a small business with limited resources.`;

    return await this.chat(prompt);
  }

  async createContentCalendar(params: {
    duration: 'week' | 'month' | 'quarter';
    channels: string[];
    themes?: string[];
  }): Promise<string> {
    const prompt = `Create a ${params.duration}ly content calendar for:
    
    Channels: ${params.channels.join(', ')}
    ${params.themes ? `Themes to incorporate: ${params.themes.join(', ')}` : ''}
    
    Include:
    - Posting schedule for each channel
    - Content themes by week
    - Key dates or events to leverage
    - Content mix (educational, promotional, engagement)
    - Repurposing opportunities across channels
    
    Make it realistic for a small team to execute.`;

    return await this.chat(prompt);
  }

  // ============================================
  // Customer Segmentation
  // ============================================

  async createCustomerPersona(params: {
    segmentName: string;
    demographics: string;
    behaviors: string[];
    painPoints: string[];
    goals: string[];
  }): Promise<CustomerSegment> {
    const prompt = `Create a detailed customer persona based on:
    
    Segment: ${params.segmentName}
    Demographics: ${params.demographics}
    Behaviors: ${params.behaviors.join(', ')}
    Pain Points: ${params.painPoints.join(', ')}
    Goals: ${params.goals.join(', ')}
    
    Provide:
    1. Persona name and brief bio
    2. Preferred marketing channels
    3. Content that resonates with them
    4. Buying triggers and objections
    5. Recommended messaging approach`;

    const personaDescription = await this.chat(prompt);

    const segment: CustomerSegment = {
      id: uuidv4(),
      name: params.segmentName,
      description: personaDescription,
      size: 0, // To be updated with actual data
      characteristics: [...params.behaviors, ...params.painPoints],
      preferredChannels: [], // Extracted from AI response
      avgLifetimeValue: 0,
      acquisitionCost: 0,
    };

    this.marketingData.segments.push(segment);
    return segment;
  }

  // ============================================
  // Competitive Analysis
  // ============================================

  async analyzeCompetitor(params: {
    competitorName: string;
    website?: string;
    knownStrengths?: string[];
    knownWeaknesses?: string[];
  }): Promise<CompetitorAnalysis> {
    const prompt = `Provide a competitive analysis framework for analyzing:
    
    Competitor: ${params.competitorName}
    ${params.website ? `Website: ${params.website}` : ''}
    ${params.knownStrengths ? `Known Strengths: ${params.knownStrengths.join(', ')}` : ''}
    ${params.knownWeaknesses ? `Known Weaknesses: ${params.knownWeaknesses.join(', ')}` : ''}
    
    Analyze:
    1. Market positioning
    2. Key marketing channels they use
    3. Messaging and value proposition
    4. Content strategy patterns
    5. Potential gaps we can exploit
    6. Threats to be aware of
    
    Provide actionable insights for differentiation.`;

    const analysisResponse = await this.chat(prompt);

    const analysis: CompetitorAnalysis = {
      id: uuidv4(),
      competitorName: params.competitorName,
      strengths: params.knownStrengths || [],
      weaknesses: params.knownWeaknesses || [],
      marketingChannels: [],
      estimatedMarketShare: 0,
      keyMessages: [],
      lastUpdated: new Date(),
    };

    this.marketingData.competitors.push(analysis);
    return analysis;
  }

  // ============================================
  // Core Abstract Method Implementations
  // ============================================

  async analyzeData(data: {
    campaigns?: MarketingCampaign[];
    period?: string;
  }): Promise<{
    totalSpend: number;
    totalConversions: number;
    avgCPA: number;
    avgROAS: number;
    topPerformingChannel: string;
    recommendations: string[];
  }> {
    const campaigns = data.campaigns || this.marketingData.campaigns;
    
    if (campaigns.length === 0) {
      return {
        totalSpend: 0,
        totalConversions: 0,
        avgCPA: 0,
        avgROAS: 0,
        topPerformingChannel: 'N/A',
        recommendations: ['Start by creating your first marketing campaign'],
      };
    }

    const totalSpend = campaigns.reduce((sum, c) => sum + c.spentAmount, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);
    const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const avgROAS = campaigns.reduce((sum, c) => sum + c.metrics.roas, 0) / campaigns.length;

    // Find top performing channel
    const channelPerformance = new Map<string, number>();
    campaigns.forEach(c => {
      c.channels.forEach(ch => {
        const current = channelPerformance.get(ch.name) || 0;
        channelPerformance.set(ch.name, current + c.metrics.conversions * (ch.allocation / 100));
      });
    });

    let topChannel = 'N/A';
    let topConversions = 0;
    channelPerformance.forEach((conversions, channel) => {
      if (conversions > topConversions) {
        topConversions = conversions;
        topChannel = channel;
      }
    });

    return {
      totalSpend,
      totalConversions,
      avgCPA,
      avgROAS,
      topPerformingChannel: topChannel,
      recommendations: await this.generateRecommendations(campaigns),
    };
  }

  async generateReport(
    reportType: string,
    params?: Record<string, unknown>
  ): Promise<string> {
    const context = {
      reportType,
      params,
      campaigns: this.marketingData.campaigns,
      segments: this.marketingData.segments,
      competitors: this.marketingData.competitors,
    };

    const prompt = `Generate a ${reportType} marketing report.
    
    Available data:
    - ${this.marketingData.campaigns.length} campaigns
    - ${this.marketingData.segments.length} customer segments
    - ${this.marketingData.competitors.length} competitor analyses
    
    Include:
    1. Executive Summary
    2. Key Performance Metrics
    3. Channel Performance
    4. Audience Insights
    5. Competitive Landscape
    6. Recommendations
    7. Next Steps
    
    ${params ? `Additional context: ${JSON.stringify(params)}` : ''}`;

    return await this.chat(prompt, context);
  }

  async getInsights(): Promise<MarketingInsight[]> {
    const insights: MarketingInsight[] = [];
    const campaigns = this.marketingData.campaigns;

    // No campaigns insight
    if (campaigns.length === 0) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'recommendation',
        category: 'channel',
        title: 'No Active Marketing Campaigns',
        description: 'Start building your marketing presence with a focused campaign.',
        impact: 'high',
        actionRequired: true,
        suggestedActions: [
          'Define your target audience',
          'Choose 1-2 primary marketing channels',
          'Set a modest test budget',
          'Create your first campaign',
        ],
        createdAt: new Date(),
      });
      return insights;
    }

    // Analyze active campaigns
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    
    // High CPA warning
    activeCampaigns.forEach(campaign => {
      if (campaign.metrics.cpa > 100 && campaign.metrics.conversions > 10) {
        insights.push({
          id: uuidv4(),
          companyId: campaign.companyId,
          type: 'warning',
          category: 'budget',
          title: `High CPA on "${campaign.name}"`,
          description: `Cost per acquisition of $${campaign.metrics.cpa.toFixed(2)} is above healthy thresholds.`,
          impact: 'high',
          actionRequired: true,
          suggestedActions: [
            'Review targeting parameters',
            'Test new ad creatives',
            'Optimize landing page conversion',
            'Consider pausing underperforming channels',
          ],
          relatedExecutives: ['CFO'],
          createdAt: new Date(),
        });
      }

      // Low engagement warning
      if (campaign.metrics.ctr < 1 && campaign.metrics.impressions > 1000) {
        insights.push({
          id: uuidv4(),
          companyId: campaign.companyId,
          type: 'warning',
          category: 'content',
          title: `Low Engagement on "${campaign.name}"`,
          description: `CTR of ${campaign.metrics.ctr.toFixed(2)}% indicates messaging may not resonate.`,
          impact: 'medium',
          actionRequired: true,
          suggestedActions: [
            'A/B test headlines and copy',
            'Review audience targeting',
            'Update creative assets',
            'Test different value propositions',
          ],
          createdAt: new Date(),
        });
      }

      // Strong ROAS opportunity
      if (campaign.metrics.roas > 4) {
        insights.push({
          id: uuidv4(),
          companyId: campaign.companyId,
          type: 'opportunity',
          category: 'budget',
          title: `Scale Opportunity: "${campaign.name}"`,
          description: `ROAS of ${campaign.metrics.roas.toFixed(1)}x suggests room to increase spend.`,
          impact: 'high',
          actionRequired: false,
          suggestedActions: [
            'Request budget increase from CFO',
            'Expand to similar audiences',
            'Test new channels with proven messaging',
          ],
          relatedExecutives: ['CFO'],
          createdAt: new Date(),
        });
      }
    });

    // Budget utilization check
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spentAmount, 0);
    const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    if (utilizationRate < 50) {
      insights.push({
        id: uuidv4(),
        companyId: 'default',
        type: 'warning',
        category: 'budget',
        title: 'Marketing Budget Underutilized',
        description: `Only ${utilizationRate.toFixed(0)}% of allocated budget has been spent.`,
        impact: 'medium',
        actionRequired: true,
        suggestedActions: [
          'Review campaign pacing',
          'Identify new opportunities',
          'Reallocate to top performers',
        ],
        relatedExecutives: ['CFO'],
        createdAt: new Date(),
      });
    }

    this.marketingData.insights = insights;
    return insights;
  }

  // ============================================
  // Collaboration Detection Override
  // ============================================

  protected async processResponseForCollaboration(response: string): Promise<void> {
    const collaborationPatterns = [
      { pattern: /budget|spend|cost|roi|roas|investment/i, executive: 'CFO' as ExecutiveRole },
      { pattern: /fulfillment|inventory|capacity|shipping/i, executive: 'COO' as ExecutiveRole },
      { pattern: /hiring|team|employer brand|internal/i, executive: 'CHRO' as ExecutiveRole },
      { pattern: /website|tech|analytics|tracking|pixel/i, executive: 'CTO' as ExecutiveRole },
    ];

    for (const { pattern, executive } of collaborationPatterns) {
      if (pattern.test(response) && response.toLowerCase().includes('recommend') || response.toLowerCase().includes('suggest')) {
        // Only send if it seems like an action item
        const actionIndicators = ['should', 'need to', 'recommend', 'suggest', 'consider', 'important'];
        if (actionIndicators.some(indicator => response.toLowerCase().includes(indicator))) {
          await this.sendMessage(
            executive,
            'Marketing Input Required',
            `The CMO has a recommendation requiring your input: ${response.substring(0, 300)}...`,
            'normal'
          );
          break; // Only send to the most relevant executive
        }
      }
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private extractRecommendations(analysis: string): string[] {
    // Simple extraction - in production, use structured output
    const recommendations: string[] = [];
    const lines = analysis.split('\n');
    
    let inRecommendations = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggestion')) {
        inRecommendations = true;
      }
      if (inRecommendations && line.trim().startsWith('-')) {
        recommendations.push(line.trim().substring(1).trim());
      }
    }
    
    return recommendations.slice(0, 5); // Return top 5
  }

  private async generateRecommendations(campaigns: MarketingCampaign[]): Promise<string[]> {
    if (campaigns.length === 0) {
      return ['Create your first marketing campaign to start gathering insights'];
    }

    const recommendations: string[] = [];
    
    // Budget allocation recommendation
    const highROASCampaigns = campaigns.filter(c => c.metrics.roas > 3);
    if (highROASCampaigns.length > 0) {
      recommendations.push(`Consider increasing budget for ${highROASCampaigns[0].name} - strong ROAS of ${highROASCampaigns[0].metrics.roas.toFixed(1)}x`);
    }

    // Channel diversification
    const allChannels = new Set<string>();
    campaigns.forEach(c => c.channels.forEach(ch => allChannels.add(ch.type)));
    if (allChannels.size < 3) {
      recommendations.push('Diversify marketing channels to reduce risk and find new audiences');
    }

    // Conversion optimization
    const lowConversion = campaigns.filter(c => c.metrics.conversionRate < 2 && c.metrics.clicks > 100);
    if (lowConversion.length > 0) {
      recommendations.push('Focus on conversion rate optimization for landing pages');
    }

    return recommendations;
  }

  // ============================================
  // Data Management
  // ============================================

  addCampaign(campaign: MarketingCampaign): void {
    this.marketingData.campaigns.push(campaign);
  }

  updateCampaignMetrics(campaignId: string, metrics: Partial<CampaignMetrics>): void {
    const campaign = this.marketingData.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.metrics = { ...campaign.metrics, ...metrics };
    }
  }

  addCustomerSegment(segment: CustomerSegment): void {
    this.marketingData.segments.push(segment);
  }

  getMarketingData() {
    return { ...this.marketingData };
  }
}

// Export singleton instance
export const cmoExecutive = new CMOExecutive();
