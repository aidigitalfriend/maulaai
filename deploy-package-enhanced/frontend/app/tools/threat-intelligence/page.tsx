'use client'

import { useState } from 'react'
import { ArrowLeft, Shield, Loader2, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ThreatData {
  domain: string
  riskScore: number
  threatTypes: string[]
  isMalicious: boolean
  details: {
    phishing: boolean
    malware: boolean
    spam: boolean
    suspicious: boolean
  }
}

export default function ThreatIntelligencePage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<ThreatData | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!domain.trim()) {
      setError('Please enter a domain or IP address')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/threat-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to scan for threats')
        return
      }

      setData(result.data)
    } catch (err: any) {
      setError('An error occurred while scanning for threats')
      console.error('Threat scan error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400 border-red-500/50 bg-red-500/10'
    if (score >= 40) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10'
    return 'text-green-400 border-green-500/50 bg-green-500/10'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Network Tools
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Threat Intelligence Scanner
              </h1>
              <p className="text-gray-400 mt-1">
                Scan domains and IPs for security threats and malicious activity
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl mb-6">
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-2">
                Domain or IP Address
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., example.com or 8.8.8.8"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning for threats...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Scan for Threats
                </>
              )}
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
            {/* Risk Score */}
            <div className={`rounded-2xl p-6 border ${getRiskColor(data.riskScore)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Risk Score</h3>
                  <p className="text-sm opacity-80">
                    {data.isMalicious ? 'High risk detected! ⚠️' : 'Low risk detected ✓'}
                  </p>
                </div>
                <div className="text-5xl font-bold">{data.riskScore}</div>
              </div>
            </div>

            {/* Threat Details */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">Threat Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${data.details.phishing ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-900/50 border-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    {data.details.phishing ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
                    <span className="font-medium">Phishing</span>
                  </div>
                  <p className="text-sm mt-1 opacity-70">{data.details.phishing ? 'Detected' : 'Not detected'}</p>
                </div>
                <div className={`p-4 rounded-lg border ${data.details.malware ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-900/50 border-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    {data.details.malware ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
                    <span className="font-medium">Malware</span>
                  </div>
                  <p className="text-sm mt-1 opacity-70">{data.details.malware ? 'Detected' : 'Not detected'}</p>
                </div>
                <div className={`p-4 rounded-lg border ${data.details.spam ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-900/50 border-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    {data.details.spam ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
                    <span className="font-medium">Spam</span>
                  </div>
                  <p className="text-sm mt-1 opacity-70">{data.details.spam ? 'Detected' : 'Not detected'}</p>
                </div>
                <div className={`p-4 rounded-lg border ${data.details.suspicious ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-gray-900/50 border-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    {data.details.suspicious ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
                    <span className="font-medium">Suspicious Activity</span>
                  </div>
                  <p className="text-sm mt-1 opacity-70">{data.details.suspicious ? 'Detected' : 'Not detected'}</p>
                </div>
              </div>
            </div>

            {data.threatTypes.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">Identified Threats</h3>
                <div className="flex flex-wrap gap-2">
                  {data.threatTypes.map((threat, index) => (
                    <span key={index} className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-sm text-red-300">
                      {threat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-2">About Threat Intelligence</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            This tool uses the WHOIS XML API Threat Intelligence service to analyze domains and IP addresses for 
            security threats including phishing, malware, spam, and suspicious activity. 🛡️
          </p>
        </div>
      </div>
    </div>
  )
}
