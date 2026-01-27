'use client';

import { useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Code2, Copy, Check, ArrowLeft } from 'lucide-react';

gsap.registerPlugin(useGSAP);

function highlight(text: string, regex: RegExp) {
  if (!regex) return text;
  const g = regex.global ? regex : new RegExp(regex.source, regex.flags + 'g');
  let lastIndex = 0;
  const parts: JSX.Element[] = [];
  let m: RegExpExecArray | null;
  while ((m = g.exec(text))) {
    const index = m.index;
    const match = m[0];
    if (index > lastIndex) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex, index)}</span>);
    }
    parts.push(<mark key={index} className="bg-[#14b8a6]/30 text-[#14b8a6] rounded px-1">{match}</mark>);
    lastIndex = index + match.length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={lastIndex + ':end'}>{text.slice(lastIndex)}</span>);
  }
  return <>{parts}</>;
}

export default function RegexTesterPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pattern, setPattern] = useState('foo.*bar');
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false, u: true });
  const [text, setText] = useState('foo 123 bar\nFoo BAR baz\nfoobar');

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.pattern-bar', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo('.tool-panel', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.2');
  }, { scope: containerRef });

  const regex = useMemo(() => {
    try {
      return new RegExp(pattern, Object.entries(flags).filter(([k, v]) => v).map(([k]) => k).join(''));
    } catch {
      return null;
    }
  }, [pattern, flags]);

  const matches = useMemo(() => {
    if (!regex) return [] as RegExpMatchArray[];
    const g = regex.global ? regex : new RegExp(regex.source, regex.flags + 'g');
    const list: RegExpMatchArray[] = [];
    let m: RegExpExecArray | null;
    while ((m = g.exec(text))) {
      list.push(m as any);
    }
    return list;
  }, [regex, text]);

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(matches.map(m => m[0]).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const flagLabels: Record<string, string> = {
    g: 'Global',
    i: 'Case Insensitive',
    m: 'Multiline',
    s: 'Dot All',
    u: 'Unicode'
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(20,184,166,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(20,184,166,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Link href="/tools/developer-utils" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#14b8a6] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Developer Utils
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <Code2 className="w-4 h-4 text-[#14b8a6]" />
            <span className="text-gray-300">Regex Tester</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 metallic-text opacity-0">
            Regex Tester
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Test and debug regular expressions with live matches, groups, and replace preview
          </p>
        </div>
      </section>

      {/* Pattern Bar */}
      <section className="pb-6 px-6">
        <div className="pattern-bar max-w-7xl mx-auto glass-card rounded-2xl p-5 opacity-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <label className="text-sm text-gray-400 block mb-2">Pattern</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:ring-2 focus:ring-[#14b8a6]/50 focus:border-[#14b8a6]/50 transition-all"
                value={pattern} 
                onChange={(e) => setPattern(e.target.value)} 
                placeholder="Pattern e.g. foo(.*)bar"
              />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {(['g', 'i', 'm', 's', 'u'] as const).map(f => (
                <label key={f} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={(flags as any)[f]} 
                    onChange={(e) => setFlags({ ...flags, [f]: e.target.checked })}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#14b8a6] focus:ring-[#14b8a6]/50"
                  />
                  <span title={flagLabels[f]}>{f.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Text Panel */}
          <div className="tool-panel glass-card rounded-2xl p-6 opacity-0">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#14b8a6]" />
              Test Text
            </h2>
            <textarea 
              className="w-full h-72 font-mono text-sm bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#14b8a6]/50 focus:border-[#14b8a6]/50 transition-all resize-none"
              value={text} 
              onChange={(e) => setText(e.target.value)} 
            />
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            {/* Matches */}
            <div className="tool-panel glass-card rounded-2xl p-6 opacity-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Matches 
                  <span className="ml-2 px-2 py-1 bg-[#14b8a6]/20 text-[#14b8a6] text-sm rounded-lg">{matches.length}</span>
                </h2>
                <button 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!matches.length} 
                  onClick={copy}
                >
                  {copied ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
              <pre className="whitespace-pre-wrap break-words bg-white/5 rounded-xl p-4 text-gray-300 font-mono text-sm max-h-40 overflow-auto border border-white/10">
                {regex ? highlight(text, regex) : text}
              </pre>
            </div>

            {/* Groups */}
            <div className="tool-panel glass-card rounded-2xl p-6 opacity-0">
              <h2 className="text-lg font-semibold text-white mb-4">Capture Groups</h2>
              {!matches.length ? (
                <div className="text-gray-500 text-sm">No groups found</div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-auto">
                  {matches.map((m, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm">
                      <div className="text-xs text-gray-500 mb-2">Match {idx + 1}</div>
                      {Array.from(m).map((g, i) => (
                        <div key={i} className="flex gap-2 text-gray-300">
                          <span className="text-[#14b8a6]">${'{' + i + '}'}</span>
                          <span className="text-gray-500">:</span>
                          <span>{g ?? '—'}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
