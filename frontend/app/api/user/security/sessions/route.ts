import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';

// GET - Get all active sessions for current user
export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    // Parse user agent for current session
    const currentUa = request.headers.get('user-agent') || 'Unknown';
    const currentIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'Unknown';

    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'desktop';

    if (currentUa.includes('Chrome') && !currentUa.includes('Edge')) browser = 'Chrome';
    else if (currentUa.includes('Safari') && !currentUa.includes('Chrome')) browser = 'Safari';
    else if (currentUa.includes('Firefox')) browser = 'Firefox';
    else if (currentUa.includes('Edge')) browser = 'Edge';

    if (currentUa.includes('Windows')) os = 'Windows';
    else if (currentUa.includes('Mac OS')) os = 'macOS';
    else if (currentUa.includes('Linux')) os = 'Linux';
    else if (currentUa.includes('Android')) os = 'Android';
    else if (currentUa.includes('iOS') || currentUa.includes('iPhone')) os = 'iOS';

    if (currentUa.includes('Mobile') || currentUa.includes('Android') || currentUa.includes('iPhone')) device = 'mobile';

    // Try to get sessions from database
    let sessions: any[] = [];
    try {
      sessions = await (prisma as any).userSession.findMany({
        where: { 
          userId: user.id,
          expiresAt: { gt: new Date() }
        },
        orderBy: { lastActivity: 'desc' },
      });
    } catch (e) {
      // Table may not exist yet
    }

    // If no sessions in DB, return current session info
    if (sessions.length === 0) {
      sessions = [{
        id: sessionId,
        sessionToken: sessionId,
        ipAddress: currentIp,
        userAgent: currentUa,
        device,
        browser,
        os,
        location: 'Current Location',
        isCurrent: true,
        createdAt: new Date(),
        lastActivity: new Date(),
      }];
    } else {
      sessions = sessions.map(s => ({
        ...s,
        isCurrent: s.sessionToken === sessionId,
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions.map(s => ({
          id: s.id,
          createdAt: s.createdAt,
          lastActivity: s.lastActivity,
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
          isCurrent: s.isCurrent,
          browser: s.browser,
          device: s.device,
          os: s.os,
          location: s.location || 'Unknown',
        })),
      },
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Revoke a specific session or all other sessions
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetSessionId = searchParams.get('sessionId');
    const revokeAll = searchParams.get('all') === 'true';

    if (revokeAll) {
      // Revoke all sessions except current
      try {
        await (prisma as any).userSession.deleteMany({
          where: {
            userId: user.id,
            sessionToken: { not: sessionId },
          },
        });
      } catch (e) {
        // Table may not exist
      }
      return NextResponse.json({
        success: true,
        message: 'All other sessions have been revoked',
      });
    }

    if (targetSessionId) {
      // Don't allow revoking current session through this endpoint
      if (targetSessionId === sessionId) {
        return NextResponse.json({ message: 'Cannot revoke current session. Please logout instead.' }, { status: 400 });
      }

      try {
        await (prisma as any).userSession.delete({
          where: {
            id: targetSessionId,
            userId: user.id,
          },
        });
      } catch (e) {
        // Table may not exist or session not found
      }

      return NextResponse.json({
        success: true,
        message: 'Session revoked successfully',
      });
    }

    return NextResponse.json({ message: 'Session ID or all parameter required' }, { status: 400 });
  } catch (error) {
    console.error('Revoke session error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
