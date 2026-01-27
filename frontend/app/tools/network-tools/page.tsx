'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Network,
  Globe,
  Wifi,
  MapPin,
  Shield,
  Activity,
  Server,
  Radio,
  Code,
  Search,
  Tag,
  Award,
  Cpu,
  ArrowLeft,
  Zap,
  Clock,
  Star,
} from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { LockedCard } from '@/components/LockedCard';

gsap.registerPlugin(ScrollTrigger);

const networkTools = [
  {
    id: 'ip-info',
    name: 'IP Information',
    description:
      'Get detailed information about any IP address including geolocation, ISP, and more',
    icon: MapPin,
    href: '/tools/ip-info',
    color: 'from-blue-500 to-cyan-500',
    accent: '#00d4ff',
  },
  {
    id: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'Perform DNS queries and check domain name system records',
    icon: Globe,
    href: '/tools/dns-lookup',
    color: 'from-purple-500 to-pink-500',
    accent: '#a855f7',
  },
  {
    id: 'port-scanner',
    name: 'Port Scanner',
    description: 'Scan ports on any host to check open ports and services',
    icon: Server,
    href: '/tools/port-scanner',
    color: 'from-green-500 to-emerald-500',
    accent: '#00ff88',
  },
  {
    id: 'ping-test',
    name: 'Ping Test',
    description: 'Test network connectivity and measure latency to any host',
    icon: Activity,
    href: '/tools/ping-test',
    color: 'from-orange-500 to-red-500',
    accent: '#f59e0b',
  },
  {
    id: 'traceroute',
    name: 'Traceroute',
    description: 'Trace the path packets take to reach a destination',
    icon: Radio,
    href: '/tools/traceroute',
    color: 'from-indigo-500 to-purple-500',
    accent: '#818cf8',
  },
  {
    id: 'whois',
    name: 'WHOIS Lookup',
    description: 'Query WHOIS database for domain registration information',
    icon: Shield,
    href: '/tools/whois-lookup',
    color: 'from-yellow-500 to-orange-500',
    accent: '#fbbf24',
  },
  {
    id: 'ssl-checker',
    name: 'SSL Certificate Checker',
    description: 'Check SSL certificate details and validity for any website',
    icon: Shield,
    href: '/tools/ssl-checker',
    color: 'from-teal-500 to-green-500',
    accent: '#14b8a6',
  },
  {
    id: 'speed-test',
    name: 'Speed Test',
    description: 'Test your internet connection speed and bandwidth',
    icon: Wifi,
    href: '/tools/speed-test',
    color: 'from-pink-500 to-rose-500',
    accent: '#ec4899',
  },
  {
    id: 'api-tester',
    name: 'API Tester',
    description:
      'Professional API testing tool with presets, authentication, and advanced features',
    icon: Code,
    href: '/tools/api-tester',
    color: 'from-violet-500 to-purple-500',
    accent: '#8b5cf6',
  },
  {
    id: 'ip-geolocation',
    name: 'IP Geolocation API',
    description:
      'Get detailed location and ISP information for any IP address using WHOIS XML API',
    icon: MapPin,
    href: '/tools/ip-geolocation',
    color: 'from-cyan-500 to-blue-500',
    accent: '#06b6d4',
  },
  {
    id: 'dns-lookup-advanced',
    name: 'DNS Lookup API',
    description:
      'Get comprehensive DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA) for any domain',
    icon: Server,
    href: '/tools/dns-lookup-advanced',
    color: 'from-emerald-500 to-teal-500',
    accent: '#10b981',
  },
  {
    id: 'domain-availability',
    name: 'Domain Availability',
    description:
      'Check if your desired domain name is available across popular TLDs (.com, .net, .org, etc.)',
    icon: Search,
    href: '/tools/domain-availability',
    color: 'from-rose-500 to-pink-500',
    accent: '#f43f5e',
  },
  {
    id: 'website-categorization',
    name: 'Website Categorization',
    description:
      'Automatically classify websites into content categories for filtering and analysis',
    icon: Tag,
    href: '/tools/website-categorization',
    color: 'from-amber-500 to-yellow-500',
    accent: '#f59e0b',
  },
  {
    id: 'threat-intelligence',
    name: 'Threat Intelligence',
    description:
      'Scan domains and IPs for security threats, malware, phishing, and malicious activity',
    icon: Shield,
    href: '/tools/threat-intelligence',
    color: 'from-red-500 to-rose-500',
    accent: '#ef4444',
  },
  {
    id: 'domain-reputation',
    name: 'Domain Reputation',
    description:
      'Check domain trustworthiness and security reputation with scoring analysis',
    icon: Award,
    href: '/tools/domain-reputation',
    color: 'from-indigo-500 to-blue-500',
    accent: '#6366f1',
  },
  {
    id: 'ip-netblocks',
    name: 'IP Netblocks Lookup',
    description:
      'Get IP range and network block information for any IP address',
    icon: Network,
    href: '/tools/ip-netblocks',
    color: 'from-lime-500 to-green-500',
    accent: '#84cc16',
  },
  {
    id: 'mac-lookup',
    name: 'MAC Address Lookup',
    description: 'Find manufacturer and vendor information for any MAC address',
    icon: Cpu,
    href: '/tools/mac-lookup',
    color: 'from-sky-500 to-cyan-500',
    accent: '#0ea5e9',
  },
  {
    id: 'domain-research',
    name: 'Domain Research Suite',
    description: 'Comprehensive domain history, analysis, and research tools',
    icon: Search,
    href: '/tools/domain-research',
    color: 'from-fuchsia-500 to-purple-500',
    accent: '#d946ef',
  },
];

export default function NetworkToolsPage() {
  const { hasActiveSubscription } = useSubscriptionStatus();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero animations
    const heroTl = gsap.timeline();
    heroTl
      .from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
      })
      .from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.4')
      .from('.hero-back', {
        opacity: 0,
        x: -20,
        duration: 0.5,
        ease: 'power3.out',
      }, '-=0.3');

    // Stats animation
    gsap.from('.stat-card', {
      scrollTrigger: {
        trigger: statsRef.current,
        start: 'top 80%',
      },
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out',
    });

    // Tools grid animation
    gsap.from('.tool-card', {
      scrollTrigger: {
        trigger: toolsRef.current,
        start: 'top 80%',
      },
      opacity: 0,
      y: 40,
      stagger: 0.05,
      duration: 0.6,
      ease: 'power3.out',
    });

    // CTA animation
    gsap.from('.cta-section', {
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 85%',
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power3.out',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(rgba(0, 212, 255, 0.15) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link 
            href="/tools" 
            className="hero-back inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tools
          </Link>

          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm mb-6">
              <Network className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Network Diagnostics Suite</span>
            </div>

            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #00d4ff 100%)',
                }}
              >
                Network Tools
              </span>
            </h1>

            <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful networking utilities to diagnose, analyze, and troubleshoot your network infrastructure
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Quick Stats */}
        <div ref={statsRef} className="max-w-4xl mx-auto mb-16">
          <div 
            className="rounded-2xl p-6 border border-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-cyan-400">18+</div>
                <div className="text-xs text-gray-400">Network Tools</div>
              </div>
              <div className="stat-card text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400">Fast</div>
                <div className="text-xs text-gray-400">Real-time Results</div>
              </div>
              <div className="stat-card text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400">Pro</div>
                <div className="text-xs text-gray-400">Premium Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div ref={toolsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {networkTools.map((tool) => (
            <LockedCard
              key={tool.id}
              isLocked={!hasActiveSubscription}
              title={tool.name}
            >
              <Link
                href={tool.href}
                className="tool-card group block h-full rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:border-white/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                  style={{
                    boxShadow: `0 4px 20px ${tool.accent}40`,
                  }}
                >
                  <tool.icon className="w-6 h-6 text-white" />
                </div>

                <h3 
                  className="text-lg font-bold mb-2 transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {tool.name}
                </h3>

                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  {tool.description}
                </p>

                <div 
                  className="flex items-center text-sm font-semibold group-hover:translate-x-2 transition-transform"
                  style={{ color: tool.accent }}
                >
                  Launch Tool →
                </div>
              </Link>
            </LockedCard>
          ))}
        </div>

        {/* CTA Section */}
        <div className="cta-section max-w-4xl mx-auto">
          <div 
            className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
            <div className="relative">
              <h2 
                className="text-3xl font-bold mb-4"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Need More Developer Tools?
              </h2>
              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
                Check out our full suite of developer utilities including hash generators, JSON formatters, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/tools/developer-utils" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)',
                    color: 'white',
                  }}
                >
                  Developer Tools
                </Link>
                <Link 
                  href="/agents" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                >
                  Explore AI Agents
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
