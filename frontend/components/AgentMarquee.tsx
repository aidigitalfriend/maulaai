'use client';

const agents = [
  { icon: '🧠', name: 'Einstein', specialty: 'Physics & Science' },
  { icon: '💚', name: 'Emma', specialty: 'Emotional Support' },
  { icon: '🎮', name: 'Nid Gaming', specialty: 'Gaming Expert' },
  { icon: '🥢', name: 'Chef Biew', specialty: 'Culinary Arts' },
  { icon: '🧙‍♂️', name: 'Tech Wizard', specialty: 'Coding & Tech' },
  { icon: '👔', name: 'Mrs Boss', specialty: 'Leadership' },
  { icon: '💪', name: 'Fitness Guru', specialty: 'Health & Wellness' },
  { icon: '🕹️', name: 'Ben Sega', specialty: 'Retro Gaming' },
  { icon: '💖', name: 'Julie', specialty: 'AI Companion' },
  { icon: '🎭', name: 'Luna', specialty: 'Live Support' },
  { icon: '📊', name: 'Data Pro', specialty: 'Analytics' },
  { icon: '✍️', name: 'Writer AI', specialty: 'Content Creation' },
];

export default function AgentMarquee() {
  // Duplicate agents for seamless scrolling
  const duplicatedAgents = [...agents, ...agents, ...agents];

  return (
    <section className="py-20 bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 overflow-hidden relative">
      {/* Background effects - matching site theme */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full filter blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="container-custom relative z-10 mb-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 rounded-full text-brand-300 text-sm font-medium mb-6 border border-brand-500/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Meet Your AI Team
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">
            20+ Specialized <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">AI Personalities</span>
          </h2>
          <p className="text-lg text-neural-300 max-w-2xl mx-auto">
            Each agent is uniquely designed with specialized expertise to help you succeed
          </p>
        </div>
      </div>

      {/* Single Row Marquee */}
      <div className="relative overflow-hidden">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-neural-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-neural-900 to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling content - single row */}
        <div className="flex animate-marquee hover:pause">
          {duplicatedAgents.map((agent, index) => (
            <div
              key={`${agent.name}-${index}`}
              className="flex-shrink-0 mx-2"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-brand-500/50 transition-all duration-300 hover:scale-105 hover:bg-white/10 min-w-[160px]">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl mb-3">
                    {agent.icon}
                  </div>
                  <h3 className="text-white font-semibold text-base mb-1">{agent.name}</h3>
                  <p className="text-neural-400 text-sm">{agent.specialty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container-custom relative z-10 mt-12 text-center">
        <a 
          href="/agents" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/30 group"
        >
          Explore All Agents
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
        }

        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
