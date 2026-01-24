'use client';

/**
 * Executive Chat Component
 * Professional dark theme with help dialogs and quick actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { ExecutiveRole, ChatMessage } from '@/types/executives';
import { useExecutive } from '@/hooks/useExecutive';
import Link from 'next/link';

interface ExecutiveChatProps {
  executive: ExecutiveRole;
}

// Executive configurations with capabilities
const EXECUTIVE_CONFIG: Record<ExecutiveRole, {
  name: string;
  title: string;
  color: string;
  gradient: string;
  description: string;
  capabilities: string[];
  quickActions: Array<{
    label: string;
    prompt: string;
    icon: string;
    deliverable?: string;
  }>;
  skills: Array<{
    name: string;
    href: string;
    description: string;
  }>;
  tips: string[];
}> = {
  CFO: {
    name: 'Alex',
    title: 'Chief Financial Officer',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Strategic financial guidance, forecasting, and budget optimization',
    capabilities: ['Financial analysis', 'Cash flow forecasting', 'Budget planning', 'Pricing strategy', 'Investment analysis'],
    quickActions: [
      { label: 'Create Budget Template', prompt: 'Create a detailed monthly budget template for my business with categories for revenue, fixed costs, variable costs, and profit margins. Format it as a table I can use.', icon: '📊', deliverable: 'Budget Template' },
      { label: 'Cash Flow Forecast', prompt: 'Help me create a 12-month cash flow forecast. Ask me about my current revenue, expenses, and growth expectations, then generate a detailed projection.', icon: '💰', deliverable: 'Cash Flow Model' },
      { label: 'Pricing Analysis', prompt: 'Analyze my pricing strategy. I\'ll share my costs and current prices, and I need recommendations for optimal pricing with margin calculations.', icon: '🏷️', deliverable: 'Pricing Report' },
      { label: 'Financial Health Check', prompt: 'Conduct a financial health assessment of my business. Ask me key questions about revenue, expenses, debt, and cash reserves, then provide a comprehensive analysis.', icon: '❤️', deliverable: 'Health Report' },
    ],
    skills: [
      { name: 'Financial Review', href: '/skills/cfo-financial-review', description: 'Upload financial statements for analysis' },
      { name: 'Budget Analysis', href: '/skills/cfo-budget-analysis', description: 'Deep dive into budget optimization' },
      { name: 'Pricing Strategy', href: '/skills/cfo-pricing-strategy', description: 'Data-driven pricing recommendations' },
    ],
    tips: [
      'Upload financial documents for detailed analysis',
      'Ask for specific deliverables like "create a budget template"',
      'Request forecasts with specific timeframes',
    ],
  },
  CMO: {
    name: 'Jordan',
    title: 'Chief Marketing Officer',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-500',
    description: 'Marketing strategy, brand development, and growth optimization',
    capabilities: ['Marketing strategy', 'Brand positioning', 'Campaign planning', 'Content strategy', 'Competitor analysis'],
    quickActions: [
      { label: 'Marketing Plan', prompt: 'Create a comprehensive 90-day marketing plan for my business. Ask me about my target audience, budget, and goals, then provide a detailed action plan with timelines.', icon: '📋', deliverable: 'Marketing Plan' },
      { label: 'Competitor Analysis', prompt: 'Conduct a competitor analysis. I\'ll tell you about my main competitors, and I need a detailed comparison with positioning recommendations.', icon: '🔍', deliverable: 'Competitor Report' },
      { label: 'Content Calendar', prompt: 'Create a monthly content calendar for my business. Ask about my audience and platforms, then generate a detailed posting schedule with content ideas.', icon: '📅', deliverable: 'Content Calendar' },
      { label: 'Brand Messaging', prompt: 'Help me develop brand messaging. Ask about my business, values, and target audience, then create a messaging framework with taglines and key messages.', icon: '💬', deliverable: 'Brand Guide' },
    ],
    skills: [
      { name: 'Marketing Audit', href: '/skills/cmo-marketing-audit', description: 'Comprehensive marketing assessment' },
      { name: 'Competitor Analysis', href: '/skills/cmo-competitor-analysis', description: 'In-depth competitive intelligence' },
      { name: 'Content Review', href: '/skills/cmo-content-review', description: 'Content strategy optimization' },
    ],
    tips: [
      'Share your target audience for personalized strategies',
      'Request specific deliverables like calendars or plans',
      'Ask for campaign ideas with budget estimates',
    ],
  },
  COO: {
    name: 'Morgan',
    title: 'Chief Operating Officer',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    description: 'Operational efficiency, process optimization, and scalability',
    capabilities: ['Process optimization', 'Workflow design', 'Capacity planning', 'Vendor management', 'Quality control'],
    quickActions: [
      { label: 'Process Map', prompt: 'Help me create a process map for a key business workflow. Ask me about the current steps, and create a detailed flowchart with optimization recommendations.', icon: '🗺️', deliverable: 'Process Map' },
      { label: 'SOP Template', prompt: 'Create a Standard Operating Procedure template for my business. Ask about the process I need documented, then generate a comprehensive SOP.', icon: '📝', deliverable: 'SOP Document' },
      { label: 'Efficiency Audit', prompt: 'Conduct an operational efficiency audit. Ask me about my current processes, team size, and bottlenecks, then provide specific improvement recommendations.', icon: '⚡', deliverable: 'Audit Report' },
      { label: 'Capacity Plan', prompt: 'Help me create a capacity planning model. Ask about my current resources and growth targets, then build a staffing and resource plan.', icon: '📈', deliverable: 'Capacity Model' },
    ],
    skills: [
      { name: 'Process Review', href: '/skills/coo-process-review', description: 'Analyze and optimize workflows' },
      { name: 'SOP Analysis', href: '/skills/coo-sop-analysis', description: 'Review standard procedures' },
      { name: 'Capacity Planning', href: '/skills/coo-capacity-planning', description: 'Resource and capacity modeling' },
    ],
    tips: [
      'Describe your current workflows for optimization',
      'Request SOPs and process documentation',
      'Ask for scalability recommendations',
    ],
  },
  CHRO: {
    name: 'Taylor',
    title: 'Chief Human Resources Officer',
    color: '#EC4899',
    gradient: 'from-pink-500 to-rose-500',
    description: 'People strategy, talent management, and organizational development',
    capabilities: ['Hiring strategy', 'Performance management', 'Compensation planning', 'Culture development', 'Training programs'],
    quickActions: [
      { label: 'Job Description', prompt: 'Help me write a compelling job description. Ask me about the role, responsibilities, and requirements, then create a professional posting that attracts top talent.', icon: '📄', deliverable: 'Job Description' },
      { label: 'Interview Guide', prompt: 'Create a structured interview guide for a role I\'m hiring for. Ask about the position and key competencies, then provide questions and evaluation criteria.', icon: '🎯', deliverable: 'Interview Guide' },
      { label: 'Onboarding Plan', prompt: 'Design a 90-day onboarding plan for new employees. Ask about the role and company culture, then create a detailed week-by-week plan.', icon: '🚀', deliverable: 'Onboarding Plan' },
      { label: 'Performance Review', prompt: 'Create a performance review template. Ask about our evaluation criteria and goals, then generate a comprehensive review framework.', icon: '⭐', deliverable: 'Review Template' },
    ],
    skills: [
      { name: 'Org Structure Review', href: '/skills/chro-org-structure', description: 'Organizational design analysis' },
      { name: 'Job Description Review', href: '/skills/chro-job-description', description: 'Optimize job postings' },
      { name: 'Compensation Analysis', href: '/skills/chro-compensation-analysis', description: 'Market-based comp recommendations' },
    ],
    tips: [
      'Request job descriptions and interview guides',
      'Ask for HR policy templates',
      'Get help with performance frameworks',
    ],
  },
  CTO: {
    name: 'Riley',
    title: 'Chief Technology Officer',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-500',
    description: 'Technology strategy, architecture decisions, and security guidance',
    capabilities: ['Tech stack evaluation', 'Architecture design', 'Security assessment', 'Build vs buy analysis', 'Technical roadmaps'],
    quickActions: [
      { label: 'Tech Stack Review', prompt: 'Review my technology stack and provide recommendations. Ask me about my current tools, team size, and goals, then give a comprehensive assessment.', icon: '🔧', deliverable: 'Tech Assessment' },
      { label: 'Security Checklist', prompt: 'Create a security checklist for my business. Ask about my tech setup and data handling, then provide a prioritized security action plan.', icon: '🔒', deliverable: 'Security Checklist' },
      { label: 'Technical Roadmap', prompt: 'Help me create a technical roadmap. Ask about my product vision and current state, then build a phased development plan.', icon: '🗺️', deliverable: 'Tech Roadmap' },
      { label: 'Build vs Buy Analysis', prompt: 'Help me decide whether to build or buy a solution. Describe the problem I\'m solving, and provide a detailed comparison with recommendations.', icon: '⚖️', deliverable: 'Analysis Report' },
    ],
    skills: [
      { name: 'Code Review', href: '/skills/cto-code-review', description: 'Upload code for security and quality review' },
      { name: 'Dependency Audit', href: '/skills/cto-dependency-audit', description: 'Scan for vulnerabilities' },
      { name: 'Architecture Review', href: '/skills/cto-architecture-review', description: 'Evaluate system design' },
    ],
    tips: [
      'Upload code files for detailed review',
      'Ask for architecture diagrams and recommendations',
      'Request security assessments and checklists',
    ],
  },
  CCO: {
    name: 'Casey',
    title: 'Chief Compliance Officer',
    color: '#6366F1',
    gradient: 'from-indigo-500 to-violet-500',
    description: 'Regulatory compliance, risk management, and policy development',
    capabilities: ['Compliance frameworks', 'Risk assessment', 'Policy development', 'Contract review', 'Audit preparation'],
    quickActions: [
      { label: 'Compliance Checklist', prompt: 'Create a compliance checklist for my business. Ask about my industry, location, and data handling, then provide a comprehensive regulatory requirements list.', icon: '✅', deliverable: 'Compliance Checklist' },
      { label: 'Privacy Policy', prompt: 'Help me draft a privacy policy. Ask about my data collection and processing practices, then create a compliant privacy policy document.', icon: '🔐', deliverable: 'Privacy Policy' },
      { label: 'Risk Assessment', prompt: 'Conduct a business risk assessment. Ask about my operations and industry, then create a risk matrix with mitigation strategies.', icon: '⚠️', deliverable: 'Risk Report' },
      { label: 'Terms of Service', prompt: 'Help me create Terms of Service. Ask about my business model and user interactions, then draft comprehensive terms.', icon: '📜', deliverable: 'ToS Document' },
    ],
    skills: [
      { name: 'Compliance Audit', href: '/skills/cco-compliance-audit', description: 'Regulatory compliance review' },
      { name: 'Contract Review', href: '/skills/cco-contract-review', description: 'Analyze contracts for risks' },
      { name: 'Risk Assessment', href: '/skills/cco-risk-assessment', description: 'Identify and evaluate risks' },
    ],
    tips: [
      'Specify your industry for relevant regulations',
      'Request policy templates and checklists',
      'Upload contracts for risk analysis',
    ],
  },
};

// Professional SVG icons
const ExecutiveIcons: Record<ExecutiveRole, React.ReactNode> = {
  CFO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CMO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  COO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  CHRO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  CTO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  CCO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

// Message bubble component
function MessageBubble({ message, executive }: { message: ChatMessage; executive: ExecutiveRole }) {
  const isUser = message.role === 'user';
  const config = EXECUTIVE_CONFIG[executive];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div 
          className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 bg-gradient-to-br ${config.gradient}`}
          style={{ boxShadow: `0 4px 12px ${config.color}30` }}
        >
          <div className="text-white">{ExecutiveIcons[executive]}</div>
        </div>
      )}
      
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-br-sm'
          : 'bg-[#1a1f2e] text-gray-100 rounded-bl-sm border border-white/5'
      }`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
            <span className="text-xs font-medium text-white">{config.name}</span>
            <span className="text-[10px] text-gray-500">{config.title}</span>
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        <div className={`text-[10px] mt-2 ${isUser ? 'text-emerald-100' : 'text-gray-500'}`}>
          {(typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-3 flex-shrink-0 bg-white/10 border border-white/10">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}

// Loading indicator
function LoadingIndicator({ executive }: { executive: ExecutiveRole }) {
  const config = EXECUTIVE_CONFIG[executive];
  return (
    <div className="flex justify-start mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 bg-gradient-to-br ${config.gradient}`}>
        <div className="text-white">{ExecutiveIcons[executive]}</div>
      </div>
      <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-4">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.15s]" />
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.3s]" />
        </div>
      </div>
    </div>
  );
}

interface AttachedFile {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  category: string;
}

export default function ExecutiveChat({ executive }: ExecutiveChatProps) {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, isLoading, sendMessage, clearHistory } = useExecutive({ executive });
  const config = EXECUTIVE_CONFIG[executive];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('executive', executive);
      try {
        const response = await fetch('/api/files/upload', { method: 'POST', body: formData });
        if (response.ok) {
          const data = await response.json();
          setAttachedFiles((prev) => [...prev, data.file]);
        }
      } catch (err) {
        console.error('File upload failed:', err);
      }
    }
    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput && attachedFiles.length === 0) return;

    let messageContent = trimmedInput;
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map((f) => f.originalName).join(', ');
      messageContent = `[Attached files: ${fileNames}]\n\n${trimmedInput}`;
    }

    setInput('');
    setAttachedFiles([]);
    await sendMessage(messageContent);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0f1a]">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${config.gradient}`}
            style={{ boxShadow: `0 4px 16px ${config.color}30` }}
          >
            {ExecutiveIcons[executive]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white text-lg">{config.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">{executive}</span>
            </div>
            <p className="text-sm text-gray-500">{config.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded-lg transition-colors ${showHelp ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            title="Help & Quick Actions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={clearHistory}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Clear chat
          </button>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="border-b border-white/5 bg-[#0a0f1a] px-6 py-4 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {/* Quick Actions */}
            <div className="flex-shrink-0">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Quick Actions</p>
              <div className="flex gap-2">
                {config.quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
                  >
                    <span>{action.icon}</span>
                    <div className="text-left">
                      <p className="text-xs text-white group-hover:text-emerald-400 transition-colors">{action.label}</p>
                      {action.deliverable && (
                        <p className="text-[9px] text-gray-500">Creates: {action.deliverable}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="flex-shrink-0 border-l border-white/5 pl-6">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Specialized Skills</p>
              <div className="flex gap-2">
                {config.skills.map((skill, i) => (
                  <Link
                    key={i}
                    href={skill.href}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
                  >
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-xs text-white group-hover:text-emerald-400 transition-colors">{skill.name}</p>
                      <p className="text-[9px] text-gray-500">{skill.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-white bg-gradient-to-br ${config.gradient}`}
              style={{ boxShadow: `0 8px 32px ${config.color}30` }}
            >
              <div className="scale-150">{ExecutiveIcons[executive]}</div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Chat with {config.name}</h3>
            <p className="text-gray-500 max-w-md mb-6">{config.description}</p>

            {/* Capabilities */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {config.capabilities.map((cap, i) => (
                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                  {cap}
                </span>
              ))}
            </div>

            {/* Quick Start Actions */}
            <div className="max-w-2xl w-full">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-3">Get Started</p>
              <div className="grid grid-cols-2 gap-2">
                {config.quickActions.slice(0, 4).map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all text-left group"
                  >
                    <span className="text-xl">{action.icon}</span>
                    <div>
                      <p className="text-sm text-white group-hover:text-emerald-400 transition-colors">{action.label}</p>
                      {action.deliverable && (
                        <p className="text-[10px] text-gray-500">Creates: {action.deliverable}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 max-w-md">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs font-medium text-amber-300 mb-1">Pro Tips</p>
                    <ul className="text-[11px] text-amber-200/70 space-y-0.5">
                      {config.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4">
              <p className="text-[10px] text-gray-600">
                AI-generated content for informational purposes only. <Link href="/ai-disclosure" className="text-gray-500 hover:text-white">Learn more</Link>
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[10px] text-gray-500">
                AI-generated content • Not professional advice • <Link href="/ai-disclosure" className="text-gray-400 hover:text-white">Disclaimer</Link>
              </p>
            </div>
            
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} executive={executive} />
            ))}
            {isLoading && <LoadingIndicator executive={executive} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-white/5 bg-[#0a0f1a]">
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="max-w-[150px] truncate">{file.originalName}</span>
                <button type="button" onClick={() => removeFile(file.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${config.name}...`}
              rows={1}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
            className={`p-2.5 rounded-xl transition-all ${
              isLoading || (!input.trim() && attachedFiles.length === 0)
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
