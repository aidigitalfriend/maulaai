'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, BookOpen, Search, ChevronRight, Code, Cpu, Settings, Shield, Zap, Globe, Database, Users } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function DocumentationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: Zap },
    { id: 'agents', title: 'AI Agents', icon: Cpu },
    { id: 'api', title: 'API Reference', icon: Code },
    { id: 'integrations', title: 'Integrations', icon: Globe },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'configuration', title: 'Configuration', icon: Settings }
  ];

  const docs: Record<string, { title: string; description: string; articles: string[] }[]> = {
    'getting-started': [
      { title: 'Quick Start Guide', description: 'Get up and running in 5 minutes', articles: ['Installation', 'First Agent', 'Basic Configuration'] },
      { title: 'Core Concepts', description: 'Understanding the fundamentals', articles: ['Agents Overview', 'Memory System', 'Context Management'] },
      { title: 'Authentication', description: 'Setting up secure access', articles: ['API Keys', 'OAuth Setup', 'SSO Integration'] }
    ],
    agents: [
      { title: 'Creating Agents', description: 'Build custom AI agents', articles: ['Agent Builder', 'Personality Config', 'Knowledge Base'] },
      { title: 'Agent Types', description: 'Specialized agent categories', articles: ['Chat Agents', 'Task Agents', 'Analysis Agents'] },
      { title: 'Training & Fine-tuning', description: 'Optimize agent performance', articles: ['Training Data', 'Feedback Loops', 'Performance Metrics'] }
    ],
    api: [
      { title: 'REST API', description: 'HTTP endpoints reference', articles: ['Authentication', 'Endpoints', 'Rate Limits'] },
      { title: 'WebSocket API', description: 'Real-time communication', articles: ['Connection Setup', 'Events', 'Error Handling'] },
      { title: 'SDK Reference', description: 'Language-specific libraries', articles: ['JavaScript SDK', 'Python SDK', 'REST Client'] }
    ],
    integrations: [
      { title: 'Platform Integrations', description: 'Connect with popular platforms', articles: ['Slack', 'Discord', 'Microsoft Teams'] },
      { title: 'Database Connections', description: 'Data source integration', articles: ['PostgreSQL', 'MongoDB', 'Redis'] },
      { title: 'Webhooks', description: 'Event-driven integrations', articles: ['Setup Guide', 'Event Types', 'Security'] }
    ],
    security: [
      { title: 'Security Overview', description: 'Platform security measures', articles: ['Data Encryption', 'Access Control', 'Compliance'] },
      { title: 'Best Practices', description: 'Secure implementation guide', articles: ['API Security', 'User Data', 'Audit Logs'] }
    ],
    configuration: [
      { title: 'System Settings', description: 'Platform configuration options', articles: ['Environment Variables', 'Feature Flags', 'Limits'] },
      { title: 'Customization', description: 'Tailoring the platform', articles: ['Branding', 'Themes', 'Custom Fields'] }
    ]
  };

  const currentDocs = docs[activeSection] || [];

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.search-bar', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

    gsap.fromTo('.sidebar-item',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.sidebar', start: 'top 85%' } }
    );

    gsap.fromTo('.doc-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.docs-grid', start: 'top 85%' } }
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
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(236,72,153,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/resources" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ec4899] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <BookOpen className="w-4 h-4 text-[#ec4899]" />
              <span className="text-gray-300">Technical Reference</span>
            </div>
            <h1 className="hero-title text-5xl md:text-6xl font-bold mb-8 metallic-text opacity-0">Documentation</h1>
          </div>

          {/* Search */}
          <div className="search-bar max-w-2xl mx-auto opacity-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ec4899]/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="sidebar lg:w-64 flex-shrink-0">
              <div className="glass-card rounded-xl p-4 sticky top-24">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Sections</h3>
                <nav className="space-y-1">
                  {sections.map((section, i) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveSection(section.id)}
                        className={`sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all opacity-0 ${
                          isActive ? 'bg-[#ec4899]/20 text-[#ec4899]' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {section.title}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Docs Grid */}
            <div className="flex-1">
              <div className="docs-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentDocs.map((doc, i) => (
                  <div key={i} className="doc-card glass-card rounded-2xl p-6 opacity-0 group hover:scale-[1.01] transition-transform">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ec4899] transition-colors">{doc.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{doc.description}</p>
                    <ul className="space-y-2">
                      {doc.articles.map((article, j) => (
                        <li key={j}>
                          <Link href={`/resources/documentation/${activeSection}/${article.toLowerCase().replace(/ /g, '-')}`} className="flex items-center gap-2 text-gray-400 text-sm hover:text-[#ec4899] transition-colors">
                            <ChevronRight className="w-4 h-4" />
                            {article}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold metallic-text text-center mb-12">Popular Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'API Reference', icon: Code, color: '#00d4ff', href: '/resources/documentation/api' },
              { title: 'Quick Start Guide', icon: Zap, color: '#00ff88', href: '/resources/documentation/getting-started' },
              { title: 'Security Docs', icon: Shield, color: '#a855f7', href: '/resources/documentation/security' }
            ].map((link, i) => {
              const Icon = link.icon;
              return (
                <Link key={i} href={link.href} className="glass-card rounded-xl p-6 flex items-center gap-4 group hover:border-[#ec4899]/30">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${link.color}20`, border: `1px solid ${link.color}40` }}>
                    <Icon className="w-6 h-6" style={{ color: link.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-[#ec4899] transition-colors">{link.title}</h3>
                    <span className="text-sm text-gray-500">View docs →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
