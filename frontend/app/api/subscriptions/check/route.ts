import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';
import { getAgentSubscriptionModel } from '@/models/AgentSubscription';

export const dynamic = 'force-dynamic';

function daysUntil(date: Date) {
  const now = Date.now();
  const target = new Date(date).getTime();
  return target > now ? Math.ceil((target - now) / (1000 * 60 * 60 * 24)) : 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, agentId } = body || {};

    if (!agentId || (!userId && !email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'agentId and either userId or email are required',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const AgentSubscription = await getAgentSubscriptionModel();

    const match = await AgentSubscription.findOne({
      agentId,
      userId,
      status: 'active',
      expiryDate: { $gt: new Date() },
    }).sort({ expiryDate: -1 });

    if (!match) {
      return NextResponse.json({
        success: true,
        hasAccess: false,
        subscription: null,
        message: 'No active subscription found',
      });
    }

    return NextResponse.json({
      success: true,
      hasAccess: true,
      subscription: {
        id: match._id?.toString?.() ?? match._id,
        agentId: match.agentId,
        plan: match.plan,
        status: match.status,
        expiryDate: match.expiryDate,
        daysUntilRenewal: daysUntil(match.expiryDate),
        price: match.price,
      },
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to verify subscription',
      },
      { status: 500 }
    );
  }
}
