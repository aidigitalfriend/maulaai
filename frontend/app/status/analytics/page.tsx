'use client'

import { useState, useEffect } from 'react'
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

  const fetchAnalytics = async () => {
    try {
      // Simulated data - in production, this would be a real API call
      const simulatedData: AnalyticsData = {
        overview: {
          totalRequests: Math.floor(Math.random() * 50000) + 200000,
          activeUsers: Math.floor(Math.random() * 500) + 2000,
          avgResponseTime: Math.floor(Math.random() * 100) + 150,
          successRate: 99.5 + Math.random() * 0.5,
          requestsGrowth: Math.random() * 20 - 5,
          usersGrowth: Math.random() * 15 - 3,
        },
        agents: [
          'einstein', 'ben-sega', 'chess-player', 'comedy-king', 'drama-queen',
          'mrs-boss', 'fitness-guru', 'chef-biew', 'lazy-pawn', 'knight-logic',
          'rook-jokey', 'emma-emotional', 'julie-girlfriend', 'professor-astrology',
          'nid-gaming', 'tech-wizard', 'travel-buddy', 'bishop-burger'
        ].map(name => ({
          name,
          requests: Math.floor(Math.random() * 10000) + 5000,
          users: Math.floor(Math.random() * 200) + 50,
          avgResponseTime: Math.floor(Math.random() * 150) + 100,
          successRate: 98 + Math.random() * 2,
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down' as 'up' | 'down' | 'stable',
        })),
        tools: [
          { name: 'AI Studio', usage: 15000, users: 800, avgDuration: 1200, trend: 'up' as const },
          { name: 'IP Info', usage: 8000, users: 600, avgDuration: 50, trend: 'up' as const },
          { name: 'Network Tools', usage: 5000, users: 400, avgDuration: 300, trend: 'stable' as const },
          { name: 'Developer Utils', usage: 4500, users: 350, avgDuration: 180, trend: 'up' as const },
          { name: 'API Tester', usage: 6000, users: 450, avgDuration: 420, trend: 'stable' as const },
        ],
        hourlyData: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          requests: Math.floor(Math.random() * 5000) + 3000,
          users: Math.floor(Math.random() * 200) + 100,
        })),
        topAgents: [
          { name: 'Einstein AI', requests: 45000, percentage: 18 },
          { name: 'Ben Sega', requests: 38000, percentage: 15 },
          { name: 'Chess Player', requests: 32000, percentage: 13 },
          { name: 'Tech Wizard', requests: 28000, percentage: 11 },
          { name: 'Comedy King', requests: 25000, percentage: 10 },
        ],
      }
      setData(simulatedData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [timeRange])

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-400"></div>
          <p className="text-white text-lg">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <BarChart3 className="w-16 h-16 text-brand-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Real-Time <span className="text-gradient">Analytics</span>
          </h1>
          <p className="text-xl text-neural-300 mb-6">
            Comprehensive insights into platform performance and usage
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
              href="/status/api-status"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              API Status
            </Link>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center justify-center gap-2">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-brand-600 text-white'
                    : 'bg-neural-700 text-neural-300 hover:bg-neural-600'
                }`}
              >
                {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
              <div className={`flex items-center gap-1 text-sm ${data.overview.requestsGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.overview.requestsGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(data.overview.requestsGrowth).toFixed(1)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{data.overview.totalRequests.toLocaleString()}</div>
            <p className="text-sm text-neural-400">Total Requests</p>
          </div>

          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-400" />
              <div className={`flex items-center gap-1 text-sm ${data.overview.usersGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.overview.usersGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(data.overview.usersGrowth).toFixed(1)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">{data.overview.activeUsers.toLocaleString()}</div>
            <p className="text-sm text-neural-400">Active Users</p>
          </div>

          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{data.overview.avgResponseTime}ms</div>
            <p className="text-sm text-neural-400">Avg Response Time</p>
          </div>

          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">{data.overview.successRate.toFixed(2)}%</div>
            <p className="text-sm text-neural-400">Success Rate</p>
          </div>
        </div>

        {/* Hourly Traffic Chart */}
        <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700 mb-12">
          <h3 className="text-2xl font-bold mb-6">24-Hour Traffic Pattern</h3>
          <div className="h-80 flex items-end justify-between gap-1">
            {data.hourlyData.map((hour, i) => {
              const maxRequests = Math.max(...data.hourlyData.map(h => h.requests))
              const height = (hour.requests / maxRequests) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${height * 3}px` }}
                    />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-neural-900 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                      <div className="font-bold mb-1">{hour.hour}</div>
                      <div>{hour.requests.toLocaleString()} requests</div>
                      <div className="text-purple-400">{hour.users} users</div>
                    </div>
                  </div>
                  {i % 3 === 0 && <span className="text-xs text-neural-400">{hour.hour}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Agents Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <h3 className="text-2xl font-bold mb-6">Top Performing Agents</h3>
            <div className="space-y-4">
              {data.topAgents.map((agent, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{agent.name}</span>
                    <span className="text-neural-400">{agent.requests.toLocaleString()} requests</span>
                  </div>
                  <div className="h-3 bg-neural-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all"
                      style={{ width: `${agent.percentage * 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools Usage */}
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <h3 className="text-2xl font-bold mb-6">Tools Usage</h3>
            <div className="space-y-4">
              {data.tools.map((tool, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-neural-700/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold mb-1">{tool.name}</h4>
                    <p className="text-sm text-neural-400">{tool.users} active users</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-400">{tool.usage.toLocaleString()}</div>
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
        <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
          <h3 className="text-2xl font-bold mb-6">All Agents Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neural-700">
                  <th className="text-left py-3 px-4 text-neural-300 font-semibold">Agent</th>
                  <th className="text-right py-3 px-4 text-neural-300 font-semibold">Requests</th>
                  <th className="text-right py-3 px-4 text-neural-300 font-semibold">Users</th>
                  <th className="text-right py-3 px-4 text-neural-300 font-semibold">Avg Response</th>
                  <th className="text-right py-3 px-4 text-neural-300 font-semibold">Success Rate</th>
                  <th className="text-center py-3 px-4 text-neural-300 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.agents.map((agent, i) => (
                  <tr key={i} className="border-b border-neural-700/50 hover:bg-neural-700/30 transition-colors">
                    <td className="py-3 px-4 font-semibold capitalize">{agent.name.replace(/-/g, ' ')}</td>
                    <td className="py-3 px-4 text-right text-brand-400">{agent.requests.toLocaleString()}</td>
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
          <p className="text-neural-400 text-sm">
            🔄 Auto-refreshing every 30 seconds • Last update: {lastUpdate.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
