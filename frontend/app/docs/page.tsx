import Link from 'next/link'

export default function Docs() {
  const docSections = [
    {
      title: "Agent Documentation",
      description: "Learn how to create, configure, and deploy AI agents",
      icon: "🤖",
      href: "/docs/agents",
      topics: ["Getting Started", "Configuration", "API Reference", "Best Practices"]
    },
    {
      title: "API Reference",
      description: "Complete API documentation for all endpoints and methods",
      icon: "📚",
      href: "/docs/api",
      topics: ["Authentication", "Endpoints", "Rate Limits", "Error Codes"]
    },
    {
      title: "Integration Guides",
      description: "Step-by-step guides for integrating with popular platforms",
      icon: "🔗",
      href: "/docs/integrations",
      topics: ["Slack", "Discord", "Teams", "Webhooks"]
    },
    {
      title: "SDKs & Libraries",
      description: "Official SDKs and community libraries for various languages",
      icon: "💻",
      href: "/docs/sdks",
      topics: ["JavaScript", "Python", "Go", "PHP"]
    },
    {
      title: "Tutorials",
      description: "Hands-on tutorials to help you build amazing AI experiences",
      icon: "🎓",
      href: "/docs/tutorials",
      topics: ["Quick Start", "Advanced Features", "Use Cases", "Examples"]
    },
    {
      title: "Support",
      description: "Get help, report bugs, and connect with the community",
      icon: "🛠️",
      href: "/support",
      topics: ["FAQ", "Contact Support", "Community", "Bug Reports"]
    }
  ]

  return (
    <div className="min-h-screen">
      <div className="container-custom section-padding-lg">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Documentation
          </h1>
          <p className="text-xl mb-8">
            Everything you need to build amazing AI agent experiences
          </p>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {docSections.map((section, index) => (
            <Link key={index} href={section.href} className="group card-dark p-8 hover:card-dark-hover transition-all duration-300">
              <div className="text-4xl mb-4">{section.icon}</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-brand-400 transition-colors">
                {section.title}
              </h3>
              <p className="mb-4 leading-relaxed">
                {section.description}
              </p>
              <ul className="space-y-2">
                {section.topics.map((topic, topicIndex) => (
                  <li key={topicIndex} className="text-sm text-neutral-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-3"></span>
                    {topic}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* Quick Start */}
        <div className="card-dark p-8 mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
            <p className="text-lg mb-8">
              Get up and running with your first AI agent in minutes
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                  1
                </div>
                <h3 className="font-bold mb-2">Choose an Agent</h3>
                <p className="text-sm text-neutral-400">Select from our library of pre-built agents</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                  2
                </div>
                <h3 className="font-bold mb-2">Configure</h3>
                <p className="text-sm text-neutral-400">Customize the agent to fit your needs</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                  3
                </div>
                <h3 className="font-bold mb-2">Deploy</h3>
                <p className="text-sm text-neutral-400">Launch your agent and start using it</p>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/docs/agents" className="btn-primary mr-4">
                View Agent Docs
              </Link>
              <Link href="/agents" className="btn-secondary">
                Browse Agents
              </Link>
            </div>
          </div>
        </div>

        {/* Popular Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-dark p-6">
            <h3 className="text-xl font-bold mb-4">Popular Guides</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs/agents/getting-started" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Getting Started with Agents →
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-brand-400 hover:text-brand-300 transition-colors">
                  API Authentication →
                </Link>
              </li>
              <li>
                <Link href="/docs/integrations" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Slack Integration →
                </Link>
              </li>
              <li>
                <Link href="/docs/tutorials" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Building Your First Bot →
                </Link>
              </li>
            </ul>
          </div>
          <div className="card-dark p-6">
            <h3 className="text-xl font-bold mb-4">Need Help?</h3>
            <p className="mb-4 text-neutral-300">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="space-y-3">
              <Link href="/support/contact-us" className="block text-brand-400 hover:text-brand-300 transition-colors">
                Contact Support →
              </Link>
              <Link href="/community" className="block text-brand-400 hover:text-brand-300 transition-colors">
                Join Community →
              </Link>
              <Link href="/support/help-center" className="block text-brand-400 hover:text-brand-300 transition-colors">
                Browse FAQ →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}