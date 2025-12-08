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
    console.log('🔍 Profile API Debug:');
    console.log('Session User ID:', sessionUser._id.toString());
    console.log('Requested User ID:', params.userId);
    console.log('IDs Match:', sessionUser._id.toString() === params.userId);

    // Check if user is requesting their own profile
    if (sessionUser._id.toString() !== params.userId) {
      console.log('❌ Profile Access denied - User ID mismatch');
      return NextResponse.json({ 
        message: 'Access denied',
        debug: {
          sessionUserId: sessionUser._id.toString(),
          requestedUserId: params.userId
        }
      }, { status: 403 });
    }

    console.log('✅ Profile Access granted for user:', params.userId);

    // Find user by ID (same as sessionUser, but keep for consistency)
    const user = await User.findById(params.userId).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
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
          isActive: user.isActive || true,
          preferences: user.preferences || {},
          avatar: user.avatar || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Check if user is updating their own profile
    if (sessionUser._id.toString() !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { name, preferences, avatar } = await request.json();

    // Connect to database
    await dbConnect();

    // Update user profile
    const user = await User.findByIdAndUpdate(
      params.userId,
      {
        ...(name && { name }),
        ...(preferences && { preferences }),
        ...(avatar !== undefined && { avatar }),
        updatedAt: new Date(),
      },
      { new: true, select: '-password' }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        profile: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          authMethod: user.authMethod,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          emailVerified: user.emailVerified,
          isActive: user.isActive || true,
          preferences: user.preferences || {},
          avatar: user.avatar || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
