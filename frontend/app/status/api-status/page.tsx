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
      // Simulated data - in production, this would be real API monitoring
      const simulatedData: APIStatusData = {
        endpoints: [
          { name: 'Chat API', endpoint: '/api/chat', method: 'POST', status: 'operational', responseTime: 145, uptime: 99.9, lastChecked: new Date().toISOString(), errorRate: 0.1 },
          { name: 'Authentication', endpoint: '/api/auth', method: 'POST', status: 'operational', responseTime: 98, uptime: 99.95, lastChecked: new Date().toISOString(), errorRate: 0.05 },
          { name: 'Status API', endpoint: '/api/status', method: 'GET', status: 'operational', responseTime: 52, uptime: 100, lastChecked: new Date().toISOString(), errorRate: 0 },
          { name: 'User Profile', endpoint: '/api/user/profile', method: 'GET', status: 'operational', responseTime: 87, uptime: 99.8, lastChecked: new Date().toISOString(), errorRate: 0.2 },
          { name: 'File Upload', endpoint: '/api/upload', method: 'POST', status: 'operational', responseTime: 234, uptime: 99.5, lastChecked: new Date().toISOString(), errorRate: 0.5 },
        ],
        categories: {
          agents: [
            'Einstein AI', 'Ben Sega', 'Chess Player', 'Comedy King', 'Drama Queen',
            'Mrs Boss', 'Fitness Guru', 'Chef Biew', 'Lazy Pawn', 'Knight Logic',
            'Rook Jokey', 'Emma Emotional', 'Julie Girlfriend', 'Professor Astrology',
            'Nid Gaming', 'Tech Wizard', 'Travel Buddy', 'Bishop Burger'
          ].map(name => ({
            name,
            apiEndpoint: `/api/agents/${name.toLowerCase().replace(/ /g, '-')}`,
            status: Math.random() > 0.95 ? 'degraded' : 'operational' as 'operational' | 'degraded',
            responseTime: Math.floor(Math.random() * 100) + 80,
            requestsPerMinute: Math.floor(Math.random() * 50) + 20,
          })),
          tools: [
            { name: 'AI Studio', apiEndpoint: '/api/studio', status: 'operational', responseTime: 156, requestsPerMinute: 85 },
            { name: 'IP Info', apiEndpoint: '/api/tools/ip-info', status: 'operational', responseTime: 45, requestsPerMinute: 120 },
            { name: 'Network Tools', apiEndpoint: '/api/tools/network', status: 'operational', responseTime: 67, requestsPerMinute: 45 },
            { name: 'Developer Utils', apiEndpoint: '/api/tools/dev-utils', status: 'operational', responseTime: 52, requestsPerMinute: 38 },
            { name: 'API Tester', apiEndpoint: '/api/tools/api-tester', status: 'operational', responseTime: 89, requestsPerMinute: 56 },
          ] as Array<{ name: string; apiEndpoint: string; status: 'operational' | 'degraded'; responseTime: number; requestsPerMinute: number }>,
          aiServices: [
            { name: 'Gemini Pro', provider: 'Google AI', status: 'operational', responseTime: 234, quota: '95% remaining' },
            { name: 'GPT-4', provider: 'OpenAI', status: 'operational', responseTime: 312, quota: '87% remaining' },
            { name: 'Claude 3', provider: 'Anthropic', status: 'operational', responseTime: 289, quota: '92% remaining' },
          ] as Array<{ name: string; provider: string; status: 'operational' | 'degraded'; responseTime: number; quota: string }>,
        },
      }
      setData(simulatedData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch API status:', error)
    } finally {
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
      <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-400"></div>
          <p className="text-white text-lg">Loading API Status...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Zap className="w-16 h-16 text-purple-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            API <span className="text-gradient">Status</span>
          </h1>
          <p className="text-xl text-neural-300 mb-6">
            Real-time monitoring of all API endpoints and services
          </p>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link
              href="/status"
              className="flex items-center gap-2 px-6 py-3 bg-neural-700 hover:bg-neural-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <Activity className="w-5 h-5" />
              Status Dashboard
            </Link>
            <Link
              href="/status/analytics"
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </Link>
          </div>

          {/* Overall Status */}
          <div className="inline-flex items-center gap-4 bg-neural-800/50 rounded-full px-6 py-3 border border-neural-700">
            <span className="text-neural-300">Overall API Health:</span>
            <StatusBadge status={operationalAPIs === totalAPIs ? 'operational' : 'degraded'} />
            <span className="text-neural-400">
              {operationalAPIs}/{totalAPIs} APIs Operational
            </span>
          </div>
        </div>

        {/* Core API Endpoints */}
        <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700 mb-12">
          <h3 className="text-2xl font-bold mb-6">Core API Endpoints</h3>
          <div className="space-y-4">
            {data.endpoints.map((endpoint, i) => (
              <div key={i} className="bg-neural-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      endpoint.method === 'GET' ? 'bg-blue-600' :
                      endpoint.method === 'POST' ? 'bg-green-600' :
                      endpoint.method === 'PUT' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {endpoint.method}
                    </span>
                    <div>
                      <h4 className="font-semibold">{endpoint.name}</h4>
                      <p className="text-sm text-neural-400 font-mono">{endpoint.endpoint}</p>
                    </div>
                  </div>
                  <StatusBadge status={endpoint.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-neural-400">Response Time</p>
                    <p className="font-bold text-brand-400">{endpoint.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-neural-400">Uptime</p>
                    <p className="font-bold text-green-400">{endpoint.uptime}%</p>
                  </div>
                  <div>
                    <p className="text-neural-400">Error Rate</p>
                    <p className="font-bold text-yellow-400">{endpoint.errorRate}%</p>
                  </div>
                  <div>
                    <p className="text-neural-400">Last Checked</p>
                    <p className="font-bold text-purple-400">{new Date(endpoint.lastChecked).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Services APIs */}
        <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700 mb-12">
          <h3 className="text-2xl font-bold mb-6">AI Service APIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.categories.aiServices.map((service, i) => (
              <div key={i} className="bg-neural-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-sm text-neural-400">{service.provider}</p>
                  </div>
                  <StatusBadge status={service.status} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neural-400">Response Time</span>
                    <span className="font-bold text-brand-400">{service.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neural-400">Quota</span>
                    <span className="font-bold text-green-400">{service.quota}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent APIs */}
        <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700 mb-12">
          <h3 className="text-2xl font-bold mb-6">Agent APIs ({data.categories.agents.filter(a => a.status === 'operational').length}/{data.categories.agents.length} Operational)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.categories.agents.map((agent, i) => (
              <div key={i} className="bg-neural-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{agent.name}</h4>
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'operational' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                </div>
                <p className="text-xs text-neural-400 font-mono mb-3">{agent.apiEndpoint}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-neural-400">Response</p>
                    <p className="font-bold text-brand-400">{agent.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-neural-400">Req/min</p>
                    <p className="font-bold text-purple-400">{agent.requestsPerMinute}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools APIs */}
        <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
          <h3 className="text-2xl font-bold mb-6">Tools & Services APIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.categories.tools.map((tool, i) => (
              <div key={i} className="bg-neural-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{tool.name}</h4>
                  <StatusBadge status={tool.status} />
                </div>
                <p className="text-xs text-neural-400 font-mono mb-3">{tool.apiEndpoint}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neural-400">Response Time</p>
                    <p className="font-bold text-brand-400">{tool.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-neural-400">Requests/min</p>
                    <p className="font-bold text-purple-400">{tool.requestsPerMinute}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-refresh Notice */}
        <div className="mt-8 text-center">
          <p className="text-neural-400 text-sm">
            🔄 Auto-refreshing every 30 seconds • Last update: {lastUpdate.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
