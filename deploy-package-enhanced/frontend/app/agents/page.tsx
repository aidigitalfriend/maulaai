import AgentCard from '@/components/AgentCard'
import Link from 'next/link'
import { allAgents } from './registry'

export default function AgentsPage() {
  const agents = allAgents

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-sm">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Meet Our AI Personalities
          </h1>
          <p className="text-xl text-neural-600 leading-relaxed mb-8">
            Choose from 18 specialized AI agents, each bringing unique expertise and personality 
            to help you tackle any challenge. From Einstein's physics to Comedy King's humor!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents/random" className="btn-primary">
              Surprise Me
            </Link>
            <Link href="/docs/agents" className="btn-secondary">
              How It Works
            </Link>
          </div>
        </div>
      </div>

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