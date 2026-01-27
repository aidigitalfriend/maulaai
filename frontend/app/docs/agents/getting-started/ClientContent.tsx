'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, CheckCircle, Zap, BookOpen, Rocket, Settings, Code, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function GettingStartedContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  const benefits = [
    { icon: Zap, title: 'Task Automation', desc: 'Automate repetitive tasks and workflows with intelligent agents.', color: '#00ff88' },
    { icon: CheckCircle, title: '24/7 Availability', desc: 'Access your agents anytime, anywhere without downtime.', color: '#00d4ff' },
    { icon: Settings, title: 'Personalization', desc: 'Customize agents to match your specific needs and preferences.', color: '#a855f7' },
    { icon: Rocket, title: 'Scalability', desc: 'Deploy agents across multiple platforms and use cases.', color: '#f59e0b' }
  ];

  const steps = [
    { num: 1, title: 'Create an Account', desc: "Visit One Last AI and sign up for a free account. You'll get immediate access to all available agents." },
    { num: 2, title: 'Browse Agents', desc: 'Explore our library of pre-built agents, each specialized for different tasks and domains.' },
    { num: 3, title: 'Start Chatting', desc: 'Click on any agent to start a conversation. Ask questions, get help, or explore capabilities.' },
    { num: 4, title: 'Customize & Deploy', desc: 'Configure the agent settings and integrate into your workflow or application.' }
  ];

  const nextSteps = [
    { title: 'Agent Configuration', href: '/docs/agents/configuration', desc: 'Learn how to customize agent behavior' },
    { title: 'API Reference', href: '/docs/agents/api-reference', desc: 'Integrate agents into your apps' },
    { title: 'Best Practices', href: '/docs/agents/best-practices', desc: 'Tips for getting the most out of agents' }
  ];

  useGSAP(() => {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.benefit-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.benefits-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.step-card',
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.steps-section', start: 'top 80%' } }
    );

    gsap.fromTo('.next-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.next-section', start: 'top 85%' } }
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs/agents" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00d4ff] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Agent Docs
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <span className="text-xl">🚀</span>
              <span className="text-gray-300">Quick Start Guide</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Getting Started</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6 opacity-0">
              Learn the fundamentals of creating, deploying, and managing AI agents
            </p>
            <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
              <span>📖 8 min read</span>
              <span>•</span>
              <span>Updated: January 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* What Are Agents */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 rounded-xl flex items-center justify-center border border-[#00d4ff]/30">
                <Zap className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h2 className="text-2xl font-bold text-white">What Are AI Agents?</h2>
            </div>
            <p className="text-gray-400 mb-8">
              AI agents are intelligent digital assistants powered by advanced language models and machine learning. 
              They can understand natural language, process complex information, and provide meaningful responses tailored 
              to specific tasks or domains.
            </p>
            <div className="benefits-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="benefit-card flex gap-3 p-4 bg-black/30 rounded-xl border border-white/10 opacity-0">
                    <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: benefit.color }} />
                    <div>
                      <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                      <p className="text-gray-500 text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] steps-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Quick Start Guide</h2>
            <p className="text-gray-400">Get up and running in 4 simple steps</p>
          </div>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="step-card glass-card rounded-2xl p-6 opacity-0">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-[#0066ff] rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xl">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-24 px-6 next-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Next Steps</h2>
            <p className="text-gray-400">Continue learning with these guides</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextSteps.map((item, i) => (
              <Link key={i} href={item.href} className="next-card glass-card rounded-xl p-6 group block opacity-0 hover:border-[#00d4ff]/30">
                <h3 className="font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{item.desc}</p>
                <span className="text-[#00d4ff] text-sm flex items-center gap-1">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">Explore our library of AI agents and start building today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold hover:opacity-90 transition-all">
              Browse Agents
            </Link>
            <Link href="/agents/create" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Create Agent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
