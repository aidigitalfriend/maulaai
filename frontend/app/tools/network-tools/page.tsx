'use client';

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
} from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { LockedCard } from '@/components/LockedCard';

const networkTools = [
  {
    id: 'ip-info',
    name: 'IP Information',
    description:
      'Get detailed information about any IP address including geolocation, ISP, and more',
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
    description:
      'Professional API testing tool with presets, authentication, and advanced features',
    icon: Code,
    href: '/tools/api-tester',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'ip-geolocation',
    name: 'IP Geolocation API',
    description:
      'Get detailed location and ISP information for any IP address using WHOIS XML API',
    icon: MapPin,
    href: '/tools/ip-geolocation',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'dns-lookup-advanced',
    name: 'DNS Lookup API',
    description:
      'Get comprehensive DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA) for any domain',
    icon: Server,
    href: '/tools/dns-lookup-advanced',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'domain-availability',
    name: 'Domain Availability',
    description:
      'Check if your desired domain name is available across popular TLDs (.com, .net, .org, etc.)',
    icon: Search,
    href: '/tools/domain-availability',
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 'website-categorization',
    name: 'Website Categorization',
    description:
      'Automatically classify websites into content categories for filtering and analysis',
    icon: Tag,
    href: '/tools/website-categorization',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    id: 'threat-intelligence',
    name: 'Threat Intelligence',
    description:
      'Scan domains and IPs for security threats, malware, phishing, and malicious activity',
    icon: Shield,
    href: '/tools/threat-intelligence',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'domain-reputation',
    name: 'Domain Reputation',
    description:
      'Check domain trustworthiness and security reputation with scoring analysis',
    icon: Award,
    href: '/tools/domain-reputation',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'ip-netblocks',
    name: 'IP Netblocks Lookup',
    description:
      'Get IP range and network block information for any IP address',
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

export default function NetworkToolsPage() {
  const { hasActiveSubscription } = useSubscriptionStatus();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <span className="text-xl">🌐</span>
            Network Diagnostics
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Network Tools
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Powerful networking utilities to diagnose, analyze, and troubleshoot your network infrastructure
          </p>
        </div>
      </section>

      <div className="container-custom section-padding-lg">

        {/* Quick Stats */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-brand-50 rounded-lg">
                <div className="text-2xl font-bold text-brand-600">19+</div>
                <div className="text-xs text-neural-600">Network Tools</div>
              </div>
              <div className="text-center p-4 bg-accent-50 rounded-lg">
                <div className="text-2xl font-bold text-accent-600">Fast</div>
                <div className="text-xs text-neural-600">Real-time Results</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Free</div>
                <div className="text-xs text-neural-600">No Limits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {networkTools.map((tool) => (
            <LockedCard
              key={tool.id}
              isLocked={!hasActiveSubscription}
              title={tool.name}
            >
              <Link
                href={tool.href}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-neural-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300 block h-full"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <tool.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-neural-800 mb-2 group-hover:text-brand-600 transition-colors">
                  {tool.name}
                </h3>

                <p className="text-sm text-neural-600 leading-relaxed mb-4">{tool.description}</p>

                <div className="flex items-center text-brand-600 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                  Launch Tool →
                </div>
              </Link>
            </LockedCard>
          ))}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-brand-600 to-accent-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Need More Developer Tools?</h2>
            <p className="text-lg opacity-90 mb-8">
              Check out our full suite of developer utilities including hash generators, JSON formatters, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tools/developer-utils" className="btn-primary bg-white text-brand-600 hover:bg-neural-50">
                Developer Tools
              </Link>
              <Link href="/agents" className="btn-primary border-2 border-white bg-transparent hover:bg-white hover:text-brand-600">
                Explore AI Agents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
