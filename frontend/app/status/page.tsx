'use client'

import { useState, useEffect } from 'react'
import { Activity, CheckCircle, AlertTriangle, XCircle, Clock, TrendingUp, Server, Zap, Database, Users } from 'lucide-react'

interface StatusData {
  platform: {
    status: string
    uptime: number
    lastUpdated: string
    version: string
  }
  api: {
    status: string
    responseTime: number
    uptime: number
    requestsToday: number
    requestsPerMinute: number
  }
  database: {
    status: string
    connectionPool: number
    responseTime: number
    uptime: number
  }
  aiServices: Array<{
    name: string
    status: string
    responseTime: number
    uptime: number
  }>
  agents: Array<{
    name: string
    status: string
    responseTime: number
    activeUsers: number
  }>
  tools: Array<{
    name: string
    status: string
    responseTime: number
    activeChats?: number
  }>
  historical: Array<{
    date: string
    uptime: number
    requests: number
    avgResponseTime: number
  }>
  incidents: Array<{
    id: number
    date: string
    title: string
    severity: string
    duration: string
    resolved: boolean
  }>
}

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    operational: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', text: 'Operational' },
    degraded: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', text: 'Degraded' },
    outage: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', text: 'Outage' },
    maintenance: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10', text: 'Maintenance' },
  }

  const { icon: Icon, color, bg, text } = config[status as keyof typeof config] || config.operational

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bg}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-semibold ${color}`}>{text}</span>
    </div>
  )
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-400"></div>
          <p className="text-white text-lg">Loading Status...</p>
        </div>
      </div>
    )
  }

  const operationalCount = data.agents.filter(a => a.status === 'operational').length
  const overallStatus = operationalCount === data.agents.length ? 'operational' : 'degraded'

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Activity className="w-16 h-16 text-brand-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            System <span className="text-gradient">Status</span>
          </h1>
          <p className="text-xl text-neural-300 mb-6">
            Real-time monitoring of all One Last AI services
          </p>
          <div className="flex items-center justify-center gap-4">
            <StatusBadge status={overallStatus} />
            <span className="text-neural-400 text-sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Main Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Platform Status */}
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <div className="flex items-center justify-between mb-4">
              <Server className="w-8 h-8 text-brand-400" />
              <StatusBadge status={data.platform.status} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Platform</h3>
            <div className="text-3xl font-bold text-brand-400 mb-2">{data.platform.uptime.toFixed(2)}%</div>
            <p className="text-sm text-neural-400">Uptime</p>
          </div>

          {/* API Status */}
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <StatusBadge status={data.api.status} />
            </div>
            <h3 className="text-lg font-semibold mb-2">API</h3>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{data.api.responseTime}ms</div>
            <p className="text-sm text-neural-400">Avg Response Time</p>
          </div>

          {/* Database Status */}
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <div className="flex items-center justify-between mb-4">
              <Database className="w-8 h-8 text-green-400" />
              <StatusBadge status={data.database.status} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Database</h3>
            <div className="text-3xl font-bold text-green-400 mb-2">{data.database.connectionPool}%</div>
            <p className="text-sm text-neural-400">Connection Pool</p>
          </div>

          {/* Active Users */}
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Active Users</h3>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {data.agents.reduce((sum, a) => sum + a.activeUsers, 0)}
            </div>
            <p className="text-sm text-neural-400">Across All Agents</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Uptime Chart */}
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <h3 className="text-xl font-bold mb-6">7-Day Uptime</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.historical.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${day.uptime}%` }}
                  />
                  <span className="text-xs text-neural-400">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-neural-400">
              Average: {(data.historical.reduce((sum, d) => sum + d.uptime, 0) / data.historical.length).toFixed(2)}%
            </div>
          </div>

          {/* Requests Chart */}
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <h3 className="text-xl font-bold mb-6">API Requests (7 Days)</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.historical.map((day, i) => {
                const maxRequests = Math.max(...data.historical.map(d => d.requests))
                const height = (day.requests / maxRequests) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative group">
                      <div
                        className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${height * 2.5}px` }}
                      />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-neural-900 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.requests.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs text-neural-400">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-center text-sm text-neural-400">
              Total Today: {data.api.requestsToday.toLocaleString()} requests
            </div>
          </div>
        </div>

        {/* AI Services Status */}
        <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700 mb-12">
          <h3 className="text-xl font-bold mb-6">AI Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.aiServices.map((service, i) => (
              <div key={i} className="bg-neural-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{service.name}</h4>
                  <StatusBadge status={service.status} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neural-400">Response Time</p>
                    <p className="font-bold text-brand-400">{service.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-neural-400">Uptime</p>
                    <p className="font-bold text-green-400">{service.uptime.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agents Status */}
        <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700 mb-12">
          <h3 className="text-xl font-bold mb-6">AI Agents ({operationalCount}/{data.agents.length} Operational)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.agents.map((agent, i) => (
              <div key={i} className="bg-neural-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm capitalize">{agent.name.replace(/-/g, ' ')}</h4>
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'operational' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-neural-400">Response</p>
                    <p className="font-bold text-brand-400">{agent.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-neural-400">Users</p>
                    <p className="font-bold text-purple-400">{agent.activeUsers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools Status */}
        <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700 mb-12">
          <h3 className="text-xl font-bold mb-6">Tools & Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.tools.map((tool, i) => (
              <div key={i} className="bg-neural-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{tool.name}</h4>
                  <StatusBadge status={tool.status} />
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-neural-400">Response Time</p>
                    <p className="font-bold text-brand-400">{tool.responseTime}ms</p>
                  </div>
                  {tool.activeChats && (
                    <div>
                      <p className="text-neural-400">Active Chats</p>
                      <p className="font-bold text-green-400">{tool.activeChats}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        {data.incidents.length > 0 && (
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <h3 className="text-xl font-bold mb-6">Recent Incidents</h3>
            <div className="space-y-4">
              {data.incidents.map((incident) => (
                <div key={incident.id} className="bg-neural-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold mb-1">{incident.title}</h4>
                      <p className="text-sm text-neural-400">
                        {new Date(incident.date).toLocaleDateString()} • Duration: {incident.duration}
                      </p>
                    </div>
                    <StatusBadge status={incident.resolved ? 'operational' : incident.severity} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
