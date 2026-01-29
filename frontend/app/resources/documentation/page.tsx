'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import { FileText, Search, BookOpen, Code, Zap, Terminal, Key, MessageSquare, ChevronRight, Copy, Check, ArrowRight, Sparkles, Layout, ExternalLink } from 'lucide-react';

const agents = [
  { id: 'einstein', name: 'Einstein', avatar: '🧠', color: 'from-amber-500 to-orange-600' },
  { id: 'chess-player', name: 'Chess Player', avatar: '♟️', color: 'from-slate-600 to-gray-800' },
  { id: 'comedy-king', name: 'Comedy King', avatar: '🎭', color: 'from-yellow-500 to-amber-600' },
  { id: 'drama-queen', name: 'Drama Queen', avatar: '👑', color: 'from-purple-500 to-pink-600' },
  { id: 'lazy-pawn', name: 'Lazy Pawn', avatar: '😴', color: 'from-green-400 to-teal-500' },
  { id: 'knight-logic', name: 'Knight Logic', avatar: '♞', color: 'from-indigo-500 to-blue-600' },
  { id: 'rook-jokey', name: 'Rook Jokey', avatar: '♜', color: 'from-red-500 to-rose-600' },
  { id: 'bishop-burger', name: 'Bishop Burger', avatar: '🍔', color: 'from-orange-500 to-red-600' },
  { id: 'tech-wizard', name: 'Tech Wizard', avatar: '💻', color: 'from-cyan-500 to-blue-600' },
  { id: 'chef-biew', name: 'Chef Biew', avatar: '👨‍🍳', color: 'from-amber-600 to-yellow-500' },
  { id: 'fitness-guru', name: 'Fitness Guru', avatar: '💪', color: 'from-emerald-500 to-green-600' },
  { id: 'travel-buddy', name: 'Travel Buddy', avatar: '✈️', color: 'from-sky-500 to-indigo-600' },
];

const sections = [
  { id: 'getting-started', title: 'Getting Started', icon: Zap },
  { id: 'api-reference', title: 'API Reference', icon: Code },
  { id: 'integration', title: 'Integration Guide', icon: Terminal },
  { id: 'authentication', title: 'Authentication', icon: Key },
  { id: 'agents', title: 'Agent Reference', icon: MessageSquare },
];

export default function DocumentationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('getting-started');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('docWiggle', { wiggles: 5, type: 'uniform' });
        gsap.registerPlugin(ScrollTrigger);

        // Floating elements with fromTo
        gsap.fromTo('.floating-icon', 
          { y: 30, opacity: 0, scale: 0 }, 
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' }
        );
        gsap.fromTo('.gradient-orb', 
          { scale: 0.5, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' }
        );

        // ScrollTrigger batches with fromTo
        ScrollTrigger.batch('.doc-section', {
          onEnter: (elements) => {
            gsap.fromTo(elements, 
              { y: 40, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // Floating icons animation
        document.querySelectorAll('.floating-icon').forEach((icon, i) => {
          gsap.to(icon, {
            y: `random(-15, 15)`,
            x: `random(-10, 10)`,
            rotation: `random(-10, 10)`,
            duration: `random(3, 5)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2
          });
        });

        // Gradient orbs animation
        gsap.to('.gradient-orb-1', {
          x: 80,
          y: -60,
          duration: 15,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        gsap.to('.gradient-orb-2', {
          x: -70,
          y: 80,
          duration: 18,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        ScrollTrigger.refresh();
      }, containerRef);
      return () => ctx.revert();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-blue-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-24 left-[10%]">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 backdrop-blur-sm flex items-center justify-center border border-blue-500/20">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-40 right-[12%]">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center border border-indigo-500/20">
            <Code className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-48 left-[12%]">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/20">
            <Terminal className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-12 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-8">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Developer Docs</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Documentation
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to integrate and build with
              <span className="text-blue-400"> Maula AI agents.</span>
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="py-6 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto flex gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 overflow-hidden group ${
                      activeSection === section.id
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${activeSection === section.id ? 'opacity-100' : ''}`} />
                    <section.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110 ${activeSection === section.id ? 'text-blue-400' : ''}`} />
                    <span className="font-medium relative z-10">{section.title}</span>
                    {activeSection === section.id && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-l-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Getting Started */}
              <div className="doc-section space-y-8">
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 overflow-hidden">
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg" />
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-blue-400" />
                    Getting Started
                  </h2>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Maula AI provides 18+ specialized AI agents for various purposes. Each agent has unique personality traits and capabilities designed to assist with specific tasks.
                  </p>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Quick Start Steps</h3>
                    <ol className="space-y-3">
                      {[
                        'Browse our library of 18 specialized AI agents',
                        'Choose an agent that matches your needs',
                        'Start a conversation directly or use our API',
                        'Use Studio for enhanced features and Canvas for code generation'
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-400">
                          <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 text-sm font-bold">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* API Reference */}
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 overflow-hidden">
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg" />
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Code className="w-6 h-6 text-indigo-400" />
                    API Reference
                  </h2>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Base URL</h3>
                    <div className="relative">
                      <div className="bg-gray-950 p-4 rounded-xl font-mono text-sm text-emerald-400 border border-gray-800">
                        https://api.maula.ai/v1
                      </div>
                      <button
                        onClick={() => copyToClipboard('https://api.maula.ai/v1')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Endpoints</h3>
                    {[
                      { method: 'GET', path: '/agents', desc: 'List all available agents' },
                      { method: 'POST', path: '/conversations', desc: 'Create a new conversation' },
                      { method: 'GET', path: '/conversations/:id', desc: 'Retrieve conversation history' },
                      { method: 'POST', path: '/conversations/:id/messages', desc: 'Send a message' },
                      { method: 'POST', path: '/canvas/generate', desc: 'Generate code via Canvas' },
                    ].map((endpoint, i) => (
                      <div key={i} className="p-4 rounded-xl bg-gray-950 border border-gray-800">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-gray-300 font-mono text-sm">{endpoint.path}</code>
                        </div>
                        <p className="text-gray-500 text-sm mt-2">{endpoint.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agents */}
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 overflow-hidden">
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg" />
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                    Available Agents
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Browse our collection of 18 specialized AI agents, each with unique capabilities.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {agents.map((agent) => (
                      <Link
                        key={agent.id}
                        href={`/agents/${agent.id}`}
                        className="p-4 rounded-xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition-all group"
                      >
                        <div className="text-3xl mb-2">{agent.avatar}</div>
                        <div className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                          {agent.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <Link
                    href="/agents"
                    className="mt-6 inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    View All Agents
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="relative max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-purple-500/40 rounded-bl-lg" />
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-blue-500/30 rounded-tl-lg" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-indigo-500/30 rounded-br-lg" />
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            
            <div className="relative text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Need Help?
              </h2>
              <p className="text-gray-400 mb-8">
                Our support team is here to help you get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/support"
                  className="group relative inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Contact Support</span>
                  <ArrowRight className="relative z-10 w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/resources/tutorials"
                  className="group relative inline-flex items-center px-8 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white font-medium hover:bg-gray-700 hover:border-gray-600 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700/50 to-gray-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">View Tutorials</span>
                  <ExternalLink className="relative z-10 w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
