import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    await dbConnect();

    const sessionUser = await User.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    }).select('-password');

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    if (sessionUser._id.toString() !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const preferences = body.preferences || {};

    const allowedPreferenceKeys: Array<
      'emailNotifications' | 'smsNotifications' | 'marketingEmails' | 'productUpdates'
    > = ['emailNotifications', 'smsNotifications', 'marketingEmails', 'productUpdates'];

    const sanitizedPreferences: Record<string, boolean> = {};

    for (const key of allowedPreferenceKeys) {
      const value = preferences[key];
      if (typeof value === 'boolean') {
        sanitizedPreferences[key] = value;
      }
    }

    if (!Object.keys(sanitizedPreferences).length) {
      return NextResponse.json(
        { message: 'No valid preferences supplied' },
        { status: 400 }
      );
    }

    const mergedPreferences = {
      ...(sessionUser.preferences || {}),
      ...sanitizedPreferences,
    };

    const updatedUser = await User.findByIdAndUpdate(
      params.userId,
      {
        $set: {
          preferences: mergedPreferences,
          updatedAt: new Date(),
        },
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Preferences updated successfully',
        preferences: mergedPreferences,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile preferences update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
