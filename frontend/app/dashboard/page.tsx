'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import type { AnalyticsData } from '@/models/analytics';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  MessageSquare,
  Zap,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  X,
} from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const { state } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState<{
    agent: string;
    slug: string;
    plan: string;
  } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Check for subscription success
    if (searchParams.get('success') === 'true') {
      const agent = searchParams.get('agent');
      const slug = searchParams.get('slug');
      const plan = searchParams.get('plan');

      if (agent && slug && plan) {
        setSubscriptionSuccess({ agent, slug, plan });
        setShowSuccessMessage(true);

        // Clear URL parameters after showing success message
        const url = new URL(window.location.href);
        url.searchParams.delete('success');
        url.searchParams.delete('agent');
        url.searchParams.delete('slug');
        url.searchParams.delete('plan');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams]);

  const fetchAnalytics = useCallback(async () => {
    if (!state.user) return;

    setError(null);

    if (!hasLoadedRef.current) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    const controller = new AbortController();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = controller;

    try {
      const [analyticsResponse, billingResponse] = await Promise.all([
        fetch('/api/user/analytics', {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        }),
        fetch(`/api/user/billing/${state.user.id}`, {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        }),
      ]);

      const analyticsPayload: unknown = await analyticsResponse.json();

      if (!analyticsResponse.ok) {
        const message =
          (analyticsPayload &&
          typeof analyticsPayload === 'object' &&
          'error' in analyticsPayload
            ? (analyticsPayload as { error?: string }).error
            : undefined) ||
          (analyticsPayload &&
          typeof analyticsPayload === 'object' &&
          'message' in analyticsPayload
            ? (analyticsPayload as { message?: string }).message
            : undefined) ||
          'Failed to load analytics';
        throw new Error(message);
      }

      let mergedAnalytics = analyticsPayload as AnalyticsData;

      if (billingResponse.ok) {
        const billingJson = await billingResponse.json();
        const billingPlan = billingJson?.data?.currentPlan;

        if (billingPlan) {
          mergedAnalytics = {
            ...mergedAnalytics,
            subscription: {
              ...mergedAnalytics.subscription,
              plan:
                billingPlan.name ||
                mergedAnalytics.subscription.plan ||
                'No Active Plan',
              status: billingPlan.status || 'inactive',
              price:
                typeof billingPlan.price === 'number'
                  ? billingPlan.price
                  : mergedAnalytics.subscription.price,
              period:
                billingPlan.period ||
                mergedAnalytics.subscription.period ||
                'month',
              renewalDate:
                billingPlan.renewalDate ||
                mergedAnalytics.subscription.renewalDate ||
                'N/A',
              daysUntilRenewal:
                typeof billingPlan.daysUntilRenewal === 'number'
                  ? billingPlan.daysUntilRenewal
                  : mergedAnalytics.subscription.daysUntilRenewal || 0,
            },
          };
        }
      }

      setAnalyticsData(mergedAnalytics);
      setLastUpdated(new Date());
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      console.error('Error fetching analytics:', err);
      setError((err as Error).message || 'Unable to load analytics');
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [state.user]);

  useEffect(() => {
    if (!state.user) return;

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);

    return () => {
      clearInterval(interval);
      abortControllerRef.current?.abort();
    };
  }, [state.user, fetchAnalytics]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-neural-600">Loading your dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!analyticsData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center max-w-lg">
            <h2 className="text-2xl font-semibold text-neural-900 mb-3">
              {error || 'Unable to load analytics right now'}
            </h2>
            <p className="text-neural-600 mb-6">
              Please verify your session is active and try refreshing the data.
            </p>
            <button
              onClick={() => fetchAnalytics()}
              className="btn-primary"
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Retry'}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const successRate =
    analyticsData.agentPerformance?.length > 0
      ? (
          analyticsData.agentPerformance.reduce(
            (sum, agent) => sum + (agent.successRate || 0),
            0
          ) / analyticsData.agentPerformance.length
        ).toFixed(1)
      : 'N/A';

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const quickStats = [
    {
      label: 'Active Agents',
      value: analyticsData.usage.agents.current.toString(),
      change: analyticsData.weeklyTrend.conversationsChange,
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Total Conversations',
      value: analyticsData.usage.conversations.current.toLocaleString(),
      change: analyticsData.weeklyTrend.conversationsChange,
      trend: 'up',
      icon: MessageSquare,
      color: 'green',
    },
    {
      label: 'API Calls',
      value: analyticsData.usage.apiCalls.current.toLocaleString(),
      change: analyticsData.weeklyTrend.apiCallsChange,
      trend: 'up',
      icon: Zap,
      color: 'purple',
    },
    {
      label: 'Success Rate',
      value: successRate === 'N/A' ? 'N/A' : `${successRate}%`,
      change: successRate === 'N/A' ? 'No data yet' : '+1.3% this week',
      trend: 'up',
      icon: CheckCircle,
      color: 'emerald',
    },
  ];

  const dashboardSections = [
    {
      title: 'Advanced Analytics',
      description:
        'Real-time analytics dashboard with 10+ metrics including API requests, latency, model usage, geographic distribution, and cost estimation.',
      icon: '📊',
      href: '/dashboard-advanced',
      stats: [
        'API Metrics',
        'Model Performance',
        'Cost Tracking',
        'Error Analysis',
      ],
      badge: 'NEW',
    },
    {
      title: 'Analytics & Insights',
      description:
        'Monitor performance metrics, user interactions, and get actionable insights.',
      icon: '�',
      href: '/dashboard/analytics',
      stats: [
        'Real-time Metrics',
        'Performance Trends',
        'User Engagement',
        'Success Rates',
      ],
    },
    {
      title: 'Conversation History',
      description:
        'Review all interactions, search conversations, and analyze patterns.',
      icon: '💬',
      href: '/dashboard/conversation-history',
      stats: [
        'Search & Filter',
        'Export Data',
        'Pattern Analysis',
        'Quality Scores',
      ],
    },
    {
      title: 'Billing & Usage',
      description:
        'Track your usage, manage billing, and optimize costs effectively.',
      icon: '💳',
      href: '/dashboard/billing',
      stats: [
        'Usage Tracking',
        'Cost Analysis',
        'Billing History',
        'Plan Management',
      ],
    },
    {
      title: 'Agent Performance',
      description:
        'Deep dive into individual agent metrics and optimization opportunities.',
      icon: '🤖',
      href: '/dashboard/agent-performance',
      stats: [
        'Response Times',
        'Accuracy Metrics',
        'Learning Progress',
        'Optimization Tips',
      ],
    },
    {
      title: 'Agent Management',
      description:
        'Manage access, unlock agents, and adjust plans with quick upgrade and downgrade actions.',
      icon: '🛠️',
      href: '/dashboard/agent-management',
      stats: [
        'Unlock Agents',
        'Upgrade or Downgrade',
        'Cancel Plans',
        'Stripe Checkout Redirect',
      ],
      badge: 'BETA',
    },
  ];

  const hasActiveAgents = analyticsData.usage.agents.current > 0;
  const isAgentActive =
    (analyticsData.agentStatus || '').toLowerCase() === 'active' ||
    hasActiveAgents;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container-custom section-padding-lg">
          {error && analyticsData && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">Real-time data may be delayed.</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => fetchAnalytics()}
                className="btn-secondary"
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing…' : 'Retry'}
              </button>
            </div>
          )}
          {/* Subscription Success Message */}
          {showSuccessMessage && subscriptionSuccess && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      🎉 Subscription Successful!
                    </h3>
                    <p className="text-green-700 mb-4">
                      You now have access to{' '}
                      <strong>{subscriptionSuccess.agent}</strong> with your{' '}
                      <strong>{subscriptionSuccess.plan}</strong> plan.
                    </p>
                    <Link
                      href={`/agents/${subscriptionSuccess.slug}`}
                      className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Start Chatting <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-3">
                Your Dashboard
              </h1>
              <p className="text-lg text-neural-600">
                Monitor your AI agents, track usage, and manage your
                subscription in real-time.
              </p>
              {lastUpdated && (
                <p className="text-sm text-neural-500 mt-2">
                  Last updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Agent Status Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-neural-200 min-w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-neural-600">Agent Status</p>
                  <p className="text-2xl font-bold text-neural-800">
                    {isAgentActive ? 'Active' : 'Inactive'}
                  </p>
                  {/* Real-time Agent Status */}
                  <p className="text-xs mt-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full font-semibold text-xs ${
                        isAgentActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isAgentActive ? 'Active' : 'No Active'}
                    </span>
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isAgentActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isAgentActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="mt-2 mb-4 text-sm text-neural-600">
                {hasActiveAgents ? (
                  <>
                    You currently have{' '}
                    <span className="font-semibold text-neural-900">
                      {analyticsData.usage.agents.current} active agent
                      {analyticsData.usage.agents.current === 1 ? '' : 's'}
                    </span>
                    .
                  </>
                ) : (
                  'You have no active agent plans. Activate an agent to start tracking usage.'
                )}
              </div>

              <Link
                href="/dashboard/agent-management"
                className="mt-4 w-full btn-secondary text-center block text-sm"
              >
                Manage Agents
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-neural-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-neural-600 mb-1">
                    {stat.label}
                  </h3>
                  <div className="text-3xl font-bold text-neural-800 mb-2">
                    {stat.value}
                  </div>
                  <div
                    className={`text-sm flex items-center ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Usage Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Usage Meters */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neural-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neural-800">
                  Resource Usage
                </h2>
                <Activity className="w-6 h-6 text-brand-600" />
              </div>
              <div className="space-y-6">
                {Object.entries(analyticsData.usage).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-neural-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span
                        className={`text-sm font-semibold ${getStatusColor(
                          value.percentage
                        )}`}
                      >
                        {value.current.toLocaleString()} /{' '}
                        {value.limit.toLocaleString()} {value.unit || ''}
                      </span>
                    </div>
                    <div className="w-full bg-neural-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                          value.percentage
                        )}`}
                        style={{ width: `${Math.min(value.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neural-500 mt-1">
                      {value.percentage.toFixed(1)}% used
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Activity Chart */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neural-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neural-800">
                  7-Day Activity
                </h2>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-4">
                {/* Chart */}
                <div className="flex items-end justify-between h-48 gap-2">
                  {analyticsData.dailyUsage.length > 0 ? (
                    analyticsData.dailyUsage.map((day, index) => {
                      const maxConversations = Math.max(
                        ...analyticsData.dailyUsage.map(
                          (d) => d.conversations || 0
                        ),
                        1
                      );
                      const height =
                        (day.conversations / maxConversations) * 100 || 0;
                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center group"
                        >
                          <div className="relative w-full">
                            <div
                              className="w-full bg-gradient-to-t from-brand-500 to-brand-300 rounded-t-lg transition-all duration-300 group-hover:from-brand-600 group-hover:to-brand-400 cursor-pointer"
                              style={{
                                height: `${height}%`,
                                minHeight: '20px',
                              }}
                            >
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-neural-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10">
                                <p className="font-semibold">
                                  {day.conversations} conversations
                                </p>
                                <p>{day.messages} messages</p>
                                <p>{day.apiCalls} API calls</p>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-neural-500 mt-2">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full text-center text-sm text-neural-500">
                      No activity recorded for the past week.
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 pt-4 border-t border-neural-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                    <span className="text-sm text-neural-600">
                      Conversations
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      {analyticsData.weeklyTrend.conversationsChange}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Performance & Cost Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Top Performing Agents */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neural-100">
              <h2 className="text-2xl font-bold text-neural-800 mb-6">
                Top Agents
              </h2>
              <div className="space-y-4">
                {analyticsData.topAgents.map((agent, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-neural-700">
                        {agent.name}
                      </span>
                      <span className="text-sm font-semibold text-brand-600">
                        {agent.usage}%
                      </span>
                    </div>
                    <div className="w-full bg-neural-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                        style={{ width: `${agent.usage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neural-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neural-800">
                  Cost Analysis
                </h2>
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm text-neural-700">Current Month</span>
                  <span className="text-2xl font-bold text-brand-600">
                    ${analyticsData.costAnalysis.currentMonth}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="text-sm text-neural-700">
                    Projected Total
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    ${analyticsData.costAnalysis.projectedMonth}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-neural-700 mb-3">
                  Cost Breakdown
                </p>
                {analyticsData.costAnalysis.breakdown.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-neural-600">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neural-800">
                        ${item.cost}
                      </span>
                      <span className="text-xs text-neural-500">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Performance Table */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-neural-100 mb-12">
            <h2 className="text-2xl font-bold text-neural-800 mb-6">
              Agent Performance Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neural-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neural-700">
                      Agent Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neural-700">
                      Conversations
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neural-700">
                      Messages
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neural-700">
                      Avg Response
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neural-700">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.agentPerformance.map((agent, index) => (
                    <tr
                      key={index}
                      className="border-b border-neural-100 hover:bg-neural-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium text-neural-800">
                          {agent.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-neural-700">
                        {agent.conversations.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-neural-700">
                        {agent.messages.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1 text-neural-700">
                          <Clock className="w-4 h-4" />
                          {agent.avgResponseTime}s
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-semibold ${
                            agent.successRate >= 95
                              ? 'text-green-600'
                              : agent.successRate >= 90
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {agent.successRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-neural-100 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neural-800">
                Recent Activity
              </h2>
              <span className="text-sm text-neural-600">Last 30 minutes</span>
            </div>
            <div className="space-y-3">
              {analyticsData.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-neural-50 rounded-lg hover:bg-neural-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.status === 'success'
                          ? 'bg-green-500'
                          : activity.status === 'active'
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-neural-800">
                        {activity.action}
                      </p>
                      <p className="text-xs text-neural-600">
                        {activity.agent}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-neural-500">
                    {activity.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {dashboardSections.map((section, index) => (
              <Link
                key={index}
                href={section.href}
                className="group relative bg-white rounded-2xl p-8 shadow-sm border border-neural-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300"
              >
                {section.badge && (
                  <div className="absolute top-4 right-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {section.badge}
                  </div>
                )}
                <div className="text-4xl mb-4">{section.icon}</div>
                <h3 className="text-xl font-bold text-neural-800 mb-3 group-hover:text-brand-600 transition-colors">
                  {section.title}
                </h3>
                <p className="text-neural-600 mb-4 leading-relaxed">
                  {section.description}
                </p>
                <ul className="space-y-2">
                  {section.stats.map((stat, statIndex) => (
                    <li
                      key={statIndex}
                      className="text-sm text-neural-500 flex items-center"
                    >
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-3"></span>
                      {stat}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
            <h2 className="text-2xl font-bold text-neural-800 mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/agents/create"
                className="flex items-center p-4 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors group"
              >
                <span className="text-2xl mr-3">➕</span>
                <div>
                  <div className="font-medium text-neural-800 group-hover:text-brand-600">
                    Create New Agent
                  </div>
                  <div className="text-sm text-neural-600">
                    Deploy a new AI agent
                  </div>
                </div>
              </Link>
              <Link
                href="/support/contact-us"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <span className="text-2xl mr-3">💬</span>
                <div>
                  <div className="font-medium text-neural-800 group-hover:text-green-600">
                    Get Support
                  </div>
                  <div className="text-sm text-neural-600">
                    Contact our support team
                  </div>
                </div>
              </Link>
              <Link
                href="/resources/documentation"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
              >
                <span className="text-2xl mr-3">📚</span>
                <div>
                  <div className="font-medium text-neural-800 group-hover:text-purple-600">
                    View Documentation
                  </div>
                  <div className="text-sm text-neural-600">
                    Learn more about features
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neural-900 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
