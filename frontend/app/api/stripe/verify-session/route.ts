import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Proxy to backend for Stripe session verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/agent/subscriptions/verify-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Proxy failed',
      },
      { status: 500 }
    );
  }
}
