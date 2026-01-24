'use client';

/**
 * AI Disclosure Page
 * Transparency about AI capabilities, limitations, and data handling
 */

import React from 'react';
import Link from 'next/link';

export default function AIDisclosurePage() {
  const lastUpdated = 'January 2025';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Transparency Disclosure</h1>
              <p className="text-gray-500 text-sm">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-blue-800 mb-2">🤖 About This AI System</h2>
              <p className="text-blue-700">
                BizAI uses artificial intelligence to simulate business executive personas. This disclosure 
                explains how our AI works, its limitations, and how we handle your data in compliance with 
                emerging AI transparency regulations.
              </p>
            </div>
          </section>

          {/* AI Technology */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. AI Technology Used</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 Foundation Model</h3>
            <p className="text-gray-700 mb-4">
              BizAI is powered by large language models (LLMs) provided by Anthropic (Claude). These models 
              are trained on large datasets of text from the internet and other sources to generate human-like responses.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 How It Works</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>You input a question or request</li>
              <li>Your input is sent to the AI model along with a "system prompt" that defines the executive persona</li>
              <li>The AI generates a response based on patterns in its training data</li>
              <li>The response is displayed to you</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">1.3 Executive Personas</h3>
            <p className="text-gray-700 mb-3">
              The six "executive" personas (CFO Alex, CMO Jordan, COO Morgan, CHRO Taylor, CTO Riley, CCO Casey) 
              are <strong>simulated characters</strong> created through AI prompting. They are:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>NOT real people</strong> with professional licenses or credentials</li>
              <li><strong>NOT certified professionals</strong> in their respective fields</li>
              <li><strong>NOT able to provide professional advice</strong> that requires licensing</li>
              <li>Designed to help you think through business topics from different perspectives</li>
            </ul>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Known Limitations</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-medium">
                ⚠️ Understanding these limitations is critical to using BizAI appropriately.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Accuracy Limitations</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Hallucinations:</strong> AI may generate plausible-sounding but incorrect information</li>
              <li><strong>Outdated Information:</strong> Training data has a cutoff date; AI doesn't know recent events</li>
              <li><strong>No Real-Time Data:</strong> AI cannot access current market data, prices, or news</li>
              <li><strong>Mathematical Errors:</strong> AI may make calculation mistakes</li>
              <li><strong>Citation Errors:</strong> AI may cite sources that don't exist or misattribute information</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 Context Limitations</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>No Knowledge of Your Situation:</strong> AI only knows what you tell it in the conversation</li>
              <li><strong>Cannot Access External Systems:</strong> AI cannot access your accounting software, CRM, or other systems</li>
              <li><strong>Limited Memory:</strong> AI may lose context in very long conversations</li>
              <li><strong>No Verification:</strong> AI cannot verify facts or check information against authoritative sources</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 Judgment Limitations</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>No Professional Judgment:</strong> AI cannot apply professional judgment that licensed experts provide</li>
              <li><strong>Cannot Assess Risk:</strong> AI cannot properly assess risks specific to your business</li>
              <li><strong>May Miss Important Factors:</strong> AI may overlook critical considerations a human expert would catch</li>
              <li><strong>Potential Bias:</strong> AI may reflect biases present in its training data</li>
            </ul>
          </section>

          {/* Data Handling */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Data Handling</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 What Data We Collect</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Your conversation inputs and AI responses</li>
              <li>Files you upload for analysis</li>
              <li>Account information (email, company details)</li>
              <li>Usage data (features used, timestamps)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2 How Data is Processed</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Your inputs are sent to Anthropic's API for processing</li>
              <li>Anthropic's data handling is governed by their privacy policy and our data processing agreement</li>
              <li>Conversation history is stored to provide continuity</li>
              <li>We implement technical measures to isolate data between different company accounts</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.3 Data Retention</h3>
            <p className="text-gray-700 mb-4">
              Conversation data is retained for the duration of your account plus 30 days after deletion. 
              You can request data deletion at any time.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.4 AI Training</h3>
            <p className="text-gray-700">
              Your data is <strong>NOT</strong> used to train the underlying AI model. Your conversations 
              remain private and are not shared with other users or used to improve the general AI system.
            </p>
          </section>

          {/* Appropriate Use */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Appropriate Use Guidelines</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">✅ BizAI IS Appropriate For:</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Brainstorming and exploring business ideas</li>
              <li>Getting different perspectives on business challenges</li>
              <li>Learning about business concepts and frameworks</li>
              <li>Drafting initial documents for human review</li>
              <li>Organizing thoughts before consulting professionals</li>
              <li>Educational purposes and skill development</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">❌ BizAI is NOT Appropriate For:</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Making final financial decisions without professional advice</li>
              <li>Legal matters without consulting an attorney</li>
              <li>Tax decisions without consulting a tax professional</li>
              <li>Regulatory compliance certification</li>
              <li>Medical or health-related decisions</li>
              <li>Situations requiring licensed professional judgment</li>
              <li>As the sole basis for major business decisions</li>
            </ul>
          </section>

          {/* Human Oversight */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Human Oversight Requirement</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                <strong>Always apply human judgment.</strong> AI outputs should be reviewed, verified, and validated 
                by qualified humans before being acted upon. Critical business decisions should involve appropriate 
                professional advisors (attorneys, accountants, financial advisors, etc.).
              </p>
            </div>
          </section>

          {/* Regulatory Framework */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Regulatory Compliance</h2>
            <p className="text-gray-700 mb-3">
              This disclosure is provided in the spirit of transparency and in anticipation of emerging AI 
              regulations including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>EU AI Act requirements for transparency and disclosure</li>
              <li>US state AI transparency laws</li>
              <li>Industry-specific AI governance requirements</li>
              <li>General data protection regulations (GDPR, CCPA)</li>
            </ul>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Updates to This Disclosure</h2>
            <p className="text-gray-700">
              We will update this disclosure as our AI technology evolves and as regulatory requirements change. 
              Material changes will be communicated to users via email or in-app notification.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Questions and Concerns</h2>
            <p className="text-gray-700">
              If you have questions about our AI technology or this disclosure, please contact us at: 
              ai-transparency@bizai.example.com
            </p>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>
      </main>
    </div>
  );
}
