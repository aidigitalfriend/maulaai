import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAllSessionIds } from '@/lib/session-utils';

// Helper to find valid user from any of the session cookies
async function getValidSessionUser(request: NextRequest) {
  const sessionIds = getAllSessionIds(request);
  if (sessionIds.length === 0) return null;
  
  for (const sessionId of sessionIds) {
    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });
    if (user) return user;
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log(`[/api/subscriptions/${userId}] Request received`);

    const user = await getValidSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    // Query subscriptions for the user
    const subscriptions = await prisma.agentSubscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        agent: {
          select: { agentId: true, name: true, avatarUrl: true },
        },
      },
    });

    console.log(`[/api/subscriptions/${userId}] Found ${subscriptions.length} subscriptions`);

    const activeSubs = subscriptions.filter((s) => s.status === 'active' && s.expiryDate > new Date());
    console.log(`[/api/subscriptions/${userId}] Active subscriptions: ${activeSubs.length}`);

    // Transform to match expected format
    const transformedSubs = subscriptions.map((sub) => ({
      _id: sub.id,
      id: sub.id,
      userId: sub.userId,
      agentId: sub.agentId,
      plan: sub.plan,
      price: sub.price,
      status: sub.status,
      startDate: sub.startDate,
      expiryDate: sub.expiryDate,
      autoRenew: sub.autoRenew,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      agent: sub.agent,
    }));

    return NextResponse.json({
      success: true,
      count: subscriptions.length,
      subscriptions: transformedSubs,
    });
  } catch (err: any) {
    console.error('[/api/subscriptions/[userId]] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch subscriptions', subscriptions: [] },
      { status: 500 }
    );
  }
}
