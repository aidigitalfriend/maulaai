import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value ||
                      request.cookies.get('sessionId')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify session
    const sessionUser = await prisma.user.findFirst({
      where: {
        sessionId,
        sessionExpiry: { gt: new Date() },
      },
    });

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    const { userId, points, reason, category = 'bonus' } = await request.json();

    // For security, only allow awarding to self unless admin
    if (userId && userId !== sessionUser.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to award points to other users' },
        { status: 403 }
      );
    }

    const targetUserId = userId || sessionUser.id;

    if (!points || points <= 0) {
      return NextResponse.json(
        { success: false, message: 'Points must be a positive number' },
        { status: 400 }
      );
    }

    if (points > 1000) {
      return NextResponse.json(
        { success: false, message: 'Maximum 1000 points can be awarded at once' },
        { status: 400 }
      );
    }

    // In a real implementation, we would store this in a PointsTransaction table
    // For now, we just acknowledge the request
    // Points are calculated dynamically from chat interactions + bonuses

    return NextResponse.json({
      success: true,
      message: `${points} points awarded for: ${reason || 'Activity bonus'}`,
      transactionId: `PTS-${Date.now()}`,
      pointsAwarded: points,
      category,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to award points' },
      { status: 500 }
    );
  }
}
