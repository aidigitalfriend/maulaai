'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

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
        <div className="flex items-center justify-between p-6 border-b border-neural-200 bg-neural-50">
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
        <div className="p-4 border-t border-neural-200 bg-neural-50">
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

export default function TermsOfServicePage() {
  const [selectedArticle, setSelectedArticle] =
    useState<ArticleReference | null>(null);

  const articles: Record<string, ArticleReference> = {
    dmca: {
      title: 'DMCA (Digital Millennium Copyright Act)',
      content: `The Digital Millennium Copyright Act (DMCA) is a United States copyright law that implements two 1996 treaties of the World Intellectual Property Organization (WIPO).

Key Provisions:
• Safe harbor provisions for online service providers
• Notice and takedown procedures for copyright infringement
• Anti-circumvention provisions
• Protection for technological measures

Notice Requirements:
To file a DMCA takedown notice, you must provide:
• Physical or electronic signature of copyright owner
• Identification of copyrighted work
• Identification of infringing material
• Contact information
• Statement of good faith belief
• Statement of accuracy under penalty of perjury

Our Compliance:
We respond to valid DMCA notices within 24-48 hours and implement a repeat infringer policy.`,
      source: '17 U.S.C. § 512',
    },
    liability: {
      title: 'Limitation of Liability - Section 230',
      content: `Section 230 of the Communications Decency Act provides immunity from liability for providers and users of interactive computer services who publish information provided by third parties.

Key Points:
• "No provider or user of an interactive computer service shall be treated as the publisher or speaker of any information provided by another information content provider."
• Protection applies to:
  - User-generated content
  - Third-party content
  - Moderation decisions
  - Good faith content filtering

Exceptions:
• Federal criminal law
• Intellectual property law
• Communications privacy law

Application to AI Services:
While AI-generated content is novel, platforms generally retain Section 230 protections for user-directed AI outputs.`,
      source: '47 U.S.C. § 230',
    },
    arbitration: {
      title: 'Arbitration and Class Action Waiver',
      content: `Arbitration is a method of dispute resolution where parties agree to resolve disputes outside of court through a neutral third-party arbitrator.

Key Aspects:
• Binding decision by arbitrator
• Limited grounds for appeal
• Generally faster and less expensive than litigation
• Confidential proceedings

Class Action Waiver:
Users agree to resolve disputes on an individual basis and waive the right to participate in class actions or collective proceedings.

Enforceability:
The Federal Arbitration Act (FAA) generally enforces arbitration agreements. However, some jurisdictions may limit enforceability, particularly for consumer contracts.

Opt-Out:
Many services allow users to opt out of arbitration within a specified period (typically 30 days) by sending written notice.`,
      source: '9 U.S.C. §§ 1-16 (Federal Arbitration Act)',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Last updated: November 6, 2025 • Effective Date: November 6, 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="container-custom section-padding max-w-5xl">
        <div className="space-y-12">
          {/* Acceptance */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              1. Acceptance of Terms
            </h2>
            <p className="text-neural-700 leading-relaxed mb-4">
              Welcome to One Last AI. By accessing or using our platform at{' '}
              <a
                href="https://onelastai.co"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                onelastai.co
              </a>
              , you agree to be bound by these Terms of Service ("Terms"), our{' '}
              <a
                href="/legal/privacy-policy"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Privacy Policy
              </a>
              , and all applicable laws and regulations.
            </p>
            <div className="bg-red-50 rounded-xl p-6 border border-red-200 mt-4">
              <div className="flex gap-3">
                <AlertTriangle
                  className="text-red-600 flex-shrink-0 mt-1"
                  size={24}
                />
                <div>
                  <p className="text-neural-900 font-semibold mb-2">
                    Important Notice
                  </p>
                  <p className="text-neural-700">
                    If you do not agree to these Terms, you may not access or
                    use our services. By creating an account or using our
                    platform, you confirm that you are at least 18 years old and
                    have the legal capacity to enter into this agreement.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Service Description */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              2. Service Description
            </h2>
            <p className="text-neural-700 mb-4">
              One Last AI provides a global multi-agent AI platform featuring:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  🤖 AI Agents
                </h3>
                <p className="text-neural-600 text-sm">
                  Specialized AI personalities for various industries and use
                  cases
                </p>
              </div>
              <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  🛠️ Developer Tools
                </h3>
                <p className="text-neural-600 text-sm">
                  Network utilities, WHOIS lookups, domain research, and more
                </p>
              </div>
              <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  🗣️ Voice Interaction
                </h3>
                <p className="text-neural-600 text-sm">
                  Emotional text-to-speech with 15+ voices and mood
                  customization
                </p>
              </div>
              <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  💬 Community Platform
                </h3>
                <p className="text-neural-600 text-sm">
                  Connect with other users, share ideas, and collaborate
                </p>
              </div>
            </div>
            <p className="text-neural-500 mt-4 text-sm">
              We reserve the right to modify, suspend, or discontinue any aspect
              of our services at any time without notice.
            </p>
          </section>

          {/* Pricing & Trial */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              3. Pricing and $1 Daily Trial
            </h2>

            <div className="bg-white rounded-xl p-6 mb-6 border border-blue-200 shadow-sm">
              <h3 className="text-2xl font-bold text-neural-900 mb-3">
                💵 $1 Daily Trial
              </h3>
              <p className="text-neural-700 mb-4">
                New users can access our platform for just{' '}
                <strong className="text-blue-600">$1.00 USD per day</strong>.
                This low-cost trial gives you full access to:
              </p>
              <ul className="list-disc pl-6 text-neural-700 space-y-2">
                <li>All AI agents and personalities</li>
                <li>Developer tools and network utilities</li>
                <li>Voice interaction features</li>
                <li>Community platform access</li>
                <li>API access (rate-limited)</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  3.1 One-Time Purchase Terms
                </h3>
                <ul className="list-disc pl-6 text-neural-700 space-y-2">
                  <li>Access begins immediately upon payment</li>
                  <li>
                    <strong className="text-neural-900">NO auto-renewal</strong> -
                    you're charged only once per purchase
                  </li>
                  <li>You may cancel access at any time (no refund)</li>
                  <li>Choose from $1/day, $5/week, or $15/month per agent</li>
                  <li>
                    Access expires automatically at the end of your chosen
                    period
                  </li>
                  <li>Re-purchase anytime to continue access</li>
                  <li>All prices in USD unless otherwise stated</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  3.2 Payment Methods
                </h3>
                <p className="text-neural-700 mb-2">We accept:</p>
                <ul className="list-disc pl-6 text-neural-700 space-y-1">
                  <li>
                    Credit/Debit cards (Visa, MasterCard, American Express)
                  </li>
                  <li>PayPal</li>
                  <li>Other payment methods as available</li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-xl font-semibold mb-3 text-amber-700">
                  3.3 No Refund Policy
                </h3>
                <p className="text-neural-700 mb-3">
                  <strong className="text-neural-900">
                    All payments are final and non-refundable.
                  </strong>{' '}
                  Given the low-cost nature of our service ($1 per day) and
                  immediate access to platform features, we do not offer refunds
                  for any reason.
                </p>
                <p className="text-neural-700">
                  For detailed refund policy information, see our{' '}
                  <a
                    href="/legal/payments-refunds"
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Payments & Refunds Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Account Responsibilities */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              4. Account Responsibilities
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  4.1 Account Security
                </h3>
                <p className="text-neural-700 mb-2">You are responsible for:</p>
                <ul className="list-disc pl-6 text-neural-700 space-y-2">
                  <li>Maintaining the confidentiality of your password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of unauthorized access</li>
                  <li>
                    Ensuring your account information is accurate and current
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  4.2 Age Requirement
                </h3>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <p className="text-neural-700">
                    You must be at least{' '}
                    <strong className="text-neural-900">18 years old</strong> to
                    create an account and use our services. We do not knowingly
                    collect information from minors.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  4.3 Account Termination
                </h3>
                <p className="text-neural-700">
                  We may suspend or terminate your account if you:
                </p>
                <ul className="list-disc pl-6 text-neural-700 space-y-1 mt-2">
                  <li>Violate these Terms of Service</li>
                  <li>Engage in fraudulent or illegal activity</li>
                  <li>Abuse or misuse our services</li>
                  <li>Provide false or misleading information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              5. Acceptable Use Policy
            </h2>
            <p className="text-neural-700 mb-4">You agree NOT to:</p>

            <div className="space-y-3">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-neural-700">
                  ❌ Use our services for illegal purposes or to violate any
                  laws
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-neural-700">
                  ❌ Harass, abuse, threaten, or harm others
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-neural-700">
                  ❌ Generate or distribute malicious content, malware, or spam
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-neural-700">
                  ❌ Attempt to hack, reverse engineer, or compromise our
                  systems
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-neural-700">
                  ❌ Scrape, crawl, or collect data without authorization
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-neural-700">
                  ❌ Impersonate others or provide false information
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-neural-700">
                  ❌ Share account credentials or resell access
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-neural-700">
                  ❌ Generate content that infringes intellectual property
                  rights
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-neural-700">
                  ❌ Use services to create deepfakes or misleading content
                  without disclosure
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-neural-700">
                  ❌ Overload our systems or interfere with other users' access
                </p>
              </div>
            </div>

            <p className="text-neural-500 mt-4 text-sm">
              Violation of this policy may result in immediate account
              suspension or termination without refund.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              6. Intellectual Property Rights
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  6.1 Our IP
                </h3>
                <p className="text-neural-700 mb-2">
                  All platform content, features, and functionality are owned by
                  One Last AI and protected by:
                </p>
                <ul className="list-disc pl-6 text-neural-700 space-y-1">
                  <li>Copyright laws</li>
                  <li>Trademark laws</li>
                  <li>Patent laws</li>
                  <li>Trade secret laws</li>
                  <li>Other intellectual property rights</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  6.2 Your Content
                </h3>
                <p className="text-neural-700 mb-2">
                  You retain ownership of content you submit. By using our
                  services, you grant us:
                </p>
                <ul className="list-disc pl-6 text-neural-700 space-y-2">
                  <li>
                    A worldwide, non-exclusive license to use your content to
                    provide services
                  </li>
                  <li>Right to store, process, and transmit your content</li>
                  <li>
                    Right to use anonymized/aggregated data for AI training
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  6.3 AI-Generated Content
                </h3>
                <p className="text-neural-700 mb-2">
                  Content generated by our AI agents:
                </p>
                <ul className="list-disc pl-6 text-neural-700 space-y-2">
                  <li>
                    You receive a non-exclusive license to use AI-generated
                    outputs
                  </li>
                  <li>
                    We do not claim ownership of AI-generated content you create
                  </li>
                  <li>
                    You are responsible for ensuring outputs comply with
                    applicable laws
                  </li>
                  <li>
                    We do not guarantee outputs are free from third-party IP
                    claims
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  6.4 DMCA Compliance
                </h3>
                <p className="text-neural-700 mb-3">
                  We respect intellectual property rights and comply with the{' '}
                  <button
                    onClick={() => setSelectedArticle(articles.dmca)}
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Digital Millennium Copyright Act (DMCA)
                  </button>
                  .
                </p>
                <p className="text-neural-700">
                  To file a copyright infringement notice, email:{' '}
                  <a
                    href="mailto:dmca@onelastai.co"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    dmca@onelastai.co
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              7. Disclaimers and Limitations
            </h2>

            <div className="space-y-4">
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-xl font-semibold mb-3 text-amber-700">
                  7.1 "As Is" Service
                </h3>
                <p className="text-neural-700 mb-2">
                  OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                  WARRANTIES OF ANY KIND, INCLUDING:
                </p>
                <ul className="list-disc pl-6 text-neural-700 space-y-1">
                  <li>
                    Accuracy, reliability, or completeness of AI-generated
                    content
                  </li>
                  <li>Uninterrupted or error-free operation</li>
                  <li>Security of data transmission</li>
                  <li>Fitness for a particular purpose</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  7.2 AI Limitations
                </h3>
                <p className="text-neural-700">
                  AI systems may produce inaccurate, biased, or inappropriate
                  outputs. You acknowledge that:
                </p>
                <ul className="list-disc pl-6 text-neural-700 space-y-2 mt-2">
                  <li>AI responses may contain errors or hallucinations</li>
                  <li>You should verify important information independently</li>
                  <li>
                    AI should not replace professional advice (legal, medical,
                    financial)
                  </li>
                  <li>
                    We are not responsible for decisions based on AI outputs
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  7.3 Limitation of Liability
                </h3>
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <p className="text-neural-700 mb-3">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, ONE LAST AI SHALL
                    NOT BE LIABLE FOR:
                  </p>
                  <ul className="list-disc pl-6 text-neural-700 space-y-2">
                    <li>
                      Indirect, incidental, special, consequential, or punitive
                      damages
                    </li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>
                      Damages exceeding the amount you paid us in the past 12
                      months
                    </li>
                    <li>Third-party actions or content</li>
                  </ul>
                  <p className="text-neural-700 mt-4">
                    See{' '}
                    <button
                      onClick={() => setSelectedArticle(articles.liability)}
                      className="text-blue-600 hover:text-blue-700 underline font-medium"
                    >
                      Section 230 Protections
                    </button>{' '}
                    for legal framework.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              8. Dispute Resolution
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  8.1 Informal Resolution
                </h3>
                <p className="text-neural-700">
                  Before filing a claim, please contact us at{' '}
                  <a
                    href="mailto:legal@onelastai.co"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    legal@onelastai.co
                  </a>{' '}
                  to attempt informal resolution.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  8.2 Binding Arbitration
                </h3>
                <p className="text-neural-700 mb-3">
                  Any disputes arising from these Terms or our services shall be
                  resolved through binding{' '}
                  <button
                    onClick={() => setSelectedArticle(articles.arbitration)}
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    arbitration
                  </button>
                  , not in court.
                </p>
                <ul className="list-disc pl-6 text-neural-700 space-y-2">
                  <li>
                    Arbitration under American Arbitration Association (AAA)
                    rules
                  </li>
                  <li>Individual basis only (no class actions)</li>
                  <li>Conducted remotely or in your jurisdiction</li>
                  <li>You may opt out within 30 days by written notice</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  8.3 Governing Law
                </h3>
                <p className="text-neural-700">
                  These Terms are governed by the laws of [Your Jurisdiction],
                  without regard to conflict of law principles.
                </p>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              9. Changes to Terms
            </h2>
            <p className="text-neural-700 mb-3">
              We may update these Terms periodically. Significant changes will
              be communicated via:
            </p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li>Email notification</li>
              <li>Prominent platform notice</li>
              <li>Updated "Last Modified" date</li>
            </ul>
            <p className="text-neural-700 mt-4">
              Continued use after changes constitutes acceptance of updated
              Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-white">
              10. Contact Information
            </h2>
            <div className="space-y-3 text-blue-100">
              <p>
                <strong className="text-white">
                  One Last AI Legal Department
                </strong>
              </p>
              <p>
                Email:{' '}
                <a
                  href="mailto:legal@onelastai.co"
                  className="text-white hover:text-blue-200 underline"
                >
                  legal@onelastai.co
                </a>
              </p>
              <p>
                Support:{' '}
                <a
                  href="mailto:support@onelastai.co"
                  className="text-white hover:text-blue-200 underline"
                >
                  support@onelastai.co
                </a>
              </p>
              <p>
                DMCA:{' '}
                <a
                  href="mailto:dmca@onelastai.co"
                  className="text-white hover:text-blue-200 underline"
                >
                  dmca@onelastai.co
                </a>
              </p>
              <p>
                Website:{' '}
                <a
                  href="https://onelastai.co"
                  className="text-white hover:text-blue-200 underline"
                >
                  https://onelastai.co
                </a>
              </p>
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
