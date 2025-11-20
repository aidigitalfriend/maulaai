'use client'

import { useState } from 'react'
import { Activity, Search, Loader2, XCircle, ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface PingResult {
  host: string
  alive: boolean
  time?: number
  min?: number
  max?: number
  avg?: number
  packetLoss?: number
  packets?: number
}

export default function PingTestPage() {
  const [host, setHost] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PingResult | null>(null)
  const [error, setError] = useState('')

  const handlePing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!host.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/ping-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: host.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to ping host')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const getLatencyColor = (latency?: number) => {
    if (!latency) return 'neural'
    if (latency < 50) return 'green'
    if (latency < 100) return 'yellow'
    if (latency < 200) return 'orange'
    return 'red'
  }

  const latencyColor = getLatencyColor(result?.avg)

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
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ping <span className="text-gradient bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Test</span>
          </h1>
          <p className="text-xl text-neural-300 max-w-2xl mx-auto">
            Test network connectivity and measure latency
          </p>
        </div>

        {/* Ping Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handlePing} className="relative">
            <div className="relative">
              <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neural-400" />
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
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-neural-700 disabled:to-neural-700 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Pinging...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Ping
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
            {/* Status Card */}
            <div className={`bg-gradient-to-br from-${result.alive ? 'green' : 'red'}-500/10 to-${result.alive ? 'emerald' : 'red'}-600/10 rounded-2xl p-6 border border-${result.alive ? 'green' : 'red'}-500/20`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Host Status</h2>
                  <p className="text-2xl font-mono text-white">{result.host}</p>
                </div>
                <div className={`flex items-center gap-3 px-6 py-3 bg-${result.alive ? 'green' : 'red'}-500/20 rounded-xl`}>
                  {result.alive ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <span className="text-xl font-bold text-green-400">Online</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-400" />
                      <span className="text-xl font-bold text-red-400">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {result.alive && (
              <>
                {/* Latency Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Average */}
                  <div className={`bg-neural-800/50 rounded-xl p-6 border border-neural-700`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 bg-${latencyColor}-500/20 rounded-lg flex items-center justify-center`}>
                        <Clock className={`w-5 h-5 text-${latencyColor}-400`} />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Average</h3>
                    </div>
                    <p className={`text-3xl font-bold text-${latencyColor}-400`}>
                      {result.avg?.toFixed(2)} ms
                    </p>
                  </div>

                  {/* Min */}
                  <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Min</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-400">
                      {result.min?.toFixed(2)} ms
                    </p>
                  </div>

                  {/* Max */}
                  <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Max</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-400">
                      {result.max?.toFixed(2)} ms
                    </p>
                  </div>

                  {/* Packet Loss */}
                  <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 bg-${result.packetLoss === 0 ? 'green' : 'red'}-500/20 rounded-lg flex items-center justify-center`}>
                        <Activity className={`w-5 h-5 text-${result.packetLoss === 0 ? 'green' : 'red'}-400`} />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Packet Loss</h3>
                    </div>
                    <p className={`text-3xl font-bold text-${result.packetLoss === 0 ? 'green' : 'red'}-400`}>
                      {result.packetLoss?.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Performance Assessment</h3>
                  <div className="space-y-3">
                    {result.avg !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neural-300">Latency</span>
                          <span className={`text-${latencyColor}-400 font-semibold`}>
                            {result.avg < 50 ? 'Excellent' : result.avg < 100 ? 'Good' : result.avg < 200 ? 'Fair' : 'Poor'}
                          </span>
                        </div>
                        <div className="w-full bg-neural-700 rounded-full h-2">
                          <div 
                            className={`bg-${latencyColor}-500 h-2 rounded-full transition-all`}
                            style={{ width: `${Math.min((200 - (result.avg || 0)) / 2, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
              <h3 className="text-lg font-semibold text-white mb-4">About Ping Test</h3>
              <div className="space-y-3 text-neural-300">
                <p>Ping tests network connectivity by sending packets to a host and measuring response time. This tool helps you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Check if a host is reachable</li>
                  <li>Measure network latency (round-trip time)</li>
                  <li>Detect packet loss</li>
                  <li>Troubleshoot network connectivity issues</li>
                  <li>Monitor network performance</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-200">
                    <strong>Latency Guide:</strong> {"<"}50ms (Excellent), 50-100ms (Good), 100-200ms (Fair), {">"}200ms (Poor)
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
