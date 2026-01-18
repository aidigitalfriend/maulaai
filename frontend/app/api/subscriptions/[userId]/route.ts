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
    console.log(`[/api/subscriptions/${userId}] Request received`);

    // Require authentication for subscription endpoints
    const authResult = verifyRequest(request);
    console.log(`[/api/subscriptions/${userId}] Auth result:`, authResult.ok ? 'OK' : authResult.error);
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
    
    // Log active ones for debugging
    const activeSubs = subscriptions.filter((s: any) => s.status === 'active' && new Date(s.expiryDate) > new Date());
    console.log(`[/api/subscriptions/${userId}] Active subscriptions: ${activeSubs.length}`);

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
