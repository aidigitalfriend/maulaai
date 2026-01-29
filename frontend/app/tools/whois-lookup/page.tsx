'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Loader2, Copy, Check, Globe, User, Calendar, Server, Mail, Shield, Building } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, TextPlugin, CustomWiggle, CustomEase } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, CustomWiggle, CustomEase);

interface WhoisResult {
  domain: string;
  registrar: {
    name: string;
    url: string;
    whoisServer: string;
    abuseContact: string;
  };
  dates: {
    created: string;
    updated: string;
    expires: string;
  };
  registrant: {
    name: string;
    organization: string;
    email: string;
    country: string;
    state: string;
    city: string;
  };
  admin: {
    name: string;
    email: string;
  };
  tech: {
    name: string;
    email: string;
  };
  nameservers: string[];
  status: string[];
  dnssec: boolean;
  rawData: string;
}

export default function WhoisLookupPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WhoisResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      CustomWiggle.create('whoisWiggle', { wiggles: 5, type: 'easeOut' });

      gsap.to('.whois-gradient-orb', {
        x: 'random(-60, 60)',
        y: 'random(-30, 30)',
        scale: 'random(0.9, 1.15)',
        duration: 6,
        ease: 'sine.inOut',
        stagger: { each: 0.8, repeat: -1, yoyo: true },
      });

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

      gsap.to('.hero-whois-icon', {
        boxShadow: '0 0 50px rgba(34, 197, 94, 0.5)',
        scale: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.from('.search-form', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: 0.5,
        ease: 'power3.out',
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    const btn = document.querySelector('.lookup-btn');
    if (btn) {
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.1,
        onComplete: () => gsap.to(btn, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.3)' }),
      });
    }

    setLoading(true);
    setError('');
    setData(null);
    setShowRaw(false);

    try {
      const response = await fetch('/api/tools/whois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setTimeout(() => {
          gsap.from('.whois-card', {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.5,
            ease: 'power2.out',
          });
        }, 50);
      } else {
        setError(result.error || 'WHOIS lookup failed');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const copyValue = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="whois-gradient-orb absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 blur-[100px]" />
        <div className="whois-gradient-orb absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-teal-600/15 to-cyan-600/15 blur-[80px]" />
      </div>

      <section className="relative py-12 border-b border-white/10">
        <div className="container mx-auto px-4">
          <Link href="/tools" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tools
          </Link>

          <div className="flex items-center gap-6 mb-8">
            <div className="hero-whois-icon w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600/30 to-emerald-600/30 border border-green-500/30 flex items-center justify-center">
              <Search className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 ref={titleRef} className="text-3xl md:text-4xl font-bold text-white mb-1">
                WHOIS Lookup
              </h1>
              <p className="text-gray-400">
                Get domain registration and ownership information
              </p>
            </div>
          </div>

          <form onSubmit={handleLookup} className="search-form max-w-3xl">
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-2 flex gap-2">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter domain (e.g., example.com)"
                  className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-gray-500 outline-none"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !domain.trim()}
                className="lookup-btn px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {loading ? 'Looking up...' : 'Lookup'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="max-w-3xl mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <Search className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="whois-card bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{data.domain}</h2>
                  <p className="text-gray-400 mt-1">Registrar: {data.registrar.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  {data.dnssec && (
                    <span className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-1">
                      <Shield className="w-4 h-4" /> DNSSEC
                    </span>
                  )}
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm transition-colors"
                  >
                    {showRaw ? 'Hide Raw' : 'Show Raw'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="whois-card bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Created</span>
                </div>
                <p className="text-white font-medium">{new Date(data.dates.created).toLocaleDateString()}</p>
              </div>
              <div className="whois-card bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Expires</span>
                </div>
                <p className="text-white font-medium">{new Date(data.dates.expires).toLocaleDateString()}</p>
              </div>
              <div className="whois-card bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Updated</span>
                </div>
                <p className="text-white font-medium">{new Date(data.dates.updated).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="whois-card bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Registrant</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {data.registrant.name && (
                    <div className="p-3 bg-[#0d0d12] rounded-lg">
                      <p className="text-gray-400 mb-1">Name</p>
                      <p className="text-white">{data.registrant.name}</p>
                    </div>
                  )}
                  {data.registrant.organization && (
                    <div className="p-3 bg-[#0d0d12] rounded-lg">
                      <p className="text-gray-400 mb-1">Organization</p>
                      <p className="text-white">{data.registrant.organization}</p>
                    </div>
                  )}
                  {data.registrant.email && (
                    <div className="p-3 bg-[#0d0d12] rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 mb-1">Email</p>
                        <p className="text-white">{data.registrant.email}</p>
                      </div>
                      <button onClick={() => copyValue(data.registrant.email, 'email')} className="text-gray-400 hover:text-white">
                        {copied === 'email' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                  {data.registrant.country && (
                    <div className="p-3 bg-[#0d0d12] rounded-lg">
                      <p className="text-gray-400 mb-1">Location</p>
                      <p className="text-white">
                        {[data.registrant.city, data.registrant.state, data.registrant.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="whois-card bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Registrar Info</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-[#0d0d12] rounded-lg">
                    <p className="text-gray-400 mb-1">Name</p>
                    <p className="text-white">{data.registrar.name}</p>
                  </div>
                  {data.registrar.url && (
                    <div className="p-3 bg-[#0d0d12] rounded-lg">
                      <p className="text-gray-400 mb-1">URL</p>
                      <a href={data.registrar.url} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                        {data.registrar.url}
                      </a>
                    </div>
                  )}
                  {data.registrar.whoisServer && (
                    <div className="p-3 bg-[#0d0d12] rounded-lg">
                      <p className="text-gray-400 mb-1">WHOIS Server</p>
                      <p className="text-white font-mono text-xs">{data.registrar.whoisServer}</p>
                    </div>
                  )}
                  {data.registrar.abuseContact && (
                    <div className="p-3 bg-[#0d0d12] rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 mb-1">Abuse Contact</p>
                        <p className="text-white text-xs">{data.registrar.abuseContact}</p>
                      </div>
                      <button onClick={() => copyValue(data.registrar.abuseContact, 'abuse')} className="text-gray-400 hover:text-white">
                        {copied === 'abuse' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="whois-card bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">Nameservers</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.nameservers.map((ns, idx) => (
                  <span key={idx} className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 font-mono text-sm">
                    {ns}
                  </span>
                ))}
              </div>
            </div>

            {data.status && data.status.length > 0 && (
              <div className="whois-card bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4">Domain Status</h3>
                <div className="flex flex-wrap gap-2">
                  {data.status.map((status, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 text-xs">
                      {status}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {showRaw && data.rawData && (
              <div className="whois-card bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Raw WHOIS Data</h3>
                  <button
                    onClick={() => copyValue(data.rawData, 'raw')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm transition-colors"
                  >
                    {copied === 'raw' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    Copy
                  </button>
                </div>
                <pre className="p-4 bg-[#0d0d12] rounded-xl text-gray-300 text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {data.rawData}
                </pre>
              </div>
            )}
          </div>
        )}

        {!loading && !error && !data && (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-400 mb-2">WHOIS Lookup</h3>
            <p className="text-gray-500">
              Enter a domain name to retrieve registration information, ownership details, and nameserver configuration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
