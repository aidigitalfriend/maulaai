import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function Docs() {
  const docSections = [
    {
      title: "Agent Documentation",
      description: "Learn how to create, configure, and deploy AI agents",
      icon: "🤖",
      href: "/docs/agents",
      topics: ["Getting Started", "Configuration", "API Reference", "Best Practices"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "API Reference",
      description: "Complete API documentation for all endpoints and methods",
      icon: "📚",
      href: "/docs/api",
      topics: ["Authentication", "Endpoints", "Rate Limits", "Error Codes"],
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Integration Guides",
      description: "Step-by-step guides for integrating with popular platforms",
      icon: "🔗",
      href: "/docs/integrations",
      topics: ["Slack", "Discord", "Teams", "Webhooks"],
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "SDKs & Libraries",
      description: "Official SDKs and community libraries for various languages",
      icon: "💻",
      href: "/docs/sdks",
      topics: ["JavaScript", "Python", "Go", "PHP"],
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Tutorials",
      description: "Hands-on tutorials to help you build amazing AI experiences",
      icon: "🎓",
      href: "/docs/tutorials",
      topics: ["Quick Start", "Advanced Features", "Use Cases", "Examples"],
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Support",
      description: "Get help, report bugs, and connect with the community",
      icon: "🛠️",
      href: "/support",
      topics: ["FAQ", "Contact Support", "Community", "Bug Reports"],
      color: "from-teal-500 to-green-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-brand-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Documentation
          </h1>
          <p className="text-xl text-neural-600 leading-relaxed">
            Everything you need to build amazing AI agent experiences
          </p>
        </div>

        {/* Quick Stats */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-brand-50 rounded-lg">
                <div className="text-2xl font-bold text-brand-600">20+</div>
                <div className="text-xs text-neural-600">AI Agents</div>
              </div>
              <div className="text-center p-4 bg-accent-50 rounded-lg">
                <div className="text-2xl font-bold text-accent-600">50+</div>
                <div className="text-xs text-neural-600">API Endpoints</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">4</div>
                <div className="text-xs text-neural-600">SDK Languages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {docSections.map((section, index) => (
            <Link key={index} href={section.href} className="group bg-white rounded-2xl p-6 shadow-sm border border-neural-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300 block h-full">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{section.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-neural-800 mb-2 group-hover:text-brand-600 transition-colors">
                {section.title}
              </h3>
              <p className="text-sm text-neural-600 leading-relaxed mb-4">
                {section.description}
              </p>
              <ul className="space-y-2">
                {section.topics.map((topic, topicIndex) => (
                  <li key={topicIndex} className="text-sm text-neural-500 flex items-center">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mr-3"></span>
                    {topic}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100 mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-neural-800 mb-6">Quick Start</h2>
            <p className="text-lg text-neural-600 mb-8">
              Get up and running with your first AI agent in minutes
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-brand-50 rounded-xl">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                  1
                </div>
                <h3 className="font-bold text-neural-800 mb-2">Choose an Agent</h3>
                <p className="text-sm text-neural-600">Select from our library of pre-built agents</p>
              </div>
              <div className="text-center p-4 bg-accent-50 rounded-xl">
                <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                  2
                </div>
                <h3 className="font-bold text-neural-800 mb-2">Configure</h3>
                <p className="text-sm text-neural-600">Customize the agent to fit your needs</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                  3
                </div>
                <h3 className="font-bold text-neural-800 mb-2">Deploy</h3>
                <p className="text-sm text-neural-600">Launch your agent and start using it</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs/agents" className="btn-primary">
                View Agent Docs
              </Link>
              <Link href="/agents" className="btn-secondary">
                Browse Agents
              </Link>
            </div>
          </div>
        </div>

        {/* Popular Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
            <h3 className="text-xl font-bold text-neural-800 mb-4">Popular Guides</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/agents/getting-started" className="text-brand-600 hover:text-brand-700 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>
                  Getting Started with Agents →
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-brand-600 hover:text-brand-700 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>
                  API Authentication →
                </Link>
              </li>
              <li>
                <Link href="/docs/integrations" className="text-brand-600 hover:text-brand-700 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>
                  Slack Integration →
                </Link>
              </li>
              <li>
                <Link href="/docs/tutorials" className="text-brand-600 hover:text-brand-700 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>
                  Building Your First Bot →
                </Link>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
            <h3 className="text-xl font-bold text-neural-800 mb-4">Need Help?</h3>
            <p className="text-neural-600 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="space-y-3">
              <Link href="/support/contact-us" className="block text-brand-600 hover:text-brand-700 transition-colors flex items-center">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                Contact Support →
              </Link>
              <Link href="/community" className="block text-brand-600 hover:text-brand-700 transition-colors flex items-center">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                Join Community →
              </Link>
              <Link href="/support/help-center" className="block text-brand-600 hover:text-brand-700 transition-colors flex items-center">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                Browse FAQ →
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-brand-600 to-accent-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
            <p className="text-lg opacity-90 mb-8">
              Start creating powerful AI experiences with our comprehensive documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs/agents/getting-started" className="btn-primary bg-white text-brand-600 hover:bg-neural-50">
                Get Started
              </Link>
              <Link href="/demo" className="btn-primary border-2 border-white bg-transparent hover:bg-white hover:text-brand-600">
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}