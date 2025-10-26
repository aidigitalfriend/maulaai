import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Dashboard() {
  const dashboardSections = [
    {
      title: "Advanced Analytics",
      description: "Real-time analytics dashboard with 10+ metrics including API requests, latency, model usage, geographic distribution, and cost estimation.",
      icon: "📊",
      href: "/dashboard-advanced",
      stats: ["API Metrics", "Model Performance", "Cost Tracking", "Error Analysis"],
      badge: "NEW"
    },
    {
      title: "Analytics & Insights",
      description: "Monitor performance metrics, user interactions, and get actionable insights.",
      icon: "�",
      href: "/dashboard/analytics",
      stats: ["Real-time Metrics", "Performance Trends", "User Engagement", "Success Rates"]
    },
    {
      title: "Conversation History",
      description: "Review all interactions, search conversations, and analyze patterns.",
      icon: "💬",
      href: "/dashboard/conversation-history",
      stats: ["Search & Filter", "Export Data", "Pattern Analysis", "Quality Scores"]
    },
    {
      title: "Billing & Usage",
      description: "Track your usage, manage billing, and optimize costs effectively.",
      icon: "💳",
      href: "/dashboard/billing",
      stats: ["Usage Tracking", "Cost Analysis", "Billing History", "Plan Management"]
    },
    {
      title: "Agent Performance",
      description: "Deep dive into individual agent metrics and optimization opportunities.",
      icon: "🤖",
      href: "/dashboard/agent-performance",
      stats: ["Response Times", "Accuracy Metrics", "Learning Progress", "Optimization Tips"]
    }
  ]

  const quickStats = [
    { label: "Active Agents", value: "12", change: "+2 this month", trend: "up" },
    { label: "Total Conversations", value: "2,847", change: "+15% this week", trend: "up" },
    { label: "Avg Response Time", value: "0.8s", change: "-0.2s improved", trend: "up" },
    { label: "Success Rate", value: "94.2%", change: "+1.3% this month", trend: "up" }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Dashboard
          </h1>
          <p className="text-xl text-neural-600 leading-relaxed mb-8">
            Monitor your AI agents, track performance, and manage your account from your centralized dashboard.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
              <h3 className="text-sm font-medium text-neural-600 mb-2">{stat.label}</h3>
              <div className="text-3xl font-bold text-neural-800 mb-1">{stat.value}</div>
              <div className={`text-sm flex items-center ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="mr-1">{stat.trend === 'up' ? '↗️' : '↘️'}</span>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {dashboardSections.map((section, index) => (
            <Link key={index} href={section.href} className="group relative bg-white rounded-2xl p-8 shadow-sm border border-neural-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300">
              {section.badge && (
                <div className="absolute top-4 right-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {section.badge}
                </div>
              )}
              <div className="text-4xl mb-4">{section.icon}</div>
              <h3 className="text-xl font-bold text-neural-800 mb-3 group-hover:text-brand-600 transition-colors">
                {section.title}
              </h3>
              <p className="text-neural-600 mb-4 leading-relaxed">
                {section.description}
              </p>
              <ul className="space-y-2">
                {section.stats.map((stat, statIndex) => (
                  <li key={statIndex} className="text-sm text-neural-500 flex items-center">
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-3"></span>
                    {stat}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
          <h2 className="text-2xl font-bold text-neural-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/agents/create" className="flex items-center p-4 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors group">
              <span className="text-2xl mr-3">➕</span>
              <div>
                <div className="font-medium text-neural-800 group-hover:text-brand-600">Create New Agent</div>
                <div className="text-sm text-neural-600">Deploy a new AI agent</div>
              </div>
            </Link>
            <Link href="/support/contact-us" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
              <span className="text-2xl mr-3">💬</span>
              <div>
                <div className="font-medium text-neural-800 group-hover:text-green-600">Get Support</div>
                <div className="text-sm text-neural-600">Contact our support team</div>
              </div>
            </Link>
            <Link href="/resources/documentation" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
              <span className="text-2xl mr-3">📚</span>
              <div>
                <div className="font-medium text-neural-800 group-hover:text-purple-600">View Documentation</div>
                <div className="text-sm text-neural-600">Learn more about features</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
