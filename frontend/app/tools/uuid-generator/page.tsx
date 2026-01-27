'use client';

import { useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Key, Copy, Check, RefreshCcw, ArrowLeft } from 'lucide-react';

gsap.registerPlugin(useGSAP);

function generate(count: number, opts: { uppercase: boolean; braces: boolean; hyphens: boolean }) {
  const list: string[] = [];
  for (let i = 0; i < count; i++) {
    let id = (crypto as any).randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    if (!opts.hyphens) id = id.replace(/-/g, '');
    if (opts.uppercase) id = id.toUpperCase();
    if (opts.braces) id = `{${id}}`;
    list.push(id);
  }
  return list;
}

export default function UuidGeneratorPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [braces, setBraces] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [regenerateKey, setRegenerateKey] = useState(0);
  const uuids = useMemo(() => generate(count, { uppercase, braces, hyphens }), [count, uppercase, braces, hyphens, regenerateKey]);
  const [copied, setCopied] = useState(false);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.options-bar', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo('.uuid-card', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05 }, '-=0.2');
  }, { scope: containerRef, dependencies: [regenerateKey] });

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const copySingle = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(245,158,11,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Link href="/tools/developer-utils" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#f59e0b] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Developer Utils
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <Key className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-gray-300">UUID Generator</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 metallic-text opacity-0">
            UUID Generator
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Generate multiple UUIDs with formatting options
          </p>
        </div>
      </section>

      {/* Options Bar */}
      <section className="pb-8 px-6">
        <div className="options-bar max-w-7xl mx-auto glass-card rounded-2xl p-5 flex items-center gap-4 flex-wrap opacity-0">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Count</label>
            <input 
              type="number" 
              className="w-24 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b]/50"
              value={count} 
              min={1} 
              max={1000} 
              onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value || '1'))))}
            />
          </div>
          
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={uppercase} 
              onChange={e => setUppercase(e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#f59e0b] focus:ring-[#f59e0b]/50"
            />
            Uppercase
          </label>
          
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={braces} 
              onChange={e => setBraces(e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#f59e0b] focus:ring-[#f59e0b]/50"
            />
            Curly Braces
          </label>
          
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={hyphens} 
              onChange={e => setHyphens(e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#f59e0b] focus:ring-[#f59e0b]/50"
            />
            Keep Hyphens
          </label>
          
          <button 
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2"
            onClick={() => setRegenerateKey(k => k + 1)}
          >
            <RefreshCcw className="w-4 h-4" />
            Regenerate
          </button>
          
          <button 
            className="px-6 py-2 bg-gradient-to-r from-[#f59e0b] to-[#ea580c] text-white font-semibold rounded-xl transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-[#f59e0b]/20"
            onClick={copyAll}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy All
          </button>
        </div>
      </section>

      {/* UUIDs Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uuids.map((id, idx) => (
            <div 
              key={idx} 
              className="uuid-card glass-card rounded-xl p-4 font-mono text-sm text-gray-300 break-all flex items-center justify-between gap-3 opacity-0 cursor-pointer hover:border-[#f59e0b]/50"
              onClick={() => copySingle(id)}
            >
              <span>{id}</span>
              <Copy className="w-4 h-4 text-gray-500 shrink-0" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
