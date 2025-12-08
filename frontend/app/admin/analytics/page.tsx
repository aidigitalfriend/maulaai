'use client'

import { useEffect, useState } from 'react'
import { Users, Activity, MousePointerClick, UserPlus, RefreshCw } from 'lucide-react'

interface Stats {
  users: { total: number; active: number }
  pageViews: { total: number }
  events: { total: number; signups: number; logins: number }
}

interface User {
  _id: string
  email: string
  name: string
  createdAt: string
  lastLoginAt: string | null
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/analytics/stats'),
        fetch('/api/admin/analytics/users')
      ])

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()

      setStats(statsData.data)
      setUsers(usersData.data.users)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading && !stats) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-white text-xl">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">📊 Analytics Dashboard</h1>
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-gray-300 font-semibold">Total Users</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats.users.total}</p>
            </div>

            <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-6 h-6 text-green-400" />
                <h3 className="text-gray-300 font-semibold">Active (7d)</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats.users.active}</p>
            </div>

            <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <MousePointerClick className="w-6 h-6 text-purple-400" />
                <h3 className="text-gray-300 font-semibold">Page Views</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats.pageViews.total}</p>
            </div>

            <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <UserPlus className="w-6 h-6 text-yellow-400" />
                <h3 className="text-gray-300 font-semibold">Events</h3>
              </div>
              <p className="text-3xl font-bold text-white">{stats.events.total}</p>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Users ({users.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{user.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
