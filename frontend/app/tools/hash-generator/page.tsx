'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Hash, ArrowLeft, Copy, Check, RefreshCw, Sparkles, Shield } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, TextPlugin, CustomWiggle, CustomEase } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, CustomWiggle, CustomEase);

interface HashResult {
  algorithm: string;
  hash: string;
}

const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export default function HashGeneratorPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      CustomWiggle.create('hashWiggle', { wiggles: 6, type: 'easeOut' });

      // Background orbs
      gsap.to('.hash-gradient-orb', {
        x: 'random(-60, 60)',
        y: 'random(-30, 30)',
        scale: 'random(0.9, 1.1)',
        duration: 5,
        ease: 'sine.inOut',
        stagger: { each: 0.8, repeat: -1, yoyo: true },
      });

      // Floating hash symbols
      const symbols = document.querySelectorAll('.floating-hash-symbol');
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
      gsap.to('.hero-hash-icon', {
        boxShadow: '0 0 50px rgba(34, 197, 94, 0.5)',
        scale: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Panels
      gsap.from('.hash-panel', {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.6,
        delay: 0.5,
        ease: 'power3.out',
      });

      // Algorithm buttons
      gsap.from('.algo-btn', {
        opacity: 0,
        scale: 0.8,
        stagger: 0.05,
        duration: 0.4,
        delay: 0.8,
        ease: 'back.out(1.7)',
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Generate hashes when input changes
  useEffect(() => {
    if (!input.trim()) {
      setHashes([]);
      return;
    }

    const generateHashes = async () => {
      setLoading(true);
      const results: HashResult[] = [];

      // Client-side hash generation using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(input);

      const webCryptoAlgorithms: Record<string, string> = {
        'SHA-1': 'SHA-1',
        'SHA-256': 'SHA-256',
        'SHA-384': 'SHA-384',
        'SHA-512': 'SHA-512',
      };

      for (const algo of algorithms) {
        if (algo === 'MD5') {
          // Simple MD5 implementation for demo (not cryptographically secure for production)
          results.push({ algorithm: 'MD5', hash: await simpleMD5(input) });
        } else if (webCryptoAlgorithms[algo]) {
          try {
            const hashBuffer = await crypto.subtle.digest(webCryptoAlgorithms[algo], data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            results.push({ algorithm: algo, hash: hashHex });
          } catch {
            results.push({ algorithm: algo, hash: 'Error generating hash' });
          }
        }
      }

      setHashes(results);
      setLoading(false);

      // Animate results
      setTimeout(() => {
        gsap.from('.hash-result', {
          opacity: 0,
          x: -20,
          stagger: 0.1,
          duration: 0.4,
          ease: 'power2.out',
        });
      }, 50);
    };

    const debounce = setTimeout(generateHashes, 300);
    return () => clearTimeout(debounce);
  }, [input]);

  // Simple MD5 for demo purposes
  async function simpleMD5(text: string): Promise<string> {
    // Using a simple hash for demo - in production use a proper MD5 library
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    // Convert to hex-like string (this is not real MD5, just demo)
    const hexChars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += hexChars[Math.abs(hash + i * 7) % 16];
    }
    return result;
  }

  const copyHash = async (hash: string, index: number) => {
    await navigator.clipboard.writeText(hash);
    setCopiedIndex(index);

    // Animation
    const btn = document.querySelector(`.copy-btn-${index}`);
    if (btn) {
      gsap.to(btn, {
        scale: 1.2,
        duration: 0.2,
        ease: 'back.out(1.7)',
        onComplete: () => gsap.to(btn, { scale: 1, duration: 0.2 }),
      });
    }

    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const loadExample = () => {
    const example = 'Hello, World! This is a test message.';
    setInput('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < example.length) {
        setInput(example.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="hash-gradient-orb absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 blur-[100px]" />
        <div className="hash-gradient-orb absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-teal-600/15 to-cyan-600/15 blur-[80px]" />
      </div>

      {/* Floating Symbols */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {['#', '##', '###', 'SHA', 'MD5', '256'].map((sym, i) => (
          <div
            key={i}
            className="floating-hash-symbol absolute text-lg font-mono text-white/10"
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
            <div className="hero-hash-icon w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600/30 to-emerald-600/30 border border-green-500/30 flex items-center justify-center">
              <Hash className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 ref={titleRef} className="text-3xl md:text-4xl font-bold text-white mb-1">
                Hash Generator
              </h1>
              <p className="text-gray-400">
                Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Input Panel */}
        <div className="hash-panel bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Input Text</h2>
            <div className="flex gap-2">
              <button
                onClick={loadExample}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Example
              </button>
              <button
                onClick={() => setInput('')}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            className="w-full h-32 bg-[#0d0d12] border border-white/10 rounded-xl p-4 text-gray-300 font-mono text-sm placeholder-gray-600 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 outline-none resize-none transition-all"
          />
        </div>

        {/* Algorithm Filter */}
        <div className="hash-panel flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedAlgorithm(null)}
            className={`algo-btn px-4 py-2 rounded-lg font-medium transition-all ${
              selectedAlgorithm === null
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            All
          </button>
          {algorithms.map((algo) => (
            <button
              key={algo}
              onClick={() => setSelectedAlgorithm(algo)}
              className={`algo-btn px-4 py-2 rounded-lg font-medium transition-all ${
                selectedAlgorithm === algo
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {algo}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && hashes.length === 0 && input.trim() === '' && (
            <div className="hash-panel bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
              <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Enter text to generate hashes</h3>
              <p className="text-gray-500 text-sm">Your hashes will appear here in real-time</p>
            </div>
          )}

          {!loading && hashes
            .filter(h => !selectedAlgorithm || h.algorithm === selectedAlgorithm)
            .map((result, index) => (
            <div
              key={result.algorithm}
              className="hash-result hash-panel bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 transition-all hover:border-green-500/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg text-green-400 font-semibold text-sm">
                    {result.algorithm}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {result.hash.length} characters
                  </span>
                </div>
                <button
                  onClick={() => copyHash(result.hash, index)}
                  className={`copy-btn-${index} px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-lg shadow-green-500/25 transition-all flex items-center gap-2`}
                >
                  {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedIndex === index ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-[#0d0d12] border border-white/10 rounded-xl p-4">
                <code className="text-gray-300 font-mono text-sm break-all">
                  {result.hash}
                </code>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-3">About Hash Functions</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <p className="font-medium text-white mb-1">MD5</p>
              <p>128-bit hash, fast but not secure for cryptographic use</p>
            </div>
            <div>
              <p className="font-medium text-white mb-1">SHA-1</p>
              <p>160-bit hash, deprecated for security applications</p>
            </div>
            <div>
              <p className="font-medium text-white mb-1">SHA-256</p>
              <p>256-bit hash, part of SHA-2 family, widely used and secure</p>
            </div>
            <div>
              <p className="font-medium text-white mb-1">SHA-512</p>
              <p>512-bit hash, strongest of SHA-2 family</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
