/**
 * Get User Agent Subscriptions API
 * Returns all agent subscriptions for a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../../lib/mongodb-client';
import { getAgentSubscriptionModel } from '../../../../../../models/AgentSubscription';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const AgentSubscription = await getAgentSubscriptionModel();

    // Find all subscriptions for this user
    const subscriptions = await AgentSubscription.find({
      userId: userId,
    }).sort({ createdAt: -1 }); // Most recent first

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions,
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch subscriptions',
        subscriptions: [],
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
