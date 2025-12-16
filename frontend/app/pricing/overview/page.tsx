import Link from 'next/link';

export default function PricingOverview() {
  const plans = [
    {
      name: 'Daily',
      price: '$1',
      period: '/day',
      description: 'Perfect for short-term projects or trying out agents',
      features: [
        'Access to any single agent',
        'Unlimited conversations',
        'Real-time responses',
        'Voice interaction (if supported)',
        'Cancel anytime',
      ],
      cta: 'Choose Agent',
      href: '/agents',
    },
    {
      name: 'Weekly',
      price: '$5',
      period: '/week',
      description: 'Great value for regular use and projects',
      features: [
        'Access to any single agent',
        'Unlimited conversations',
        'Real-time responses',
        'Voice interaction (if supported)',
        'Cancel anytime',
        'Save 29% vs daily',
      ],
      cta: 'Choose Agent',
      href: '/agents',
      popular: true,
    },
    {
      name: 'Monthly',
      price: '$19',
      period: '/month',
      description: 'Best value for ongoing work and long-term projects',
      features: [
        'Access to any single agent',
        'Unlimited conversations',
        'Real-time responses',
        'Voice interaction (if supported)',
        'Cancel anytime',
        'Save 37% vs daily',
        'Best value',
      ],
      cta: 'Choose Agent',
      href: '/agents',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-neural-600 leading-relaxed mb-8">
            Simple per-agent pricing. Each purchase gives you unlimited access
            to one AI agent for your chosen period. No auto-renewal—pay only
            when you want access.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-8 shadow-sm border transition-all duration-300 ${
                plan.popular
                  ? 'border-brand-200 ring-2 ring-brand-100 scale-105'
                  : 'border-neural-100 hover:border-brand-200'
              }`}
            >
              {plan.popular && (
                <div className="text-center mb-4">
                  <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neural-800 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-neural-800">
                    {plan.price}
                  </span>
                  <span className="text-neural-600">{plan.period}</span>
                </div>
                <p className="text-sm text-neural-500 mb-4">per agent</p>
                <p className="text-neural-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-neural-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-neural-100 text-neural-700 hover:bg-neural-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-neural-600 mb-4">Need a custom solution?</p>
          <Link
            href="/support/contact-us"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Contact our sales team →
          </Link>
        </div>
      </div>
    </div>
  );
}
