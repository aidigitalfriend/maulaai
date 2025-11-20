'use client'

import { useState } from 'react'
import { FileText, Search, Loader2, XCircle, ArrowLeft, Calendar, User, Globe, Server } from 'lucide-react'
import Link from 'next/link'

interface WhoisResult {
  domain: string
  registrar?: string
  createdDate?: string
  expiryDate?: string
  updatedDate?: string
  nameServers?: string[]
  status?: string[]
  registrantOrg?: string
  registrantCountry?: string
  raw?: string
}

export default function WhoisLookupPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WhoisResult | null>(null)
  const [error, setError] = useState('')

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/whois-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to perform WHOIS lookup')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
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
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            WHOIS <span className="text-gradient bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Lookup</span>
          </h1>
          <p className="text-xl text-neural-300 max-w-2xl mx-auto">
            Get domain registration and ownership information
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleLookup} className="relative">
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neural-400" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain name (e.g., example.com)"
                className="w-full pl-12 pr-32 py-4 bg-neural-800 border-2 border-neural-700 rounded-xl text-white placeholder-neural-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !domain.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-neural-700 disabled:to-neural-700 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Lookup
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
            {/* Domain Info Card */}
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20">
              <h2 className="text-xl font-bold text-white mb-2">Domain</h2>
              <p className="text-2xl font-mono text-white">{result.domain}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Registrar */}
              {result.registrar && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Server className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Registrar</h3>
                  </div>
                  <p className="text-neural-200">{result.registrar}</p>
                </div>
              )}

              {/* Registrant Organization */}
              {result.registrantOrg && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Organization</h3>
                  </div>
                  <p className="text-neural-200">{result.registrantOrg}</p>
                  {result.registrantCountry && (
                    <p className="text-sm text-neural-400 mt-2">{result.registrantCountry}</p>
                  )}
                </div>
              )}

              {/* Created Date */}
              {result.createdDate && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Created</h3>
                  </div>
                  <p className="text-neural-200">{new Date(result.createdDate).toLocaleDateString()}</p>
                </div>
              )}

              {/* Expiry Date */}
              {result.expiryDate && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Expires</h3>
                  </div>
                  <p className="text-neural-200">{new Date(result.expiryDate).toLocaleDateString()}</p>
                </div>
              )}

              {/* Updated Date */}
              {result.updatedDate && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Updated</h3>
                  </div>
                  <p className="text-neural-200">{new Date(result.updatedDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Name Servers */}
            {result.nameServers && result.nameServers.length > 0 && (
              <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                <h3 className="text-lg font-semibold text-white mb-4">Name Servers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.nameServers.map((ns, idx) => (
                    <div key={idx} className="bg-neural-900/50 rounded-lg p-3 border border-neural-700/50">
                      <p className="text-white font-mono text-sm">{ns}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            {result.status && result.status.length > 0 && (
              <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                <h3 className="text-lg font-semibold text-white mb-4">Domain Status</h3>
                <div className="flex flex-wrap gap-2">
                  {result.status.map((status, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-neural-900/50 border border-neural-700/50 rounded-full text-sm text-neural-200"
                    >
                      {status}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Raw WHOIS Data */}
            {result.raw && (
              <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                <h3 className="text-lg font-semibold text-white mb-4">Raw WHOIS Data</h3>
                <div className="bg-neural-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-neural-300 font-mono whitespace-pre-wrap">{result.raw}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
              <h3 className="text-lg font-semibold text-white mb-4">About WHOIS Lookup</h3>
              <div className="space-y-3 text-neural-300">
                <p>WHOIS is a protocol that provides information about domain registrations. This tool helps you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Check domain availability and registration status</li>
                  <li>Find domain registrar information</li>
                  <li>View registration and expiration dates</li>
                  <li>Identify name servers</li>
                  <li>Check domain ownership details (where available)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
