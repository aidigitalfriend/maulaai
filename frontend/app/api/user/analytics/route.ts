import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering so we always hit the backend
export const dynamic = 'force-dynamic';

// This route is a thin proxy to the main analytics implementation
// running on the Express backend at /api/user/analytics. This avoids
// maintaining two separate analytics systems.
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const backendBase = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3005';

    const incomingUrl = new URL(request.url);
    const targetUrl = new URL('/api/user/analytics', backendBase);

    // Forward query string parameters (userId/email debugging, etc.)
    incomingUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    console.log(`[Analytics Proxy] Fetching from: ${targetUrl.toString()}`);
    
    // Add timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        // Forward cookies so the backend can resolve the session
        cookie: request.headers.get('cookie') || '',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const body = await response.text();
    
    console.log(`[Analytics Proxy] Response status: ${response.status}, took ${Date.now() - startTime}ms`);

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'content-type':
          response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[Analytics Proxy] Error after ${elapsed}ms:`, error);
    
    // Check if it was a timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Analytics request timed out. Please try again.',
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
      },
      { status: 500 }
    );
  }
}
