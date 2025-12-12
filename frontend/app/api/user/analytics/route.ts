import { NextResponse } from 'next/server';
import type { AnalyticsData } from '@/models/analytics';

// Force dynamic rendering so we always hit the backend
export const dynamic = 'force-dynamic';

const BACKEND_BASE_URL =
  process.env.BACKEND_API_BASE_URL || 'http://127.0.0.1:3005';

function buildFallbackAnalytics(): AnalyticsData {
  const now = new Date();
  const renewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    subscription: {
      plan: 'Monthly Access',
      status: 'active',
      price: 19,
      period: 'monthly',
      renewalDate,
      daysUntilRenewal: 30,
    },
    usage: {
      conversations: {
        current: 0,
        limit: 10000,
        percentage: 0,
        unit: 'conversations',
      },
      agents: {
        current: 0,
        limit: 18,
        percentage: 0,
        unit: 'agents',
      },
      apiCalls: {
        current: 0,
        limit: 50000,
        percentage: 0,
        unit: 'calls',
      },
      storage: {
        current: 0,
        limit: 10000,
        percentage: 0,
        unit: 'KB',
      },
      messages: {
        current: 0,
        limit: 100000,
        percentage: 0,
        unit: 'messages',
      },
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

export async function GET(request: Request) {
  try {
    const incomingUrl = new URL(request.url);
    const backendUrl = new URL('/api/user/analytics', BACKEND_BASE_URL);
    // Preserve any query params (e.g. userId/email for debugging)
    backendUrl.search = incomingUrl.search;

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        // Forward cookies so the backend can read session_id
        cookie: request.headers.get('cookie') ?? '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
        'user-agent': request.headers.get('user-agent') ?? '',
      },
      // Never cache analytics; always fetch fresh data
      cache: 'no-store',
    });

    const text = await backendResponse.text();
    let data: unknown = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!backendResponse.ok) {
      // Log detailed backend error for debugging
      console.error('Backend analytics error:', {
        status: backendResponse.status,
        body: data,
      });

      // For server errors, return a safe fallback analytics payload
      if (backendResponse.status >= 500) {
        const fallback = buildFallbackAnalytics();
        return NextResponse.json(fallback, {
          status: 200,
        });
      }

      // For client errors (e.g. 401/403/404), forward the backend payload
      if (data && typeof data === 'object') {
        return NextResponse.json(data as any, {
          status: backendResponse.status,
        });
      }

      const errorMessage =
        data && typeof data === 'string'
          ? data
          : 'Failed to fetch analytics data';

      return NextResponse.json(
        { error: errorMessage },
        { status: backendResponse.status }
      );
    }

    // Backend already returns the exact shape the dashboard expects
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying user analytics:', error);
    const fallback = buildFallbackAnalytics();
    return NextResponse.json(fallback, { status: 200 });
  }
}
