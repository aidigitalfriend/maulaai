'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface ArticleReference {
  title: string
  content: string
  source: string
}

export default function TermsOfServicePage() {
  const [selectedArticle, setSelectedArticle] = useState<ArticleReference | null>(null)

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
      source: '17 U.S.C. § 512'
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
      source: '47 U.S.C. § 230'
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
      source: '9 U.S.C. §§ 1-16 (Federal Arbitration Act)'
    }
  }

  const ArticlePopup = ({ article }: { article: ArticleReference }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-brand-500/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neural-700/50 bg-neural-800/50">
          <h3 className="text-xl font-bold text-white">{article.title}</h3>
          <button
            onClick={() => setSelectedArticle(null)}
            className="p-2 hover:bg-neural-700/50 rounded-lg transition-colors text-neural-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-neural-200 whitespace-pre-line leading-relaxed">
            {article.content}
          </div>
          <div className="pt-4 border-t border-neural-700/50">
            <p className="text-sm text-brand-400 font-medium">Source: {article.source}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neural-700/50 bg-neural-800/50">
          <button
            onClick={() => setSelectedArticle(null)}
            className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600/20 to-accent-600/20 border-b border-brand-500/20">
        <div className="container-custom section-padding max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-neural-400 text-lg">Last updated: November 6, 2025</p>
          <p className="text-neural-300 mt-2">Effective Date: November 6, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom section-padding max-w-5xl">
        <div className="space-y-12">
          {/* Acceptance */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-4 text-brand-400">1. Acceptance of Terms</h2>
            <p className="text-neural-200 leading-relaxed mb-4">
              Welcome to One Last AI. By accessing or using our platform at{' '}
              <a href="https://onelastai.co" className="text-brand-400 hover:text-brand-300 underline">onelastai.co</a>, 
              you agree to be bound by these Terms of Service ("Terms"), our{' '}
              <a href="/legal/privacy-policy" className="text-brand-400 hover:text-brand-300 underline">Privacy Policy</a>, 
              and all applicable laws and regulations.
            </p>
            <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/30 mt-4">
              <div className="flex gap-3">
                <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="text-white font-semibold mb-2">Important Notice</p>
                  <p className="text-neural-200">
                    If you do not agree to these Terms, you may not access or use our services. By creating an account 
                    or using our platform, you confirm that you are at least 18 years old and have the legal capacity 
                    to enter into this agreement.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Service Description */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">2. Service Description</h2>
            <p className="text-neural-200 mb-4">
              One Last AI provides a global multi-agent AI platform featuring:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                <h3 className="font-semibold text-brand-300 mb-2">🤖 AI Agents</h3>
                <p className="text-neural-200 text-sm">Specialized AI personalities for various industries and use cases</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                <h3 className="font-semibold text-brand-300 mb-2">🛠️ Developer Tools</h3>
                <p className="text-neural-200 text-sm">Network utilities, WHOIS lookups, domain research, and more</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                <h3 className="font-semibold text-brand-300 mb-2">🗣️ Voice Interaction</h3>
                <p className="text-neural-200 text-sm">Emotional text-to-speech with 15+ voices and mood customization</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                <h3 className="font-semibold text-brand-300 mb-2">💬 Community Platform</h3>
                <p className="text-neural-200 text-sm">Connect with other users, share ideas, and collaborate</p>
              </div>
            </div>
            <p className="text-neural-300 mt-4 text-sm">
              We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without notice.
            </p>
          </section>

          {/* Pricing & Trial */}
          <section className="bg-gradient-to-br from-brand-900/30 to-accent-900/30 rounded-2xl p-8 border border-brand-500/30">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">3. Pricing and $1 Daily Trial</h2>
            
            <div className="bg-neural-900/70 rounded-xl p-6 mb-6 border border-brand-500/20">
              <h3 className="text-2xl font-bold text-white mb-3">💵 $1 Daily Trial</h3>
              <p className="text-neural-200 mb-4">
                New users can access our platform for just <strong className="text-brand-400">$1.00 USD per day</strong>. 
                This low-cost trial gives you full access to:
              </p>
              <ul className="list-disc pl-6 text-neural-200 space-y-2">
                <li>All AI agents and personalities</li>
                <li>Developer tools and network utilities</li>
                <li>Voice interaction features</li>
                <li>Community platform access</li>
                <li>API access (rate-limited)</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">3.1 Billing Terms</h3>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>Trial begins immediately upon payment</li>
                  <li>Automatic daily billing unless cancelled</li>
                  <li>You may cancel at any time</li>
                  <li>Access continues through the paid day after cancellation</li>
                  <li>All prices in USD unless otherwise stated</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">3.2 Payment Methods</h3>
                <p className="text-neural-200 mb-2">We accept:</p>
                <ul className="list-disc pl-6 text-neural-200 space-y-1">
                  <li>Credit/Debit cards (Visa, MasterCard, American Express)</li>
                  <li>PayPal</li>
                  <li>Other payment methods as available</li>
                </ul>
              </div>

              <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-500/30">
                <h3 className="text-xl font-semibold mb-3 text-amber-400">3.3 No Refund Policy</h3>
                <p className="text-neural-200 mb-3">
                  <strong className="text-white">All payments are final and non-refundable.</strong> Given the low-cost 
                  nature of our service ($1 per day) and immediate access to platform features, we do not offer refunds 
                  for any reason.
                </p>
                <p className="text-neural-200">
                  For detailed refund policy information, see our{' '}
                  <a href="/legal/payments-refunds" className="text-brand-400 hover:text-brand-300 underline font-medium">
                    Payments & Refunds Policy
                  </a>.
                </p>
              </div>
            </div>
          </section>

          {/* Account Responsibilities */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">4. Account Responsibilities</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">4.1 Account Security</h3>
                <p className="text-neural-200 mb-2">You are responsible for:</p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>Maintaining the confidentiality of your password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of unauthorized access</li>
                  <li>Ensuring your account information is accurate and current</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">4.2 Age Requirement</h3>
                <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
                  <p className="text-neural-200">
                    You must be at least <strong className="text-white">18 years old</strong> to create an account and 
                    use our services. We do not knowingly collect information from minors.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">4.3 Account Termination</h3>
                <p className="text-neural-200">We may suspend or terminate your account if you:</p>
                <ul className="list-disc pl-6 text-neural-200 space-y-1 mt-2">
                  <li>Violate these Terms of Service</li>
                  <li>Engage in fraudulent or illegal activity</li>
                  <li>Abuse or misuse our services</li>
                  <li>Provide false or misleading information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">5. Acceptable Use Policy</h2>
            <p className="text-neural-200 mb-4">You agree NOT to:</p>
            
            <div className="space-y-3">
              <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/20">
                <p className="text-neural-200">❌ Use our services for illegal purposes or to violate any laws</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/20">
                <p className="text-neural-200">❌ Harass, abuse, threaten, or harm others</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/20">
                <p className="text-neural-200">❌ Generate or distribute malicious content, malware, or spam</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/20">
                <p className="text-neural-200">❌ Attempt to hack, reverse engineer, or compromise our systems</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/20">
                <p className="text-neural-200">❌ Scrape, crawl, or collect data without authorization</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/20">
                <p className="text-neural-200">❌ Impersonate others or provide false information</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/20">
                <p className="text-neural-200">❌ Share account credentials or resell access</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/20">
                <p className="text-neural-200">❌ Generate content that infringes intellectual property rights</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/20">
                <p className="text-neural-200">❌ Use services to create deepfakes or misleading content without disclosure</p>
              </div>
              <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/20">
                <p className="text-neural-200">❌ Overload our systems or interfere with other users' access</p>
              </div>
            </div>

            <p className="text-neural-300 mt-4 text-sm">
              Violation of this policy may result in immediate account suspension or termination without refund.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">6. Intellectual Property Rights</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">6.1 Our IP</h3>
                <p className="text-neural-200 mb-2">
                  All platform content, features, and functionality are owned by One Last AI and protected by:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-1">
                  <li>Copyright laws</li>
                  <li>Trademark laws</li>
                  <li>Patent laws</li>
                  <li>Trade secret laws</li>
                  <li>Other intellectual property rights</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">6.2 Your Content</h3>
                <p className="text-neural-200 mb-2">
                  You retain ownership of content you submit. By using our services, you grant us:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>A worldwide, non-exclusive license to use your content to provide services</li>
                  <li>Right to store, process, and transmit your content</li>
                  <li>Right to use anonymized/aggregated data for AI training</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">6.3 AI-Generated Content</h3>
                <p className="text-neural-200 mb-2">
                  Content generated by our AI agents:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>You receive a non-exclusive license to use AI-generated outputs</li>
                  <li>We do not claim ownership of AI-generated content you create</li>
                  <li>You are responsible for ensuring outputs comply with applicable laws</li>
                  <li>We do not guarantee outputs are free from third-party IP claims</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">6.4 DMCA Compliance</h3>
                <p className="text-neural-200 mb-3">
                  We respect intellectual property rights and comply with the{' '}
                  <button
                    onClick={() => setSelectedArticle(articles.dmca)}
                    className="text-brand-400 hover:text-brand-300 underline font-medium"
                  >
                    Digital Millennium Copyright Act (DMCA)
                  </button>.
                </p>
                <p className="text-neural-200">
                  To file a copyright infringement notice, email:{' '}
                  <a href="mailto:dmca@onelastai.co" className="text-brand-400 hover:text-brand-300 underline">
                    dmca@onelastai.co
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">7. Disclaimers and Limitations</h2>
            
            <div className="space-y-4">
              <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-500/30">
                <h3 className="text-xl font-semibold mb-3 text-amber-400">7.1 "As Is" Service</h3>
                <p className="text-neural-200 mb-2">
                  OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, INCLUDING:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-1">
                  <li>Accuracy, reliability, or completeness of AI-generated content</li>
                  <li>Uninterrupted or error-free operation</li>
                  <li>Security of data transmission</li>
                  <li>Fitness for a particular purpose</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">7.2 AI Limitations</h3>
                <p className="text-neural-200">
                  AI systems may produce inaccurate, biased, or inappropriate outputs. You acknowledge that:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2 mt-2">
                  <li>AI responses may contain errors or hallucinations</li>
                  <li>You should verify important information independently</li>
                  <li>AI should not replace professional advice (legal, medical, financial)</li>
                  <li>We are not responsible for decisions based on AI outputs</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">7.3 Limitation of Liability</h3>
                <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/30">
                  <p className="text-neural-200 mb-3">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, ONE LAST AI SHALL NOT BE LIABLE FOR:
                  </p>
                  <ul className="list-disc pl-6 text-neural-200 space-y-2">
                    <li>Indirect, incidental, special, consequential, or punitive damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Damages exceeding the amount you paid us in the past 12 months</li>
                    <li>Third-party actions or content</li>
                  </ul>
                  <p className="text-neural-200 mt-4">
                    See{' '}
                    <button
                      onClick={() => setSelectedArticle(articles.liability)}
                      className="text-brand-400 hover:text-brand-300 underline font-medium"
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
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">8. Dispute Resolution</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">8.1 Informal Resolution</h3>
                <p className="text-neural-200">
                  Before filing a claim, please contact us at{' '}
                  <a href="mailto:legal@onelastai.co" className="text-brand-400 hover:text-brand-300 underline">
                    legal@onelastai.co
                  </a>{' '}
                  to attempt informal resolution.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">8.2 Binding Arbitration</h3>
                <p className="text-neural-200 mb-3">
                  Any disputes arising from these Terms or our services shall be resolved through binding{' '}
                  <button
                    onClick={() => setSelectedArticle(articles.arbitration)}
                    className="text-brand-400 hover:text-brand-300 underline font-medium"
                  >
                    arbitration
                  </button>, not in court.
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>Arbitration under American Arbitration Association (AAA) rules</li>
                  <li>Individual basis only (no class actions)</li>
                  <li>Conducted remotely or in your jurisdiction</li>
                  <li>You may opt out within 30 days by written notice</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">8.3 Governing Law</h3>
                <p className="text-neural-200">
                  These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
                </p>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">9. Changes to Terms</h2>
            <p className="text-neural-200 mb-3">
              We may update these Terms periodically. Significant changes will be communicated via:
            </p>
            <ul className="list-disc pl-6 text-neural-200 space-y-2">
              <li>Email notification</li>
              <li>Prominent platform notice</li>
              <li>Updated "Last Modified" date</li>
            </ul>
            <p className="text-neural-200 mt-4">
              Continued use after changes constitutes acceptance of updated Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-brand-900/30 to-accent-900/30 rounded-2xl p-8 border border-brand-500/30">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">10. Contact Information</h2>
            <div className="space-y-3 text-neural-200">
              <p><strong className="text-white">One Last AI Legal Department</strong></p>
              <p>Email: <a href="mailto:legal@onelastai.co" className="text-brand-400 hover:text-brand-300 underline">legal@onelastai.co</a></p>
              <p>Support: <a href="mailto:support@onelastai.co" className="text-brand-400 hover:text-brand-300 underline">support@onelastai.co</a></p>
              <p>DMCA: <a href="mailto:dmca@onelastai.co" className="text-brand-400 hover:text-brand-300 underline">dmca@onelastai.co</a></p>
              <p>Website: <a href="https://onelastai.co" className="text-brand-400 hover:text-brand-300 underline">https://onelastai.co</a></p>
            </div>
          </section>
        </div>
      </div>

      {/* Article Popup */}
      {selectedArticle && <ArticlePopup article={selectedArticle} />}
    </div>
  )
}
