'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Cog, Users, Code, Lightbulb, Wrench, ArrowRight, ArrowLeft } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function DocsAgentsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const agentsRef = useRef<HTMLDivElement>(null);

  const agentDocs = [
    {
      title: "Getting Started with Agents",
      description: "Learn the basics of creating and deploying AI agents",
      category: "Introduction",
      readTime: "5 min",
      href: "/docs/agents/getting-started",
      Icon: BookOpen
    },
    {
      title: "Agent Configuration",
      description: "How to configure your agents for optimal performance",
      category: "Configuration",
      readTime: "8 min",
      href: "/docs/agents/configuration",
      Icon: Cog
    },
    {
      title: "Available Agent Types",
      description: "Explore all the different types of agents you can deploy",
      category: "Reference",
      readTime: "12 min",
      href: "/docs/agents/agents-type",
      Icon: Users
    },
    {
      title: "Agent API Reference",
      description: "Complete API documentation for agent integration",
      category: "API",
      readTime: "15 min",
      href: "/docs/agents/api-reference",
      Icon: Code
    },
    {
      title: "Best Practices",
      description: "Tips and tricks for getting the most out of your agents",
      category: "Guide",
      readTime: "10 min",
      href: "/docs/agents/best-practices",
      Icon: Lightbulb
    },
    {
      title: "Troubleshooting",
      description: "Common issues and how to resolve them",
      category: "Support",
      readTime: "6 min",
      href: "/docs/agents/troubleshooting",
      Icon: Wrench
    }
  ];

  const availableAgents = [
    { name: "Ben Sega", slug: "ben-sega", specialty: "Gaming & Entertainment", emoji: "🎮" },
    { name: "Einstein", slug: "einstein", specialty: "Scientific Research", emoji: "🔬" },
    { name: "Chef Biew", slug: "chef-biew", specialty: "Culinary Arts", emoji: "👨‍🍳" },
    { name: "Tech Wizard", slug: "tech-wizard", specialty: "Technology Support", emoji: "💻" },
    { name: "Travel Buddy", slug: "travel-buddy", specialty: "Travel Planning", emoji: "✈️" },
    { name: "Fitness Guru", slug: "fitness-guru", specialty: "Health & Fitness", emoji: "💪" },
  ];

  useGSAP(() => {
    // Hero animation
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40, rotateX: 15 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, '-=0.4');

    // Doc cards animation
    const docCards = gsap.utils.toArray('.doc-card');
    docCards.forEach((card: any, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7,
          delay: i * 0.1,
          ease: 'back.out(1.5)',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' }
        }
      );
    });

    // Agent cards animation
    const agentCards = gsap.utils.toArray('.agent-card');
    agentCards.forEach((card: any, i) => {
      gsap.fromTo(card,
        { opacity: 0, x: i % 2 === 0 ? -40 : 40, rotate: i % 2 === 0 ? -5 : 5 },
        {
          opacity: 1, x: 0, rotate: 0,
          duration: 0.6,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: agentsRef.current, start: 'top 80%' }
        }
      );
    });

    // CTA animation
    gsap.fromTo('.cta-section',
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.cta-section', start: 'top 85%' }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Global Styles */}
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(0, 212, 255, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 212, 255, 0.15);
        }
        .metallic-text {
          background: linear-gradient(to bottom, #ffffff, #ffffff, #9ca3af);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00d4ff] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </Link>
          
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm font-medium mb-6 opacity-0">
              <span className="text-xl">🤖</span>
              <span className="text-gray-300">AI Agent Guides</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text leading-tight opacity-0">
              Agent Documentation
            </h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Comprehensive guides and documentation for working with AI agents
            </p>
          </div>
        </div>
      </section>

      {/* Documentation Grid */}
      <section ref={cardsRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentDocs.map((doc, index) => {
              const IconComponent = doc.Icon;
              return (
                <Link
                  key={index}
                  href={doc.href}
                  className="doc-card glass-card rounded-2xl p-6 group block opacity-0"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 border border-[#00d4ff]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 text-[#00d4ff]" />
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff]">
                      {doc.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00d4ff] transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    {doc.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">📖 {doc.readTime} read</span>
                    <ArrowRight className="w-5 h-5 text-[#00d4ff] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Available Agents */}
      <section ref={agentsRef} className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Available Agents</h2>
            <p className="text-gray-400">Explore our library of pre-built AI agents</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableAgents.map((agent, index) => (
              <Link
                key={index}
                href={`/agents/${agent.slug}`}
                className="agent-card glass-card rounded-2xl p-6 group block opacity-0"
              >
                <div className="text-4xl mb-4">{agent.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {agent.specialty}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="cta-section glass-card rounded-3xl p-12 text-center opacity-0">
            <h2 className="text-2xl md:text-3xl font-bold metallic-text mb-4">Quick Actions</h2>
            <p className="text-gray-400 mb-8">Ready to start building with AI agents?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/agents"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold text-white hover:opacity-90 transition-all"
              >
                View All Agents
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/agents/random"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-xl font-semibold text-white hover:opacity-90 transition-all"
              >
                Try Random Agent
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/5 transition-all"
              >
                Get Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
