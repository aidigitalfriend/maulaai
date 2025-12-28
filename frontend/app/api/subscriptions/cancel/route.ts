import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRequest,
  unauthorizedResponse,
} from '../../../../lib/validateAuth';

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://onelastai.co:3005';

/**
 * Cancel Subscription API Route
 * Proxies to backend to cancel user subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, agentId } = body;

    // Validate required fields
    if (!userId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'userId and agentId are required' },
        { status: 400 }
      );
    }

    // Require authentication
    const authResult = verifyRequest(request);
    if (!authResult.ok) return unauthorizedResponse(authResult.error);

    // For now, proxy to a generic cancel endpoint
    // Backend doesn't have a specific cancel endpoint, so this needs backend implementation
    const backendUrl = `${BACKEND_BASE}/api/agent/subscriptions/cancel`;

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
      },
      body: JSON.stringify({ userId, agentId }),
    });

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: res.headers as any,
    });
  } catch (err: any) {
    console.error('[/api/subscriptions/cancel] Proxy error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Proxy error' },
      { status: 500 }
    );
  }
}
