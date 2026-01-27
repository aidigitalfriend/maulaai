'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Hash, Copy, Check, Upload, ArrowLeft, Shield } from 'lucide-react';

gsap.registerPlugin(useGSAP);

async function subtleHash(alg: 'SHA-1' | 'SHA-256' | 'SHA-512', data: ArrayBuffer) {
  const digest = await crypto.subtle.digest(alg, data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

function textToArrayBuffer(text: string) {
  return new TextEncoder().encode(text).buffer;
}

export default function HashGeneratorPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [key, setKey] = useState('');
  const [copiedField, setCopiedField] = useState<string>('');
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.tool-panel', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.2')
      .fromTo('.hash-result', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08 }, '-=0.3');
  }, { scope: containerRef });

  const sourceChanged = useMemo(() => ({ text, file, key }), [text, file, key]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const buf = file ? await file.arrayBuffer() : textToArrayBuffer(text);
        const sha1 = await subtleHash('SHA-1', buf);
        const sha256 = await subtleHash('SHA-256', buf);
        const sha512 = await subtleHash('SHA-512', buf);
        const res = await fetch('/api/tools/hash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: Array.from(new Uint8Array(buf)), key })
        });
        const j = await res.json();
        setResults({
          MD5: j.md5,
          'SHA-1': sha1,
          'SHA-256': sha256,
          'SHA-512': sha512,
          ...(j.hmac ? { 'HMAC-SHA256': j.hmac } : {})
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [sourceChanged]);

  const copy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(''), 1200);
  };

  const hashColors: Record<string, string> = {
    'MD5': '#00d4ff',
    'SHA-1': '#a855f7',
    'SHA-256': '#00ff88',
    'SHA-512': '#f59e0b',
    'HMAC-SHA256': '#ec4899'
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,255,136,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,255,136,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Link href="/tools/developer-utils" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00ff88] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Developer Utils
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <Hash className="w-4 h-4 text-[#00ff88]" />
            <span className="text-gray-300">Hash Generator</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 metallic-text opacity-0">
            Hash Generator
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Generate MD5, SHA-1, SHA-256, SHA-512 and optional HMAC (SHA-256)
          </p>
        </div>
      </section>

      {/* Tool Section */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="tool-panel glass-card rounded-2xl p-6 opacity-0 lg:col-span-1">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00ff88]" />
              Input
            </h2>
            <textarea 
              className="w-full h-40 font-mono text-sm bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#00ff88]/50 transition-all resize-none"
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="Type or paste text"
            />
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <label className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose File
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
              {file && (
                <span className="text-gray-400 text-sm">{file.name} ({Math.round(file.size / 1024)} KB)</span>
              )}
            </div>
            <div className="mt-5">
              <label className="text-sm text-gray-400 block mb-2">HMAC Key (optional)</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#00ff88]/50 transition-all"
                value={key} 
                onChange={(e) => setKey(e.target.value)} 
                placeholder="Enter key for HMAC (SHA-256)"
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-4">
            {['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'HMAC-SHA256'].map(lbl => (
              <div 
                key={lbl} 
                className="hash-result glass-card rounded-2xl p-5 flex items-center justify-between gap-4 opacity-0"
                style={{ borderColor: `${hashColors[lbl]}20` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium mb-2" style={{ color: hashColors[lbl] }}>{lbl}</div>
                  <div className="font-mono text-gray-300 text-sm break-all">
                    {results[lbl] || (loading ? 'Calculating…' : '—')}
                  </div>
                </div>
                <button 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  disabled={!results[lbl]} 
                  onClick={() => copy(lbl, results[lbl])}
                >
                  {copiedField === lbl ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
