'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'

export default function BillingPage() {
  const { state } = useAuth()

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neural-900 mb-4">Please log in to view billing</h1>
          <Link href="/auth/login" className="btn-primary inline-block">
            Log In
          </Link>
        </div>
      </div>
    )
  }

  const invoices = [
    { id: 'INV-2024-001', date: '2024-01-01', amount: '$49.99', status: 'Paid' },
    { id: 'INV-2024-002', date: '2024-02-01', amount: '$49.99', status: 'Paid' },
    { id: 'INV-2024-003', date: '2024-03-01', amount: '$49.99', status: 'Due' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 border-b border-neural-200">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-neural-900 mb-2">
            Billing & Usage
          </h1>
          <p className="text-neural-600">Manage your subscription and payment methods</p>
        </div>
      </section>

      {/* Billing Overview */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-3xl">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-lg border border-neural-200 mb-8"
          >
            <h2 className="text-xl font-semibold text-neural-900 mb-4">Current Plan</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-neural-600 text-sm mb-1">Plan Type</p>
                <p className="text-lg font-semibold text-neural-900">Professional</p>
              </div>
              <div>
                <p className="text-neural-600 text-sm mb-1">Monthly Cost</p>
                <p className="text-lg font-semibold text-neural-900">$49.99</p>
              </div>
              <div>
                <p className="text-neural-600 text-sm mb-1">Renewal Date</p>
                <p className="text-lg font-semibold text-neural-900">2024-04-01</p>
              </div>
            </div>
            <Link href="/pricing" className="btn-secondary inline-block">
              Upgrade Plan
            </Link>
          </motion.div>

          {/* Usage Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-white rounded-lg border border-neural-200 mb-8"
          >
            <h2 className="text-xl font-semibold text-neural-900 mb-4">Usage This Month</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neural-600 mb-2">API Calls</p>
                <div className="w-full bg-neural-200 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-neural-500 mt-1">6,500 / 10,000</p>
              </div>
              <div>
                <p className="text-sm text-neural-600 mb-2">Storage</p>
                <div className="w-full bg-neural-200 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-xs text-neural-500 mt-1">4.5 GB / 10 GB</p>
              </div>
            </div>
          </motion.div>

          {/* Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-white rounded-lg border border-neural-200"
          >
            <h2 className="text-xl font-semibold text-neural-900 mb-4">Invoices</h2>
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex justify-between items-center p-4 bg-neural-50 rounded">
                  <div>
                    <p className="font-medium text-neural-900">{inv.id}</p>
                    <p className="text-sm text-neural-600">{inv.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neural-900">{inv.amount}</p>
                    <p className={`text-sm ${inv.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                      {inv.status}
                    </p>
                  </div>
                </div>
              ))}
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
