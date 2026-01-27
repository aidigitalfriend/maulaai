'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Code, Copy, Check, Key, Globe, MessageSquare, Settings, Zap, Users, Brain, AlertTriangle } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function APIReferencePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const endpoints = [
    { method: 'GET', path: '/api/agents', desc: 'List all available agents', color: '#00ff88' },
    { method: 'GET', path: '/api/agents/:id', desc: 'Get agent details', color: '#00ff88' },
    { method: 'POST', path: '/api/agents', desc: 'Create a new agent', color: '#00d4ff' },
    { method: 'PUT', path: '/api/agents/:id', desc: 'Update agent configuration', color: '#f59e0b' },
    { method: 'DELETE', path: '/api/agents/:id', desc: 'Delete an agent', color: '#ef4444' },
    { method: 'POST', path: '/api/agents/:id/chat', desc: 'Send message to agent', color: '#00d4ff' }
  ];

  const codeExamples = [
    {
      title: 'Authentication',
      lang: 'bash',
      code: `curl -X GET "https://api.onelastai.com/api/agents" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    },
    {
      title: 'Create Agent',
      lang: 'javascript',
      code: `const response = await fetch('https://api.onelastai.com/api/agents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Agent',
    model: 'gpt-4-turbo',
    systemPrompt: 'You are a helpful assistant...'
  })
});

const agent = await response.json();`
    },
    {
      title: 'Chat with Agent',
      lang: 'javascript',
      code: `const response = await fetch('https://api.onelastai.com/api/agents/agent_123/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Hello, how can you help me?',
    sessionId: 'session_abc123'
  })
});

const { reply, tokens } = await response.json();`
    }
  ];

  const errorCodes = [
    { code: '400', desc: 'Bad Request - Invalid parameters', color: '#f59e0b' },
    { code: '401', desc: 'Unauthorized - Invalid or missing API key', color: '#ef4444' },
    { code: '403', desc: 'Forbidden - Insufficient permissions', color: '#ef4444' },
    { code: '404', desc: 'Not Found - Agent does not exist', color: '#f59e0b' },
    { code: '429', desc: 'Too Many Requests - Rate limit exceeded', color: '#a855f7' },
    { code: '500', desc: 'Server Error - Internal error', color: '#ef4444' }
  ];

  const copyCode = (idx: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.endpoint-row',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.endpoints-section', start: 'top 85%' } }
    );

    gsap.fromTo('.code-block',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.code-section', start: 'top 85%' } }
    );

    gsap.fromTo('.error-row',
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: '.errors-section', start: 'top 85%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs/agents" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00d4ff] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Agent Docs
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Code className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-gray-300">API Documentation</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">API Reference</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Complete API documentation for integrating agents into your applications
            </p>
          </div>
        </div>
      </section>

      {/* Base URL */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-[#00d4ff]" />
              <span className="text-gray-400">Base URL:</span>
            </div>
            <code className="text-[#00ff88] font-mono bg-black/50 px-4 py-2 rounded-lg flex-1 text-center md:text-left">
              https://api.onelastai.com
            </code>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-24 px-6 endpoints-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Endpoints</h2>
            <p className="text-gray-400">Available API endpoints for agent operations</p>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-gray-500 text-sm font-medium">
              <div className="col-span-2">Method</div>
              <div className="col-span-5">Endpoint</div>
              <div className="col-span-5">Description</div>
            </div>
            {endpoints.map((ep, i) => (
              <div key={i} className="endpoint-row grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors opacity-0">
                <div className="col-span-2">
                  <span className="px-2 py-1 rounded text-xs font-bold" style={{ background: `${ep.color}20`, color: ep.color }}>
                    {ep.method}
                  </span>
                </div>
                <div className="col-span-5">
                  <code className="text-[#00d4ff] text-sm font-mono">{ep.path}</code>
                </div>
                <div className="col-span-5 text-gray-400 text-sm">{ep.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] code-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Code Examples</h2>
            <p className="text-gray-400">Ready-to-use code snippets for common operations</p>
          </div>
          <div className="space-y-8">
            {codeExamples.map((example, i) => (
              <div key={i} className="code-block glass-card rounded-2xl overflow-hidden opacity-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300 font-medium">{example.title}</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400">{example.lang}</span>
                  </div>
                  <button
                    onClick={() => copyCode(i, example.code)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedIdx === i ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{copiedIdx === i ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-6 overflow-x-auto text-sm">
                  <code className="text-[#00d4ff]">{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Error Codes */}
      <section className="py-24 px-6 errors-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Error Codes</h2>
            <p className="text-gray-400">Common error responses and their meanings</p>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            {errorCodes.map((error, i) => (
              <div key={i} className="error-row flex items-center gap-6 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors opacity-0">
                <span className="font-mono font-bold text-lg" style={{ color: error.color }}>{error.code}</span>
                <span className="text-gray-400">{error.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-[#f59e0b]" />
              <h2 className="text-2xl font-bold text-white">Rate Limits</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-black/30 rounded-xl border border-white/10">
                <h4 className="text-gray-400 text-sm mb-1">Free Tier</h4>
                <p className="text-2xl font-bold text-white">100</p>
                <p className="text-gray-500 text-sm">requests/hour</p>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/10">
                <h4 className="text-gray-400 text-sm mb-1">Pro Tier</h4>
                <p className="text-2xl font-bold text-[#00d4ff]">1,000</p>
                <p className="text-gray-500 text-sm">requests/hour</p>
              </div>
              <div className="p-4 bg-black/30 rounded-xl border border-white/10">
                <h4 className="text-gray-400 text-sm mb-1">Enterprise</h4>
                <p className="text-2xl font-bold text-[#00ff88]">Unlimited</p>
                <p className="text-gray-500 text-sm">custom limits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Ready to Integrate?</h2>
          <p className="text-gray-400 mb-8">Get your API key and start building with agents</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/settings" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold hover:opacity-90 transition-all">
              Get API Key
            </Link>
            <Link href="/docs/sdks" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              View SDKs →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
