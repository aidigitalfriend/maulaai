'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Award, Loader2, AlertCircle, Star, Shield, Globe, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface ReputationData {
  domain: string
  reputationScore: number
  trustLevel: string
  verdict: string
}

export default function DomainReputationPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<ReputationData | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    
    // Animate hero elements
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
    .fromTo('.hero-features',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
      '-=0.3'
    )
    
    // Animate form card
    tl.fromTo(formRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.4'
    )
    
    // Floating animation for background orbs
    gsap.to('.floating-orb', {
      y: -20,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.5
    })
  }, { scope: containerRef })

  // Animate results when they appear
  useGSAP(() => {
    if (data && resultRef.current) {
      gsap.fromTo(resultRef.current.children,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.2)' }
      )
    }
  }, { dependencies: [data] })

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/domain-reputation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to check domain reputation')
        return
      }

      setData(result.data)
    } catch (err: any) {
      setError('An error occurred while checking domain reputation')
      console.error('Reputation check error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getReputationBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30'
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="floating-orb absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="floating-orb absolute bottom-10 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="floating-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-xl">⭐</span>
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent font-semibold">
              Domain Reputation
            </span>
          </div>
          
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Domain Reputation
            </span>
            <br />
            <span className="text-white">Checker</span>
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-10">
            Check domain trustworthiness and security reputation with advanced analysis
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: Shield, text: 'Security Analysis' },
              { icon: Globe, text: 'Global Reputation' },
              { icon: TrendingUp, text: 'Trust Scoring' }
            ].map((feature, i) => (
              <div 
                key={i}
                className="hero-features flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/70 bg-white/5 border border-white/10"
              >
                <feature.icon className="w-4 h-4 text-indigo-400" />
                {feature.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20 max-w-4xl relative z-10">
        {/* Form Card */}
        <div 
          ref={formRef}
          className="rounded-2xl p-8 mb-8 bg-white/5 backdrop-blur-md border border-white/10"
        >
          <form onSubmit={handleCheck} className="space-y-6">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-white/70 mb-3">
                Domain Name
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., google.com"
                className="w-full px-5 py-4 rounded-xl text-white placeholder-white/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/5 border border-white/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking reputation...
                </>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  Check Reputation
                </>
              )}
            </button>
          </form>

          {error && (
            <div 
              className="mt-6 p-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-300">{error}</div>
            </div>
          )}
        </div>

        {/* Results */}
        {data && (
          <div ref={resultRef} className="space-y-6">
            {/* Score Card */}
            <div 
              className={`rounded-2xl p-10 backdrop-blur-md ${getReputationBg(data.reputationScore)}`}
            >
              <div className="text-center">
                <div className={`text-7xl font-bold mb-3 bg-gradient-to-r ${getReputationColor(data.reputationScore)} bg-clip-text text-transparent`}>
                  {data.reputationScore}
                </div>
                <div className="text-2xl font-semibold text-white mb-3">{data.trustLevel}</div>
                <div className="flex justify-center gap-1.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-7 h-7 transition-all ${i < Math.round(data.reputationScore / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} 
                    />
                  ))}
                </div>
                <div className="text-white/70 text-lg">{data.verdict}</div>
              </div>
            </div>

            {/* Domain Details Card */}
            <div 
              className="rounded-2xl p-8 bg-white/5 backdrop-blur-md border border-white/10"
            >
              <h3 className="text-xl font-semibold mb-5 text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                Domain Details
              </h3>
              <div 
                className="rounded-xl p-5 bg-white/5 border border-white/10"
              >
                <div className="text-sm text-white/50 mb-2">Domain</div>
                <div className="text-xl font-mono text-white">{data.domain}</div>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div 
          className="mt-8 rounded-2xl p-6 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20"
        >
          <h3 className="font-semibold text-indigo-300 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            About Domain Reputation
          </h3>
          <p className="text-sm text-white/60 leading-relaxed">
            This tool uses the WHOIS XML API Domain Reputation service to assess domain trustworthiness based on 
            security history, content quality, and online presence. Get comprehensive insights into any domain's reputation. 🏆
          </p>
        </div>
      </div>
    </div>
  )
}
