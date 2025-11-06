'use client'

import { useState } from 'react'
import { ArrowLeft, Server, Loader2, AlertCircle, Copy, Check } from 'lucide-react'
import Link from 'next/link'

interface DNSRecord {
  type: string
  name: string
  value: string
  ttl?: number
  priority?: number
}

interface DNSData {
  domain: string
  records: {
    A: DNSRecord[]
    AAAA: DNSRecord[]
    MX: DNSRecord[]
    NS: DNSRecord[]
    TXT: DNSRecord[]
    SOA: DNSRecord[]
    CNAME: DNSRecord[]
  }
}

export default function DNSLookupAdvancedPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<DNSData | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await fetch('/api/tools/dns-lookup-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to fetch DNS records')
        return
      }

      setData(result.data)
    } catch (err: any) {
      setError('An error occurred while fetching DNS records')
      console.error('DNS lookup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderRecordSection = (type: string, records: DNSRecord[]) => {
    if (!records || records.length === 0) return null

    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-cyan-400">
          <Server className="w-5 h-5" />
          {type} Records
        </h3>
        <div className="space-y-3">
          {records.map((record, index) => (
            <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {record.name && record.name !== domain && (
                    <div>
                      <span className="text-sm text-gray-400">Name: </span>
                      <span className="text-white font-mono">{record.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-400">Value: </span>
                    <span className="text-white font-mono break-all">{record.value}</span>
                  </div>
                  {record.priority !== undefined && (
                    <div>
                      <span className="text-sm text-gray-400">Priority: </span>
                      <span className="text-white">{record.priority}</span>
                    </div>
                  )}
                  {record.ttl && (
                    <div>
                      <span className="text-sm text-gray-400">TTL: </span>
                      <span className="text-white">{record.ttl}s</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => copyToClipboard(record.value, `${type}-${index}`)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                  title="Copy to clipboard"
                >
                  {copiedIndex === `${type}-${index}` ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
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
              <Server className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                DNS Lookup API
              </h1>
              <p className="text-gray-400 mt-1">
                Get comprehensive DNS records for any domain
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Input Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl mb-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-2">
                Domain Name
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., google.com"
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
                  Looking up DNS records...
                </>
              ) : (
                <>
                  <Server className="w-5 h-5" />
                  Lookup DNS Records
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
              <h2 className="text-2xl font-bold text-white mb-2">DNS Records for {data.domain}</h2>
              <p className="text-gray-400">Complete DNS configuration and nameserver records</p>
            </div>

            {/* DNS Record Sections */}
            {renderRecordSection('A', data.records.A)}
            {renderRecordSection('AAAA', data.records.AAAA)}
            {renderRecordSection('MX', data.records.MX)}
            {renderRecordSection('NS', data.records.NS)}
            {renderRecordSection('TXT', data.records.TXT)}
            {renderRecordSection('CNAME', data.records.CNAME)}
            {renderRecordSection('SOA', data.records.SOA)}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-2">About DNS Lookup API</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            This tool uses the WHOIS XML API DNS Lookup service to retrieve comprehensive DNS records including A, AAAA, MX, NS, TXT, CNAME, and SOA records. 
            Get complete DNS configuration data for any domain instantly.
          </p>
        </div>
      </div>
    </div>
  )
}
