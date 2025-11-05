'use client'

import { useState } from 'react'
import { Globe, Search, Loader2, CheckCircle, XCircle, Info, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface DnsRecord {
  type: string
  value: string
  ttl?: number
  priority?: number
}

interface DnsResult {
  domain: string
  records: {
    A?: DnsRecord[]
    AAAA?: DnsRecord[]
    MX?: DnsRecord[]
    NS?: DnsRecord[]
    TXT?: DnsRecord[]
    CNAME?: DnsRecord[]
    SOA?: any
  }
}

export default function DnsLookupPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DnsResult | null>(null)
  const [error, setError] = useState('')

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/dns-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to perform DNS lookup')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const RecordSection = ({ title, records, type }: { title: string, records?: DnsRecord[], type: string }) => {
    if (!records || records.length === 0) return null

    return (
      <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          {title} Records
        </h3>
        <div className="space-y-3">
          {records.map((record, idx) => (
            <div key={idx} className="bg-neural-900/50 rounded-lg p-4 border border-neural-700/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neural-400 mb-1">Value</p>
                  <p className="text-white font-mono text-sm break-all">{record.value}</p>
                </div>
                {record.ttl && (
                  <div className="flex-shrink-0">
                    <p className="text-sm text-neural-400 mb-1">TTL</p>
                    <p className="text-brand-400 font-semibold">{record.ttl}s</p>
                  </div>
                )}
                {record.priority !== undefined && (
                  <div className="flex-shrink-0">
                    <p className="text-sm text-neural-400 mb-1">Priority</p>
                    <p className="text-brand-400 font-semibold">{record.priority}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
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
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Globe className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            DNS <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Lookup</span>
          </h1>
          <p className="text-xl text-neural-300 max-w-2xl mx-auto">
            Perform DNS queries and check domain name system records
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
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-neural-700 disabled:to-neural-700 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
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
            {/* Domain Info */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Info className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Domain Information</h2>
              </div>
              <p className="text-2xl font-mono text-white">{result.domain}</p>
            </div>

            {/* DNS Records */}
            <RecordSection title="A (IPv4 Address)" records={result.records.A} type="A" />
            <RecordSection title="AAAA (IPv6 Address)" records={result.records.AAAA} type="AAAA" />
            <RecordSection title="MX (Mail Exchange)" records={result.records.MX} type="MX" />
            <RecordSection title="NS (Name Server)" records={result.records.NS} type="NS" />
            <RecordSection title="TXT (Text)" records={result.records.TXT} type="TXT" />
            <RecordSection title="CNAME (Canonical Name)" records={result.records.CNAME} type="CNAME" />

            {/* SOA Record */}
            {result.records.SOA && (
              <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  SOA (Start of Authority) Record
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.records.SOA).map(([key, value]) => (
                    <div key={key} className="bg-neural-900/50 rounded-lg p-4 border border-neural-700/50">
                      <p className="text-sm text-neural-400 mb-1">{key}</p>
                      <p className="text-white font-mono text-sm">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
              <h3 className="text-lg font-semibold text-white mb-4">About DNS Lookup</h3>
              <div className="space-y-3 text-neural-300">
                <p>DNS (Domain Name System) translates human-readable domain names into IP addresses. This tool helps you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Query A, AAAA, MX, NS, TXT, and CNAME records</li>
                  <li>Check mail server configuration (MX records)</li>
                  <li>View name servers for a domain</li>
                  <li>Inspect TXT records for SPF, DKIM, and verification</li>
                  <li>Verify DNS propagation</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
