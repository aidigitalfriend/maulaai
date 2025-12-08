import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { checkEnvironmentVariables } from '@/lib/environment-checker';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'fallback-secret-key-change-in-production';

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 *
 * Body:
 * {
 *   email: string
 *   name: string
 *   password: string
 *   authMethod: 'password'
 * }
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

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash the password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      password: hashedPassword, // Use pre-hashed password
      authMethod: authMethod || 'password',
      emailVerified: new Date(), // Auto-verify for password signup
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id.toString() }, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Create response without token in JSON (security improvement)
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        success: true,
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          authMethod: newUser.authMethod,
          createdAt: newUser.createdAt,
          lastLoginAt: newUser.lastLoginAt,
        },
      },
      { status: 201 }
    );

    // Set secure HttpOnly cookie (not accessible to JavaScript)
    response.cookies.set('auth_token', token, {
      httpOnly: true, // Prevents XSS attacks
      secure: true, // HTTPS only
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
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
