'use client';

import { useState } from 'react';
import { X, Cookie, Settings, Shield, Eye } from 'lucide-react';

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

export default function CookiePolicyPage() {
  const [selectedArticle, setSelectedArticle] =
    useState<ArticleReference | null>(null);

  const articles: Record<string, ArticleReference> = {
    ePrivacy: {
      title: 'ePrivacy Directive (Cookie Law)',
      content: `The ePrivacy Directive (2002/58/EC), often called the "Cookie Law," regulates the use of cookies and similar tracking technologies in the European Union.

Key Requirements:
• Prior informed consent required for non-essential cookies
• Clear and comprehensive information about cookie use
• Users must be able to refuse cookies
• Consent must be freely given, specific, informed, and unambiguous

Cookie Categories:
1. Strictly Necessary: No consent required (essential for site operation)
2. Performance/Analytics: Consent required (track usage patterns)
3. Functional: Consent required (remember preferences)
4. Targeting/Advertising: Consent required (personalized ads)

Penalties:
Non-compliance can result in fines up to €20 million or 4% of global annual revenue under GDPR enforcement.`,
      source: 'Directive 2002/58/EC (as amended by Directive 2009/136/EC)',
    },
    ccpaOptOut: {
      title: 'CCPA Cookie Opt-Out Rights',
      content: `The California Consumer Privacy Act (CCPA) provides specific rights regarding cookies and tracking technologies.

Consumer Rights:
• Right to know what personal information is collected via cookies
• Right to know if personal information is sold or shared
• Right to opt-out of the sale of personal information
• Right to non-discrimination for exercising privacy rights

"Do Not Sell My Personal Information" Link:
Businesses must provide a clear and conspicuous link on their homepage titled "Do Not Sell My Personal Information" that enables consumers to opt-out of the sale of their data.

Cookie Disclosure Requirements:
• Disclose categories of personal information collected via cookies
• Disclose third parties with whom information is shared
• Provide opt-out mechanisms for non-essential cookies
• Honor Global Privacy Control (GPC) signals

Enforcement:
The California Privacy Protection Agency (CPPA) can impose fines of up to $7,500 per intentional violation.`,
      source: 'California Civil Code § 1798.100 et seq.',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="container-custom section-padding max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
            Cookie Policy
          </h1>
          <p className="text-blue-100 text-lg">
            Last updated: November 6, 2025
          </p>
          <p className="text-blue-100 mt-2">
            Effective Date: November 6, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom section-padding max-w-5xl">
        <div className="space-y-12">
          {/* Introduction */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <div className="flex items-start gap-4 mb-4">
              <Cookie className="text-blue-600 flex-shrink-0 mt-1" size={36} />
              <div>
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  1. Introduction
                </h2>
                <p className="text-neural-700 leading-relaxed mb-4">
                  This Cookie Policy explains how One Last AI ("we," "our," or
                  "us") uses cookies and similar tracking technologies on our
                  website at{' '}
                  <a
                    href="https://onelastai.co"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    onelastai.co
                  </a>
                  .
                </p>
                <p className="text-neural-700 leading-relaxed">
                  By using our website, you consent to our use of cookies in
                  accordance with this policy and our{' '}
                  <a
                    href="/legal/privacy-policy"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Privacy Policy
                  </a>
                  . You can manage your cookie preferences at any time.
                </p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mt-6">
              <p className="text-neural-700">
                <strong className="text-neural-900">Legal Framework:</strong> Our
                cookie practices comply with the{' '}
                <button
                  onClick={() => setSelectedArticle(articles.ePrivacy)}
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  ePrivacy Directive (EU Cookie Law)
                </button>
                , GDPR, and{' '}
                <button
                  onClick={() => setSelectedArticle(articles.ccpaOptOut)}
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  CCPA requirements
                </button>
                .
              </p>
            </div>
          </section>

          {/* What Are Cookies */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              2. What Are Cookies?
            </h2>
            <p className="text-neural-700 mb-4">
              Cookies are small text files stored on your device when you visit
              a website. They help websites:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                <p className="font-semibold text-blue-700 mb-2">
                  📝 Remember You
                </p>
                <p className="text-neural-600 text-sm">
                  Store login status and preferences
                </p>
              </div>
              <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                <p className="font-semibold text-blue-700 mb-2">
                  📊 Analyze Usage
                </p>
                <p className="text-neural-600 text-sm">
                  Track how visitors use the site
                </p>
              </div>
              <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                <p className="font-semibold text-blue-700 mb-2">
                  ⚡ Improve Performance
                </p>
                <p className="text-neural-600 text-sm">
                  Optimize loading times and functionality
                </p>
              </div>
              <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                <p className="font-semibold text-blue-700 mb-2">
                  🎯 Personalize Experience
                </p>
                <p className="text-neural-600 text-sm">
                  Customize content and features
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  Cookie Types by Duration
                </h3>
                <div className="space-y-3">
                  <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                    <p className="font-semibold text-neural-900 mb-2">
                      Session Cookies
                    </p>
                    <p className="text-neural-600 text-sm">
                      Temporary cookies deleted when you close your browser.
                      Used for essential site functions.
                    </p>
                  </div>
                  <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                    <p className="font-semibold text-neural-900 mb-2">
                      Persistent Cookies
                    </p>
                    <p className="text-neural-600 text-sm">
                      Remain on your device until expiration or manual deletion.
                      Remember preferences between visits.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  Cookie Types by Source
                </h3>
                <div className="space-y-3">
                  <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                    <p className="font-semibold text-neural-900 mb-2">
                      First-Party Cookies
                    </p>
                    <p className="text-neural-600 text-sm">
                      Set by One Last AI directly. We have full control over
                      these cookies.
                    </p>
                  </div>
                  <div className="bg-neural-50 rounded-xl p-4 border border-neural-200">
                    <p className="font-semibold text-neural-900 mb-2">
                      Third-Party Cookies
                    </p>
                    <p className="text-neural-600 text-sm">
                      Set by external services (e.g., Google Analytics). Subject
                      to third-party privacy policies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies We Use */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              3. Cookies We Use
            </h2>

            <div className="space-y-6">
              {/* Strictly Necessary */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-start gap-3 mb-4">
                  <Shield
                    className="text-green-600 flex-shrink-0 mt-1"
                    size={28}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-neural-900 mb-2">
                      3.1 Strictly Necessary Cookies
                    </h3>
                    <p className="text-neural-600 text-sm">
                      These cookies are essential for the website to function.
                      We do not need your consent for these.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-green-100">
                      <tr className="border-b border-green-200">
                        <th className="text-left p-3 text-neural-900">
                          Cookie Name
                        </th>
                        <th className="text-left p-3 text-neural-900">Purpose</th>
                        <th className="text-left p-3 text-neural-900">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-neural-700">
                      <tr className="border-b border-green-100">
                        <td className="p-3 font-mono text-xs">session_token</td>
                        <td className="p-3">Maintains your login session</td>
                        <td className="p-3">Session</td>
                      </tr>
                      <tr className="border-b border-green-100">
                        <td className="p-3 font-mono text-xs">csrf_token</td>
                        <td className="p-3">
                          Prevents cross-site request forgery
                        </td>
                        <td className="p-3">Session</td>
                      </tr>
                      <tr className="border-b border-green-100">
                        <td className="p-3 font-mono text-xs">
                          cookie_consent
                        </td>
                        <td className="p-3">Stores your cookie preferences</td>
                        <td className="p-3">1 year</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-xs">load_balancer</td>
                        <td className="p-3">
                          Routes requests to correct server
                        </td>
                        <td className="p-3">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance/Analytics */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-3 mb-4">
                  <Eye className="text-blue-600 flex-shrink-0 mt-1" size={28} />
                  <div>
                    <h3 className="text-xl font-bold text-neural-900 mb-2">
                      3.2 Performance & Analytics Cookies
                    </h3>
                    <p className="text-neural-600 text-sm">
                      Help us understand how visitors use our site. We need your
                      consent for these.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <h4 className="font-semibold text-neural-900 mb-2">
                      Google Analytics
                    </h4>
                    <p className="text-neural-600 text-sm mb-3">
                      We use Google Analytics to track website usage, visitor
                      demographics, and traffic sources.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-blue-100">
                          <tr className="border-b border-blue-200">
                            <th className="text-left p-2 text-neural-900">Cookie</th>
                            <th className="text-left p-2 text-neural-900">
                              Purpose
                            </th>
                            <th className="text-left p-2 text-neural-900">
                              Duration
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-neural-700">
                          <tr className="border-b border-blue-100">
                            <td className="p-2 font-mono">_ga</td>
                            <td className="p-2">
                              Distinguishes unique visitors
                            </td>
                            <td className="p-2">2 years</td>
                          </tr>
                          <tr className="border-b border-blue-100">
                            <td className="p-2 font-mono">_gid</td>
                            <td className="p-2">
                              Distinguishes users for 24 hours
                            </td>
                            <td className="p-2">24 hours</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono">_gat</td>
                            <td className="p-2">Throttles request rate</td>
                            <td className="p-2">1 minute</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-neural-500 text-xs mt-3">
                      Data is anonymized. See{' '}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Google's Privacy Policy
                      </a>
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <h4 className="font-semibold text-neural-900 mb-2">
                      Performance Monitoring
                    </h4>
                    <p className="text-neural-600 text-sm mb-3">
                      Track page load times, API response times, and errors to
                      improve service quality.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-blue-100">
                          <tr className="border-b border-blue-200">
                            <th className="text-left p-2 text-neural-900">Cookie</th>
                            <th className="text-left p-2 text-neural-900">
                              Purpose
                            </th>
                            <th className="text-left p-2 text-neural-900">
                              Duration
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-neural-700">
                          <tr>
                            <td className="p-2 font-mono">perf_metrics</td>
                            <td className="p-2">
                              Stores performance timing data
                            </td>
                            <td className="p-2">7 days</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-start gap-3 mb-4">
                  <Settings
                    className="text-purple-600 flex-shrink-0 mt-1"
                    size={28}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-neural-900 mb-2">
                      3.3 Functional Cookies
                    </h3>
                    <p className="text-neural-600 text-sm">
                      Remember your preferences and provide enhanced features.
                      Consent required.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-purple-100">
                      <tr className="border-b border-purple-200">
                        <th className="text-left p-3 text-neural-900">
                          Cookie Name
                        </th>
                        <th className="text-left p-3 text-neural-900">Purpose</th>
                        <th className="text-left p-3 text-neural-900">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-neural-700">
                      <tr className="border-b border-purple-100">
                        <td className="p-3 font-mono text-xs">
                          theme_preference
                        </td>
                        <td className="p-3">
                          Remembers dark/light mode choice
                        </td>
                        <td className="p-3">1 year</td>
                      </tr>
                      <tr className="border-b border-purple-100">
                        <td className="p-3 font-mono text-xs">language</td>
                        <td className="p-3">Stores preferred language</td>
                        <td className="p-3">1 year</td>
                      </tr>
                      <tr className="border-b border-purple-100">
                        <td className="p-3 font-mono text-xs">
                          agent_preferences
                        </td>
                        <td className="p-3">Saves favorite AI agents</td>
                        <td className="p-3">6 months</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-xs">
                          voice_settings
                        </td>
                        <td className="p-3">
                          Remembers voice interaction preferences
                        </td>
                        <td className="p-3">6 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              4. Third-Party Services
            </h2>
            <p className="text-neural-700 mb-4">
              We integrate the following third-party services that may set
              cookies:
            </p>

            <div className="space-y-4">
              <div className="bg-neural-50 rounded-xl p-6 border border-neural-200">
                <h3 className="text-lg font-semibold text-neural-900 mb-3">
                  Google Analytics
                </h3>
                <p className="text-neural-600 text-sm mb-2">
                  Website analytics and visitor insights
                </p>
                <p className="text-neural-500 text-xs">
                  Privacy Policy:{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    policies.google.com/privacy
                  </a>
                </p>
                <p className="text-neural-500 text-xs mt-1">
                  Opt-out:{' '}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Browser Add-on
                  </a>
                </p>
              </div>

              <div className="bg-neural-50 rounded-xl p-6 border border-neural-200">
                <h3 className="text-lg font-semibold text-neural-900 mb-3">
                  Payment Processors (Stripe, PayPal)
                </h3>
                <p className="text-neural-600 text-sm mb-2">
                  Secure payment processing and fraud prevention
                </p>
                <p className="text-neural-500 text-xs">
                  Stripe Privacy:{' '}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    stripe.com/privacy
                  </a>
                </p>
                <p className="text-neural-500 text-xs mt-1">
                  PayPal Privacy:{' '}
                  <a
                    href="https://www.paypal.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    paypal.com/privacy
                  </a>
                </p>
              </div>

              <div className="bg-neural-50 rounded-xl p-6 border border-neural-200">
                <h3 className="text-lg font-semibold text-neural-900 mb-3">
                  Cloudflare
                </h3>
                <p className="text-neural-600 text-sm mb-2">
                  CDN, DDoS protection, and performance optimization
                </p>
                <p className="text-neural-500 text-xs">
                  Privacy Policy:{' '}
                  <a
                    href="https://www.cloudflare.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    cloudflare.com/privacy
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              5. Managing Your Cookie Preferences
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  5.1 Cookie Settings on Our Site
                </h3>
                <p className="text-neural-700 mb-3">
                  You can manage your cookie preferences at any time:
                </p>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <button className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    Open Cookie Preferences
                  </button>
                  <p className="text-neural-600 text-sm mt-3">
                    Adjust settings for analytics, functional, and other
                    non-essential cookies
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  5.2 Browser Settings
                </h3>
                <p className="text-neural-700 mb-3">
                  Most browsers allow you to control cookies through settings:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-neural-50 rounded-lg p-4 border border-neural-200">
                    <p className="font-semibold text-neural-900 mb-2">
                      Google Chrome
                    </p>
                    <p className="text-neural-600 text-sm">
                      Settings → Privacy and Security → Cookies
                    </p>
                  </div>
                  <div className="bg-neural-50 rounded-lg p-4 border border-neural-200">
                    <p className="font-semibold text-neural-900 mb-2">
                      Mozilla Firefox
                    </p>
                    <p className="text-neural-600 text-sm">
                      Options → Privacy & Security → Cookies
                    </p>
                  </div>
                  <div className="bg-neural-50 rounded-lg p-4 border border-neural-200">
                    <p className="font-semibold text-neural-900 mb-2">Safari</p>
                    <p className="text-neural-600 text-sm">
                      Preferences → Privacy → Cookies
                    </p>
                  </div>
                  <div className="bg-neural-50 rounded-lg p-4 border border-neural-200">
                    <p className="font-semibold text-neural-900 mb-2">
                      Microsoft Edge
                    </p>
                    <p className="text-neural-600 text-sm">
                      Settings → Privacy → Cookies
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neural-900">
                  5.3 Opt-Out Tools
                </h3>
                <ul className="list-disc pl-6 text-neural-700 space-y-2">
                  <li>
                    <strong className="text-neural-900">Google Analytics:</strong>{' '}
                    <a
                      href="https://tools.google.com/dlpage/gaoptout"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Browser Add-on
                    </a>
                  </li>
                  <li>
                    <strong className="text-neural-900">Do Not Track (DNT):</strong>{' '}
                    Enable in browser settings (we honor DNT signals)
                  </li>
                  <li>
                    <strong className="text-neural-900">
                      Global Privacy Control:
                    </strong>{' '}
                    <a
                      href="https://globalprivacycontrol.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Learn more
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <p className="text-neural-700">
                  <strong className="text-neural-900">Important:</strong> Blocking
                  strictly necessary cookies may prevent you from using
                  essential features of our platform, including login and
                  account management.
                </p>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section className="bg-white rounded-2xl p-8 border border-neural-200 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              6. Updates to This Policy
            </h2>
            <p className="text-neural-700">
              We may update this Cookie Policy from time to time to reflect
              changes in our practices or for legal compliance. Updates will be
              posted on this page with a new "Last Updated" date. Significant
              changes will be communicated via email or platform notification.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-white">
              7. Contact Us About Cookies
            </h2>
            <div className="space-y-3 text-blue-100">
              <p>
                <strong className="text-white">Cookie Questions:</strong>
              </p>
              <p>
                Email:{' '}
                <a
                  href="mailto:privacy@onelastai.co"
                  className="text-white hover:text-blue-200 underline"
                >
                  privacy@onelastai.co
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
