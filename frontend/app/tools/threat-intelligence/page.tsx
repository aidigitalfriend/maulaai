'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Shield, Loader2, XCircle, AlertTriangle, CheckCircle, Activity, Zap, Lock, Eye } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface ThreatData {
  domain: string
  riskScore: number
  threatTypes: string[]
  isMalicious: boolean
  details: {
    phishing: boolean
    malware: boolean
    spam: boolean
    suspicious: boolean
  }
}

export default function ThreatIntelligencePage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<ThreatData | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

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
    .fromTo('.feature-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
      '-=0.3'
    )

    // Floating animation for decorative elements
    gsap.to('.float-element', {
      y: -15,
      duration: 3,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.5
    })

    // Pulse animation for shield icon
    gsap.to('.pulse-glow', {
      boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)',
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    })
  }, { scope: containerRef })

  // Animate results when data changes
  useGSAP(() => {
    if (data && resultsRef.current) {
      gsap.fromTo(resultsRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: 'power2.out' }
      )
    }
  }, { dependencies: [data] })

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!domain.trim()) {
      setError('Please enter a domain or IP address')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/threat-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to scan for threats')
        return
      }

      setData(result.data)
    } catch (err: any) {
      setError('An error occurred while scanning for threats')
      console.error('Threat scan error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400 border-red-500/30 bg-red-500/10'
    if (score >= 40) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
    return 'text-green-400 border-green-500/30 bg-green-500/10'
  }

  const getRiskGlow = (score: number) => {
    if (score >= 70) return 'shadow-[0_0_30px_rgba(239,68,68,0.2)]'
    if (score >= 40) return 'shadow-[0_0_30px_rgba(234,179,8,0.2)]'
    return 'shadow-[0_0_30px_rgba(34,197,94,0.2)]'
  }

  const features = [
    { icon: Shield, title: 'Phishing Detection', desc: 'Identify fraudulent sites' },
    { icon: Activity, title: 'Malware Analysis', desc: 'Detect malicious software' },
    { icon: Lock, title: 'Spam Detection', desc: 'Filter spam sources' },
    { icon: Eye, title: 'Threat Hunting', desc: 'Deep security research' }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] float-element" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px] float-element" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-all duration-300 hover:gap-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Network Tools
          </Link>

          <div className="hero-badge inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-sm mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center pulse-glow">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-red-300">Threat Intelligence Scanner</span>
          </div>

          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-red-500 bg-clip-text text-transparent">
              Threat Intelligence
            </span>
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12">
            Scan domains and IPs for security threats, malware, and malicious activity
          </p>

          {/* Search Form */}
          <div ref={formRef} className="search-form max-w-3xl mx-auto">
            <form onSubmit={handleScan} className="relative">
              <div 
                className="relative rounded-2xl p-1.5"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="relative flex items-center">
                  <Shield className="absolute left-5 w-5 h-5 text-red-400/60" />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter domain or IP (e.g., example.com)"
                    className="w-full pl-14 pr-36 py-5 bg-transparent border-0 rounded-xl text-white placeholder-white/30 focus:ring-0 focus:outline-none text-lg"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !domain.trim()}
                    className="absolute right-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 rounded-xl font-semibold shadow-lg shadow-red-500/25 transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Scan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div 
                className="mt-6 p-4 rounded-xl flex items-start gap-3"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      {data && (
        <section className="py-12 relative z-10">
          <div ref={resultsRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Risk Score Card */}
            <div 
              className={`rounded-2xl p-8 border ${getRiskColor(data.riskScore)} ${getRiskGlow(data.riskScore)}`}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Risk Score</h3>
                  <p className="text-white/60">
                    {data.isMalicious ? (
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        High risk detected! Proceed with caution.
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Low risk detected. Domain appears safe.
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-6xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                  {data.riskScore}
                </div>
              </div>
            </div>

            {/* Threat Analysis Grid */}
            <div 
              className="rounded-2xl p-8"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <h3 className="text-xl font-bold text-white mb-6">Threat Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'phishing', label: 'Phishing', detected: data.details.phishing },
                  { key: 'malware', label: 'Malware', detected: data.details.malware },
                  { key: 'spam', label: 'Spam', detected: data.details.spam },
                  { key: 'suspicious', label: 'Suspicious Activity', detected: data.details.suspicious, isWarning: true }
                ].map((item) => (
                  <div 
                    key={item.key}
                    className={`p-5 rounded-xl border transition-all duration-300 ${
                      item.detected 
                        ? item.isWarning 
                          ? 'border-yellow-500/30 bg-yellow-500/10' 
                          : 'border-red-500/30 bg-red-500/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.detected ? (
                        <AlertTriangle className={`w-5 h-5 ${item.isWarning ? 'text-yellow-400' : 'text-red-400'}`} />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      <span className="font-semibold text-white">{item.label}</span>
                    </div>
                    <p className="text-sm mt-2 text-white/50">
                      {item.detected ? 'Detected' : 'Not detected'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Threats */}
            {data.threatTypes.length > 0 && (
              <div 
                className="rounded-2xl p-8"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <h3 className="text-xl font-bold text-white mb-6">Identified Threats</h3>
                <div className="flex flex-wrap gap-3">
                  {data.threatTypes.map((threat, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-sm text-red-300 font-medium"
                    >
                      {threat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section - Show when no results */}
      {!data && !loading && (
        <section className="py-16 relative z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div ref={featuresRef} className="grid md:grid-cols-4 gap-4 mb-12">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="feature-card p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:border-red-500/30 group"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-4 group-hover:from-red-500/30 group-hover:to-rose-500/30 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/50">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Info Card */}
            <div 
              className="rounded-2xl p-8"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <h3 className="text-xl font-bold text-white mb-4">About Threat Intelligence</h3>
              <div className="space-y-4 text-white/60">
                <p>Analyze domains and IP addresses for security threats. Perfect for:</p>
                <ul className="grid md:grid-cols-2 gap-3">
                  {[
                    'Detecting phishing and malware sites',
                    'Identifying spam sources',
                    'Analyzing suspicious activity',
                    'Security research and threat hunting'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
