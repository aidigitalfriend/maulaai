'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
  Hash,
  FileJson,
  Clock,
  Palette,
  Key,
  Binary,
  Code2,
  Wrench,
  Sparkles,
  Zap,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, TextPlugin, Flip, Draggable, MotionPathPlugin, CustomWiggle, CustomEase, ScrollToPlugin, Observer } from '@/lib/gsap';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { LockedCard } from '@/components/LockedCard';

gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, Flip, Draggable, MotionPathPlugin, CustomWiggle, CustomEase, ScrollToPlugin, Observer);

const networkTools = [
  {
    id: 'ip-info',
    name: 'IP Information',
    description: 'Get detailed information about any IP address including geolocation, ISP, and more',
    icon: MapPin,
    href: '/tools/ip-info',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'Perform DNS queries and check domain name system records',
    icon: Globe,
    href: '/tools/dns-lookup',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'port-scanner',
    name: 'Port Scanner',
    description: 'Scan ports on any host to check open ports and services',
    icon: Server,
    href: '/tools/port-scanner',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'ping-test',
    name: 'Ping Test',
    description: 'Test network connectivity and measure latency to any host',
    icon: Activity,
    href: '/tools/ping-test',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'traceroute',
    name: 'Traceroute',
    description: 'Trace the path packets take to reach a destination',
    icon: Radio,
    href: '/tools/traceroute',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'whois',
    name: 'WHOIS Lookup',
    description: 'Query WHOIS database for domain registration information',
    icon: Shield,
    href: '/tools/whois-lookup',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'ssl-checker',
    name: 'SSL Certificate Checker',
    description: 'Check SSL certificate details and validity for any website',
    icon: Shield,
    href: '/tools/ssl-checker',
    color: 'from-teal-500 to-green-500',
  },
  {
    id: 'speed-test',
    name: 'Speed Test',
    description: 'Test your internet connection speed and bandwidth',
    icon: Wifi,
    href: '/tools/speed-test',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'api-tester',
    name: 'API Tester',
    description: 'Professional API testing tool with presets, authentication, and advanced features',
    icon: Code,
    href: '/tools/api-tester',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'ip-geolocation',
    name: 'IP Geolocation API',
    description: 'Get detailed location and ISP information for any IP address using WHOIS XML API',
    icon: MapPin,
    href: '/tools/ip-geolocation',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'dns-lookup-advanced',
    name: 'DNS Lookup API',
    description: 'Get comprehensive DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA) for any domain',
    icon: Server,
    href: '/tools/dns-lookup-advanced',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'domain-availability',
    name: 'Domain Availability',
    description: 'Check if your desired domain name is available across popular TLDs',
    icon: Search,
    href: '/tools/domain-availability',
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 'website-categorization',
    name: 'Website Categorization',
    description: 'Automatically classify websites into content categories for filtering and analysis',
    icon: Tag,
    href: '/tools/website-categorization',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    id: 'threat-intelligence',
    name: 'Threat Intelligence',
    description: 'Scan domains and IPs for security threats, malware, phishing, and malicious activity',
    icon: Shield,
    href: '/tools/threat-intelligence',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'domain-reputation',
    name: 'Domain Reputation',
    description: 'Check domain trustworthiness and security reputation with scoring analysis',
    icon: Award,
    href: '/tools/domain-reputation',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'ip-netblocks',
    name: 'IP Netblocks Lookup',
    description: 'Get IP range and network block information for any IP address',
    icon: Network,
    href: '/tools/ip-netblocks',
    color: 'from-lime-500 to-green-500',
  },
  {
    id: 'mac-lookup',
    name: 'MAC Address Lookup',
    description: 'Find manufacturer and vendor information for any MAC address',
    icon: Cpu,
    href: '/tools/mac-lookup',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    id: 'domain-research',
    name: 'Domain Research Suite',
    description: 'Comprehensive domain history, analysis, and research tools',
    icon: Search,
    href: '/tools/domain-research',
    color: 'from-fuchsia-500 to-purple-500',
  },
];

const developerTools = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data with syntax highlighting',
    icon: FileJson,
    href: '/tools/json-formatter',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings easily',
    icon: Binary,
    href: '/tools/base64',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and other hash values',
    icon: Hash,
    href: '/tools/hash-generator',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique identifiers (UUID/GUID) in various formats',
    icon: Key,
    href: '/tools/uuid-generator',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and convert between HEX, RGB, HSL formats',
    icon: Palette,
    href: '/tools/color-picker',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'timestamp',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates',
    icon: Clock,
    href: '/tools/timestamp-converter',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with live matching',
    icon: Code2,
    href: '/tools/regex-tester',
    color: 'from-teal-500 to-green-500',
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse and decode URLs to extract components',
    icon: Code2,
    href: '/tools/url-parser',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'data-generator',
    name: 'Data Generator',
    description: 'Generate fake data for testing: names, emails, addresses, and more',
    icon: Server,
    href: '/tools/data-generator',
    color: 'from-emerald-500 to-green-500',
  },
];

export default function ToolsPage() {
  const { hasActiveSubscription } = useSubscriptionStatus();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const networkSectionRef = useRef<HTMLDivElement>(null);
  const devSectionRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<'network' | 'developer'>('network');
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Register custom wiggles
      CustomWiggle.create('toolWiggle', { wiggles: 6, type: 'easeOut' });
      CustomEase.create('toolBounce', 'M0,0 C0.14,0 0.27,0.9 0.5,1 0.73,1.1 0.86,1 1,1');

      // Hero background gradient morphing
      gsap.to('.hero-gradient-orb', {
        x: 'random(-100, 100)',
        y: 'random(-50, 50)',
        scale: 'random(0.8, 1.2)',
        duration: 8,
        ease: 'sine.inOut',
        stagger: { each: 1.5, repeat: -1, yoyo: true },
      });

      // Floating tool icons with MotionPath
      const floatingIcons = document.querySelectorAll('.floating-tool-icon');
      floatingIcons.forEach((icon, i) => {
        const path = [
          { x: 0, y: 0 },
          { x: 80 * (i % 2 === 0 ? 1 : -1), y: -60 },
          { x: 120 * (i % 2 === 0 ? 1 : -1), y: 0 },
          { x: 80 * (i % 2 === 0 ? 1 : -1), y: 60 },
          { x: 0, y: 0 },
        ];
        gsap.to(icon, {
          motionPath: { path, curviness: 1.5 },
          duration: 15 + i * 2,
          repeat: -1,
          ease: 'none',
        });
        gsap.to(icon, {
          rotation: 360,
          duration: 20 + i * 3,
          repeat: -1,
          ease: 'none',
        });
      });

      // Simple hero title animation (no SplitText to avoid visibility issues)
      if (titleRef.current) {
        gsap.fromTo(titleRef.current, 
          {
            opacity: 0,
            y: 40,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            delay: 0.2,
          }
        );
      }

      // Simple subtitle animation (no typewriter to avoid visibility issues)
      if (subtitleRef.current) {
        gsap.fromTo(subtitleRef.current,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            delay: 0.5,
          }
        );
      }

      // Hero icon pulse
      gsap.to('.hero-icon-container', {
        boxShadow: '0 0 60px rgba(139, 92, 246, 0.6), 0 0 120px rgba(139, 92, 246, 0.3)',
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Stats cards animation
      if (statsRef.current) {
        const statCards = statsRef.current.querySelectorAll('.stat-card');
        gsap.from(statCards, {
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
          },
          opacity: 0,
          y: 60,
          rotationX: -30,
          scale: 0.9,
          stagger: 0.15,
          duration: 0.8,
          ease: 'back.out(1.7)',
        });

        // Animate stat numbers
        statCards.forEach((card) => {
          const valueEl = card.querySelector('.stat-value');
          if (valueEl && valueEl.textContent) {
            const text = valueEl.textContent;
            if (text.includes('+')) {
              const num = parseInt(text);
              gsap.from(valueEl, {
                textContent: 0,
                duration: 2,
                ease: 'power2.out',
                snap: { textContent: 1 },
                scrollTrigger: { trigger: card, start: 'top 80%' },
                onUpdate: function () {
                  const current = Math.round(gsap.getProperty(this.targets()[0], 'textContent') as number);
                  (valueEl as HTMLElement).textContent = `${current}+`;
                },
              });
            }
          }
        });
      }

      // Category tabs animation
      const categoryTabs = document.querySelectorAll('.category-tab');
      gsap.from(categoryTabs, {
        opacity: 0,
        x: -30,
        stagger: 0.1,
        duration: 0.6,
        delay: 1.5,
        ease: 'power2.out',
      });

      // Tool cards 3D entrance
      const toolCards = document.querySelectorAll('.tool-card');
      toolCards.forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          },
          opacity: 0,
          y: 80,
          rotationX: -45,
          rotationY: i % 2 === 0 ? -15 : 15,
          scale: 0.8,
          duration: 0.8,
          delay: (i % 4) * 0.1,
          ease: 'back.out(1.5)',
        });
      });

      // Section headers animation
      gsap.utils.toArray<HTMLElement>('.section-header').forEach((header) => {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: 'top 80%',
          },
          opacity: 0,
          x: -50,
          duration: 0.8,
          ease: 'power3.out',
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Handle tool card hover
  const handleCardHover = (toolId: string, isEntering: boolean) => {
    const card = document.querySelector(`[data-tool-id="${toolId}"]`);
    if (!card) return;

    if (isEntering) {
      setHoveredTool(toolId);
      gsap.to(card, {
        y: -12,
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(card.querySelector('.card-glow'), {
        opacity: 1,
        scale: 1,
        duration: 0.4,
      });
      gsap.to(card.querySelector('.tool-icon'), {
        scale: 1.1,
        rotate: 5,
        duration: 0.4,
        ease: 'back.out(1.7)',
      });
      gsap.to(card.querySelector('.tool-arrow'), {
        x: 8,
        opacity: 1,
        duration: 0.3,
      });
    } else {
      setHoveredTool(null);
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(card.querySelector('.card-glow'), {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
      });
      gsap.to(card.querySelector('.tool-icon'), {
        scale: 1,
        rotate: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(card.querySelector('.tool-arrow'), {
        x: 0,
        opacity: 0.5,
        duration: 0.3,
      });
    }
  };

  // Magnetic hover effect
  const handleMagneticMove = (e: React.MouseEvent, toolId: string) => {
    const card = document.querySelector(`[data-tool-id="${toolId}"]`) as HTMLElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(card, {
      x: x * 0.1,
      y: y * 0.1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMagneticLeave = (toolId: string) => {
    const card = document.querySelector(`[data-tool-id="${toolId}"]`);
    if (!card) return;

    gsap.to(card, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    });
  };

  // Handle category switch with Flip
  const handleCategorySwitch = (category: 'network' | 'developer') => {
    if (category === activeCategory) return;

    const state = Flip.getState('.tool-card');
    setActiveCategory(category);

    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.6,
        ease: 'power2.inOut',
        stagger: 0.02,
        absolute: true,
        onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4 }),
        onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.4 }),
      });
    });
  };

  const currentTools = activeCategory === 'network' ? networkTools : developerTools;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle absolute w-1.5 h-1.5 bg-cyan-400/40 rounded-full" style={{ left: `${5 + i * 6}%`, top: `${10 + (i % 5) * 18}%` }} />
        ))}
      </div>

      {/* Floating Tool Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {['🔧', '⚙️', '🛠️', '🔩', '⚡', '💻'].map((emoji, i) => (
          <div
            key={i}
            className="floating-tool-icon absolute text-4xl opacity-20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-24 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Hero Icon */}
          <div className="hero-icon-container inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 backdrop-blur-sm mb-8">
            <Wrench className="w-12 h-12 text-violet-400" />
          </div>

          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent"
            style={{ perspective: '1000px', opacity: 1 }}
          >
            Developer & Network Tools
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12"
            style={{ opacity: 1 }}
          >
            A comprehensive suite of tools for developers, network administrators, and security professionals
          </p>

          {/* Category Tabs */}
          <div className="flex justify-center gap-4 mb-16">
            <button
              onClick={() => handleCategorySwitch('network')}
              className={`category-tab px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                activeCategory === 'network'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Network className="w-5 h-5" />
              Network Tools
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-sm">{networkTools.length}</span>
            </button>
            <button
              onClick={() => handleCategorySwitch('developer')}
              className={`category-tab px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                activeCategory === 'developer'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Code className="w-5 h-5" />
              Developer Tools
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-sm">{developerTools.length}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="relative py-8">
        <div className="container mx-auto px-4">
          <div ref={statsRef} className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="stat-card text-center p-6 bg-gradient-to-br from-violet-600/20 to-violet-600/5 rounded-2xl border border-violet-500/20">
                  <div className="stat-value text-4xl font-bold text-violet-400 mb-2">27+</div>
                  <div className="text-sm text-gray-400">Total Tools</div>
                </div>
                <div className="stat-card text-center p-6 bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 rounded-2xl border border-cyan-500/20">
                  <div className="stat-value text-4xl font-bold text-cyan-400 mb-2 flex items-center justify-center gap-2">
                    <Zap className="w-8 h-8" />
                    Fast
                  </div>
                  <div className="text-sm text-gray-400">Real-time Results</div>
                </div>
                <div className="stat-card text-center p-6 bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 rounded-2xl border border-emerald-500/20">
                  <div className="stat-value text-4xl font-bold text-emerald-400 mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-8 h-8" />
                    Free
                  </div>
                  <div className="text-sm text-gray-400">No Limits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="section-header flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 flex items-center justify-center">
              {activeCategory === 'network' ? (
                <Network className="w-6 h-6 text-violet-400" />
              ) : (
                <Code className="w-6 h-6 text-violet-400" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">
                {activeCategory === 'network' ? 'Network & API Tools' : 'Developer Utilities'}
              </h2>
              <p className="text-gray-400">
                {activeCategory === 'network'
                  ? 'Powerful tools for network diagnostics and API testing'
                  : 'Essential utilities for everyday development tasks'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  data-tool-id={tool.id}
                  className="tool-card group relative block"
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                  onMouseEnter={() => handleCardHover(tool.id, true)}
                  onMouseLeave={() => {
                    handleCardHover(tool.id, false);
                    handleMagneticLeave(tool.id);
                  }}
                  onMouseMove={(e) => handleMagneticMove(e, tool.id)}
                >
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden h-full">
                    {/* Glow effect */}
                    <div className={`card-glow absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-300`} style={{ transform: 'scale(0.8)' }} />
                    
                    {/* Corner accents */}
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-violet-500/30 rounded-tr-lg" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-violet-500/30 rounded-bl-lg" />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div
                        className={`tool-icon w-16 h-16 mb-4 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>

                      {/* Name */}
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-violet-300 transition-colors truncate" title={tool.name}>
                        {tool.name}
                      </h3>

                      {/* Category badge */}
                      <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${tool.color} bg-opacity-20 text-white text-xs font-semibold mb-3`}>
                        {activeCategory === 'network' ? 'Network' : 'Developer'}
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{tool.description}</p>

                      {/* Action Area */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                        <span className="text-sm font-medium text-violet-400">
                          Open Tool
                        </span>
                        <ArrowRight className="tool-arrow w-5 h-5 text-violet-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access Footer */}
      <section className="relative py-16 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need Something Specific?</h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Explore our full suite of tools or suggest new features for the platform
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/support"
              className="px-8 py-4 bg-white/5 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Request a Tool
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 flex items-center gap-2"
            >
              Unlock Premium Features
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
