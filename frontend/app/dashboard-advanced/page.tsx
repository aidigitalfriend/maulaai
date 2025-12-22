'use client';

import { useState, useEffect } from 'react';
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
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface ApiMetrics {
  date: string;
  requests: number;
  latency: number;
  successRate: number;
  failureRate: number;
  tokenUsage: number;
  responseSize: number;
}

interface ModelUsage {
  model: string;
  usage: number;
  percentage: number;
  color: string;
}

interface ErrorType {
  type: string;
  count: number;
  percentage: number;
}

interface GeographicData {
  region: string;
  requests: number;
  percentage: number;
}

interface PeakTraffic {
  hour: number;
  requests: number;
}

interface CostData {
  model: string;
  cost: number;
  percentage: number;
}

interface TokenTrendPoint {
  date: string;
  tokens: number;
}

interface DashboardStats {
  totalRequests: number;
  requestChange: number;
  avgLatency: number;
  latencyChange: number;
  avgSuccessRate: number;
  successChange: number;
  totalCost: number;
}

interface AdvancedAnalyticsPayload {
  stats: DashboardStats;
  apiMetrics: ApiMetrics[];
  modelUsage: ModelUsage[];
  successFailure: { day: string; successful: number; failed: number }[];
  peakTraffic: PeakTraffic[];
  errors: ErrorType[];
  geographic: GeographicData[];
  costData: CostData[];
  tokenTrend: TokenTrendPoint[];
}

export default function AdvancedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [apiMetrics, setApiMetrics] = useState<ApiMetrics[]>([]);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [successFailure, setSuccessFailure] = useState<
    AdvancedAnalyticsPayload['successFailure']
  >([]);
  const [peakTraffic, setPeakTraffic] = useState<PeakTraffic[]>([]);
  const [errors, setErrors] = useState<ErrorType[]>([]);
  const [geographic, setGeographic] = useState<GeographicData[]>([]);
  const [costData, setCostData] = useState<CostData[]>([]);
  const [tokenTrend, setTokenTrend] = useState<TokenTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
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

        const data: AdvancedAnalyticsPayload = await res.json();

        if (!isMounted) return;

        setStats(data.stats);
        setApiMetrics(data.apiMetrics || []);
        setModelUsage(data.modelUsage || []);
        setSuccessFailure(data.successFailure || []);
        setPeakTraffic(data.peakTraffic || []);
        setErrors(data.errors || []);
        setGeographic(data.geographic || []);
        setCostData(data.costData || []);
        setTokenTrend(data.tokenTrend || []);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to load advanced analytics', err);
        setError('Failed to load analytics data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">
            Monitor your AI API usage and performance metrics
          </p>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: '📊',
              label: 'Total Requests (7d)',
              value: stats.totalRequests.toLocaleString(),
              change: `${stats.requestChange > 0 ? '+' : ''}${
                stats.requestChange
              }%`,
              positive: stats.requestChange >= 0,
            },
            {
              icon: '⚡',
              label: 'Avg Latency',
              value: `${stats.avgLatency}ms`,
              change: `${stats.latencyChange > 0 ? '+' : ''}${
                stats.latencyChange
              }%`,
              positive: stats.latencyChange <= 0,
            },
            {
              icon: '✅',
              label: 'Success Rate',
              value: `${stats.avgSuccessRate}%`,
              change: `${stats.successChange > 0 ? '+' : ''}${
                stats.successChange
              }%`,
              positive: stats.successChange >= 0,
            },
            {
              icon: '💰',
              label: 'Est. Weekly Cost',
              value: `$${stats.totalCost.toFixed(2)}`,
              change: 'Last 7 days',
              positive: true,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-indigo-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                  <p
                    className={`text-sm mt-2 ${
                      stat.positive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Row 1: API Requests & Latency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Requests */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🧭</span> API Requests (Last 7 Days)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={apiMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Average Latency */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Average Latency (ms)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={apiMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="latency" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Model Usage & Success vs Failure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Usage Distribution */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🧠</span> Model Usage Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={modelUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ model, percentage }) =>
                      `${model} (${percentage}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="usage"
                  >
                    {modelUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Success vs Failure Rate */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">📈</span> Request Success vs Failure
                Rate
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={successFailure}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="successful"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar dataKey="failed" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: Token Usage & Peak Traffic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Token Usage Trend */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🔄</span> Token Usage Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={tokenTrend}>
                  <defs>
                    <linearGradient
                      id="colorTokens"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorTokens)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Peak Traffic Hours */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🕓</span> Peak Traffic Hours
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={peakTraffic}>
                  <defs>
                    <linearGradient
                      id="colorTraffic"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="hour"
                    stroke="#94a3b8"
                    label={{
                      value: 'Hour of Day',
                      position: 'insideBottomRight',
                      offset: -5,
                    }}
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value) => [`${value} requests`, 'Requests']}
                    labelFormatter={(label) => `${label}:00`}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#colorTraffic)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 4: Error Types, Geographic & Cost */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Error Type Breakdown */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🧩</span> Error Type Breakdown
              </h2>
              <div className="space-y-4">
                {errors.map((error, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded"
                  >
                    <div>
                      <p className="font-semibold">{error.type}</p>
                      <p className="text-sm text-slate-400">
                        {error.count} errors
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{error.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🌍</span> Geographic Distribution
              </h2>
              <div className="space-y-4">
                {geographic.map((region, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{region.region}</p>
                      <span className="text-sm text-slate-400">
                        {region.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full"
                        style={{ width: `${region.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Estimation by Model */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">💰</span> Cost by Model
              </h2>
              <div className="space-y-4">
                {costData.map((cost, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded"
                  >
                    <div>
                      <p className="font-semibold">{cost.model}</p>
                      <p className="text-sm text-slate-400">
                        {cost.percentage}% of total
                      </p>
                    </div>
                    <div className="text-right font-bold text-green-400">
                      ${cost.cost.toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total:</span>
                    <span className="text-lg text-green-400">
                      ${costData.reduce((sum, c) => sum + c.cost, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Response Size & Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Average Response Size */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🧾</span> Average Response Size
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={apiMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis
                    stroke="#94a3b8"
                    label={{ value: 'KB', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value) => [`${value} KB`, 'Size']}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseSize"
                    stroke="#ec4899"
                    strokeWidth={3}
                    dot={{ fill: '#ec4899', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats Table */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-6">Summary Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Total API Calls</span>
                  <span className="font-bold">
                    {stats.totalRequests.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Average Latency</span>
                  <span className="font-bold">{stats.avgLatency}ms</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Success Rate</span>
                  <span className="font-bold text-green-400">
                    {stats.avgSuccessRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Weekly Cost</span>
                  <span className="font-bold text-green-400">
                    ${stats.totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Models Used</span>
                  <span className="font-bold">{modelUsage.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="text-slate-300">Error Count</span>
                  <span className="font-bold text-red-400">
                    {errors.reduce((sum, e) => sum + e.count, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
            <p className="text-slate-400 mb-2">
              Data is updated every 5 minutes
            </p>
            <p className="text-sm text-slate-500">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
