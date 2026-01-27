'use client';

import { useRef } from 'react';
import AgentCard from '@/components/AgentCard';
import Link from 'next/link';
import { allAgents } from './registry';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Shuffle, BookOpen, Bot, Users, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function AgentsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const agents = allAgents;

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.hero-badge', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out',
    })
      .from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.4')
      .from('.hero-buttons', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power3.out',
      }, '-=0.3')
      .from('.hero-stats', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power3.out',
      }, '-=0.2');

    gsap.from('.agent-card-wrapper', {
      scrollTrigger: {
        trigger: '.agents-grid',
        start: 'top 85%',
      },
      opacity: 0,
      y: 40,
      stagger: 0.08,
      duration: 0.6,
      ease: 'power3.out',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm mb-8">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">AI Personalities</span>
          </div>

          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Meet Our AI Agents
            </span>
          </h1>

          <p className="hero-subtitle text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Choose from {agents.length} specialized AI agents, each bringing unique expertise and personality 
            to help you tackle any challenge. From Einstein&apos;s physics to Comedy King&apos;s humor!
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/agents/random" 
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(59, 130, 246, 0.4))',
                border: '1px solid rgba(6, 182, 212, 0.5)',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)',
              }}
            >
              <Shuffle className="w-5 h-5" />
              Surprise Me
            </Link>
            <Link 
              href="/docs/agents" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 hover:bg-white/5"
            >
              <BookOpen className="w-5 h-5" />
              How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats flex flex-wrap justify-center gap-8 md:gap-12">
            {[
              { icon: Bot, value: agents.length.toString(), label: 'AI Agents' },
              { icon: Users, value: '10K+', label: 'Active Users' },
              { icon: Zap, value: '99.9%', label: 'Uptime' },
            ].map((stat, idx) => (
              <div 
                key={stat.label}
                className="flex items-center gap-3 px-4 py-2 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <stat.icon className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/50">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="agents-grid relative pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <div key={agent.id} className="agent-card-wrapper">
                <AgentCard agent={agent} index={index} />
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div
              className="inline-block p-8 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1))',
                border: '1px solid rgba(6, 182, 212, 0.2)',
              }}
            >
              <p className="text-white/60 mb-6 text-lg">
                All {agents.length} amazing AI agents are ready to help you! 🚀
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/pricing" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  View Pricing
                </Link>
                <Link 
                  href="/dark-theme" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 hover:bg-white/5"
                >
                  Try Dark Theme
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}