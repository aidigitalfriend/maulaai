'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Check } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function SDKsDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const sdks = [
    { name: "JavaScript/TypeScript", description: "Modern SDK for Node.js and browser environments", icon: "📘", version: "2.0.0", href: "#javascript" },
    { name: "Python", description: "Complete Python SDK with async support", icon: "🐍", version: "1.8.0", href: "#python" },
    { name: "Go", description: "High-performance Go SDK for enterprise applications", icon: "🐹", version: "1.5.0", href: "#go" },
    { name: "PHP", description: "Full-featured PHP SDK for web applications", icon: "🚀", version: "2.1.0", href: "#php" },
    { name: "Ruby", description: "Ruby gem for seamless integration", icon: "💎", version: "1.3.0", href: "#ruby" },
    { name: "Java", description: "Enterprise-grade Java SDK", icon: "☕", version: "2.2.0", href: "#java" }
  ];

  const featureComparison = [
    { feature: "RESTful API Support", js: true, py: true, go: true, php: true },
    { feature: "Real-time Streaming", js: true, py: true, go: true, php: false },
    { feature: "File Upload", js: true, py: true, go: true, php: true },
    { feature: "Error Handling", js: true, py: true, go: true, php: true },
    { feature: "Type Safety", js: true, py: false, go: true, php: false },
    { feature: "Async/Await", js: true, py: true, go: true, php: false },
    { feature: "WebSocket Support", js: true, py: true, go: true, php: false },
    { feature: "Rate Limiting", js: true, py: true, go: true, php: true }
  ];

  useGSAP(() => {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.sdk-card',
      { opacity: 0, y: 40, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.sdks-grid', start: 'top 80%' } }
    );

    gsap.fromTo('.code-block',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.code-section', start: 'top 80%' } }
    );

    gsap.fromTo('.comparison-table',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.comparison-table', start: 'top 85%' } }
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
              <span className="text-xl">💻</span>
              <span className="text-gray-300">Official Libraries</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">SDKs & Libraries</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Official SDKs and community libraries for your favorite programming languages
            </p>
          </div>
        </div>
      </section>

      {/* SDKs Grid */}
      <section className="py-24 px-6 sdks-grid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Choose Your Language</h2>
            <p className="text-gray-400">All SDKs are open source and actively maintained</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sdks.map((sdk, i) => (
              <a key={i} href={sdk.href} className="sdk-card glass-card rounded-2xl p-6 group block opacity-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{sdk.icon}</div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff]">v{sdk.version}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">{sdk.name}</h3>
                <p className="text-gray-400 text-sm">{sdk.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] code-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Quick Start Examples</h2>
            <p className="text-gray-400">Get up and running in minutes</p>
          </div>

          {/* JavaScript */}
          <div id="javascript" className="code-block glass-card rounded-2xl p-8 mb-8 opacity-0">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📘</span>
              <h3 className="text-xl font-bold text-white">JavaScript / TypeScript</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Install:</p>
                <code className="block bg-black/50 p-4 rounded-lg text-[#00d4ff] text-sm font-mono border border-white/10">npm install @onelastai/sdk</code>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Usage:</p>
                <pre className="bg-black/50 p-4 rounded-lg text-gray-300 text-sm font-mono border border-white/10 overflow-x-auto">{`import { OnelastAI } from '@onelastai/sdk';

const client = new OnelastAI({
  apiKey: process.env.ONELASTAI_API_KEY
});

const response = await client.conversations.send({
  agentId: 'agent_123',
  message: 'Hello!'
});`}</pre>
              </div>
            </div>
          </div>

          {/* Python */}
          <div id="python" className="code-block glass-card rounded-2xl p-8 mb-8 opacity-0">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🐍</span>
              <h3 className="text-xl font-bold text-white">Python</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Install:</p>
                <code className="block bg-black/50 p-4 rounded-lg text-[#00d4ff] text-sm font-mono border border-white/10">pip install onelastai-sdk</code>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Usage:</p>
                <pre className="bg-black/50 p-4 rounded-lg text-gray-300 text-sm font-mono border border-white/10 overflow-x-auto">{`from onelastai import OnelastAI

client = OnelastAI(api_key='YOUR_API_KEY')

response = client.conversations.send(
    agent_id='agent_123',
    message='Hello!'
)

print(response['reply'])`}</pre>
              </div>
            </div>
          </div>

          {/* Go */}
          <div id="go" className="code-block glass-card rounded-2xl p-8 opacity-0">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🐹</span>
              <h3 className="text-xl font-bold text-white">Go</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Install:</p>
                <code className="block bg-black/50 p-4 rounded-lg text-[#00d4ff] text-sm font-mono border border-white/10">go get github.com/onelastai/sdk-go</code>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Usage:</p>
                <pre className="bg-black/50 p-4 rounded-lg text-gray-300 text-sm font-mono border border-white/10 overflow-x-auto">{`package main

import "github.com/onelastai/sdk-go"

func main() {
    client := onelastai.NewClient("YOUR_API_KEY")
    
    response, _ := client.Conversations.Send(&onelastai.Message{
        AgentID: "agent_123",
        Message: "Hello!",
    })
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Feature Comparison</h2>
            <p className="text-gray-400">See what each SDK supports</p>
          </div>
          <div className="comparison-table glass-card rounded-2xl p-6 overflow-x-auto opacity-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">JS/TS</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Python</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Go</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">PHP</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">{row.feature}</td>
                    <td className="text-center py-3 px-4">{row.js ? <Check className="w-5 h-5 text-[#00ff88] mx-auto" /> : <span className="text-gray-600">—</span>}</td>
                    <td className="text-center py-3 px-4">{row.py ? <Check className="w-5 h-5 text-[#00ff88] mx-auto" /> : <span className="text-gray-600">—</span>}</td>
                    <td className="text-center py-3 px-4">{row.go ? <Check className="w-5 h-5 text-[#00ff88] mx-auto" /> : <span className="text-gray-600">—</span>}</td>
                    <td className="text-center py-3 px-4">{row.php ? <Check className="w-5 h-5 text-[#00ff88] mx-auto" /> : <span className="text-gray-600">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold metallic-text mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">Choose your SDK and start building powerful AI integrations.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/api" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold hover:opacity-90 transition-all">
              View API Reference
            </Link>
            <Link href="/docs/tutorials" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Browse Tutorials
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
