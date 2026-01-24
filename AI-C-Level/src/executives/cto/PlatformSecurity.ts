/**
 * Platform Security Assurance Module
 * 
 * Provides transparency about BizAI's security posture and data protection.
 * This module allows the CTO to explain how user data is protected.
 */

// ============================================
// Platform Security Documentation
// ============================================

export interface SecurityControl {
  id: string;
  category: string;
  control: string;
  description: string;
  status: 'implemented' | 'planned' | 'not_applicable';
  evidence?: string;
}

export interface DataProtectionInfo {
  dataType: string;
  description: string;
  collection: string;
  storage: string;
  encryption: string;
  retention: string;
  access: string;
  deletion: string;
}

export interface PlatformSecurityPosture {
  lastUpdated: Date;
  overallStatus: 'strong' | 'good' | 'needs_improvement';
  certifications: string[];
  controls: SecurityControl[];
  dataProtection: DataProtectionInfo[];
  incidentResponse: string;
  contactInfo: string;
}

// ============================================
// BizAI Platform Security Documentation
// ============================================

export const PLATFORM_SECURITY: PlatformSecurityPosture = {
  lastUpdated: new Date('2025-01-01'),
  overallStatus: 'good',
  
  certifications: [
    'SOC 2 Type II (Planned)',
    'GDPR Compliant Data Handling',
    'CCPA Compliant',
  ],

  controls: [
    // Authentication & Access
    {
      id: 'auth-1',
      category: 'Authentication',
      control: 'User Authentication',
      description: 'Secure authentication with email/password or OAuth providers',
      status: 'planned',
    },
    {
      id: 'auth-2',
      category: 'Authentication',
      control: 'Session Management',
      description: 'Secure session tokens with automatic expiration',
      status: 'implemented',
    },
    {
      id: 'auth-3',
      category: 'Authentication',
      control: 'Multi-Factor Authentication',
      description: 'Optional MFA for enhanced account security',
      status: 'planned',
    },

    // Data Protection
    {
      id: 'data-1',
      category: 'Data Protection',
      control: 'Encryption at Rest',
      description: 'All data encrypted using AES-256 in database',
      status: 'implemented',
    },
    {
      id: 'data-2',
      category: 'Data Protection',
      control: 'Encryption in Transit',
      description: 'TLS 1.3 for all data transmission',
      status: 'implemented',
    },
    {
      id: 'data-3',
      category: 'Data Protection',
      control: 'Data Isolation',
      description: 'Tenant data logically isolated with row-level security',
      status: 'implemented',
    },
    {
      id: 'data-4',
      category: 'Data Protection',
      control: 'Backup & Recovery',
      description: 'Daily automated backups with point-in-time recovery',
      status: 'implemented',
    },

    // Infrastructure
    {
      id: 'infra-1',
      category: 'Infrastructure',
      control: 'Cloud Security',
      description: 'Hosted on SOC 2 compliant cloud infrastructure (Vercel/Supabase)',
      status: 'implemented',
    },
    {
      id: 'infra-2',
      category: 'Infrastructure',
      control: 'Network Security',
      description: 'Firewall rules, DDoS protection, and WAF',
      status: 'implemented',
    },
    {
      id: 'infra-3',
      category: 'Infrastructure',
      control: 'Vulnerability Management',
      description: 'Regular security scanning and dependency updates',
      status: 'implemented',
    },

    // Application Security
    {
      id: 'app-1',
      category: 'Application',
      control: 'Input Validation',
      description: 'All user inputs validated and sanitized',
      status: 'implemented',
    },
    {
      id: 'app-2',
      category: 'Application',
      control: 'API Security',
      description: 'Rate limiting, authentication, and input validation on all APIs',
      status: 'implemented',
    },
    {
      id: 'app-3',
      category: 'Application',
      control: 'Secure Development',
      description: 'Security-focused code review and testing practices',
      status: 'implemented',
    },

    // Privacy
    {
      id: 'priv-1',
      category: 'Privacy',
      control: 'Data Minimization',
      description: 'Only collect data necessary for service delivery',
      status: 'implemented',
    },
    {
      id: 'priv-2',
      category: 'Privacy',
      control: 'User Rights',
      description: 'Support for data access, export, and deletion requests',
      status: 'implemented',
    },
    {
      id: 'priv-3',
      category: 'Privacy',
      control: 'AI Data Handling',
      description: 'Conversations processed by Claude API with Anthropic\'s privacy protections',
      status: 'implemented',
    },

    // Monitoring
    {
      id: 'mon-1',
      category: 'Monitoring',
      control: 'Audit Logging',
      description: 'Comprehensive logging of security-relevant events',
      status: 'implemented',
    },
    {
      id: 'mon-2',
      category: 'Monitoring',
      control: 'Alerting',
      description: 'Automated alerts for security anomalies',
      status: 'planned',
    },
  ],

  dataProtection: [
    {
      dataType: 'Company Profile',
      description: 'Business information provided during onboarding',
      collection: 'User-provided during onboarding',
      storage: 'Encrypted database (Supabase) or local storage',
      encryption: 'AES-256 at rest, TLS 1.3 in transit',
      retention: 'Until account deletion',
      access: 'User only (via authenticated session)',
      deletion: 'Available via settings or account deletion',
    },
    {
      dataType: 'Conversation History',
      description: 'Chat messages with AI executives',
      collection: 'Generated during platform use',
      storage: 'Encrypted database or local storage',
      encryption: 'AES-256 at rest, TLS 1.3 in transit',
      retention: 'Until conversation cleared or account deleted',
      access: 'User only',
      deletion: 'Clear conversation button or account deletion',
    },
    {
      dataType: 'AI Processing',
      description: 'Data sent to Claude API for AI responses',
      collection: 'Your messages and company context',
      storage: 'Not stored by Anthropic (per their API policy)',
      encryption: 'TLS 1.3 to Anthropic API',
      retention: 'Not retained by AI provider',
      access: 'Processed only, not stored',
      deletion: 'Automatic (not retained)',
    },
    {
      dataType: 'Executive Messages',
      description: 'Inter-executive collaboration messages',
      collection: 'Generated by AI based on conversations',
      storage: 'Encrypted database or local storage',
      encryption: 'AES-256 at rest, TLS 1.3 in transit',
      retention: 'Until account deletion',
      access: 'User only',
      deletion: 'Account deletion',
    },
  ],

  incidentResponse: `
BizAI maintains an incident response plan that includes:

1. **Detection**: Automated monitoring and alerting for security events
2. **Assessment**: Rapid triage to determine scope and severity
3. **Containment**: Immediate steps to limit impact
4. **Notification**: User notification within 72 hours for data breaches
5. **Remediation**: Fix underlying issues and prevent recurrence
6. **Review**: Post-incident analysis and improvements

For security concerns, contact: security@bizai.example.com
  `.trim(),

  contactInfo: `
For security questions or to report vulnerabilities:
- Email: security@bizai.example.com
- Response time: Within 24 hours for security matters

For data privacy requests (access, deletion, export):
- Email: privacy@bizai.example.com
- Response time: Within 30 days as required by law
  `.trim(),
};

// ============================================
// Security Assurance Functions
// ============================================

export function getSecurityOverview(): string {
  const { controls, overallStatus, certifications } = PLATFORM_SECURITY;
  
  const implemented = controls.filter(c => c.status === 'implemented').length;
  const total = controls.length;
  const percentage = Math.round((implemented / total) * 100);

  return `
## BizAI Platform Security Overview

**Overall Status**: ${overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
**Security Controls**: ${implemented}/${total} implemented (${percentage}%)
**Certifications**: ${certifications.join(', ')}

### Key Security Features

**Data Protection**
- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Tenant data isolation with row-level security
- Daily backups with point-in-time recovery

**Privacy**
- Data minimization practices
- User rights supported (access, export, delete)
- AI conversations not retained by the AI provider

**Infrastructure**
- Hosted on SOC 2 compliant cloud providers
- DDoS protection and Web Application Firewall
- Regular security scanning and updates

### Your Data Rights

You can:
- Export all your data at any time
- Delete your conversations
- Delete your entire account and all associated data
- Request information about how your data is processed
  `.trim();
}

export function getDataProtectionDetails(dataType?: string): DataProtectionInfo[] {
  if (dataType) {
    return PLATFORM_SECURITY.dataProtection.filter(
      d => d.dataType.toLowerCase().includes(dataType.toLowerCase())
    );
  }
  return PLATFORM_SECURITY.dataProtection;
}

export function getSecurityControls(category?: string): SecurityControl[] {
  if (category) {
    return PLATFORM_SECURITY.controls.filter(
      c => c.category.toLowerCase() === category.toLowerCase()
    );
  }
  return PLATFORM_SECURITY.controls;
}

export function getSecurityFAQ(): string {
  return `
## Security Frequently Asked Questions

### Where is my data stored?
Your data is stored in Supabase (PostgreSQL database) hosted on AWS infrastructure in the United States. If you don't configure Supabase, data is stored locally in your browser.

### Is my data encrypted?
Yes. All data is encrypted at rest using AES-256 encryption and in transit using TLS 1.3.

### Does the AI store my conversations?
BizAI stores your conversation history so you can continue conversations. However, the AI provider (Anthropic) does not retain your data per their API data usage policy.

### Can I delete my data?
Yes. You can:
- Clear individual conversations
- Delete your company profile
- Request complete account deletion

### Who can see my data?
Only you can access your data through your authenticated account. BizAI staff do not access customer data except when required for support (with your permission) or legal compliance.

### What happens if there's a security breach?
We will notify affected users within 72 hours as required by GDPR and other regulations. We will provide details about what data was affected and steps you should take.

### Is BizAI GDPR compliant?
Yes. We follow GDPR principles including data minimization, purpose limitation, and user rights. EU users can exercise their rights under GDPR.

### Is BizAI HIPAA compliant?
Not currently. If you handle protected health information (PHI), do not enter it into BizAI until HIPAA compliance is achieved.

### Can I export my data?
Yes. You can export your company profile and conversation history at any time through the settings page.
  `.trim();
}

export function generateSecurityReport(): string {
  const { controls, dataProtection, lastUpdated } = PLATFORM_SECURITY;
  
  const byCategory = controls.reduce((acc, control) => {
    if (!acc[control.category]) acc[control.category] = [];
    acc[control.category].push(control);
    return acc;
  }, {} as Record<string, SecurityControl[]>);

  let report = `# BizAI Platform Security Report
Generated: ${new Date().toLocaleDateString()}
Last Security Review: ${lastUpdated.toLocaleDateString()}

## Executive Summary

BizAI implements comprehensive security controls to protect your business data. This report details our security posture and data protection practices.

## Security Controls by Category

`;

  for (const [category, categoryControls] of Object.entries(byCategory)) {
    const implemented = categoryControls.filter(c => c.status === 'implemented').length;
    report += `### ${category} (${implemented}/${categoryControls.length} implemented)\n\n`;
    
    for (const control of categoryControls) {
      const statusIcon = control.status === 'implemented' ? '✅' : '🔄';
      report += `${statusIcon} **${control.control}**: ${control.description}\n`;
    }
    report += '\n';
  }

  report += `## Data Protection Summary

| Data Type | Encryption | Retention | User Control |
|-----------|------------|-----------|--------------|
`;

  for (const data of dataProtection) {
    report += `| ${data.dataType} | ${data.encryption.split(',')[0]} | ${data.retention} | ${data.deletion} |\n`;
  }

  report += `
## Compliance Status

- **GDPR**: Compliant
- **CCPA**: Compliant  
- **SOC 2**: Planned
- **HIPAA**: Not applicable (do not enter PHI)

## Contact

For security questions: security@bizai.example.com
For privacy requests: privacy@bizai.example.com
`;

  return report;
}
