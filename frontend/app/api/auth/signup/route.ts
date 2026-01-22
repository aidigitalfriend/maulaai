import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { checkEnvironmentVariables } from '@/lib/environment-checker';
import { notifyAdminNewUser, sendWelcomeEmail } from '@/lib/services/emailNotifications';

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 * Using PostgreSQL via Prisma
 */
export async function POST(request: NextRequest) {
  try {
    // Check environment first
    const envStatus = checkEnvironmentVariables();
    if (!envStatus.isValid) {
      console.error(
        '❌ Auth signup failed - missing environment variables:',
        envStatus.missing
      );
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 503 }
      );
    }

    const { email, name, password, authMethod } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate secure session ID
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create new user with session
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        password: hashedPassword,
        authMethod: authMethod === 'passwordless' ? 'passwordless' : 'password',
        emailVerified: new Date(),
        sessionId,
        sessionExpiry,
      }
    });

    // Send admin notification email (async, don't block response)
    notifyAdminNewUser({
      email: newUser.email,
      name: newUser.name || '',
    }).catch((err) => console.error('Failed to send admin notification:', err));

    // Send welcome email to user (async, don't block response)
    sendWelcomeEmail({
      email: newUser.email,
      name: newUser.name || '',
    }).catch((err) => console.error('Failed to send welcome email:', err));

    // Create response
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          authMethod: newUser.authMethod,
          createdAt: newUser.createdAt,
          lastLoginAt: newUser.lastLoginAt,
        },
      },
      { status: 201 }
    );

    // Set secure HttpOnly session cookie
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Failed to create account' },
      { status: 500 }
    );
  }
}
