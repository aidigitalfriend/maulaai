import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Auth verify endpoint called');
    
    // Get token from HttpOnly cookie instead of Authorization header
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      console.log('❌ No authentication token in cookie');
      return NextResponse.json(
        { message: 'No authentication token' },
        { status: 401 }
      );
    }

    console.log('🎫 Token received from cookie, verifying...');
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log('✅ Token verified for user:', decoded.userId);
    } catch (jwtError) {
      console.log('❌ Invalid token:', jwtError);
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    console.log('🔌 Connecting to database...');
    await dbConnect();

    // Find user by ID from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    console.log('✅ User verified:', user.email);

    // Return user data
    return NextResponse.json({
      valid: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        authMethod: user.authMethod,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    return NextResponse.json(
      { valid: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
}

// Add POST method for AuthContext compatibility
export async function POST(request: NextRequest) {
  return GET(request); // Use same logic as GET
}
