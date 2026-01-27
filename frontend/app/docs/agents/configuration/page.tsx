'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Settings, Sliders, Palette, Zap, MessageSquare, Brain, Copy, Check, Shield, Cpu } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ConfigurationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const configOptions = [
    { icon: Brain, title: 'Model Selection', desc: 'Choose from GPT-4, Claude, Gemini, and more', color: '#a855f7' },
    { icon: Sliders, title: 'Temperature', desc: 'Control creativity vs consistency (0-1)', color: '#00d4ff' },
    { icon: MessageSquare, title: 'System Prompt', desc: 'Define agent personality and behavior', color: '#00ff88' },
    { icon: Shield, title: 'Safety Settings', desc: 'Configure content filters and guardrails', color: '#f59e0b' },
    { icon: Cpu, title: 'Max Tokens', desc: 'Set response length limits', color: '#ef4444' },
    { icon: Palette, title: 'Persona', desc: 'Customize name, avatar, and style', color: '#ec4899' }
  ];

  const codeExamples = [
    {
      title: 'Basic Configuration',
      code: `{
  "name": "My Custom Agent",
  "model": "gpt-4-turbo",
  "temperature": 0.7,
  "maxTokens": 2048,
  "systemPrompt": "You are a helpful assistant..."
}`
    },
    {
      title: 'Advanced Settings',
      code: `{
  "name": "Code Expert",
  "model": "claude-3-opus",
  "temperature": 0.3,
  "maxTokens": 4096,
  "systemPrompt": "You are an expert programmer...",
  "tools": ["code_execution", "web_search"],
  "memory": { "enabled": true, "retention": "session" },
  "safety": { "contentFilter": "strict" }
}`
    }
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

    gsap.fromTo('.config-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.config-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.code-block',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.code-section', start: 'top 80%' } }
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs/agents" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#a855f7] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Agent Docs
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Settings className="w-4 h-4 text-[#a855f7]" />
              <span className="text-gray-300">Configuration Guide</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Agent Configuration</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Learn how to customize and fine-tune your AI agents for optimal performance
            </p>
          </div>
        </div>
      </section>

      {/* Config Options */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Configuration Options</h2>
            <p className="text-gray-400">Customize every aspect of your agent's behavior</p>
          </div>
          <div className="config-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configOptions.map((option, i) => {
              const Icon = option.icon;
              return (
                <div key={i} className="config-card glass-card rounded-2xl p-6 opacity-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${option.color}20`, border: `1px solid ${option.color}40` }}>
                    <Icon className="w-6 h-6" style={{ color: option.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{option.title}</h3>
                  <p className="text-gray-500 text-sm">{option.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] code-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Configuration Examples</h2>
            <p className="text-gray-400">JSON configuration examples to get you started</p>
          </div>
          <div className="space-y-8">
            {codeExamples.map((example, i) => (
              <div key={i} className="code-block glass-card rounded-2xl overflow-hidden opacity-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <span className="text-gray-300 font-medium">{example.title}</span>
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

      {/* Tips */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold metallic-text mb-6">💡 Configuration Tips</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00d4ff] mt-2"></div>
                <p className="text-gray-400"><span className="text-white font-medium">Temperature:</span> Lower values (0.1-0.3) for factual tasks, higher (0.7-1.0) for creative work</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00ff88] mt-2"></div>
                <p className="text-gray-400"><span className="text-white font-medium">System Prompt:</span> Be specific about role, tone, and constraints for consistent behavior</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#a855f7] mt-2"></div>
                <p className="text-gray-400"><span className="text-white font-medium">Model Selection:</span> GPT-4 for general tasks, Claude for analysis, Gemini for multimodal</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#f59e0b] mt-2"></div>
                <p className="text-gray-400"><span className="text-white font-medium">Memory:</span> Enable for conversations requiring context, disable for stateless queries</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Ready to Configure?</h2>
          <p className="text-gray-400 mb-8">Apply these settings to your agents and see the difference</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents" className="px-8 py-4 bg-gradient-to-r from-[#a855f7] to-[#6366f1] rounded-xl font-semibold hover:opacity-90 transition-all">
              Configure Agents
            </Link>
            <Link href="/docs/agents/api-reference" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              API Reference →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
