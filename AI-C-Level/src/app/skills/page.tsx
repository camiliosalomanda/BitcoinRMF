'use client';

/**
 * Executive Skills Page - Professional dark theme
 */

import React from 'react';
import Link from 'next/link';
import { ExecutiveRole } from '@/types/executives';

interface Skill {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
  href: string;
}

interface ExecutiveSkills {
  role: ExecutiveRole;
  name: string;
  title: string;
  color: string;
  gradient: string;
  skills: Skill[];
}

const ExecutiveIcons: Record<ExecutiveRole, React.ReactNode> = {
  CFO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CMO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  COO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  CHRO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  CTO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  CCO: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

const EXECUTIVE_SKILLS: ExecutiveSkills[] = [
  {
    role: 'CTO', name: 'Riley', title: 'Chief Technology Officer', color: '#3B82F6', gradient: 'from-blue-500 to-indigo-500',
    skills: [
      { id: 'code-review', name: 'Code Review', description: 'Analyze codebase for security vulnerabilities and technical debt', status: 'available', href: '/skills/cto-code-review' },
      { id: 'dependency-audit', name: 'Dependency Audit', description: 'Scan dependencies for vulnerabilities and outdated packages', status: 'available', href: '/skills/cto-dependency-audit' },
      { id: 'architecture-review', name: 'Architecture Review', description: 'Evaluate system architecture and scalability', status: 'available', href: '/skills/cto-architecture-review' },
    ],
  },
  {
    role: 'CFO', name: 'Alex', title: 'Chief Financial Officer', color: '#10B981', gradient: 'from-emerald-500 to-teal-500',
    skills: [
      { id: 'financial-review', name: 'Financial Review', description: 'Analyze P&L statements, balance sheets, and cash flow', status: 'available', href: '/skills/cfo-financial-review' },
      { id: 'budget-analysis', name: 'Budget Analysis', description: 'Review budgets and identify optimization opportunities', status: 'available', href: '/skills/cfo-budget-analysis' },
      { id: 'pricing-strategy', name: 'Pricing Strategy', description: 'Analyze pricing models and optimization recommendations', status: 'available', href: '/skills/cfo-pricing-strategy' },
    ],
  },
  {
    role: 'CMO', name: 'Jordan', title: 'Chief Marketing Officer', color: '#8B5CF6', gradient: 'from-violet-500 to-purple-500',
    skills: [
      { id: 'marketing-audit', name: 'Marketing Audit', description: 'Comprehensive review of marketing strategy and channels', status: 'available', href: '/skills/cmo-marketing-audit' },
      { id: 'competitor-analysis', name: 'Competitor Analysis', description: 'Analyze competitors and identify market opportunities', status: 'available', href: '/skills/cmo-competitor-analysis' },
      { id: 'content-review', name: 'Content Review', description: 'Evaluate content strategy and optimization', status: 'available', href: '/skills/cmo-content-review' },
    ],
  },
  {
    role: 'COO', name: 'Morgan', title: 'Chief Operating Officer', color: '#F59E0B', gradient: 'from-amber-500 to-orange-500',
    skills: [
      { id: 'process-review', name: 'Process Review', description: 'Analyze operational processes for efficiency', status: 'available', href: '/skills/coo-process-review' },
      { id: 'sop-analysis', name: 'SOP Analysis', description: 'Review standard operating procedures', status: 'available', href: '/skills/coo-sop-analysis' },
      { id: 'capacity-planning', name: 'Capacity Planning', description: 'Evaluate resource capacity and planning', status: 'available', href: '/skills/coo-capacity-planning' },
    ],
  },
  {
    role: 'CHRO', name: 'Taylor', title: 'Chief Human Resources Officer', color: '#EC4899', gradient: 'from-pink-500 to-rose-500',
    skills: [
      { id: 'org-structure', name: 'Org Structure Review', description: 'Analyze organizational structure and recommendations', status: 'available', href: '/skills/chro-org-structure' },
      { id: 'job-description', name: 'Job Description Review', description: 'Review and optimize job descriptions', status: 'available', href: '/skills/chro-job-description' },
      { id: 'compensation-analysis', name: 'Compensation Analysis', description: 'Analyze compensation and market benchmarks', status: 'available', href: '/skills/chro-compensation-analysis' },
    ],
  },
  {
    role: 'CCO', name: 'Casey', title: 'Chief Compliance Officer', color: '#6366F1', gradient: 'from-indigo-500 to-violet-500',
    skills: [
      { id: 'compliance-audit', name: 'Compliance Audit', description: 'Review policies for regulatory compliance', status: 'available', href: '/skills/cco-compliance-audit' },
      { id: 'contract-review', name: 'Contract Review', description: 'Analyze contracts for risks and obligations', status: 'available', href: '/skills/cco-contract-review' },
      { id: 'risk-assessment', name: 'Risk Assessment', description: 'Identify and evaluate business risks', status: 'available', href: '/skills/cco-risk-assessment' },
    ],
  },
];

export default function SkillsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <header className="bg-[#0a0f1a] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">Executive Skills</h1>
              <p className="text-sm text-gray-500">Specialized analysis and review capabilities</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {EXECUTIVE_SKILLS.map((exec) => (
            <div key={exec.role} className="bg-[#1a1f2e] rounded-xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5" style={{ background: `linear-gradient(135deg, ${exec.color}10, transparent)` }}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${exec.gradient}`} style={{ boxShadow: `0 4px 16px ${exec.color}30` }}>
                    {ExecutiveIcons[exec.role]}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{exec.name}</h2>
                    <p className="text-sm text-gray-500">{exec.title}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {exec.skills.map((skill) => (
                    <div key={skill.id}>
                      {skill.status === 'available' ? (
                        <Link href={skill.href} className="block p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/10 transition-all group">
                          <h3 className="font-medium text-white group-hover:text-emerald-400 transition-colors">{skill.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{skill.description}</p>
                          <div className="mt-3 flex items-center text-sm text-emerald-400">
                            <span>Launch</span>
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ) : (
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl opacity-60">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-400">{skill.name}</h3>
                            <span className="px-2 py-0.5 text-[10px] bg-white/5 text-gray-500 rounded-full border border-white/10">Coming Soon</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
