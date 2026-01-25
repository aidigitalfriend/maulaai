import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAllSessionIds } from '@/lib/session-utils';

// Helper to find valid user from any of the session cookies
// Returns both user and the sessionId that matched
async function getValidSessionUser(request: NextRequest, select?: Record<string, boolean>): Promise<{ user: any; sessionId: string } | null> {
  const sessionIds = getAllSessionIds(request);
  if (sessionIds.length === 0) return null;
  
  for (const sessionId of sessionIds) {
    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
      ...(select && { select }),
    });
    if (user) return { user, sessionId };
  }
  return null;
}

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
    const result = await getValidSessionUser(request, {
      id: true,
      email: true,
      twoFactorEnabled: true,
      backupCodes: true,
      lastLoginAt: true,
      createdAt: true,
      passwordChangedAt: true,
    });

    if (!result) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    const { user, sessionId } = result;

    // Get login history
    let loginHistory: any[] = [];
    try {
      loginHistory = await (prisma as any).loginHistory.findMany({
        where: { userId: user.id },
        orderBy: { timestamp: 'desc' },
        take: 20,
      });
    } catch (e) {
      // Table may not exist yet
      console.log('LoginHistory table not available yet');
    }

    // Current session info from request
    const currentIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'Unknown';
    const currentUa = request.headers.get('user-agent') || 'Unknown';
    const { browser, os, device } = parseUserAgent(currentUa);

    // If no login history in DB, show current login
    if (loginHistory.length === 0) {
      loginHistory = [{
        id: 'current',
        timestamp: user.lastLoginAt || new Date(),
        ipAddress: currentIp,
        userAgent: currentUa,
        browser,
        os,
        device: `${browser} on ${os}`,
        location: 'Current Session',
        status: 'success',
      }];
    }

    // Get user devices
    let devices: any[] = [];
    try {
      devices = await (prisma as any).userDevice.findMany({
        where: { userId: user.id },
        orderBy: { lastActive: 'desc' },
      });
    } catch (e) {
      console.log('UserDevice table not available yet');
    }

    // Get active sessions
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
      console.log('UserSession table not available yet');
    }

    // If no sessions in DB, show current session
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
      // Mark current session
      sessions = sessions.map(s => ({
        ...s,
        isCurrent: s.sessionToken === sessionId,
      }));
    }

    // If no devices, create current device entry
    if (devices.length === 0) {
      devices = [{
        id: 'current',
        name: `${browser} on ${os}`,
        type: device,
        browser,
        os,
        ipAddress: currentIp,
        location: 'Unknown',
        isTrusted: true,
        lastActive: new Date(),
        current: true,
      }];
    }

    // Calculate security score
    let securityScore = 30; // Base score
    if (user.twoFactorEnabled) securityScore += 40;
    if (user.passwordChangedAt && 
        new Date(user.passwordChangedAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
      securityScore += 15; // Password changed in last 90 days
    }
    if (user.backupCodes && user.backupCodes.length > 0) securityScore += 15;

    // Generate recommendations
    const recommendations: any[] = [];
    if (!user.twoFactorEnabled) {
      recommendations.push({
        id: 'enable-2fa',
        type: 'warning',
        title: 'Enable Two-Factor Authentication',
        description: 'Add an extra layer of security to your account',
        priority: 'high',
      });
    }
    if (!user.passwordChangedAt || 
        new Date(user.passwordChangedAt) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
      recommendations.push({
        id: 'change-password',
        type: 'info',
        title: 'Update Your Password',
        description: 'Consider changing your password regularly for better security',
        priority: 'medium',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        twoFactorEnabled: user.twoFactorEnabled,
        backupCodes: user.backupCodes || [],
        lastLogin: user.lastLoginAt,
        accountCreated: user.createdAt,
        passwordLastChanged: user.passwordChangedAt,
        activeSessions: sessions.map(s => ({
          id: s.id,
          createdAt: s.createdAt,
          lastActivity: s.lastActivity,
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
          isCurrent: s.isCurrent,
          browser: s.browser,
          device: s.device,
          location: s.location || 'Unknown',
        })),
        trustedDevices: devices.map(d => ({
          id: d.id,
          name: d.name,
          type: d.type,
          browser: d.browser,
          lastSeen: d.lastActive,
          location: d.location || 'Unknown',
          current: d.current || false,
          ipAddress: d.ipAddress,
        })),
        loginHistory: loginHistory.map(h => ({
          id: h.id,
          date: h.timestamp,
          device: h.device || `${h.browser} on ${h.os}`,
          location: h.location || h.city || 'Unknown',
          status: h.status,
          ip: h.ipAddress,
        })),
        recommendations,
        securityScore,
      },
    });
  } catch (error) {
    console.error('Security settings fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

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

    const body = await request.json();

    // Handle session revocation
    if (body.activeSessions !== undefined) {
      const sessionsToKeep = body.activeSessions.map((s: any) => s.id);
      try {
        // Delete sessions not in the keep list (except current)
        await (prisma as any).userSession.deleteMany({
          where: {
            userId: user.id,
            id: { notIn: sessionsToKeep },
            sessionToken: { not: sessionId }, // Don't delete current session
          },
        });
      } catch (e) {
        // Table may not exist
        console.log('UserSession table not available');
      }
    }

    // Handle device removal
    if (body.trustedDevices !== undefined) {
      const devicesToKeep = body.trustedDevices.map((d: any) => d.id);
      try {
        await (prisma as any).userDevice.deleteMany({
          where: {
            userId: user.id,
            id: { notIn: devicesToKeep },
          },
        });
      } catch (e) {
        // Table may not exist
        console.log('UserDevice table not available');
      }
    }

    // Update 2FA setting if provided
    if (body.twoFactorEnabled !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: body.twoFactorEnabled,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Security settings updated' });
  } catch (error) {
    console.error('Security settings update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
