import { NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';
import type { AnalyticsData } from '@/models/analytics';

// Force dynamic rendering so we always hit the database
export const dynamic = 'force-dynamic';

const PLAN_DEFAULTS = {
  daily: { price: 1, period: 'day', limits: { apiCalls: 500, storage: 1024 } },
  weekly: {
    price: 5,
    period: 'week',
    limits: { apiCalls: 2500, storage: 2048 },
  },
  monthly: {
    price: 19,
    period: 'month',
    limits: { apiCalls: 15000, storage: 10240 },
  },
};

const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];

function buildFallbackAnalytics(): AnalyticsData {
  return {
    subscription: {
      plan: 'No Active Plan',
      status: 'inactive',
      price: 0,
      period: 'none',
      renewalDate: 'N/A',
      daysUntilRenewal: 0,
    },
    usage: {
      conversations: {
        current: 0,
        limit: 10000,
        percentage: 0,
        unit: 'conversations',
      },
      agents: { current: 0, limit: 50, percentage: 0, unit: 'agents' },
      apiCalls: { current: 0, limit: 15000, percentage: 0, unit: 'calls' },
      storage: { current: 0, limit: 10240, percentage: 0, unit: 'MB' },
      messages: { current: 0, limit: 100000, percentage: 0, unit: 'messages' },
    },
    dailyUsage: [],
    weeklyTrend: {
      conversationsChange: '+0%',
      messagesChange: '+0%',
      apiCallsChange: '+0%',
      responseTimeChange: '-0%',
    },
    agentPerformance: [],
    recentActivity: [],
    costAnalysis: {
      currentMonth: 0,
      projectedMonth: 0,
      breakdown: [
        { category: 'API Calls', cost: 0, percentage: 0 },
        { category: 'Storage', cost: 0, percentage: 0 },
        { category: 'Bandwidth', cost: 0, percentage: 0 },
      ],
    },
    topAgents: [],
  };
}

function pct(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.min(100, +((numerator / denominator) * 100).toFixed(1));
}

function trendChange(latest: number, previous: number) {
  if (previous === 0) return latest === 0 ? '+0%' : '+100%';
  const change = ((latest - previous) / previous) * 100;
  const rounded = change.toFixed(1);
  return `${change >= 0 ? '+' : ''}${rounded}%`;
}

export async function GET(request: Request) {
  try {
    const sessionId = request.headers
      .get('cookie')
      ?.split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('session_id='))
      ?.split('=')[1];

    if (!sessionId) {
      return NextResponse.json(buildFallbackAnalytics(), { status: 401 });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');
    const subscriptions = db.collection('subscriptions');
    const usageMetrics = db.collection('usagemetrics');
    const agentUsage = db.collection('agentusages');
    const activities = db.collection('useractivities');

    const sessionUser = await users.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser?._id) {
      return NextResponse.json(buildFallbackAnalytics(), { status: 401 });
    }

    const userId = sessionUser._id;

    // Subscription: pick latest active/trialing/past_due, fallback to newest
    const activeSubscription = await subscriptions.findOne(
      { user: userId, status: { $in: ACTIVE_STATUSES } },
      { sort: { updatedAt: -1, createdAt: -1 } }
    );

    const subscriptionPlan = activeSubscription?.plan?.toLowerCase() || 'none';
    const planDefaults =
      PLAN_DEFAULTS[subscriptionPlan as keyof typeof PLAN_DEFAULTS];

    const subscription = {
      plan:
        activeSubscription?.name ||
        activeSubscription?.plan ||
        'No Active Plan',
      status: activeSubscription?.status || 'inactive',
      price: activeSubscription?.price ?? planDefaults?.price ?? 0,
      period: planDefaults?.period || 'month',
      renewalDate: activeSubscription?.billingCycleEnd
        ? new Date(activeSubscription.billingCycleEnd).toISOString()
        : activeSubscription?.renewalDate || 'N/A',
      daysUntilRenewal: activeSubscription?.billingCycleEnd
        ? Math.max(
            0,
            Math.ceil(
              (new Date(activeSubscription.billingCycleEnd).getTime() -
                Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : 0,
    };

    // Usage metrics (best effort)
    const usageDoc = await usageMetrics.findOne(
      { userId },
      { sort: { 'period.endDate': -1 } }
    );

    const usageDefaults = planDefaults?.limits || {
      apiCalls: 15000,
      storage: 10240,
    };
    const conversationsCurrent = usageDoc?.conversations?.total || 0;
    const messagesCurrent = usageDoc?.messages?.total || 0;
    const apiCallsCurrent = usageDoc?.api?.totalCalls || 0;
    const storageCurrentMb = usageDoc?.storage?.totalUsed
      ? Math.round((usageDoc.storage.totalUsed / 1024 / 1024) * 10) / 10
      : 0;
    const agentsCurrent = usageDoc?.features?.agentsUsed?.length || 0;

    const usage = {
      conversations: {
        current: conversationsCurrent,
        limit: 10000,
        percentage: pct(conversationsCurrent, 10000),
        unit: 'conversations',
      },
      agents: {
        current: agentsCurrent,
        limit: 50,
        percentage: pct(agentsCurrent, 50),
        unit: 'agents',
      },
      apiCalls: {
        current: apiCallsCurrent,
        limit: usageDefaults.apiCalls,
        percentage: pct(apiCallsCurrent, usageDefaults.apiCalls),
        unit: 'calls',
      },
      storage: {
        current: storageCurrentMb,
        limit: usageDefaults.storage,
        percentage: pct(storageCurrentMb, usageDefaults.storage),
        unit: 'MB',
      },
      messages: {
        current: messagesCurrent,
        limit: 100000,
        percentage: pct(messagesCurrent, 100000),
        unit: 'messages',
      },
    };

    // Daily usage (last 14 days) from agentUsage collection
    const dailyUsageDocs = await agentUsage
      .find({ userId })
      .sort({ date: -1 })
      .limit(14)
      .toArray();

    const dailyUsage = dailyUsageDocs.map((doc) => ({
      date: doc.date
        ? new Date(doc.date).toISOString()
        : new Date().toISOString(),
      conversations: doc.totalSessions || doc.totalMessages || 0,
      messages: doc.totalMessages || 0,
      apiCalls: doc.totalTokensUsed || 0,
    }));

    // Weekly trend comparing last 7 vs previous 7
    const week1 = dailyUsage.slice(0, 7);
    const week2 = dailyUsage.slice(7, 14);
    const sum = (arr: typeof dailyUsage) =>
      arr.reduce(
        (acc, d) => ({
          conversations: acc.conversations + (d.conversations || 0),
          messages: acc.messages + (d.messages || 0),
          apiCalls: acc.apiCalls + (d.apiCalls || 0),
        }),
        { conversations: 0, messages: 0, apiCalls: 0 }
      );
    const w1 = sum(week1);
    const w2 = sum(week2);

    const weeklyTrend = {
      conversationsChange: trendChange(w1.conversations, w2.conversations),
      messagesChange: trendChange(w1.messages, w2.messages),
      apiCallsChange: trendChange(w1.apiCalls, w2.apiCalls),
      responseTimeChange: '-0%',
    };

    // Agent performance & top agents from usage doc features
    const agentsUsed = usageDoc?.features?.agentsUsed || [];
    const agentPerformance = agentsUsed.map((agent: any) => ({
      name: agent.agentName || agent.agentId || 'Agent',
      conversations: agent.interactions || agent.totalSessions || 0,
      messages: agent.interactions || agent.totalSessions || 0,
      avgResponseTime: agent.avgResponseTime || 0,
      successRate: 93,
    }));

    const topAgents = agentsUsed
      .map((agent: any) => ({
        name: agent.agentName || agent.agentId,
        usage: agent.interactions || 0,
      }))
      .sort((a: any, b: any) => b.usage - a.usage)
      .slice(0, 5);

    // Recent activity (latest 10)
    const recentActivityDocs = await activities
      .find({ userId })
      .sort({ 'timing.occurredAt': -1 })
      .limit(10)
      .toArray();

    const recentActivity = recentActivityDocs.map((item: any) => ({
      timestamp:
        item.timing?.occurredAt?.toISOString?.() || new Date().toISOString(),
      agent: item.details?.target || item.details?.agentId || 'Agent',
      action: item.type || item.category || 'activity',
      status: item.analytics?.status || 'completed',
    }));

    // Cost analysis derived from plan price
    const monthlyPrice = subscription.price || 0;
    const costAnalysis = {
      currentMonth: monthlyPrice,
      projectedMonth: monthlyPrice,
      breakdown: [{ category: 'Plan', cost: monthlyPrice, percentage: 100 }],
    };

    // Determine agent status for dashboard
    const agentStatus = usage.agents.current > 0 ? 'Active' : 'No Active';

    const payload: AnalyticsData & { agentStatus: string } = {
      subscription,
      usage,
      dailyUsage,
      weeklyTrend,
      agentPerformance,
      recentActivity,
      costAnalysis,
      topAgents,
      agentStatus,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('Error building analytics:', error);
    return NextResponse.json(buildFallbackAnalytics(), { status: 200 });
  }
}
