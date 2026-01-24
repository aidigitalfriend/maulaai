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
      select: { id: true, lastLoginAt: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    // Try to get login history from database
    let loginHistory: any[] = [];
    try {
      loginHistory = await (prisma as any).loginHistory.findMany({
        where: { userId: user.id },
        orderBy: { timestamp: 'desc' },
        take: 50, // Limit to last 50 entries
      });
    } catch (e) {
      // Table may not exist yet
    }

    const currentUa = request.headers.get('user-agent') || 'Unknown';
    const currentIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'Unknown';
    const { browser, os, device } = parseUserAgent(currentUa);

    // If no history in DB, return current session entry
    if (loginHistory.length === 0) {
      loginHistory = [{
        id: '1',
        timestamp: user.lastLoginAt || user.createdAt,
        ipAddress: currentIp,
        userAgent: currentUa,
        browser,
        os,
        device,
        location: 'Current Location',
        status: 'success',
        isCurrent: true,
      }];
    }

    return NextResponse.json({ 
      success: true, 
      data: loginHistory.map(h => ({
        id: h.id,
        date: h.timestamp,
        ip: h.ipAddress,
        userAgent: h.userAgent,
        browser: h.browser || parseUserAgent(h.userAgent || '').browser,
        os: h.os || parseUserAgent(h.userAgent || '').os,
        device: h.device || `${h.browser || 'Unknown'} on ${h.os || 'Unknown'}`,
        location: h.location || h.city || 'Unknown',
        country: h.country,
        city: h.city,
        status: h.status,
        failReason: h.failReason,
      }))
    });
  } catch (error) {
    console.error('Login history fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
