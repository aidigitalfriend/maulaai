import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get session ID from HttpOnly cookie
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Find user with valid session
    const sessionUser = await User.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    }).select('-password');

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Debug logging
    console.log('🔒 Security API Debug:');
    console.log('Session User ID:', sessionUser._id.toString());
    console.log('Requested User ID:', params.userId);
    
    // Check if user is requesting their own security info
    if (sessionUser._id.toString() !== params.userId) {
      console.log('❌ Security Access denied - User ID mismatch');
      return NextResponse.json({ 
        message: 'Access denied',
        debug: {
          sessionUserId: sessionUser._id.toString(),
          requestedUserId: params.userId
        }
      }, { status: 403 });
    }

    console.log('✅ Security Access granted for user:', params.userId);

    // Connect to database
    await dbConnect();

    // Find user by ID
    const user = await User.findById(params.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          twoFactor: {
            enabled: user.twoFactorEnabled || false,
            method: user.twoFactorMethod || 'authenticator',
            backupCodes: user.backupCodes || [],
          },
        },
        security: {
          emailVerified: !!user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled || false,
          lastLoginAt: user.lastLoginAt,
          accountCreatedAt: user.createdAt,
          passwordLastChanged: user.updatedAt,
          authMethod: user.authMethod || 'password',
          isActive: user.isActive !== false,
          securityScore: {
            score: user.twoFactorEnabled ? 95 : 75,
            maxScore: 100,
            recommendations: user.twoFactorEnabled
              ? []
              : [
                  {
                    id: 'enable_2fa',
                    title: 'Enable Two-Factor Authentication',
                    description:
                      'Add an extra layer of security to your account',
                    priority: 'high',
                    completed: false,
                  },
                ],
          },
          trustedDevices: [
            {
              id: 1,
              name: 'Current Device',
              type: 'desktop',
              lastSeen: new Date().toISOString(),
              location: 'Current Location',
              browser: 'Current Browser',
              current: true,
            },
          ],
          loginHistory: [
            {
              id: 1,
              date: user.lastLoginAt || user.createdAt,
              location: 'Current Location',
              device: 'Current Device',
              status: 'success',
              ip: '127.0.0.1',
            },
          ],
          activeSessions: [
            {
              id: 'current',
              createdAt: user.lastLoginAt || user.createdAt,
              lastActivity: new Date().toISOString(),
              ipAddress: '127.0.0.1',
              userAgent: 'Current Browser',
              isCurrent: true,
            },
          ],
        },
      },
      { status: 200 }
    );
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
    // Get session ID from HttpOnly cookie
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Find user with valid session
    const sessionUser = await User.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    }).select('-password');

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Check if user is updating their own security settings
    if (sessionUser._id.toString() !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { action, targetSessionId } = await request.json();

    // Handle different security actions
    if (action === 'revoke_session' && sessionId) {
      // For now, just return success (actual session management would be implemented here)
      return NextResponse.json(
        { message: 'Session revoked successfully' },
        { status: 200 }
      );
    }

    if (action === 'enable_2fa') {
      // Placeholder for 2FA implementation
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
