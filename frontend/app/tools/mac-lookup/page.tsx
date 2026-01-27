'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Cpu, Loader2, XCircle, Network, Shield, Search, Server } from 'lucide-react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function MACLookupPage() {
  const [mac, setMac] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Hero animations
    tl.fromTo('.hero-badge', 
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6 }
    )
    .fromTo('.hero-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.3'
    )
    .fromTo('.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .fromTo('.search-form',
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7 },
      '-=0.3'
    )
    .fromTo('.info-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
      '-=0.3'
    )

    // Floating orbs animation
    gsap.to('.floating-orb-1', {
      y: -20,
      x: 10,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    gsap.to('.floating-orb-2', {
      y: 15,
      x: -15,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    gsap.to('.floating-orb-3', {
      y: -25,
      x: -10,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  // Animate results when data changes
  useGSAP(() => {
    if (data && resultsRef.current) {
      gsap.fromTo(resultsRef.current.children,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, { dependencies: [data] })

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mac.trim()) {
      setError('Please enter a MAC address')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/mac-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac: mac.trim() })
      })

      const result = await response.json()
      if (!result.success) {
        setError(result.error || 'Failed to lookup MAC address')
        return
      }
      setData(result.data)
    } catch (err) {
      setError('An error occurred while looking up MAC address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb-1 absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px]" />
        <div className="floating-orb-2 absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="floating-orb-3 absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-sky-600/10 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjAuNSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-40" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link href="/tools/network-tools" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
            <Cpu className="w-4 h-4 text-sky-400" />
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent font-semibold">MAC Lookup</span>
          </div>
          
          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500 bg-clip-text text-transparent">
              MAC Address Lookup
            </span>
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            Find manufacturer information for any MAC address. Identify devices on your network with precision.
          </p>
        </div>
      </section>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form ref={formRef} onSubmit={handleLookup} className="search-form relative">
            <div className="relative rounded-2xl p-1"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
              <div className="relative flex items-center">
                <Cpu className="absolute left-5 w-5 h-5 text-sky-400/60" />
                <input
                  type="text"
                  value={mac}
                  onChange={(e) => setMac(e.target.value)}
                  placeholder="Enter MAC address (e.g., 00:1A:2B:3C:4D:5E)"
                  className="w-full pl-14 pr-40 py-5 bg-transparent border-0 rounded-xl text-white placeholder-white/30 focus:ring-0 focus:outline-none transition-all"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !mac.trim()}
                  className="absolute right-3 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Looking...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Lookup
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
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(239,68,68,0.2)'
              }}>
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {data && (
          <div ref={resultsRef} className="max-w-5xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(6,182,212,0.1) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(14,165,233,0.2)'
              }}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/20">
                  <Cpu className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Vendor Information</h2>
                  <p className="text-white/50 text-sm">MAC address lookup results</p>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-sm text-white/40 mb-1">Vendor</div>
                  <div className="text-lg text-white font-semibold">{data.vendor || 'Unknown'}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-sm text-white/40 mb-1">MAC Address</div>
                  <div className="text-lg font-mono text-sky-400">{data.mac}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        {!data && !loading && (
          <div ref={infoRef} className="max-w-4xl mx-auto mt-12">
            <div className="info-card rounded-2xl p-8"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/20">
                  <Network className="w-5 h-5 text-sky-400" />
                </div>
                About MAC Lookup
              </h3>
              <p className="text-white/60 mb-6">
                Identify hardware manufacturers from MAC addresses. Perfect for:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: Search, text: 'Identifying unknown devices on your network' },
                  { icon: Server, text: 'Network inventory and asset management' },
                  { icon: Shield, text: 'Security auditing and device verification' },
                  { icon: Network, text: 'Troubleshooting network connectivity issues' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-sky-500/30 transition-colors duration-300">
                    <item.icon className="w-5 h-5 text-sky-400 flex-shrink-0" />
                    <span className="text-white/70">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Format Examples */}
            <div className="info-card mt-6 rounded-2xl p-8"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
              <h3 className="text-lg font-semibold text-white mb-4">Supported MAC Formats</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {['00:1A:2B:3C:4D:5E', '00-1A-2B-3C-4D-5E', '001A2B3C4D5E'].map((format, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <code className="text-sky-400 font-mono text-sm">{format}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
