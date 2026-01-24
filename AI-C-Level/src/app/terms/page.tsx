'use client';

/**
 * Terms of Service Page
 * Comprehensive legal terms and conditions for BizAI platform
 */

import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
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
              <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-500 text-sm">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border p-8 space-y-8">
          
          {/* Important Notice Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-red-800 mb-3">⚠️ IMPORTANT LEGAL NOTICE</h2>
            <p className="text-red-700 mb-3">
              <strong>BizAI provides AI-generated information for educational and informational purposes only.</strong> 
              The AI executives are simulated personas powered by artificial intelligence and do not constitute 
              professional advice from licensed professionals.
            </p>
            <p className="text-red-700">
              <strong>DO NOT rely on BizAI outputs as a substitute for professional financial, legal, tax, 
              compliance, human resources, or other professional advice.</strong> Always consult qualified 
              professionals before making business decisions.
            </p>
          </div>

          {/* 1. Acceptance */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-3">
              By accessing or using the BizAI platform ("Service"), you agree to be bound by these Terms of Service 
              ("Terms"). If you do not agree to these Terms, you may not use the Service.
            </p>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. Continued use of the Service after changes 
              constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* 2. Service Description */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Service Description and Limitations</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Nature of Service</h3>
            <p className="text-gray-700 mb-3">
              BizAI is an artificial intelligence platform that simulates business executive personas to provide 
              informational responses to business queries. The Service uses large language models to generate responses 
              that may appear to be professional advice but are AI-generated outputs.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 AI Limitations</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-3">
              <li>AI outputs may contain errors, inaccuracies, or outdated information</li>
              <li>The AI does not have access to real-time data, current market conditions, or your specific circumstances</li>
              <li>AI responses are generated based on patterns in training data and may not be appropriate for your situation</li>
              <li>The AI cannot verify information or guarantee accuracy of any output</li>
              <li>AI personas (CFO, CMO, COO, CHRO, CTO, CCO) are simulations and do not represent actual licensed professionals</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 Not Professional Advice</h3>
            <p className="text-gray-700 mb-3">
              <strong>The Service does NOT provide:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Financial Advice:</strong> AI outputs are not investment advice, financial planning, or securities recommendations. The "CFO" persona is not a licensed financial advisor, CPA, or securities professional.</li>
              <li><strong>Legal Advice:</strong> AI outputs are not legal advice or legal opinions. The "CCO" persona is not a licensed attorney. Contract reviews are informational only and do not substitute for legal counsel.</li>
              <li><strong>Tax Advice:</strong> AI outputs are not tax advice. Consult a licensed tax professional or CPA for tax matters.</li>
              <li><strong>HR/Employment Advice:</strong> AI outputs are not employment law advice. The "CHRO" persona is not an employment attorney. Consult HR professionals and employment counsel for personnel matters.</li>
              <li><strong>Compliance Advice:</strong> AI outputs do not constitute compliance certification or regulatory guidance. The "CCO" persona cannot certify compliance with any regulation.</li>
              <li><strong>Medical or Health Advice:</strong> The Service does not provide any medical or health-related advice.</li>
            </ul>
          </section>

          {/* 3. User Responsibilities */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 mb-3">You acknowledge and agree that:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You are solely responsible for any decisions made based on AI outputs</li>
              <li>You will independently verify all information before relying on it</li>
              <li>You will consult qualified professionals for professional advice</li>
              <li>You will not use the Service for any illegal purpose</li>
              <li>You will not upload sensitive personal data of third parties without authorization</li>
              <li>You are responsible for compliance with all applicable laws in your jurisdiction</li>
              <li>You will not represent AI outputs as professional advice to third parties</li>
            </ul>
          </section>

          {/* 4. Data and Privacy */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Data Handling and Privacy</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 Data Processing</h3>
            <p className="text-gray-700 mb-3">
              By using the Service, you acknowledge that your inputs may be processed by AI systems. 
              See our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> for 
              details on data collection, use, and retention.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 Confidential Information</h3>
            <p className="text-gray-700 mb-3">
              <strong>Do not input highly sensitive information</strong> including but not limited to: social security 
              numbers, bank account numbers, credit card information, passwords, trade secrets, or information subject 
              to legal privilege.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3 Multi-Company Data Isolation</h3>
            <p className="text-gray-700">
              While we implement technical measures to isolate data between different company accounts, we cannot 
              guarantee absolute data isolation. Users with access to multiple companies are responsible for ensuring 
              appropriate data handling.
            </p>
          </section>

          {/* 5. Intellectual Property */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-700 mb-3">
              You retain ownership of content you input into the Service. You grant us a license to process your 
              inputs to provide the Service. AI-generated outputs are provided for your use but may not be unique 
              and similar outputs may be generated for other users.
            </p>
          </section>

          {/* 6. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-medium">
                THIS SECTION CONTAINS IMPORTANT LIMITATIONS ON OUR LIABILITY. PLEASE READ CAREFULLY.
              </p>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">6.1 Disclaimer of Warranties</h3>
            <p className="text-gray-700 mb-3">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, 
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, 
              OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">6.2 Limitation of Damages</h3>
            <p className="text-gray-700 mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS 
              OPPORTUNITIES, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE OR RELIANCE ON AI OUTPUTS.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">6.3 Maximum Liability</h3>
            <p className="text-gray-700 mb-3">
              OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM THESE TERMS OR USE OF THE SERVICE SHALL NOT EXCEED 
              THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), 
              WHICHEVER IS GREATER.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">6.4 Essential Purpose</h3>
            <p className="text-gray-700">
              THESE LIMITATIONS APPLY EVEN IF ANY REMEDY FAILS OF ITS ESSENTIAL PURPOSE AND REGARDLESS OF WHETHER 
              WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </section>

          {/* 7. Indemnification */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless BizAI, its affiliates, officers, directors, employees, 
              and agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising 
              from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party 
              rights; or (d) any decisions made based on AI outputs.
            </p>
          </section>

          {/* 8. Regulatory Compliance */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Regulatory Compliance Notice</h2>
            <p className="text-gray-700 mb-3">
              BizAI is not registered as an investment advisor, broker-dealer, law firm, accounting firm, or any other 
              regulated professional services entity. The Service is not intended to provide services that require 
              professional licensing.
            </p>
            <p className="text-gray-700">
              Users in regulated industries are responsible for ensuring their use of the Service complies with 
              applicable industry regulations, including but not limited to: SOX, GDPR, HIPAA, FINRA, SEC regulations, 
              state bar rules, and industry-specific compliance requirements.
            </p>
          </section>

          {/* 9. Termination */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700">
              We may terminate or suspend your access to the Service at any time, with or without cause, with or 
              without notice. Upon termination, your right to use the Service ceases immediately. Sections relating 
              to intellectual property, limitation of liability, indemnification, and dispute resolution survive termination.
            </p>
          </section>

          {/* 10. Governing Law */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Governing Law and Disputes</h2>
            <p className="text-gray-700 mb-3">
              These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles. 
              Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in 
              accordance with the rules of the American Arbitration Association.
            </p>
            <p className="text-gray-700">
              You waive any right to participate in class action lawsuits or class-wide arbitration against us.
            </p>
          </section>

          {/* 11. Contact */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms, please contact us at: legal@bizai.example.com
            </p>
          </section>

          {/* Acknowledgment */}
          <div className="bg-gray-100 rounded-lg p-6 mt-8">
            <p className="text-gray-700 text-center">
              By using BizAI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>

        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          <Link href="/ai-disclosure" className="text-blue-600 hover:underline">AI Disclosure</Link>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>
      </main>
    </div>
  );
}
