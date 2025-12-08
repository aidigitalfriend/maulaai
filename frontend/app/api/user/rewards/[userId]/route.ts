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
      return NextResponse.json(
        { message: 'No session ID' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find user with valid session
    const sessionUser = await User.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() }
    }).select('-password');

    if (!sessionUser) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    // Check if user is requesting their own rewards
    if (sessionUser._id.toString() !== params.userId) {
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
