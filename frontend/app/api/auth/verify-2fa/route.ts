import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { authenticator } from 'otplib';

/**
 * POST /api/auth/verify-2fa
 * Verify 2FA code during login
 */
export async function POST(request: NextRequest) {
  try {
    const { tempToken, userId, code } = await request.json();

    // Validate input
    if (!tempToken || !userId || !code) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate code format
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { message: 'Invalid code format. Please enter a 6-digit code.' },
        { status: 400 }
      );
    }

    // Find user with matching temp token
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        resetPasswordToken: tempToken,
        resetPasswordExpires: { gt: new Date() },
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired verification session. Please login again.' },
        { status: 401 }
      );
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { message: '2FA not properly configured' },
        { status: 400 }
      );
    }

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    // Also check backup codes if TOTP fails
    let usedBackupCode = false;
    if (!isValid && user.backupCodes && user.backupCodes.length > 0) {
      const backupCodeIndex = user.backupCodes.indexOf(code.toUpperCase());
      if (backupCodeIndex !== -1) {
        // Remove used backup code
        const updatedBackupCodes = [...user.backupCodes];
        updatedBackupCodes.splice(backupCodeIndex, 1);
        await prisma.user.update({
          where: { id: user.id },
          data: { backupCodes: updatedBackupCodes },
        });
        usedBackupCode = true;
      }
    }

    if (!isValid && !usedBackupCode) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // 2FA verified - create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Clear temp token and update session
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        sessionId,
        sessionExpiry,
        lastLoginAt: new Date(),
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Record login in history if table exists
    try {
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                        request.headers.get('x-real-ip') ||
                        'Unknown';
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      
      await (prisma as any).loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          status: 'success',
          device: 'web',
        },
      });
    } catch (e) {
      // Table may not exist
    }

    // Create response
    const response = NextResponse.json(
      {
        message: usedBackupCode 
          ? 'Login successful (backup code used)' 
          : 'Login successful',
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          authMethod: updatedUser.authMethod,
          createdAt: updatedUser.createdAt,
          lastLoginAt: updatedUser.lastLoginAt,
        },
      },
      { status: 200 }
    );

    // Set secure HttpOnly session cookies
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
