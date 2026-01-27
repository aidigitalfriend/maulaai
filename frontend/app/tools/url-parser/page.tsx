'use client';

import { useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link as LinkIcon, Copy, Check, ArrowLeft, Plus, X } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function UrlParserPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [urlStr, setUrlStr] = useState('https://example.com:8080/path/to/page?foo=1&bar=2#section');
  const [copied, setCopied] = useState(false);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.url-input', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo('.url-component', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.05 }, '-=0.2')
      .fromTo('.params-panel', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');
  }, { scope: containerRef });

  const url = useMemo(() => {
    try { return new URL(urlStr); } catch { return null; }
  }, [urlStr]);

  const entries = url ? Array.from(url.searchParams.entries()) : [];

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const updateParam = (k: string, v: string) => {
    if (!url) return;
    const u = new URL(url);
    u.searchParams.set(k, v);
    setUrlStr(u.toString());
  };

  const removeParam = (k: string) => {
    if (!url) return;
    const u = new URL(url);
    u.searchParams.delete(k);
    setUrlStr(u.toString());
  };

  const addParam = () => {
    const u = url ? new URL(url) : new URL('https://example.com');
    u.searchParams.append('param', 'value');
    setUrlStr(u.toString());
  };

  const components = url ? [
    { label: 'Protocol', value: url.protocol, color: '#f43f5e' },
    { label: 'Host', value: url.host, color: '#a855f7' },
    { label: 'Hostname', value: url.hostname, color: '#00d4ff' },
    { label: 'Port', value: url.port || '—', color: '#f59e0b' },
    { label: 'Pathname', value: url.pathname, color: '#00ff88' },
    { label: 'Hash', value: url.hash || '—', color: '#ec4899' },
  ] : [];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(244,63,94,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(244,63,94,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Link href="/tools/developer-utils" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#f43f5e] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Developer Utils
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <LinkIcon className="w-4 h-4 text-[#f43f5e]" />
            <span className="text-gray-300">URL Parser</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 metallic-text opacity-0">
            URL Parser
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Parse URLs, inspect components, and edit query parameters
          </p>
        </div>
      </section>

      {/* URL Input */}
      <section className="pb-8 px-6">
        <div className="url-input max-w-5xl mx-auto glass-card rounded-2xl p-6 opacity-0">
          <label className="text-sm text-gray-400 block mb-2">Enter URL</label>
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:ring-2 focus:ring-[#f43f5e]/50 focus:border-[#f43f5e]/50 transition-all"
            value={urlStr} 
            onChange={(e) => setUrlStr(e.target.value)} 
          />
          <div className="mt-4">
            <button 
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!url} 
              onClick={copy}
            >
              {copied ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
              Copy URL
            </button>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {!url ? (
            <div className="glass-card rounded-2xl p-6 border-red-500/30">
              <p className="text-red-400">Invalid URL. Please enter a valid URL.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* URL Components */}
              <div className="space-y-3">
                {components.map((comp, idx) => (
                  <div 
                    key={comp.label} 
                    className="url-component glass-card rounded-xl p-4 opacity-0"
                    style={{ borderColor: `${comp.color}30` }}
                  >
                    <div className="text-sm mb-1" style={{ color: comp.color }}>{comp.label}</div>
                    <div className="font-mono text-gray-300 break-all">{comp.value}</div>
                  </div>
                ))}
              </div>

              {/* Query Parameters */}
              <div className="params-panel glass-card rounded-2xl p-6 opacity-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Query Parameters</h2>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-[#f43f5e] to-[#ec4899] text-white font-semibold rounded-xl transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-[#f43f5e]/20"
                    onClick={addParam}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {!entries.length ? (
                  <div className="text-gray-500 text-sm">No query parameters</div>
                ) : (
                  <div className="space-y-3">
                    {entries.map(([k, v], i) => (
                      <div key={i} className="flex items-center gap-3">
                        <input 
                          className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-400 font-mono text-sm"
                          value={k} 
                          readOnly
                        />
                        <input 
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-[#f43f5e]/50 focus:border-[#f43f5e]/50 transition-all"
                          value={v} 
                          onChange={(e) => updateParam(k, e.target.value)}
                        />
                        <button 
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          onClick={() => removeParam(k)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
