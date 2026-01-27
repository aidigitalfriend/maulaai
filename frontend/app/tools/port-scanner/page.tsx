'use client';

import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Search, Loader2, XCircle, ArrowLeft, CheckCircle, Lock, Unlock, Server } from 'lucide-react';
import Link from 'next/link';

interface PortResult {
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service?: string;
}

interface ScanResult {
  host: string;
  ports: PortResult[];
  scanTime: number;
}

export default function PortScannerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState('');
  const [portRange, setPortRange] = useState('21-443');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
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

    gsap.from('.scan-form', {
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

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/tools/port-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: host.trim(),
          portRange: portRange.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to scan ports');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const commonPorts = [
    { label: 'Common Ports', value: '21,22,23,25,53,80,110,143,443,445,3306,3389,5432,8080,8443' },
    { label: 'Web Ports', value: '80,443,8000,8080,8443,8888' },
    { label: 'All Standard', value: '1-1024' },
    { label: 'Custom Range', value: portRange },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(rgba(0, 255, 136, 0.15) 1px, transparent 1px)`,
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
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-sm mb-6">
              <Server className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">Port Scanner</span>
            </div>

            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #00ff88 0%, #10b981 50%, #00ff88 100%)',
                }}
              >
                Port Scanner
              </span>
            </h1>

            <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto">
              Scan network ports to identify open services
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Scan Form */}
        <div className="scan-form max-w-3xl mx-auto mb-12">
          <form onSubmit={handleScan} className="space-y-4">
            <div 
              className="rounded-2xl p-4 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="Enter hostname or IP address"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all outline-none"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={portRange}
                onChange={(e) => setPortRange(e.target.value)}
                className="w-full px-4 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all outline-none"
                disabled={loading}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                {commonPorts.map((preset) => (
                  <option key={preset.label} value={preset.value} className="bg-[#0a0a0a]">
                    {preset.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={portRange}
                onChange={(e) => setPortRange(e.target.value)}
                placeholder="e.g., 80,443 or 1-1024"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all outline-none"
                disabled={loading}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !host.trim()}
              className="w-full px-6 py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
              style={{
                background: loading || !host.trim() ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #00ff88 0%, #10b981 100%)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning ports...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Start Scan
                </>
              )}
            </button>
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
            {/* Summary Card */}
            <div 
              className="result-card rounded-2xl p-6 border border-green-500/30"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
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
                    Scan Results
                  </h2>
                  <p className="text-2xl font-mono text-green-300">{result.host}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center px-6 py-3 bg-green-500/20 rounded-xl border border-green-500/30">
                    <p className="text-sm text-gray-400 mb-1">Open Ports</p>
                    <p className="text-2xl font-bold text-green-400">
                      {result.ports.filter(p => p.status === 'open').length}
                    </p>
                  </div>
                  <div className="text-center px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Scan Time</p>
                    <p className="text-2xl font-bold text-white">
                      {result.scanTime.toFixed(2)}s
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Open Ports */}
            {result.ports.filter(p => p.status === 'open').length > 0 && (
              <div 
                className="result-card rounded-2xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-green-400" />
                  <span 
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Open Ports
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.ports
                    .filter(p => p.status === 'open')
                    .map((port, idx) => (
                      <div 
                        key={idx} 
                        className="rounded-xl p-4 border border-green-500/20 bg-green-500/10"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-green-400">{port.port}</p>
                            {port.service && (
                              <p className="text-sm text-gray-400 mt-1">{port.service}</p>
                            )}
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Closed/Filtered Ports */}
            {result.ports.filter(p => p.status !== 'open').length > 0 && (
              <div 
                className="result-card rounded-2xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <span 
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Closed/Filtered Ports
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.ports
                    .filter(p => p.status !== 'open')
                    .slice(0, 12)
                    .map((port, idx) => (
                      <div 
                        key={idx} 
                        className="rounded-xl p-4 border border-white/5 bg-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold text-gray-400">{port.port}</p>
                            {port.service && (
                              <p className="text-xs text-gray-500 mt-1">{port.service}</p>
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 bg-white/10 rounded text-gray-400">
                            {port.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
                {result.ports.filter(p => p.status !== 'open').length > 12 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    + {result.ports.filter(p => p.status !== 'open').length - 12} more closed/filtered ports
                  </p>
                )}
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
                About Port Scanner
              </h3>
              <div className="space-y-3 text-gray-400">
                <p>A port scanner checks which network ports are open on a target system. This tool helps you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Identify running services on a host</li>
                  <li>Check firewall configuration</li>
                  <li>Verify network security</li>
                  <li>Troubleshoot connectivity issues</li>
                  <li>Audit exposed services</li>
                </ul>
                <div className="mt-4 p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                  <p className="text-sm text-yellow-300">
                    <strong>Note:</strong> Only scan systems you own or have permission to scan. Unauthorized port scanning may be illegal.
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
