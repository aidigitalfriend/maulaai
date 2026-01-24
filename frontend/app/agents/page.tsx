import AgentCard from '@/components/AgentCard'
import Link from 'next/link'
import { allAgents } from './registry'

export default function AgentsPage() {
  const agents = allAgents

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Meet Our AI Personalities
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Choose from 18 specialized AI agents, each bringing unique expertise and personality 
            to help you tackle any challenge. From Einstein's physics to Comedy King's humor!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents/random" className="bg-white text-brand-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors">
              Surprise Me
            </Link>
            <Link href="/docs/agents" className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-lg transition-colors">
              How It Works
            </Link>
          </div>
        </div>
      </section>

      <div className="container-custom pb-16">
        <div className="grid-responsive">
          {agents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-neural-600 mb-6">
            All 18 amazing AI agents are ready to help you! 🚀
          </p>
          <Link href="/dark-theme" className="btn-secondary">
            Try Dark Theme
          </Link>
        </div>
      </div>
    </div>
  )
}