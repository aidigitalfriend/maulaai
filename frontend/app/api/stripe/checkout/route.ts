import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '../../../../lib/stripe-client';
import {
  verifyRequest,
  unauthorizedResponse,
} from '../../../../lib/validateAuth';

// Use internal backend URL for server-to-server communication
const BACKEND_BASE = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3005';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = verifyRequest(request);
    if (!authResult.ok) return unauthorizedResponse(authResult.error);

    const body = await request.json();
    const { agentId, agentName, plan, userId, userEmail } = body;

    // Validate required fields
    if (!agentId || !agentName || !plan || !userId || !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: agentId, agentName, plan, userId, userEmail',
        },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!['daily', 'weekly', 'monthly'].includes(plan)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid plan. Must be daily, weekly, or monthly',
        },
        { status: 400 }
      );
    }

    // ✅ CRITICAL: Check if user already has active subscription for this agent
    // Proxy this check to backend - only forward safe headers
    const checkUrl = `${BACKEND_BASE}/api/agent/subscriptions/check/${userId}/${agentId}`;
    const checkRes = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || '',
      },
      cache: 'no-store',
    });

    if (!checkRes.ok) {
      const checkData = await checkRes.json();
      return NextResponse.json(checkData, { status: checkRes.status });
    }

    const checkData = await checkRes.json();

    // Check both possible field names for backwards compatibility
    const hasActive = checkData.hasAccess || checkData.hasActiveSubscription;

    if (hasActive && checkData.subscription) {
      return NextResponse.json(
        {
          success: false,
          error: `You already have an active ${checkData.subscription.plan} subscription for ${agentName}`,
          alreadySubscribed: true,
          existingSubscription: {
            plan: checkData.subscription.plan,
            expiryDate: checkData.subscription.expiryDate,
            daysRemaining: checkData.subscription.daysRemaining,
          },
        },
        { status: 400 }
      );
    }

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}&agent=${encodeURIComponent(
      agentName
    )}&slug=${agentId}`;
    const cancelUrl = `${baseUrl}/subscribe?agent=${encodeURIComponent(
      agentName
    )}&slug=${agentId}&plan=${plan}&cancelled=true`;

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      agentId,
      agentName,
      plan,
      userId,
      userEmail,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
