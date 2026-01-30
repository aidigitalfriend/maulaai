'use client'

import { useState, useEffect } from 'react'
import { Zap, CheckCircle, XCircle, AlertTriangle, Clock, Activity, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface APIStatusData {
  endpoints: Array<{
    name: string
    endpoint: string
    method: string
    status: 'operational' | 'degraded' | 'down'
    responseTime: number
    uptime: number
    lastChecked: string
    errorRate: number
  }>
  categories: {
    agents: Array<{
      name: string
      apiEndpoint: string
      status: 'operational' | 'degraded' | 'down'
      responseTime: number
      requestsPerMinute: number
    }>
    tools: Array<{
      name: string
      apiEndpoint: string
      status: 'operational' | 'degraded' | 'down'
      responseTime: number
      requestsPerMinute: number
    }>
    aiServices: Array<{
      name: string
      provider: string
      status: 'operational' | 'degraded' | 'down'
      responseTime: number
      quota: string
    }>
  }
}

const StatusBadge = ({ status }: { status: 'operational' | 'degraded' | 'down' }) => {
  const config = {
    operational: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', text: 'Operational' },
    degraded: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', text: 'Degraded' },
    down: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', text: 'Down' },
  }

  const { icon: Icon, color, bg, text } = config[status]

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bg}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-xs font-semibold ${color}`}>{text}</span>
    </div>
  )
}

export default function APIStatusPage() {
  const [data, setData] = useState<APIStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchAPIStatus = async () => {
    try {
      const response = await fetch('/api/status/api-status')
      const apiData = await response.json()
      setData(apiData)
      setIsLoading(false)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching API status:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAPIStatus()
    const interval = setInterval(fetchAPIStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="text-white text-base md:text-lg font-medium">Loading API Status...</p>
        </div>
      </div>
    )
  }

  const totalAPIs = data.endpoints.length + data.categories.agents.length + data.categories.tools.length + data.categories.aiServices.length
  const operationalAPIs = [
    ...data.endpoints.filter(e => e.status === 'operational'),
    ...data.categories.agents.filter(a => a.status === 'operational'),
    ...data.categories.tools.filter(t => t.status === 'operational'),
    ...data.categories.aiServices.filter(s => s.status === 'operational'),
  ].length

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Gradient Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-2/3 left-1/2 w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-[100px]" />
      </div>
      
      {/* Hero Section */}
      <section className="relative section-padding">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Live API Monitoring</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
            API Status
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
            Real-time monitoring of all API endpoints and services
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-6">
            <Link
              href="/status"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 font-semibold rounded-lg transition-all w-full sm:w-auto"
            >
              <Activity className="w-5 h-5" />
              Status Dashboard
            </Link>
            <Link
              href="/status/analytics"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-white hover:bg-gray-800/50 font-semibold rounded-lg transition-all w-full sm:w-auto"
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </Link>
          </div>
          {/* Overall Status */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 md:gap-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl md:rounded-full px-5 md:px-6 py-3">
            <span className="text-gray-300 font-medium">Overall API Health:</span>
            <StatusBadge status={operationalAPIs === totalAPIs ? 'operational' : 'degraded'} />
            <span className="text-gray-400">
              {operationalAPIs}/{totalAPIs} APIs Operational
            </span>
          </div>
        </div>
      </section>

      <div className="relative container-custom max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* Core API Endpoints */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all mb-12">
          <h3 className="text-2xl font-bold mb-6 text-white">Core API Endpoints</h3>
          <div className="space-y-4">
            {data.endpoints.map((endpoint, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                      endpoint.method === 'GET' ? 'bg-blue-600' :
                      endpoint.method === 'POST' ? 'bg-green-600' :
                      endpoint.method === 'PUT' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {endpoint.method}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white">{endpoint.name}</h4>
                      <p className="text-sm text-gray-400 font-mono">{endpoint.endpoint}</p>
                    </div>
                  </div>
                  <StatusBadge status={endpoint.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Response Time</p>
                    <p className="font-bold text-cyan-400">{endpoint.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Uptime</p>
                    <p className="font-bold text-green-400">{endpoint.uptime}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Error Rate</p>
                    <p className="font-bold text-yellow-400">{endpoint.errorRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Checked</p>
                    <p className="font-bold text-purple-400">{new Date(endpoint.lastChecked).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Services APIs */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all mb-12">
          <h3 className="text-2xl font-bold mb-6 text-white">AI Service APIs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.categories.aiServices.map((service, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{service.name}</h4>
                    <p className="text-sm text-gray-400">{service.provider}</p>
                  </div>
                  <StatusBadge status={service.status} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Response Time</span>
                    <span className="font-bold text-cyan-400">{service.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quota</span>
                    <span className="font-bold text-green-400">{service.quota}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent APIs */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all mb-12">
          <h3 className="text-2xl font-bold mb-6 text-white">Agent APIs ({data.categories.agents.filter(a => a.status === 'operational').length}/{data.categories.agents.length} Operational)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.categories.agents.map((agent, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-white">{agent.name}</h4>
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'operational' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                </div>
                <p className="text-xs text-gray-400 font-mono mb-3">{agent.apiEndpoint}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Response</p>
                    <p className="font-bold text-cyan-400">{agent.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Req/min</p>
                    <p className="font-bold text-purple-400">{agent.requestsPerMinute}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools APIs */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
          <h3 className="text-2xl font-bold mb-6 text-white">Tools & Services APIs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.categories.tools.map((tool, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">{tool.name}</h4>
                  <StatusBadge status={tool.status} />
                </div>
                <p className="text-xs text-gray-400 font-mono mb-3">{tool.apiEndpoint}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Response Time</p>
                    <p className="font-bold text-cyan-400">{tool.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Requests/min</p>
                    <p className="font-bold text-purple-400">{tool.requestsPerMinute}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-refresh Notice */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            🔄 Auto-refreshing every 30 seconds • Last update: {lastUpdate.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
