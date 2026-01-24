/**
 * Privacy Policy Page
 * GDPR, CCPA, and general privacy compliance
 */

import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - BizAI',
  description: 'Privacy policy for BizAI platform',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 15, 2026';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                BizAI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our
                AI-powered business platform.
              </p>
              <p className="text-gray-700">
                By using BizAI, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                <li><strong>Company Information:</strong> Business name, industry, size, goals, challenges</li>
                <li><strong>Communications:</strong> Messages sent to AI executives, uploaded files</li>
                <li><strong>Payment Information:</strong> Billing details (processed by third-party providers)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Usage Data:</strong> Features used, time spent, interactions with AI</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
                <li><strong>Cookies:</strong> Session management, preferences, analytics (with consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide and maintain our AI executive services</li>
                <li>Personalize your experience and provide relevant insights</li>
                <li>Process transactions and send related information</li>
                <li>Improve our platform and develop new features</li>
                <li>Communicate with you about updates and support</li>
                <li>Detect and prevent fraud and security issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. AI Processing</h2>
              <p className="text-gray-700 mb-4">
                Our platform uses artificial intelligence (powered by Anthropic Claude) to provide business insights.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your conversations with AI executives are processed to generate responses</li>
                <li>We do not use your data to train AI models</li>
                <li>Anthropic does not retain your conversation data after processing</li>
                <li>You can request deletion of your chat history at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
              <p className="text-gray-700 mb-4">We do not sell your personal data. We may share information with:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> Cloud hosting (Vercel), AI processing (Anthropic), payment processing</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">We implement industry-standard security measures:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Encryption at rest (AES-256) and in transit (TLS 1.3)</li>
                <li>Secure authentication with password hashing (bcrypt)</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and audit logging</li>
                <li>Incident response procedures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights (GDPR/CCPA)</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, visit Settings → Privacy or contact privacy@bizai.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Chat History:</strong> Retained for 90 days, then deleted (unless you request earlier)</li>
                <li><strong>Audit Logs:</strong> Retained for 7 years for compliance purposes</li>
                <li><strong>Deleted Accounts:</strong> Data deleted within 30 days, except legally required retention</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
              <p className="text-gray-700 mb-4">We use the following types of cookies:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Essential:</strong> Required for platform functionality (cannot be disabled)</li>
                <li><strong>Analytics:</strong> Help us understand usage (opt-in)</li>
                <li><strong>Preferences:</strong> Remember your settings (opt-in)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can manage cookie preferences in your browser settings or through our consent banner.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
              <p className="text-gray-700">
                BizAI is not intended for individuals under 18 years of age. We do not knowingly collect
                personal information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. International Transfers</h2>
              <p className="text-gray-700">
                Your data may be transferred to and processed in countries outside your jurisdiction.
                We ensure appropriate safeguards are in place, including Standard Contractual Clauses
                for transfers outside the EEA.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of material changes
                via email or prominent notice on our platform. Your continued use after changes constitutes
                acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700">
                For privacy-related questions or to exercise your rights:
              </p>
              <ul className="list-none pl-0 text-gray-700 mt-4 space-y-1">
                <li><strong>Email:</strong> privacy@bizai.com</li>
                <li><strong>Data Protection Officer:</strong> dpo@bizai.com</li>
              </ul>
            </section>

            <section className="mt-8 pt-8 border-t">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">California Privacy Rights (CCPA)</h2>
              <p className="text-gray-700 mb-4">
                California residents have additional rights under the CCPA:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to say no to the sale of personal information</li>
                <li>Right to equal service and price</li>
              </ul>
              <p className="text-gray-700 mt-4">
                <strong>We do not sell personal information.</strong> To make a CCPA request,
                email ccpa@bizai.com or call 1-800-XXX-XXXX.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
