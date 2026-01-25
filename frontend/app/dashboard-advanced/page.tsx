'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Types for dashboard data
interface DashboardStats {
  totalRequests: number;
  requestChange: number;
  avgLatency: number;
  latencyChange: number;
  avgSuccessRate: number;
  successChange: number;
  totalCost: number;
  avgResponseSize: number;
  totalTokens: number;
  activeUsers: number;
  activeAgents?: number;
}

interface ApiMetric {
  endpoint: string;
  requests: number;
  latency: number;
  successRate: number;
}

interface ModelUsageItem {
  model: string;
  requests: number;
  tokens: number;
}

interface SuccessFailureItem {
  name: string;
  value: number;
}

interface PeakTrafficItem {
  hour: number;
  requests: number;
}

interface ErrorItem {
  type: string;
  count: number;
  lastOccurred: string;
}

interface GeographicItem {
  country: string;
  requests: number;
  latency: number;
}

interface CostDataItem {
  date: string;
  cost: number;
}

interface TokenTrendItem {
  date: string;
  tokens: number;
}

interface EndpointStatItem {
  endpoint: string;
  requests: number;
  avgLatency: number;
  successRate: number;
  errorCount: number;
}

interface RecentRequest {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userId: string | null;
}

interface AdvancedAnalyticsData {
  stats: DashboardStats;
  apiMetrics: ApiMetric[];
  modelUsage: ModelUsageItem[];
  successFailure: SuccessFailureItem[];
  peakTraffic: PeakTrafficItem[];
  errors: ErrorItem[];
  geographic: GeographicItem[];
  costData: CostDataItem[];
  tokenTrend: TokenTrendItem[];
  endpointStats: EndpointStatItem[];
  recentRequests: RecentRequest[];
  lastUpdated: string;
}

// Chart colors
const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

export default function AdvancedDashboard() {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) setLoading(true);
      setIsRefreshing(true);
      setError(null);

      const res = await fetch('/api/user/analytics/advanced', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Failed to load analytics: ${res.status}`);
      }

      const responseData: AdvancedAnalyticsData = await res.json();
      setData(responseData);
      setLastRefresh(new Date());
    } catch (err: unknown) {
      console.error('Failed to load advanced analytics', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(() => fetchAnalytics(false), 30 * 1000);

    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const handleManualRefresh = () => {
    fetchAnalytics(false);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-neural-50 to-neural-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neural-200 border-t-neural-600 mx-auto mb-4"></div>
          <p className="text-neural-600 font-medium">Loading real-time analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-neural-50 to-neural-100">
        <div className="bg-white rounded-2xl p-8 border border-red-200 shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-neural-900 mb-2">Analytics Unavailable</h2>
          <p className="text-neural-600 mb-4">{error}</p>
          <button 
            onClick={handleManualRefresh}
            className="px-6 py-2 bg-neural-600 text-white rounded-lg hover:bg-neural-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalRequests: 0,
    requestChange: 0,
    avgLatency: 0,
    latencyChange: 0,
    avgSuccessRate: 0,
    successChange: 0,
    totalCost: 0,
    avgResponseSize: 0,
    totalTokens: 0,
    activeUsers: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neural-50 to-neural-100">
      {/* Header */}
      <div className="bg-white border-b border-neural-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-neural-600 to-neural-800 rounded-xl flex items-center justify-center shadow-lg shadow-neural-500/25">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neural-900">Advanced Analytics</h1>
                <p className="text-neural-600 text-sm">Real-time performance monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-neural-500">Last updated</p>
                <p className="text-sm font-medium text-neural-700">{lastRefresh.toLocaleTimeString()}</p>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isRefreshing 
                    ? 'bg-neural-100 text-neural-400 cursor-not-allowed' 
                    : 'bg-neural-600 text-white hover:bg-neural-700 shadow-md hover:shadow-lg'
                }`}
              >
                <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon="📊"
            label="Total Requests (7d)"
            value={stats.totalRequests.toLocaleString()}
            change={stats.requestChange}
            changeLabel="vs prev 7d"
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            icon="⚡"
            label="Avg Latency"
            value={`${stats.avgLatency}ms`}
            change={-stats.latencyChange}
            changeLabel="vs prev 7d"
            gradient="from-purple-500 to-violet-600"
            invertPositive
          />
          <StatCard
            icon="✅"
            label="Success Rate"
            value={`${stats.avgSuccessRate.toFixed(1)}%`}
            change={stats.successChange}
            changeLabel="vs prev 7d"
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            icon="🪙"
            label="Total Tokens"
            value={formatNumber(stats.totalTokens)}
            gradient="from-amber-500 to-orange-600"
            noChange
          />
          <StatCard
            icon="🤖"
            label="Active Agents"
            value={(stats.activeAgents || stats.activeUsers || 0).toString()}
            gradient="from-cyan-500 to-teal-600"
            noChange
          />
        </div>

        {/* Charts Grid */}
        <div className="space-y-6">
          {/* Row 1: API Endpoints Performance & Peak Traffic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Top Endpoints (Last 7 Days)"
              icon="🧭"
              gradient="from-blue-500 to-indigo-600"
            >
              {data?.apiMetrics && data.apiMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.apiMetrics.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="endpoint" type="category" width={120} stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'requests' ? `${value.toLocaleString()} requests` : 
                        name === 'latency' ? `${value}ms` : 
                        `${value}%`,
                        name.charAt(0).toUpperCase() + name.slice(1)
                      ]}
                    />
                    <Bar dataKey="requests" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No API endpoint data available yet" />
              )}
            </ChartCard>

            <ChartCard
              title="Peak Traffic Hours (Last 24h)"
              icon="🕐"
              gradient="from-cyan-500 to-teal-600"
            >
              {data?.peakTraffic && data.peakTraffic.some(p => p.requests > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.peakTraffic}>
                    <defs>
                      <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#64748b" 
                      fontSize={12}
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value} requests`, 'Requests']}
                      labelFormatter={(hour) => `${hour}:00 - ${(hour as number) + 1}:00`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      fill="url(#trafficGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No traffic data available yet" />
              )}
            </ChartCard>
          </div>

          {/* Row 2: Model Usage & Success/Failure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Model Usage Distribution"
              icon="🧠"
              gradient="from-purple-500 to-violet-600"
            >
              {data?.modelUsage && data.modelUsage.length > 0 ? (
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={data.modelUsage}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="requests"
                        nameKey="model"
                      >
                        {data.modelUsage.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number, _name: string, props: { payload: ModelUsageItem }) => [
                          `${value.toLocaleString()} requests (${formatNumber(props.payload.tokens)} tokens)`,
                          props.payload.model
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 min-w-[140px]">
                    {data.modelUsage.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-sm text-neural-700 font-medium">{item.model}</span>
                        <span className="text-xs text-neural-500 ml-auto">{item.requests}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState message="No model usage data available yet" />
              )}
            </ChartCard>

            <ChartCard
              title="Request Success vs Failure"
              icon="📈"
              gradient="from-emerald-500 to-green-600"
            >
              {data?.successFailure && data.successFailure.some(s => s.value > 0) ? (
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={data.successFailure}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 min-w-[160px]">
                    {data.successFailure.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            idx === 0 ? 'bg-emerald-500' : 
                            idx === 1 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        />
                        <span className="text-sm text-neural-700 font-medium">{item.name}</span>
                        <span className="text-sm font-bold text-neural-900 ml-auto">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState message="No request data available yet" />
              )}
            </ChartCard>
          </div>

          {/* Row 3: Token Trend & Cost Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Token Usage Trend (7 Days)"
              icon="🔄"
              gradient="from-amber-500 to-orange-600"
            >
              {data?.tokenTrend && data.tokenTrend.some(t => t.tokens > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.tokenTrend}>
                    <defs>
                      <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatNumber} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [value.toLocaleString(), 'Tokens']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tokens" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      fill="url(#tokenGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No token usage data available yet" />
              )}
            </ChartCard>

            <ChartCard
              title="Estimated Cost Trend (7 Days)"
              icon="💰"
              gradient="from-emerald-500 to-green-600"
            >
              {data?.costData && data.costData.some(c => c.cost > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.costData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No cost data available yet" />
              )}
            </ChartCard>
          </div>

          {/* Row 4: Errors & Geographic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Error Breakdown"
              icon="⚠️"
              gradient="from-red-500 to-rose-600"
            >
              {data?.errors && data.errors.length > 0 ? (
                <div className="space-y-3">
                  {data.errors.map((error, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-4 bg-neural-50 rounded-xl border border-neural-100 hover:border-neural-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-bold text-sm">{error.count}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-neural-900">{error.type}</p>
                          <p className="text-xs text-neural-500">
                            Last: {new Date(error.lastOccurred).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No errors recorded 🎉" positive />
              )}
            </ChartCard>

            <ChartCard
              title="Client Distribution"
              icon="🖥️"
              gradient="from-cyan-500 to-blue-600"
            >
              {data?.geographic && data.geographic.length > 0 ? (
                <div className="space-y-3">
                  {data.geographic.slice(0, 6).map((geo, idx) => {
                    const maxRequests = Math.max(...data.geographic.map(g => g.requests));
                    const percentage = maxRequests > 0 ? (geo.requests / maxRequests) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-neural-900">{geo.country}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-neural-500">{geo.latency}ms</span>
                            <span className="font-bold text-neural-700">{geo.requests.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="w-full bg-neural-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message="No client data available yet" />
              )}
            </ChartCard>
          </div>

          {/* Row 5: Endpoint Stats Table & Recent Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Endpoint Performance"
              icon="🎯"
              gradient="from-violet-500 to-purple-600"
            >
              {data?.endpointStats && data.endpointStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-neural-500 uppercase tracking-wider">
                        <th className="pb-3">Endpoint</th>
                        <th className="pb-3 text-right">Requests</th>
                        <th className="pb-3 text-right">Latency</th>
                        <th className="pb-3 text-right">Success</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neural-100">
                      {data.endpointStats.slice(0, 8).map((stat, idx) => (
                        <tr key={idx} className="text-sm hover:bg-neural-50">
                          <td className="py-3 font-medium text-neural-900 truncate max-w-[150px]">
                            {stat.endpoint}
                          </td>
                          <td className="py-3 text-right text-neural-700">{stat.requests.toLocaleString()}</td>
                          <td className="py-3 text-right text-neural-700">{stat.avgLatency}ms</td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              stat.successRate >= 99 ? 'text-emerald-600' :
                              stat.successRate >= 95 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {stat.successRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState message="No endpoint statistics available yet" />
              )}
            </ChartCard>

            <ChartCard
              title="Recent Requests"
              icon="📋"
              gradient="from-slate-500 to-slate-700"
            >
              {data?.recentRequests && data.recentRequests.length > 0 ? (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
                  {data.recentRequests.slice(0, 10).map((req, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 bg-neural-50 rounded-lg border border-neural-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          req.method === 'GET' ? 'bg-green-100 text-green-700' :
                          req.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                          req.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                          req.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                          'bg-neural-100 text-neural-700'
                        }`}>
                          {req.method}
                        </span>
                        <span className="text-sm text-neural-700 truncate max-w-[140px]">{req.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${
                          req.statusCode < 300 ? 'text-emerald-600' :
                          req.statusCode < 400 ? 'text-blue-600' :
                          req.statusCode < 500 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {req.statusCode}
                        </span>
                        <span className="text-xs text-neural-500">{req.responseTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No recent requests recorded yet" />
              )}
            </ChartCard>
          </div>

          {/* Footer */}
          <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-neural-600">Real-time data • Auto-refreshes every 30 seconds</span>
              </div>
              <div className="text-sm text-neural-500">
                Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ 
  icon, 
  label, 
  value, 
  change, 
  changeLabel, 
  gradient, 
  invertPositive = false,
  noChange = false 
}: {
  icon: string;
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  gradient: string;
  invertPositive?: boolean;
  noChange?: boolean;
}) {
  const isPositive = invertPositive ? (change || 0) >= 0 : (change || 0) >= 0;
  
  return (
    <div className="bg-white rounded-2xl p-5 border border-neural-200 shadow-lg hover:shadow-xl hover:border-neural-300 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-neural-500 text-sm mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-neural-900">{value}</h3>
          {!noChange && change !== undefined && (
            <p className={`text-xs mt-1 font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% {changeLabel}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ 
  title, 
  icon, 
  gradient, 
  children 
}: { 
  title: string; 
  icon: string; 
  gradient: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-neural-200 shadow-lg">
      <h2 className="text-lg font-bold mb-5 flex items-center gap-3 text-neural-900">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md`}>
          <span className="text-lg">{icon}</span>
        </div>
        {title}
      </h2>
      {children}
    </div>
  );
}

function EmptyState({ message, positive = false }: { message: string; positive?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-[280px] text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
        positive ? 'bg-emerald-100' : 'bg-neural-100'
      }`}>
        <span className="text-3xl">{positive ? '✨' : '📭'}</span>
      </div>
      <p className={`${positive ? 'text-emerald-600' : 'text-neural-500'} font-medium`}>{message}</p>
      {!positive && (
        <p className="text-neural-400 text-sm mt-1">Data will appear once activity is recorded</p>
      )}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
