'use client'

import Link from 'next/link'
import { Code2, Hash, FileJson, Binary, Palette, Calculator, Clock, Key } from 'lucide-react'

const developerUtils = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data with syntax highlighting',
    icon: FileJson,
    href: '/tools/json-formatter',
    color: 'from-blue-500 to-cyan-500',
    comingSoon: false
  },
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings easily',
    icon: Binary,
    href: '/tools/base64',
    color: 'from-purple-500 to-pink-500',
    comingSoon: false
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and other hash values',
    icon: Hash,
    href: '/tools/hash-generator',
    color: 'from-green-500 to-emerald-500',
    comingSoon: false
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique identifiers (UUID/GUID) in various formats',
    icon: Key,
    href: '/tools/uuid-generator',
    color: 'from-orange-500 to-red-500',
    comingSoon: false
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and convert between HEX, RGB, HSL formats',
    icon: Palette,
    href: '/tools/color-picker',
    color: 'from-indigo-500 to-purple-500',
    comingSoon: false
  },
  {
    id: 'timestamp',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates',
    icon: Clock,
    href: '/tools/timestamp-converter',
    color: 'from-yellow-500 to-orange-500',
    comingSoon: false
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with live matching',
    icon: Code2,
    href: '/tools/regex-tester',
    color: 'from-teal-500 to-green-500',
    comingSoon: false
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse and decode URLs to extract components',
    icon: Code2,
    href: '/tools/url-parser',
    color: 'from-pink-500 to-rose-500',
    comingSoon: false
  }
]

export default function DeveloperUtilsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      {/* Hero Section */}
      <section className="container-custom py-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Code2 className="w-16 h-16 text-brand-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Developer <span className="text-gradient">Utils</span>
          </h1>
          <p className="text-xl text-neural-300 max-w-3xl mx-auto">
            Essential utilities and converters for developers to boost productivity and streamline workflows
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {developerUtils.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className={`group relative bg-neural-800/50 rounded-2xl p-6 border border-neural-700 hover:border-brand-500 transition-all duration-300 hover:scale-105 ${
                tool.comingSoon ? 'cursor-not-allowed opacity-75' : ''
              }`}
              onClick={(e) => tool.comingSoon && e.preventDefault()}
            >
              {tool.comingSoon && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-brand-600 text-xs font-semibold rounded-full">
                  Coming Soon
                </div>
              )}
              
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-brand-400 transition-colors">
                {tool.name}
              </h3>
              
              <p className="text-sm text-neural-400">
                {tool.description}
              </p>

              {!tool.comingSoon && (
                <div className="mt-4 flex items-center text-brand-400 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                  Launch Tool →
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="container-custom py-16 border-t border-neural-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-brand-400 mb-2">8+</div>
            <div className="text-neural-300">Developer Tools</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-brand-400 mb-2">Fast</div>
            <div className="text-neural-300">Instant Results</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-brand-400 mb-2">Free</div>
            <div className="text-neural-300">No Registration</div>
          </div>
        </div>
      </section>
    </div>
  )
}
