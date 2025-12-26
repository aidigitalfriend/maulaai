'use client'

import { useState, useEffect } from 'react'
import { Activity, CheckCircle, AlertTriangle, XCircle, Clock, TrendingUp, Server, Zap, Database, Users } from 'lucide-react'

interface StatusData {
  system?: {
    cpuPercent: number
    memoryPercent: number
    totalMem: number
    freeMem: number
    usedMem: number
    load1: number
    load5: number
    load15: number
    cores: number
  }
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
    errorRate?: number
    errorsToday?: number
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
    operational: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-400/10', text: 'Operational' },
    degraded: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-400/10', text: 'Degraded' },
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
  const [error, setError] = useState<string | null>(null)
  const [cpuHistory, setCpuHistory] = useState<number[]>([])
  const [memHistory, setMemHistory] = useState<number[]>([])
  const [rpmHistory, setRpmHistory] = useState<number[]>([])
  const [errRateHistory, setErrRateHistory] = useState<number[]>([])
  const [usedMock, setUsedMock] = useState(false)

  // No mock data - use real API responses only

  const fetchStatus = async () => {
    try {
      setError(null)
      const response = await fetch('/api/status')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        // Use real data directly without any mock fallbacks
        setData(result.data)
        setLastUpdate(new Date())
        setIsLoading(false)
      } else {
        console.error('API returned error:', result.error)
        setError(result.error || 'Unknown error')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch status')
      // Set loading to false even on error
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let es: EventSource | null = null
    let pollTimer: any = null

    const startSSE = () => {
      try {
        es = new EventSource('/api/status/stream')
        es.onmessage = (e) => {
          try {
            const payload = JSON.parse(e.data)
            if (payload?.success && payload?.data) {
              // Use real data directly without mock fallbacks
              setData(payload.data)
              if (payload.data.system) {
                setCpuHistory((h) => {
                  const next = [...h, payload.data.system.cpuPercent]
                  return next.slice(-30)
                })
                setMemHistory((h) => {
                  const next = [...h, payload.data.system.memoryPercent]
                  return next.slice(-30)
                })
              }
              if (payload.data.api) {
                setRpmHistory((h) => {
                  const next = [...h, payload.data.api.requestsPerMinute]
                  return next.slice(-60)
                })
                if (typeof payload.data.api.errorRate === 'number') {
                  setErrRateHistory((h) => {
                    const next = [...h, payload.data.api.errorRate as number]
                    return next.slice(-60)
                  })
                }
              }
              setLastUpdate(new Date())
              setIsLoading(false)
            }
          } catch (err) {
            console.error('SSE parse error:', err)
          }
        }
        es.onerror = (e) => {
          console.warn('SSE error, switching to polling...', e)
          es?.close()
          // fallback to polling every 30s
          pollTimer = setInterval(fetchStatus, 30000)
        }
      } catch (e) {
        console.warn('SSE not available, using polling.', e)
        pollTimer = setInterval(fetchStatus, 30000)
      }
    }

    // initial snapshot to render something fast
    fetchStatus()
    // then start live stream
    startSSE()

    return () => {
      es?.close()
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-600"></div>
          <p className="text-neural-800 text-lg font-medium">Loading Status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border border-red-200">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-center text-neural-800 mb-2">Unable to Load Status</h2>
          <p className="text-center text-neural-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setIsLoading(true)
              setError(null)
              fetchStatus()
            }}
            className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-16 h-16 text-yellow-600" />
          <p className="text-neural-800 text-lg font-medium">No data available</p>
        </div>
      </div>
    )
  }

  const operationalCount = data.agents.filter(a => a.status === 'operational').length
  const overallStatus = operationalCount === data.agents.length ? 'operational' : 'degraded'

  const Gauge = ({ label, value, color }: { label: string; value: number; color: string }) => {
    const clamped = Math.max(0, Math.min(100, value))
    const angle = (clamped / 100) * 180 // semicircle
    const radius = 60
    const cx = 80
    const cy = 80
    const start = {
      x: cx - radius,
      y: cy,
    }
    const radians = (Math.PI * (180 - angle)) / 180
    const end = {
      x: cx + radius * Math.cos(radians),
      y: cy - radius * Math.sin(radians),
    }
    const largeArc = angle > 180 ? 1 : 0
    const dBg = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy}`
    const dVal = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
    return (
      <div className="flex flex-col items-center">
        <svg width="160" height="100" viewBox="0 0 160 100">
          <path d={dBg} stroke="#e5e7eb" strokeWidth="14" fill="none"/>
          <path d={dVal} stroke={color} strokeWidth="14" strokeLinecap="round" fill="none"/>
          <text x="80" y="70" textAnchor="middle" className="fill-neural-800 font-bold text-xl">
            {clamped}%
          </text>
        </svg>
        <div className="text-sm text-neural-600 mt-1">{label}</div>
      </div>
    )
  }

  const MiniLine = ({ series, stroke }: { series: number[]; stroke: string }) => {
    const width = 280
    const height = 80
    const max = Math.max(100, ...series, 1)
    const pts = series.map((v, i) => {
      const x = (i / Math.max(1, series.length - 1)) * width
      const y = height - (v / max) * height
      return `${x},${y}`
    }).join(' ')
    return (
      <svg width={width} height={height} className="w-full h-20">
        <polyline fill="none" stroke="#e5e7eb" strokeWidth="1" points={`0,${height} ${width},${height}`} />
        <polyline fill="none" stroke={stroke} strokeWidth="2" points={pts} />
      </svg>
    )
  }

  const BarChart = ({ values, labels, color }: { values: number[]; labels: string[]; color: string }) => {
    const max = Math.max(...values, 1)
    return (
      <div className="h-40 flex items-end gap-2 w-full">
        {values.map((v, i) => {
          const h = (v / max) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full h-full relative group">
                <div className="rounded-t-md" style={{ height: `${h}%`, background: color }} />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neural-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                  {v}
                </div>
              </div>
              <span className="text-[10px] text-neural-600 mt-1 truncate w-full text-center">{labels[i]}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const Donut = ({ percent, color }: { percent: number; color: string }) => {
    const size = 120
    const stroke = 14
    const r = (size - stroke) / 2
    const c = 2 * Math.PI * r
    const clamped = Math.max(0, Math.min(100, percent))
    const dash = (clamped / 100) * c
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-neural-800 font-bold text-lg">
          {clamped.toFixed(1)}%
        </text>
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 md:py-12">
      <div className="container-custom px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center mb-4 md:mb-6">
            <Activity className="w-12 h-12 md:w-16 md:h-16 text-brand-600" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent">
            System Status
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-neural-600 mb-4 md:mb-6 max-w-2xl mx-auto px-4">
            Real-time monitoring of all One Last AI services
          </p>
          {usedMock && (
            <p className="text-xs text-neural-600">Showing demo data to illustrate charts while live data initializes.</p>
          )}
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
              <StatusBadge status={overallStatus} />
              <span className="text-neural-600 text-xs md:text-sm">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mt-2 md:mt-4 w-full sm:w-auto px-4 sm:px-0">
              <a
                href="/status/analytics"
                className="flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-brand-600 hover:bg-brand-700 text-neural-800 font-semibold rounded-lg transition-all transform hover:scale-105 shadow-sm w-full sm:w-auto text-sm md:text-base"
              >
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                View Analytics
              </a>
              <a
                href="/status/api-status"
                className="flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-purple-600 hover:bg-purple-700 text-neural-800 font-semibold rounded-lg transition-all transform hover:scale-105 shadow-sm w-full sm:w-auto text-sm md:text-base"
              >
                <Zap className="w-4 h-4 md:w-5 md:h-5" />
                API Status
              </a>
            </div>
          </div>
        </div>

        {/* System Gauges */}
        {data.system && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-neural-800">CPU Usage</h3>
                <MiniLine series={cpuHistory} stroke="#f97316" />
              </div>
              <Gauge label="CPU" value={data.system.cpuPercent} color="#f97316" />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-neural-800">Memory Usage</h3>
                <MiniLine series={memHistory} stroke="#22c55e" />
                <div className="text-xs text-neural-600 mt-1">
                  {(data.system.usedMem / (1024**3)).toFixed(1)} GB / {(data.system.totalMem / (1024**3)).toFixed(1)} GB
                </div>
              </div>
              <Gauge label="RAM" value={data.system.memoryPercent} color="#22c55e" />
            </div>
          </div>
        )}

        {/* Realtime KPIs */}
        {data.api && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="bg-white rounded-2xl p-5 border border-neural-200 shadow-sm">
              <p className="text-sm text-neural-600">Requests / min</p>
              <div className="text-3xl font-extrabold text-brand-700">{data.api.requestsPerMinute}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-neural-200 shadow-sm">
              <p className="text-sm text-neural-600">Error rate</p>
              <div className="text-3xl font-extrabold text-red-600">{(data.api.errorRate ?? 0).toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-neural-200 shadow-sm">
              <p className="text-sm text-neural-600">Requests today</p>
              <div className="text-3xl font-extrabold text-neural-800">{data.api.requestsToday.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-neural-200 shadow-sm">
              <p className="text-sm text-neural-600">Errors today</p>
              <div className="text-3xl font-extrabold text-red-600">{(data.api.errorsToday ?? 0).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Realtime analytics under gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2">Requests / Minute</h3>
            <div className="text-neural-600 text-sm mb-4">Live last ~10 minutes</div>
            <MiniLine series={rpmHistory} stroke="#3b82f6" />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2">Error Rate</h3>
            <div className="text-neural-600 text-sm mb-4">Live last ~10 minutes</div>
            <MiniLine series={errRateHistory} stroke="#ef4444" />
          </div>
        </div>

        {/* Main Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Platform Status */}
          <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Server className="w-7 h-7 md:w-8 md:h-8 text-brand-600" />
              <StatusBadge status={data.platform.status} />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2 text-neural-800">Platform</h3>
            <div className="text-2xl md:text-3xl font-bold text-brand-600 mb-2">{data.platform.uptime.toFixed(2)}%</div>
            <p className="text-xs md:text-sm text-neural-600">Uptime</p>
          </div>

          {/* API Status */}
          <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-7 h-7 md:w-8 md:h-8 text-yellow-600" />
              <StatusBadge status={data.api.status} />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2 text-neural-800">API</h3>
            <div className="text-2xl md:text-3xl font-bold text-yellow-600 mb-2">{data.api.responseTime}ms</div>
            <p className="text-sm text-neural-600">Avg Response Time</p>
          </div>

          {/* Database Status */}
          <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Database className="w-8 h-8 text-green-600" />
              <StatusBadge status={data.database.status} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Database</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">{data.database.connectionPool}%</div>
            <p className="text-sm text-neural-600">Connection Pool</p>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-600" />
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Active Users</h3>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {data.agents.reduce((sum, a) => sum + a.activeUsers, 0)}
            </div>
            <p className="text-sm text-neural-600">Across All Agents</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Uptime Chart */}
          <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-6">7-Day Uptime</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.historical.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${day.uptime}%` }}
                  />
                  <span className="text-xs text-neural-600">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-neural-600">
              Average: {(data.historical.reduce((sum, d) => sum + d.uptime, 0) / data.historical.length).toFixed(2)}%
            </div>
          </div>

          {/* Requests Chart */}
          <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-6">API Requests (7 Days)</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.historical.map((day, i) => {
                const maxRequests = Math.max(...data.historical.map(d => d.requests))
                const height = (day.requests / maxRequests) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                    <div className="relative group h-full w-full">
                      <div
                        className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${height * 2.5}px` }}
                      />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-neural-900 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.requests.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs text-neural-600">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-center text-sm text-neural-600">
              Total Today: {data.api.requestsToday.toLocaleString()} requests
            </div>
          </div>
        </div>

        {/* Agents and Errors Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-4">Top Agents by Active Users</h3>
            {(() => {
              const items = MOCK_TOP_AGENTS
              const max = Math.max(...items.map(i => i.users), 1)
              return (
                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize text-neural-800">{it.name}</span>
                        <span className="font-semibold text-brand-700">{it.users}</span>
                      </div>
                      <div className="h-2 bg-neural-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-600 to-accent-500" style={{ width: `${(it.users / max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
          <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Requests vs Errors (Today)</h3>
              <p className="text-neural-600 text-sm">{(data.api.errorsToday ?? 0).toLocaleString()} errors of {data.api.requestsToday.toLocaleString()} requests</p>
              <div className="mt-4">
                <span className="inline-block w-3 h-3 rounded-full bg-brand-600 mr-2" />
                <span className="text-sm mr-4">Requests</span>
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2" />
                <span className="text-sm">Errors</span>
              </div>
            </div>
            <Donut
              percent={Math.min(100, Math.max(0, ((data.api.errorsToday ?? 0) / Math.max(1, data.api.requestsToday)) * 100))}
              color="#ef4444"
            />
          </div>
        </div>

        {/* AI Services Status */}
        <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow mb-12">
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
                    <p className="text-neural-600">Response Time</p>
                    <p className="font-bold text-brand-600">{service.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-neural-600">Uptime</p>
                    <p className="font-bold text-green-600">{service.uptime.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agents Status */}
        <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow mb-12">
          <h3 className="text-xl font-bold mb-6">AI Agents ({operationalCount}/{data.agents.length} Operational)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.agents.map((agent, i) => (
              <div key={i} className="bg-neural-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm capitalize">{agent.name.replace(/-/g, ' ')}</h4>
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'operational' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-neural-600">Response</p>
                    <p className="font-bold text-brand-600">{agent.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-neural-600">Users</p>
                    <p className="font-bold text-purple-600">{agent.activeUsers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools Status */}
        <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow mb-12">
          <h3 className="text-xl font-bold mb-6">Tools & Services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.tools.map((tool, i) => (
              <div key={i} className="bg-neural-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{tool.name}</h4>
                  <StatusBadge status={tool.status} />
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-neural-600">Response Time</p>
                    <p className="font-bold text-brand-600">{tool.responseTime}ms</p>
                  </div>
                  {tool.activeChats && (
                    <div>
                      <p className="text-neural-600">Active Chats</p>
                      <p className="font-bold text-green-600">{tool.activeChats}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        {data.incidents.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-6">Recent Incidents</h3>
            <div className="space-y-4">
              {data.incidents.map((incident) => (
                <div key={incident.id} className="bg-neural-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold mb-1">{incident.title}</h4>
                      <p className="text-sm text-neural-600">
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

        {/* Live update notice */}
        <div className="mt-8 text-center">
          <p className="text-neural-600 text-sm">
            • Live updating • Last update: {lastUpdate.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
