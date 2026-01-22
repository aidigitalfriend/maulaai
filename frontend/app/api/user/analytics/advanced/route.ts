import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering so we always hit the backend
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005';

export async function GET(request: NextRequest) {
  try {
    // Proxy to backend which has all the analytics logic
    const backendResponse = await fetch(`${BACKEND_URL}/api/user/analytics/advanced`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies for authentication if needed
        Cookie: request.headers.get('cookie') || '',
      },
    });

    if (!backendResponse.ok) {
      console.error('Backend analytics error:', backendResponse.status);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Advanced analytics proxy error:', error);
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
