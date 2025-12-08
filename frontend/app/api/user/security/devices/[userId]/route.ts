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

    // Check if user is requesting their own device info
    if (sessionUser._id.toString() !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Mock trusted devices data (in real app, this would come from user's device history)
    const devices = [
      {
        id: 1,
        name: 'Current Device',
        type: 'desktop',
        lastSeen: new Date().toISOString(),
        location: 'Current Location',
        browser: 'Current Browser',
        current: true,
      },
      {
        id: 2,
        name: 'iPhone',
        type: 'mobile',
        lastSeen: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        location: 'Previous Location',
        browser: 'Safari Mobile',
        current: false,
      },
    ];

    return NextResponse.json({ devices }, { status: 200 });
  } catch (error) {
    console.error('Devices fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user is managing their own devices
    if (sessionUser._id.toString() !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { deviceId } = await request.json();

    // Mock device removal (in real app, this would remove from user's device list)
    return NextResponse.json(
      { message: 'Device removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Device removal error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
