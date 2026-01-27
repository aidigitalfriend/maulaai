'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Binary, Copy, Check, Upload, Download, RefreshCw, ArrowLeft } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function Base64ToolPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [urlSafe, setUrlSafe] = useState(false);
  const [noPadding, setNoPadding] = useState(false);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.options-bar', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo('.tool-panel', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.2');
  }, { scope: containerRef });

  const process = (value: string) => {
    try {
      if (mode === 'encode') {
        let b64 = btoa(unescape(encodeURIComponent(value)));
        if (urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_');
        if (noPadding) b64 = b64.replace(/=+$/, '');
        setOutput(b64);
      } else {
        let v = value;
        if (urlSafe) v = v.replace(/\-/g, '+').replace(/_/g, '/');
        if (!noPadding) {
          const pad = v.length % 4;
          if (pad) v = v + '='.repeat(4 - pad);
        }
        const text = decodeURIComponent(escape(atob(v)));
        setOutput(text);
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    }
  };

  const onFile = async (f: File) => {
    const buf = await f.arrayBuffer();
    if (mode === 'encode') {
      const bytes = new Uint8Array(buf);
      let s = '';
      bytes.forEach(b => s += String.fromCharCode(b));
      process(s);
    } else {
      process(input);
      const bstr = atob(output);
      const bytes = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) bytes[i] = bstr.charCodeAt(i);
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded.bin';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(168,85,247,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Link href="/tools/developer-utils" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#a855f7] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Developer Utils
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <Binary className="w-4 h-4 text-[#a855f7]" />
            <span className="text-gray-300">Base64</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 metallic-text opacity-0">
            Base64 Encoder / Decoder
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Convert text and files to and from Base64 with URL-safe and padding options
          </p>
        </div>
      </section>

      {/* Options Bar */}
      <section className="pb-6 px-6">
        <div className="options-bar max-w-7xl mx-auto glass-card rounded-2xl p-5 flex items-center gap-4 flex-wrap opacity-0">
          <select 
            className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#a855f7]/50 focus:border-[#a855f7]/50"
            value={mode} 
            onChange={(e) => { setMode(e.target.value as any); setOutput(''); }}
          >
            <option value="encode" className="bg-[#1a1a2e]">Encode</option>
            <option value="decode" className="bg-[#1a1a2e]">Decode</option>
          </select>
          
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={urlSafe} 
              onChange={e => { setUrlSafe(e.target.checked); process(input); }}
              className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#a855f7] focus:ring-[#a855f7]/50"
            />
            URL Safe
          </label>
          
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={noPadding} 
              onChange={e => { setNoPadding(e.target.checked); process(input); }}
              className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#a855f7] focus:ring-[#a855f7]/50"
            />
            No Padding
          </label>
          
          <button 
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2"
            onClick={() => { setInput(''); setOutput(''); }}
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          
          <label className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Choose File
            <input type="file" className="hidden" onChange={(e) => e.target.files && onFile(e.target.files[0])} />
          </label>
        </div>
      </section>

      {/* Tool Section */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="tool-panel glass-card rounded-2xl p-6 opacity-0">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Binary className="w-5 h-5 text-[#a855f7]" />
              Input
            </h2>
            <textarea 
              className="w-full h-72 font-mono text-sm bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#a855f7]/50 focus:border-[#a855f7]/50 transition-all resize-none"
              value={input} 
              onChange={(e) => { setInput(e.target.value); process(e.target.value); }}
              placeholder={mode === 'encode' ? 'Type or paste text to encode' : 'Paste Base64 to decode'}
            />
          </div>

          {/* Output Panel */}
          <div className="tool-panel glass-card rounded-2xl p-6 opacity-0 lg:sticky lg:top-6 lg:h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Output</h2>
              <button 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!output} 
                onClick={copy}
              >
                {copied ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                Copy
              </button>
            </div>
            <textarea 
              className="w-full h-72 font-mono text-sm bg-white/5 border border-white/10 rounded-xl p-4 text-gray-300 resize-none"
              value={output} 
              readOnly
            />
            {mode === 'decode' && output && !output.startsWith('Error:') && (
              <button 
                className="mt-4 px-6 py-3 bg-gradient-to-r from-[#a855f7] to-[#00d4ff] text-white font-semibold rounded-xl transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-[#a855f7]/20"
                onClick={() => onFile(new File([], 'decoded.bin'))}
              >
                <Download className="w-5 h-5" />
                Download Decoded
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
