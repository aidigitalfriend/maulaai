'use client';

import { useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FileJson, Check, Copy, Trash2, Wand2, Minimize2, SplitSquareHorizontal, ArrowLeft } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function JsonFormatterPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.tool-panel', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.2');
  }, { scope: containerRef });

  const formatted = useMemo(() => {
    if (!input.trim()) {
      setError(null);
      return '';
    }
    try {
      const parsed = JSON.parse(input);
      setError(null);
      return JSON.stringify(parsed, null, indent);
    } catch (e: any) {
      setError(e.message);
      return '';
    }
  }, [input, indent]);

  const minified = useMemo(() => {
    try {
      if (!input.trim()) return '';
      return JSON.stringify(JSON.parse(input));
    } catch {
      return '';
    }
  }, [input]);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadExample = () => {
    setInput(JSON.stringify({
      user: { id: 123, name: 'Jane Doe' },
      roles: ['admin', 'editor'],
      active: true,
      meta: { createdAt: new Date().toISOString() }
    }, null, 2));
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Link href="/tools/developer-utils" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00d4ff] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Developer Utils
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <FileJson className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-gray-300">JSON Formatter</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 metallic-text opacity-0">
            JSON Formatter
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Format, validate, minify, and pretty-print JSON in real-time
          </p>
        </div>
      </section>

      {/* Tool Section */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="tool-panel glass-card rounded-2xl p-6 opacity-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileJson className="w-5 h-5 text-[#00d4ff]" />
                Input JSON
              </h2>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                  onClick={loadExample}
                >
                  <SplitSquareHorizontal className="w-4 h-4" />
                  Example
                </button>
                <button 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                  onClick={() => setInput('')}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
            <textarea 
              className="w-full font-mono text-sm h-[420px] bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff]/50 transition-all resize-none"
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder='{"key": "value"}'
            />
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="tool-panel glass-card rounded-2xl p-6 opacity-0 lg:sticky lg:top-6 lg:h-fit">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-white">Formatted Output</h2>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Indent</span>
                  <select 
                    className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff]/50"
                    value={indent} 
                    onChange={(e) => setIndent(parseInt(e.target.value))}
                  >
                    <option value={2} className="bg-[#1a1a2e]">2</option>
                    <option value={4} className="bg-[#1a1a2e]">4</option>
                    <option value={8} className="bg-[#1a1a2e]">8</option>
                  </select>
                </div>
                <button 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formatted} 
                  onClick={() => copy(formatted)}
                >
                  {copied ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
                <button 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!minified} 
                  onClick={() => copy(minified)}
                >
                  <Minimize2 className="w-4 h-4" />
                  Minified
                </button>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-black font-semibold rounded-lg transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#00d4ff]/20"
                  disabled={!input.trim() || !!error} 
                  onClick={() => setInput(formatted)}
                >
                  <Wand2 className="w-4 h-4" />
                  Apply
                </button>
              </div>
            </div>
            <pre className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm overflow-auto max-h-[420px] text-gray-300 font-mono">
              <code>{formatted || '/* Valid JSON will appear here */'}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
