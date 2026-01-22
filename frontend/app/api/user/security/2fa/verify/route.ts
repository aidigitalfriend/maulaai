import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';
import { authenticator } from 'otplib';

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

    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid 6-digit verification code is required',
        },
        { status: 400 }
      );
    }

    // Get temp secret from usersecurities
    const userSecurity = await userSecurities.findOne({
      userId: sessionUser._id.toString(),
    });

    if (!userSecurity?.tempTwoFactorSecret) {
      return NextResponse.json(
        {
          success: false,
          message: 'No pending 2FA setup found. Please start setup again.',
        },
        { status: 400 }
      );
    }

    // Verify the code using the temporary secret
    const isValid = authenticator.verify({
      token: code,
      secret: userSecurity.tempTwoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid verification code. Please try again.',
        },
        { status: 400 }
      );
    }

    const now = new Date();

    // Enable 2FA permanently - update usersecurities
    await userSecurities.updateOne(
      { userId: sessionUser._id.toString() },
      {
        $set: {
          twoFactorEnabled: true,
          twoFactorSecret: userSecurity.tempTwoFactorSecret,
          backupCodes: userSecurity.tempBackupCodes || [],
          updatedAt: now,
        },
        $unset: {
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
          twoFactorEnabled: true,
          updatedAt: now,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: userSecurity.tempBackupCodes || [],
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
