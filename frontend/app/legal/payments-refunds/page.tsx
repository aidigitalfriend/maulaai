'use client'

import { useState } from 'react'
import { X, DollarSign, CreditCard, Shield, AlertCircle } from 'lucide-react'

export default function PaymentsRefundsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600/20 to-accent-600/20 border-b border-brand-500/20">
        <div className="container-custom section-padding max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
            Payments & Refunds Policy
          </h1>
          <p className="text-neural-400 text-lg">Last updated: November 6, 2025</p>
          <p className="text-neural-300 mt-2">Effective Date: November 6, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom section-padding max-w-5xl">
        <div className="space-y-12">
          {/* Introduction */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-4 text-brand-400">1. Overview</h2>
            <p className="text-neural-200 leading-relaxed mb-4">
              This Payments & Refunds Policy explains the pricing structure, payment methods, billing procedures, 
              and refund policy for One Last AI services. By subscribing to our services, you agree to these terms.
            </p>
            <div className="bg-brand-900/20 rounded-xl p-6 border border-brand-500/30 mt-4">
              <div className="flex gap-3">
                <DollarSign className="text-brand-400 flex-shrink-0 mt-1" size={32} />
                <div>
                  <p className="text-white font-bold text-xl mb-2">$1 Daily Trial - Full Platform Access</p>
                  <p className="text-neural-200">
                    Experience our complete multi-agent AI platform for just $1.00 USD per day. 
                    No hidden fees. Cancel anytime.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Structure */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">2. Pricing Structure</h2>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-brand-900/30 to-accent-900/30 rounded-xl p-6 border border-brand-500/30">
                <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                  <DollarSign className="text-brand-400" />
                  $1.00 USD Daily Trial
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-brand-400 font-bold mt-1">✓</span>
                    <div>
                      <p className="text-white font-semibold">Full Platform Access</p>
                      <p className="text-neural-200 text-sm">All AI agents, tools, and features included</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-400 font-bold mt-1">✓</span>
                    <div>
                      <p className="text-white font-semibold">Billed Daily</p>
                      <p className="text-neural-200 text-sm">$1.00 charged every 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-400 font-bold mt-1">✓</span>
                    <div>
                      <p className="text-white font-semibold">Cancel Anytime</p>
                      <p className="text-neural-200 text-sm">No long-term commitment required</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-400 font-bold mt-1">✓</span>
                    <div>
                      <p className="text-white font-semibold">Immediate Access</p>
                      <p className="text-neural-200 text-sm">Start using all features right away</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">2.1 What's Included</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-brand-300 mb-2">🤖 AI Agents</p>
                    <p className="text-neural-200 text-sm">Access to 90+ specialized AI personalities</p>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-brand-300 mb-2">🛠️ Developer Tools</p>
                    <p className="text-neural-200 text-sm">19 network utilities and WHOIS services</p>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-brand-300 mb-2">🗣️ Voice Features</p>
                    <p className="text-neural-200 text-sm">Emotional TTS with 15+ voices</p>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-brand-300 mb-2">💬 Community</p>
                    <p className="text-neural-200 text-sm">Connect with users worldwide</p>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-brand-300 mb-2">📊 Analytics</p>
                    <p className="text-neural-200 text-sm">Track usage and performance</p>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-brand-300 mb-2">🔒 Priority Support</p>
                    <p className="text-neural-200 text-sm">Email support within 24 hours</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">2.2 No Free Tier</h3>
                <p className="text-neural-200">
                  One Last AI does not offer a free tier. The $1 daily trial provides affordable access to our 
                  premium platform. This low-cost model ensures:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2 mt-2">
                  <li>High-quality AI services without ads</li>
                  <li>Continuous platform improvements</li>
                  <li>Responsive customer support</li>
                  <li>Data privacy and security investments</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">3. Payment Methods</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                  <CreditCard className="text-brand-400" size={24} />
                  Accepted Payment Methods
                </h3>
                <div className="space-y-3">
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-white mb-2">💳 Credit & Debit Cards</p>
                    <p className="text-neural-200 text-sm">
                      Visa, MasterCard, American Express, Discover, Diners Club, JCB
                    </p>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-white mb-2">🅿️ PayPal</p>
                    <p className="text-neural-200 text-sm">
                      Link your PayPal account for convenient payments
                    </p>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-white mb-2">🌐 International Payments</p>
                    <p className="text-neural-200 text-sm">
                      We accept payments from most countries worldwide
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">3.1 Payment Processing</h3>
                <p className="text-neural-200 mb-3">
                  Payments are processed securely through:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li><strong className="text-white">Stripe:</strong> PCI DSS Level 1 certified payment processor</li>
                  <li><strong className="text-white">PayPal:</strong> Industry-leading payment platform</li>
                  <li><strong className="text-white">Encryption:</strong> All transactions use 256-bit SSL encryption</li>
                  <li><strong className="text-white">No Storage:</strong> We do not store full credit card numbers</li>
                </ul>
              </div>

              <div className="bg-brand-900/20 rounded-xl p-6 border border-brand-500/30">
                <div className="flex gap-3">
                  <Shield className="text-brand-400 flex-shrink-0 mt-1" size={28} />
                  <div>
                    <p className="text-white font-bold text-lg mb-2">Secure Payment Guarantee</p>
                    <p className="text-neural-200">
                      Your payment information is never stored on our servers. All transactions are processed 
                      through PCI-compliant third-party providers with bank-level security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Billing Terms */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">4. Billing Terms</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">4.1 Automatic Daily Billing</h3>
                <p className="text-neural-200 mb-3">
                  Your payment method will be charged <strong className="text-white">$1.00 USD every 24 hours</strong> 
                  starting from your initial subscription:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>First charge occurs immediately upon subscription</li>
                  <li>Subsequent charges occur at the same time daily</li>
                  <li>Billing continues until you cancel</li>
                  <li>No pro-rated refunds for partial days</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">4.2 Payment Failures</h3>
                <p className="text-neural-200 mb-3">
                  If a payment fails:
                </p>
                <div className="space-y-3">
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-amber-500/30">
                    <p className="text-neural-200">
                      <strong className="text-white">Day 1:</strong> We'll retry the payment and send an email notification
                    </p>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-amber-500/30">
                    <p className="text-neural-200">
                      <strong className="text-white">Day 2-3:</strong> Additional retry attempts with email reminders
                    </p>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/30">
                    <p className="text-neural-200">
                      <strong className="text-white">Day 4:</strong> Account suspended; access restricted until payment succeeds
                    </p>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-red-500/30">
                    <p className="text-neural-200">
                      <strong className="text-white">Day 7:</strong> Account terminated if payment still fails
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">4.3 Currency and Taxes</h3>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>All prices are in <strong className="text-white">USD (United States Dollars)</strong></li>
                  <li>Your bank may apply currency conversion fees</li>
                  <li>Sales tax or VAT may be added based on your location</li>
                  <li>Final charges will be clearly shown before payment</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">4.4 Updating Payment Information</h3>
                <p className="text-neural-200">
                  You can update your payment method at any time in your account settings. Updated payment 
                  information applies to future charges immediately.
                </p>
              </div>
            </div>
          </section>

          {/* NO REFUND POLICY - EMPHASIZED */}
          <section className="bg-gradient-to-br from-red-900/30 via-amber-900/30 to-red-900/30 rounded-2xl p-8 border-2 border-red-500/50">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={40} />
              <div>
                <h2 className="text-3xl font-bold mb-2 text-red-400">5. NO REFUND POLICY</h2>
                <p className="text-lg font-semibold text-white">All Payments Are Final and Non-Refundable</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-neural-900/70 rounded-xl p-6 border border-red-500/30">
                <h3 className="text-xl font-bold mb-3 text-white">5.1 Policy Statement</h3>
                <p className="text-neural-200 leading-relaxed mb-4 text-lg">
                  <strong className="text-red-400">ONE LAST AI DOES NOT OFFER REFUNDS FOR ANY REASON.</strong>
                </p>
                <p className="text-neural-200 leading-relaxed">
                  All payments made to One Last AI are <strong className="text-white">final, non-refundable, and 
                  non-transferable</strong>. This includes but is not limited to:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2 mt-3">
                  <li>Daily trial charges ($1.00 per day)</li>
                  <li>Any subscription fees</li>
                  <li>Additional service charges</li>
                  <li>Payments made in error</li>
                  <li>Duplicate payments</li>
                  <li>Charges after cancellation intent (if cancellation not completed properly)</li>
                </ul>
              </div>

              <div className="bg-neural-900/70 rounded-xl p-6 border border-amber-500/30">
                <h3 className="text-xl font-bold mb-3 text-white">5.2 Rationale for No Refund Policy</h3>
                <p className="text-neural-200 mb-4">
                  Our no-refund policy exists because:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-brand-400 font-bold mt-1 text-xl">1.</span>
                    <div>
                      <p className="text-white font-semibold">Extremely Low Cost</p>
                      <p className="text-neural-200 text-sm">
                        At just $1.00 per day, our service is priced affordably for everyone. The minimal cost 
                        reflects immediate value delivery.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-400 font-bold mt-1 text-xl">2.</span>
                    <div>
                      <p className="text-white font-semibold">Immediate Access</p>
                      <p className="text-neural-200 text-sm">
                        You receive full platform access immediately upon payment. AI services, tools, and features 
                        are consumed instantly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-400 font-bold mt-1 text-xl">3.</span>
                    <div>
                      <p className="text-white font-semibold">Digital Service Nature</p>
                      <p className="text-neural-200 text-sm">
                        Our AI services cannot be "returned" once used. Computational resources, API calls, and 
                        AI processing are consumed in real-time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-400 font-bold mt-1 text-xl">4.</span>
                    <div>
                      <p className="text-white font-semibold">Cancel Anytime Flexibility</p>
                      <p className="text-neural-200 text-sm">
                        You can cancel your subscription at any time with no penalty. This provides flexibility 
                        without requiring refunds.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-400 font-bold mt-1 text-xl">5.</span>
                    <div>
                      <p className="text-white font-semibold">Operational Sustainability</p>
                      <p className="text-neural-200 text-sm">
                        Low pricing requires efficient operations. Processing refunds would increase costs, 
                        ultimately raising prices for all users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neural-900/70 rounded-xl p-6 border border-red-500/30">
                <h3 className="text-xl font-bold mb-3 text-white">5.3 No Exceptions</h3>
                <p className="text-neural-200 mb-3">
                  We do not make exceptions to this policy for any circumstance, including:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>❌ Dissatisfaction with service</li>
                  <li>❌ Technical issues or bugs</li>
                  <li>❌ Accidental purchases</li>
                  <li>❌ Change of mind</li>
                  <li>❌ Lack of usage</li>
                  <li>❌ Forgotten cancellations</li>
                  <li>❌ Billing disputes</li>
                  <li>❌ Feature requests not implemented</li>
                  <li>❌ Competitor comparisons</li>
                </ul>
                <p className="text-red-300 mt-4 font-semibold">
                  By subscribing, you acknowledge and accept this no-refund policy.
                </p>
              </div>

              <div className="bg-brand-900/30 rounded-xl p-6 border border-brand-500/30">
                <h3 className="text-xl font-bold mb-3 text-brand-300">5.4 Alternatives to Refunds</h3>
                <p className="text-neural-200 mb-3">
                  If you're experiencing issues, we encourage you to:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>
                    <strong className="text-white">Contact Support:</strong> Email{' '}
                    <a href="mailto:support@onelastai.co" className="text-brand-400 hover:text-brand-300 underline">
                      support@onelastai.co
                    </a>{' '}
                    for technical assistance
                  </li>
                  <li>
                    <strong className="text-white">Cancel Your Subscription:</strong> Stop future charges immediately 
                    in account settings
                  </li>
                  <li>
                    <strong className="text-white">Provide Feedback:</strong> Help us improve the platform for future users
                  </li>
                  <li>
                    <strong className="text-white">Review Documentation:</strong> Explore guides and tutorials at{' '}
                    <a href="https://onelastai.co/docs" className="text-brand-400 hover:text-brand-300 underline">
                      onelastai.co/docs
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cancellation */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">6. Cancellation Policy</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">6.1 How to Cancel</h3>
                <p className="text-neural-200 mb-3">
                  You can cancel your subscription at any time through:
                </p>
                <div className="space-y-3">
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-white mb-2">Method 1: Account Settings</p>
                    <ol className="list-decimal pl-6 text-neural-200 text-sm space-y-1">
                      <li>Log in to your account</li>
                      <li>Navigate to Settings → Billing</li>
                      <li>Click "Cancel Subscription"</li>
                      <li>Confirm cancellation</li>
                    </ol>
                  </div>
                  <div className="bg-neural-900/50 rounded-xl p-4 border border-neural-700/30">
                    <p className="font-semibold text-white mb-2">Method 2: Email Request</p>
                    <p className="text-neural-200 text-sm">
                      Email{' '}
                      <a href="mailto:billing@onelastai.co" className="text-brand-400 hover:text-brand-300 underline">
                        billing@onelastai.co
                      </a>{' '}
                      with your account email and "CANCEL SUBSCRIPTION" in the subject line
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">6.2 After Cancellation</h3>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>
                    <strong className="text-white">Immediate Effect:</strong> No future charges will occur
                  </li>
                  <li>
                    <strong className="text-white">Access Until Period End:</strong> You retain access through the 
                    end of your current paid day
                  </li>
                  <li>
                    <strong className="text-white">Data Retention:</strong> Your data is kept for 30 days in case 
                    you reactivate
                  </li>
                  <li>
                    <strong className="text-white">No Refund:</strong> Current day charge is not refunded
                  </li>
                </ul>
              </div>

              <div className="bg-brand-900/20 rounded-xl p-6 border border-brand-500/30">
                <h3 className="text-xl font-semibold mb-3 text-brand-300">6.3 Reactivation</h3>
                <p className="text-neural-200 mb-2">
                  You can reactivate your subscription anytime within 30 days:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-1">
                  <li>Log in to your account</li>
                  <li>Click "Reactivate Subscription"</li>
                  <li>Billing resumes immediately at $1.00/day</li>
                  <li>All previous data and settings restored</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Chargebacks */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">7. Chargebacks and Disputes</h2>
            
            <div className="space-y-4">
              <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-500/30">
                <h3 className="text-xl font-semibold mb-3 text-amber-400">7.1 Contact Us First</h3>
                <p className="text-neural-200">
                  Before filing a chargeback or payment dispute with your bank, please contact us at{' '}
                  <a href="mailto:billing@onelastai.co" className="text-brand-400 hover:text-brand-300 underline">
                    billing@onelastai.co
                  </a>. 
                  We're committed to resolving billing issues quickly.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">7.2 Chargeback Policy</h3>
                <p className="text-neural-200 mb-3">
                  Filing a chargeback for a legitimate charge may result in:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-2">
                  <li>Immediate account suspension</li>
                  <li>Permanent ban from future services</li>
                  <li>Legal action for fraudulent chargebacks</li>
                  <li>Collection of chargeback fees ($15-25)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">7.3 Legitimate Disputes</h3>
                <p className="text-neural-200">
                  We will work with you on legitimate billing errors such as:
                </p>
                <ul className="list-disc pl-6 text-neural-200 space-y-1 mt-2">
                  <li>Charges after proper cancellation</li>
                  <li>Duplicate transactions</li>
                  <li>Unauthorized account access</li>
                  <li>System processing errors</li>
                </ul>
                <p className="text-neural-300 mt-3 text-sm">
                  These issues will be investigated and resolved within 5-7 business days.
                </p>
              </div>
            </div>
          </section>

          {/* Price Changes */}
          <section className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700/50">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">8. Price Changes</h2>
            <p className="text-neural-200 mb-4">
              We reserve the right to change our pricing at any time. Price changes will:
            </p>
            <ul className="list-disc pl-6 text-neural-200 space-y-2">
              <li>Be communicated at least 30 days in advance via email</li>
              <li>Not affect current subscribers for 60 days after announcement</li>
              <li>Apply to new subscribers immediately</li>
              <li>Allow existing subscribers to cancel before new rates apply</li>
            </ul>
            <p className="text-neural-300 mt-4 text-sm">
              Continued use after price change effective date constitutes acceptance of new pricing.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-brand-900/30 to-accent-900/30 rounded-2xl p-8 border border-brand-500/30">
            <h2 className="text-3xl font-bold mb-6 text-brand-400">9. Contact Billing Support</h2>
            <div className="space-y-3 text-neural-200">
              <p><strong className="text-white">Billing Questions:</strong></p>
              <p>Email: <a href="mailto:billing@onelastai.co" className="text-brand-400 hover:text-brand-300 underline">billing@onelastai.co</a></p>
              <p>Support: <a href="mailto:support@onelastai.co" className="text-brand-400 hover:text-brand-300 underline">support@onelastai.co</a></p>
              <p>Website: <a href="https://onelastai.co" className="text-brand-400 hover:text-brand-300 underline">https://onelastai.co</a></p>
              
              <div className="mt-6 pt-6 border-t border-neural-700/50">
                <p className="text-sm text-neural-300">
                  <strong className="text-white">Response Time:</strong> We respond to all billing inquiries 
                  within 24-48 hours (Monday-Friday, excluding holidays).
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
