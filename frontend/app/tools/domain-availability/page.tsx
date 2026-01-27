'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Search, Loader2, AlertCircle, CheckCircle, XCircle, Globe, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface DomainCheck {
  domain: string
  available: boolean
  price?: string
}

export default function DomainAvailabilityPage() {
  const [domainInput, setDomainInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<DomainCheck[]>([])
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const extensions = ['.com', '.net', '.org', '.io', '.co', '.ai', '.dev']

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
    .fromTo('.hero-glow',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1 },
      '-=0.6'
    )
    
    // Form card animation
    tl.fromTo(formRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7 },
      '-=0.4'
    )
    
    // Floating animation for decorative elements
    gsap.to('.float-element', {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.3
    })
    
    // Pulse animation for glow
    gsap.to('.pulse-glow', {
      opacity: 0.6,
      scale: 1.1,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  // Animate results when they appear
  useGSAP(() => {
    if (results.length > 0 && resultsRef.current) {
      gsap.fromTo(resultsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
      
      gsap.fromTo('.result-item',
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.4, 
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.2
        }
      )
    }
  }, { dependencies: [results], scope: containerRef })

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!domainInput.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      // Remove any existing extensions
      const baseDomain = domainInput.trim().toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '')
        .replace(/\.(com|net|org|io|co|ai|dev|info|biz)$/i, '')

      const response = await fetch('/api/tools/domain-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: baseDomain })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to check domain availability')
        return
      }

      setResults(result.data)
    } catch (err: any) {
      setError('An error occurred while checking domain availability')
      console.error('Domain check error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="hero-glow pulse-glow absolute top-0 left-1/4 w-[600px] h-[600px] bg-rose-500/20 rounded-full blur-[120px]" />
        <div className="hero-glow pulse-glow absolute top-20 right-1/4 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[100px]" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-40" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-all duration-300 hover:gap-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 border border-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Globe className="w-4 h-4 text-rose-400 float-element" />
            <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent font-semibold">
              Domain Check
            </span>
            <Sparkles className="w-4 h-4 text-pink-400 float-element" />
          </div>
          
          <h1 className="hero-title text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 bg-clip-text text-transparent">
              Domain Availability
            </span>
            <br />
            <span className="text-white/90">Checker</span>
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Check if your desired domain name is available for registration across multiple TLDs
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pb-16 max-w-4xl">
        {/* Input Form - Glass Card */}
        <div 
          ref={formRef}
          className="rounded-2xl p-8 border border-white/10 shadow-2xl mb-8"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <form onSubmit={handleCheck} className="space-y-6">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-white/80 mb-3">
                Domain Name (without extension)
              </label>
              <input
                type="text"
                id="domain"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g., myawesomesite"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all text-white placeholder-white/30 outline-none"
              />
              <p className="mt-3 text-sm text-white/40">
                We'll check availability for popular extensions: {extensions.join(', ')}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking availability...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Check Availability
                </>
              )}
            </button>
          </form>

          {error && (
            <div 
              className="mt-6 p-4 rounded-xl flex items-start gap-3 border border-red-500/20"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-300">{error}</div>
            </div>
          )}
        </div>

        {/* Results - Glass Card */}
        {results.length > 0 && (
          <div 
            ref={resultsRef}
            className="rounded-2xl p-8 border border-white/10 shadow-2xl mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-400" />
              Availability Results
            </h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`result-item flex items-center justify-between p-5 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
                    result.available 
                      ? 'border-emerald-500/30 bg-emerald-500/10' 
                      : 'border-red-500/30 bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {result.available ? (
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-red-500/20">
                        <XCircle className="w-6 h-6 text-red-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-lg text-white">{result.domain}</div>
                      <div className={`text-sm ${result.available ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.available ? 'Available for registration! 🎉' : 'Already registered'}
                      </div>
                    </div>
                  </div>
                  {result.available && (
                    <a
                      href={`https://www.namecheap.com/domains/registration/results/?domain=${result.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-rose-500/25 transition-all duration-300 hover:scale-105"
                    >
                      Register
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Card - Glass Card */}
        <div 
          className="rounded-xl p-6 border border-white/10"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h3 className="font-semibold text-rose-400 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            About Domain Availability Checker
          </h3>
          <p className="text-sm text-white/50 leading-relaxed">
            This tool uses the WHOIS XML API Domain Availability service to check if domain names are available for registration 
            across popular TLDs. Get instant results for multiple extensions to find your perfect domain name! 🔍
          </p>
        </div>
      </div>
    </div>
  )
}
