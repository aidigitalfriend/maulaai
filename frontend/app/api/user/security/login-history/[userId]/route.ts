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

    // Check if user is requesting their own login history
    if (sessionUser._id.toString() !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Mock login history data (in real app, this would come from user's login log)
    const loginHistory = [
      {
        id: 1,
        date: new Date().toISOString(),
        location: 'Current Location',
        device: 'Current Device',
        status: 'success',
        ip: '127.0.0.1',
      },
      {
        id: 2,
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        location: 'Previous Location',
        device: 'iPhone',
        status: 'success',
        ip: '192.168.1.100',
      },
      {
        id: 3,
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        location: 'Home',
        device: 'Laptop',
        status: 'success',
        ip: '192.168.1.101',
      },
    ];

    return NextResponse.json({ loginHistory }, { status: 200 });
  } catch (error) {
    console.error('Login history fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
