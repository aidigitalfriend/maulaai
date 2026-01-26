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
  Hash,
  FileJson,
  Clock,
  Palette,
  FileText,
  Key,
  Link2,
  Database,
  Wrench,
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

const developerTools = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data with syntax highlighting',
    icon: FileJson,
    href: '/tools/json-formatter',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings and files',
    icon: Code,
    href: '/tools/base64',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and other cryptographic hashes',
    icon: Hash,
    href: '/tools/hash-generator',
    color: 'from-green-500 to-teal-500',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique UUIDs/GUIDs in various formats',
    icon: Key,
    href: '/tools/uuid-generator',
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates',
    icon: Clock,
    href: '/tools/timestamp-converter',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse and analyze URL components including query parameters',
    icon: Link2,
    href: '/tools/url-parser',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with real-time matching',
    icon: FileText,
    href: '/tools/regex-tester',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and convert between HEX, RGB, HSL formats',
    icon: Palette,
    href: '/tools/color-picker',
    color: 'from-gradient-start to-gradient-end',
  },
  {
    id: 'data-generator',
    name: 'Data Generator',
    description: 'Generate fake data for testing: names, emails, addresses, and more',
    icon: Database,
    href: '/tools/data-generator',
    color: 'from-emerald-500 to-green-500',
  },
];

export default function ToolsPage() {
  const { hasActiveSubscription } = useSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Developer & Network Tools
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A comprehensive suite of tools for developers, network administrators, and security professionals
          </p>
        </div>

        {/* Network Tools Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Network className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Network Tools
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {networkTools.map((tool) => {
              const Icon = tool.icon;
              const isPremium = ['threat-intelligence', 'domain-reputation', 'ip-netblocks', 'mac-lookup', 'domain-research'].includes(tool.id);

              if (isPremium && !hasActiveSubscription) {
                return (
                  <LockedCard
                    key={tool.id}
                    title={tool.name}
                    description={tool.description}
                    icon={<Icon className="w-6 h-6" />}
                  />
                );
              }

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-transparent overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />
                  <div className="relative z-10">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} mb-4`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Developer Tools Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Developer Tools
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developerTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-transparent overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />
                  <div className="relative z-10">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} mb-4`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Looking for more specialized tools?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/tools/network-tools"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Network className="w-4 h-4" />
              Network Tools Hub
            </Link>
            <Link
              href="/tools/developer-utils"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <Code className="w-4 h-4" />
              Developer Utilities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
