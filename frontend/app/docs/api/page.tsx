'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight, Key, Server, MessageSquare, Gauge, AlertTriangle, Webhook } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function DocsAPIPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const apiEndpoints = [
    { title: "Authentication", description: "Secure your API requests with OAuth 2.0 and API keys", category: "Security", href: "#authentication", Icon: Key },
    { title: "Agents Endpoints", description: "Create, retrieve, and manage AI agents through our REST API", category: "Reference", href: "#agents", Icon: Server },
    { title: "Conversations API", description: "Access and manage chat conversations and message history", category: "Reference", href: "#conversations", Icon: MessageSquare },
    { title: "Rate Limits", description: "Understand rate limiting and throttling policies", category: "Policy", href: "#rate-limits", Icon: Gauge },
    { title: "Error Handling", description: "Learn how to handle and debug API errors effectively", category: "Guide", href: "#errors", Icon: AlertTriangle },
    { title: "Webhooks", description: "Set up real-time notifications for agent events", category: "Integration", href: "#webhooks", Icon: Webhook }
  ];

  useGSAP(() => {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40, rotateX: 15 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.hero-buttons', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');

    gsap.fromTo('.api-card',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.api-grid', start: 'top 80%' } }
    );

    gsap.fromTo('.code-block',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.code-section', start: 'top 80%' } }
    );

    gsap.fromTo('.endpoint-block',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.endpoints-section', start: 'top 80%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(0,212,255,0.15); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00d4ff] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Documentation
          </Link>
          
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <span className="text-xl">📡</span>
              <span className="text-gray-300">Developer API</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">API Reference</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 opacity-0">
              Build powerful integrations with our comprehensive REST API
            </p>
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center opacity-0">
              <a href="#quick-start" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold hover:opacity-90 transition-all">Quick Start</a>
              <a href="#authentication" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">View Endpoints</a>
            </div>
          </div>
        </div>
      </section>

      {/* API Overview */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <h3 className="text-lg font-bold text-white">Base URL</h3>
            </div>
            <code className="block bg-black/50 p-4 rounded-lg text-[#00d4ff] text-sm font-mono border border-white/10">
              https://api.onelastai.com/v1
            </code>
            <p className="text-gray-500 text-sm mt-3">All API requests should be made to this base URL with proper versioning.</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-[#00ff88]" />
              </div>
              <h3 className="text-lg font-bold text-white">Authentication</h3>
            </div>
            <code className="block bg-black/50 p-4 rounded-lg text-[#00ff88] text-sm font-mono border border-white/10">
              Authorization: Bearer YOUR_API_KEY
            </code>
            <p className="text-gray-500 text-sm mt-3">Include your API key in the Authorization header for all requests.</p>
          </div>
        </div>
      </section>

      {/* API Reference Grid */}
      <section className="py-24 px-6 api-grid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">API Reference</h2>
            <p className="text-gray-400">Complete documentation for all endpoints and methods</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiEndpoints.map((endpoint, i) => {
              const Icon = endpoint.Icon;
              return (
                <a key={i} href={endpoint.href} className="api-card glass-card rounded-2xl p-6 group block opacity-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 border border-[#00d4ff]/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[#00d4ff]" />
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff]">{endpoint.category}</span>
                  <h3 className="text-lg font-bold text-white mt-4 mb-2 group-hover:text-[#00d4ff] transition-colors">{endpoint.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{endpoint.description}</p>
                  <div className="mt-4 flex items-center text-[#00d4ff] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      <section id="authentication" className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] code-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold metallic-text mb-8">Authentication</h2>
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Getting Your API Key</h3>
            <div className="space-y-4 mb-8">
              {[
                { step: 1, title: "Sign in to your account", desc: "Log in to the One Last AI dashboard" },
                { step: 2, title: "Navigate to API Settings", desc: "Go to Settings → Developer → API Keys" },
                { step: 3, title: "Generate a new API key", desc: "Click 'Create New Key' and copy your key" }
              ].map((item, i) => (
                <div key={i} className="code-block flex gap-4 opacity-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0066ff] rounded-full flex items-center justify-center flex-shrink-0 font-bold">{item.step}</div>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                <strong>⚠️ Security Note:</strong> Keep your API keys confidential. Never commit them to version control or share publicly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agents Endpoints */}
      <section id="agents" className="py-24 px-6 endpoints-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold metallic-text mb-8">Agents Endpoints</h2>
          <div className="space-y-6">
            <div className="endpoint-block glass-card rounded-2xl p-6 opacity-0">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-mono text-sm font-semibold border border-blue-500/30">GET</span>
                <code className="text-gray-300 font-mono">/agents</code>
              </div>
              <p className="text-gray-400 mb-4">Retrieve a list of all your agents</p>
              <div className="bg-black/50 p-4 rounded-lg border border-white/10 overflow-x-auto">
                <pre className="text-gray-300 text-sm font-mono">{`{
  "data": [
    { "id": "agent_123", "name": "Tech Wizard", "personality": "helpful" }
  ],
  "total": 1
}`}</pre>
              </div>
            </div>

            <div className="endpoint-block glass-card rounded-2xl p-6 opacity-0">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm font-semibold border border-green-500/30">POST</span>
                <code className="text-gray-300 font-mono">/agents</code>
              </div>
              <p className="text-gray-400 mb-4">Create a new AI agent</p>
              <div className="bg-black/50 p-4 rounded-lg border border-white/10 overflow-x-auto">
                <pre className="text-gray-300 text-sm font-mono">{`{
  "name": "New Agent",
  "personality": "friendly",
  "model": "gpt-4",
  "system_prompt": "You are a helpful assistant"
}`}</pre>
              </div>
            </div>

            <div className="endpoint-block glass-card rounded-2xl p-6 opacity-0">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-mono text-sm font-semibold border border-blue-500/30">GET</span>
                <code className="text-gray-300 font-mono">/agents/[agent_id]</code>
              </div>
              <p className="text-gray-400">Retrieve details of a specific agent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Conversations API */}
      <section id="conversations" className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold metallic-text mb-8">Conversations API</h2>
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm font-semibold border border-green-500/30">POST</span>
                <code className="text-gray-300 font-mono">/conversations</code>
              </div>
              <p className="text-gray-400 mb-4">Send a message to an agent and receive a response</p>
              <div className="bg-black/50 p-4 rounded-lg border border-white/10 overflow-x-auto">
                <pre className="text-gray-300 text-sm font-mono">{`{
  "agent_id": "agent_123",
  "message": "Hello, how are you?"
}`}</pre>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-mono text-sm font-semibold border border-blue-500/30">GET</span>
                <code className="text-gray-300 font-mono">/conversations/[conversation_id]</code>
              </div>
              <p className="text-gray-400">Retrieve conversation history</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section id="rate-limits" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold metallic-text mb-8">Rate Limits</h2>
          <div className="glass-card rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { plan: "Free", limit: "100 requests/day", color: "gray" },
                { plan: "Pro", limit: "10,000 requests/day", color: "#00d4ff" },
                { plan: "Enterprise", limit: "Unlimited", color: "#00ff88" }
              ].map((tier, i) => (
                <div key={i} className="text-center p-4 bg-black/30 rounded-xl border border-white/10">
                  <div className="font-bold text-white mb-1">{tier.plan}</div>
                  <div className="text-sm" style={{ color: tier.color }}>{tier.limit}</div>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm">Rate limit headers are included in all responses: <code className="text-[#00d4ff]">X-RateLimit-Remaining</code>, <code className="text-[#00d4ff]">X-RateLimit-Reset</code></p>
          </div>
        </div>
      </section>

      {/* Error Handling */}
      <section id="errors" className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold metallic-text mb-8">Error Handling</h2>
          <div className="glass-card rounded-2xl p-8">
            <div className="space-y-4">
              {[
                { code: "400", message: "Bad Request", desc: "Invalid request parameters" },
                { code: "401", message: "Unauthorized", desc: "Invalid or missing API key" },
                { code: "403", message: "Forbidden", desc: "Access denied to this resource" },
                { code: "404", message: "Not Found", desc: "Resource does not exist" },
                { code: "429", message: "Too Many Requests", desc: "Rate limit exceeded" },
                { code: "500", message: "Internal Server Error", desc: "Server-side error occurred" }
              ].map((error, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-black/30 rounded-lg border border-white/10">
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded font-mono text-sm font-semibold border border-red-500/30">{error.code}</span>
                  <div>
                    <span className="text-white font-medium">{error.message}</span>
                    <span className="text-gray-500 text-sm ml-2">{error.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold metallic-text mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">Create your API key and start building powerful integrations today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold hover:opacity-90 transition-all">
              Get Your API Key
            </Link>
            <Link href="/docs/sdks" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              View SDKs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
