'use client';

import { useEffect, useRef } from 'react';

const agents = [
  { icon: '🧠', name: 'Einstein', specialty: 'Physics & Science', color: 'from-blue-500 to-indigo-600' },
  { icon: '💚', name: 'Emma', specialty: 'Emotional Support', color: 'from-green-500 to-emerald-600' },
  { icon: '🎮', name: 'Nid Gaming', specialty: 'Gaming Expert', color: 'from-purple-500 to-pink-600' },
  { icon: '🥢', name: 'Chef Biew', specialty: 'Culinary Arts', color: 'from-orange-500 to-red-600' },
  { icon: '🧙‍♂️', name: 'Tech Wizard', specialty: 'Coding & Tech', color: 'from-cyan-500 to-blue-600' },
  { icon: '👔', name: 'Mrs Boss', specialty: 'Leadership', color: 'from-slate-500 to-gray-600' },
  { icon: '💪', name: 'Fitness Guru', specialty: 'Health & Wellness', color: 'from-rose-500 to-pink-600' },
  { icon: '🕹️', name: 'Ben Sega', specialty: 'Retro Gaming', color: 'from-violet-500 to-purple-600' },
  { icon: '💖', name: 'Julie', specialty: 'AI Companion', color: 'from-pink-500 to-rose-600' },
  { icon: '🎭', name: 'Luna', specialty: 'Live Support', color: 'from-indigo-500 to-violet-600' },
  { icon: '📊', name: 'Data Pro', specialty: 'Analytics', color: 'from-teal-500 to-cyan-600' },
  { icon: '✍️', name: 'Writer AI', specialty: 'Content Creation', color: 'from-amber-500 to-orange-600' },
];

export default function AgentMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Clone items for seamless loop
    const scrollContent = scrollContainer.querySelector('.scroll-content') as HTMLDivElement;
    if (!scrollContent) return;
    
    // The animation is handled by CSS
  }, []);

  // Duplicate agents for seamless scrolling
  const duplicatedAgents = [...agents, ...agents, ...agents];

  return (
    <section className="py-16 bg-gradient-to-r from-neural-900 via-neural-800 to-neural-900 overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-500 rounded-full filter blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="container-custom relative z-10 mb-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 rounded-full text-brand-300 text-sm font-medium mb-4 border border-brand-500/30">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></span>
            Meet Your AI Team
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            20+ Specialized <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">AI Personalities</span>
          </h2>
          <p className="text-neural-400 max-w-2xl mx-auto">
            Each agent is uniquely designed with specialized expertise to help you succeed
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div ref={scrollRef} className="relative overflow-hidden">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-neural-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-neural-900 to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling content */}
        <div className="scroll-content flex animate-marquee hover:pause">
          {duplicatedAgents.map((agent, index) => (
            <div
              key={`${agent.name}-${index}`}
              className="flex-shrink-0 mx-3 group"
            >
              <div className={`relative bg-gradient-to-br ${agent.color} p-[1px] rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-brand-500/20`}>
                <div className="bg-neural-900 rounded-2xl p-5 min-w-[180px]">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {agent.icon}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{agent.name}</h3>
                    <p className="text-neural-400 text-sm">{agent.specialty}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Second row scrolling opposite direction */}
        <div className="scroll-content flex animate-marquee-reverse hover:pause mt-4">
          {[...duplicatedAgents].reverse().map((agent, index) => (
            <div
              key={`${agent.name}-reverse-${index}`}
              className="flex-shrink-0 mx-3 group"
            >
              <div className={`relative bg-gradient-to-br ${agent.color} p-[1px] rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-brand-500/20`}>
                <div className="bg-neural-900 rounded-2xl p-5 min-w-[180px]">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {agent.icon}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{agent.name}</h3>
                    <p className="text-neural-400 text-sm">{agent.specialty}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container-custom relative z-10 mt-10 text-center">
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

        @keyframes marquee-reverse {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        .animate-marquee-reverse {
          animation: marquee-reverse 35s linear infinite;
        }

        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
