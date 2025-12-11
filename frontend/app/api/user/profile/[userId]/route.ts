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
      return NextResponse.json(
        {
          message: 'Access denied',
          debug: {
            sessionUserId: sessionUser._id.toString(),
            requestedUserId: params.userId,
          },
        },
        { status: 403 }
      );
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
          isActive: user.isActive ?? true,
          preferences: user.preferences || {},
          avatar: user.avatar || null,
          bio: user.bio || '',
          phoneNumber: user.phoneNumber || '',
          location: user.location || '',
          timezone: user.timezone || '',
          profession: user.profession || '',
          company: user.company || '',
          website: user.website || '',
          socialLinks: {
            linkedin: user.socialLinks?.linkedin || '',
            twitter: user.socialLinks?.twitter || '',
            github: user.socialLinks?.github || '',
          },
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

    const payload = await request.json();

    const allowedFields = [
      'name',
      'email',
      'bio',
      'phoneNumber',
      'location',
      'timezone',
      'profession',
      'company',
      'website',
      'socialLinks',
      'preferences',
      'avatar',
    ] as const;

    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (payload[field] === undefined) continue;

      if (field === 'socialLinks') {
        updateData.socialLinks = {
          linkedin: payload.socialLinks?.linkedin || '',
          twitter: payload.socialLinks?.twitter || '',
          github: payload.socialLinks?.github || '',
        };
      } else if (field === 'preferences') {
        updateData.preferences = {
          ...(sessionUser.preferences || {}),
          ...payload.preferences,
        };
      } else if (field === 'email' && typeof payload.email === 'string') {
        updateData.email = payload.email.trim().toLowerCase();
      } else {
        updateData[field] = payload[field];
      }
    }

    if (!Object.keys(updateData).length) {
      return NextResponse.json(
        { message: 'No valid updates supplied' },
        { status: 400 }
      );
    }

    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      params.userId,
      { $set: updateData },
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
          isActive: user.isActive ?? true,
          preferences: user.preferences || {},
          avatar: user.avatar || null,
          bio: user.bio || '',
          phoneNumber: user.phoneNumber || '',
          location: user.location || '',
          timezone: user.timezone || '',
          profession: user.profession || '',
          company: user.company || '',
          website: user.website || '',
          socialLinks: {
            linkedin: user.socialLinks?.linkedin || '',
            twitter: user.socialLinks?.twitter || '',
            github: user.socialLinks?.github || '',
          },
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
