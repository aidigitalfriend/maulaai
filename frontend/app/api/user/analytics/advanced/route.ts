import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Generate sample analytics data (will be replaced with real data when backend endpoint is ready)
function generateSampleAnalytics() {
  const now = new Date();
  
  return {
    stats: {
      totalRequests: Math.floor(Math.random() * 10000) + 1000,
      requestChange: Math.floor(Math.random() * 30) - 10,
      avgLatency: Math.floor(Math.random() * 500) + 100,
      latencyChange: Math.floor(Math.random() * 20) - 10,
      avgSuccessRate: 95 + Math.random() * 5,
      successChange: Math.floor(Math.random() * 10) - 5,
      totalCost: Math.random() * 100 + 10,
    },
    apiMetrics: [
      { endpoint: '/api/chat', requests: 4500, latency: 245, successRate: 98.5 },
      { endpoint: '/api/agents', requests: 2300, latency: 120, successRate: 99.2 },
      { endpoint: '/api/auth', requests: 1800, latency: 85, successRate: 97.8 },
      { endpoint: '/api/subscriptions', requests: 950, latency: 180, successRate: 99.5 },
      { endpoint: '/api/analytics', requests: 620, latency: 95, successRate: 99.8 },
    ],
    modelUsage: [
      { model: 'GPT-4', requests: 3200, tokens: 850000 },
      { model: 'Claude-3', requests: 2800, tokens: 720000 },
      { model: 'Gemini', requests: 1500, tokens: 380000 },
      { model: 'Mistral', requests: 800, tokens: 210000 },
    ],
    successFailure: [
      { name: 'Success', value: 9500 },
      { name: 'Client Errors', value: 350 },
      { name: 'Server Errors', value: 150 },
    ],
    peakTraffic: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      requests: Math.floor(Math.random() * 500) + (hour >= 9 && hour <= 17 ? 300 : 50),
    })),
    errors: [
      { type: 'Rate Limit', count: 120, lastOccurred: new Date(now.getTime() - 3600000).toISOString() },
      { type: 'Auth Failed', count: 85, lastOccurred: new Date(now.getTime() - 7200000).toISOString() },
      { type: 'Timeout', count: 45, lastOccurred: new Date(now.getTime() - 1800000).toISOString() },
      { type: 'Bad Request', count: 30, lastOccurred: new Date(now.getTime() - 900000).toISOString() },
    ],
    geographic: [
      { country: 'United States', requests: 4500, latency: 120 },
      { country: 'United Kingdom', requests: 1800, latency: 145 },
      { country: 'Germany', requests: 1200, latency: 160 },
      { country: 'Singapore', requests: 950, latency: 90 },
      { country: 'Australia', requests: 750, latency: 180 },
    ],
    costData: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        cost: Math.random() * 15 + 5,
      };
    }),
    tokenTrend: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        tokens: Math.floor(Math.random() * 200000) + 100000,
      };
    }),
  };
}

export async function GET(request: NextRequest) {
  try {
    // Return sample analytics data
    // TODO: Connect to real backend analytics when endpoint is available
    const data = generateSampleAnalytics();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Advanced analytics error:', error);
    // Return empty data structure on error
    return NextResponse.json({
      stats: {
        totalRequests: 0,
        requestChange: 0,
        avgLatency: 0,
        latencyChange: 0,
        avgSuccessRate: 0,
        successChange: 0,
        totalCost: 0,
      },
      apiMetrics: [],
      modelUsage: [],
      successFailure: [],
      peakTraffic: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        requests: 0,
      })),
      errors: [],
      geographic: [],
      costData: [],
      tokenTrend: [],
    });
  }
}
