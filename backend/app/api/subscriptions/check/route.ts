import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';

/**
 * POST /api/subscriptions/check
 * Check if user has an active subscription for a specific agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, agentId } = body;

    if ((!userId && !email) || !agentId) {
      return NextResponse.json(
        { error: 'userId/email and agentId are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Build query
    const query: any = {
      agentId,
      status: { $in: ['active', 'trialing'] },
      currentPeriodEnd: { $gte: new Date() },
    };

    if (userId) query.userId = userId;
    if (email) query.email = email;

    // Find active subscription
    const subscription = await Subscription.findOne(query).sort({
      createdAt: -1,
    });

    if (!subscription) {
      return NextResponse.json({
        success: true,
        hasAccess: false,
        message: 'No active subscription found',
      });
    }

    // Calculate days until renewal
    const daysUntilRenewal = subscription.getDaysUntilRenewal();

    return NextResponse.json({
      success: true,
      hasAccess: true,
      subscription: {
        id: subscription._id,
        agentId: subscription.agentId,
        agentName: subscription.agentName,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        daysUntilRenewal,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
    });
  } catch (error: any) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription', details: error.message },
      { status: 500 }
    );
  }
}
