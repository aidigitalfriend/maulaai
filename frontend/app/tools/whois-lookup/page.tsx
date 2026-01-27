'use client'

import { useState, useRef } from 'react'
import { FileText, Search, Loader2, XCircle, ArrowLeft, Calendar, User, Globe, Server, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface WhoisResult {
  domain: string
  registrar?: string
  createdDate?: string
  expiryDate?: string
  updatedDate?: string
  nameServers?: string[]
  status?: string[]
  registrantOrg?: string
  registrantCountry?: string
  raw?: string
}

export default function WhoisLookupPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WhoisResult | null>(null)
  const [error, setError] = useState('')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Hero animations
    const heroTl = gsap.timeline()
    heroTl
      .from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out'
      })
      .from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.3')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.4')

    // Form animation
    gsap.from(formRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.5
    })

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

  // Animate results when they appear
  useGSAP(() => {
    if (result && resultsRef.current) {
      gsap.from(resultsRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      })
    }
  }, { dependencies: [result], scope: resultsRef })

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/whois-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to perform WHOIS lookup')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section ref={heroRef} className="py-16 md:py-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent" />
          <div className="floating-orb-1 absolute top-20 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl" />
          <div className="floating-orb-2 absolute top-40 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl" />
          <div className="floating-orb-3 absolute bottom-0 left-1/2 w-80 h-80 bg-yellow-600/10 rounded-full blur-3xl" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors duration-300"
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
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white/80">WHOIS Lookup Tool</span>
          </div>
          
          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              WHOIS Lookup
            </span>
          </h1>
          
          <p className="hero-subtitle text-xl text-white/60 max-w-2xl mx-auto">
            Get domain registration and ownership information instantly
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Search Form */}
        <div ref={formRef} className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleLookup} className="relative">
            <div 
              className="p-2 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div className="relative flex items-center">
                <Globe className="absolute left-4 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter domain name (e.g., example.com)"
                  className="w-full pl-12 pr-36 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !domain.trim()}
                  className="absolute right-2 px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 rounded-lg font-semibold text-black transition-all flex items-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/25"
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
            </div>
          </form>

          {error && (
            <div 
              className="mt-4 p-4 rounded-xl flex items-start gap-3"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)'
              }}
            >
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div ref={resultsRef} className="max-w-5xl mx-auto space-y-6">
            {/* Domain Info Card */}
            <div 
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <h2 className="text-lg font-semibold text-white/60 mb-2">Domain</h2>
              <p className="text-3xl font-mono bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-bold">
                {result.domain}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Registrar */}
              {result.registrar && (
                <div 
                  className="rounded-xl p-6 group hover:scale-[1.02] transition-transform duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-yellow-500/20">
                      <Server className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Registrar</h3>
                  </div>
                  <p className="text-white/70">{result.registrar}</p>
                </div>
              )}

              {/* Registrant Organization */}
              {result.registrantOrg && (
                <div 
                  className="rounded-xl p-6 group hover:scale-[1.02] transition-transform duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-yellow-500/20">
                      <User className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Organization</h3>
                  </div>
                  <p className="text-white/70">{result.registrantOrg}</p>
                  {result.registrantCountry && (
                    <p className="text-sm text-white/40 mt-2">{result.registrantCountry}</p>
                  )}
                </div>
              )}

              {/* Created Date */}
              {result.createdDate && (
                <div 
                  className="rounded-xl p-6 group hover:scale-[1.02] transition-transform duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-green-500/20">
                      <Calendar className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Created</h3>
                  </div>
                  <p className="text-white/70">{new Date(result.createdDate).toLocaleDateString()}</p>
                </div>
              )}

              {/* Expiry Date */}
              {result.expiryDate && (
                <div 
                  className="rounded-xl p-6 group hover:scale-[1.02] transition-transform duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-lg flex items-center justify-center border border-red-500/20">
                      <Calendar className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Expires</h3>
                  </div>
                  <p className="text-white/70">{new Date(result.expiryDate).toLocaleDateString()}</p>
                </div>
              )}

              {/* Updated Date */}
              {result.updatedDate && (
                <div 
                  className="rounded-xl p-6 group hover:scale-[1.02] transition-transform duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-blue-500/20">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Updated</h3>
                  </div>
                  <p className="text-white/70">{new Date(result.updatedDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Name Servers */}
            {result.nameServers && result.nameServers.length > 0 && (
              <div 
                className="rounded-xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Name Servers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.nameServers.map((ns, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-yellow-500/30 transition-colors"
                    >
                      <p className="text-white/80 font-mono text-sm">{ns}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            {result.status && result.status.length > 0 && (
              <div 
                className="rounded-xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Domain Status</h3>
                <div className="flex flex-wrap gap-2">
                  {result.status.map((status, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 hover:border-yellow-500/30 transition-colors"
                    >
                      {status}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Raw WHOIS Data */}
            {result.raw && (
              <div 
                className="rounded-xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Raw WHOIS Data</h3>
                <div className="bg-black/50 rounded-lg p-4 max-h-96 overflow-y-auto border border-white/10">
                  <pre className="text-sm text-white/60 font-mono whitespace-pre-wrap">{result.raw}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <div 
              className="rounded-xl p-6"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">About WHOIS Lookup</h3>
              <div className="space-y-3 text-white/60">
                <p>WHOIS is a protocol that provides information about domain registrations. This tool helps you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Check domain availability and registration status</li>
                  <li>Find domain registrar information</li>
                  <li>View registration and expiration dates</li>
                  <li>Identify name servers</li>
                  <li>Check domain ownership details (where available)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
