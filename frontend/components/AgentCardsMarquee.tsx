'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  specialty: string;
  description: string;
  color: string;
  emoji: string;
}

const agents: Agent[] = [
  {
    id: '1',
    name: 'Einstein',
    slug: 'einstein',
    avatar: '/images/agents/einstein.png',
    specialty: 'Physics & Science',
    description: 'Explore the mysteries of the universe',
    color: 'from-blue-500 to-indigo-600',
    emoji: '🔬',
  },
  {
    id: '2',
    name: 'Tech Wizard',
    slug: 'tech-wizard',
    avatar: '/images/agents/tech-wizard.png',
    specialty: 'Coding & Innovation',
    description: 'Master the art of technology',
    color: 'from-purple-500 to-pink-600',
    emoji: '💻',
  },
  {
    id: '3',
    name: 'Mrs Boss',
    slug: 'mrs-boss',
    avatar: '/images/agents/mrs-boss.png',
    specialty: 'Leadership & Strategy',
    description: 'Lead with confidence and clarity',
    color: 'from-rose-500 to-red-600',
    emoji: '👔',
  },
  {
    id: '4',
    name: 'Chef Biew',
    slug: 'chef-biew',
    avatar: '/images/agents/chef-biew.png',
    specialty: 'Culinary Expertise',
    description: 'Create culinary masterpieces',
    color: 'from-orange-500 to-amber-600',
    emoji: '👨‍🍳',
  },
  {
    id: '5',
    name: 'Julie',
    slug: 'julie-girlfriend',
    avatar: '/images/agents/julie.png',
    specialty: 'Companionship',
    description: 'Your caring AI companion',
    color: 'from-pink-500 to-rose-600',
    emoji: '💕',
  },
  {
    id: '6',
    name: 'Emma Emotional',
    slug: 'emma-emotional',
    avatar: '/images/agents/emma.png',
    specialty: 'Empathy & Support',
    description: 'Emotional intelligence expert',
    color: 'from-teal-500 to-cyan-600',
    emoji: '💝',
  },
  {
    id: '7',
    name: 'Travel Buddy',
    slug: 'travel-buddy',
    avatar: '/images/agents/travel.png',
    specialty: 'Travel Planning',
    description: 'Your ultimate travel companion',
    color: 'from-green-500 to-emerald-600',
    emoji: '✈️',
  },
  {
    id: '8',
    name: 'Fitness Guru',
    slug: 'fitness-guru',
    avatar: '/images/agents/fitness.png',
    specialty: 'Health & Fitness',
    description: 'Transform your body and mind',
    color: 'from-red-500 to-orange-600',
    emoji: '💪',
  },
  {
    id: '9',
    name: 'Comedy King',
    slug: 'comedy-king',
    avatar: '/images/agents/comedy.png',
    specialty: 'Entertainment',
    description: 'Laughter is the best medicine',
    color: 'from-yellow-500 to-orange-600',
    emoji: '😂',
  },
  {
    id: '10',
    name: 'Drama Queen',
    slug: 'drama-queen',
    avatar: '/images/agents/drama.png',
    specialty: 'Creative Writing',
    description: 'Dramatic storytelling expert',
    color: 'from-violet-500 to-purple-600',
    emoji: '🎭',
  },
  {
    id: '11',
    name: 'Professor Astrology',
    slug: 'professor-astrology',
    avatar: '/images/agents/astrology.png',
    specialty: 'Astrology & Spirituality',
    description: 'Decode the stars and beyond',
    color: 'from-indigo-500 to-blue-600',
    emoji: '🔮',
  },
  {
    id: '12',
    name: 'Nid Gaming',
    slug: 'nid-gaming',
    avatar: '/images/agents/gaming.png',
    specialty: 'Gaming & Esports',
    description: 'Level up your gaming skills',
    color: 'from-cyan-500 to-blue-600',
    emoji: '🎮',
  },
];

// Duplicate agents for infinite scroll effect
const duplicatedAgents = [...agents, ...agents];

export default function AgentCardsMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Reset when we've scrolled past the first set of cards
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    // Start animation after a short delay
    const timer = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 500);

    // Pause on hover
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationId);
    };

    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-500/10 rounded-full filter blur-[100px]"></div>
      </div>

      {/* Header */}
      <div className="container-custom relative z-10 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 rounded-full text-brand-300 text-sm font-medium mb-4 border border-brand-500/30">
            <span className="text-lg">🤖</span>
            Meet Our AI Agents
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            18+ Unique AI
            <span className="bg-gradient-to-r from-brand-400 via-accent-400 to-brand-500 bg-clip-text text-transparent"> Personalities</span>
          </h2>
          <p className="text-lg text-neural-400">
            Each agent brings specialized expertise and a unique personality. Find your perfect AI companion.
          </p>
        </div>
      </div>

      {/* Scrolling Cards Container */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-4 md:px-8"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedAgents.map((agent, index) => (
          <Link
            key={`${agent.id}-${index}`}
            href={`/agents/${agent.slug}`}
            className="group flex-shrink-0 w-[280px] md:w-[320px]"
          >
            <div className="relative h-[380px] md:h-[420px] rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl hover:shadow-brand-500/20">
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Top Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/20">
                  {agent.emoji} {agent.specialty}
                </span>
              </div>

              {/* Avatar Area */}
              <div className="relative h-[200px] md:h-[220px] overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-20`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/30 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <span className="text-5xl md:text-6xl">{agent.emoji}</span>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/5 rounded-full blur-lg"></div>
              </div>

              {/* Content */}
              <div className="p-5 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-brand-300 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-neural-400 mb-4 line-clamp-2">
                  {agent.description}
                </p>
                
                {/* CTA Button */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neural-500 uppercase tracking-wider">Chat Now</span>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${agent.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}>
                <div className={`absolute -inset-1 bg-gradient-to-r ${agent.color} opacity-20 blur-xl`}></div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Button */}
      <div className="container-custom relative z-10 mt-12 text-center">
        <Link 
          href="/agents" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/30 hover:scale-105 group"
        >
          <span>Explore All 18 Agents</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neural-950 to-transparent pointer-events-none"></div>
    </section>
  );
}
