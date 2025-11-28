'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export default function PerformanceMetricsPage() {
  const { state } = useAuth()

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neural-900 mb-4">Please log in to view metrics</h1>
          <Link href="/auth/login" className="btn-primary inline-block">
            Log In
          </Link>
        </div>
      </div>
    )
  }

  const agents = [
    { name: 'Tech Wizard', uptime: '99.8%', avgResponse: '1.1s', satisfaction: '4.9/5' },
    { name: 'Einstein', uptime: '99.9%', avgResponse: '0.9s', satisfaction: '4.8/5' },
    { name: 'Chef Biew', uptime: '99.7%', avgResponse: '1.3s', satisfaction: '4.7/5' },
    { name: 'Emma Emotional', uptime: '99.6%', avgResponse: '1.5s', satisfaction: '4.6/5' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 border-b border-neural-200">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-neural-900 mb-2">
            Agent Performance Metrics
          </h1>
          <p className="text-neural-600">Monitor your AI agents performance and health</p>
        </div>
      </section>

      {/* Performance Overview */}
      <section className="py-16 px-4">
        <div className="container-custom">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Avg. Uptime', value: '99.75%', status: 'Excellent' },
              { label: 'Avg Response', value: '1.2s', status: 'Fast' },
              { label: 'User Satisfaction', value: '4.75/5', status: 'Great' },
              { label: 'Error Rate', value: '0.25%', status: 'Low' }
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white rounded-lg border border-neural-200"
              >
                <p className="text-neural-600 text-sm mb-2">{metric.label}</p>
                <h3 className="text-2xl font-bold text-neural-900 mb-2">{metric.value}</h3>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  {metric.status}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Agent Performance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg border border-neural-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neural-50 border-b border-neural-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neural-900">Agent</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neural-900">Uptime</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neural-900">Avg Response</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neural-900">Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, i) => (
                    <tr key={i} className="border-b border-neural-200 hover:bg-neural-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-neural-900">{agent.name}</td>
                      <td className="px-6 py-4 text-neural-600">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          {agent.uptime}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neural-600">{agent.avgResponse}</td>
                      <td className="px-6 py-4 text-neural-600">{agent.satisfaction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="mt-8">
            <Link href="/dashboard/overview" className="btn-secondary inline-block">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
