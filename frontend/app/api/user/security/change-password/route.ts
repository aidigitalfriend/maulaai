import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

const DB_NAME = process.env.MONGODB_DB || 'onelastai';

export async function POST(request: NextRequest) {
  try {
    // Get session ID from HttpOnly cookie
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'No session ID' },
        { status: 401 }
      );
    }

    // Connect to database
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const users = db.collection('users');
    const userSecurities = db.collection('usersecurities');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Current password and new password are required',
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: 'New password must be at least 8 characters long',
        },
        { status: 400 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      sessionUser.password
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    const now = new Date();

    // Update password in users collection
    await users.updateOne(
      { _id: sessionUser._id },
      {
        $set: {
          password: hashedNewPassword,
          updatedAt: now,
        },
      }
    );

    // Update passwordLastChanged in usersecurities collection
    await userSecurities.updateOne(
      { userId: sessionUser._id.toString() },
      {
        $set: {
          passwordLastChanged: now,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
