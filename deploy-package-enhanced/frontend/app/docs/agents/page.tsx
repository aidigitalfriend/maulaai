import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'

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
      href: "/docs/agents/getting-started"
    },
    {
      title: "Agent Configuration",
      description: "How to configure your agents for optimal performance",
      category: "Configuration",
      readTime: "8 min",
      href: "/docs/agents/configuration"
    },
    {
      title: "Available Agent Types",
      description: "Explore all the different types of agents you can deploy",
      category: "Reference",
      readTime: "12 min",
      href: "/docs/agents/agents-type"
    },
    {
      title: "Agent API Reference",
      description: "Complete API documentation for agent integration",
      category: "API",
      readTime: "15 min",
      href: "/docs/agents/api-reference"
    },
    {
      title: "Best Practices",
      description: "Tips and tricks for getting the most out of your agents",
      category: "Guide",
      readTime: "10 min",
      href: "/docs/agents/best-practices"
    },
    {
      title: "Troubleshooting",
      description: "Common issues and how to resolve them",
      category: "Support",
      readTime: "6 min",
      href: "/docs/agents/troubleshooting"
    }
  ]

  const availableAgents = [
    { name: "Ben Sega", slug: "ben-sega", specialty: "Gaming & Entertainment" },
    { name: "Einstein", slug: "einstein", specialty: "Scientific Research" },
    { name: "Chef Biew", slug: "chef-biew", specialty: "Culinary Arts" },
    { name: "Tech Wizard", slug: "tech-wizard", specialty: "Technology Support" },
    { name: "Travel Buddy", slug: "travel-buddy", specialty: "Travel Planning" },
    { name: "Fitness Guru", slug: "fitness-guru", specialty: "Health & Fitness" },
  ]

  return (
    <div className="min-h-screen">
      <div className="container-custom section-padding-lg">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Agent Documentation
          </h1>
          <p className="text-xl mb-8">
            Comprehensive guides and documentation for working with AI agents
          </p>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {agentDocs.map((doc, index) => (
            <Link key={index} href={doc.href} className="group card-dark p-6 hover:card-dark-hover transition-all duration-300">
              <div className="mb-4">
                <span className="text-xs font-medium text-brand-400 bg-brand-900/30 px-3 py-1 rounded-full">
                  {doc.category}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-brand-400 transition-colors">
                {doc.title}
              </h3>
              <p className="leading-relaxed">
                {doc.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Available Agents */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Available Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableAgents.map((agent, index) => (
              <Link key={index} href={`/agents/${agent.slug}`} className="group card-dark p-6 hover:card-dark-hover transition-all duration-300">
                <div className="text-2xl mb-3">🤖</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-brand-400 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-neutral-400">
                  {agent.specialty}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-dark p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents" className="btn-primary">
              View All Agents
            </Link>
            <Link href="/agents/random" className="btn-secondary">
              Try Random Agent
            </Link>
            <Link href="/support" className="btn-outline">
              Get Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}