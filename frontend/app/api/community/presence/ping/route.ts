import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getSessionIdFromCookies } from '@/lib/session-utils';

// =====================================================
// POST /api/community/presence/ping - Update user presence
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionIdFromCookies();

    let userName = 'Guest';
    let onlineCount = 1;

    // Try to get user info from session
    if (sessionId) {
      const user = await prisma.user.findFirst({
        where: {
          sessionId,
          sessionExpiry: { gt: new Date() },
          isActive: true,
        },
        select: { id: true, name: true, email: true },
      });

      if (user) {
        userName = user.name || 'Member';
        
        // Update user's last activity
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
    }

    // Get online count (users with session activity in last 60 seconds)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    onlineCount = await prisma.user.count({
      where: {
        sessionExpiry: { gt: new Date() },
        lastLoginAt: { gte: oneMinuteAgo },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Presence updated',
      data: {
        sessionId: sessionId || 'anonymous',
        status: 'online',
        onlineCount: Math.max(1, onlineCount),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Presence ping error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}
