'use client'

import { useState } from 'react'
import { ArrowLeft, Tag, Loader2, XCircle, Globe, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface CategoryData {
  domain: string
  categories: string[]
  tier1: string
  tier2: string[]
  description: string
}

export default function WebsiteCategorizationPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<CategoryData | null>(null)

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) {
      setError('Please enter a domain or URL')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/website-categorization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })
      const result = await response.json()
      if (!result.success) {
        setError(result.error || 'Failed to categorize website')
        return
      }
      setData(result.data)
    } catch (err: any) {
      setError('An error occurred while categorizing the website')
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
            <span className="text-xl">📂</span>
            Categorization
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Website Categorization
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Automatically classify websites into content categories
          </p>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleCheck} className="relative">
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
              <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain (e.g., amazon.com)"
                className="w-full pl-12 pr-36 py-4 bg-white border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-0 transition-all outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !domain.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:from-gray-400 disabled:to-gray-400 rounded-lg font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : <><Tag className="w-4 h-4" />Categorize</>}
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {data && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Domain</h2>
              </div>
              <p className="text-2xl font-mono text-gray-900">{data.domain}</p>
              {data.description && <p className="text-gray-600 mt-2">{data.description}</p>}
            </div>

            {data.tier1 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Primary Category
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{data.tier1}</div>
                </div>
              </div>
            )}

            {data.tier2 && data.tier2.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-500" />
                  Secondary Categories
                </h3>
                <div className="flex flex-wrap gap-3">
                  {data.tier2.map((category, index) => (
                    <div key={index} className="px-4 py-2 bg-blue-100 border border-blue-200 rounded-lg text-blue-800 font-medium">
                      {category}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.categories && data.categories.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {data.categories.map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!data && !loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Website Categorization</h3>
              <div className="space-y-3 text-gray-600">
                <p>Automatically classify websites into content categories. Perfect for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Content filtering and parental controls</li>
                  <li>Market research and competitive analysis</li>
                  <li>Ad targeting and brand safety</li>
                  <li>Network security policies</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
