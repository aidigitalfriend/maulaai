'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Database, Users, Package, FileText, BarChart3, MessageSquare, Mail, Zap, Shield, Settings, Download, Copy, Check } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function DataGeneratorDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const dataTypes = [
    { Icon: Users, title: 'Users & Profiles', description: 'Generate realistic user data with names, emails, avatars, addresses, and demographics.', fields: ['name', 'email', 'avatar', 'address', 'phone', 'birthdate', 'occupation'], emoji: '👤' },
    { Icon: Package, title: 'Products', description: 'Create product catalogs with names, descriptions, prices, categories, and inventory data.', fields: ['name', 'description', 'price', 'category', 'sku', 'stock', 'images'], emoji: '📦' },
    { Icon: FileText, title: 'Posts & Articles', description: 'Generate blog posts, articles, and content with titles, body text, tags, and metadata.', fields: ['title', 'content', 'author', 'tags', 'publishedAt', 'views', 'likes'], emoji: '📝' },
    { Icon: BarChart3, title: 'Analytics Data', description: 'Create time-series analytics data for charts, dashboards, and reporting.', fields: ['date', 'pageViews', 'visitors', 'bounceRate', 'sessionDuration', 'conversions'], emoji: '📊' },
    { Icon: MessageSquare, title: 'Comments & Reviews', description: 'Generate user reviews, comments, ratings, and feedback for products or content.', fields: ['author', 'content', 'rating', 'helpful', 'verified', 'createdAt'], emoji: '💬' },
    { Icon: Mail, title: 'Emails & Messages', description: 'Create email threads, chat messages, and notifications with realistic content.', fields: ['from', 'to', 'subject', 'body', 'timestamp', 'read', 'attachments'], emoji: '✉️' }
  ];

  const features = [
    { Icon: Zap, title: 'Instant Generation', description: 'Get data in milliseconds, not minutes' },
    { Icon: Shield, title: 'Realistic & Valid', description: 'Properly formatted emails, phones, addresses' },
    { Icon: Settings, title: 'Customizable', description: 'Choose exactly which fields you need' },
    { Icon: Download, title: 'Multiple Formats', description: 'Export as JSON, CSV, or SQL' }
  ];

  const useCases = [
    { title: 'Frontend Development', description: 'Populate UI mockups and prototypes with realistic data', icon: '🎨' },
    { title: 'API Testing', description: 'Generate test payloads for API endpoints', icon: '🔧' },
    { title: 'Database Seeding', description: 'Fill development databases with sample data', icon: '🗄️' },
    { title: 'Demo Environments', description: 'Create compelling demos with real-looking data', icon: '📺' },
    { title: 'Load Testing', description: 'Generate large datasets for performance testing', icon: '⚡' },
    { title: 'Documentation', description: 'Create example data for API documentation', icon: '📚' }
  ];

  const exampleCode = `// Example: Generate 10 users
const response = await fetch('/api/generate-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'users',
    count: 10,
    fields: ['name', 'email', 'avatar', 'address']
  })
});

const { data } = await response.json();`;

  const sampleOutput = `[
  {
    "id": "usr_1a2b3c4d",
    "name": "Sarah Johnson",
    "email": "sarah.johnson@email.com",
    "avatar": "https://api.dicebear.com/...",
    "address": {
      "street": "123 Oak Street",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94102"
    }
  }
]`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(id);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  useGSAP(() => {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.feature-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.features-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.datatype-card',
      { opacity: 0, y: 40, rotate: 2 },
      { opacity: 1, y: 0, rotate: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.datatypes-grid', start: 'top 80%' } }
    );

    gsap.fromTo('.usecase-card',
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.usecases-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.code-example',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: 'power3.out', scrollTrigger: { trigger: '.code-section', start: 'top 80%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(59,130,246,0.4); transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(59,130,246,0.2); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Documentation
          </Link>
          
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <span className="text-xl">📊</span>
              <span className="text-gray-300">Test Data Tool</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Data Generator</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Generate realistic test data for your applications instantly
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-y border-white/5 features-grid">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.Icon;
            return (
              <div key={i} className="feature-card glass-card rounded-xl p-4 text-center opacity-0">
                <Icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="font-bold text-white text-sm mb-1">{feature.title}</div>
                <div className="text-xs text-gray-500">{feature.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Data Types */}
      <section className="py-24 px-6 datatypes-grid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Available Data Types</h2>
            <p className="text-gray-400">Generate any type of data you need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataTypes.map((type, i) => (
              <div key={i} className="datatype-card glass-card rounded-2xl p-6 opacity-0">
                <div className="text-4xl mb-4">{type.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{type.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{type.description}</p>
                <div className="flex flex-wrap gap-2">
                  {type.fields.slice(0, 4).map((field, j) => (
                    <span key={j} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{field}</span>
                  ))}
                  {type.fields.length > 4 && (
                    <span className="text-xs px-2 py-1 rounded bg-white/5 text-gray-500">+{type.fields.length - 4} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] code-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Code Examples</h2>
            <p className="text-gray-400">Easy to integrate with any application</p>
          </div>

          <div className="space-y-6">
            <div className="code-example glass-card rounded-2xl p-6 opacity-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Request</h3>
                <button onClick={() => copyToClipboard(exampleCode, 'code')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  {copiedExample === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedExample === 'code' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-black/50 p-4 rounded-lg text-gray-300 text-sm font-mono border border-white/10 overflow-x-auto">{exampleCode}</pre>
            </div>

            <div className="code-example glass-card rounded-2xl p-6 opacity-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Response</h3>
                <button onClick={() => copyToClipboard(sampleOutput, 'output')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  {copiedExample === 'output' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedExample === 'output' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-black/50 p-4 rounded-lg text-gray-300 text-sm font-mono border border-white/10 overflow-x-auto">{sampleOutput}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6 usecases-grid">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Use Cases</h2>
            <p className="text-gray-400">Perfect for development, testing, and demos</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {useCases.map((useCase, i) => (
              <div key={i} className="usecase-card glass-card rounded-xl p-4 text-center opacity-0">
                <div className="text-3xl mb-2">{useCase.icon}</div>
                <div className="font-bold text-white text-sm mb-1">{useCase.title}</div>
                <div className="text-xs text-gray-500">{useCase.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold metallic-text mb-4">Ready to Generate Data?</h2>
          <p className="text-gray-400 mb-8">Try our data generator tool and speed up your development workflow.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools/data-generator" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-semibold hover:opacity-90 transition-all">
              Try Data Generator
            </Link>
            <Link href="/docs/api" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              View API Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
