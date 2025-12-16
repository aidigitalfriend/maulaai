import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';
import { getAgentSubscriptionModel } from '@/models/AgentSubscription';

/**
 * Cancel Subscription API Route
 * Allows users to cancel their active subscription for a specific agent
 *
 * This marks the subscription as 'cancelled' but keeps the record in the database
 * for history tracking. User will lose access immediately.
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

    await connectToDatabase();
    const AgentSubscription = await getAgentSubscriptionModel();

    // Find active subscription
    const subscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
      status: 'active',
    });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active subscription found for this agent',
        },
        { status: 404 }
      );
    }

    // Mark as cancelled (keep in database for history)
    subscription.status = 'cancelled';
    await subscription.save();

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        id: subscription._id?.toString() || subscription._id,
        agentId: subscription.agentId,
        plan: subscription.plan,
        status: 'cancelled',
        wasExpiringOn: subscription.expiryDate,
        cancelledAt: new Date(),
      },
    });
  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to cancel subscription',
      },
      { status: 500 }
    );
  }
}
