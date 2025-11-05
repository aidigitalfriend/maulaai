'use client'

import Link from 'next/link'
import { Network, Globe, Wifi, MapPin, Shield, Activity, Server, Radio, Code } from 'lucide-react'

const networkTools = [
  {
    id: 'ip-info',
    name: 'IP Information',
    description: 'Get detailed information about any IP address including geolocation, ISP, and more',
    icon: MapPin,
    href: '/tools/ip-info',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'Perform DNS queries and check domain name system records',
    icon: Globe,
    href: '/tools/dns-lookup',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'port-scanner',
    name: 'Port Scanner',
    description: 'Scan ports on any host to check open ports and services',
    icon: Server,
    href: '/tools/port-scanner',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'ping-test',
    name: 'Ping Test',
    description: 'Test network connectivity and measure latency to any host',
    icon: Activity,
    href: '/tools/ping-test',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'traceroute',
    name: 'Traceroute',
    description: 'Trace the path packets take to reach a destination',
    icon: Radio,
    href: '/tools/traceroute',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'whois',
    name: 'WHOIS Lookup',
    description: 'Query WHOIS database for domain registration information',
    icon: Shield,
    href: '/tools/whois-lookup',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'ssl-checker',
    name: 'SSL Certificate Checker',
    description: 'Check SSL certificate details and validity for any website',
    icon: Shield,
    href: '/tools/ssl-checker',
    color: 'from-teal-500 to-green-500'
  },
  {
    id: 'speed-test',
    name: 'Speed Test',
    description: 'Test your internet connection speed and bandwidth',
    icon: Wifi,
    href: '/tools/speed-test',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'api-tester',
    name: 'API Tester',
    description: 'Professional API testing tool with presets, authentication, and advanced features',
    icon: Code,
    href: '/tools/api-tester',
    color: 'from-violet-500 to-purple-500'
  }
]

export default function NetworkToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      {/* Hero Section */}
      <section className="container-custom py-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Network className="w-16 h-16 text-brand-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Network <span className="text-gradient">Tools</span>
          </h1>
          <p className="text-xl text-neural-300 max-w-3xl mx-auto">
            Powerful networking utilities to diagnose, analyze, and troubleshoot your network infrastructure
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {networkTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative bg-neural-800/50 rounded-2xl p-6 border border-neural-700 hover:border-brand-500 transition-all duration-300 hover:scale-105"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-brand-400 transition-colors">
                {tool.name}
              </h3>
              
              <p className="text-sm text-neural-400">
                {tool.description}
              </p>

              <div className="mt-4 flex items-center text-brand-400 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                Launch Tool →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="container-custom py-16 border-t border-neural-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-brand-400 mb-2">9+</div>
            <div className="text-neural-300">Network Tools</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-brand-400 mb-2">Fast</div>
            <div className="text-neural-300">Real-time Results</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-brand-400 mb-2">Free</div>
            <div className="text-neural-300">No Limits</div>
          </div>
        </div>
      </section>
    </div>
  )
}
