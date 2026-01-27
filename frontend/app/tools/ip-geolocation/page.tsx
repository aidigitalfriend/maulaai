'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Globe, MapPin, Loader2, XCircle, Sparkles, Server, Network } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface GeolocationData {
  ip: string
  location: {
    country: string
    region: string
    city: string
    lat: number
    lng: number
    postalCode: string
    timezone: string
  }
  isp: string
  connectionType: string
  organization: string
  asn: {
    asn: string
    name: string
    route: string
  }
}

export default function IPGeolocationPage() {
  const [ipAddress, setIpAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<GeolocationData | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

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
    .fromTo('.search-form',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 },
      '-=0.3'
    )
    
    // Animate floating orbs
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
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out'
        }
      )
    }
  }, { dependencies: [data] })

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ipAddress.trim()) {
      setError('Please enter an IP address')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/ip-geolocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ipAddress.trim() })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to fetch IP geolocation data')
        return
      }

      setData(result.data)
    } catch (err: any) {
      setError('An error occurred while fetching geolocation data')
      console.error('Geolocation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetMyIP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const result = await response.json()
      setIpAddress(result.ip)
    } catch (err) {
      setError('Failed to detect your IP address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-[#0a0a0a] to-blue-950/30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-60" />
        
        {/* Floating Orbs */}
        <div className="floating-orb-1 absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="floating-orb-2 absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="floating-orb-3 absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-cyan-400 mb-8 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">
              IP Geolocation Tool
            </span>
          </div>
          
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              IP Geolocation
            </span>
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Get detailed location and ISP information for any IP address
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
        {/* Search Form */}
        <div ref={formRef} className="search-form max-w-3xl mx-auto mb-12">
          <form onSubmit={handleLookup} className="relative">
            <div 
              className="relative rounded-2xl p-2"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                className="w-full pl-14 pr-52 py-5 bg-transparent border-0 rounded-xl text-white placeholder-white/30 focus:ring-0 focus:outline-none transition-all text-lg"
                disabled={loading}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  type="button"
                  onClick={handleGetMyIP}
                  disabled={loading}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                >
                  My IP
                </button>
                <button
                  type="submit"
                  disabled={loading || !ipAddress.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 rounded-xl font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Looking...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
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
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
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
            {/* Header Card */}
            <div 
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Globe className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white">IP Address</h2>
              </div>
              <p className="text-3xl font-mono bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
                {data.ip}
              </p>
            </div>

            {/* Location Card */}
            <div 
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                </div>
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Country', value: data.location.country },
                  { label: 'Region', value: data.location.region || 'N/A' },
                  { label: 'City', value: data.location.city || 'N/A' },
                  { label: 'Postal Code', value: data.location.postalCode || 'N/A' },
                  { label: 'Timezone', value: data.location.timezone || 'N/A' },
                  { label: 'Coordinates', value: `${data.location.lat}, ${data.location.lng}`, mono: true }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="rounded-xl p-4 transition-all duration-300 hover:bg-white/5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div className="text-sm text-white/40 mb-1">{item.label}</div>
                    <div className={`text-lg text-white ${item.mono ? 'font-mono' : ''}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ISP Card */}
            <div 
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Network className="w-5 h-5 text-blue-400" />
                </div>
                ISP & Network Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'ISP', value: data.isp || 'N/A' },
                  { label: 'Organization', value: data.organization || 'N/A' },
                  { label: 'Connection Type', value: data.connectionType || 'N/A' },
                  ...(data.asn ? [
                    { label: 'ASN', value: data.asn.asn || 'N/A', mono: true },
                    { label: 'ASN Name', value: data.asn.name || 'N/A' },
                    { label: 'Route', value: data.asn.route || 'N/A', mono: true }
                  ] : [])
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="rounded-xl p-4 transition-all duration-300 hover:bg-white/5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div className="text-sm text-white/40 mb-1">{item.label}</div>
                    <div className={`text-lg text-white ${item.mono ? 'font-mono' : ''}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        {!data && !loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <div 
              className="rounded-2xl p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Server className="w-5 h-5 text-cyan-400" />
                </div>
                About IP Geolocation
              </h3>
              <div className="space-y-4 text-white/60">
                <p className="text-lg">Get detailed location and network information for any IP address. Perfect for:</p>
                <ul className="space-y-3 ml-2">
                  {[
                    'Identifying the geographic location of visitors',
                    'Detecting fraud and suspicious activity',
                    'Customizing content based on location',
                    'Network troubleshooting and analysis'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400" />
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
