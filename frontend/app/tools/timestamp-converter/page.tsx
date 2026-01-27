'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock, Copy, Check, RefreshCw, ArrowLeft } from 'lucide-react';

gsap.registerPlugin(useGSAP);

function toEpochMs(date: Date) { return date.getTime(); }
function fromEpoch(input: number) { return new Date(input); }

const timeZones = typeof (Intl as any).supportedValuesOf === 'function' 
  ? (Intl as any).supportedValuesOf('timeZone') as string[] 
  : ['UTC'];

export default function TimestampConverterPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [epoch, setEpoch] = useState<string>('');
  const [human, setHuman] = useState<string>('');
  const [tz, setTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [copied, setCopied] = useState('');

  const now = new Date();

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.options-bar', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo('.tool-panel', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.2');
  }, { scope: containerRef });

  const format = (d: Date) => new Intl.DateTimeFormat('en-US', { 
    dateStyle: 'full', 
    timeStyle: 'long', 
    timeZone: tz 
  }).format(d);

  useEffect(() => {
    if (epoch.trim() === '') { setHuman(''); return; }
    const n = Number(epoch);
    const ms = String(n).length <= 10 ? n * 1000 : n;
    const d = fromEpoch(ms);
    setHuman(format(d));
  }, [epoch, tz]);

  useEffect(() => {
    if (!human.trim()) return;
    const d = new Date(human);
    if (!isNaN(d.getTime())) {
      setEpoch(String(toEpochMs(d)));
    }
  }, [human]);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  const getRelativeTime = () => {
    if (!epoch) return '';
    const diff = (Number(epoch) - Date.now()) / 1000;
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    
    if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
    if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86400), 'day');
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(251,191,36,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Link href="/tools/developer-utils" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#fbbf24] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Developer Utils
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <Clock className="w-4 h-4 text-[#fbbf24]" />
            <span className="text-gray-300">Timestamp</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 metallic-text opacity-0">
            Timestamp Converter
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Convert between Unix epoch (seconds/ms) and human-readable dates with time zones
          </p>
        </div>
      </section>

      {/* Options Bar */}
      <section className="pb-6 px-6">
        <div className="options-bar max-w-5xl mx-auto glass-card rounded-2xl p-5 flex items-center gap-4 flex-wrap opacity-0">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#fbbf24]" />
            <span className="text-sm text-gray-400">Time Zone</span>
          </div>
          <select 
            className="min-w-52 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#fbbf24]/50 focus:border-[#fbbf24]/50"
            value={tz} 
            onChange={(e) => setTz(e.target.value)}
          >
            {timeZones.map(z => <option key={z} value={z} className="bg-[#1a1a2e]">{z}</option>)}
          </select>
          <button 
            className="px-5 py-3 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-black font-semibold rounded-xl transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-[#fbbf24]/20"
            onClick={() => { setEpoch(String(Date.now())); setHuman(format(new Date())); }}
          >
            <RefreshCw className="w-4 h-4" />
            Now
          </button>
        </div>
      </section>

      {/* Tool Section */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Epoch Panel */}
          <div className="tool-panel glass-card rounded-2xl p-6 opacity-0">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#fbbf24]" />
              Epoch (seconds or milliseconds)
            </h2>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#fbbf24]/50 focus:border-[#fbbf24]/50 transition-all font-mono"
              value={epoch} 
              onChange={(e) => setEpoch(e.target.value)} 
              placeholder="e.g., 1730790780 or 1730790780123"
            />
            {epoch && (
              <button 
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2"
                onClick={() => copy(epoch, 'epoch')}
              >
                {copied === 'epoch' ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                Copy Epoch
              </button>
            )}
          </div>

          {/* Human Date Panel */}
          <div className="tool-panel glass-card rounded-2xl p-6 opacity-0 lg:sticky lg:top-6 lg:h-fit">
            <h2 className="text-lg font-semibold text-white mb-4">Human Date</h2>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#fbbf24]/50 focus:border-[#fbbf24]/50 transition-all"
              value={human} 
              onChange={(e) => setHuman(e.target.value)} 
              placeholder={format(now)} 
            />
            {human && (
              <button 
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2"
                onClick={() => copy(human, 'human')}
              >
                {copied === 'human' ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                Copy Date
              </button>
            )}
            {epoch && (
              <div className="mt-5 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Relative Time</div>
                <div className="text-lg font-semibold text-[#fbbf24]">{getRelativeTime()}</div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
