'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Search, Loader2, AlertCircle, Globe, Calendar, Building2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

export default function DomainResearchPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

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
      { opacity: 1, scale: 1, duration: 1.2 },
      '-=0.8'
    )

    // Form card animation
    gsap.fromTo(formRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' }
    )

    // Floating particles animation
    gsap.to('.floating-particle', {
      y: -20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.3
    })
  }, { scope: containerRef })

  // Animate results when data changes
  useGSAP(() => {
    if (data && resultsRef.current) {
      gsap.fromTo(resultsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      )
      
      gsap.fromTo('.result-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
      )
    }
  }, { dependencies: [data], scope: containerRef })

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/domain-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const result = await response.json()
      if (!result.success) {
        setError(result.error || 'Failed to research domain')
        return
      }
      setData(result.data)
    } catch (err) {
      setError('An error occurred while researching domain')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-950/30 via-purple-950/20 to-[#0a0a0a]" />
        
        {/* Animated Gradient Orbs */}
        <div className="hero-glow absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="hero-glow absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating Particles */}
        <div className="floating-particle absolute top-20 left-[20%] w-2 h-2 bg-fuchsia-400/40 rounded-full" />
        <div className="floating-particle absolute top-32 right-[30%] w-1.5 h-1.5 bg-purple-400/40 rounded-full" />
        <div className="floating-particle absolute bottom-32 left-[40%] w-2.5 h-2.5 bg-fuchsia-300/30 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-all duration-300 hover:gap-3 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              Domain Research
            </span>
          </div>
          
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-500 via-purple-400 to-fuchsia-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Domain Research Suite
            </span>
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Comprehensive domain history and analysis powered by advanced WHOIS intelligence
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        {/* Search Form Card */}
        <div 
          ref={formRef}
          className="glass-card rounded-2xl p-8 mb-8"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <form onSubmit={handleResearch} className="space-y-6">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-white/80 mb-3">
                Domain Name
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g., google.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 transition-all text-white placeholder-white/30 outline-none"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-fuchsia-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-fuchsia-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Research Domain
                </>
              )}
            </button>
          </form>
          
          {error && (
            <div 
              className="mt-6 p-4 rounded-xl flex items-start gap-3"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-300">{error}</div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {data && (
          <div ref={resultsRef} className="space-y-6">
            <div 
              className="glass-card rounded-2xl p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <h3 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                <Globe className="w-6 h-6 text-fuchsia-400" />
                Domain Information
              </h3>
              
              <div className="space-y-4">
                <div 
                  className="result-card rounded-xl p-5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div className="text-sm text-white/50 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Domain
                  </div>
                  <div className="text-xl font-mono text-white">{data.domain}</div>
                </div>
                
                {data.registrar && (
                  <div 
                    className="result-card rounded-xl p-5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div className="text-sm text-white/50 mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Registrar
                    </div>
                    <div className="text-xl text-white">{data.registrar}</div>
                  </div>
                )}
                
                {data.createdDate && (
                  <div 
                    className="result-card rounded-xl p-5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div className="text-sm text-white/50 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created Date
                    </div>
                    <div className="text-xl text-white">{new Date(data.createdDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div 
          className="mt-8 rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(192, 38, 211, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(192, 38, 211, 0.2)'
          }}
        >
          <h3 className="font-semibold text-fuchsia-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            About Domain Research
          </h3>
          <p className="text-white/70 leading-relaxed">
            Get comprehensive domain history and analysis using WHOIS XML API Domain Research Suite. 
            Uncover domain ownership, registration history, and detailed WHOIS records instantly. 🔍
          </p>
        </div>
      </div>

      {/* Gradient Animation Keyframes */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
      `}</style>
    </div>
  )
}
