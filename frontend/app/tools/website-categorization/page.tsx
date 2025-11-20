'use client'

import { useState } from 'react'
import { ArrowLeft, Tag, Loader2, AlertCircle, Globe } from 'lucide-react'
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
      console.error('Categorization error:', err)
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
            href="/tools/network-tools" 
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Network Tools
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Website Categorization
              </h1>
              <p className="text-gray-400 mt-1">
                Automatically classify websites into content categories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Input Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl mb-6">
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-2">
                Website URL or Domain
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., amazon.com or https://amazon.com"
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
                  Analyzing website...
                </>
              ) : (
                <>
                  <Tag className="w-5 h-5" />
                  Categorize Website
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

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Domain Header */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">{data.domain}</h2>
              </div>
              {data.description && (
                <p className="text-gray-400 mt-2">{data.description}</p>
              )}
            </div>

            {/* Primary Category */}
            {data.tier1 && (
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">Primary Category</h3>
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{data.tier1}</div>
                </div>
              </div>
            )}

            {/* Secondary Categories */}
            {data.tier2 && data.tier2.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">Secondary Categories</h3>
                <div className="flex flex-wrap gap-3">
                  {data.tier2.map((category, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-white font-medium"
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Categories */}
            {data.categories && data.categories.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">All Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {data.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-full text-sm text-gray-300"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-2">About Website Categorization</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            This tool uses the WHOIS XML API Website Categorization service to automatically classify websites into 
            content categories. Perfect for content filtering, parental controls, or market research! 🏷️
          </p>
        </div>
      </div>
    </div>
  )
}
