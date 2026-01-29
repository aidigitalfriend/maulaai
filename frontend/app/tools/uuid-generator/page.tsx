'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Key, ArrowLeft, Copy, Check, RefreshCw, Sparkles, Plus, Trash2 } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, TextPlugin, CustomWiggle, CustomEase } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, CustomWiggle, CustomEase);

type UUIDVersion = 'v4' | 'v1-like';

interface GeneratedUUID {
  id: string;
  uuid: string;
  version: UUIDVersion;
  timestamp: Date;
}

export default function UuidGeneratorPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [uuids, setUuids] = useState<GeneratedUUID[]>([]);
  const [version, setVersion] = useState<UUIDVersion>('v4');
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      CustomWiggle.create('uuidWiggle', { wiggles: 6, type: 'easeOut' });

      // Background orbs
      gsap.to('.uuid-gradient-orb', {
        x: 'random(-60, 60)',
        y: 'random(-30, 30)',
        scale: 'random(0.9, 1.1)',
        duration: 5,
        ease: 'sine.inOut',
        stagger: { each: 0.8, repeat: -1, yoyo: true },
      });

      // Floating symbols
      const symbols = document.querySelectorAll('.floating-uuid-symbol');
      symbols.forEach((el, i) => {
        gsap.to(el, {
          y: -20 - i * 5,
          rotation: i % 2 === 0 ? 10 : -10,
          duration: 3 + i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Title
      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: 'chars' });
        gsap.from(split.chars, {
          opacity: 0,
          y: 50,
          rotationX: -90,
          stagger: 0.03,
          duration: 0.6,
          ease: 'back.out(1.7)',
          delay: 0.2,
        });
      }

      // Hero icon
      gsap.to('.hero-uuid-icon', {
        boxShadow: '0 0 50px rgba(249, 115, 22, 0.5)',
        scale: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Panels
      gsap.from('.uuid-panel', {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.6,
        delay: 0.5,
        ease: 'power3.out',
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Generate UUID v4
  const generateUUIDv4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Generate UUID v1-like (time-based simulation)
  const generateUUIDv1Like = (): string => {
    const now = Date.now();
    const timeHex = now.toString(16).padStart(12, '0');
    const randomPart = Array.from({ length: 20 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const uuid = `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-1${randomPart.slice(0, 3)}-${randomPart.slice(3, 7)}-${randomPart.slice(7, 19)}`;
    return uuid;
  };

  const formatUUID = (uuid: string): string => {
    let formatted = uuid;
    if (!hyphens) {
      formatted = formatted.replace(/-/g, '');
    }
    if (uppercase) {
      formatted = formatted.toUpperCase();
    }
    return formatted;
  };

  const generate = () => {
    const newUUIDs: GeneratedUUID[] = [];
    
    for (let i = 0; i < count; i++) {
      const raw = version === 'v4' ? generateUUIDv4() : generateUUIDv1Like();
      newUUIDs.push({
        id: `${Date.now()}-${i}`,
        uuid: formatUUID(raw),
        version,
        timestamp: new Date(),
      });
    }

    setUuids([...newUUIDs, ...uuids]);

    // Animate new UUIDs
    setTimeout(() => {
      gsap.from('.uuid-item:first-child', {
        opacity: 0,
        x: -30,
        scale: 0.95,
        duration: 0.4,
        ease: 'back.out(1.7)',
      });
    }, 50);

    // Button animation
    const btn = document.querySelector('.generate-btn');
    if (btn) {
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.1,
        onComplete: () => gsap.to(btn, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.3)' }),
      });
    }
  };

  const copyUUID = async (uuid: string, id: string) => {
    await navigator.clipboard.writeText(uuid);
    setCopiedId(id);

    // Animation
    const btn = document.querySelector(`[data-copy-id="${id}"]`);
    if (btn) {
      gsap.to(btn, {
        scale: 1.2,
        duration: 0.2,
        ease: 'back.out(1.7)',
        onComplete: () => gsap.to(btn, { scale: 1, duration: 0.2 }),
      });
    }

    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAll = async () => {
    const allUUIDs = uuids.map(u => u.uuid).join('\n');
    await navigator.clipboard.writeText(allUUIDs);
    
    // Animation
    gsap.to('.copy-all-btn', {
      scale: 1.1,
      duration: 0.2,
      ease: 'back.out(1.7)',
      onComplete: () => gsap.to('.copy-all-btn', { scale: 1, duration: 0.2 }),
    });
  };

  const removeUUID = (id: string) => {
    const el = document.querySelector(`[data-uuid-id="${id}"]`);
    if (el) {
      gsap.to(el, {
        opacity: 0,
        x: 30,
        height: 0,
        marginBottom: 0,
        padding: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setUuids(uuids.filter(u => u.id !== id)),
      });
    } else {
      setUuids(uuids.filter(u => u.id !== id));
    }
  };

  const clearAll = () => {
    gsap.to('.uuid-item', {
      opacity: 0,
      x: 30,
      stagger: 0.05,
      duration: 0.2,
      onComplete: () => setUuids([]),
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="uuid-gradient-orb absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-orange-600/20 to-red-600/20 blur-[100px]" />
        <div className="uuid-gradient-orb absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-amber-600/15 to-yellow-600/15 blur-[80px]" />
      </div>

      {/* Floating Symbols */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {['uuid', 'v4', 'guid', 'xxxx', '4xxx', 'yxxx'].map((sym, i) => (
          <div
            key={i}
            className="floating-uuid-symbol absolute text-lg font-mono text-white/10"
            style={{ left: `${8 + i * 15}%`, top: `${15 + (i % 3) * 28}%` }}
          >
            {sym}
          </div>
        ))}
      </div>

      {/* Hero */}
      <section className="relative py-12 border-b border-white/10">
        <div className="container mx-auto px-4">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tools
          </Link>

          <div className="flex items-center gap-6">
            <div className="hero-uuid-icon w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600/30 to-red-600/30 border border-orange-500/30 flex items-center justify-center">
              <Key className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 ref={titleRef} className="text-3xl md:text-4xl font-bold text-white mb-1">
                UUID Generator
              </h1>
              <p className="text-gray-400">
                Generate unique identifiers (UUID/GUID) in various formats
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="uuid-panel bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Version */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Version</label>
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value as UUIDVersion)}
                className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-xl text-white focus:border-orange-500/50 outline-none"
              >
                <option value="v4">UUID v4 (Random)</option>
                <option value="v1-like">UUID v1-like (Time-based)</option>
              </select>
            </div>

            {/* Count */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Count</label>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-xl text-white focus:border-orange-500/50 outline-none"
              />
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Format</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => setUppercase(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/20"
                  />
                  <span className="text-gray-300 text-sm">Uppercase</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hyphens}
                    onChange={(e) => setHyphens(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/20"
                  />
                  <span className="text-gray-300 text-sm">Hyphens</span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={generate}
                className="generate-btn w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {uuids.length > 0 && (
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={copyAll}
                className="copy-all-btn px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy All ({uuids.length})
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Generated UUIDs */}
        <div className="space-y-3">
          {uuids.length === 0 ? (
            <div className="uuid-panel bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
              <Key className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No UUIDs Generated Yet</h3>
              <p className="text-gray-500 text-sm">Click the Generate button to create unique identifiers</p>
            </div>
          ) : (
            uuids.map((item) => (
              <div
                key={item.id}
                data-uuid-id={item.id}
                className="uuid-item uuid-panel bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-orange-500/30 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <code className="text-gray-300 font-mono text-sm md:text-base break-all">
                    {item.uuid}
                  </code>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="hidden md:block px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-orange-400 text-xs font-medium">
                    {item.version}
                  </span>
                  <button
                    data-copy-id={item.id}
                    onClick={() => copyUUID(item.uuid, item.id)}
                    className="p-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeUUID(item.id)}
                    className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-3">About UUIDs</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <p className="font-medium text-white mb-1">UUID v4 (Random)</p>
              <p>Generated using random numbers. Most common type, 122 bits of randomness.</p>
            </div>
            <div>
              <p className="font-medium text-white mb-1">UUID v1 (Time-based)</p>
              <p>Based on timestamp and MAC address. Useful when ordering matters.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
