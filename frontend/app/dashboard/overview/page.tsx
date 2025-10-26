'use client'

import Link from 'next/link'

export default function DashboardOverviewPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dashboard Overview</h1>
          <p className="text-xl opacity-90">Get started with your analytics and insights</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Analytics & Insights",
                description: "Monitor performance metrics, user interactions, and get actionable insights.",
                icon: "📊",
                features: ["Real-time Metrics", "Performance Trends", "User Engagement"]
              },
              {
                title: "Conversation History",
                description: "Review all interactions, search conversations, and analyze patterns.",
                icon: "💬",
                features: ["Search & Filter", "Export Data", "Pattern Analysis"]
              },
              {
                title: "Billing & Usage",
                description: "Track your usage, manage billing, and optimize costs effectively.",
                icon: "💳",
                features: ["Usage Tracking", "Cost Analysis", "Billing History"]
              },
              {
                title: "Agent Performance",
                description: "Deep dive into individual agent metrics and optimization opportunities.",
                icon: "🤖",
                features: ["Response Times", "Accuracy Metrics", "Learning Progress"]
              }
            ].map((section, idx) => (
              <div key={idx} className="p-6 border-2 border-neural-200 rounded-lg hover:border-brand-300 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{section.icon}</div>
                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                <p className="text-neural-600 mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.features.map((feature, fIdx) => (
                    <li key={fIdx} className="text-sm text-neural-700 flex items-center gap-2">
                      <span className="text-brand-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-neural-50">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-lg text-neural-600 mb-8">
            Log in to your account to access full dashboard analytics and insights.
          </p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}
