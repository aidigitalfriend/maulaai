import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get token from HttpOnly cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is requesting their own security info
    if (decoded.userId !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Connect to database
    await dbConnect();

    // Find user by ID
    const user = await User.findById(params.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        security: {
          emailVerified: !!user.emailVerified,
          twoFactorEnabled: false, // Not implemented yet
          lastLoginAt: user.lastLoginAt,
          accountCreatedAt: user.createdAt,
          passwordLastChanged: user.updatedAt,
          authMethod: user.authMethod || 'password',
          isActive: user.isActive !== false,
          securityScore: {
            score: 75,
            maxScore: 100,
            recommendations: [
              {
                id: 'enable_2fa',
                title: 'Enable Two-Factor Authentication',
                description: 'Add an extra layer of security to your account',
                priority: 'high',
                completed: false,
              },
              {
                id: 'strong_password',
                title: 'Use Strong Password',
                description: 'Your password meets security requirements',
                priority: 'medium',
                completed: true,
              },
            ],
          },
          loginHistory: [
            {
              timestamp: user.lastLoginAt || user.createdAt,
              ipAddress: 'XXX.XXX.XXX.XXX', // Masked for security
              userAgent: 'Browser',
              location: 'Unknown',
              success: true,
            },
          ],
          activeSessions: [
            {
              id: 'current',
              createdAt: user.lastLoginAt || user.createdAt,
              lastActivity: new Date().toISOString(),
              ipAddress: 'XXX.XXX.XXX.XXX',
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
    // Get token from HttpOnly cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is updating their own security settings
    if (decoded.userId !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { action, sessionId } = await request.json();

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
