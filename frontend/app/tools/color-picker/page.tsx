'use client';

import { useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Palette, Copy, Check, ArrowLeft } from 'lucide-react';

gsap.registerPlugin(useGSAP);

function hexToRgb(hex: string) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return { r, g, b };
}

export default function ColorPickerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState('#ec4899');
  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const [copied, setCopied] = useState<string>('');

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.color-panel', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.2');
  }, { scope: containerRef });

  const setFromRgb = (r: number, g: number, b: number) => setHex(rgbToHex(r, g, b));
  const setFromHsl = (h: number, s: number, l: number) => {
    const c = hslToRgb(h, s, l);
    setHex(rgbToHex(c.r, c.g, c.b));
  };

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(236,72,153,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(236,72,153,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Link href="/tools/developer-utils" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ec4899] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Developer Utils
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <Palette className="w-4 h-4 text-[#ec4899]" />
            <span className="text-gray-300">Color Picker</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 metallic-text opacity-0">
            Color Picker
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Pick colors and convert between HEX, RGB, and HSL
          </p>
        </div>
      </section>

      {/* Tool Section */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Preview Panel */}
          <div className="color-panel glass-card rounded-2xl p-6 opacity-0">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#ec4899]" />
              Color Preview
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <input 
                  type="color" 
                  value={hex} 
                  onChange={(e) => setHex(e.target.value)} 
                  className="w-20 h-20 rounded-xl cursor-pointer bg-transparent border-0"
                  style={{ WebkitAppearance: 'none' }}
                />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-2">Preview</div>
                <div 
                  className="w-full h-16 rounded-xl border border-white/10 shadow-lg"
                  style={{ background: hex }}
                />
              </div>
            </div>
          </div>

          {/* Color Values Panel */}
          <div className="space-y-4">
            {/* HEX */}
            <div className="color-panel glass-card rounded-2xl p-5 flex items-center gap-4 opacity-0">
              <div className="w-16 text-sm font-medium text-[#ec4899]">HEX</div>
              <input 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#ec4899]/50 focus:border-[#ec4899]/50 transition-all font-mono"
                value={hex} 
                onChange={(e) => setHex(e.target.value)} 
              />
              <button 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2"
                onClick={() => copy(hex, 'hex')}
              >
                {copied === 'hex' ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                Copy
              </button>
            </div>

            {/* RGB */}
            <div className="color-panel glass-card rounded-2xl p-5 opacity-0">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-16 text-sm font-medium text-[#00d4ff]">RGB</div>
                <div className="flex gap-2 flex-1">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">R</label>
                    <input 
                      type="number"
                      min="0"
                      max="255"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff]/50 transition-all font-mono text-center"
                      value={rgb.r} 
                      onChange={(e) => setFromRgb(parseInt(e.target.value || '0'), rgb.g, rgb.b)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">G</label>
                    <input 
                      type="number"
                      min="0"
                      max="255"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff]/50 transition-all font-mono text-center"
                      value={rgb.g} 
                      onChange={(e) => setFromRgb(rgb.r, parseInt(e.target.value || '0'), rgb.b)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">B</label>
                    <input 
                      type="number"
                      min="0"
                      max="255"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff]/50 transition-all font-mono text-center"
                      value={rgb.b} 
                      onChange={(e) => setFromRgb(rgb.r, rgb.g, parseInt(e.target.value || '0'))} 
                    />
                  </div>
                </div>
                <button 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2"
                  onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
                >
                  {copied === 'rgb' ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
            </div>

            {/* HSL */}
            <div className="color-panel glass-card rounded-2xl p-5 opacity-0">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-16 text-sm font-medium text-[#a855f7]">HSL</div>
                <div className="flex gap-2 flex-1">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">H</label>
                    <input 
                      type="number"
                      min="0"
                      max="360"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#a855f7]/50 focus:border-[#a855f7]/50 transition-all font-mono text-center"
                      value={hsl.h} 
                      onChange={(e) => setFromHsl(parseInt(e.target.value || '0'), hsl.s, hsl.l)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">S%</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#a855f7]/50 focus:border-[#a855f7]/50 transition-all font-mono text-center"
                      value={hsl.s} 
                      onChange={(e) => setFromHsl(hsl.h, parseInt(e.target.value || '0'), hsl.l)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">L%</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#a855f7]/50 focus:border-[#a855f7]/50 transition-all font-mono text-center"
                      value={hsl.l} 
                      onChange={(e) => setFromHsl(hsl.h, hsl.s, parseInt(e.target.value || '0'))} 
                    />
                  </div>
                </div>
                <button 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2"
                  onClick={() => copy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
                >
                  {copied === 'hsl' ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
