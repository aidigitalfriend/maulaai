'use client'

import { useState } from 'react'
import { ArrowLeft, Search, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function DomainResearchPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/domain-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const result = await response.json()
      if (!result.success) {
        setError(result.error || 'Failed to research domain')
        return
      }
      setData(result.data)
    } catch (err) {
      setError('An error occurred while researching domain')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Link href="/tools/network-tools" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Network Tools
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <span className="text-xl">🔎</span>
            Domain Research
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Domain Research Suite
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Comprehensive domain history and analysis
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6">
          <form onSubmit={handleResearch} className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">Domain Name</label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., google.com"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Researching...</> : <><Search className="w-5 h-5" />Research Domain</>}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-red-700">{error}</div>
            </div>
          )}
        </div>

        {data && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Domain Information</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Domain</div>
                  <div className="text-lg font-mono text-gray-900">{data.domain}</div>
                </div>
                {data.registrar && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Registrar</div>
                    <div className="text-lg text-gray-900">{data.registrar}</div>
                  </div>
                )}
                {data.createdDate && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Created Date</div>
                    <div className="text-lg text-gray-900">{new Date(data.createdDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-lg">
          <h3 className="font-semibold text-blue-700 mb-2">About Domain Research</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Get comprehensive domain history and analysis using WHOIS XML API Domain Research Suite. 🔍
          </p>
        </div>
      </div>
    </div>
  )
}
