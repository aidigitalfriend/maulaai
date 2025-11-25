/**
 * Subscriptions API Route
 * Query user subscriptions from MongoDB
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb-client'
import { getSubscriptionModel } from '../../../models/Subscription'

/**
 * GET /api/subscriptions
 * Get all subscriptions for a user
 * Query params: userId, agentId (optional), status (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const agentId = searchParams.get('agentId')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const Subscription = await getSubscriptionModel()

    // Build query
    const query: any = { userId }
    if (agentId) query.agentId = agentId
    if (status) query.status = status

    // Get subscriptions
    const subscriptions = await Subscription.find(query).sort({ createdAt: -1 })

    // Check which subscriptions are currently active
    const subscriptionsWithStatus = subscriptions.map((sub) => ({
      ...sub.toJSON(),
      isActive: sub.isActive(),
      daysUntilRenewal: sub.getDaysUntilRenewal(),
    }))

    return NextResponse.json({
      success: true,
      subscriptions: subscriptionsWithStatus,
      count: subscriptions.length,
    })

  } catch (error) {
    console.error('Get subscriptions error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get subscriptions' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscriptions/check-access
 * Check if user has active subscription for specific agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, agentId } = body

    if (!userId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'userId and agentId are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const Subscription = await getSubscriptionModel()

    // Find active subscription for this user and agent
    const subscription = await Subscription.findOne({
      userId,
      agentId,
      status: { $in: ['active', 'trialing'] },
      currentPeriodEnd: { $gt: new Date() },
    })

    const hasAccess = !!subscription

    return NextResponse.json({
      success: true,
      hasAccess,
      subscription: hasAccess ? {
        id: subscription._id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        daysUntilRenewal: subscription.getDaysUntilRenewal(),
        isActive: subscription.isActive(),
      } : null,
    })

  } catch (error) {
    console.error('Check access error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check access' 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
