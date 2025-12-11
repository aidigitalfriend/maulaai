import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Force dynamic so we always validate the live session
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get session ID from HttpOnly cookie
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Find user with valid session
    const user = await User.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    }).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        profile: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          authMethod: user.authMethod,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          emailVerified: user.emailVerified,
          isActive: user.isActive ?? true,
          preferences: user.preferences || {},
          avatar: user.avatar || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile (session) fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
