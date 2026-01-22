import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
      select: { id: true, lastLoginAt: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    // Return minimal login history (current session)
    const loginHistory = [{
      id: '1',
      timestamp: user.lastLoginAt || user.createdAt,
      ipAddress: request.headers.get('x-forwarded-for') || 'Unknown',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      location: 'Unknown',
      status: 'success',
      isCurrent: true,
    }];

    return NextResponse.json({ success: true, data: loginHistory });
  } catch (error) {
    console.error('Login history fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
