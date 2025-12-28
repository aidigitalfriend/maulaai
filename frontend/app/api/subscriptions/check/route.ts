import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRequest,
  unauthorizedResponse,
} from '../../../../lib/validateAuth';

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://onelastai.co:3005';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, agentId } = body;

    if (!userId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'userId and agentId are required' },
        { status: 400 }
      );
    }

    // Require authentication
    const authResult = verifyRequest(request);
    if (!authResult.ok) return unauthorizedResponse(authResult.error);

    // Proxy to backend
    const backendUrl = `${BACKEND_BASE}/api/agent/subscriptions/check/${userId}/${agentId}`;

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: Object.fromEntries(request.headers),
    });

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: res.headers as any,
    });
  } catch (err: any) {
    console.error('[/api/subscriptions/check] Proxy error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Proxy error' },
      { status: 500 }
    );
  }
}
