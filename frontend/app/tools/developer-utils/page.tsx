'use client';

import Link from 'next/link';
import {
  Code2,
  Hash,
  FileJson,
  Binary,
  Palette,
  Calculator,
  Clock,
  Key,
} from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { LockedCard } from '@/components/LockedCard';

const developerUtils = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description:
      'Format, validate, and beautify JSON data with syntax highlighting',
    icon: FileJson,
    href: '/tools/json-formatter',
    color: 'from-blue-500 to-cyan-500',
    comingSoon: false,
  },
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings easily',
    icon: Binary,
    href: '/tools/base64',
    color: 'from-purple-500 to-pink-500',
    comingSoon: false,
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and other hash values',
    icon: Hash,
    href: '/tools/hash-generator',
    color: 'from-green-500 to-emerald-500',
    comingSoon: false,
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique identifiers (UUID/GUID) in various formats',
    icon: Key,
    href: '/tools/uuid-generator',
    color: 'from-orange-500 to-red-500',
    comingSoon: false,
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and convert between HEX, RGB, HSL formats',
    icon: Palette,
    href: '/tools/color-picker',
    color: 'from-indigo-500 to-purple-500',
    comingSoon: false,
  },
  {
    id: 'timestamp',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates',
    icon: Clock,
    href: '/tools/timestamp-converter',
    color: 'from-yellow-500 to-orange-500',
    comingSoon: false,
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with live matching',
    icon: Code2,
    href: '/tools/regex-tester',
    color: 'from-teal-500 to-green-500',
    comingSoon: false,
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse and decode URLs to extract components',
    icon: Code2,
    href: '/tools/url-parser',
    color: 'from-pink-500 to-rose-500',
    comingSoon: false,
  },
];

export default function DeveloperUtilsPage() {
  const { hasActiveSubscription } = useSubscriptionStatus();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center">
              <Code2 className="w-10 h-10 text-brand-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Developer Utils
          </h1>
          <p className="text-xl text-neural-600 leading-relaxed">
            Essential utilities and converters for developers to boost
            productivity and streamline workflows
          </p>
        </div>

        {/* Quick Stats */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-brand-50 rounded-lg">
                <div className="text-2xl font-bold text-brand-600">8+</div>
                <div className="text-xs text-neural-600">Developer Tools</div>
              </div>
              <div className="text-center p-4 bg-accent-50 rounded-lg">
                <div className="text-2xl font-bold text-accent-600">Fast</div>
                <div className="text-xs text-neural-600">Instant Results</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Free</div>
                <div className="text-xs text-neural-600">No Registration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {developerUtils.map((tool) => (
            <LockedCard
              key={tool.id}
              isLocked={!hasActiveSubscription || tool.comingSoon}
              title={tool.comingSoon ? 'Coming Soon' : tool.name}
            >
              <Link
                href={tool.href}
                className={`group bg-white rounded-2xl p-6 shadow-sm border border-neural-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300 block h-full ${
                  tool.comingSoon ? 'cursor-not-allowed opacity-75' : ''
                }`}
                onClick={(e) => tool.comingSoon && e.preventDefault()}
              >
                {tool.comingSoon && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-brand-600 text-white text-xs font-semibold rounded-full">
                    Coming Soon
                  </div>
                )}

                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <tool.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-neural-800 mb-2 group-hover:text-brand-600 transition-colors">
                  {tool.name}
                </h3>

                <p className="text-sm text-neural-600 leading-relaxed mb-4">{tool.description}</p>

                {!tool.comingSoon && (
                  <div className="flex items-center text-brand-600 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                    Launch Tool →
                  </div>
                )}
              </Link>
            </LockedCard>
          ))}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-brand-600 to-accent-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Need Network Tools?</h2>
            <p className="text-lg opacity-90 mb-8">
              Check out our powerful network utilities including DNS lookup, port scanner, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tools/network-tools" className="btn-primary bg-white text-brand-600 hover:bg-neural-50">
                Network Tools
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
