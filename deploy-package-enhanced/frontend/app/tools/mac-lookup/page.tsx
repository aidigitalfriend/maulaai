'use client'

import { useState } from 'react'
import { ArrowLeft, Cpu, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function MACLookupPage() {
  const [mac, setMac] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mac.trim()) {
      setError('Please enter a MAC address')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/mac-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac: mac.trim() })
      })

      const result = await response.json()
      if (!result.success) {
        setError(result.error || 'Failed to lookup MAC address')
        return
      }
      setData(result.data)
    } catch (err) {
      setError('An error occurred while looking up MAC address')
    } finally {
      setLoading(false)
    }
  }

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
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                MAC Address Lookup
              </h1>
              <p className="text-gray-400 mt-1">Find manufacturer information for any MAC address</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl mb-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label htmlFor="mac" className="block text-sm font-medium text-gray-300 mb-2">MAC Address</label>
              <input
                type="text"
                id="mac"
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                placeholder="e.g., 00:1A:2B:3C:4D:5E"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Looking up...</> : <><Cpu className="w-5 h-5" />Lookup MAC</>}
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
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Vendor Information</h3>
            <div className="space-y-3">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Vendor</div>
                <div className="text-lg text-white">{data.vendor || 'Unknown'}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">MAC Address</div>
                <div className="text-lg font-mono text-white">{data.mac}</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-2">About MAC Lookup</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Identify hardware manufacturers from MAC addresses using WHOIS XML API. 🔍
          </p>
        </div>
      </div>
    </div>
  )
}
