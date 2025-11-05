'use client'

import { useState } from 'react'
import { Shield, Search, Loader2, XCircle, ArrowLeft, CheckCircle, AlertTriangle, Calendar, Globe } from 'lucide-react'
import Link from 'next/link'

interface SslResult {
  domain: string
  valid: boolean
  issuer?: string
  subject?: string
  validFrom?: string
  validTo?: string
  daysRemaining?: number
  serialNumber?: string
  signatureAlgorithm?: string
  keySize?: number
  protocol?: string
  subjectAltNames?: string[]
  warning?: string
}

export default function SslCheckerPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SslResult | null>(null)
  const [error, setError] = useState('')

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/ssl-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to check SSL certificate')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const getCertificateStatus = () => {
    if (!result) return null
    
    if (!result.valid) {
      return { color: 'red', text: 'Invalid', icon: XCircle }
    }
    
    if (result.daysRemaining !== undefined) {
      if (result.daysRemaining < 0) {
        return { color: 'red', text: 'Expired', icon: XCircle }
      } else if (result.daysRemaining < 30) {
        return { color: 'yellow', text: 'Expiring Soon', icon: AlertTriangle }
      }
    }
    
    return { color: 'green', text: 'Valid', icon: CheckCircle }
  }

  const status = getCertificateStatus()

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
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            SSL Certificate <span className="text-gradient bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Checker</span>
          </h1>
          <p className="text-xl text-neural-300 max-w-2xl mx-auto">
            Verify SSL/TLS certificate validity and security
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleCheck} className="relative">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-neural-700 disabled:to-neural-700 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Check
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
        {result && status && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Status Card */}
            <div className={`bg-gradient-to-br from-${status.color}-500/10 to-${status.color}-600/10 rounded-2xl p-6 border border-${status.color}-500/20`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Certificate Status</h2>
                  <p className="text-2xl font-mono text-white">{result.domain}</p>
                </div>
                <div className={`flex items-center gap-3 px-6 py-3 bg-${status.color}-500/20 rounded-xl`}>
                  <status.icon className={`w-6 h-6 text-${status.color}-400`} />
                  <span className={`text-xl font-bold text-${status.color}-400`}>{status.text}</span>
                </div>
              </div>
              
              {result.daysRemaining !== undefined && result.daysRemaining >= 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-700/50">
                  <p className="text-neural-300">
                    <span className="font-semibold">{result.daysRemaining}</span> days until expiration
                  </p>
                </div>
              )}

              {result.warning && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-200 text-sm">{result.warning}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Issuer */}
              {result.issuer && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Issued By</h3>
                  <p className="text-neural-200">{result.issuer}</p>
                </div>
              )}

              {/* Subject */}
              {result.subject && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Issued To</h3>
                  <p className="text-neural-200">{result.subject}</p>
                </div>
              )}

              {/* Valid From */}
              {result.validFrom && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-teal-400" />
                    <h3 className="text-lg font-semibold text-white">Valid From</h3>
                  </div>
                  <p className="text-neural-200">{new Date(result.validFrom).toLocaleString()}</p>
                </div>
              )}

              {/* Valid To */}
              {result.validTo && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Valid To</h3>
                  </div>
                  <p className="text-neural-200">{new Date(result.validTo).toLocaleString()}</p>
                </div>
              )}

              {/* Serial Number */}
              {result.serialNumber && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Serial Number</h3>
                  <p className="text-neural-200 font-mono text-sm break-all">{result.serialNumber}</p>
                </div>
              )}

              {/* Signature Algorithm */}
              {result.signatureAlgorithm && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Signature Algorithm</h3>
                  <p className="text-neural-200">{result.signatureAlgorithm}</p>
                </div>
              )}

              {/* Key Size */}
              {result.keySize && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Key Size</h3>
                  <p className="text-neural-200">{result.keySize} bits</p>
                </div>
              )}

              {/* Protocol */}
              {result.protocol && (
                <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Protocol</h3>
                  <p className="text-neural-200">{result.protocol}</p>
                </div>
              )}
            </div>

            {/* Subject Alternative Names */}
            {result.subjectAltNames && result.subjectAltNames.length > 0 && (
              <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                <h3 className="text-lg font-semibold text-white mb-4">Subject Alternative Names</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.subjectAltNames.map((name, idx) => (
                    <div key={idx} className="bg-neural-900/50 rounded-lg p-3 border border-neural-700/50">
                      <p className="text-white font-mono text-sm">{name}</p>
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
              <h3 className="text-lg font-semibold text-white mb-4">About SSL Certificate Checker</h3>
              <div className="space-y-3 text-neural-300">
                <p>SSL/TLS certificates encrypt data between your browser and a website. This tool helps you:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Verify certificate validity and expiration</li>
                  <li>Check certificate issuer and authority</li>
                  <li>View encryption strength and protocol version</li>
                  <li>Inspect subject alternative names (SANs)</li>
                  <li>Identify potential security issues</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
