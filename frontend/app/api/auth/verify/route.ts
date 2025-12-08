import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Auth verify endpoint called');

    // Get session ID from HttpOnly cookie
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      console.log('❌ No session ID in cookie');
      return NextResponse.json(
        { message: 'No session ID' },
        { status: 401 }
      );
    }

    console.log('🎫 Session ID received from cookie, verifying...');

    // Connect to database
    await dbConnect();

    // Find user with valid session
    const user = await User.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() }
    }).select('-password');

    if (!user) {
      console.log('❌ Invalid or expired session');
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    console.log('✅ Session verified for user:', user.email);

    // Return user data
    return NextResponse.json(
      {
        valid: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          authMethod: user.authMethod,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Session verification error:', error);
    return NextResponse.json(
      { valid: false, message: 'Session verification failed' },
      { status: 401 }
    );
  }
}

// Add POST method for AuthContext compatibility
export async function POST(request: NextRequest) {
  return GET(request); // Use same logic as GET
}
