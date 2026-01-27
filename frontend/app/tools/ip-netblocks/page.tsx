'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Network, Loader2, XCircle, Globe, Building2, Calendar, Server, MapPin, Hash, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface NetblockData {
  ip: string;
  range: string;
  rangeStart: string;
  rangeEnd: string;
  rangeSize: number;
  netname: string;
  nethandle: string;
  nettype: string;
  cidr: string;
  parent?: string;
  organization: string;
  orgId: string;
  country: string;
  city?: string;
  updated: string;
  created: string;
  description: string;
  source: string;
  status: string;
  as: {
    asn: string;
    name: string;
    route: string;
    domain: string;
    type?: string;
  };
  abuseContact?: {
    email: string;
    phone: string;
    role: string;
  } | null;
  adminContact?: {
    email: string;
    role: string;
  } | null;
  totalNetblocks: number;
  allNetblocks: Array<{
    range: string;
    netname: string;
    organization: string;
    cidr: string;
    size: number;
    asn?: string;
    asnName?: string;
  }>;
}

export default function IPNetblocksPage() {
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<NetblockData | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    
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
    .fromTo('.info-card-initial',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.2'
    )

    // Floating animation for background orbs
    gsap.to('.floating-orb-1', {
      y: -20,
      x: 10,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    gsap.to('.floating-orb-2', {
      y: 20,
      x: -15,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    gsap.to('.floating-orb-3', {
      y: -15,
      x: -10,
      duration: 3.5,
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
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, { dependencies: [data] })

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ip.trim()) {
      setError('Please enter an IP address')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/ip-netblocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ip.trim() })
      })

      const result = await response.json()
      if (!result.success) {
        setError(result.error || 'Failed to lookup IP netblocks')
        return
      }
      setData(result.data)
    } catch (err) {
      setError('An error occurred while looking up IP netblocks')
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (size: number) => {
    if (!size || size === 0) return 'N/A'
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M IPs`
    if (size >= 1000) return `${(size / 1000).toFixed(1)}K IPs`
    return `${size} IPs`
  }

  const InfoCard = ({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value: string | number; highlight?: boolean }) => (
    <div 
      className="rounded-xl p-4 border border-white/10 transition-all duration-300 hover:border-lime-500/30 hover:bg-white/[0.05]"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
        <Icon className="w-4 h-4 text-lime-500/70" />
        {label}
      </div>
      <div className={`text-lg ${highlight ? 'font-mono text-lime-400' : 'text-white'}`}>
        {value || 'N/A'}
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="floating-orb-1 absolute top-20 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
        <div className="floating-orb-2 absolute top-1/2 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="floating-orb-3 absolute bottom-20 left-1/3 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-lime-400 mb-8 transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 border border-lime-500/30 bg-lime-500/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span className="text-lime-300">IP Netblocks</span>
          </div>
          
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
              IP Netblocks
            </span>
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
            Get IP range, network block, and organization information
          </p>
        </div>
      </section>

      <div className="container-custom py-12 relative z-10">
        {/* Search Form */}
        <div ref={formRef} className="search-form max-w-3xl mx-auto mb-12">
          <form onSubmit={handleLookup} className="relative">
            <div 
              className="relative rounded-2xl p-2 border border-white/10 transition-all duration-300 hover:border-lime-500/30"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Network className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                className="w-full pl-14 pr-36 py-4 bg-transparent border-0 rounded-xl text-white placeholder-gray-500 focus:ring-0 transition-all outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !ip.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-400 hover:to-green-400 text-black font-semibold rounded-xl shadow-lg shadow-lime-500/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Looking...
                  </>
                ) : (
                  <>
                    <Network className="w-4 h-4" />
                    Lookup
                  </>
                )}
              </button>
            </div>
          </form>
          {error && (
            <div 
              className="mt-4 p-4 rounded-xl flex items-start gap-3 border border-red-500/30"
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

        {data && (
          <div ref={resultsRef} className="max-w-5xl mx-auto space-y-6">
            {/* Main Netblock Info */}
            <div 
              className="rounded-2xl p-6 border border-lime-500/20"
              style={{
                background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-lime-400" />
                Netblock Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={Globe} label="IP Address" value={data.ip} highlight />
                <InfoCard icon={Network} label="IP Range" value={data.range} highlight />
                <InfoCard icon={Hash} label="CIDR" value={data.cidr} highlight />
                <InfoCard icon={Server} label="Range Size" value={formatSize(data.rangeSize)} />
                <InfoCard icon={Server} label="Network Name" value={data.netname} />
                <InfoCard icon={Server} label="Network Type" value={data.nettype} />
                <InfoCard icon={Server} label="Network Handle" value={data.nethandle} />
                <InfoCard icon={Server} label="Status" value={data.status} />
              </div>
            </div>

            {/* Organization Info */}
            <div 
              className="rounded-2xl p-6 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Organization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={Building2} label="Organization" value={data.organization} />
                <InfoCard icon={Hash} label="Org ID" value={data.orgId} />
                <InfoCard icon={MapPin} label="Country" value={data.country} />
                <InfoCard icon={Server} label="Source" value={data.source} />
              </div>
              {data.description && data.description !== 'N/A' && (
                <div 
                  className="mt-4 rounded-xl p-4 border border-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="text-sm text-gray-400 mb-1">Description</div>
                  <div className="text-gray-200">{data.description}</div>
                </div>
              )}
            </div>

            {/* ASN Info */}
            {data.as && data.as.asn !== 'N/A' && (
              <div 
                className="rounded-2xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-400" />
                  ASN Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Hash} label="ASN" value={data.as.asn} highlight />
                  <InfoCard icon={Building2} label="ASN Name" value={data.as.name} />
                  <InfoCard icon={Network} label="Route" value={data.as.route} />
                  <InfoCard icon={Globe} label="Domain" value={data.as.domain} />
                  {data.as.type && <InfoCard icon={Server} label="Type" value={data.as.type} />}
                </div>
              </div>
            )}

            {/* Abuse Contact */}
            {data.abuseContact && (
              <div 
                className="rounded-2xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  Abuse Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoCard icon={Building2} label="Role" value={data.abuseContact.role} />
                  <InfoCard icon={Globe} label="Email" value={data.abuseContact.email} />
                  <InfoCard icon={Server} label="Phone" value={data.abuseContact.phone} />
                </div>
              </div>
            )}

            {/* Dates */}
            <div 
              className="rounded-2xl p-6 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Registration Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={Calendar} label="Created" value={data.created} />
                <InfoCard icon={Calendar} label="Last Updated" value={data.updated} />
              </div>
            </div>

            {/* All Netblocks */}
            {data.allNetblocks && data.allNetblocks.length > 1 && (
              <div 
                className="rounded-2xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Network className="w-5 h-5 text-lime-400" />
                  Related Netblocks ({data.totalNetblocks} total)
                </h3>
                <div className="space-y-3">
                  {data.allNetblocks.map((nb, idx) => (
                    <div 
                      key={idx} 
                      className="rounded-xl p-4 border border-white/10 transition-all duration-300 hover:border-lime-500/30"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <span className="text-sm text-gray-400 block">Range</span>
                          <span className="font-mono text-lime-400">{nb.range || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400 block">CIDR</span>
                          <span className="font-mono text-gray-200">{nb.cidr || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400 block">Name</span>
                          <span className="text-gray-200">{nb.netname || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400 block">Size</span>
                          <span className="text-gray-200">{formatSize(nb.size)}</span>
                        </div>
                        {nb.asn && nb.asn !== 'N/A' && (
                          <div>
                            <span className="text-sm text-gray-400 block">ASN</span>
                            <span className="text-green-400">{nb.asn}</span>
                          </div>
                        )}
                        {nb.asnName && nb.asnName !== 'N/A' && (
                          <div>
                            <span className="text-sm text-gray-400 block">ASN Name</span>
                            <span className="text-gray-200">{nb.asnName}</span>
                          </div>
                        )}
                      </div>
                      {nb.organization && nb.organization !== 'N/A' && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <span className="text-sm text-gray-400">Organization: </span>
                          <span className="text-gray-200">{nb.organization}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        {!data && !loading && (
          <div className="info-card-initial max-w-3xl mx-auto mt-12">
            <div 
              className="rounded-2xl p-8 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-lime-400" />
                About IP Netblocks
              </h3>
              <div className="space-y-4 text-gray-400">
                <p>Get comprehensive information about IP address ranges. Perfect for:</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-lime-500" />
                    Network administration and planning
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Security research and threat analysis
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Understanding IP address allocation
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    Identifying network ownership
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
