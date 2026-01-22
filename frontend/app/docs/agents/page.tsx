import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { BookOpen, Cog, Users, Code, Lightbulb, Wrench, Bot, ArrowRight } from 'lucide-react'

// Avoid serving stale HTML that references old chunk hashes after deploys
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default function DocsAgents() {
  // Force dynamic rendering at request time
  void nextHeaders()
  const agentDocs = [
    {
      title: "Getting Started with Agents",
      description: "Learn the basics of creating and deploying AI agents",
      category: "Introduction",
      readTime: "5 min",
      href: "/docs/agents/getting-started",
      icon: BookOpen,
      color: "brand"
    },
    {
      title: "Agent Configuration",
      description: "How to configure your agents for optimal performance",
      category: "Configuration",
      readTime: "8 min",
      href: "/docs/agents/configuration",
      icon: Cog,
      color: "purple"
    },
    {
      title: "Available Agent Types",
      description: "Explore all the different types of agents you can deploy",
      category: "Reference",
      readTime: "12 min",
      href: "/docs/agents/agents-type",
      icon: Users,
      color: "accent"
    },
    {
      title: "Agent API Reference",
      description: "Complete API documentation for agent integration",
      category: "API",
      readTime: "15 min",
      href: "/docs/agents/api-reference",
      icon: Code,
      color: "green"
    },
    {
      title: "Best Practices",
      description: "Tips and tricks for getting the most out of your agents",
      category: "Guide",
      readTime: "10 min",
      href: "/docs/agents/best-practices",
      icon: Lightbulb,
      color: "yellow"
    },
    {
      title: "Troubleshooting",
      description: "Common issues and how to resolve them",
      category: "Support",
      readTime: "6 min",
      href: "/docs/agents/troubleshooting",
      icon: Wrench,
      color: "orange"
    }
  ]

  const availableAgents = [
    { name: "Ben Sega", slug: "ben-sega", specialty: "Gaming & Entertainment", emoji: "🎮" },
    { name: "Einstein", slug: "einstein", specialty: "Scientific Research", emoji: "🔬" },
    { name: "Chef Biew", slug: "chef-biew", specialty: "Culinary Arts", emoji: "👨‍🍳" },
    { name: "Tech Wizard", slug: "tech-wizard", specialty: "Technology Support", emoji: "💻" },
    { name: "Travel Buddy", slug: "travel-buddy", specialty: "Travel Planning", emoji: "✈️" },
    { name: "Fitness Guru", slug: "fitness-guru", specialty: "Health & Fitness", emoji: "💪" },
  ]

  const getIconColor = (color: string) => {
    switch (color) {
      case 'brand': return 'bg-brand-100 text-brand-600'
      case 'purple': return 'bg-purple-100 text-purple-600'
      case 'accent': return 'bg-accent-100 text-accent-600'
      case 'green': return 'bg-green-100 text-green-600'
      case 'yellow': return 'bg-yellow-100 text-yellow-600'
      case 'orange': return 'bg-orange-100 text-orange-600'
      default: return 'bg-brand-100 text-brand-600'
    }
  }

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'brand': return 'bg-brand-50 text-brand-700 border-brand-200'
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'accent': return 'bg-accent-50 text-accent-700 border-accent-200'
      case 'green': return 'bg-green-50 text-green-700 border-green-200'
      case 'yellow': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'orange': return 'bg-orange-50 text-orange-700 border-orange-200'
      default: return 'bg-brand-50 text-brand-700 border-brand-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-100 rounded-2xl mb-6">
            <Bot className="w-10 h-10 text-brand-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Agent Documentation
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive guides and documentation for working with AI agents
          </p>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {agentDocs.map((doc, index) => {
            const IconComponent = doc.icon
            return (
              <Link key={index} href={doc.href} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconColor(doc.color)}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getCategoryColor(doc.color)}`}>
                    {doc.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {doc.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">📖 {doc.readTime} read</span>
                  <ArrowRight className="w-5 h-5 text-brand-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Available Agents */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableAgents.map((agent, index) => (
              <Link key={index} href={`/agents/${agent.slug}`} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300">
                <div className="text-3xl mb-3">{agent.emoji}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {agent.specialty}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <p className="text-gray-600 mb-6">Ready to start building with AI agents?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents" className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors">
              View All Agents
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/agents/random" className="inline-flex items-center justify-center gap-2 bg-accent-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors">
              Try Random Agent
            </Link>
            <Link href="/support" className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Get Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}