'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { gsap, ScrollTrigger, CustomWiggle, Observer } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger, CustomWiggle, Observer);

export const dynamic = 'force-dynamic';

export default function PerformanceMetricsPage() {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Please log in to view metrics
          </h1>
          <Link href="/auth/login" className="btn-primary inline-block">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const agents = [
    {
      name: 'Tech Wizard',
      uptime: '99.8%',
      avgResponse: '1.1s',
      satisfaction: '4.9/5',
    },
    {
      name: 'Einstein',
      uptime: '99.9%',
      avgResponse: '0.9s',
      satisfaction: '4.8/5',
    },
    {
      name: 'Chef Biew',
      uptime: '99.7%',
      avgResponse: '1.3s',
      satisfaction: '4.7/5',
    },
    {
      name: 'Emma Emotional',
      uptime: '99.6%',
      avgResponse: '1.5s',
      satisfaction: '4.6/5',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
        {/* Animated Background - Agents Page Theme */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[120px]" />
          <div className="absolute top-2/3 left-1/2 w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-[100px]" />
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
          {[...Array(15)].map((_, i) => (
            <div key={i} className="absolute w-1.5 h-1.5 bg-cyan-400/40 rounded-full" style={{ left: `${5 + i * 6}%`, top: `${10 + (i % 5) * 18}%` }} />
          ))}
        </div>

      {/* Header */}
      <section className="py-12 px-4 border-b border-white/10">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Agent Performance Metrics
          </h1>
          <p className="text-gray-400">
            Monitor your AI agents performance and health
          </p>
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
              { label: 'Error Rate', value: '0.25%', status: 'Low' },
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white/5 rounded-lg border border-white/10"
              >
                <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {metric.value}
                </h3>
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
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
            className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0f] border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Agent
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Uptime
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Avg Response
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Satisfaction
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/10 hover:bg-[#0a0a0f] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {agent.name}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          {agent.uptime}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {agent.avgResponse}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {agent.satisfaction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="mt-8">
            <Link
              href="/dashboard/overview"
              className="btn-secondary inline-block"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
