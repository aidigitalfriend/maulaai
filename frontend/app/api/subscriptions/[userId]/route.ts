import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRequest,
  unauthorizedResponse,
} from '../../../../lib/validateAuth';
import { getAgentSubscriptionModel } from '../../../../models/AgentSubscription';
import { connectToDatabase } from '../../../../lib/mongodb-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Require authentication for subscription endpoints
    const authResult = verifyRequest(request);
    if (!authResult.ok) return unauthorizedResponse(authResult.error);

    // Connect to database
    await connectToDatabase();
    
    // Get the AgentSubscription model (uses 'subscriptions' collection)
    const AgentSubscription = await getAgentSubscriptionModel();

    // Query subscriptions collection directly (userId is stored as string)
    const subscriptions = await AgentSubscription.find({ 
      userId: userId 
    }).sort({ createdAt: -1 }).lean();

    console.log(`[/api/subscriptions/${userId}] Found ${subscriptions.length} subscriptions`);

    return NextResponse.json({
      success: true,
      count: subscriptions.length,
      subscriptions: subscriptions
    });
  } catch (err: any) {
    console.error('[/api/subscriptions/[userId]] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to fetch subscriptions',
        subscriptions: [],
      },
      { status: 500 }
    );
  }
}
