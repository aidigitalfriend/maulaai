'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Code, Palette, Database, Link2, Terminal, GraduationCap, LifeBuoy, ArrowRight, Zap, Users, Layers } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function DocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const quickStartRef = useRef<HTMLDivElement>(null);

  const docSections = [
    {
      title: "Agent Documentation",
      description: "Learn how to create, configure, and deploy AI agents",
      icon: BookOpen,
      href: "/docs/agents",
      topics: ["Getting Started", "Configuration", "API Reference", "Best Practices"]
    },
    {
      title: "Canvas Builder",
      description: "Build complete web applications with AI-powered generation",
      icon: Palette,
      href: "/docs/canvas",
      topics: ["Text to App", "Live Preview", "Export Code", "Components"]
    },
    {
      title: "Data Generator",
      description: "Generate realistic test data for your applications",
      icon: Database,
      href: "/docs/data-generator",
      topics: ["Users & Profiles", "Products", "Analytics", "Custom Data"]
    },
    {
      title: "API Reference",
      description: "Complete API documentation for all endpoints and methods",
      icon: Code,
      href: "/docs/api",
      topics: ["Authentication", "Endpoints", "Rate Limits", "Error Codes"]
    },
    {
      title: "Integration Guides",
      description: "Step-by-step guides for integrating with popular platforms",
      icon: Link2,
      href: "/docs/integrations",
      topics: ["Slack", "Discord", "Teams", "Webhooks"]
    },
    {
      title: "SDKs & Libraries",
      description: "Official SDKs and community libraries for various languages",
      icon: Terminal,
      href: "/docs/sdks",
      topics: ["JavaScript", "Python", "Go", "PHP"]
    },
    {
      title: "Tutorials",
      description: "Hands-on tutorials to help you build amazing AI experiences",
      icon: GraduationCap,
      href: "/docs/tutorials",
      topics: ["Quick Start", "Advanced Features", "Use Cases", "Examples"]
    },
    {
      title: "Support",
      description: "Get help, report bugs, and connect with the community",
      icon: LifeBuoy,
      href: "/support",
      topics: ["FAQ", "Contact Support", "Community", "Bug Reports"]
    }
  ];

  const stats = [
    { value: "18", label: "AI Agents", icon: Users },
    { value: "50+", label: "API Endpoints", icon: Code },
    { value: "4", label: "SDK Languages", icon: Terminal },
    { value: "2", label: "App Builders", icon: Layers }
  ];

  useGSAP(() => {
    // Hero animation
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40, rotateX: 15 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, '-=0.4');

    // Stats animation
    gsap.fromTo('.stat-card',
      { opacity: 0, y: 40, scale: 0.9 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.5)',
        scrollTrigger: { trigger: statsRef.current, start: 'top 85%' }
      }
    );

    // Doc cards animation - explosive stagger
    const docCards = gsap.utils.toArray('.doc-card');
    docCards.forEach((card: any, i) => {
      const directions = [
        { x: -60, y: -30, rotate: -8 },
        { x: 60, y: -30, rotate: 8 },
        { x: -40, y: 30, rotate: -5 },
        { x: 40, y: 30, rotate: 5 },
        { x: -60, y: 0, rotate: -6 },
        { x: 60, y: 0, rotate: 6 },
        { x: 0, y: -40, rotate: 0 },
        { x: 0, y: 40, rotate: 0 },
      ];
      const dir = directions[i % directions.length];
      
      gsap.fromTo(card,
        { opacity: 0, x: dir.x, y: dir.y, rotate: dir.rotate, scale: 0.8 },
        {
          opacity: 1, x: 0, y: 0, rotate: 0, scale: 1,
          duration: 0.8,
          delay: i * 0.08,
          ease: 'elastic.out(1, 0.8)',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' }
        }
      );
    });

    // Quick start animation
    gsap.fromTo('.quick-step',
      { opacity: 0, x: -50, scale: 0.9 },
      {
        opacity: 1, x: 0, scale: 1, duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: quickStartRef.current, start: 'top 75%' }
      }
    );

    // CTA section
    gsap.fromTo('.cta-section',
      { opacity: 0, y: 60, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 1,
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
      <section ref={heroRef} className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm font-medium mb-6 opacity-0">
            <span className="text-xl">📚</span>
            <span className="text-gray-300">Developer Resources</span>
          </div>
          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text leading-tight opacity-0">
            Documentation
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Everything you need to build amazing AI agent experiences
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="stat-card glass-card rounded-xl p-6 text-center opacity-0">
                  <Icon className="w-6 h-6 text-[#00d4ff] mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section ref={cardsRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Browse Documentation</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive guides and references for every part of the platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {docSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Link
                  key={index}
                  href={section.href}
                  className="doc-card glass-card rounded-2xl p-6 group block opacity-0"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 border border-[#00d4ff]/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[#00d4ff]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    {section.description}
                  </p>
                  <ul className="space-y-2">
                    {section.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="text-sm text-gray-500 flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full mr-3"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center text-[#00d4ff] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section ref={quickStartRef} className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Quick Start</h2>
            <p className="text-gray-400">Get up and running with your first AI agent in minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { step: 1, title: "Choose an Agent", desc: "Select from our library of pre-built agents" },
              { step: 2, title: "Configure", desc: "Customize the agent to fit your needs" },
              { step: 3, title: "Deploy", desc: "Launch your agent and start using it" }
            ].map((item, i) => (
              <div key={i} className="quick-step glass-card rounded-2xl p-6 text-center opacity-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-[#0066ff] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/agents"
              className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold text-white hover:opacity-90 transition-all hover:scale-105 text-center"
            >
              View Agent Docs
            </Link>
            <Link
              href="/agents"
              className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/5 transition-all hover:border-[#00d4ff]/50 text-center"
            >
              Browse Agents
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Resources */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00d4ff]" />
                Popular Guides
              </h3>
              <ul className="space-y-4">
                {[
                  { label: "Getting Started with Agents", href: "/docs/agents/getting-started" },
                  { label: "API Authentication", href: "/docs/api" },
                  { label: "Slack Integration", href: "/docs/integrations" },
                  { label: "Building Your First Bot", href: "/docs/tutorials" }
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-gray-400 hover:text-[#00d4ff] transition-colors flex items-center group">
                      <span className="w-2 h-2 bg-[#00d4ff] rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                      {link.label}
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-[#00ff88]" />
                Need Help?
              </h3>
              <p className="text-gray-400 mb-6">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <ul className="space-y-4">
                {[
                  { label: "Contact Support", href: "/support/contact-us" },
                  { label: "Join Community", href: "/community" },
                  { label: "Browse FAQ", href: "/support/help-center" }
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-gray-400 hover:text-[#00ff88] transition-colors flex items-center group">
                      <span className="w-2 h-2 bg-[#00ff88] rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                      {link.label}
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="cta-section relative rounded-3xl p-12 text-center overflow-hidden opacity-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/10 via-[#00ff88]/10 to-[#0066ff]/10"></div>
            <div className="absolute inset-0 border border-white/10 rounded-3xl"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.2)_0%,_transparent_70%)] blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Ready to Build?</h2>
              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
                Start creating powerful AI experiences with our comprehensive documentation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/docs/agents/getting-started"
                  className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold text-white hover:opacity-90 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  href="/demo"
                  className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/5 transition-all hover:border-[#00d4ff]/50"
                >
                  Request Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
