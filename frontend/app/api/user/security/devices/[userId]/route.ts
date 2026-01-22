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
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    // Return current session as the only device
    const devices = [{
      id: sessionId,
      name: 'Current Device',
      type: 'web',
      browser: request.headers.get('user-agent') || 'Unknown',
      lastActive: new Date(),
      isCurrent: true,
      location: 'Unknown',
    }];

    return NextResponse.json({ success: true, data: devices });
  } catch (error) {
    console.error('Devices fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    const { deviceId } = await request.json();

    // Can't remove current device
    if (deviceId === sessionId) {
      return NextResponse.json({ message: 'Cannot remove current device' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Device removed' });
  } catch (error) {
    console.error('Device remove error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
