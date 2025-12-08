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

    // Check if user is requesting their own rewards
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

    // Return mock rewards data for now
    return NextResponse.json(
      {
        rewards: {
          points: 100,
          level: 1,
          badges: [
            {
              id: 'welcome',
              name: 'Welcome Badge',
              description: 'Earned for joining the platform',
              earnedAt: user.createdAt,
              icon: '🎉',
            },
          ],
          achievements: [
            {
              id: 'first_login',
              name: 'First Steps',
              description: 'Completed your first login',
              progress: 100,
              maxProgress: 100,
              earnedAt: user.lastLoginAt || user.createdAt,
            },
          ],
          streak: {
            current: 1,
            longest: 1,
            lastActivity: user.lastLoginAt || user.createdAt,
          },
          nextLevelPoints: 500,
          totalPointsEarned: 100,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Rewards fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
