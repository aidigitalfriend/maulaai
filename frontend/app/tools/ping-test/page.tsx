'use client';

import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Activity, Search, Loader2, XCircle, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface PingResult {
  host: string;
  alive: boolean;
  time?: number;
  min?: number;
  max?: number;
  avg?: number;
  packetLoss?: number;
  packets?: number;
}

export default function PingTestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PingResult | null>(null);
  const [error, setError] = useState('');

  useGSAP(() => {
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

    gsap.from('.ping-form', {
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

  const handlePing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/tools/ping-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: host.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to ping host');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const getLatencyConfig = (latency?: number) => {
    if (!latency) return { color: '#6b7280', label: 'Unknown' };
    if (latency < 50) return { color: '#00ff88', label: 'Excellent' };
    if (latency < 100) return { color: '#fbbf24', label: 'Good' };
    if (latency < 200) return { color: '#f59e0b', label: 'Fair' };
    return { color: '#ef4444', label: 'Poor' };
  };

  const latencyConfig = getLatencyConfig(result?.avg);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(rgba(245, 158, 11, 0.15) 1px, transparent 1px)`,
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
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">Ping Test</span>
            </div>

            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #f59e0b 100%)',
                }}
              >
                Ping Test
              </span>
            </h1>

            <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto">
              Test network connectivity and measure latency
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Ping Form */}
        <div className="ping-form max-w-3xl mx-auto mb-12">
          <form onSubmit={handlePing} className="relative">
            <div 
              className="relative rounded-2xl p-2 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Activity className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="Enter hostname or IP address (e.g., google.com)"
                className="w-full pl-12 pr-36 py-4 bg-transparent border-0 rounded-xl text-white placeholder-gray-500 focus:ring-0 transition-all outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !host.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 hover:scale-105"
                style={{
                  background: loading || !host.trim() ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  color: 'white',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Pinging...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Ping
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
            {/* Status Card */}
            <div 
              className="result-card rounded-2xl p-6 border"
              style={{
                background: result.alive 
                  ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                borderColor: result.alive ? 'rgba(0, 255, 136, 0.3)' : 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 
                    className="text-xl font-bold mb-2"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Host Status
                  </h2>
                  <p className="text-2xl font-mono" style={{ color: result.alive ? '#00ff88' : '#ef4444' }}>
                    {result.host}
                  </p>
                </div>
                <div 
                  className="flex items-center gap-3 px-6 py-3 rounded-xl"
                  style={{
                    background: result.alive ? 'rgba(0, 255, 136, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: `1px solid ${result.alive ? 'rgba(0, 255, 136, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  {result.alive ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <span className="text-xl font-bold text-green-400">Online</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-400" />
                      <span className="text-xl font-bold text-red-400">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {result.alive && (
              <>
                {/* Latency Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Average */}
                  <div 
                    className="result-card rounded-xl p-6 border border-white/10"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${latencyConfig.color}20` }}
                      >
                        <Clock className="w-5 h-5" style={{ color: latencyConfig.color }} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-300">Average</h3>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: latencyConfig.color }}>
                      {result.avg?.toFixed(2)} ms
                    </p>
                  </div>

                  {/* Min */}
                  <div 
                    className="result-card rounded-xl p-6 border border-white/10"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-300">Min</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-400">
                      {result.min?.toFixed(2)} ms
                    </p>
                  </div>

                  {/* Max */}
                  <div 
                    className="result-card rounded-xl p-6 border border-white/10"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-300">Max</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-400">
                      {result.max?.toFixed(2)} ms
                    </p>
                  </div>

                  {/* Packet Loss */}
                  <div 
                    className="result-card rounded-xl p-6 border border-white/10"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: result.packetLoss === 0 ? 'rgba(0, 255, 136, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}
                      >
                        <Activity 
                          className="w-5 h-5"
                          style={{ color: result.packetLoss === 0 ? '#00ff88' : '#ef4444' }}
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-300">Packet Loss</h3>
                    </div>
                    <p 
                      className="text-3xl font-bold"
                      style={{ color: result.packetLoss === 0 ? '#00ff88' : '#ef4444' }}
                    >
                      {result.packetLoss?.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div 
                  className="result-card rounded-2xl p-6 border border-white/10"
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
                    Performance Assessment
                  </h3>
                  <div className="space-y-3">
                    {result.avg !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Latency</span>
                          <span className="font-semibold" style={{ color: latencyConfig.color }}>
                            {latencyConfig.label}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min((200 - (result.avg || 0)) / 2, 100)}%`,
                              background: latencyConfig.color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
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
                About Ping Test
              </h3>
              <div className="space-y-3 text-gray-400">
                <p>Ping tests network connectivity by sending packets to a host and measuring response time. This tool helps you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Check if a host is reachable</li>
                  <li>Measure network latency (round-trip time)</li>
                  <li>Detect packet loss</li>
                  <li>Troubleshoot network connectivity issues</li>
                  <li>Monitor network performance</li>
                </ul>
                <div className="mt-4 p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                  <p className="text-sm text-cyan-300">
                    <strong>Latency Guide:</strong> {"<"}50ms (Excellent), 50-100ms (Good), 100-200ms (Fair), {">"}200ms (Poor)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
