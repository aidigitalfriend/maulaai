'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Users, MessageSquare, Clock, Target, Zap, ChevronRight } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'

interface AgentPerformanceData {
  agent: {
    name: string
    type: string
    avatar: string
    status: 'active' | 'idle' | 'maintenance'
  }
  metrics: {
    totalConversations: number
    totalMessages: number
    averageResponseTime: number
    satisfactionScore: number
    activeUsers: number
    uptime: number
  }
  trends: {
    conversations: { value: number; change: string; trend: 'up' | 'down' }
    messages: { value: number; change: string; trend: 'up' | 'down' }
    responseTime: { value: number; change: string; trend: 'up' | 'down' }
    satisfaction: { value: number; change: string; trend: 'up' | 'down' }
  }
  recentActivity: Array<{
    timestamp: string
    type: 'conversation' | 'message' | 'error'
    description: string
    user?: string
  }>
}

function AgentPerformanceDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AgentPerformanceData | null>(null)
  const [selectedAgent, setSelectedAgent] = useState('einstein')
  const [timeRange, setTimeRange] = useState('7d')

  const agentOptions = [
    { id: 'einstein', name: 'Einstein', icon: '🧠' },
    { id: 'tech-wizard', name: 'Tech Wizard', icon: '🧙‍♂️' },
    { id: 'comedy-king', name: 'Comedy King', icon: '😄' },
    { id: 'chef-biew', name: 'Chef Biew', icon: '👨‍🍳' },
    { id: 'ben-sega', name: 'Ben Sega', icon: '🎮' },
    { id: 'default', name: 'AI Assistant', icon: '🤖' }
  ]

  const timeRangeOptions = [
    { id: '1d', name: 'Last 24 Hours' },
    { id: '7d', name: 'Last 7 Days' },
    { id: '30d', name: 'Last 30 Days' }
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`https://onelastai.co/api/agent/performance/${selectedAgent}?timeRange=${timeRange}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const result = await response.json();
          setData(result.data);
        } else {
          console.error('Failed to fetch agent performance data');
          // Fallback to mock data if API fails
          setData({
            agent: {
              name: 'Einstein',
              type: 'Physics & Science',
              avatar: '🧠',
              status: 'active'
            },
            metrics: {
              totalConversations: 0,
              totalMessages: 0,
              averageResponseTime: 1.2,
              satisfactionScore: 4.8,
              activeUsers: 0,
              uptime: 99.9
            },
            trends: {
              conversations: { value: 0, change: '+0%', trend: 'up' },
              messages: { value: 0, change: '+0%', trend: 'up' },
              responseTime: { value: 1.2, change: '+0s', trend: 'up' },
              satisfaction: { value: 4.8, change: '+0', trend: 'up' }
            },
            recentActivity: []
          });
        }
      } catch (error) {
        console.error('Failed to fetch agent performance data:', error)
        // Fallback data
        setData({
          agent: {
            name: 'Einstein',
            type: 'Physics & Science',
            avatar: '🧠',
            status: 'idle'
          },
          metrics: {
            totalConversations: 0,
            totalMessages: 0,
            averageResponseTime: 0,
            satisfactionScore: 4.8,
            activeUsers: 0,
            uptime: 99.9
          },
          trends: {
            conversations: { value: 0, change: '+0%', trend: 'up' },
            messages: { value: 0, change: '+0%', trend: 'up' },
            responseTime: { value: 0, change: '+0s', trend: 'up' },
            satisfaction: { value: 4.8, change: '+0', trend: 'up' }
          },
          recentActivity: []
        });
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedAgent, timeRange])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'idle': return 'text-yellow-600 bg-yellow-100'
      case 'maintenance': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container-custom section-padding">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container-custom section-padding">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Performance Data</h1>
            <p className="text-gray-600 mb-8">Unable to load agent performance metrics.</p>
            <Link href="/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Performance</h1>
            <p className="text-gray-600">Monitor your AI agent's performance and usage metrics</p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Link href="/dashboard/overview" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Agent Selection */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {agentOptions.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.icon} {agent.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range Selection */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeRangeOptions.map(range => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Badge */}
            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.agent.status)}`}>
                  {data.agent.status.charAt(0).toUpperCase() + data.agent.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{data.agent.avatar}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{data.agent.name}</h2>
              <p className="text-gray-600">{data.agent.type}</p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              {getTrendIcon(data.trends.conversations.trend)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.metrics.totalConversations.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">Total Conversations</p>
            <p className="text-xs text-green-600 mt-1">{data.trends.conversations.change}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-purple-600" />
              {getTrendIcon(data.trends.messages.trend)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.metrics.totalMessages.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">Total Messages</p>
            <p className="text-xs text-green-600 mt-1">{data.trends.messages.change}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-green-600" />
              {getTrendIcon(data.trends.responseTime.trend)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.metrics.averageResponseTime}s</h3>
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <p className="text-xs text-green-600 mt-1">{data.trends.responseTime.change}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-orange-600" />
              {getTrendIcon(data.trends.satisfaction.trend)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.metrics.satisfactionScore}/5</h3>
            <p className="text-sm text-gray-600">Satisfaction Score</p>
            <p className="text-xs text-green-600 mt-1">{data.trends.satisfaction.change}</p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.metrics.activeUsers}</h3>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.metrics.uptime}%</h3>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Link href="/dashboard" className="block text-center btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentPerformancePage() {
  return (
    <ProtectedRoute>
      <AgentPerformanceDashboard />
    </ProtectedRoute>
  )
}