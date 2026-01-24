import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Call the backend API for real analytics data
    // Use BACKEND_BASE_URL (server-side) which points to the Express backend
    const backendUrl = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3005';
    
    // Forward cookies for authentication
    const response = await fetch(`${backendUrl}/api/analytics/advanced`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': request.headers.get('cookie') || '',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // If backend fails, return structured empty data
    console.warn('Backend analytics not available, returning empty structure. Status:', response.status);
    return NextResponse.json({
      stats: {
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
      endpointStats: [],
      recentRequests: [],
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Advanced analytics error:', error);
    return NextResponse.json({
      stats: {
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
      endpointStats: [],
      recentRequests: [],
      lastUpdated: new Date().toISOString(),
    });
  }
}
