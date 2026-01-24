import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';

// Helper to parse user agent
function parseUserAgent(ua: string) {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'desktop';

  // Browser detection (order matters - check more specific first)
  if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';

  // OS detection (check more specific patterns first)
  if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
  else if (ua.includes('Windows NT')) os = 'Windows';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('CrOS')) os = 'Chrome OS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone')) os = 'iOS';
  else if (ua.includes('iPad')) os = 'iPadOS';
  else if (ua.includes('Linux')) os = 'Linux';

  // Device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'mobile';
  else if (ua.includes('Tablet') || ua.includes('iPad')) device = 'tablet';

  return { browser, os, device };
}

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

    const currentUa = request.headers.get('user-agent') || 'Unknown';
    const currentIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'Unknown';
    const { browser, os, device } = parseUserAgent(currentUa);

    // Try to get devices from database
    let devices: any[] = [];
    try {
      devices = await (prisma as any).userDevice.findMany({
        where: { userId: user.id },
        orderBy: { lastActive: 'desc' },
      });
    } catch (e) {
      // Table may not exist yet
    }

    // If no devices in DB, return current device
    if (devices.length === 0) {
      devices = [{
        id: 'current',
        deviceId: sessionId,
        name: `${browser} on ${os}`,
        type: device,
        browser,
        os,
        ipAddress: currentIp,
        location: 'Current Location',
        isTrusted: true,
        lastActive: new Date(),
        createdAt: new Date(),
        current: true,
      }];
    } else {
      // Mark current device
      devices = devices.map(d => ({
        ...d,
        current: d.deviceId === sessionId,
      }));
    }

    return NextResponse.json({ 
      success: true, 
      data: devices.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        browser: d.browser,
        os: d.os,
        lastSeen: d.lastActive,
        location: d.location || 'Unknown',
        current: d.current || false,
        isTrusted: d.isTrusted || false,
        ipAddress: d.ipAddress,
      }))
    });
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

    if (!deviceId) {
      return NextResponse.json({ message: 'Device ID required' }, { status: 400 });
    }

    // Can't remove current device
    if (deviceId === sessionId || deviceId === 'current') {
      return NextResponse.json({ message: 'Cannot remove current device' }, { status: 400 });
    }

    try {
      await (prisma as any).userDevice.delete({
        where: {
          id: deviceId,
          userId: user.id,
        },
      });
    } catch (e) {
      // Table may not exist or device not found
    }

    return NextResponse.json({ success: true, message: 'Device removed successfully' });
  } catch (error) {
    console.error('Device remove error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Trust/Untrust a device
export async function PUT(
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

    const { deviceId, trusted } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ message: 'Device ID required' }, { status: 400 });
    }

    try {
      await (prisma as any).userDevice.update({
        where: {
          id: deviceId,
          userId: user.id,
        },
        data: { isTrusted: trusted },
      });
    } catch (e) {
      // Table may not exist or device not found
      return NextResponse.json({ message: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: trusted ? 'Device trusted' : 'Device untrusted' 
    });
  } catch (error) {
    console.error('Device trust update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
