import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
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

    // Generate secret and QR code for 2FA setup
    const secret = authenticator.generateSecret();
    const appName = 'OneLastAI';
    const accountName = sessionUser.email;

    const otpauth = authenticator.keyuri(accountName, appName, secret);
    const qrCodeDataURL = await QRCode.toDataURL(otpauth);

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(Math.random().toString(36).substr(2, 8));
    }

    // Store the secret temporarily (not enabled yet until verified)
    await User.findByIdAndUpdate(sessionUser._id, {
      tempTwoFactorSecret: secret,
      tempBackupCodes: backupCodes,
    });

    return NextResponse.json({
      qrCode: qrCodeDataURL,
      secret: secret,
      backupCodes: backupCodes,
      manualEntryKey: secret,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
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
