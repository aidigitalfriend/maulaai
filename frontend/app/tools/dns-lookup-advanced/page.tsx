'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Server, Loader2, AlertCircle, Copy, Check, Globe, Database, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface DNSRecord {
  type: string
  name: string
  value: string
  ttl?: number
  priority?: number
}

interface DNSData {
  domain: string
  records: {
    A: DNSRecord[]
    AAAA: DNSRecord[]
    MX: DNSRecord[]
    NS: DNSRecord[]
    TXT: DNSRecord[]
    SOA: DNSRecord[]
    CNAME: DNSRecord[]
  }
}

export default function DNSLookupAdvancedPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<DNSData | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    
    // Hero animations
    tl.fromTo(
      '.hero-badge',
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6 }
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
      '.hero-features',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
      '-=0.3'
    )
    
    // Form card animation
    tl.fromTo(
      formRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.4'
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
      gsap.fromTo(
        resultsRef.current.querySelectorAll('.record-card'),
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5, 
          stagger: 0.1,
          ease: 'power2.out'
        }
      )
    }
  }, { dependencies: [data], scope: resultsRef })

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/dns-lookup-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to fetch DNS records')
        return
      }

      setData(result.data)
    } catch (err: any) {
      setError('An error occurred while fetching DNS records')
      console.error('DNS lookup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderRecordSection = (type: string, records: DNSRecord[]) => {
    if (!records || records.length === 0) return null

    const getTypeColor = (recordType: string) => {
      const colors: Record<string, string> = {
        'A': 'from-emerald-500 to-teal-500',
        'AAAA': 'from-cyan-500 to-blue-500',
        'MX': 'from-purple-500 to-pink-500',
        'NS': 'from-orange-500 to-amber-500',
        'TXT': 'from-green-500 to-emerald-500',
        'CNAME': 'from-blue-500 to-indigo-500',
        'SOA': 'from-rose-500 to-red-500'
      }
      return colors[recordType] || 'from-gray-500 to-gray-600'
    }

    return (
      <div className="record-card glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${getTypeColor(type)}`}>
            <Server className="w-5 h-5 text-white" />
          </div>
          <span className={`bg-gradient-to-r ${getTypeColor(type)} bg-clip-text text-transparent`}>
            {type} Records
          </span>
          <span className="text-sm text-white/40 font-normal">({records.length})</span>
        </h3>
        <div className="space-y-3">
          {records.map((record, index) => (
            <div 
              key={index} 
              className="bg-white/[0.02] rounded-xl p-4 border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {record.name && record.name !== domain && (
                    <div>
                      <span className="text-sm text-white/50">Name: </span>
                      <span className="text-white/90 font-mono text-sm">{record.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-white/50">Value: </span>
                    <span className="text-white/90 font-mono text-sm break-all">{record.value}</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {record.priority !== undefined && (
                      <div>
                        <span className="text-sm text-white/50">Priority: </span>
                        <span className="text-emerald-400 font-medium">{record.priority}</span>
                      </div>
                    )}
                    {record.ttl && (
                      <div>
                        <span className="text-sm text-white/50">TTL: </span>
                        <span className="text-teal-400 font-medium">{record.ttl}s</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(record.value, `${type}-${index}`)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 flex-shrink-0 border border-white/5 hover:border-white/10"
                  title="Copy to clipboard"
                >
                  {copiedIndex === `${type}-${index}` ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/50 hover:text-white/80" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="floating-orb-1 absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="floating-orb-2 absolute top-1/2 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="floating-orb-3 absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-all duration-300 hover:-translate-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/10">
            <span className="text-xl">🔬</span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold">
              Advanced DNS API
            </span>
          </div>
          
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              DNS Lookup
            </span>
            <br />
            <span className="text-white/90">API</span>
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12">
            Get comprehensive DNS records for any domain with our powerful lookup service
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { icon: Globe, label: 'All Record Types' },
              { icon: Zap, label: 'Instant Results' },
              { icon: Shield, label: 'Secure API' },
              { icon: Database, label: 'Complete Data' }
            ].map((feature, i) => (
              <div 
                key={i}
                className="hero-features flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10"
              >
                <feature.icon className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-white/70">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pb-16 max-w-5xl">
        {/* Input Form */}
        <div 
          ref={formRef}
          className="glass-card rounded-2xl p-8 border border-white/10 mb-8"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <form onSubmit={handleLookup} className="space-y-6">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-white/70 mb-3">
                Domain Name
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g., google.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white placeholder-white/30 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Looking up DNS records...
                </>
              ) : (
                <>
                  <Server className="w-5 h-5" />
                  Lookup DNS Records
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-400">{error}</div>
            </div>
          )}
        </div>

        {/* Results */}
        {data && (
          <div ref={resultsRef} className="space-y-6">
            {/* Domain Header */}
            <div 
              className="record-card glass-card rounded-2xl p-6 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.05) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">DNS Records for {data.domain}</h2>
                  <p className="text-white/50">Complete DNS configuration and nameserver records</p>
                </div>
              </div>
            </div>

            {/* DNS Record Sections */}
            {renderRecordSection('A', data.records.A)}
            {renderRecordSection('AAAA', data.records.AAAA)}
            {renderRecordSection('MX', data.records.MX)}
            {renderRecordSection('NS', data.records.NS)}
            {renderRecordSection('TXT', data.records.TXT)}
            {renderRecordSection('CNAME', data.records.CNAME)}
            {renderRecordSection('SOA', data.records.SOA)}
          </div>
        )}

        {/* Info Card */}
        <div 
          className="mt-8 glass-card rounded-2xl p-6 border border-white/10"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/20">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">About DNS Lookup API</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                This tool uses the WHOIS XML API DNS Lookup service to retrieve comprehensive DNS records including A, AAAA, MX, NS, TXT, CNAME, and SOA records. 
                Get complete DNS configuration data for any domain instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add glass-card styles */}
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  )
}
