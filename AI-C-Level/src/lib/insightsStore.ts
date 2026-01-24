import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExecutiveRole } from '@/types/executives';
import { v4 as uuidv4 } from 'uuid';

export interface Insight {
  id: string;
  executive: ExecutiveRole;
  type: 'opportunity' | 'risk' | 'recommendation' | 'alert' | 'trend';
  category: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  suggestedActions: string[];
  relatedExecutives: ExecutiveRole[];
  createdAt: Date;
  status: 'new' | 'viewed' | 'actioned' | 'dismissed';
  sourceConversation?: string;
}

interface InsightsState {
  insights: Insight[];
  addInsight: (insight: Omit<Insight, 'id' | 'createdAt' | 'status'>) => void;
  updateStatus: (id: string, status: Insight['status']) => void;
  dismissInsight: (id: string) => void;
  clearInsights: () => void;
}

export const useInsightsStore = create<InsightsState>()(
  persist(
    (set) => ({
      insights: [],

      addInsight: (insightData) => {
        const insight: Insight = {
          ...insightData,
          id: uuidv4(),
          createdAt: new Date(),
          status: 'new',
        };
        set((state) => ({
          insights: [insight, ...state.insights].slice(0, 50), // Keep max 50
        }));
      },

      updateStatus: (id, status) => {
        set((state) => ({
          insights: state.insights.map((i) =>
            i.id === id ? { ...i, status } : i
          ),
        }));
      },

      dismissInsight: (id) => {
        set((state) => ({
          insights: state.insights.map((i) =>
            i.id === id ? { ...i, status: 'dismissed' as const } : i
          ),
        }));
      },

      clearInsights: () => set({ insights: [] }),
    }),
    {
      name: 'bizai-insights',
      partialize: (state) => ({
        insights: state.insights.map((i) => ({
          ...i,
          createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
        })),
      }),
    }
  )
);

// Insight detection from executive responses
export function detectInsights(
  executive: ExecutiveRole,
  content: string,
  userMessage: string
): Omit<Insight, 'id' | 'createdAt' | 'status'>[] {
  const insights: Omit<Insight, 'id' | 'createdAt' | 'status'>[] = [];
  const contentLower = content.toLowerCase();

  // CFO insights
  if (executive === 'CFO') {
    if (contentLower.includes('cash flow') && (contentLower.includes('concern') || contentLower.includes('issue') || contentLower.includes('low'))) {
      insights.push({
        executive: 'CFO',
        type: 'alert',
        category: 'Cash Flow',
        title: 'Cash Flow Concern Identified',
        description: 'Financial analysis indicates potential cash flow issues that require attention.',
        impact: 'high',
        urgency: 'high',
        actionRequired: true,
        suggestedActions: ['Review accounts receivable', 'Accelerate collections', 'Review payment terms'],
        relatedExecutives: ['COO'],
      });
    }
    if (contentLower.includes('cost') && (contentLower.includes('reduce') || contentLower.includes('cut') || contentLower.includes('saving'))) {
      insights.push({
        executive: 'CFO',
        type: 'recommendation',
        category: 'Cost Management',
        title: 'Cost Reduction Opportunity',
        description: 'Analysis suggests opportunities to reduce operational costs.',
        impact: 'medium',
        urgency: 'medium',
        actionRequired: false,
        suggestedActions: ['Review expense categories', 'Identify redundancies', 'Negotiate vendor contracts'],
        relatedExecutives: ['COO'],
      });
    }
    if (contentLower.includes('revenue') && (contentLower.includes('growth') || contentLower.includes('increas'))) {
      insights.push({
        executive: 'CFO',
        type: 'trend',
        category: 'Revenue',
        title: 'Revenue Growth Trend',
        description: 'Positive revenue growth trajectory identified in financial analysis.',
        impact: 'high',
        urgency: 'low',
        actionRequired: false,
        suggestedActions: ['Analyze growth drivers', 'Reinvest in top channels', 'Update projections'],
        relatedExecutives: ['CMO'],
      });
    }
  }

  // CMO insights
  if (executive === 'CMO') {
    if (contentLower.includes('competitor') && (contentLower.includes('threat') || contentLower.includes('gaining') || contentLower.includes('market share'))) {
      insights.push({
        executive: 'CMO',
        type: 'risk',
        category: 'Competition',
        title: 'Competitive Threat Identified',
        description: 'Market analysis indicates increased competitive pressure.',
        impact: 'high',
        urgency: 'high',
        actionRequired: true,
        suggestedActions: ['Conduct competitive analysis', 'Review differentiation strategy', 'Accelerate key initiatives'],
        relatedExecutives: ['CFO'],
      });
    }
    if (contentLower.includes('campaign') && (contentLower.includes('success') || contentLower.includes('performing'))) {
      insights.push({
        executive: 'CMO',
        type: 'opportunity',
        category: 'Marketing',
        title: 'High-Performing Campaign',
        description: 'Marketing campaign showing strong performance metrics.',
        impact: 'medium',
        urgency: 'medium',
        actionRequired: false,
        suggestedActions: ['Scale successful tactics', 'Increase budget allocation', 'Document learnings'],
        relatedExecutives: ['CFO'],
      });
    }
  }

  // COO insights
  if (executive === 'COO') {
    if (contentLower.includes('bottleneck') || contentLower.includes('inefficien')) {
      insights.push({
        executive: 'COO',
        type: 'recommendation',
        category: 'Operations',
        title: 'Process Bottleneck Identified',
        description: 'Operational analysis reveals process inefficiencies to address.',
        impact: 'medium',
        urgency: 'medium',
        actionRequired: true,
        suggestedActions: ['Map current process', 'Identify root cause', 'Implement improvements'],
        relatedExecutives: ['CTO'],
      });
    }
    if (contentLower.includes('capacity') && (contentLower.includes('limit') || contentLower.includes('max'))) {
      insights.push({
        executive: 'COO',
        type: 'alert',
        category: 'Capacity',
        title: 'Capacity Constraints',
        description: 'Operations approaching capacity limits.',
        impact: 'high',
        urgency: 'high',
        actionRequired: true,
        suggestedActions: ['Evaluate scaling options', 'Prioritize high-value work', 'Consider automation'],
        relatedExecutives: ['CFO', 'CHRO'],
      });
    }
  }

  // CTO insights
  if (executive === 'CTO') {
    if (contentLower.includes('security') && (contentLower.includes('vulnerab') || contentLower.includes('risk') || contentLower.includes('threat'))) {
      insights.push({
        executive: 'CTO',
        type: 'alert',
        category: 'Security',
        title: 'Security Vulnerability Identified',
        description: 'Technical review indicates security concerns requiring immediate attention.',
        impact: 'high',
        urgency: 'critical',
        actionRequired: true,
        suggestedActions: ['Conduct security audit', 'Patch vulnerabilities', 'Review access controls'],
        relatedExecutives: ['CCO'],
      });
    }
    if (contentLower.includes('technical debt') || contentLower.includes('legacy')) {
      insights.push({
        executive: 'CTO',
        type: 'risk',
        category: 'Technology',
        title: 'Technical Debt Concern',
        description: 'Technical assessment identifies accumulated technical debt.',
        impact: 'medium',
        urgency: 'medium',
        actionRequired: false,
        suggestedActions: ['Prioritize refactoring', 'Allocate sprint capacity', 'Document debt items'],
        relatedExecutives: ['CFO'],
      });
    }
  }

  // CHRO insights
  if (executive === 'CHRO') {
    if (contentLower.includes('turnover') || contentLower.includes('retention') || contentLower.includes('leaving')) {
      insights.push({
        executive: 'CHRO',
        type: 'risk',
        category: 'Talent',
        title: 'Employee Retention Risk',
        description: 'Analysis indicates potential employee retention concerns.',
        impact: 'high',
        urgency: 'high',
        actionRequired: true,
        suggestedActions: ['Conduct stay interviews', 'Review compensation', 'Address engagement issues'],
        relatedExecutives: ['CFO'],
      });
    }
    if (contentLower.includes('hiring') && (contentLower.includes('difficult') || contentLower.includes('challenge'))) {
      insights.push({
        executive: 'CHRO',
        type: 'alert',
        category: 'Recruitment',
        title: 'Hiring Challenges',
        description: 'Recruitment facing difficulties in current market.',
        impact: 'medium',
        urgency: 'medium',
        actionRequired: true,
        suggestedActions: ['Expand sourcing channels', 'Review job requirements', 'Improve employer brand'],
        relatedExecutives: ['CMO'],
      });
    }
  }

  // CCO insights
  if (executive === 'CCO') {
    if (contentLower.includes('compliance') && (contentLower.includes('gap') || contentLower.includes('issue') || contentLower.includes('violation'))) {
      insights.push({
        executive: 'CCO',
        type: 'alert',
        category: 'Compliance',
        title: 'Compliance Gap Identified',
        description: 'Review identifies potential compliance issues requiring remediation.',
        impact: 'high',
        urgency: 'critical',
        actionRequired: true,
        suggestedActions: ['Document gaps', 'Create remediation plan', 'Implement controls'],
        relatedExecutives: ['CTO'],
      });
    }
    if (contentLower.includes('risk') && (contentLower.includes('mitigat') || contentLower.includes('manag'))) {
      insights.push({
        executive: 'CCO',
        type: 'recommendation',
        category: 'Risk Management',
        title: 'Risk Mitigation Opportunity',
        description: 'Analysis identifies opportunities to improve risk management.',
        impact: 'medium',
        urgency: 'medium',
        actionRequired: false,
        suggestedActions: ['Update risk register', 'Implement controls', 'Monitor metrics'],
        relatedExecutives: ['CFO'],
      });
    }
  }

  return insights;
}

// Hook for easy insight generation
export function useInsightGeneration() {
  const { addInsight } = useInsightsStore();

  const generateInsights = (executive: ExecutiveRole, content: string, userMessage: string) => {
    const detected = detectInsights(executive, content, userMessage);
    detected.forEach((insight) => {
      // Add with slight delay to feel natural
      setTimeout(() => {
        addInsight(insight);
      }, 500 + Math.random() * 1500);
    });
  };

  return { generateInsights };
}
