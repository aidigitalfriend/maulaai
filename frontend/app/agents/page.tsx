'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import Link from 'next/link';
import Image from 'next/image';
import { allAgents } from './registry';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import AgentDetailsModal from '@/components/AgentDetailsModal';
import { useSubscriptions } from '@/contexts/SubscriptionContext';
import type { AgentConfig } from '@/app/agents/types';

// Agent Card Component with GSAP
function AgentCardGSAP({ agent, index }: { agent: AgentConfig; index: number }) {
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const { hasActiveSubscription, getDaysRemaining, loading } = useSubscriptions();

  const isSubscribed = hasActiveSubscription(agent.id);
  const daysRemaining = getDaysRemaining(agent.id);

  const linkHref = isSubscribed
    ? `/agents/${agent.id}`
    : `/subscribe?agent=${encodeURIComponent(agent.name)}&slug=${agent.id}`;

  const actionText = loading
    ? 'Checking...'
    : isSubscribed
      ? `✓ Subscribed (${daysRemaining}d left)`
      : 'Subscribe to Access';

  const handleCardHover = (entering: boolean) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    
    gsap.to(card, { 
      y: entering ? -12 : 0, 
      scale: entering ? 1.02 : 1, 
      duration: 0.4, 
      ease: 'power2.out' 
    });
    gsap.to(card.querySelector('.card-glow'), { 
      opacity: entering ? 1 : 0, 
      scale: entering ? 1 : 0.8,
      duration: 0.4 
    });
    gsap.to(card.querySelector('.avatar-container'), { 
      scale: entering ? 1.1 : 1, 
      rotate: entering ? 5 : 0,
      duration: 0.4, 
      ease: 'back.out(1.7)' 
    });
    gsap.to(card.querySelector('.card-arrow'), { 
      x: entering ? 8 : 0, 
      opacity: entering ? 1 : 0.5,
      duration: 0.3 
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-details-button]')) {
      e.preventDefault();
      return;
    }
  };

  return (
    <>
      <Link
        ref={cardRef}
        href={linkHref}
        className="agent-card-gsap group relative block"
        onClick={handleCardClick}
        onMouseEnter={() => handleCardHover(true)}
        onMouseLeave={() => handleCardHover(false)}
      >
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden h-full">
          {/* Glow effect */}
          <div className={`card-glow absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 blur-xl`} style={{ transform: 'scale(0.8)' }} />
          
          {/* Corner accents */}
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />

          <div className="relative z-10">
            {/* Avatar */}
            <div className={`avatar-container w-16 h-16 mb-4 bg-gradient-to-br ${agent.color} rounded-xl flex items-center justify-center overflow-hidden shadow-lg`}>
              <Image
                src={agent.avatarUrl}
                alt={`${agent.name} avatar`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>

            {/* Name */}
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors truncate" title={agent.name}>
              {agent.name}
            </h3>

            {/* Specialty */}
            <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${agent.color} bg-opacity-20 text-white text-xs font-semibold mb-3`}>
              {agent.specialty}
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{agent.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {agent.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs font-medium bg-gray-800/80 text-gray-300 rounded-full border border-gray-700/50"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Area */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
              <span className={`text-sm font-medium ${isSubscribed ? 'text-green-400' : 'text-cyan-400'}`}>
                {actionText}
              </span>

              <div className="flex items-center gap-2">
                {agent.details && (
                  <button
                    data-details-button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDetails(true);
                    }}
                    className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200 hover:scale-110"
                    title="View agent details"
                  >
                    <InformationCircleIcon className="w-5 h-5" />
                  </button>
                )}
                <span className="card-arrow text-cyan-400 opacity-50 text-xl">→</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {agent.details && (
        <AgentDetailsModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          agentName={agent.name}
          agentIcon={agent.details.icon}
          sections={agent.details.sections}
        />
      )}
    </>
  );
}

export default function AgentsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const agents = allAgents;

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero animations
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSubtitle = new SplitText('.hero-subtitle', { type: 'words' });

      gsap.set(heroTitle.chars, { y: 100, opacity: 0, rotateX: -90 });
      gsap.set(heroSubtitle.words, { y: 40, opacity: 0 });
      gsap.set('.hero-icon', { scale: 0, rotation: -180 });
      gsap.set('.hero-badge', { scale: 0, opacity: 0 });
      gsap.set('.hero-btn', { y: 30, opacity: 0 });

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      heroTl
        .to('.hero-icon', { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.02 }, '-=0.4')
        .to(heroSubtitle.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.02 }, '-=0.4')
        .to('.hero-badge', { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(1.7)' }, '-=0.3')
        .to('.hero-btn', { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }, '-=0.2');

      // Agent cards with staggered reveal
      gsap.utils.toArray<HTMLElement>('.agent-card-gsap').forEach((card, i) => {
        gsap.set(card, { y: 80, opacity: 0, scale: 0.9, rotateY: -10 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(card, { 
              y: 0, 
              opacity: 1, 
              scale: 1, 
              rotateY: 0,
              duration: 0.7, 
              delay: (i % 4) * 0.1, 
              ease: 'power3.out' 
            });
          }
        });
      });

      // Footer section
      gsap.set('.footer-section', { y: 60, opacity: 0 });
      ScrollTrigger.create({
        trigger: '.footer-section',
        start: 'top 90%',
        onEnter: () => {
          gsap.to('.footer-section', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
        }
      });

      // Floating particles
      gsap.utils.toArray<HTMLElement>('.particle').forEach((p, i) => {
        gsap.to(p, {
          y: 'random(-60, 60)',
          x: 'random(-40, 40)',
          duration: 'random(4, 7)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} />
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle absolute w-1.5 h-1.5 bg-cyan-400/40 rounded-full" style={{ left: `${5 + i * 6}%`, top: `${10 + (i % 5) * 18}%` }} />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-16">
          <div className="hero-icon inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl border border-cyan-500/30 mb-6">
            <span className="text-4xl">🤖</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">Meet Our AI Personalities</span>
          </h1>
          <p className="hero-subtitle text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Choose from 18 specialized AI agents, each bringing unique expertise and personality to help you tackle any challenge. From Einstein's physics to Comedy King's humor!
          </p>
          <div className="flex justify-center gap-3 flex-wrap mb-8">
            <span className="hero-badge px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono">18_AGENTS</span>
            <span className="hero-badge px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-mono">SPECIALIZED</span>
            <span className="hero-badge px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm font-mono">AI_POWERED</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents/random" className="hero-btn inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105">
              🎲 Surprise Me
            </Link>
            <Link href="/docs/agents" className="hero-btn inline-flex items-center justify-center px-8 py-4 bg-white/5 backdrop-blur-sm text-white font-bold rounded-xl border border-gray-700/50 hover:bg-white/10 transition-all">
              📚 How It Works
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </section>

      {/* Agents Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent, index) => (
            <AgentCardGSAP key={agent.id} agent={agent} index={index} />
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <section className="footer-section relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="relative p-10 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-xl" />
          
          <p className="text-gray-400 text-lg mb-6">
            All <span className="text-cyan-400 font-bold">18 amazing AI agents</span> are ready to help you! 🚀
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dark-theme" className="inline-flex items-center justify-center px-8 py-3 bg-white/5 backdrop-blur-sm text-white font-semibold rounded-xl border border-gray-700/50 hover:bg-white/10 transition-all">
              🌙 Try Dark Theme
            </Link>
            <Link href="/studio" className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg shadow-purple-500/25 transition-all transform hover:scale-105">
              🎨 Open Studio
            </Link>
          </div>
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}
