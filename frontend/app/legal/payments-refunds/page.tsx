'use client'

import Link from 'next/link'
import { CreditCard, Shield, CheckCircle, AlertCircle, DollarSign, HelpCircle } from 'lucide-react'

export default function PaymentsRefundsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      {/* Header */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CreditCard className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Payments & Refunds</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Transparent payment terms and our no-refund policy designed around affordable testing
          </p>
          <p className="text-sm opacity-75 mt-4">Last updated: October 22, 2025</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="space-y-8">
            {/* Why No Refunds - Highlighted Section */}
            <div className="bg-gradient-to-r from-brand-600/10 to-accent-600/10 border-l-4 border-brand-600 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-brand-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Our Affordable Testing Model</h2>
                  <p className="text-neural-300 mb-4">
                    We've designed One Last AI with affordability in mind. Our per-agent pricing starts at just <span className="font-bold text-brand-400">$1/day</span>, allowing users to thoroughly test and evaluate our service before committing to larger plans. This affordable entry point means <span className="font-bold">refunds are not applicable</span> – you can test the service risk-free at minimal cost.
                  </p>
                  <ul className="space-y-2 text-neural-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Test for just $1/day before upgrading</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Full access to all features during trial period</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Cancel anytime without penalties</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 1: Payment Terms */}
            <section className="bg-neural-800 border border-neural-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-brand-400" />
                <h2 className="text-2xl font-bold">1. Payment Terms</h2>
              </div>
              <p className="text-neural-300">
                All pricing is displayed in USD unless otherwise noted. Charges will be billed to your account on a monthly or annual basis depending on your selected plan. Our per-agent pricing model starts at just $1/day, making it affordable to test our service.
              </p>
            </section>

            {/* Section 2: Accepted Payment Methods */}
            <section className="bg-neural-800 border border-neural-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-brand-400" />
                <h2 className="text-2xl font-bold">2. Accepted Payment Methods</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neural-700 p-4 rounded border border-neural-600">
                  <h3 className="font-semibold text-neural-200 mb-3">Digital Payments</h3>
                  <ul className="space-y-2 text-neural-300">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-brand-400 rounded-full"></span>
                      Credit Cards (Visa, Mastercard, American Express)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-brand-400 rounded-full"></span>
                      Debit Cards
                    </li>
                  </ul>
                </div>
                <div className="bg-neural-700 p-4 rounded border border-neural-600">
                  <h3 className="font-semibold text-neural-200 mb-3">Business Payments</h3>
                  <ul className="space-y-2 text-neural-300">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-brand-400 rounded-full"></span>
                      Bank Transfers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-brand-400 rounded-full"></span>
                      Invoicing for Enterprise customers
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Billing and Auto-Renewal */}
            <section className="bg-neural-800 border border-neural-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-brand-400" />
                <h2 className="text-2xl font-bold">3. Billing and Auto-Renewal</h2>
              </div>
              <div className="space-y-4 text-neural-300">
                <p>
                  Your subscription will automatically renew at the end of each billing period. You will receive a notification before the renewal with your billing amount.
                </p>
                <div className="bg-neural-700 p-4 rounded border border-neural-600">
                  <h3 className="font-semibold text-neural-200 mb-2">Cancellation is Easy</h3>
                  <p>You can cancel your subscription at any time through your account settings. Your access will continue until the end of your current billing period, and we won't charge you further.</p>
                </div>
              </div>
            </section>

            {/* Section 4: Free Trial */}
            <section className="bg-neural-800 border border-neural-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-brand-400" />
                <h2 className="text-2xl font-bold">4. Free Trial & Testing</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 p-4 rounded">
                  <h3 className="font-semibold text-green-300 mb-3">14-Day Free Trial</h3>
                  <ul className="space-y-2 text-neural-300 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      Full access to all features
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      No credit card required
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      All AI agents available
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-brand-900/30 to-brand-800/20 border border-brand-700/50 p-4 rounded">
                  <h3 className="font-semibold text-brand-300 mb-3">$1/Day Testing Plan</h3>
                  <ul className="space-y-2 text-neural-300 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span>
                      Test at minimal cost
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span>
                      Cancel anytime
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span>
                      No hidden fees
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: No Refund Policy */}
            <section className="bg-neural-800 border border-neural-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">5. No Refund Policy</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded">
                  <h3 className="font-semibold text-yellow-300 mb-2">Why No Refunds?</h3>
                  <p className="text-neural-300">
                    Because One Last AI's per-agent pricing starts at just <span className="font-bold text-brand-400">$1/day</span>, all users can thoroughly test the service before committing to any subscription. This affordable entry point eliminates the need for refunds – you can evaluate our platform risk-free at minimal cost.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <h3 className="font-semibold text-neural-200 mb-2">✓ Free 14-Day Trial</h3>
                    <p className="text-neural-300 text-sm">
                      Start with our free trial to explore all features and AI agents without any credit card requirement.
                    </p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <h3 className="font-semibold text-neural-200 mb-2">✓ $1/Day Testing Option</h3>
                    <p className="text-neural-300 text-sm">
                      After the free trial, test the service for just $1/day. Cancel anytime – there's no long-term commitment required.
                    </p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <h3 className="font-semibold text-neural-200 mb-2">✓ Cancel Anytime</h3>
                    <p className="text-neural-300 text-sm">
                      You can cancel your subscription anytime through your account settings. Future charges will be stopped immediately.
                    </p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <h3 className="font-semibold text-neural-200 mb-2">✓ Full Access During Trial</h3>
                    <p className="text-neural-300 text-sm">
                      During both free trial and paid testing periods, you have full access to all features and AI agents.
                    </p>
                  </div>
                </div>

                <div className="bg-red-900/20 border border-red-700/50 p-4 rounded">
                  <p className="text-neural-300">
                    <span className="font-semibold text-red-300">Important:</span> Once a subscription is activated and used, no refunds are available. However, you can cancel anytime to prevent future charges.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Cancellation Policy */}
            <section className="bg-neural-800 border border-neural-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-brand-400" />
                <h2 className="text-2xl font-bold">6. Cancellation Policy</h2>
              </div>
              <div className="space-y-4 text-neural-300">
                <p>
                  You can cancel your subscription at any time through your account settings. Here's what happens when you cancel:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <h3 className="font-semibold text-neural-200 mb-2">✓ Access Continues</h3>
                    <p className="text-sm">Your access continues through the end of your current billing period.</p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <h3 className="font-semibold text-neural-200 mb-2">✓ No Further Charges</h3>
                    <p className="text-sm">We won't charge you for the next billing cycle after cancellation.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Enterprise Pricing */}
            <section className="bg-neural-800 border border-neural-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-brand-400" />
                <h2 className="text-2xl font-bold">7. Enterprise and Custom Pricing</h2>
              </div>
              <p className="text-neural-300">
                For Enterprise customers, payment and cancellation terms are subject to your service agreement. Please contact our enterprise sales team for specific details about your custom pricing and terms.
              </p>
            </section>

            {/* Section 8: Contact Support */}
            <section className="bg-neural-800 border border-neural-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-6 h-6 text-brand-400" />
                <h2 className="text-2xl font-bold">8. Questions or Issues?</h2>
              </div>
              <p className="text-neural-300 mb-4">
                For billing questions, payment issues, or to understand more about our pricing, contact our support team:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neural-700 p-4 rounded border border-neural-600 text-center">
                  <p className="text-neural-400 text-sm mb-2">Email</p>
                  <p className="font-semibold text-brand-400">billing@One Last AI.com</p>
                </div>
                <div className="bg-neural-700 p-4 rounded border border-neural-600 text-center">
                  <p className="text-neural-400 text-sm mb-2">Phone</p>
                  <p className="font-semibold text-brand-400">1-800-AGENTS-1</p>
                </div>
                <Link href="/support/contact-us" className="bg-neural-700 hover:bg-neural-600 p-4 rounded border border-neural-600 text-center transition">
                  <p className="text-neural-400 text-sm mb-2">Contact Form</p>
                  <p className="font-semibold text-brand-400">Get in Touch</p>
                </Link>
              </div>
            </section>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-brand-600/20 to-accent-600/20 border border-brand-600/30 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-neural-300 mb-6">
                Try One Last AI free for 14 days, or test it for just $1/day. No hidden fees, cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/subscribe" className="bg-brand-600 hover:bg-brand-700 px-6 py-3 rounded-lg font-semibold transition">
                  Start Free Trial
                </Link>
                <Link href="/pricing/overview" className="bg-neutral-700 hover:bg-neutral-600 px-6 py-3 rounded-lg font-semibold transition border border-neural-600">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
