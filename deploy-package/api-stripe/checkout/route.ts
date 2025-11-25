/**
 * Stripe Checkout API Route
 * Creates a Stripe checkout session for agent subscriptions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '../../../../lib/stripe-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, agentName, plan, userId, userEmail } = body

    // Validate required fields
    if (!agentId || !agentName || !plan || !userId || !userEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: agentId, agentName, plan, userId, userEmail' 
        },
        { status: 400 }
      )
    }

    // Validate plan type
    if (!['daily', 'weekly', 'monthly'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan. Must be daily, weekly, or monthly' },
        { status: 400 }
      )
    }

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}&agent=${encodeURIComponent(agentName)}`
    const cancelUrl = `${baseUrl}/payment?agent=${encodeURIComponent(agentName)}&slug=${agentId}&plan=${plan}&cancelled=true`

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      agentId,
      agentName,
      plan,
      userId,
      userEmail,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    })

  } catch (error) {
    console.error('Checkout session creation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create checkout session' 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
