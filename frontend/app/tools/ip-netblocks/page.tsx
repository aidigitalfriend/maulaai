'use client'

import { useState } from 'react'
import { ArrowLeft, Network, Loader2, AlertCircle, Globe, Building2, Calendar, Server, MapPin, Hash } from 'lucide-react'
import Link from 'next/link'

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
  organization: string;
  orgId: string;
  country: string;
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
  };
  totalNetblocks: number;
  allNetblocks: Array<{
    range: string;
    netname: string;
    organization: string;
    cidr: string;
    size: number;
  }>;
}

export default function IPNetblocksPage() {
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<NetblockData | null>(null)

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
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className={`text-lg ${highlight ? 'font-mono text-cyan-400' : 'text-white'}`}>
        {value || 'N/A'}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/tools/network-tools" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Network Tools
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Network className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                IP Netblocks Lookup
              </h1>
              <p className="text-gray-400 mt-1">Get IP range, network block, and organization information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl mb-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label htmlFor="ip" className="block text-sm font-medium text-gray-300 mb-2">IP Address</label>
              <input
                type="text"
                id="ip"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="e.g., 8.8.8.8"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Looking up...</> : <><Network className="w-5 h-5" />Lookup Netblocks</>}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-300">{error}</div>
            </div>
          )}
        </div>

        {data && (
          <div className="space-y-6">
            {/* Main Netblock Info */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center gap-2">
                <Network className="w-5 h-5" />
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
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-purple-400 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={Building2} label="Organization" value={data.organization} />
                <InfoCard icon={Hash} label="Org ID" value={data.orgId} />
                <InfoCard icon={MapPin} label="Country" value={data.country} />
                <InfoCard icon={Server} label="Source" value={data.source} />
              </div>
              {data.description && data.description !== 'N/A' && (
                <div className="mt-4 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">Description</div>
                  <div className="text-white">{data.description}</div>
                </div>
              )}
            </div>

            {/* ASN Info */}
            {data.as && data.as.asn !== 'N/A' && (
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  ASN Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard icon={Hash} label="ASN" value={data.as.asn} highlight />
                  <InfoCard icon={Building2} label="ASN Name" value={data.as.name} />
                  <InfoCard icon={Network} label="Route" value={data.as.route} />
                  <InfoCard icon={Globe} label="Domain" value={data.as.domain} />
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-amber-400 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Registration Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={Calendar} label="Created" value={data.created} />
                <InfoCard icon={Calendar} label="Last Updated" value={data.updated} />
              </div>
            </div>

            {/* All Netblocks */}
            {data.allNetblocks && data.allNetblocks.length > 1 && (
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Related Netblocks ({data.totalNetblocks} total)
                </h3>
                <div className="space-y-3">
                  {data.allNetblocks.map((nb, idx) => (
                    <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <span className="text-sm text-gray-400">Range: </span>
                          <span className="font-mono text-cyan-400">{nb.range || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">CIDR: </span>
                          <span className="font-mono text-white">{nb.cidr || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Name: </span>
                          <span className="text-white">{nb.netname || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Size: </span>
                          <span className="text-white">{formatSize(nb.size)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-2">About IP Netblocks</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            IP Netblocks lookup provides comprehensive information about IP address ranges, including network names, 
            organizations, CIDR notations, and ASN details. This is useful for network administrators, security 
            researchers, and anyone needing to understand IP address allocation. 🔍
          </p>
        </div>
      </div>
    </div>
  )
}
