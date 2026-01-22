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

    const { password } = await request.json();

    // Verify password before disabling 2FA
    if (password) {
      const isValidPassword = await bcrypt.compare(
        password,
        sessionUser.password
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: 'Invalid password' },
          { status: 400 }
        );
      }
    }

    const now = new Date();

    // Disable 2FA in usersecurities
    await userSecurities.updateOne(
      { userId: sessionUser._id.toString() },
      {
        $set: {
          twoFactorEnabled: false,
          updatedAt: now,
        },
        $unset: {
          twoFactorSecret: '',
          backupCodes: '',
          tempTwoFactorSecret: '',
          tempBackupCodes: '',
        },
      }
    );

    // Also update the users collection
    await users.updateOne(
      { _id: sessionUser._id },
      {
        $set: {
          twoFactorEnabled: false,
          updatedAt: now,
        },
        $unset: {
          twoFactorSecret: '',
          backupCodes: '',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
