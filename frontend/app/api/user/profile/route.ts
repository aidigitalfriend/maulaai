import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Force dynamic so we always validate the live session
export const dynamic = 'force-dynamic';

function serializeProfile(user: any) {
  return {
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
  };
}

async function getSessionUser(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;

  if (!sessionId) {
    return NextResponse.json({ message: 'No session ID' }, { status: 401 });
  }

  await dbConnect();

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

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const sessionUserOrResponse = await getSessionUser(request);

    if (sessionUserOrResponse instanceof NextResponse) {
      return sessionUserOrResponse;
    }

    return NextResponse.json(
      {
        success: true,
        profile: serializeProfile(sessionUserOrResponse),
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

export async function PUT(request: NextRequest) {
  try {
    const sessionUserOrResponse = await getSessionUser(request);

    if (sessionUserOrResponse instanceof NextResponse) {
      return sessionUserOrResponse;
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
          ...(sessionUserOrResponse.preferences || {}),
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

    const updatedUser = await User.findByIdAndUpdate(
      sessionUserOrResponse._id,
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        profile: serializeProfile(updatedUser),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile (session) update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
