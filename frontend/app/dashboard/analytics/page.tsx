'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'

export default function DashboardAnalyticsPage() {
  const { state } = useAuth()

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neural-900 mb-4">Please log in to view analytics</h1>
          <Link href="/auth/login" className="btn-primary inline-block">
            Log In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 border-b border-neural-200">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-neural-900 mb-2">
            Analytics & Insights
          </h1>
          <p className="text-neural-600">Track your agent performance and usage metrics</p>
        </div>
      </section>

      {/* Analytics Grid */}
      <section className="py-16 px-4">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Interactions', value: '2,847', trend: '+12%' },
              { label: 'Active Agents', value: '8', trend: '+2' },
              { label: 'Avg. Satisfaction', value: '4.8/5', trend: '+0.3' },
              { label: 'Processing Time', value: '1.2s', trend: '-0.3s' }
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white rounded-lg border border-neural-200 hover:border-brand-500 transition-colors"
              >
                <p className="text-neural-600 text-sm mb-2">{metric.label}</p>
                <h3 className="text-2xl font-bold text-neural-900 mb-2">{metric.value}</h3>
                <p className="text-green-600 text-sm">{metric.trend}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Placeholder */}
          <div className="bg-white rounded-lg border border-neural-200 p-8 text-center">
            <p className="text-neural-600 mb-4">Analytics charts and detailed metrics coming soon</p>
            <Link href="/dashboard/overview" className="btn-secondary inline-block">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
