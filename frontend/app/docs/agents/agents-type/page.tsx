'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Bot, MessageSquare, Code, Briefcase, GraduationCap, Heart, Sparkles, Zap, Settings, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function AgentsTypePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const agentTypes = [
    { 
      icon: MessageSquare, 
      title: 'Conversational Agents', 
      desc: 'General-purpose chatbots for customer support, FAQ handling, and natural conversations.',
      features: ['Natural language understanding', 'Multi-turn conversations', 'Context awareness'],
      useCases: ['Customer service', 'Help desk', 'Virtual assistants'],
      color: '#00d4ff'
    },
    { 
      icon: Code, 
      title: 'Code Assistants', 
      desc: 'Specialized agents for programming help, code review, debugging, and technical documentation.',
      features: ['Multi-language support', 'Code generation', 'Bug detection'],
      useCases: ['Development teams', 'Code review', 'Learning to code'],
      color: '#00ff88'
    },
    { 
      icon: Briefcase, 
      title: 'Business Analysts', 
      desc: 'Data-focused agents for market research, report generation, and business intelligence.',
      features: ['Data analysis', 'Report generation', 'Trend identification'],
      useCases: ['Market research', 'Financial analysis', 'Strategy planning'],
      color: '#f59e0b'
    },
    { 
      icon: GraduationCap, 
      title: 'Educational Tutors', 
      desc: 'Learning-focused agents that adapt to student needs and provide personalized education.',
      features: ['Adaptive learning', 'Progress tracking', 'Multiple subjects'],
      useCases: ['Self-study', 'Homework help', 'Skill development'],
      color: '#a855f7'
    },
    { 
      icon: Heart, 
      title: 'Wellness Coaches', 
      desc: 'Supportive agents for mental health, fitness guidance, and personal development.',
      features: ['Empathetic responses', 'Goal tracking', 'Motivational support'],
      useCases: ['Mental wellness', 'Fitness tracking', 'Habit building'],
      color: '#ec4899'
    },
    { 
      icon: Sparkles, 
      title: 'Creative Writers', 
      desc: 'Content creation agents for copywriting, storytelling, and marketing materials.',
      features: ['Multiple writing styles', 'Brand voice matching', 'SEO optimization'],
      useCases: ['Content marketing', 'Social media', 'Creative writing'],
      color: '#6366f1'
    }
  ];

  const comparison = [
    { feature: 'Response Style', conversational: 'Natural, friendly', code: 'Technical, precise', business: 'Professional, data-driven' },
    { feature: 'Temperature', conversational: '0.7 - 0.9', code: '0.1 - 0.3', business: '0.3 - 0.5' },
    { feature: 'Context Window', conversational: 'Medium', code: 'Large', business: 'Large' },
    { feature: 'Memory', conversational: 'Session-based', code: 'Project-based', business: 'Long-term' }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.agent-card',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.agents-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.table-row',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.comparison-table', start: 'top 85%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs/agents" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#6366f1] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Agent Docs
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Bot className="w-4 h-4 text-[#6366f1]" />
              <span className="text-gray-300">Agent Categories</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Agent Types</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Discover the different types of AI agents and find the perfect fit for your needs
            </p>
          </div>
        </div>
      </section>

      {/* Agent Types Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Agent Categories</h2>
            <p className="text-gray-400">Explore specialized agents for every use case</p>
          </div>
          <div className="agents-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentTypes.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div key={i} className="agent-card glass-card rounded-2xl p-6 opacity-0 group hover:scale-[1.02] transition-transform">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}40` }}>
                    <Icon className="w-7 h-7" style={{ color: agent.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{agent.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{agent.desc}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.features.map((f, j) => (
                        <span key={j} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">{f}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Use Cases</h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.useCases.map((u, j) => (
                        <span key={j} className="px-2 py-1 rounded text-xs" style={{ background: `${agent.color}15`, color: agent.color }}>{u}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Quick Comparison</h2>
            <p className="text-gray-400">Key differences between agent types</p>
          </div>
          <div className="comparison-table glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/10 text-gray-400 text-sm font-medium">
              <div>Feature</div>
              <div className="text-center">Conversational</div>
              <div className="text-center">Code Assistant</div>
              <div className="text-center">Business</div>
            </div>
            {comparison.map((row, i) => (
              <div key={i} className="table-row grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors opacity-0">
                <div className="text-white font-medium">{row.feature}</div>
                <div className="text-center text-gray-400 text-sm">{row.conversational}</div>
                <div className="text-center text-gray-400 text-sm">{row.code}</div>
                <div className="text-center text-gray-400 text-sm">{row.business}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Right */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-[#00d4ff]" />
              <h2 className="text-2xl font-bold text-white">Choosing the Right Agent</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#00d4ff]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#00d4ff] font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Define Your Use Case</h4>
                  <p className="text-gray-500 text-sm">What specific problem are you trying to solve? Be clear about the expected inputs and outputs.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#00ff88]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#00ff88] font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Match Capabilities</h4>
                  <p className="text-gray-500 text-sm">Choose an agent type whose built-in features align with your requirements.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#a855f7]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#a855f7] font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Customize & Test</h4>
                  <p className="text-gray-500 text-sm">Fine-tune the configuration and run thorough tests before deployment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Find Your Perfect Agent</h2>
          <p className="text-gray-400 mb-8">Browse our library of pre-built agents or create your own</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents" className="px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl font-semibold hover:opacity-90 transition-all">
              Browse Agents
            </Link>
            <Link href="/agents/create" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              Create Custom <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
