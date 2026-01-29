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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, CustomWiggle, Observer } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomWiggle, Observer);

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
  const [showAllActivities, setShowAllActivities] = useState(false);
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

      // Default subscription for users with no active plan
      const defaultSubscription = {
        plan: 'No Active Plan',
        status: 'inactive',
        price: 0,
        period: 'month',
        renewalDate: 'N/A',
        daysUntilRenewal: 0,
      };

      // Ensure subscription exists on merged analytics
      if (!mergedAnalytics.subscription) {
        mergedAnalytics = {
          ...mergedAnalytics,
          subscription: defaultSubscription,
        };
      }

      if (billingResponse.ok) {
        const billingJson = await billingResponse.json();
        const billingPlan = billingJson?.data?.currentPlan;

        if (billingPlan) {
          const existingSub =
            mergedAnalytics.subscription || defaultSubscription;
          mergedAnalytics = {
            ...mergedAnalytics,
            subscription: {
              ...existingSub,
              plan: billingPlan.name || existingSub.plan || 'No Active Plan',
              status: billingPlan.status || 'inactive',
              price:
                typeof billingPlan.price === 'number'
                  ? billingPlan.price
                  : existingSub.price,
              period: billingPlan.period || existingSub.period || 'month',
              renewalDate:
                billingPlan.renewalDate || existingSub.renewalDate || 'N/A',
              daysUntilRenewal:
                typeof billingPlan.daysUntilRenewal === 'number'
                  ? billingPlan.daysUntilRenewal
                  : existingSub.daysUntilRenewal || 0,
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

  // GSAP animations for dark theme
  useEffect(() => {
    if (!loading && analyticsData) {
      const ctx = gsap.context(() => {
        CustomWiggle.create('dashWiggle', { wiggles: 5, type: 'easeOut' });
        
        // Animate gradient orbs
        gsap.to('.dash-gradient-orb', {
          x: 'random(-60, 60)', y: 'random(-40, 40)', scale: 'random(0.9, 1.15)',
          duration: 8, ease: 'sine.inOut', stagger: { each: 1.2, repeat: -1, yoyo: true },
        });
        
        // Animate floating symbols
        gsap.utils.toArray('.dash-float-symbol').forEach((el) => {
          gsap.to(el as Element, {
            y: 'random(-20, 20)', rotation: 'random(-15, 15)',
            duration: 'random(3, 5)', repeat: -1, yoyo: true, ease: 'sine.inOut',
          });
        });
        
        // Stats cards entrance
        gsap.from('.stat-card', { opacity: 0, y: 40, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.2 });
        
        // Section cards entrance
        gsap.from('.section-card', {
          scrollTrigger: { trigger: '.sections-grid', start: 'top 85%' },
          opacity: 0, y: 50, stagger: 0.12, duration: 0.6, ease: 'power3.out',
        });
      });
      return () => ctx.revert();
    }
  }, [loading, analyticsData]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!analyticsData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12] flex items-center justify-center">
          <div className="text-center max-w-lg">
            <h2 className="text-2xl font-semibold text-white mb-3">
              {error || 'Unable to load analytics right now'}
            </h2>
            <p className="text-gray-400 mb-6">
              Please verify your session is active and try refreshing the data.
            </p>
            <button
              onClick={() => fetchAnalytics()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
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
    if (percentage >= 90) return 'bg-red-900/200';
    if (percentage >= 75) return 'bg-yellow-900/200';
    return 'bg-green-900/200';
  };

  const quickStats = [
    {
      label: 'Active Agents',
      value: (analyticsData?.usage?.agents?.current ?? 0).toString(),
      change: analyticsData?.weeklyTrend?.conversationsChange ?? '+0%',
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Total Conversations',
      value: (analyticsData?.usage?.conversations?.current ?? 0).toLocaleString(),
      change: analyticsData?.weeklyTrend?.conversationsChange ?? '+0%',
      trend: 'up',
      icon: MessageSquare,
      color: 'green',
    },
    {
      label: 'API Calls',
      value: (analyticsData?.usage?.apiCalls?.current ?? 0).toLocaleString(),
      change: analyticsData?.weeklyTrend?.apiCallsChange ?? '+0%',
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12] text-white overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="dash-gradient-orb absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-600/20 to-violet-600/20 blur-[120px]" />
          <div className="dash-gradient-orb absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-600/15 to-cyan-600/15 blur-[100px]" />
          <div className="dash-gradient-orb absolute top-2/3 left-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-pink-600/10 to-rose-600/10 blur-[80px]" />
          <div className="dash-float-symbol absolute top-[15%] left-[10%] text-4xl opacity-20">📊</div>
          <div className="dash-float-symbol absolute top-[25%] right-[12%] text-3xl opacity-15">🤖</div>
          <div className="dash-float-symbol absolute bottom-[30%] left-[8%] text-5xl opacity-10">⚡</div>
          <div className="dash-float-symbol absolute top-[50%] right-[8%] text-4xl opacity-20">💬</div>
        </div>

        {/* Hero Section */}
        <section className="relative py-20 md:py-28 border-b border-white/10 overflow-hidden">
          <div className="container-custom text-center relative z-10">
            <div className="hero-dash-icon inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600/30 to-violet-600/30 border border-purple-500/30 rounded-2xl mb-6">
              <Activity className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Your Dashboard
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
              Monitor your AI agents, track usage, and manage your subscription in real-time.
            </p>
            {lastUpdated && (
              <p className="text-sm text-white/70">
                Last updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </section>

        {/* Dashboard Content */}
        <div className="container-custom py-12 relative z-10">
          {error && analyticsData && (
            <div className="mb-6 bg-red-900/200/10 border border-red-500/30 text-red-400 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">Real-time data may be delayed.</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => fetchAnalytics()}
                className="px-4 py-2 bg-white/10 hover:bg-white/10 rounded-lg transition-colors"
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing…' : 'Retry'}
              </button>
            </div>
          )}
          {/* Subscription Success Message */}
          {showSuccessMessage && subscriptionSuccess && (
            <div className="mb-8 bg-green-900/200/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-300 mb-2">
                      🎉 Subscription Successful!
                    </h3>
                    <p className="text-green-400 mb-4">
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
                  className="text-green-400 hover:text-green-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Agent Status Summary Card */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Quick Overview</h2>
              <p className="text-gray-400">
                Your current agent status and resource summary at a glance.
              </p>
            </div>

            {/* Agent Status Summary */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 min-w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-400">Agent Status</p>
                  <p className="text-2xl font-bold text-white">
                    {isAgentActive ? 'Active' : 'Inactive'}
                  </p>
                  {/* Real-time Agent Status */}
                  <p className="text-xs mt-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full font-semibold text-xs ${
                        isAgentActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {isAgentActive ? 'Active' : 'No Active'}
                    </span>
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isAgentActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {isAgentActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="mt-2 mb-4 text-sm text-gray-400">
                {hasActiveAgents ? (
                  <>
                    You currently have{' '}
                    <span className="font-semibold text-white">
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
                className="mt-4 w-full px-4 py-2 bg-white/10 hover:bg-white/10 text-center block text-sm rounded-lg transition-colors"
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
                  className="stat-card bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">
                    {stat.label}
                  </h3>
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div
                    className={`text-sm flex items-center ${
                      stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
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
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Resource Usage
                </h2>
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div className="space-y-6">
                {Object.entries(analyticsData.usage).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span
                        className={`text-sm font-semibold ${getStatusColor(
                          value?.percentage ?? 0
                        )}`}
                      >
                        {(value?.current ?? 0).toLocaleString()} /{' '}
                        {(value?.limit ?? 0).toLocaleString()} {value?.unit || ''}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                          value?.percentage ?? 0
                        )}`}
                        style={{ width: `${Math.min(value?.percentage ?? 0, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(value?.percentage ?? 0).toFixed(1)}% used
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Activity Chart */}
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  7-Day Activity
                </h2>
                <TrendingUp className="w-6 h-6 text-green-400" />
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
                              className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-300 group-hover:from-purple-500 group-hover:to-purple-300 cursor-pointer"
                              style={{
                                height: `${height}%`,
                                minHeight: '20px',
                              }}
                            >
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 border border-white/10">
                                <p className="font-semibold">
                                  {day.conversations} conversations
                                </p>
                                <p>{day.messages} messages</p>
                                <p>{day.apiCalls} API calls</p>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 mt-2">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full text-center text-sm text-gray-500">
                      No activity recorded for the past week.
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-900/200"></div>
                    <span className="text-sm text-gray-400">
                      Conversations
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">
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
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">
                Top Agents
              </h2>
              <div className="space-y-4">
                {analyticsData.topAgents && analyticsData.topAgents.length > 0 ? (
                  analyticsData.topAgents.map((agent, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-300">
                          {agent.name}
                        </span>
                        <span className="text-sm font-semibold text-purple-400">
                          {agent.usage}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                          style={{ width: `${agent.usage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No agent subscriptions yet.</p>
                    <Link href="/agents" className="text-purple-400 hover:underline text-sm mt-2 inline-block">
                      Browse available agents →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Cost Analysis
                </h2>
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-blue-900/200/10 border border-blue-500/30 rounded-lg">
                  <span className="text-sm text-gray-300">Current Month</span>
                  <span className="text-2xl font-bold text-blue-400">
                    ${analyticsData.costAnalysis.currentMonth}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-900/200/10 border border-purple-500/30 rounded-lg">
                  <span className="text-sm text-gray-300">
                    Projected Total
                  </span>
                  <span className="text-2xl font-bold text-purple-400">
                    ${analyticsData.costAnalysis.projectedMonth}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-300 mb-3">
                  Cost Breakdown
                </p>
                {analyticsData.costAnalysis.breakdown && analyticsData.costAnalysis.breakdown.length > 0 ? (
                  analyticsData.costAnalysis.breakdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-400">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          ${item.cost}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No costs this month
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Agent Performance Table */}
          <div className="bg-white/5 rounded-xl p-8 border border-white/10 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Agent Performance Details
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                      Agent Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                      Conversations
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                      Messages
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                      Avg Response
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.agentPerformance && analyticsData.agentPerformance.length > 0 ? (
                    analyticsData.agentPerformance.map((agent, index) => (
                      <tr
                        key={index}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="font-medium text-white">
                            {agent.name || 'Unknown Agent'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {(agent.conversations ?? 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {(agent.messages ?? 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className="flex items-center gap-1 text-gray-300">
                            <Clock className="w-4 h-4" />
                            {agent.avgResponseTime ?? 0}s
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`font-semibold ${
                              (agent.successRate ?? 0) >= 95
                                ? 'text-green-400'
                                : (agent.successRate ?? 0) >= 90
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}
                          >
                            {agent.successRate ?? 0}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No conversations yet. Start chatting with an AI agent to see performance data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 rounded-xl p-8 border border-white/10 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Recent Activity
              </h2>
              <span className="text-sm text-gray-500">Last 30 minutes</span>
            </div>
            <div className="space-y-3">
              {analyticsData.recentActivity && analyticsData.recentActivity.length > 0 ? (
                <>
                  {(showAllActivities 
                    ? analyticsData.recentActivity 
                    : analyticsData.recentActivity.slice(0, 3)
                  ).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg hover:bg-white/5 transition-colors border border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.status === 'success' || activity.status === 'completed'
                              ? 'bg-green-900/200'
                              : activity.status === 'active'
                              ? 'bg-blue-900/200 animate-pulse'
                              : activity.status === 'warning'
                              ? 'bg-yellow-900/200'
                              : 'bg-green-900/200'
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-400">
                            {activity.agent}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {analyticsData.recentActivity.length > 3 && (
                    <button
                      onClick={() => setShowAllActivities(!showAllActivities)}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-lg transition-colors"
                    >
                      {showAllActivities ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View All Activities ({analyticsData.recentActivity.length})
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No recent activity in the last 30 minutes.</p>
                  <p className="text-xs mt-2">Activity will appear here when you use the platform.</p>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Sections */}
          <div className="sections-grid grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {dashboardSections.map((section, index) => (
              <Link
                key={index}
                href={section.href}
                className="section-card group relative bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
              >
                {section.badge && (
                  <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {section.badge}
                  </div>
                )}
                <div className="text-4xl mb-4">{section.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  {section.title}
                </h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {section.description}
                </p>
                <ul className="space-y-2">
                  {section.stats.map((stat, statIndex) => (
                    <li
                      key={statIndex}
                      className="text-sm text-gray-500 flex items-center"
                    >
                      <span className="w-1.5 h-1.5 bg-purple-900/200 rounded-full mr-3"></span>
                      {stat}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/agents/create"
                className="flex items-center p-4 bg-purple-900/200/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors group"
              >
                <span className="text-2xl mr-3">➕</span>
                <div>
                  <div className="font-medium text-white group-hover:text-purple-400">
                    Create New Agent
                  </div>
                  <div className="text-sm text-gray-400">
                    Deploy a new AI agent
                  </div>
                </div>
              </Link>
              <Link
                href="/support/contact-us"
                className="flex items-center p-4 bg-green-900/200/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors group"
              >
                <span className="text-2xl mr-3">💬</span>
                <div>
                  <div className="font-medium text-white group-hover:text-green-400">
                    Get Support
                  </div>
                  <div className="text-sm text-gray-400">
                    Contact our support team
                  </div>
                </div>
              </Link>
              <Link
                href="/resources/documentation"
                className="flex items-center p-4 bg-blue-900/200/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors group"
              >
                <span className="text-2xl mr-3">📚</span>
                <div>
                  <div className="font-medium text-white group-hover:text-blue-400">
                    View Documentation
                  </div>
                  <div className="text-sm text-gray-400">
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
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12] flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
