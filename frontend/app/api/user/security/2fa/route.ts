import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

const DB_NAME = process.env.MONGODB_DB || 'maulaai';

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

    // Generate secret and QR code for 2FA setup
    const secret = authenticator.generateSecret();
    const appName = 'Maula AI';
    const accountName = sessionUser.email;

    const otpauth = authenticator.keyuri(accountName, appName, secret);
    const qrCodeDataURL = await QRCode.toDataURL(otpauth);

    // Generate backup codes
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
    }

    const now = new Date();

    // Store the secret temporarily (not enabled yet until verified)
    await userSecurities.updateOne(
      { userId: sessionUser._id.toString() },
      {
        $set: {
          tempTwoFactorSecret: secret,
          tempBackupCodes: backupCodes,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
      secret: secret,
      backupCodes: backupCodes,
      manualEntryKey: secret,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify and enable 2FA
export async function PUT(request: NextRequest) {
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
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Verify the code using the temporary secret
    const isValid = authenticator.verify({
      token: code,
      secret: sessionUser.tempTwoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Enable 2FA permanently
    await User.findByIdAndUpdate(sessionUser._id, {
      twoFactorEnabled: true,
      twoFactorSecret: sessionUser.tempTwoFactorSecret,
      backupCodes: sessionUser.tempBackupCodes,
      tempTwoFactorSecret: undefined,
      tempBackupCodes: undefined,
    });

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Disable 2FA
export async function DELETE(request: NextRequest) {
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
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    // Verify password before disabling 2FA
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(
      password,
      sessionUser.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 400 }
      );
    }

    // Disable 2FA
    await User.findByIdAndUpdate(sessionUser._id, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      backupCodes: undefined,
    });

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
