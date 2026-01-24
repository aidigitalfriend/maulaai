import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { checkEnvironmentVariables } from '@/lib/environment-checker';
import { authenticator } from 'otplib';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * Using PostgreSQL via Prisma
 */
export async function POST(request: NextRequest) {
  try {
    // Check environment first
    const envStatus = checkEnvironmentVariables();
    if (!envStatus.isValid) {
      console.error(
        '❌ Auth login failed - missing environment variables:',
        envStatus.missing
      );
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 503 }
      );
    }

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = user.password
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled - require verification before creating session
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Generate a temporary token for 2FA verification
      const tempToken = crypto.randomBytes(32).toString('hex');
      const tempTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store temp token in user record
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: tempToken, // Reuse this field for temp 2FA token
          resetPasswordExpires: tempTokenExpiry,
        },
      });

      return NextResponse.json({
        requires2FA: true,
        tempToken,
        userId: user.id,
        message: 'Please enter your 2FA code',
      }, { status: 200 });
    }

    // Generate secure session ID
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update user with session and last login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        sessionId,
        sessionExpiry,
        lastLoginAt: new Date(),
      }
    });

    // Create response
    const response = NextResponse.json(
      {
        message: 'Login successful',
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

    // Set secure HttpOnly session cookie (both names for compatibility)
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Also set sessionId (camelCase) for backend compatibility
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
