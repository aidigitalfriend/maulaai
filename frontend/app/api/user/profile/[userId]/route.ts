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

    // Check if user is requesting their own profile
    if (decoded.userId !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Connect to database
    await dbConnect();

    // Find user by ID
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

    // Check if user is updating their own profile
    if (decoded.userId !== params.userId) {
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
