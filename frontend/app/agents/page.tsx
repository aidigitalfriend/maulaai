import AgentCard from '@/components/AgentCard'
import Link from 'next/link'
import { allAgents } from './registry'

export default function AgentsPage() {
  const agents = allAgents

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <span className="text-xl">🤖</span>
            AI Personalities
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Meet Our AI Agents
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Choose from 18 specialized AI agents, each bringing unique expertise and personality 
            to help you tackle any challenge. From Einstein's physics to Comedy King's humor!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents/random" className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-white/90 transition-colors">
              Surprise Me
            </Link>
            <Link href="/docs/agents" className="px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
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