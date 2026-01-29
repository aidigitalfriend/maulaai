'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, ArrowLeft, Search, Loader2, Copy, Check, Globe, Building, Wifi, Shield, Clock } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, TextPlugin, CustomWiggle, CustomEase } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, CustomWiggle, CustomEase);

interface IpInfo {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  asn?: {
    asn: string;
    name: string;
    domain: string;
    route: string;
    type: string;
  };
  company?: {
    name: string;
    domain: string;
    type: string;
  };
  privacy?: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
    hosting: boolean;
  };
}

export default function IpInfoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IpInfo | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      CustomWiggle.create('ipWiggle', { wiggles: 6, type: 'easeOut' });

      // Background orbs
      gsap.to('.ip-gradient-orb', {
        x: 'random(-60, 60)',
        y: 'random(-30, 30)',
        scale: 'random(0.9, 1.1)',
        duration: 5,
        ease: 'sine.inOut',
        stagger: { each: 0.8, repeat: -1, yoyo: true },
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
      gsap.to('.hero-ip-icon', {
        boxShadow: '0 0 50px rgba(59, 130, 246, 0.5)',
        scale: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Search form
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
    if (!ipAddress.trim()) return;

    // Button animation
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

    try {
      const response = await fetch('/api/tools/ip-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ipAddress.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        
        // Animate results
        setTimeout(() => {
          gsap.from('.info-card', {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.5,
            ease: 'power2.out',
          });
        }, 50);
      } else {
        setError(result.error || 'Failed to fetch IP information');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleGetMyIP = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const result = await response.json();
      setIpAddress(result.ip);
    } catch (err) {
      setError('Failed to detect your IP address');
    } finally {
      setLoading(false);
    }
  };

  const copyIP = async () => {
    if (data?.ip) {
      await navigator.clipboard.writeText(data.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="ip-gradient-orb absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-[100px]" />
        <div className="ip-gradient-orb absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-indigo-600/15 to-purple-600/15 blur-[80px]" />
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

          <div className="flex items-center gap-6 mb-8">
            <div className="hero-ip-icon w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border border-blue-500/30 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 ref={titleRef} className="text-3xl md:text-4xl font-bold text-white mb-1">
                IP Information
              </h1>
              <p className="text-gray-400">
                Get detailed information about any IP address
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleLookup} className="search-form max-w-3xl">
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-2 flex gap-2">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-gray-500 outline-none"
                  disabled={loading}
                />
              </div>
              <button
                type="button"
                onClick={handleGetMyIP}
                disabled={loading}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all"
              >
                My IP
              </button>
              <button
                type="submit"
                disabled={loading || !ipAddress.trim()}
                className="lookup-btn px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Lookup
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Error */}
        {error && (
          <div className="max-w-3xl mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Main IP Card */}
            <div className="info-card bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">IP Address</p>
                  <h2 className="text-3xl font-bold text-white font-mono">{data.ip}</h2>
                  {data.hostname && (
                    <p className="text-gray-400 mt-1">{data.hostname}</p>
                  )}
                </div>
                <button
                  onClick={copyIP}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Location */}
              <div className="info-card bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Location</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {data.city && <p className="text-gray-300"><span className="text-gray-500">City:</span> {data.city}</p>}
                  {data.region && <p className="text-gray-300"><span className="text-gray-500">Region:</span> {data.region}</p>}
                  {data.country && <p className="text-gray-300"><span className="text-gray-500">Country:</span> {data.country}</p>}
                  {data.postal && <p className="text-gray-300"><span className="text-gray-500">Postal:</span> {data.postal}</p>}
                  {data.loc && <p className="text-gray-300"><span className="text-gray-500">Coordinates:</span> {data.loc}</p>}
                </div>
              </div>

              {/* Organization */}
              <div className="info-card bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Organization</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {data.org && <p className="text-gray-300">{data.org}</p>}
                  {data.asn && (
                    <>
                      <p className="text-gray-300"><span className="text-gray-500">ASN:</span> {data.asn.asn}</p>
                      <p className="text-gray-300"><span className="text-gray-500">Name:</span> {data.asn.name}</p>
                      {data.asn.route && <p className="text-gray-300"><span className="text-gray-500">Route:</span> {data.asn.route}</p>}
                    </>
                  )}
                </div>
              </div>

              {/* Network */}
              <div className="info-card bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Network</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {data.timezone && (
                    <p className="text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {data.timezone}
                    </p>
                  )}
                  {data.company && (
                    <>
                      <p className="text-gray-300"><span className="text-gray-500">Company:</span> {data.company.name}</p>
                      <p className="text-gray-300"><span className="text-gray-500">Type:</span> {data.company.type}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Privacy */}
              {data.privacy && (
                <div className="info-card bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-white">Privacy & Security</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(data.privacy).map(([key, value]) => (
                      <div
                        key={key}
                        className={`px-4 py-2 rounded-xl text-sm font-medium ${
                          value
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}
                      >
                        {key.toUpperCase()}: {value ? 'Yes' : 'No'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !data && (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-400 mb-2">Enter an IP Address</h3>
            <p className="text-gray-500">
              Type an IP address or click &quot;My IP&quot; to get detailed information including location, organization, and network details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
