'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart3, TrendingUp, Users, Zap, Activity, Clock, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  overview: {
    totalRequests: number
    activeUsers: number
    avgResponseTime: number
    successRate: number
    requestsGrowth: number
    usersGrowth: number
  }
  agents: Array<{
    name: string
    requests: number
    users: number
    avgResponseTime: number
    successRate: number
    trend: 'up' | 'down' | 'stable'
  }>
  tools: Array<{
    name: string
    usage: number
    users: number
    avgDuration: number
    trend: 'up' | 'down' | 'stable'
  }>
  hourlyData: Array<{
    hour: string
    requests: number
    users: number
  }>
  topAgents: Array<{
    name: string
    requests: number
    percentage: number
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/status/analytics?timeRange=${timeRange}`)
      const data = await response.json()
      setData(data)
      setIsLoading(false)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setIsLoading(false)
    }
  }, [timeRange, setData, setIsLoading, setLastUpdate])

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [timeRange, fetchAnalytics])

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="text-white text-base md:text-lg font-medium">Loading Analytics...</p>
        </div>
      </div>
    )
  }

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
            <span className="text-cyan-400 text-sm font-medium">Live Analytics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
            Real-Time Analytics
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
            Comprehensive insights into platform performance and usage
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
              href="/status/api-status"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-white hover:bg-gray-800/50 font-semibold rounded-lg transition-all w-full sm:w-auto"
            >
              <Zap className="w-5 h-5" />
              API Status
            </Link>
          </div>
          {/* Time Range Selector */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-md'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="relative container-custom max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-cyan-400" />
              <div className={`flex items-center gap-1 text-sm ${data.overview.requestsGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.overview.requestsGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(data.overview.requestsGrowth).toFixed(1)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">{data.overview.totalRequests.toLocaleString()}</div>
            <p className="text-sm text-gray-400">Total Requests</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-400" />
              <div className={`flex items-center gap-1 text-sm ${data.overview.usersGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.overview.usersGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(data.overview.usersGrowth).toFixed(1)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">{data.overview.activeUsers.toLocaleString()}</div>
            <p className="text-sm text-gray-400">Active Users</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{data.overview.avgResponseTime}ms</div>
            <p className="text-sm text-gray-400">Avg Response Time</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">{data.overview.successRate.toFixed(2)}%</div>
            <p className="text-sm text-gray-400">Success Rate</p>
          </div>
        </div>

        {/* Hourly Traffic Chart */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all mb-12">
          <h3 className="text-2xl font-bold mb-6 text-white">24-Hour Traffic Pattern</h3>
          <div className="h-80 flex items-end justify-between gap-1">
            {data.hourlyData.map((hour, i) => {
              const maxRequests = Math.max(...data.hourlyData.map(h => h.requests))
              const height = (hour.requests / maxRequests) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${height * 3}px` }}
                    />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 border border-gray-700">
                      <div className="font-bold mb-1">{hour.hour}</div>
                      <div>{hour.requests.toLocaleString()} requests</div>
                      <div className="text-cyan-400">{hour.users} users</div>
                    </div>
                  </div>
                  {i % 3 === 0 && <span className="text-xs text-gray-400">{hour.hour}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Agents Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
            <h3 className="text-2xl font-bold mb-6 text-white">Top Performing Agents</h3>
            <div className="space-y-4">
              {data.topAgents.map((agent, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">{agent.name}</span>
                    <span className="text-gray-400">{agent.requests.toLocaleString()} requests</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${agent.percentage * 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools Usage */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
            <h3 className="text-2xl font-bold mb-6 text-white">Tools Usage</h3>
            <div className="space-y-4">
              {data.tools.map((tool, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div>
                    <h4 className="font-semibold mb-1 text-white">{tool.name}</h4>
                    <p className="text-sm text-gray-400">{tool.users} active users</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">{tool.usage.toLocaleString()}</div>
                    <div className={`flex items-center gap-1 text-sm ${
                      tool.trend === 'up' ? 'text-green-400' : tool.trend === 'down' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {tool.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : tool.trend === 'down' ? <ArrowDown className="w-4 h-4" /> : '−'}
                      {tool.trend === 'up' ? 'Rising' : tool.trend === 'down' ? 'Falling' : 'Stable'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agents Performance Table */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
          <h3 className="text-2xl font-bold mb-6 text-white">All Agents Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Agent</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Requests</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Users</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Avg Response</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Success Rate</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.agents.map((agent, i) => (
                  <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-semibold capitalize text-white">{agent.name.replace(/-/g, ' ')}</td>
                    <td className="py-3 px-4 text-right text-cyan-400">{agent.requests.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-purple-400">{agent.users}</td>
                    <td className="py-3 px-4 text-right text-yellow-400">{agent.avgResponseTime}ms</td>
                    <td className="py-3 px-4 text-right text-green-400">{agent.successRate.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center">
                      {agent.trend === 'up' ? (
                        <ArrowUp className="w-5 h-5 text-green-400 inline" />
                      ) : agent.trend === 'down' ? (
                        <ArrowDown className="w-5 h-5 text-red-400 inline" />
                      ) : (
                        <span className="text-yellow-400">−</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
