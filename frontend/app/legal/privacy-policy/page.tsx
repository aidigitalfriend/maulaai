'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ArticleReference {
  title: string;
  content: string;
  source: string;
}

interface ArticlePopupProps {
  article: ArticleReference;
  onClose: () => void;
}

function ArticlePopup({ article, onClose }: ArticlePopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-neural-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neural-200 bg-gray-50">
          <h3 className="text-xl font-bold text-neural-900">{article.title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-neural-500 hover:text-neural-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-neural-700 whitespace-pre-line leading-relaxed">
            {article.content}
          </div>
          <div className="pt-4 border-t border-neural-200">
            <p className="text-sm text-blue-600 font-medium">
              Source: {article.source}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neural-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  const [selectedArticle, setSelectedArticle] =
    useState<ArticleReference | null>(null);

  const articles: Record<string, ArticleReference> = {
    gdpr: {
      title: 'GDPR (General Data Protection Regulation)',
      content: `The General Data Protection Regulation (EU) 2016/679 is a regulation in EU law on data protection and privacy in the European Union and the European Economic Area. It also addresses the transfer of personal data outside the EU and EEA areas.

Key Principles:
• Lawfulness, fairness and transparency
• Purpose limitation
• Data minimisation
• Accuracy
• Storage limitation
• Integrity and confidentiality
• Accountability

Rights of Data Subjects:
• Right to access
• Right to rectification
• Right to erasure ("right to be forgotten")
• Right to restriction of processing
• Right to data portability
• Right to object
• Rights related to automated decision making and profiling`,
      source: 'Regulation (EU) 2016/679 of the European Parliament',
    },
    ccpa: {
      title: 'CCPA (California Consumer Privacy Act)',
      content: `The California Consumer Privacy Act of 2018 (CCPA) gives consumers more control over the personal information that businesses collect about them.

Consumer Rights:
• Right to know what personal information is collected
• Right to know whether personal information is sold or disclosed
• Right to say no to the sale of personal information
• Right to access personal information
• Right to equal service and price
• Right to deletion of personal information

Business Obligations:
• Provide notice at collection
• Honor consumer rights requests
• Maintain reasonable security procedures
• Update privacy policy annually`,
      source: 'California Civil Code Section 1798.100-1798.199',
    },
    coppa: {
      title: "COPPA (Children's Online Privacy Protection Act)",
      content: `The Children's Online Privacy Protection Act (COPPA) is a United States federal law designed to protect the privacy of children under 13 years of age.

Requirements:
• Obtain verifiable parental consent before collecting personal information from children
• Provide clear privacy policies
• Limit collection to what is necessary
• Protect confidentiality, security, and integrity of information
• Delete information when no longer needed

Our Compliance:
One Last AI does not knowingly collect information from children under 13. Our services are intended for users 18 years and older.`,
      source: '15 U.S.C. §§ 6501–6506',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <span className="text-xl">🔒</span>
            Your Data, Protected
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Last updated: November 6, 2025 • Effective Date: November 6, 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="container-custom section-padding max-w-5xl">
        <div className="space-y-12">
          {/* Introduction */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              1. Introduction
            </h2>
            <p className="text-neural-700 leading-relaxed mb-4">
              Welcome to One Last AI ("we," "our," or "us"). We operate a global
              multi-agent AI platform that provides specialized AI personalities
              and services to users worldwide. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you
              use our platform at{' '}
              <a
                href="https://onelastai.com"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                onelastai.com
              </a>
              .
            </p>
            <p className="text-neural-700 leading-relaxed mb-4">
              We are committed to protecting your privacy and complying with
              applicable data protection laws globally, including:
            </p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li>
                <button
                  onClick={() => setSelectedArticle(articles.gdpr)}
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  GDPR (General Data Protection Regulation)
                </button>{' '}
                - European Union
              </li>
              <li>
                <button
                  onClick={() => setSelectedArticle(articles.ccpa)}
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  CCPA (California Consumer Privacy Act)
                </button>{' '}
                - United States
              </li>
              <li>
                <button
                  onClick={() => setSelectedArticle(articles.coppa)}
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  COPPA (Children's Online Privacy Protection Act)
                </button>{' '}
                - United States
              </li>
              <li>
                PIPEDA (Personal Information Protection and Electronic Documents
                Act) - Canada
              </li>
              <li>Privacy Act 1988 - Australia</li>
              <li>LGPD (Lei Geral de Proteção de Dados) - Brazil</li>
            </ul>
            <p className="text-neural-500 mt-4 text-sm">
              By using our services, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              2. Information We Collect
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  2.1 Personal Information
                </h3>
                <p className="text-neural-700 mb-3">
                  Information you provide directly:
                </p>
                <ul className="list-disc pl-6 text-neural-700 space-y-2">
                  <li>
                    <strong className="text-neural-900">Account Information:</strong>{' '}
                    Name, email address, username, password
                  </li>
                  <li>
                    <strong className="text-neural-900">Profile Information:</strong>{' '}
                    Company name, job title, profile picture
                  </li>
                  <li>
                    <strong className="text-neural-900">Payment Information:</strong>{' '}
                    Billing address, payment method details (processed securely)
                  </li>
                  <li>
                    <strong className="text-neural-900">Communication Data:</strong>{' '}
                    Support tickets, feedback, chat conversations with AI agents
                  </li>
                  <li>
                    <strong className="text-neural-900">Content Data:</strong> Files,
                    documents, prompts submitted to AI agents
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  2.2 Automatically Collected Information
                </h3>
                <ul className="list-disc pl-6 text-neural-700 space-y-2">
                  <li>
                    <strong className="text-neural-900">Usage Data:</strong> Pages
                    visited, features used, time spent, interaction patterns
                  </li>
                  <li>
                    <strong className="text-neural-900">Device Information:</strong>{' '}
                    IP address, browser type, operating system, device
                    identifiers
                  </li>
                  <li>
                    <strong className="text-neural-900">Location Data:</strong>{' '}
                    Approximate geographic location based on IP address
                  </li>
                  <li>
                    <strong className="text-neural-900">Cookies & Tracking:</strong>{' '}
                    Session cookies, analytics cookies, preference cookies
                  </li>
                  <li>
                    <strong className="text-neural-900">Performance Data:</strong>{' '}
                    API response times, error logs, system diagnostics
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  2.3 AI Interaction Data
                </h3>
                <p className="text-neural-700 mb-3">
                  When you interact with our AI agents:
                </p>
                <ul className="list-disc pl-6 text-neural-700 space-y-2">
                  <li>Conversation history and context</li>
                  <li>Prompts and queries submitted</li>
                  <li>AI-generated responses</li>
                  <li>Agent preferences and customizations</li>
                  <li>Voice recordings (if voice features are used)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              3. How We Use Your Information
            </h2>
            <p className="text-neural-700 mb-4">
              We use collected information for the following purposes:
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6 border border-neural-200">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">
                  3.1 Service Delivery
                </h3>
                <ul className="list-disc pl-6 text-neural-700 space-y-1">
                  <li>Provide access to AI agents and platform features</li>
                  <li>Process your requests and transactions</li>
                  <li>Maintain your account and preferences</li>
                  <li>Deliver personalized AI interactions</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-neural-200">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">
                  3.2 Platform Improvement
                </h3>
                <ul className="list-disc pl-6 text-neural-700 space-y-1">
                  <li>Analyze usage patterns to improve AI accuracy</li>
                  <li>Train and enhance AI models (anonymized data only)</li>
                  <li>Develop new features and services</li>
                  <li>Optimize performance and user experience</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-neural-200">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">
                  3.3 Communication
                </h3>
                <ul className="list-disc pl-6 text-neural-700 space-y-1">
                  <li>Send service updates and notifications</li>
                  <li>Provide customer support</li>
                  <li>Respond to inquiries and requests</li>
                  <li>Send marketing communications (with consent)</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-neural-200">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">
                  3.4 Security & Compliance
                </h3>
                <ul className="list-disc pl-6 text-neural-700 space-y-1">
                  <li>Detect and prevent fraud and abuse</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Comply with legal obligations</li>
                  <li>Protect user safety and platform integrity</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              4. Data Sharing and Disclosure
            </h2>
            <p className="text-neural-700 mb-4">
              We do not sell your personal information. We may share data in the
              following circumstances:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-neural-900">
                  4.1 Service Providers
                </h3>
                <p className="text-neural-700">
                  Third-party vendors who assist with:
                </p>
                <ul className="list-disc pl-6 text-neural-700 space-y-1 mt-2">
                  <li>Payment processing (Stripe, PayPal)</li>
                  <li>Cloud hosting (AWS, Google Cloud)</li>
                  <li>Analytics (Google Analytics)</li>
                  <li>Customer support tools</li>
                  <li>Email delivery services</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-neural-900">
                  4.2 Legal Requirements
                </h3>
                <p className="text-neural-700">When required by law or to:</p>
                <ul className="list-disc pl-6 text-neural-700 space-y-1 mt-2">
                  <li>Comply with legal process or government requests</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Investigate potential violations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-neural-900">
                  4.3 Business Transfers
                </h3>
                <p className="text-neural-700">
                  In the event of a merger, acquisition, or sale of assets, your
                  information may be transferred. We will notify you of any such
                  change.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-neural-900">
                  4.4 With Your Consent
                </h3>
                <p className="text-neural-700">
                  We may share information with third parties when you
                  explicitly consent to such sharing.
                </p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              5. Data Retention
            </h2>
            <p className="text-neural-700 mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Improve our AI models (anonymized data)</li>
            </ul>
            <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-neural-700">
                <strong className="text-neural-900">Retention Periods:</strong>
              </p>
              <ul className="list-disc pl-6 text-neural-700 space-y-1 mt-2">
                <li>
                  Active accounts: Duration of account + 30 days after deletion
                </li>
                <li>
                  Conversation history: 90 days (or until manual deletion)
                </li>
                <li>Payment records: 7 years (tax compliance)</li>
                <li>Analytics data: 26 months</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              6. Your Privacy Rights
            </h2>
            <p className="text-neural-700 mb-4">
              Depending on your location, you may have the following rights:
            </p>

            <div className="grid gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-neural-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  ✓ Right to Access
                </h3>
                <p className="text-neural-600 text-sm">
                  Request a copy of your personal data
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-neural-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  ✓ Right to Rectification
                </h3>
                <p className="text-neural-600 text-sm">
                  Correct inaccurate or incomplete data
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-neural-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  ✓ Right to Erasure
                </h3>
                <p className="text-neural-600 text-sm">
                  Request deletion of your personal data
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-neural-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  ✓ Right to Data Portability
                </h3>
                <p className="text-neural-600 text-sm">
                  Receive your data in a structured, machine-readable format
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-neural-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  ✓ Right to Object
                </h3>
                <p className="text-neural-600 text-sm">
                  Object to processing of your personal data
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-neural-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  ✓ Right to Withdraw Consent
                </h3>
                <p className="text-neural-600 text-sm">
                  Withdraw consent for data processing at any time
                </p>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
              <p className="text-neural-900 font-semibold mb-2">
                How to Exercise Your Rights:
              </p>
              <p className="text-neural-700">
                Email us at{' '}
                <a
                  href="mailto:privacy@onelastai.com"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  privacy@onelastai.com
                </a>{' '}
                or use the privacy controls in your account settings. We will
                respond within 30 days.
              </p>
            </div>
          </section>

          {/* Security */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              7. Data Security
            </h2>
            <p className="text-neural-700 mb-4">
              We implement industry-standard security measures to protect your
              information:
            </p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li>
                <strong className="text-neural-900">Encryption:</strong> TLS/SSL
                encryption for data in transit, AES-256 encryption for data at
                rest
              </li>
              <li>
                <strong className="text-neural-900">Access Controls:</strong>{' '}
                Role-based access, multi-factor authentication
              </li>
              <li>
                <strong className="text-neural-900">Monitoring:</strong> 24/7
                security monitoring and intrusion detection
              </li>
              <li>
                <strong className="text-neural-900">Regular Audits:</strong>{' '}
                Third-party security assessments and penetration testing
              </li>
              <li>
                <strong className="text-neural-900">Data Backup:</strong> Regular
                encrypted backups with disaster recovery
              </li>
              <li>
                <strong className="text-neural-900">Employee Training:</strong>{' '}
                Security awareness and data protection training
              </li>
            </ul>
            <p className="text-neural-500 mt-4 text-sm">
              While we strive to protect your data, no method of transmission
              over the Internet is 100% secure. We cannot guarantee absolute
              security.
            </p>
          </section>

          {/* International Transfers */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              8. International Data Transfers
            </h2>
            <p className="text-neural-700 mb-4">
              As a global platform, we may transfer your data to countries
              outside your residence. We ensure appropriate safeguards are in
              place:
            </p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li>
                Standard Contractual Clauses (SCCs) approved by the European
                Commission
              </li>
              <li>
                Data Processing Agreements with all third-party processors
              </li>
              <li>Adequacy decisions where applicable</li>
              <li>Binding Corporate Rules for intra-group transfers</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              9. Children's Privacy
            </h2>
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <p className="text-neural-700 mb-3">
                <strong className="text-neural-900">Age Restriction:</strong> Our
                services are NOT intended for individuals under 18 years of age.
                We do not knowingly collect personal information from children
                under 18.
              </p>
              <p className="text-neural-700">
                If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us
                immediately at{' '}
                <a
                  href="mailto:privacy@onelastai.com"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  privacy@onelastai.com
                </a>
                . We will delete such information promptly.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              10. Cookies and Tracking
            </h2>
            <p className="text-neural-700 mb-4">
              We use cookies and similar tracking technologies. For detailed
              information, please see our{' '}
              <a
                href="/legal/cookie-policy"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Cookie Policy
              </a>
              .
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              11. Changes to This Policy
            </h2>
            <p className="text-neural-700">
              We may update this Privacy Policy periodically. We will notify you
              of significant changes via email or a prominent notice on our
              platform. Continued use of our services after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-white">
              12. Contact Us
            </h2>
            <div className="space-y-3 text-blue-100">
              <p>
                <strong className="text-white">Data Protection Officer:</strong>
              </p>
              <p>One Last AI Privacy Team</p>
              <p>
                Email:{' '}
                <a
                  href="mailto:privacy@onelastai.com"
                  className="text-white hover:text-blue-200 underline"
                >
                  privacy@onelastai.com
                </a>
              </p>
              <p>
                Support:{' '}
                <a
                  href="mailto:support@onelastai.com"
                  className="text-white hover:text-blue-200 underline"
                >
                  support@onelastai.com
                </a>
              </p>
              <p>
                Website:{' '}
                <a
                  href="https://onelastai.com"
                  className="text-white hover:text-blue-200 underline"
                >
                  https://onelastai.com
                </a>
              </p>

              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-blue-100">
                  <strong className="text-white">EU Representative:</strong> For
                  users in the European Union, you may contact our EU
                  representative regarding data protection matters.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Article Popup */}
      {selectedArticle && (
        <ArticlePopup
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
