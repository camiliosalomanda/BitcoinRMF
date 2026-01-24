'use client';

/**
 * Privacy Consent Banner
 * GDPR-compliant consent management UI
 */

import React, { useState, useEffect } from 'react';
import { ConsentType, PRIVACY_POLICY_VERSION } from '@/lib/privacy';

interface ConsentBannerProps {
  onAccept: (consents: Record<ConsentType, boolean>) => void;
  onDecline: () => void;
}

const CONSENT_OPTIONS: Array<{
  type: ConsentType;
  label: string;
  description: string;
  required: boolean;
}> = [
  {
    type: 'essential',
    label: 'Essential',
    description: 'Required for the platform to function. Cannot be disabled.',
    required: true,
  },
  {
    type: 'ai_processing',
    label: 'AI Processing',
    description: 'Allow AI executives to process your business data to provide insights.',
    required: false,
  },
  {
    type: 'analytics',
    label: 'Analytics',
    description: 'Help us improve by allowing anonymous usage analytics.',
    required: false,
  },
  {
    type: 'marketing',
    label: 'Marketing',
    description: 'Receive updates about new features and tips.',
    required: false,
  },
];

export default function ConsentBanner({ onAccept, onDecline }: ConsentBannerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState<Record<ConsentType, boolean>>({
    essential: true,
    ai_processing: true,
    analytics: false,
    marketing: false,
    third_party: false,
  });

  // Check if consent already given
  useEffect(() => {
    const stored = localStorage.getItem('privacy_consent');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.version === PRIVACY_POLICY_VERSION) {
          // Already consented to current version
          onAccept(parsed.consents);
        }
      } catch {
        // Invalid stored consent
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsents: Record<ConsentType, boolean> = {
      essential: true,
      ai_processing: true,
      analytics: true,
      marketing: true,
      third_party: true,
    };
    saveAndAccept(allConsents);
  };

  const handleAcceptSelected = () => {
    saveAndAccept(consents);
  };

  const handleDecline = () => {
    // Only essential cookies
    const minimalConsents: Record<ConsentType, boolean> = {
      essential: true,
      ai_processing: false,
      analytics: false,
      marketing: false,
      third_party: false,
    };
    saveAndAccept(minimalConsents);
    onDecline();
  };

  const saveAndAccept = (finalConsents: Record<ConsentType, boolean>) => {
    localStorage.setItem('privacy_consent', JSON.stringify({
      version: PRIVACY_POLICY_VERSION,
      consents: finalConsents,
      timestamp: new Date().toISOString(),
    }));
    onAccept(finalConsents);
  };

  const toggleConsent = (type: ConsentType) => {
    if (type === 'essential') return; // Cannot disable essential
    setConsents(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg">
      <div className="max-w-4xl mx-auto">
        {!showDetails ? (
          // Simple banner
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                We use cookies and process data to provide our AI-powered business services.
                By continuing, you agree to our{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Customize
              </button>
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Decline Optional
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Detailed consent options
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Privacy Preferences</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Choose which data processing activities you consent to. Essential cookies cannot be disabled
              as they are required for the platform to function.
            </p>

            <div className="space-y-3">
              {CONSENT_OPTIONS.map((option) => (
                <div
                  key={option.type}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    option.required ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={consents[option.type]}
                      onChange={() => toggleConsent(option.type)}
                      disabled={option.required}
                      className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      {option.required && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <a
                href="/privacy"
                className="text-sm text-blue-600 hover:underline"
              >
                Read Full Privacy Policy
              </a>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Decline Optional
                </button>
                <button
                  onClick={handleAcceptSelected}
                  className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
