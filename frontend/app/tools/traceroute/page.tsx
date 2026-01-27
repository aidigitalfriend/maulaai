'use client'

import { useState, useRef } from 'react'
import { RouteIcon, Search, Loader2, XCircle, ArrowLeft, MapPin, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface Hop {
  hop: number
  ip?: string
  hostname?: string
  rtt1?: number
  rtt2?: number
  rtt3?: number
  avgRtt?: number
}

interface TracerouteResult {
  destination: string
  hops: Hop[]
  completed: boolean
}

export default function TraceroutePage() {
  const [host, setHost] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TracerouteResult | null>(null)
  const [error, setError] = useState('')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    
    // Hero animations
    tl.fromTo(
      '.hero-badge',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 }
    )
    .fromTo(
      '.hero-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.3'
    )
    .fromTo(
      '.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .fromTo(
      '.search-form',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7 },
      '-=0.3'
    )
    .fromTo(
      '.info-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.3'
    )

    // Floating animation for decorative elements
    gsap.to('.float-element', {
      y: -15,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      stagger: 0.3
    })

    // Glow pulse animation
    gsap.to('.glow-pulse', {
      opacity: 0.6,
      scale: 1.1,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    })
  }, { scope: containerRef })

  // Animate results when they appear
  useGSAP(() => {
    if (result && resultsRef.current) {
      gsap.fromTo(
        resultsRef.current.children,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          ease: 'power2.out'
        }
      )
    }
  }, { dependencies: [result] })

  const handleTraceroute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!host.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/traceroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: host.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to perform traceroute')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const getRttColor = (rtt?: number) => {
    if (!rtt) return 'text-gray-500'
    if (rtt < 50) return 'text-emerald-400'
    if (rtt < 100) return 'text-yellow-400'
    if (rtt < 200) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section ref={heroRef} className="py-16 md:py-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-[#0a0a0a] to-purple-950/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl glow-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl glow-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-all duration-300 hover:-translate-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
               style={{
                 background: 'rgba(255,255,255,0.03)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(255,255,255,0.1)'
               }}>
            <span className="text-xl float-element">🛤️</span>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              Network Traceroute
            </span>
          </div>
          
          <h1 className="hero-title text-4xl md:text-5xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Traceroute
            </span>
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Trace the network path to any destination and discover every hop along the way
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Traceroute Form */}
        <div ref={formRef} className="max-w-3xl mx-auto mb-12 search-form">
          <form onSubmit={handleTraceroute} className="relative">
            <div className="relative group">
              {/* Glow effect behind input */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative rounded-xl overflow-hidden"
                   style={{
                     background: 'rgba(255,255,255,0.03)',
                     backdropFilter: 'blur(10px)',
                     border: '1px solid rgba(255,255,255,0.1)'
                   }}>
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="Enter hostname or IP address (e.g., google.com)"
                  className="w-full pl-12 pr-36 py-5 bg-transparent text-white placeholder-white/40 focus:outline-none focus:ring-0 text-lg"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !host.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold text-white transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Tracing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Trace
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl flex items-start gap-3"
                 style={{
                   background: 'rgba(239,68,68,0.1)',
                   border: '1px solid rgba(239,68,68,0.3)'
                 }}>
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div ref={resultsRef} className="max-w-5xl mx-auto space-y-6">
            {/* Destination Card */}
            <div className="glass-card rounded-2xl p-6"
                 style={{
                   background: 'rgba(255,255,255,0.03)',
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white/60 mb-2">Destination</h2>
                  <p className="text-2xl font-mono text-white">{result.destination}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center px-6 py-3 rounded-xl"
                       style={{
                         background: 'rgba(99,102,241,0.15)',
                         border: '1px solid rgba(99,102,241,0.3)'
                       }}>
                    <p className="text-sm text-white/60 mb-1">Total Hops</p>
                    <p className="text-2xl font-bold text-indigo-400">{result.hops.length}</p>
                  </div>
                  <div className={`text-center px-6 py-3 rounded-xl`}
                       style={{
                         background: result.completed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                         border: result.completed ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
                       }}>
                    <p className="text-sm text-white/60 mb-1">Status</p>
                    <p className={`text-sm font-bold ${result.completed ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.completed ? 'Completed' : 'Incomplete'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hops */}
            <div className="rounded-2xl p-6"
                 style={{
                   background: 'rgba(255,255,255,0.03)',
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <RouteIcon className="w-5 h-5 text-indigo-400" />
                Route Hops
              </h3>
              <div className="space-y-3">
                {result.hops.map((hop, idx) => (
                  <div key={idx} 
                       className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.01]"
                       style={{
                         background: 'rgba(255,255,255,0.02)',
                         border: '1px solid rgba(255,255,255,0.05)'
                       }}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                             style={{
                               background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                               border: '1px solid rgba(99,102,241,0.3)'
                             }}>
                          <span className="text-indigo-300 font-bold">{hop.hop}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          {hop.ip ? (
                            <>
                              <p className="text-white font-mono text-sm truncate">{hop.ip}</p>
                              {hop.hostname && hop.hostname !== hop.ip && (
                                <p className="text-white/50 text-xs mt-1 truncate">{hop.hostname}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-white/40 text-sm">* * * Request timed out</p>
                          )}
                        </div>
                      </div>
                      
                      {hop.avgRtt && (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-white/50 mb-1">Round Trip Time</p>
                            <div className="flex gap-2">
                              {hop.rtt1 && (
                                <span className={`text-sm font-mono ${getRttColor(hop.rtt1)}`}>
                                  {hop.rtt1.toFixed(1)}ms
                                </span>
                              )}
                              {hop.rtt2 && (
                                <span className={`text-sm font-mono ${getRttColor(hop.rtt2)}`}>
                                  {hop.rtt2.toFixed(1)}ms
                                </span>
                              )}
                              {hop.rtt3 && (
                                <span className={`text-sm font-mono ${getRttColor(hop.rtt3)}`}>
                                  {hop.rtt3.toFixed(1)}ms
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-center px-4 py-2 rounded-lg"
                               style={{
                                 background: 'rgba(255,255,255,0.03)',
                                 border: '1px solid rgba(255,255,255,0.08)'
                               }}>
                            <p className="text-xs text-white/50 mb-1">Avg</p>
                            <p className={`text-lg font-bold ${getRttColor(hop.avgRtt)}`}>
                              {hop.avgRtt.toFixed(1)}ms
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mt-12 info-card">
            <div className="rounded-2xl p-6"
                 style={{
                   background: 'rgba(255,255,255,0.03)',
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                About Traceroute
              </h3>
              <div className="space-y-3 text-white/70">
                <p>Traceroute shows the path network packets take to reach a destination. This tool helps you:</p>
                <ul className="list-none space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Identify the route to a destination
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Locate network bottlenecks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Troubleshoot connectivity issues
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Measure latency at each hop
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Identify routing problems
                  </li>
                </ul>
                <div className="mt-4 p-4 rounded-xl"
                     style={{
                       background: 'rgba(99,102,241,0.1)',
                       border: '1px solid rgba(99,102,241,0.2)'
                     }}>
                  <p className="text-sm text-indigo-300">
                    <strong>Note:</strong> Some routers may not respond to traceroute requests, resulting in timeouts (*).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
