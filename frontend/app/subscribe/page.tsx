'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SubscriptionContent() {
  const searchParams = useSearchParams()
  const agentName = searchParams.get('agent') || 'AI Agent'
  const agentSlug = searchParams.get('slug') || 'agent'

  const subscriptionPlans = [
    {
      type: 'Daily',
      price: '$1',
      period: 'per day',
      features: [
        'Full access to ' + agentName,
        'Unlimited conversations',
        'Real-time responses',
        'Cancel anytime'
      ],
      recommended: false,
      billingCycle: 'daily'
    },
    {
      type: 'Weekly',
      price: '$5',
      period: 'per week',
      features: [
        'Full access to ' + agentName,
        'Unlimited conversations',
        'Real-time responses',
        'Cancel anytime',
        'Save 29% vs daily'
      ],
      recommended: true,
      billingCycle: 'weekly'
    },
    {
      type: 'Monthly',
      price: '$19',
      period: 'per month',
      features: [
        'Full access to ' + agentName,
        'Unlimited conversations',
        'Real-time responses',
        'Cancel anytime',
        'Save 39% vs daily',
        'Best value'
      ],
      recommended: false,
      billingCycle: 'monthly'
    }
  ]

  const handleSubscribe = (plan: any) => {
    // This would integrate with your payment processor
    console.log(`Subscribing to ${agentName} - ${plan.type} plan`)
    // Redirect to payment processing or show payment modal
  }

  return (
    <div className="min-h-screen">
      <div className="container-custom section-padding-lg">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="text-6xl mb-6">🤖</div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Subscribe to {agentName}
          </h1>
          <p className="text-xl mb-8">
            Choose your subscription plan to unlock full access to {agentName}
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-amber-200 font-medium">
              ⚠️ You can only subscribe to one agent at a time. This subscription will give you exclusive access to {agentName}.
            </p>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {subscriptionPlans.map((plan, index) => (
            <div
              key={index}
              className={`card-dark p-8 relative ${
                plan.recommended 
                  ? 'ring-2 ring-brand-500 transform scale-105' 
                  : 'hover:card-dark-hover'
              } transition-all duration-300`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.type}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-brand-400">{plan.price}</span>
                  <span className="text-neutral-400 ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <span className="text-green-400 mr-3">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.recommended
                    ? 'bg-brand-500 hover:bg-brand-600 text-white'
                    : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                }`}
              >
                Subscribe {plan.type}
              </button>
            </div>
          ))}
        </div>

        {/* Important Notes */}
        <div className="card-dark p-8 max-w-4xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Important Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-brand-400 mb-3">🔒 One Agent Policy</h3>
              <p className="text-sm text-neutral-300">
                You can only subscribe to one agent at a time. To switch agents, you'll need to cancel your current subscription and subscribe to a different agent.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-brand-400 mb-3">💳 No Free Tiers</h3>
              <p className="text-sm text-neutral-300">
                All agents require a paid subscription. There are no free trials or free tiers available.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-brand-400 mb-3">🔄 Easy Cancellation</h3>
              <p className="text-sm text-neutral-300">
                Cancel your subscription anytime from your dashboard. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-brand-400 mb-3">⚡ Instant Access</h3>
              <p className="text-sm text-neutral-300">
                Once subscribed, you'll have immediate access to unlimited conversations with {agentName}.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link 
            href={`/agents/${agentSlug}`}
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Back to {agentName}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SubscriptionContent />
    </Suspense>
  )
}