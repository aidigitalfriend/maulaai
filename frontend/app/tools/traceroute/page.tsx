'use client'

import { useState } from 'react'
import { RouteIcon, Search, Loader2, XCircle, ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'

interface Hop {
  hop: number
  ip?: string
  hostname?: string
  rtt1?: number
  rtt2?: number
  rtt3?: number
  avgRtt?: number
}

interface TracerouteResult {
  destination: string
  hops: Hop[]
  completed: boolean
}

export default function TraceroutePage() {
  const [host, setHost] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TracerouteResult | null>(null)
  const [error, setError] = useState('')

  const handleTraceroute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!host.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/traceroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: host.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to perform traceroute')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const getRttColor = (rtt?: number) => {
    if (!rtt) return 'text-neural-400'
    if (rtt < 50) return 'text-green-400'
    if (rtt < 100) return 'text-yellow-400'
    if (rtt < 200) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      <div className="container-custom py-12">
        {/* Back Button */}
        <Link 
          href="/tools/network-tools"
          className="inline-flex items-center gap-2 text-neural-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Network Tools
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <RouteIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Traceroute</span>
          </h1>
          <p className="text-xl text-neural-300 max-w-2xl mx-auto">
            Trace the network path to a destination
          </p>
        </div>

        {/* Traceroute Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleTraceroute} className="relative">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neural-400" />
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="Enter hostname or IP address (e.g., google.com)"
                className="w-full pl-12 pr-32 py-4 bg-neural-800 border-2 border-neural-700 rounded-xl text-white placeholder-neural-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !host.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:from-neural-700 disabled:to-neural-700 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Tracing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Trace
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Destination Card */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-2xl p-6 border border-yellow-500/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Destination</h2>
                  <p className="text-2xl font-mono text-white">{result.destination}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center px-6 py-3 bg-yellow-500/20 rounded-xl">
                    <p className="text-sm text-neural-300 mb-1">Total Hops</p>
                    <p className="text-2xl font-bold text-yellow-400">{result.hops.length}</p>
                  </div>
                  <div className={`text-center px-6 py-3 ${result.completed ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-xl`}>
                    <p className="text-sm text-neural-300 mb-1">Status</p>
                    <p className={`text-sm font-bold ${result.completed ? 'text-green-400' : 'text-red-400'}`}>
                      {result.completed ? 'Completed' : 'Incomplete'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hops */}
            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
              <h3 className="text-lg font-semibold text-white mb-6">Route Hops</h3>
              <div className="space-y-3">
                {result.hops.map((hop, idx) => (
                  <div key={idx} className="bg-neural-900/50 rounded-lg p-4 border border-neural-700/50">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-yellow-400 font-bold">{hop.hop}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          {hop.ip ? (
                            <>
                              <p className="text-white font-mono text-sm truncate">{hop.ip}</p>
                              {hop.hostname && hop.hostname !== hop.ip && (
                                <p className="text-neural-400 text-xs mt-1 truncate">{hop.hostname}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-neural-500 text-sm">* * * Request timed out</p>
                          )}
                        </div>
                      </div>
                      
                      {hop.avgRtt && (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-neural-400 mb-1">Round Trip Time</p>
                            <div className="flex gap-2">
                              {hop.rtt1 && (
                                <span className={`text-sm font-mono ${getRttColor(hop.rtt1)}`}>
                                  {hop.rtt1.toFixed(1)}ms
                                </span>
                              )}
                              {hop.rtt2 && (
                                <span className={`text-sm font-mono ${getRttColor(hop.rtt2)}`}>
                                  {hop.rtt2.toFixed(1)}ms
                                </span>
                              )}
                              {hop.rtt3 && (
                                <span className={`text-sm font-mono ${getRttColor(hop.rtt3)}`}>
                                  {hop.rtt3.toFixed(1)}ms
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-center px-4 py-2 bg-neural-800 rounded-lg">
                            <p className="text-xs text-neural-400 mb-1">Avg</p>
                            <p className={`text-lg font-bold ${getRttColor(hop.avgRtt)}`}>
                              {hop.avgRtt.toFixed(1)}ms
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
              <h3 className="text-lg font-semibold text-white mb-4">About Traceroute</h3>
              <div className="space-y-3 text-neural-300">
                <p>Traceroute shows the path network packets take to reach a destination. This tool helps you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Identify the route to a destination</li>
                  <li>Locate network bottlenecks</li>
                  <li>Troubleshoot connectivity issues</li>
                  <li>Measure latency at each hop</li>
                  <li>Identify routing problems</li>
                </ul>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-200">
                    <strong>Note:</strong> Some routers may not respond to traceroute requests, resulting in timeouts (*).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
