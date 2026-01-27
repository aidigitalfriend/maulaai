'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Code2,
  Hash,
  FileJson,
  Binary,
  Palette,
  Clock,
  Key,
  Wrench,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { LockedCard } from '@/components/LockedCard';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const developerUtils = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data with syntax highlighting',
    icon: FileJson,
    href: '/tools/json-formatter',
    gradient: 'from-[#00d4ff] to-[#0099cc]',
    comingSoon: false,
  },
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings easily',
    icon: Binary,
    href: '/tools/base64',
    gradient: 'from-[#a855f7] to-[#7c3aed]',
    comingSoon: false,
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and other hash values',
    icon: Hash,
    href: '/tools/hash-generator',
    gradient: 'from-[#00ff88] to-[#00cc6a]',
    comingSoon: false,
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique identifiers (UUID/GUID) in various formats',
    icon: Key,
    href: '/tools/uuid-generator',
    gradient: 'from-[#f59e0b] to-[#ea580c]',
    comingSoon: false,
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and convert between HEX, RGB, HSL formats',
    icon: Palette,
    href: '/tools/color-picker',
    gradient: 'from-[#ec4899] to-[#be185d]',
    comingSoon: false,
  },
  {
    id: 'timestamp',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates',
    icon: Clock,
    href: '/tools/timestamp-converter',
    gradient: 'from-[#fbbf24] to-[#f59e0b]',
    comingSoon: false,
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with live matching',
    icon: Code2,
    href: '/tools/regex-tester',
    gradient: 'from-[#14b8a6] to-[#0d9488]',
    comingSoon: false,
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse and decode URLs to extract components',
    icon: LinkIcon,
    href: '/tools/url-parser',
    gradient: 'from-[#f43f5e] to-[#e11d48]',
    comingSoon: false,
  },
];

export default function DeveloperUtilsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { hasActiveSubscription } = useSubscriptionStatus();

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.stat-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.stats-row', start: 'top 85%' } }
    );

    gsap.fromTo('.tool-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.tools-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.cta-card',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '.cta-card', start: 'top 90%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <Wrench className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-gray-300">Developer Utilities</span>
          </div>
          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">
            Developer Utils
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Essential utilities and converters for developers to boost productivity and streamline workflows
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-16 px-6">
        <div className="stats-row max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="stat-card text-center p-6 bg-white/5 rounded-xl border border-white/10 opacity-0">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0099cc] flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">8+</div>
                <div className="text-sm text-gray-500">Developer Tools</div>
              </div>
              <div className="stat-card text-center p-6 bg-white/5 rounded-xl border border-white/10 opacity-0">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">Fast</div>
                <div className="text-sm text-gray-500">Instant Results</div>
              </div>
              <div className="stat-card text-center p-6 bg-white/5 rounded-xl border border-white/10 opacity-0">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">Free</div>
                <div className="text-sm text-gray-500">No Registration</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="pb-20 px-6">
        <div className="tools-grid max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {developerUtils.map((tool) => (
            <LockedCard
              key={tool.id}
              isLocked={!hasActiveSubscription || tool.comingSoon}
              title={tool.comingSoon ? 'Coming Soon' : tool.name}
            >
              <Link
                href={tool.href}
                className={`tool-card glass-card rounded-2xl p-6 block h-full group ${
                  tool.comingSoon ? 'cursor-not-allowed opacity-75' : ''
                }`}
                onClick={(e) => tool.comingSoon && e.preventDefault()}
              >
                {tool.comingSoon && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#a855f7] to-[#00d4ff] text-white text-xs font-semibold rounded-full">
                    Coming Soon
                  </div>
                )}

                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00d4ff] transition-colors">
                  {tool.name}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-5">{tool.description}</p>

                {!tool.comingSoon && (
                  <div className="flex items-center gap-2 text-[#00d4ff] text-sm font-semibold group-hover:gap-3 transition-all">
                    Launch Tool
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Link>
            </LockedCard>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24 px-6">
        <div className="cta-card max-w-4xl mx-auto glass-card rounded-2xl p-10 md:p-14 text-center border-[#00d4ff]/20">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Need Network Tools?</h2>
          <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
            Check out our powerful network utilities including DNS lookup, port scanner, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools/network-tools"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00d4ff]/20 transition-all"
            >
              Network Tools
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/agents"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/40 transition-all"
            >
              Explore AI Agents
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
