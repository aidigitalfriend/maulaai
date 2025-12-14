/**
 * Subscriptions API Route
 * Query user subscriptions from MongoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb-client';
import { getAgentSubscriptionModel } from '../../../models/AgentSubscription';

/**
 * GET /api/subscriptions
 * Get all subscriptions for a user
 * Query params: userId, agentId (optional), status (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const AgentSubscription = await getAgentSubscriptionModel();

    // Build query
    const query: any = { userId };
    if (agentId) query.agentId = agentId;
    if (status) query.status = status;

    // Get subscriptions
    const subscriptions = await AgentSubscription.find(query).sort({
      createdAt: -1,
    });

    // Check which subscriptions are currently active
    const subscriptionsWithStatus = subscriptions.map((sub) => ({
      ...sub.toJSON(),
      isActive: sub.isValid(),
      daysUntilRenewal: Math.ceil(
        (sub.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }));

    return NextResponse.json({
      success: true,
      subscriptions: subscriptionsWithStatus,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get subscriptions',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscriptions/check-access
 * Check if user has active subscription for specific agent
 */
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

    await connectToDatabase();
    const AgentSubscription = await getAgentSubscriptionModel();

    // Find active subscription for this user and agent
    const subscription = await AgentSubscription.findOne({
      userId,
      agentId,
      status: 'active',
      expiryDate: { $gt: new Date() },
    });

    const hasAccess = !!subscription;

    return NextResponse.json({
      success: true,
      hasAccess,
      subscription: hasAccess
        ? {
            id: subscription._id,
            plan: subscription.plan,
            status: subscription.status,
            expiryDate: subscription.expiryDate,
            daysUntilRenewal: Math.ceil(
              (subscription.expiryDate.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            ),
            isActive: subscription.isValid(),
          }
        : null,
    });
  } catch (error) {
    console.error('Check access error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to check access',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
