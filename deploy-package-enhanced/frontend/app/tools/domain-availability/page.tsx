'use client'

import { useState } from 'react'
import { ArrowLeft, Search, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface DomainCheck {
  domain: string
  available: boolean
  price?: string
}

export default function DomainAvailabilityPage() {
  const [domainInput, setDomainInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<DomainCheck[]>([])

  const extensions = ['.com', '.net', '.org', '.io', '.co', '.ai', '.dev']

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!domainInput.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      // Remove any existing extensions
      const baseDomain = domainInput.trim().toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '')
        .replace(/\.(com|net|org|io|co|ai|dev|info|biz)$/i, '')

      const response = await fetch('/api/tools/domain-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: baseDomain })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to check domain availability')
        return
      }

      setResults(result.data)
    } catch (err: any) {
      setError('An error occurred while checking domain availability')
      console.error('Domain check error:', err)
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
            href="/tools" 
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Network Tools
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Domain Availability Checker
              </h1>
              <p className="text-gray-400 mt-1">
                Check if your desired domain name is available for registration
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
                Domain Name (without extension)
              </label>
              <input
                type="text"
                id="domain"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g., myawesomesite"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-white placeholder-gray-500"
              />
              <p className="mt-2 text-sm text-gray-400">
                We'll check availability for popular extensions: {extensions.join(', ')}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking availability...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Check Availability
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
        {results.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">
              Availability Results
            </h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    result.available 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.available ? (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-lg text-white">{result.domain}</div>
                      <div className={`text-sm ${result.available ? 'text-green-400' : 'text-red-400'}`}>
                        {result.available ? 'Available for registration! 🎉' : 'Already registered'}
                      </div>
                    </div>
                  </div>
                  {result.available && (
                    <a
                      href={`https://www.namecheap.com/domains/registration/results/?domain=${result.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg text-sm font-medium transition-all"
                    >
                      Register
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-2">About Domain Availability Checker</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            This tool uses the WHOIS XML API Domain Availability service to check if domain names are available for registration 
            across popular TLDs. Get instant results for multiple extensions to find your perfect domain name! 🔍
          </p>
        </div>
      </div>
    </div>
  )
}
