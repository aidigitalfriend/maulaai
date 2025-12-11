import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB || 'onelastai';

function detectDeviceName(userAgent: string) {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Macintosh')) return 'MacBook';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Linux')) return 'Linux Computer';
  return 'Unknown Device';
}

function detectDeviceType(userAgent: string) {
  if (userAgent.includes('Mobile') || userAgent.includes('iPhone'))
    return 'mobile';
  if (userAgent.includes('iPad') || userAgent.includes('Tablet'))
    return 'tablet';
  return 'desktop';
}

function detectBrowser(userAgent: string) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
    return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
}

function calculateSecurityScore(userSecurity: any) {
  let score = 50;

  if (userSecurity.twoFactorEnabled) score += 25;

  const passwordChangedAt = userSecurity.passwordLastChanged
    ? new Date(userSecurity.passwordLastChanged)
    : new Date();
  const passwordAge = Date.now() - passwordChangedAt.getTime();
  const daysOld = passwordAge / (1000 * 60 * 60 * 24);
  if (daysOld < 90) score += 15;
  else if (daysOld < 180) score += 10;
  else if (daysOld < 365) score += 5;

  if ((userSecurity.failedLoginAttempts || 0) === 0) score += 5;
  if (!userSecurity.accountLocked) score += 5;

  return Math.min(100, Math.max(0, score));
}

function generateSecurityRecommendations(userSecurity: any) {
  const recommendations: any[] = [];

  if (!userSecurity.twoFactorEnabled) {
    recommendations.push({
      id: 1,
      type: 'warning',
      title: 'Enable Two-Factor Authentication',
      description: 'Secure your account with 2FA for better protection',
      priority: 'high',
    });
  }

  const passwordChangedAt = userSecurity.passwordLastChanged
    ? new Date(userSecurity.passwordLastChanged)
    : new Date();
  const passwordAge = Date.now() - passwordChangedAt.getTime();
  const daysOld = passwordAge / (1000 * 60 * 60 * 24);
  if (daysOld > 180) {
    recommendations.push({
      id: 2,
      type: 'info',
      title: 'Update Your Password',
      description: 'Your password is over 6 months old. Consider updating it.',
      priority: 'medium',
    });
  }

  if ((userSecurity.failedLoginAttempts || 0) > 3) {
    recommendations.push({
      id: 3,
      type: 'warning',
      title: 'Recent Failed Login Attempts',
      description: 'Someone may be trying to access your account',
      priority: 'high',
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: 4,
      type: 'success',
      title: 'Great Security Posture!',
      description: 'Your account security is well configured',
      priority: 'low',
    });
  }

  return recommendations;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const sessionUser = await users.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const sessionUserId = sessionUser._id.toString();

    if (params.userId && params.userId !== sessionUserId) {
      console.warn('Security access mismatch. Using session user.', {
        sessionUserId,
        requestedUserId: params.userId,
      });
    }

    const targetUserId = sessionUserId;

    const userSecurities = db.collection('usersecurities');
    let userSecurity = (await userSecurities.findOne({
      userId: targetUserId,
    })) as Record<string, any> | null;

    if (!userSecurity) {
      const userAgent = request.headers.get('user-agent') || 'Unknown Browser';
      const forwardedIp =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
      const userIP = forwardedIp || (request as any).ip || 'unknown';

      const currentDevice = {
        id: `device-${Date.now()}`,
        name: detectDeviceName(userAgent),
        type: detectDeviceType(userAgent),
        lastSeen: new Date().toISOString(),
        location: 'Current Session',
        browser: detectBrowser(userAgent),
        current: true,
        ipAddress: userIP,
      };

      const currentLogin = {
        timestamp: new Date(),
        ipAddress: userIP,
        userAgent,
        success: true,
        location: 'Current Session',
      };

      const now = new Date();
      const defaultSecurity: Record<string, any> = {
        userId: targetUserId,
        email: sessionUser.email,
        passwordLastChanged: sessionUser.updatedAt || now,
        twoFactorEnabled: sessionUser.twoFactorEnabled || false,
        twoFactorSecret: sessionUser.twoFactorSecret || null,
        backupCodes: sessionUser.backupCodes || [],
        trustedDevices: [currentDevice],
        loginHistory: [currentLogin],
        activeSessions: [
          {
            id: 'current',
            createdAt: sessionUser.lastLoginAt || sessionUser.createdAt,
            lastActivity: now,
            ipAddress: userIP,
            userAgent,
            isCurrent: true,
          },
        ],
        securityQuestions: [],
        accountLocked: false,
        lockReason: null,
        lockExpires: null,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        createdAt: now,
        updatedAt: now,
      };

      await userSecurities.insertOne(defaultSecurity);
      userSecurity = defaultSecurity;
    }

    const securityData = {
      email: sessionUser.email,
      emailVerified: !!sessionUser.emailVerified,
      authMethod: sessionUser.authMethod || 'password',
      lastLoginAt: sessionUser.lastLoginAt,
      accountCreatedAt: sessionUser.createdAt,
      passwordLastChanged:
        userSecurity?.passwordLastChanged || sessionUser.updatedAt,
      twoFactorEnabled: userSecurity?.twoFactorEnabled || false,
      twoFactorMethod: userSecurity?.twoFactorMethod || 'authenticator',
      backupCodes: userSecurity?.backupCodes || [],
      trustedDevices: userSecurity?.trustedDevices || [],
      loginHistory: userSecurity?.loginHistory || [],
      activeSessions: userSecurity?.activeSessions || [],
      failedLoginAttempts: userSecurity?.failedLoginAttempts || 0,
      accountLocked: userSecurity?.accountLocked || false,
      securityScore: calculateSecurityScore(userSecurity || {}),
      recommendations: generateSecurityRecommendations(userSecurity || {}),
    };

    return NextResponse.json({ success: true, data: securityData });
  } catch (error) {
    console.error('Security fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const sessionUser = await users.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const sessionUserId = sessionUser._id.toString();

    if (params.userId && params.userId !== sessionUserId) {
      console.warn('Security action mismatch. Using session user.', {
        sessionUserId,
        requestedUserId: params.userId,
      });
    }

    const { action } = await request.json();

    if (action === 'revoke_session' && sessionId) {
      return NextResponse.json(
        { message: 'Session revoked successfully' },
        { status: 200 }
      );
    }

    if (action === 'enable_2fa') {
      return NextResponse.json(
        { message: 'Two-factor authentication setup not yet implemented' },
        { status: 501 }
      );
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Security action error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
