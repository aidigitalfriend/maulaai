'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Award, CheckCircle, XCircle, Lightbulb, Target, Shield, Zap, MessageSquare, Users } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function BestPracticesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const doList = [
    { title: 'Write Clear Prompts', desc: 'Be specific and detailed in your system prompts to guide agent behavior.' },
    { title: 'Use Context Wisely', desc: 'Provide relevant context without overwhelming the agent with unnecessary information.' },
    { title: 'Test Thoroughly', desc: 'Test your agents with various inputs to ensure consistent, accurate responses.' },
    { title: 'Monitor Performance', desc: 'Track metrics like response time, accuracy, and user satisfaction regularly.' },
    { title: 'Iterate and Improve', desc: 'Continuously refine prompts and configurations based on feedback.' },
    { title: 'Set Guardrails', desc: 'Define clear boundaries and safety filters for your agent responses.' }
  ];

  const dontList = [
    { title: 'Vague Instructions', desc: 'Avoid ambiguous prompts that can lead to inconsistent responses.' },
    { title: 'Overloading Context', desc: 'Don\'t stuff too much information into a single conversation.' },
    { title: 'Ignoring Errors', desc: 'Never ignore error handling - gracefully manage failures.' },
    { title: 'Skipping Testing', desc: 'Don\'t deploy agents without thorough testing across edge cases.' },
    { title: 'Static Configuration', desc: 'Avoid set-and-forget - agents need ongoing optimization.' },
    { title: 'Unlimited Scope', desc: 'Don\'t let agents handle tasks outside their trained domain.' }
  ];

  const tips = [
    { icon: Target, title: 'Define Clear Goals', desc: 'Every agent should have a specific purpose. Define what success looks like before building.', color: '#00d4ff' },
    { icon: MessageSquare, title: 'Craft Better Prompts', desc: 'Use examples, specify format expectations, and include edge case handling in prompts.', color: '#00ff88' },
    { icon: Shield, title: 'Implement Safety', desc: 'Always include content moderation, error boundaries, and fallback responses.', color: '#f59e0b' },
    { icon: Users, title: 'Consider Users', desc: 'Design agent interactions with your end users in mind - focus on helpful, natural conversations.', color: '#a855f7' }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.do-item',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.dos-section', start: 'top 85%' } }
    );

    gsap.fromTo('.dont-item',
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.donts-section', start: 'top 85%' } }
    );

    gsap.fromTo('.tip-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.tips-grid', start: 'top 85%' } }
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,255,136,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs/agents" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00ff88] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Agent Docs
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Award className="w-4 h-4 text-[#00ff88]" />
              <span className="text-gray-300">Expert Guidelines</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Best Practices</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Learn proven strategies for building effective, reliable AI agents
            </p>
          </div>
        </div>
      </section>

      {/* Do and Don't */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Do */}
          <div className="dos-section">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#00ff88]/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#00ff88]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Do</h2>
            </div>
            <div className="space-y-4">
              {doList.map((item, i) => (
                <div key={i} className="do-item glass-card rounded-xl p-4 opacity-0 hover:border-[#00ff88]/30">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Don't */}
          <div className="donts-section">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#ef4444]/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-[#ef4444]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Don't</h2>
            </div>
            <div className="space-y-4">
              {dontList.map((item, i) => (
                <div key={i} className="dont-item glass-card rounded-xl p-4 opacity-0 hover:border-[#ef4444]/30">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-[#f59e0b]" />
              <h2 className="text-3xl font-bold metallic-text">Pro Tips</h2>
            </div>
            <p className="text-gray-400">Expert advice for building world-class agents</p>
          </div>
          <div className="tips-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <div key={i} className="tip-card glass-card rounded-2xl p-6 opacity-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${tip.color}20`, border: `1px solid ${tip.color}40` }}>
                    <Icon className="w-6 h-6" style={{ color: tip.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{tip.title}</h3>
                  <p className="text-gray-500 text-sm">{tip.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold metallic-text mb-6">📋 Pre-Deployment Checklist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'System prompt is clear and tested',
                'Temperature setting matches use case',
                'Error handling is implemented',
                'Rate limits are configured',
                'Safety filters are enabled',
                'Fallback responses are defined',
                'Performance metrics are tracked',
                'User feedback mechanism exists'
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
                  <div className="w-5 h-5 rounded border-2 border-[#00d4ff] flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-[#00d4ff] opacity-0 hover:opacity-100" />
                  </div>
                  <span className="text-gray-400 text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Ready to Build Better Agents?</h2>
          <p className="text-gray-400 mb-8">Apply these best practices to create exceptional AI experiences</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents/create" className="px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-xl font-semibold text-black hover:opacity-90 transition-all">
              Create Agent
            </Link>
            <Link href="/docs/agents/troubleshooting" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Troubleshooting →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
