import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../../../lib/mongodb-client';
import { getAgentSubscriptionModel } from '../../../../../../../models/AgentSubscription';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; agentId: string }> }
) {
  try {
    const { userId, agentId } = await params;

    if (!userId || !agentId) {
      return NextResponse.json(
        { error: 'User ID and Agent ID are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const AgentSubscription = await getAgentSubscriptionModel();

    // Find active subscription for this user and agent
    const subscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
      status: 'active',
      expiryDate: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      hasActiveSubscription: !!subscription,
      subscription: subscription,
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      {
        error: 'Failed to check subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
