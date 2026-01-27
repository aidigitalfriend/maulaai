'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Tag, Loader2, XCircle, Globe, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface CategoryData {
  domain: string
  categories: string[]
  tier1: string
  tier2: string[]
  description: string
}

export default function WebsiteCategorizationPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<CategoryData | null>(null)
  
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
    .fromTo('.search-form',
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7 },
      '-=0.3'
    )
    .fromTo('.info-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.2'
    )

    // Floating orbs animation
    gsap.to('.orb-1', {
      y: -20,
      x: 10,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    gsap.to('.orb-2', {
      y: 15,
      x: -15,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    gsap.to('.orb-3', {
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
  }, { dependencies: [data] })

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) {
      setError('Please enter a domain or URL')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/website-categorization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })
      const result = await response.json()
      if (!result.success) {
        setError(result.error || 'Failed to categorize website')
        return
      }
      setData(result.data)
    } catch (err: any) {
      setError('An error occurred while categorizing the website')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-transparent to-transparent" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
          
          {/* Floating orbs */}
          <div className="orb-1 absolute top-20 left-[15%] w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="orb-2 absolute top-40 right-[10%] w-96 h-96 bg-yellow-500/8 rounded-full blur-3xl" />
          <div className="orb-3 absolute bottom-0 left-[30%] w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-amber-400 mb-8 transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 border border-amber-500/20"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300">AI-Powered Categorization</span>
          </div>
          
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Website
            </span>
            <br />
            <span className="text-white">Categorization</span>
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Automatically classify websites into content categories with AI precision
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search Form */}
        <div ref={formRef} className="search-form max-w-3xl mx-auto mb-16 -mt-4">
          <form onSubmit={handleCheck} className="relative">
            <div 
              className="relative rounded-2xl p-1.5 border border-white/10"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="relative flex items-center">
                <Globe className="absolute left-5 w-5 h-5 text-amber-400/60" />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter domain (e.g., amazon.com)"
                  className="w-full pl-14 pr-40 py-5 bg-transparent border-0 rounded-xl text-white placeholder-white/30 focus:ring-0 focus:outline-none text-lg"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !domain.trim()}
                  className="absolute right-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 rounded-xl font-semibold shadow-lg shadow-amber-500/20 transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Tag className="w-4 h-4" />
                      Categorize
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
          
          {error && (
            <div 
              className="mt-4 p-4 rounded-xl flex items-start gap-3 border border-red-500/20"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {data && (
          <div ref={resultsRef} className="max-w-5xl mx-auto space-y-6">
            {/* Domain Card */}
            <div 
              className="rounded-2xl p-6 border border-amber-500/20"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 179, 8, 0.05) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Globe className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-white/80">Domain</h2>
              </div>
              <p className="text-3xl font-mono font-bold text-white">{data.domain}</p>
              {data.description && (
                <p className="text-white/50 mt-3 leading-relaxed">{data.description}</p>
              )}
            </div>

            {/* Primary Category */}
            {data.tier1 && (
              <div 
                className="rounded-2xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <h3 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  Primary Category
                </h3>
                <div 
                  className="rounded-xl p-5 border border-amber-500/20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 179, 8, 0.05) 100%)'
                  }}
                >
                  <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    {data.tier1}
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Categories */}
            {data.tier2 && data.tier2.length > 0 && (
              <div 
                className="rounded-2xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <h3 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Tag className="w-5 h-5 text-amber-400" />
                  </div>
                  Secondary Categories
                </h3>
                <div className="flex flex-wrap gap-3">
                  {data.tier2.map((category, index) => (
                    <div 
                      key={index} 
                      className="px-4 py-2.5 rounded-xl text-amber-300 font-medium border border-amber-500/20 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/10"
                      style={{
                        background: 'rgba(245, 158, 11, 0.1)'
                      }}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Categories */}
            {data.categories && data.categories.length > 0 && (
              <div 
                className="rounded-2xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <h3 className="text-lg font-semibold text-white/80 mb-4">All Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {data.categories.map((category, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 rounded-full text-sm text-white/70 border border-white/10 hover:border-white/20 transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.05)'
                      }}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        {!data && !loading && (
          <div className="info-card max-w-3xl mx-auto">
            <div 
              className="rounded-2xl p-8 border border-white/10"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Tag className="w-5 h-5 text-amber-400" />
                </div>
                About Website Categorization
              </h3>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>Automatically classify websites into content categories. Perfect for:</p>
                <ul className="space-y-3 ml-1">
                  {[
                    'Content filtering and parental controls',
                    'Market research and competitive analysis',
                    'Ad targeting and brand safety',
                    'Network security policies'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
