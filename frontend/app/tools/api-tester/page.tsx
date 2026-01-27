'use client'

import { useState, useRef } from 'react'
import { Send, Plus, Trash2, Copy, Clock, ArrowLeft, Zap, Code, Shield, Globe } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface Header {
  id: string
  key: string
  value: string
  enabled: boolean
}

interface QueryParam {
  id: string
  key: string
  value: string
  enabled: boolean
}

interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  time?: number
}

const quickPresets = [
  {
    name: 'JSONPlaceholder - Get Posts',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts'
  },
  {
    name: 'JSONPlaceholder - Create Post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    body: JSON.stringify({ title: 'Test Post', body: 'Test content', userId: 1 }, null, 2),
    headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }]
  },
  {
    name: 'GitHub API - Get User',
    method: 'GET',
    url: 'https://api.github.com/users/github'
  },
  {
    name: 'REST Countries - Get Country',
    method: 'GET',
    url: 'https://restcountries.com/v3.1/name/canada'
  },
  {
    name: 'Cat Facts API',
    method: 'GET',
    url: 'https://catfact.ninja/fact'
  }
]

const methodColors: Record<string, string> = {
  GET: 'text-emerald-400',
  POST: 'text-blue-400',
  PUT: 'text-amber-400',
  PATCH: 'text-orange-400',
  DELETE: 'text-red-400',
  HEAD: 'text-purple-400',
  OPTIONS: 'text-pink-400'
}

export default function ApiTesterPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [authType, setAuthType] = useState('none')
  const [bearerToken, setBearerToken] = useState('')
  const [basicUsername, setBasicUsername] = useState('')
  const [basicPassword, setBasicPassword] = useState('')
  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key')
  const [apiKeyValue, setApiKeyValue] = useState('')
  const [headers, setHeaders] = useState<Header[]>([])
  const [queryParams, setQueryParams] = useState<QueryParam[]>([])
  const [bodyType, setBodyType] = useState('json')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // GSAP Animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Hero animations
    tl.fromTo('.hero-badge', 
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6 }
    )
    .fromTo('.hero-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.3'
    )
    .fromTo('.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .fromTo('.hero-features span',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
      '-=0.3'
    )

    // Cards stagger animation
    gsap.fromTo('.glass-card',
      { opacity: 0, y: 40, scale: 0.95 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.5
      }
    )

    // Floating orbs animation
    gsap.to('.floating-orb-1', {
      y: -20,
      x: 10,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    gsap.to('.floating-orb-2', {
      y: 15,
      x: -15,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    gsap.to('.floating-orb-3', {
      y: -25,
      x: -10,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  const addHeader = () => {
    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '', enabled: true }])
  }

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id))
  }

  const updateHeader = (id: string, field: keyof Header, value: string | boolean) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h))
  }

  const addQueryParam = () => {
    setQueryParams([...queryParams, { id: Date.now().toString(), key: '', value: '', enabled: true }])
  }

  const removeQueryParam = (id: string) => {
    setQueryParams(queryParams.filter(q => q.id !== id))
  }

  const updateQueryParam = (id: string, field: keyof QueryParam, value: string | boolean) => {
    setQueryParams(queryParams.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const loadPreset = (preset: typeof quickPresets[0]) => {
    setMethod(preset.method)
    setUrl(preset.url)
    if (preset.body) {
      setBody(preset.body)
      setBodyType('json')
    } else {
      setBody('')
    }
    if (preset.headers) {
      setHeaders(preset.headers)
    } else {
      setHeaders([])
    }
    setQueryParams([])
    setAuthType('none')
    setResponse(null)
    setError('')
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(body)
      setBody(JSON.stringify(parsed, null, 2))
    } catch (e) {
      // Invalid JSON, don't format
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSend = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      // Build full URL with query params
      const enabledParams = queryParams.filter(q => q.enabled && q.key)
      let fullUrl = url
      if (enabledParams.length > 0) {
        const params = new URLSearchParams()
        enabledParams.forEach(p => params.append(p.key, p.value))
        fullUrl += (url.includes('?') ? '&' : '?') + params.toString()
      }

      // Build headers
      const requestHeaders: Record<string, string> = {}
      headers.filter(h => h.enabled && h.key).forEach(h => {
        requestHeaders[h.key] = h.value
      })

      // Add auth headers
      if (authType === 'bearer' && bearerToken) {
        requestHeaders['Authorization'] = `Bearer ${bearerToken}`
      } else if (authType === 'basic' && basicUsername && basicPassword) {
        const encoded = btoa(`${basicUsername}:${basicPassword}`)
        requestHeaders['Authorization'] = `Basic ${encoded}`
      } else if (authType === 'apikey' && apiKeyHeader && apiKeyValue) {
        requestHeaders[apiKeyHeader] = apiKeyValue
      }

      // Prepare body
      let requestBody: any = undefined
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        if (bodyType === 'json') {
          requestHeaders['Content-Type'] = 'application/json'
          requestBody = body
        } else if (bodyType === 'form') {
          requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
          requestBody = body
        } else {
          requestBody = body
        }
      }

      const startTime = Date.now()
      const res = await fetch('/api/tools/api-tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url: fullUrl,
          headers: requestHeaders,
          body: requestBody
        })
      })

      const endTime = Date.now()
      const data = await res.json()

      if (res.ok) {
        setResponse({
          status: data.data?.status || data.status || 0,
          statusText: data.data?.statusText || data.statusText || 'Unknown',
          headers: data.data?.headers || data.headers || {},
          data: data.data?.data || data.data || null,
          time: endTime - startTime
        })
      } else {
        setError(data.error || 'Request failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        {/* Floating orbs */}
        <div className="floating-orb-1 absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="floating-orb-2 absolute top-1/2 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="floating-orb-3 absolute bottom-1/4 left-1/2 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/5 via-transparent to-purple-900/5" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-16 md:py-24 overflow-hidden">
        {/* Hero background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-500/20 via-purple-500/10 to-transparent blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link 
            href="/tools/network-tools" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-all duration-300 hover:gap-3 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Network Tools
          </Link>

          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/10">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              Professional API Testing
            </span>
          </div>

          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              API Tester
            </span>
          </h1>

          <p className="hero-subtitle text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-10">
            Test, debug, and explore APIs with powerful presets and advanced authentication options
          </p>

          <div className="hero-features flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" />
              All HTTP Methods
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Multiple Auth Types
            </span>
            <span className="flex items-center gap-2">
              <Code className="w-4 h-4 text-fuchsia-400" />
              JSON Formatting
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div ref={cardsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Quick Presets */}
            <div className="glass-card group relative rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30"
                 style={{
                   background: 'rgba(255,255,255,0.03)',
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-400" />
                  Quick Presets
                </h2>
                <select
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                  onChange={(e) => {
                    const preset = quickPresets[parseInt(e.target.value)]
                    if (preset) loadPreset(preset)
                  }}
                  defaultValue=""
                >
                  <option value="" disabled className="bg-[#1a1a1a]">Select a preset...</option>
                  {quickPresets.map((preset, idx) => (
                    <option key={idx} value={idx} className="bg-[#1a1a1a]">{preset.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* URL and Method */}
            <div className="glass-card group relative rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30"
                 style={{
                   background: 'rgba(255,255,255,0.03)',
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-violet-400" />
                  Request
                </h2>
                <div className="flex gap-3">
                  <select
                    className={`w-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer ${methodColors[method]}`}
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="GET" className="bg-[#1a1a1a] text-emerald-400">GET</option>
                    <option value="POST" className="bg-[#1a1a1a] text-blue-400">POST</option>
                    <option value="PUT" className="bg-[#1a1a1a] text-amber-400">PUT</option>
                    <option value="PATCH" className="bg-[#1a1a1a] text-orange-400">PATCH</option>
                    <option value="DELETE" className="bg-[#1a1a1a] text-red-400">DELETE</option>
                    <option value="HEAD" className="bg-[#1a1a1a] text-purple-400">HEAD</option>
                    <option value="OPTIONS" className="bg-[#1a1a1a] text-pink-400">OPTIONS</option>
                  </select>
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    placeholder="https://api.example.com/endpoint"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Authentication */}
            <div className="glass-card group relative rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30"
                 style={{
                   background: 'rgba(255,255,255,0.03)',
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-violet-400" />
                  Authentication
                </h2>
                <div className="space-y-4">
                  <select
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                  >
                    <option value="none" className="bg-[#1a1a1a]">No Auth</option>
                    <option value="bearer" className="bg-[#1a1a1a]">Bearer Token</option>
                    <option value="basic" className="bg-[#1a1a1a]">Basic Auth</option>
                    <option value="apikey" className="bg-[#1a1a1a]">API Key</option>
                  </select>

                  {authType === 'bearer' && (
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      placeholder="Token"
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                    />
                  )}

                  {authType === 'basic' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                        placeholder="Username"
                        value={basicUsername}
                        onChange={(e) => setBasicUsername(e.target.value)}
                      />
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                        placeholder="Password"
                        value={basicPassword}
                        onChange={(e) => setBasicPassword(e.target.value)}
                      />
                    </div>
                  )}

                  {authType === 'apikey' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                        placeholder="Header Name (e.g., X-API-Key)"
                        value={apiKeyHeader}
                        onChange={(e) => setApiKeyHeader(e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                        placeholder="API Key Value"
                        value={apiKeyValue}
                        onChange={(e) => setApiKeyValue(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Query Parameters */}
            <div className="glass-card group relative rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30"
                 style={{
                   background: 'rgba(255,255,255,0.03)',
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Globe className="w-5 h-5 text-violet-400" />
                    Query Parameters
                  </h2>
                  <button
                    onClick={addQueryParam}
                    className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg text-violet-300 text-sm font-medium flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {queryParams.length === 0 ? (
                    <p className="text-white/40 text-sm">No query parameters</p>
                  ) : (
                    queryParams.map((param) => (
                      <div key={param.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={param.enabled}
                          onChange={(e) => updateQueryParam(param.id, 'enabled', e.target.checked)}
                          className="w-4 h-4 rounded bg-white/10 border-white/20 text-violet-500 focus:ring-violet-500/30"
                        />
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                          placeholder="Key"
                          value={param.key}
                          onChange={(e) => updateQueryParam(param.id, 'key', e.target.value)}
                        />
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                          placeholder="Value"
                          value={param.value}
                          onChange={(e) => updateQueryParam(param.id, 'value', e.target.value)}
                        />
                        <button
                          onClick={() => removeQueryParam(param.id)}
                          className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Headers */}
            <div className="glass-card group relative rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30"
                 style={{
                   background: 'rgba(255,255,255,0.03)',
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="w-5 h-5 text-violet-400" />
                    Headers
                  </h2>
                  <button
                    onClick={addHeader}
                    className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg text-violet-300 text-sm font-medium flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {headers.length === 0 ? (
                    <p className="text-white/40 text-sm">No custom headers</p>
                  ) : (
                    headers.map((header) => (
                      <div key={header.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={header.enabled}
                          onChange={(e) => updateHeader(header.id, 'enabled', e.target.checked)}
                          className="w-4 h-4 rounded bg-white/10 border-white/20 text-violet-500 focus:ring-violet-500/30"
                        />
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                          placeholder="Key"
                          value={header.key}
                          onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                        />
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                          placeholder="Value"
                          value={header.value}
                          onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                        />
                        <button
                          onClick={() => removeHeader(header.id)}
                          className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="glass-card group relative rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30"
                   style={{
                     background: 'rgba(255,255,255,0.03)',
                     backdropFilter: 'blur(10px)',
                     border: '1px solid rgba(255,255,255,0.1)'
                   }}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Code className="w-5 h-5 text-violet-400" />
                      Request Body
                    </h2>
                    <div className="flex gap-2">
                      <select
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer"
                        value={bodyType}
                        onChange={(e) => setBodyType(e.target.value)}
                      >
                        <option value="json" className="bg-[#1a1a1a]">JSON</option>
                        <option value="text" className="bg-[#1a1a1a]">Raw Text</option>
                        <option value="form" className="bg-[#1a1a1a]">Form Data</option>
                        <option value="urlencoded" className="bg-[#1a1a1a]">URL Encoded</option>
                      </select>
                      {bodyType === 'json' && (
                        <button
                          onClick={formatJson}
                          className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg text-violet-300 text-sm font-medium transition-all"
                        >
                          Format
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 font-mono text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                    rows={10}
                    placeholder={
                      bodyType === 'json' 
                        ? '{\n  "key": "value"\n}'
                        : 'Request body...'
                    }
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={loading || !url.trim()}
              className="glass-card w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              style={{
                background: loading ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(168,85,247,0.3))',
                border: '1px solid rgba(139,92,246,0.4)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    Send Request
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Right Column - Response */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <div className="glass-card group relative rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30"
                 style={{
                   background: 'rgba(255,255,255,0.03)',
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="w-5 h-5 text-violet-400" />
                    Response
                  </h2>
                  {response && (
                    <button
                      onClick={copyResponse}
                      className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg text-violet-300 text-sm font-medium flex items-center gap-2 transition-all"
                    >
                      {copied ? <span>✓</span> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {response ? (
                  <div className="space-y-5">
                    {/* Status */}
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        response.status >= 200 && response.status < 300
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : response.status >= 400
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {response.status} {response.statusText}
                      </span>
                      {response.time !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Clock className="w-4 h-4" />
                          {response.time}ms
                        </div>
                      )}
                    </div>

                    {/* Response Body */}
                    <div>
                      <h3 className="text-sm font-medium mb-3 text-white/70">Body</h3>
                      <pre className="bg-black/30 rounded-xl p-4 overflow-auto max-h-96 text-sm border border-white/5 font-mono">
                        <code className="text-white/80">{JSON.stringify(response.data, null, 2)}</code>
                      </pre>
                    </div>

                    {/* Response Headers */}
                    <div>
                      <h3 className="text-sm font-medium mb-3 text-white/70">Headers</h3>
                      <div className="bg-black/30 rounded-xl p-4 space-y-2 text-sm max-h-48 overflow-auto border border-white/5">
                        {response.headers && Object.keys(response.headers).length > 0 ? (
                          Object.entries(response.headers).map(([key, value]) => (
                            <div key={key} className="flex gap-2 font-mono">
                              <span className="text-violet-400">{key}:</span>
                              <span className="text-white/60 break-all">{value}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-white/40 text-sm">No headers returned</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-white/40">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                      <Send className="w-8 h-8 opacity-50" />
                    </div>
                    <p>Send a request to see the response</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
