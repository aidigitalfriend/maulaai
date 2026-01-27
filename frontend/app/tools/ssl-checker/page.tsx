'use client'

import { useState, useRef } from 'react'
import { Shield, Search, Loader2, XCircle, ArrowLeft, CheckCircle, AlertTriangle, Calendar, Globe, Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface SslResult {
  domain: string
  valid: boolean
  issuer?: string
  subject?: string
  validFrom?: string
  validTo?: string
  daysRemaining?: number
  serialNumber?: string
  signatureAlgorithm?: string
  keySize?: number
  protocol?: string
  subjectAltNames?: string[]
  warning?: string
}

export default function SslCheckerPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SslResult | null>(null)
  const [error, setError] = useState('')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    
    // Hero animations
    tl.from('.hero-badge', { 
      y: -30, 
      opacity: 0, 
      duration: 0.6 
    })
    .from('.hero-title', { 
      y: 40, 
      opacity: 0, 
      duration: 0.8 
    }, '-=0.3')
    .from('.hero-subtitle', { 
      y: 30, 
      opacity: 0, 
      duration: 0.6 
    }, '-=0.4')
    .from('.hero-glow', { 
      scale: 0.8, 
      opacity: 0, 
      duration: 1.2 
    }, '-=0.8')
    
    // Form animation
    tl.from('.search-form', { 
      y: 30, 
      opacity: 0, 
      duration: 0.6 
    }, '-=0.4')
    
    // Info section animation
    tl.from('.info-section', { 
      y: 40, 
      opacity: 0, 
      duration: 0.6 
    }, '-=0.2')

    // Floating animation for decorative elements
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
    if (result) {
      gsap.from('.result-card', {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      })
    }
  }, { dependencies: [result], scope: resultsRef })

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/ssl-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to check SSL certificate')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const getCertificateStatus = () => {
    if (!result) return null
    
    if (!result.valid) {
      return { color: 'red', text: 'Invalid', icon: XCircle, bgClass: 'bg-red-500/20', textClass: 'text-red-400', borderClass: 'border-red-500/30' }
    }
    
    if (result.daysRemaining !== undefined) {
      if (result.daysRemaining < 0) {
        return { color: 'red', text: 'Expired', icon: XCircle, bgClass: 'bg-red-500/20', textClass: 'text-red-400', borderClass: 'border-red-500/30' }
      } else if (result.daysRemaining < 30) {
        return { color: 'yellow', text: 'Expiring Soon', icon: AlertTriangle, bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400', borderClass: 'border-yellow-500/30' }
      }
    }
    
    return { color: 'green', text: 'Valid', icon: CheckCircle, bgClass: 'bg-green-500/20', textClass: 'text-green-400', borderClass: 'border-green-500/30' }
  }

  const status = getCertificateStatus()

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/50 via-[#0a0a0a] to-green-950/30" />
        <div className="hero-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-full blur-3xl" />
        <div className="floating-orb absolute top-20 left-20 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl" />
        <div className="floating-orb absolute bottom-20 right-20 w-40 h-40 bg-green-500/10 rounded-full blur-2xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium mb-8">
            <Lock className="w-4 h-4 text-teal-400" />
            <span className="text-white/80">SSL Certificate Checker</span>
            <Sparkles className="w-4 h-4 text-green-400" />
          </div>
          
          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-teal-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              SSL Certificate
            </span>
            <br />
            <span className="text-white">Checker</span>
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            Verify SSL certificates, check expiration dates, and identify security issues in seconds
          </p>
        </div>
      </section>

      <main className="relative z-10 pb-20">
        {/* Search Form */}
        <div ref={formRef} className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8">
          <form onSubmit={handleCheck} className="search-form relative">
            <div 
              className="relative p-1.5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.3), rgba(34,197,94,0.3))',
              }}
            >
              <div className="relative flex items-center bg-[#0a0a0a] rounded-xl overflow-hidden">
                <Globe className="absolute left-5 w-5 h-5 text-teal-400/60" />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter domain name (e.g., example.com)"
                  className="w-full pl-14 pr-36 py-5 bg-transparent text-white placeholder-white/40 focus:outline-none text-lg"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !domain.trim()}
                  className="absolute right-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-400 hover:to-green-400 disabled:from-white/10 disabled:to-white/10 rounded-lg font-semibold text-white disabled:text-white/30 transition-all flex items-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Check SSL
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-xl border border-red-500/30 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && status && (
          <div ref={resultsRef} className="max-w-5xl mx-auto px-4 sm:px-6 mt-12 space-y-6">
            {/* Status Card */}
            <div 
              className="result-card rounded-2xl p-6 border border-white/10"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-white/60 mb-2">Certificate Status</h2>
                  <p className="text-2xl md:text-3xl font-mono text-white">{result.domain}</p>
                </div>
                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border ${status.bgClass} ${status.borderClass}`}>
                  <status.icon className={`w-6 h-6 ${status.textClass}`} />
                  <span className={`text-xl font-bold ${status.textClass}`}>{status.text}</span>
                </div>
              </div>
              
              {result.daysRemaining !== undefined && result.daysRemaining >= 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/60">
                    <span className="font-semibold text-teal-400 text-2xl">{result.daysRemaining}</span>
                    <span className="ml-2">days until expiration</span>
                  </p>
                </div>
              )}

              {result.warning && (
                <div className="mt-4 p-4 rounded-xl border border-yellow-500/30 flex items-start gap-3" style={{ background: 'rgba(234,179,8,0.1)' }}>
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-300 text-sm">{result.warning}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Issuer */}
              {result.issuer && (
                <div 
                  className="result-card rounded-xl p-6 border border-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Issued By</h3>
                  <p className="text-white">{result.issuer}</p>
                </div>
              )}

              {/* Subject */}
              {result.subject && (
                <div 
                  className="result-card rounded-xl p-6 border border-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Issued To</h3>
                  <p className="text-white">{result.subject}</p>
                </div>
              )}

              {/* Valid From */}
              {result.validFrom && (
                <div 
                  className="result-card rounded-xl p-6 border border-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-teal-400" />
                    <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Valid From</h3>
                  </div>
                  <p className="text-white">{new Date(result.validFrom).toLocaleString()}</p>
                </div>
              )}

              {/* Valid To */}
              {result.validTo && (
                <div 
                  className="result-card rounded-xl p-6 border border-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Valid To</h3>
                  </div>
                  <p className="text-white">{new Date(result.validTo).toLocaleString()}</p>
                </div>
              )}

              {/* Serial Number */}
              {result.serialNumber && (
                <div 
                  className="result-card rounded-xl p-6 border border-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Serial Number</h3>
                  <p className="text-white/80 font-mono text-sm break-all">{result.serialNumber}</p>
                </div>
              )}

              {/* Signature Algorithm */}
              {result.signatureAlgorithm && (
                <div 
                  className="result-card rounded-xl p-6 border border-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Signature Algorithm</h3>
                  <p className="text-white">{result.signatureAlgorithm}</p>
                </div>
              )}

              {/* Key Size */}
              {result.keySize && (
                <div 
                  className="result-card rounded-xl p-6 border border-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Key Size</h3>
                  <p className="text-white">{result.keySize} <span className="text-white/50">bits</span></p>
                </div>
              )}

              {/* Protocol */}
              {result.protocol && (
                <div 
                  className="result-card rounded-xl p-6 border border-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Protocol</h3>
                  <p className="text-white">{result.protocol}</p>
                </div>
              )}
            </div>

            {/* Subject Alternative Names */}
            {result.subjectAltNames && result.subjectAltNames.length > 0 && (
              <div 
                className="result-card rounded-xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Subject Alternative Names</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.subjectAltNames.map((name, idx) => (
                    <div 
                      key={idx} 
                      className="rounded-lg p-3 border border-white/5"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <p className="text-white/80 font-mono text-sm">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-16">
            <div 
              className="info-section rounded-2xl p-8 border border-white/10"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-green-500/20 border border-teal-500/20">
                  <Shield className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">About SSL Certificate Checker</h3>
              </div>
              <div className="space-y-4 text-white/60">
                <p>SSL/TLS certificates encrypt data between your browser and a website. This tool helps you:</p>
                <ul className="space-y-3 ml-2">
                  {[
                    'Verify certificate validity and expiration',
                    'Check certificate issuer and authority',
                    'View encryption strength and protocol version',
                    'Inspect subject alternative names (SANs)',
                    'Identify potential security issues'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-green-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
