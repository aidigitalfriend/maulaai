import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest, unauthorizedResponse } from '../../../../lib/validateAuth';

// Use internal backend URL for server-to-server communication
const BACKEND_BASE = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3005';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Require authentication for subscription endpoints
    const authResult = verifyRequest(request);
    if (!authResult.ok) return unauthorizedResponse(authResult.error);

    // Build backend URL
    const backendUrl = `${BACKEND_BASE}/api/agent/subscriptions/user/${userId}`;

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('[/api/subscriptions/[userId]] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch subscriptions', subscriptions: [] },
      { status: 500 }
    );
  }
}
