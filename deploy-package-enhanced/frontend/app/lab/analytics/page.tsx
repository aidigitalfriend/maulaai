'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Sparkles,
  Clock,
  Zap,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import Link from 'next/link'

interface ExperimentStat {
  id: string
  name: string
  tests: number
  activeUsers: number
  avgDuration: string
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  color: string
}

interface RealtimeData {
  totalUsers: number
  activeExperiments: number
  testsToday: number
  avgSessionTime: string
}

export default function AnalyticsPage() {
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    totalUsers: 2847,
    activeExperiments: 10,
    testsToday: 1523,
    avgSessionTime: '8m 32s'
  })

  const [experimentStats, setExperimentStats] = useState<ExperimentStat[]>([
    {
      id: 'image-playground',
      name: 'AI Image Playground',
      tests: 12450,
      activeUsers: 342,
      avgDuration: '12m 45s',
      trend: 'up',
      trendValue: 15.3,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'story-weaver',
      name: 'AI Story Weaver',
      tests: 11200,
      activeUsers: 289,
      avgDuration: '18m 20s',
      trend: 'up',
      trendValue: 22.8,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'neural-art',
      name: 'Neural Art Studio',
      tests: 9840,
      activeUsers: 256,
      avgDuration: '10m 15s',
      trend: 'up',
      trendValue: 8.7,
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'voice-cloning',
      name: 'Voice Cloning Studio',
      tests: 8920,
      activeUsers: 198,
      avgDuration: '15m 30s',
      trend: 'down',
      trendValue: -3.2,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'emotion-visualizer',
      name: 'Emotion Visualizer',
      tests: 8340,
      activeUsers: 187,
      avgDuration: '7m 45s',
      trend: 'up',
      trendValue: 12.5,
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'personality-mirror',
      name: 'Personality Mirror',
      tests: 7650,
      activeUsers: 165,
      avgDuration: '14m 10s',
      trend: 'stable',
      trendValue: 0.8,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'music-generator',
      name: 'AI Music Generator',
      tests: 6730,
      activeUsers: 143,
      avgDuration: '9m 50s',
      trend: 'up',
      trendValue: 18.4,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'debate-arena',
      name: 'AI Debate Arena',
      tests: 6120,
      activeUsers: 132,
      avgDuration: '11m 25s',
      trend: 'up',
      trendValue: 9.1,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'dream-interpreter',
      name: 'Dream Interpreter',
      tests: 5420,
      activeUsers: 98,
      avgDuration: '13m 05s',
      trend: 'stable',
      trendValue: 1.2,
      color: 'from-violet-500 to-purple-500'
    },
    {
      id: 'future-predictor',
      name: 'Future Predictor',
      tests: 4890,
      activeUsers: 87,
      avgDuration: '10m 40s',
      trend: 'down',
      trendValue: -2.8,
      color: 'from-indigo-500 to-blue-500'
    }
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 10 - 3),
        testsToday: prev.testsToday + Math.floor(Math.random() * 5)
      }))

      setExperimentStats(prev => prev.map(stat => ({
        ...stat,
        activeUsers: Math.max(0, stat.activeUsers + Math.floor(Math.random() * 10 - 5))
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4" />
    if (trend === 'down') return <ArrowDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-400'
    if (trend === 'down') return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link href="/lab" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6">
            <span>←</span> Back to AI Lab
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <BarChart3 className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Real-time Analytics
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Live statistics and usage data for all AI Lab experiments
          </p>
          
          {/* Live Indicator */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-semibold">LIVE</span>
            <span className="text-gray-300 text-sm">Updates every 3 seconds</span>
          </div>
        </motion.div>

        {/* Real-time Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-cyan-400" />
              <motion.div
                key={realtimeData.totalUsers}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xs text-cyan-400 font-semibold"
              >
                LIVE
              </motion.div>
            </div>
            <motion.div
              key={realtimeData.totalUsers}
              initial={{ scale: 1.1, color: '#22d3ee' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold mb-2"
            >
              {realtimeData.totalUsers.toLocaleString()}
            </motion.div>
            <div className="text-sm text-gray-300">Active Users Now</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <div className="text-xs text-green-400 font-semibold flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> 12%
              </div>
            </div>
            <motion.div
              key={realtimeData.testsToday}
              initial={{ scale: 1.1, color: '#facc15' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold mb-2"
            >
              {realtimeData.testsToday.toLocaleString()}
            </motion.div>
            <div className="text-sm text-gray-300">Tests Today</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-purple-400" />
              <div className="text-xs text-purple-400 font-semibold">ALL</div>
            </div>
            <div className="text-4xl font-bold mb-2">{realtimeData.activeExperiments}</div>
            <div className="text-sm text-gray-300">Active Experiments</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-pink-400" />
              <div className="text-xs text-gray-400 font-semibold">AVG</div>
            </div>
            <div className="text-4xl font-bold mb-2">{realtimeData.avgSessionTime}</div>
            <div className="text-sm text-gray-300">Session Duration</div>
          </motion.div>
        </div>

        {/* Popular Experiments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">Most Popular Experiments</h2>
          </div>

          <div className="space-y-4">
            {experimentStats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Rank & Name */}
                  <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl font-bold`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{stat.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{stat.tests.toLocaleString()} total tests</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8">
                    {/* Active Users */}
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <motion.span
                          key={stat.activeUsers}
                          initial={{ scale: 1.2, color: '#22d3ee' }}
                          animate={{ scale: 1, color: '#ffffff' }}
                          transition={{ duration: 0.3 }}
                          className="text-2xl font-bold"
                        >
                          {stat.activeUsers}
                        </motion.span>
                      </div>
                      <div className="text-xs text-gray-400">Active Now</div>
                    </div>

                    {/* Avg Duration */}
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-2xl font-bold">{stat.avgDuration}</span>
                      </div>
                      <div className="text-xs text-gray-400">Avg Duration</div>
                    </div>

                    {/* Trend */}
                    <div className="text-center">
                      <div className={`flex items-center gap-1 mb-1 ${getTrendColor(stat.trend)}`}>
                        {getTrendIcon(stat.trend)}
                        <span className="text-2xl font-bold">{Math.abs(stat.trendValue)}%</span>
                      </div>
                      <div className="text-xs text-gray-400">24h Trend</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.tests / 12450) * 100}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.05 }}
                      className={`h-full bg-gradient-to-r ${stat.color}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Real-time Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-green-400" />
            <h2 className="text-3xl font-bold">Live Activity Stream</h2>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2" />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[
              { user: 'User #2847', action: 'completed', experiment: 'AI Image Playground', time: 'Just now', color: 'text-pink-400' },
              { user: 'User #2846', action: 'started', experiment: 'Story Weaver', time: '5s ago', color: 'text-green-400' },
              { user: 'User #2845', action: 'completed', experiment: 'Voice Cloning Studio', time: '12s ago', color: 'text-purple-400' },
              { user: 'User #2844', action: 'started', experiment: 'Emotion Visualizer', time: '18s ago', color: 'text-red-400' },
              { user: 'User #2843', action: 'completed', experiment: 'Neural Art Studio', time: '25s ago', color: 'text-orange-400' },
              { user: 'User #2842', action: 'started', experiment: 'Personality Mirror', time: '31s ago', color: 'text-teal-400' },
              { user: 'User #2841', action: 'completed', experiment: 'Music Generator', time: '38s ago', color: 'text-blue-400' },
              { user: 'User #2840', action: 'started', experiment: 'Debate Arena', time: '44s ago', color: 'text-yellow-400' }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.05 }}
                className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.action === 'started' ? 'bg-green-400' : 'bg-blue-400'} animate-pulse`} />
                  <span className="text-gray-300">{activity.user}</span>
                  <span className="text-gray-500">{activity.action}</span>
                  <span className={`font-semibold ${activity.color}`}>{activity.experiment}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
