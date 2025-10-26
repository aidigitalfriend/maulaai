'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PerAgentPricingPage() {
  const agents = [
    {
      name: 'Basic Agents',
      description: 'Essential AI assistants for simple tasks',
      dailyPrice: '$1',
      perAgentPrice: 'per day',
      agents: ['Comedy King', 'Lazy Pawn', 'Random Agent'],
      features: [
        'Standard AI responses',
        'Chat-based interface',
        'Basic analytics',
        'Community support',
        'Up to 1000 interactions/month'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Professional Agents',
      description: 'Advanced AI with specialized capabilities',
      weeklyPrice: '$5',
      perAgentPrice: 'per week',
      agents: ['Tech Wizard', 'Einstein', 'Chef Biew', 'Professor Astrology'],
      features: [
        'Advanced AI capabilities',
        'Voice interaction support',
        'Detailed analytics & insights',
        'Priority email support',
        'Up to 10000 interactions/month',
        'Custom agent training',
        'API access'
      ],
      color: 'from-purple-500 to-purple-600',
      recommended: true
    },
    {
      name: 'Enterprise Agents',
      description: 'Full-featured AI with premium support',
      monthlyPrice: '$19',
      perAgentPrice: 'per month',
      agents: ['Julie Girlfriend', 'Emma Emotional', 'Mrs Boss', 'Doctor Network'],
      features: [
        'Enterprise AI models',
        'Multi-channel deployment',
        'Real-time analytics dashboard',
        'Dedicated support team',
        'Unlimited interactions',
        'Advanced customization',
        'API with webhooks',
        'SLA guarantee',
        'Data encryption & compliance'
      ],
      color: 'from-amber-500 to-amber-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900">
      {/* Header */}
      <section className="py-12 px-4 border-b border-neural-700">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Per-Agent Pricing
          </h1>
          <p className="text-neural-300">Choose the perfect plan for each agent in your fleet</p>
        </div>
      </section>



      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {agents.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-lg overflow-hidden border ${
                  tier.recommended
                    ? 'border-brand-500 shadow-xl scale-105'
                    : 'border-neural-700 hover:border-neural-600'
                } transition-all bg-neural-800`}
              >
                {tier.recommended && (
                  <div className="absolute top-0 right-0 bg-brand-500 text-white px-4 py-1 text-xs font-bold rounded-bl">
                    RECOMMENDED
                  </div>
                )}

                <div className={`bg-gradient-to-br ${tier.color} p-6 text-white`}>
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-white/90 text-sm">{tier.description}</p>
                </div>

                <div className="p-8 bg-neural-800">
                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-neural-400 text-sm mb-1">Starting at</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">
                        {tier.dailyPrice || tier.weeklyPrice || tier.monthlyPrice}
                      </span>
                    </div>
                    <p className="text-neural-300 text-sm mt-2">{tier.perAgentPrice}</p>
                  </div>

                  {/* Per-Agent Cost */}
                  <div className="p-3 bg-neural-700 rounded-lg mb-6 border border-neural-600">
                    <p className="text-xs text-neural-400 mb-1">Pricing Structure</p>
                    <p className="text-lg font-semibold text-white">One Agent at a Time</p>
                  </div>

                  {/* Included Agents */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-white mb-2">Includes:</p>
                    <div className="flex flex-wrap gap-2">
                      {tier.agents.map((agent, j) => (
                        <span key={j} className="text-xs px-2 py-1 bg-neural-700 text-neural-200 rounded border border-neural-600">
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <p className="text-sm font-semibold text-white mb-3">Features:</p>
                    <ul className="space-y-2">
                      {tier.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-neural-300">
                          <span className="text-brand-400 mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/auth/signup"
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                      tier.recommended
                        ? 'bg-brand-500 text-white hover:bg-brand-600'
                        : 'bg-neural-700 text-white hover:bg-neural-600 border border-neural-600'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neural-800 rounded-lg border border-neural-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neural-700 border-b border-neural-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Basic</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-brand-400">Professional</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Chat Interface', basic: true, pro: true, ent: true },
                    { feature: 'Voice Interaction', basic: false, pro: true, ent: true },
                    { feature: 'Analytics', basic: 'Basic', pro: 'Advanced', ent: 'Real-time' },
                    { feature: 'API Access', basic: false, pro: true, ent: true },
                    { feature: 'Webhooks', basic: false, pro: false, ent: true },
                    { feature: 'Custom Training', basic: false, pro: true, ent: true },
                    { feature: 'Priority Support', basic: false, pro: true, ent: true },
                    { feature: 'SLA Guarantee', basic: false, pro: false, ent: true },
                    { feature: 'Monthly Interactions', basic: '1,000', pro: '10,000', ent: 'Unlimited' },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-neural-700 ${i % 2 === 0 ? 'bg-neural-750' : 'bg-neural-800'}`}>
                      <td className="px-6 py-4 font-medium text-white">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-neural-300">
                        {typeof row.basic === 'boolean' ? (
                          <span className={row.basic ? 'text-green-400' : 'text-neural-500'}>
                            {row.basic ? '✓' : '—'}
                          </span>
                        ) : (
                          row.basic
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-neural-300 bg-brand-500/10">
                        {typeof row.pro === 'boolean' ? (
                          <span className={row.pro ? 'text-green-400' : 'text-neural-500'}>
                            {row.pro ? '✓' : '—'}
                          </span>
                        ) : (
                          row.pro
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-neural-300">
                        {typeof row.ent === 'boolean' ? (
                          <span className={row.ent ? 'text-green-400' : 'text-neural-500'}>
                            {row.ent ? '✓' : '—'}
                          </span>
                        ) : (
                          row.ent
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Can I change plans anytime?',
                  a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.'
                },
                {
                  q: 'Do you offer enterprise plans?',
                  a: 'Yes! Contact our sales team for custom enterprise pricing and dedicated support.'
                },
                {
                  q: 'Is there a free trial?',
                  a: 'Yes, all plans come with a 14-day free trial. No credit card required.'
                },
                {
                  q: 'What about bulk agent discounts?',
                  a: 'Yes, we offer volume discounts for 10+ agents. Contact our sales team for details.'
                }
              ].map((faq, i) => (
                <div key={i} className="p-4 bg-neural-800 rounded-lg border border-neural-700">
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-neural-300 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 p-8 bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg text-center text-white"
          >
            <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
            <p className="mb-6 text-white/90">Choose your plan and start building amazing AI experiences today.</p>
            <Link href="/auth/signup" className="inline-block px-8 py-3 bg-white text-brand-600 font-semibold rounded-lg hover:bg-neural-50 transition">
              Get Started
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
