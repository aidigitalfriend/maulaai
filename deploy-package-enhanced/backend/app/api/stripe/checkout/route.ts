/**
 * Stripe Checkout Session API
 * Creates a checkout session for agent subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, agentName, plan, userId, userEmail } = body;

    // Validation
    if (!agentId || !agentName || !plan || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, agentName, plan, userId, userEmail' },
        { status: 400 }
      );
    }

    if (!['daily', 'weekly', 'monthly'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be daily, weekly, or monthly' },
        { status: 400 }
      );
    }

    // Get base URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onelastai.co';

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      agentId,
      agentName,
      plan,
      userId,
      userEmail,
      successUrl: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&agent=${encodeURIComponent(agentName)}`,
      cancelUrl: `${baseUrl}/payment/cancel?agent=${encodeURIComponent(agentName)}`,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to create checkout session' 
      },
      { status: 500 }
    );
  }
}
