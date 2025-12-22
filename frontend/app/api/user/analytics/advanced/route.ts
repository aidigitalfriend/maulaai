import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';

// Force dynamic rendering so we always hit the database
export const dynamic = 'force-dynamic';

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

const MODEL_COLORS = [
  '#6366f1',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#06b6d4',
  '#f97316',
];

function buildEmptyPayload(): AdvancedAnalyticsPayload {
  const emptyStats: DashboardStats = {
    totalRequests: 0,
    requestChange: 0,
    avgLatency: 0,
    latencyChange: 0,
    avgSuccessRate: 0,
    successChange: 0,
    totalCost: 0,
  };

  return {
    stats: emptyStats,
    apiMetrics: [],
    modelUsage: [],
    successFailure: [],
    peakTraffic: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      requests: 0,
    })),
    errors: [
      { type: '4xx Errors', count: 0, percentage: 0 },
      { type: '5xx Errors', count: 0, percentage: 0 },
      { type: 'Timeouts', count: 0, percentage: 0 },
    ],
    geographic: [],
    costData: [],
    tokenTrend: [],
  };
}

function toDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(buildEmptyPayload(), { status: 401 });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');

    const users = db.collection('users');
    const usageMetrics = db.collection('usagemetrics');
    const apiUsage = db.collection('api_usage');

    const sessionUser = await users.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser?._id) {
      return NextResponse.json(buildEmptyPayload(), { status: 401 });
    }

    const userId = sessionUser._id;

    // Fetch latest 7 daily usage metric documents for this user
    const usageDocsDesc = await usageMetrics
      .find({ userId, 'period.type': 'daily' })
      .sort({ 'period.startDate': -1 })
      .limit(7)
      .toArray();

    const usageDocs = usageDocsDesc.reverse();

    if (!usageDocs.length) {
      return NextResponse.json(buildEmptyPayload(), { status: 200 });
    }

    // Build API metrics and token trend from usage metrics
    const apiMetrics: ApiMetrics[] = [];
    const tokenTrend: TokenTrendPoint[] = [];

    let totalRequests = 0;
    let totalLatency = 0;
    let totalLatencyCount = 0;
    let totalSuccesses = 0;
    let totalCalls = 0;

    usageDocs.forEach((doc: any, index: number) => {
      const period = doc.period || {};
      const api = doc.api || {};
      const tokens = doc.tokens || {};
      const messages = doc.messages || {};

      const startDate: Date = period.startDate
        ? new Date(period.startDate)
        : new Date();

      const calls = api.totalCalls || 0;
      const successes = api.successfulCalls || 0;
      const failures = api.failedCalls || 0;
      const avgResponseTime =
        api.averageResponseTime ||
        (doc.quality?.responseTime?.average as number | undefined) ||
        0;

      const totalChars = messages.totalCharacters || 0;
      const avgResponseSizeKb = calls
        ? Number((totalChars / Math.max(calls, 1) / 1024).toFixed(1))
        : 0;

      const successRate = calls
        ? Number(((successes / calls) * 100).toFixed(1))
        : 0;
      const failureRate = calls
        ? Number(((failures / calls) * 100).toFixed(1))
        : 0;

      apiMetrics.push({
        date: toDisplayDate(startDate),
        requests: calls,
        latency: Math.round(avgResponseTime),
        successRate,
        failureRate,
        tokenUsage: tokens.totalTokens || 0,
        responseSize: avgResponseSizeKb,
      });

      tokenTrend.push({
        date: toDisplayDate(startDate),
        tokens: tokens.totalTokens || 0,
      });

      totalRequests += calls;
      if (avgResponseTime > 0) {
        totalLatency += avgResponseTime;
        totalLatencyCount += 1;
      }
      totalSuccesses += successes;
      totalCalls += calls;
    });

    const avgLatency = totalLatencyCount
      ? Math.round(totalLatency / totalLatencyCount)
      : 0;
    const avgSuccessRate = totalCalls
      ? Number(((totalSuccesses / totalCalls) * 100).toFixed(1))
      : 0;

    // Changes compared to previous day (if available)
    const latest = usageDocs[usageDocs.length - 1];
    const previous =
      usageDocs.length > 1 ? usageDocs[usageDocs.length - 2] : null;

    const latestCalls = latest?.api?.totalCalls || 0;
    const previousCalls = previous?.api?.totalCalls || 0;

    const latestLatency =
      latest?.api?.averageResponseTime ||
      (latest?.quality?.responseTime?.average as number | undefined) ||
      0;
    const previousLatency =
      previous?.api?.averageResponseTime ||
      (previous?.quality?.responseTime?.average as number | undefined) ||
      0;

    const latestSuccesses = latest?.api?.successfulCalls || 0;
    const latestTotal = latest?.api?.totalCalls || 0;
    const previousSuccesses = previous?.api?.successfulCalls || 0;
    const previousTotal = previous?.api?.totalCalls || 0;

    const latestSuccessRate = latestTotal
      ? (latestSuccesses / latestTotal) * 100
      : 0;
    const previousSuccessRate = previousTotal
      ? (previousSuccesses / previousTotal) * 100
      : 0;

    const requestChange = previousCalls
      ? Math.round(((latestCalls - previousCalls) / previousCalls) * 100)
      : 0;
    const latencyChange = previousLatency
      ? Math.round(((latestLatency - previousLatency) / previousLatency) * 100)
      : 0;
    const successChange = previousSuccessRate
      ? Math.round(
          ((latestSuccessRate - previousSuccessRate) / previousSuccessRate) *
            100
        )
      : 0;

    // Cost and model usage from tokens.byModel across all docs
    const modelTotals = new Map<string, { tokens: number; cost: number }>();

    usageDocs.forEach((doc: any) => {
      const byModel = doc.tokens?.byModel || [];
      byModel.forEach((entry: any) => {
        const key = entry.model || 'Unknown Model';
        const existing = modelTotals.get(key) || { tokens: 0, cost: 0 };
        existing.tokens += entry.totalTokens || 0;
        existing.cost += entry.cost || 0;
        modelTotals.set(key, existing);
      });
    });

    let totalTokenCost = 0;
    let totalEstimatedCost = 0;

    const modelUsage: ModelUsage[] = [];
    const costData: CostData[] = [];

    modelTotals.forEach(({ tokens, cost }, model) => {
      totalTokenCost += cost || 0;
      modelUsage.push({
        model,
        usage: tokens,
        percentage: 0, // filled later
        color: '#6366f1', // placeholder, set later
      });
      costData.push({
        model,
        cost: Number((cost || 0).toFixed(2)),
        percentage: 0, // filled later
      });
    });

    usageDocs.forEach((doc: any) => {
      const tokens = doc.tokens || {};
      if (typeof tokens.estimatedCost === 'number') {
        totalEstimatedCost += tokens.estimatedCost;
      }
    });

    const totalCost = totalEstimatedCost || totalTokenCost;

    // Fill percentages and assign colors
    const totalTokensAcrossModels = modelUsage.reduce(
      (sum, m) => sum + (m.usage || 0),
      0
    );

    modelUsage.forEach((entry, index) => {
      entry.percentage = totalTokensAcrossModels
        ? Math.round((entry.usage / totalTokensAcrossModels) * 100)
        : 0;
      entry.color = MODEL_COLORS[index % MODEL_COLORS.length];
    });

    const totalCostAcrossModels = costData.reduce(
      (sum, c) => sum + (c.cost || 0),
      0
    );

    costData.forEach((entry) => {
      entry.percentage = totalCostAcrossModels
        ? Math.round((entry.cost / totalCostAcrossModels) * 100)
        : 0;
    });

    // Success vs failure data for chart (1 point per day)
    const successFailure = usageDocs.map((doc: any, idx: number) => {
      const calls = doc.api?.totalCalls || 0;
      const successes = doc.api?.successfulCalls || 0;
      const failures = doc.api?.failedCalls || 0;
      return {
        day: `Day ${idx + 1}`,
        successful: successes || 0,
        failed: failures || Math.max(calls - successes, 0),
      };
    });

    // Error breakdown (4xx, 5xx, Timeouts) from api_usage over last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [count4xx, count5xx, countTimeouts] = await Promise.all([
      apiUsage.countDocuments({
        userId,
        statusCode: { $gte: 400, $lt: 500 },
        timestamp: { $gte: sevenDaysAgo },
      }),
      apiUsage.countDocuments({
        userId,
        statusCode: { $gte: 500, $lt: 600 },
        timestamp: { $gte: sevenDaysAgo },
      }),
      apiUsage.countDocuments({
        userId,
        statusCode: { $in: [408, 504] },
        timestamp: { $gte: sevenDaysAgo },
      }),
    ]);

    const totalErrors = count4xx + count5xx + countTimeouts;

    const errors: ErrorType[] = [
      {
        type: '4xx Errors',
        count: count4xx,
        percentage: totalErrors
          ? Math.round((count4xx / totalErrors) * 100)
          : 0,
      },
      {
        type: '5xx Errors',
        count: count5xx,
        percentage: totalErrors
          ? Math.round((count5xx / totalErrors) * 100)
          : 0,
      },
      {
        type: 'Timeouts',
        count: countTimeouts,
        percentage: totalErrors
          ? Math.round((countTimeouts / totalErrors) * 100)
          : 0,
      },
    ];

    // Geographic distribution from usageMetrics.geographic.regions
    const regionTotals = new Map<string, number>();

    usageDocs.forEach((doc: any) => {
      const regions = doc.geographic?.regions || [];
      regions.forEach((entry: any) => {
        const name = entry.region || 'Unknown';
        const sessions = entry.sessions || 0;
        const existing = regionTotals.get(name) || 0;
        regionTotals.set(name, existing + sessions);
      });
    });

    let totalSessions = 0;
    regionTotals.forEach((sessions) => {
      totalSessions += sessions;
    });

    const geographic: GeographicData[] = [];
    regionTotals.forEach((sessions, region) => {
      geographic.push({
        region,
        requests: sessions,
        percentage: totalSessions
          ? Math.round((sessions / totalSessions) * 100)
          : 0,
      });
    });

    // Peak traffic hours from api_usage over last 7 days
    const peakPipeline = [
      { $match: { userId, timestamp: { $gte: sevenDaysAgo } } },
      {
        $project: {
          hour: { $hour: '$timestamp' },
        },
      },
      {
        $group: {
          _id: '$hour',
          requests: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const peakResults = await apiUsage.aggregate(peakPipeline).toArray();

    const peakTraffic: PeakTraffic[] = Array.from(
      { length: 24 },
      (_, hour) => ({
        hour,
        requests: 0,
      })
    );

    peakResults.forEach((row: any) => {
      const hour = typeof row._id === 'number' ? row._id : 0;
      if (hour >= 0 && hour < 24) {
        peakTraffic[hour].requests = row.requests || 0;
      }
    });

    const stats: DashboardStats = {
      totalRequests,
      requestChange,
      avgLatency,
      latencyChange,
      avgSuccessRate,
      successChange,
      totalCost: Number((totalCost || 0).toFixed(2)),
    };

    const payload: AdvancedAnalyticsPayload = {
      stats,
      apiMetrics,
      modelUsage,
      successFailure,
      peakTraffic,
      errors,
      geographic,
      costData,
      tokenTrend,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('Error building advanced analytics:', error);
    return NextResponse.json(buildEmptyPayload(), { status: 200 });
  }
}
