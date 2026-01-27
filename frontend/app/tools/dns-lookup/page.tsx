'use client';

import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Globe, Search, Loader2, CheckCircle, XCircle, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DnsRecord {
  type: string;
  value: string;
  ttl?: number;
  priority?: number;
}

interface DnsResult {
  domain: string;
  records: {
    A?: DnsRecord[];
    AAAA?: DnsRecord[];
    MX?: DnsRecord[];
    NS?: DnsRecord[];
    TXT?: DnsRecord[];
    CNAME?: DnsRecord[];
    SOA?: any;
  };
}

export default function DnsLookupPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DnsResult | null>(null);
  const [error, setError] = useState('');

  useGSAP(() => {
    // Hero animations
    const heroTl = gsap.timeline();
    heroTl
      .from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
      })
      .from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.4');

    // Search form animation
    gsap.from('.search-form', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.5,
      ease: 'power3.out',
    });
  }, { scope: containerRef });

  useGSAP(() => {
    if (result) {
      gsap.from('.result-card', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power3.out',
      });
    }
  }, { scope: containerRef, dependencies: [result] });

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/tools/dns-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to perform DNS lookup');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const RecordSection = ({ title, records, type }: { title: string; records?: DnsRecord[]; type: string }) => {
    if (!records || records.length === 0) return null;

    return (
      <div 
        className="result-card rounded-2xl p-6 border border-white/10"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span 
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title} Records
          </span>
        </h3>
        <div className="space-y-3">
          {records.map((record, idx) => (
            <div 
              key={idx} 
              className="rounded-xl p-4 border border-white/5 bg-white/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-1">Value</p>
                  <p className="text-gray-200 font-mono text-sm break-all">{record.value}</p>
                </div>
                {record.ttl && (
                  <div className="flex-shrink-0">
                    <p className="text-sm text-gray-500 mb-1">TTL</p>
                    <p className="text-purple-400 font-semibold">{record.ttl}s</p>
                  </div>
                )}
                {record.priority !== undefined && (
                  <div className="flex-shrink-0">
                    <p className="text-sm text-gray-500 mb-1">Priority</p>
                    <p className="text-purple-400 font-semibold">{record.priority}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Network Tools
          </Link>

          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">DNS Lookup</span>
            </div>

            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #a855f7 100%)',
                }}
              >
                DNS Lookup
              </span>
            </h1>

            <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto">
              Perform DNS queries and check domain name system records
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search Form */}
        <div className="search-form max-w-3xl mx-auto mb-12">
          <form onSubmit={handleLookup} className="relative">
            <div 
              className="relative rounded-2xl p-2 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain name (e.g., example.com)"
                className="w-full pl-12 pr-36 py-4 bg-transparent border-0 rounded-xl text-white placeholder-gray-500 focus:ring-0 transition-all outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !domain.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 hover:scale-105"
                style={{
                  background: loading || !domain.trim() ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  color: 'white',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Lookup
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Domain Info */}
            <div 
              className="result-card rounded-2xl p-6 border border-purple-500/30"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Info className="w-5 h-5 text-purple-400" />
                <h2 
                  className="text-xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Domain Information
                </h2>
              </div>
              <p className="text-2xl font-mono text-purple-300">{result.domain}</p>
            </div>

            {/* DNS Records */}
            <RecordSection title="A (IPv4 Address)" records={result.records.A} type="A" />
            <RecordSection title="AAAA (IPv6 Address)" records={result.records.AAAA} type="AAAA" />
            <RecordSection title="MX (Mail Exchange)" records={result.records.MX} type="MX" />
            <RecordSection title="NS (Name Server)" records={result.records.NS} type="NS" />
            <RecordSection title="TXT (Text)" records={result.records.TXT} type="TXT" />
            <RecordSection title="CNAME (Canonical Name)" records={result.records.CNAME} type="CNAME" />

            {/* SOA Record */}
            {result.records.SOA && (
              <div 
                className="result-card rounded-2xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span 
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    SOA (Start of Authority) Record
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.records.SOA).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="rounded-xl p-4 border border-white/5 bg-white/5"
                    >
                      <p className="text-sm text-gray-500 mb-1">{key}</p>
                      <p className="text-gray-200 font-mono text-sm">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <div 
              className="rounded-2xl p-6 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                About DNS Lookup
              </h3>
              <div className="space-y-3 text-gray-400">
                <p>DNS (Domain Name System) translates human-readable domain names into IP addresses. This tool helps you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Query A, AAAA, MX, NS, TXT, and CNAME records</li>
                  <li>Check mail server configuration (MX records)</li>
                  <li>View name servers for a domain</li>
                  <li>Inspect TXT records for SPF, DKIM, and verification</li>
                  <li>Verify DNS propagation</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
