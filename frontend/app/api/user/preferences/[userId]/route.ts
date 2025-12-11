import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';

// Force dynamic rendering so we always hit the database
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get session ID from HttpOnly cookie
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Check if user is requesting their own preferences
    if (sessionUser._id.toString() !== userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Get user preferences from userpreferences collection
    const userPreferences = db.collection('userpreferences');
    let preferences = await userPreferences.findOne({ userId });

    // If no preferences exist, create default
    if (!preferences) {
      const defaultPreferences = {
        userId,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        notifications: {
          email: {
            enabled: true,
            frequency: 'immediate',
            types: ['security', 'billing', 'updates'],
          },
          push: {
            enabled: true,
            types: ['messages', 'reminders'],
          },
          sms: {
            enabled: false,
            types: [],
          },
        },
        dashboard: {
          defaultView: 'overview',
          widgets: ['profile', 'security', 'rewards', 'analytics'],
          layout: 'grid',
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          reduceMotion: false,
          screenReader: false,
        },
        privacy: {
          showOnlineStatus: true,
          allowDataCollection: true,
          shareUsageStats: false,
        },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userPreferences.insertOne(defaultPreferences);
      preferences = defaultPreferences;
    }

    // Return preferences data
    const { _id, ...preferencesData } = preferences as any;
    return NextResponse.json({ success: true, data: preferencesData });
  } catch (error) {
    console.error('Preferences error (Next API):', error);
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
    const { userId } = params;
    const updateData = await request.json();

    // Get session ID from HttpOnly cookie
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Check if user is updating their own preferences
    if (sessionUser._id.toString() !== userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Validate and sanitize update data
    const allowedFields = [
      'theme',
      'language',
      'timezone',
      'dateFormat',
      'timeFormat',
      'currency',
      'notifications',
      'dashboard',
      'accessibility',
      'privacy',
      'integrations',
    ];

    const sanitizedUpdate: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedUpdate[field] = updateData[field];
      }
    }

    // Add updated timestamp
    sanitizedUpdate.updatedAt = new Date();

    const userPreferences = db.collection('userpreferences');
    const result = await userPreferences.updateOne(
      { userId },
      { $set: sanitizedUpdate },
      { upsert: true }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return NextResponse.json(
        { message: 'Failed to update preferences' },
        { status: 404 }
      );
    }

    const updatedPreferences = await userPreferences.findOne({ userId });
    const { _id, ...preferencesData } = updatedPreferences as any;

    return NextResponse.json({
      success: true,
      data: preferencesData,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Preferences update error (Next API):', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
