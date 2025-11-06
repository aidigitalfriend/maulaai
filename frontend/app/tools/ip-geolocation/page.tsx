'use client'

import { useState } from 'react'
import { ArrowLeft, Globe, MapPin, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/tools" 
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Network Tools
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                IP Geolocation API
              </h1>
              <p className="text-gray-400 mt-1">
                Get detailed location and ISP information for any IP address
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Input Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl mb-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label htmlFor="ip" className="block text-sm font-medium text-gray-300 mb-2">
                IP Address
              </label>
              <input
                type="text"
                id="ip"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g., 8.8.8.8"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-gray-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    Lookup Location
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGetMyIP}
                disabled={loading}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use My IP
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-300">{error}</div>
            </div>
          )}
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Location Card */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-cyan-400">
                <MapPin className="w-5 h-5" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">IP Address</div>
                  <div className="text-lg font-mono text-white">{data.ip}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">Country</div>
                  <div className="text-lg text-white">{data.location.country}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">Region</div>
                  <div className="text-lg text-white">{data.location.region || 'N/A'}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">City</div>
                  <div className="text-lg text-white">{data.location.city || 'N/A'}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">Postal Code</div>
                  <div className="text-lg text-white">{data.location.postalCode || 'N/A'}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">Timezone</div>
                  <div className="text-lg text-white">{data.location.timezone || 'N/A'}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">Coordinates</div>
                  <div className="text-lg font-mono text-white">
                    {data.location.lat}, {data.location.lng}
                  </div>
                </div>
              </div>
            </div>

            {/* ISP Card */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-cyan-400">
                <Globe className="w-5 h-5" />
                ISP & Network Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">ISP</div>
                  <div className="text-lg text-white">{data.isp || 'N/A'}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">Organization</div>
                  <div className="text-lg text-white">{data.organization || 'N/A'}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">Connection Type</div>
                  <div className="text-lg text-white">{data.connectionType || 'N/A'}</div>
                </div>
                {data.asn && (
                  <>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">ASN</div>
                      <div className="text-lg font-mono text-white">{data.asn.asn || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">ASN Name</div>
                      <div className="text-lg text-white">{data.asn.name || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">Route</div>
                      <div className="text-lg font-mono text-white">{data.asn.route || 'N/A'}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-2">About IP Geolocation API</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            This tool uses the WHOIS XML API IP Geolocation service to provide detailed location and ISP information 
            for any IP address. Get accurate geolocation data including coordinates, timezone, ISP details, and network information.
          </p>
        </div>
      </div>
    </div>
  )
}
