'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Rocket, Bot, Zap, RefreshCw, Lightbulb, Ship } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function TutorialsDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const tutorials = [
    { title: "Getting Started", description: "Learn the basics and create your first AI agent in minutes", category: "Beginner", readTime: "5 min", href: "#getting-started", Icon: Rocket, icon: "🚀" },
    { title: "Creating Your First Bot", description: "Step-by-step guide to build a functional bot", category: "Beginner", readTime: "15 min", href: "#first-bot", Icon: Bot, icon: "🤖" },
    { title: "Advanced Features", description: "Explore advanced configuration and customization", category: "Advanced", readTime: "20 min", href: "#advanced", Icon: Zap, icon: "⚡" },
    { title: "Building Workflows", description: "Create complex multi-step conversations and workflows", category: "Advanced", readTime: "25 min", href: "#workflows", Icon: RefreshCw, icon: "🔄" },
    { title: "Real-World Use Cases", description: "Learn from real-world examples and best practices", category: "Examples", readTime: "30 min", href: "#usecases", Icon: Lightbulb, icon: "💡" },
    { title: "Deployment Guide", description: "Deploy your agents to production", category: "Production", readTime: "15 min", href: "#deployment", Icon: Ship, icon: "🚢" }
  ];

  const stats = [
    { value: "50+", label: "Tutorials & Guides" },
    { value: "100+", label: "Code Examples" },
    { value: "10+ hrs", label: "Learning Content" }
  ];

  const gettingStartedSteps = [
    { step: 1, title: "Sign Up & Get API Key", items: ["Create a free account at onelastai.com", "Navigate to Settings → Developer → API Keys", "Generate and copy your API key"] },
    { step: 2, title: "Choose Your Agent", items: ["Browse the agent library at /agents", "Select an agent that fits your use case", "Click 'Try Now' to start a conversation"] },
    { step: 3, title: "Integrate with Your App", items: ["Install our SDK for your language", "Initialize the client with your API key", "Start sending messages to your agent"] }
  ];

  useGSAP(() => {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.hero-buttons', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');

    gsap.fromTo('.stat-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.stats-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.tutorial-card',
      { opacity: 0, y: 40, rotate: 2 },
      { opacity: 1, y: 0, rotate: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.tutorials-grid', start: 'top 80%' } }
    );

    gsap.fromTo('.step-block',
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.steps-section', start: 'top 80%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(99,102,241,0.4); transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(99,102,241,0.2); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1f1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Documentation
          </Link>
          
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <span className="text-xl">🎓</span>
              <span className="text-gray-300">Learn & Build</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Tutorials & Guides</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 opacity-0">
              Learn how to build, configure, and deploy AI agents from beginner to advanced
            </p>
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center opacity-0">
              <a href="#getting-started" className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold hover:opacity-90 transition-all">Start Learning</a>
              <a href="#browse" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">Browse Tutorials</a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5 stats-grid">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card glass-card rounded-2xl p-6 text-center opacity-0">
              <div className="text-3xl font-bold text-indigo-400 mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Tutorials */}
      <section id="browse" className="py-24 px-6 tutorials-grid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Browse Tutorials</h2>
            <p className="text-gray-400">Find the right tutorial for your skill level</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial, i) => (
              <a key={i} href={tutorial.href} className="tutorial-card glass-card rounded-2xl p-6 group block opacity-0">
                <div className="text-4xl mb-4">{tutorial.icon}</div>
                <span className="text-xs font-medium px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">{tutorial.category}</span>
                <h3 className="text-lg font-bold text-white mt-4 mb-2 group-hover:text-indigo-400 transition-colors">{tutorial.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{tutorial.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">⏱️ {tutorial.readTime}</span>
                  <span className="text-indigo-400 text-sm font-medium">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] steps-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Getting Started</h2>
            <p className="text-gray-400">Create your first AI agent in just a few steps</p>
          </div>

          <div className="space-y-8">
            {gettingStartedSteps.map((step, i) => (
              <div key={i} className="step-block glass-card rounded-2xl p-8 opacity-0">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xl">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                    <ul className="space-y-3">
                      {step.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-3 text-gray-400">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* First Bot Tutorial */}
      <section id="first-bot" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">🤖</div>
              <h2 className="text-2xl font-bold text-white">Creating Your First Bot</h2>
            </div>
            <p className="text-gray-400 mb-6">
              In this tutorial, you&apos;ll learn how to create a fully functional AI chatbot that can answer questions, provide assistance, and integrate with your application.
            </p>
            <div className="bg-black/30 rounded-xl p-6 border border-white/10">
              <h4 className="font-bold text-white mb-4">What you&apos;ll learn:</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2"><span className="text-indigo-400">✓</span> Setting up your development environment</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400">✓</span> Creating and configuring an agent</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400">✓</span> Handling conversations and context</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400">✓</span> Deploying to production</li>
              </ul>
            </div>
            <div className="mt-6">
              <Link href="/docs/agents/getting-started" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold hover:opacity-90 transition-all">
                Start Tutorial →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold metallic-text mb-4">Ready to Learn More?</h2>
          <p className="text-gray-400 mb-8">Explore our comprehensive documentation and start building today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/agents" className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold hover:opacity-90 transition-all">
              Agent Documentation
            </Link>
            <Link href="/docs/api" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              API Reference
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
