'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Heart, Zap, Shield, Lightbulb, Users, Star, Award, Globe, Target, Rocket, Eye } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function AboutOverviewPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const values = [
    { icon: Heart, title: 'User-First', desc: 'Every decision starts with our users in mind', color: '#ec4899' },
    { icon: Zap, title: 'Innovation', desc: 'Constantly pushing the boundaries of AI', color: '#f59e0b' },
    { icon: Shield, title: 'Trust', desc: 'Building secure and reliable AI systems', color: '#00d4ff' },
    { icon: Lightbulb, title: 'Transparency', desc: 'Open and honest about our technology', color: '#00ff88' },
    { icon: Users, title: 'Collaboration', desc: 'Better together, with our users and partners', color: '#a855f7' },
    { icon: Star, title: 'Excellence', desc: 'Striving for the highest quality in all we do', color: '#6366f1' }
  ];

  const milestones = [
    { year: '2023', title: 'Founded', desc: 'One Last AI was founded with a vision to democratize AI access' },
    { year: '2024', title: 'First Million', desc: 'Reached 1 million conversations processed globally' },
    { year: '2025', title: 'Global Expansion', desc: 'Expanded to 150+ countries with enterprise features' },
    { year: '2026', title: 'The Future', desc: 'Continuing to innovate with next-gen AI capabilities' }
  ];

  const platforms = [
    { name: 'OpenAI', desc: 'GPT-4 and beyond', color: '#00d4ff' },
    { name: 'Anthropic', desc: 'Claude models', color: '#a855f7' },
    { name: 'Google', desc: 'Gemini AI', color: '#00ff88' },
    { name: 'Mistral', desc: 'Open-weight models', color: '#f59e0b' },
    { name: 'xAI', desc: 'Grok models', color: '#ef4444' },
    { name: 'Meta', desc: 'Llama models', color: '#6366f1' }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.mission-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.mission-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.value-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.values-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.milestone-item',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.timeline-section', start: 'top 85%' } }
    );

    gsap.fromTo('.platform-card',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.platforms-grid', start: 'top 85%' } }
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
          <Link href="/about" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00d4ff] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to About
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Globe className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-gray-300">Company Overview</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Our Story</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              From a vision to democratize AI to a platform serving millions worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mission-grid grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="mission-card glass-card rounded-2xl p-8 opacity-0">
              <div className="w-14 h-14 bg-[#00d4ff]/20 rounded-xl flex items-center justify-center mb-6 border border-[#00d4ff]/40">
                <Target className="w-7 h-7 text-[#00d4ff]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                To democratize access to artificial intelligence by providing intuitive, powerful, and 
                accessible AI agents that empower individuals and businesses to achieve more. We believe 
                AI should be a tool that augments human capability, not replaces it.
              </p>
            </div>
            <div className="mission-card glass-card rounded-2xl p-8 opacity-0">
              <div className="w-14 h-14 bg-[#a855f7]/20 rounded-xl flex items-center justify-center mb-6 border border-[#a855f7]/40">
                <Eye className="w-7 h-7 text-[#a855f7]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-gray-400 leading-relaxed">
                A world where everyone has access to intelligent AI assistance that helps them learn, 
                create, and solve problems more effectively. We envision AI as a collaborative partner 
                that enhances human potential across all domains of life and work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Our Core Values</h2>
            <p className="text-gray-400">The principles that guide our decisions and actions</p>
          </div>
          <div className="values-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="value-card glass-card rounded-2xl p-6 opacity-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${value.color}20`, border: `1px solid ${value.color}40` }}>
                    <Icon className="w-6 h-6" style={{ color: value.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-gray-500 text-sm">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 timeline-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Our Journey</h2>
            <p className="text-gray-400">Key milestones in our story</p>
          </div>
          <div className="space-y-6">
            {milestones.map((milestone, i) => (
              <div key={i} className="milestone-item glass-card rounded-xl p-6 flex gap-6 items-start opacity-0">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00d4ff] to-[#0066ff] rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  {milestone.year}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                  <p className="text-gray-400">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Powered By Leading AI</h2>
            <p className="text-gray-400">We integrate with the world&apos;s most advanced AI platforms</p>
          </div>
          <div className="platforms-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {platforms.map((platform, i) => (
              <div key={i} className="platform-card glass-card rounded-xl p-4 text-center opacity-0 hover:scale-105 transition-transform">
                <div className="text-lg font-bold mb-1" style={{ color: platform.color }}>{platform.name}</div>
                <div className="text-gray-500 text-xs">{platform.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Ready to Experience the Future?</h2>
          <p className="text-gray-400 mb-8">Join thousands of users already transforming their work with AI</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold hover:opacity-90 transition-all">
              Explore Agents
            </Link>
            <Link href="/about/team" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Meet the Team →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
