'use client';

/**
 * Onboarding Page
 * Multi-step wizard to capture company context
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

// Step definitions
const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'basics', title: 'Company Basics' },
  { id: 'size', title: 'Size & Stage' },
  { id: 'goals', title: 'Goals' },
  { id: 'complete', title: 'Complete' },
];

// Industry options
const INDUSTRIES = [
  'Technology / Software',
  'E-commerce / Retail',
  'Professional Services',
  'Healthcare',
  'Finance / Fintech',
  'Manufacturing',
  'Food & Beverage',
  'Real Estate',
  'Education',
  'Media / Entertainment',
  'Travel / Hospitality',
  'Non-profit',
  'Other',
];

// Employee count options
const EMPLOYEE_COUNTS = [
  { value: '1', label: 'Just me' },
  { value: '2-5', label: '2-5 employees' },
  { value: '6-10', label: '6-10 employees' },
  { value: '11-25', label: '11-25 employees' },
  { value: '26-50', label: '26-50 employees' },
  { value: '51-100', label: '51-100 employees' },
  { value: '100+', label: '100+ employees' },
];

// Revenue ranges
const REVENUE_RANGES = [
  { value: 'pre-revenue', label: 'Pre-revenue' },
  { value: '0-100k', label: '$0 - $100K' },
  { value: '100k-500k', label: '$100K - $500K' },
  { value: '500k-1m', label: '$500K - $1M' },
  { value: '1m-5m', label: '$1M - $5M' },
  { value: '5m-10m', label: '$5M - $10M' },
  { value: '10m+', label: '$10M+' },
];

// Business goals
const BUSINESS_GOALS = [
  { id: 'increase_revenue', label: 'Increase revenue', icon: '📈' },
  { id: 'reduce_costs', label: 'Reduce costs', icon: '💰' },
  { id: 'hire_team', label: 'Hire key roles', icon: '👥' },
  { id: 'launch_product', label: 'Launch new product/service', icon: '🚀' },
  { id: 'improve_operations', label: 'Improve operations', icon: '⚙️' },
  { id: 'expand_market', label: 'Expand to new markets', icon: '🌍' },
  { id: 'raise_funding', label: 'Raise funding', icon: '💵' },
  { id: 'improve_marketing', label: 'Improve marketing', icon: '📣' },
  { id: 'technology_upgrade', label: 'Upgrade technology', icon: '💻' },
  { id: 'build_culture', label: 'Build company culture', icon: '❤️' },
];

// Challenges
const COMMON_CHALLENGES = [
  'Cash flow management',
  'Finding and hiring talent',
  'Marketing and customer acquisition',
  'Scaling operations',
  'Managing growth',
  'Competition',
  'Technology decisions',
  'Time management',
  'Pricing strategy',
  'Customer retention',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setCompanyContext, setOnboarded } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    businessModel: 'b2b' as 'b2b' | 'b2c' | 'both',
    location: '',
    employeeCount: '',
    revenueRange: '',
    stage: 'early' as 'pre_revenue' | 'early' | 'growth' | 'mature',
    goals: [] as string[],
    challenges: [] as string[],
    customChallenge: '',
  });

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : prev.goals.length < 3
        ? [...prev.goals, goalId]
        : prev.goals,
    }));
  };

  const toggleChallenge = (challenge: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter((c) => c !== challenge)
        : [...prev.challenges, challenge],
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    setOnboarded(true);
    router.push('/dashboard');
  };

  const completeOnboarding = () => {
    // Map employee count to size
    const sizeMap: Record<string, 'micro' | 'small' | 'medium'> = {
      '1': 'micro',
      '2-5': 'micro',
      '6-10': 'micro',
      '11-25': 'small',
      '26-50': 'small',
      '51-100': 'medium',
      '100+': 'medium',
    };

    // Build the company context
    const companyContext = {
      id: uuidv4(),
      name: formData.name || 'My Company',
      industry: formData.industry || 'Other',
      size: sizeMap[formData.employeeCount] || 'small',
      currency: 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      fiscalYearEnd: 'December',
      goals: formData.goals.map(
        (g) => BUSINESS_GOALS.find((bg) => bg.id === g)?.label || g
      ),
      challenges: [
        ...formData.challenges,
        ...(formData.customChallenge ? [formData.customChallenge] : []),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCompanyContext(companyContext);
    setOnboarded(true);
    router.push('/dashboard');
  };

  // Determine which executive to recommend based on goals
  const getRecommendedExecutive = () => {
    const goals = formData.goals;
    if (goals.includes('increase_revenue') || goals.includes('reduce_costs')) {
      return { role: 'CFO', name: 'Alex', icon: '💰', reason: 'to review your financial strategy' };
    }
    if (goals.includes('improve_marketing') || goals.includes('expand_market')) {
      return { role: 'CMO', name: 'Jordan', icon: '📈', reason: 'to plan your growth strategy' };
    }
    if (goals.includes('hire_team') || goals.includes('build_culture')) {
      return { role: 'CHRO', name: 'Taylor', icon: '👥', reason: 'to build your team' };
    }
    if (goals.includes('improve_operations')) {
      return { role: 'COO', name: 'Morgan', icon: '⚙️', reason: 'to optimize your operations' };
    }
    if (goals.includes('technology_upgrade')) {
      return { role: 'CTO', name: 'Riley', icon: '💻', reason: 'to plan your tech strategy' };
    }
    return { role: 'CFO', name: 'Alex', icon: '💰', reason: 'to review your business health' };
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return <WelcomeStep onNext={nextStep} onSkip={skipOnboarding} />;
      case 'basics':
        return (
          <BasicsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'size':
        return (
          <SizeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'goals':
        return (
          <GoalsStep
            formData={formData}
            toggleGoal={toggleGoal}
            toggleChallenge={toggleChallenge}
            updateFormData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'complete':
        return (
          <CompleteStep
            companyName={formData.name}
            recommendation={getRecommendedExecutive()}
            onComplete={completeOnboarding}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Progress indicator */}
        {currentStep > 0 && currentStep < STEPS.length - 1 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {STEPS.slice(1, -1).map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < STEPS.slice(1, -1).length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      index + 1 < currentStep
                        ? 'bg-emerald-500 text-white'
                        : index + 1 === currentStep
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {index + 1 < currentStep ? '✓' : index + 1}
                  </div>
                  {index < STEPS.slice(1, -1).length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        index + 1 < currentStep ? 'bg-emerald-500' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-sm">
              Step {currentStep} of {STEPS.length - 2}: {STEPS[currentStep].title}
            </p>
          </div>
        )}

        {/* Step content */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

// Step Components

function WelcomeStep({
  onNext,
  onSkip,
}: {
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
        <span className="text-4xl">👋</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-3">Welcome to BizAI!</h1>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        Let's personalize your AI executive team. This quick setup helps us give you
        tailored advice for your specific business.
      </p>

      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <button
          onClick={onNext}
          className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
        >
          Get Started
        </button>
        <button
          onClick={onSkip}
          className="w-full py-3 px-6 text-gray-400 hover:text-white font-medium transition-colors"
        >
          Skip for now
        </button>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        ⏱️ Takes about 2 minutes
      </p>
    </div>
  );
}

function BasicsStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: {
  formData: any;
  updateFormData: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Tell us about your company</h2>
      <p className="text-gray-400 mb-6">Basic information to get started</p>

      <div className="space-y-5">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            placeholder="Acme Inc."
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => updateFormData('industry', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Select an industry...</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Business Model */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Business Model
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'b2b', label: 'B2B', desc: 'Sell to businesses' },
              { value: 'b2c', label: 'B2C', desc: 'Sell to consumers' },
              { value: 'both', label: 'Both', desc: 'B2B and B2C' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateFormData('businessModel', option.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.businessModel === option.value
                    ? 'bg-emerald-500/20 border-emerald-500 text-white'
                    : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <p className="font-semibold">{option.label}</p>
                <p className="text-xs mt-1 opacity-70">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Primary Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData('location', e.target.value)}
            placeholder="San Francisco, CA"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function SizeStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: {
  formData: any;
  updateFormData: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Company Size & Stage</h2>
      <p className="text-gray-400 mb-6">Help us understand your scale</p>

      <div className="space-y-6">
        {/* Employee Count */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            How many employees?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {EMPLOYEE_COUNTS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateFormData('employeeCount', option.value)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formData.employeeCount === option.value
                    ? 'bg-emerald-500/20 border-emerald-500 text-white'
                    : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Annual Revenue
          </label>
          <div className="grid grid-cols-2 gap-3">
            {REVENUE_RANGES.map((option) => (
              <button
                key={option.value}
                onClick={() => updateFormData('revenueRange', option.value)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formData.revenueRange === option.value
                    ? 'bg-emerald-500/20 border-emerald-500 text-white'
                    : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Business Stage
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'pre_revenue', label: 'Pre-revenue', desc: 'Building product' },
              { value: 'early', label: 'Early Stage', desc: 'Finding product-market fit' },
              { value: 'growth', label: 'Growth', desc: 'Scaling up' },
              { value: 'mature', label: 'Mature', desc: 'Optimizing & expanding' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateFormData('stage', option.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.stage === option.value
                    ? 'bg-emerald-500/20 border-emerald-500 text-white'
                    : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <p className="font-semibold">{option.label}</p>
                <p className="text-xs mt-1 opacity-70">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function GoalsStep({
  formData,
  toggleGoal,
  toggleChallenge,
  updateFormData,
  onNext,
  onBack,
}: {
  formData: any;
  toggleGoal: (goalId: string) => void;
  toggleChallenge: (challenge: string) => void;
  updateFormData: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Goals & Challenges</h2>
      <p className="text-gray-400 mb-6">What are you focused on?</p>

      <div className="space-y-6">
        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Top Goals <span className="text-gray-500">(select up to 3)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {BUSINESS_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                disabled={
                  !formData.goals.includes(goal.id) && formData.goals.length >= 3
                }
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  formData.goals.includes(goal.id)
                    ? 'bg-emerald-500/20 border-emerald-500 text-white'
                    : formData.goals.length >= 3
                    ? 'bg-gray-700/20 border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <span className="text-xl">{goal.icon}</span>
                <span className="text-sm">{goal.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Current Challenges <span className="text-gray-500">(select any)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_CHALLENGES.map((challenge) => (
              <button
                key={challenge}
                onClick={() => toggleChallenge(challenge)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  formData.challenges.includes(challenge)
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                {challenge}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Challenge */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Anything else? <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.customChallenge}
            onChange={(e) => updateFormData('customChallenge', e.target.value)}
            placeholder="Describe your biggest challenge..."
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function CompleteStep({
  companyName,
  recommendation,
  onComplete,
  onBack,
}: {
  companyName: string;
  recommendation: { role: string; name: string; icon: string; reason: string };
  onComplete: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
        <span className="text-4xl">🎉</span>
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">You're all set!</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        {companyName ? `${companyName}'s` : 'Your'} AI executive team is ready to help.
      </p>

      {/* Recommendation */}
      <div className="bg-gray-700/30 rounded-xl p-6 mb-8 max-w-sm mx-auto">
        <p className="text-sm text-gray-400 mb-3">We recommend starting with</p>
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gray-600/50 rounded-xl flex items-center justify-center text-2xl">
            {recommendation.icon}
          </div>
          <div className="text-left">
            <p className="font-bold text-white">{recommendation.role}</p>
            <p className="text-sm text-gray-400">{recommendation.name}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">{recommendation.reason}</p>
      </div>

      {/* Executive Team Preview */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { icon: '💰', role: 'CFO' },
          { icon: '📈', role: 'CMO' },
          { icon: '⚙️', role: 'COO' },
          { icon: '💻', role: 'CTO' },
          { icon: '👥', role: 'CHRO' },
        ].map((exec) => (
          <div
            key={exec.role}
            className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center text-lg"
            title={exec.role}
          >
            {exec.icon}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <button
          onClick={onComplete}
          className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
        >
          Meet Your Team →
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 px-6 text-gray-400 hover:text-white font-medium transition-colors"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}
