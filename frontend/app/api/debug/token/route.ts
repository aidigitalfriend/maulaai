import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Get token from HttpOnly cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token' },
        { status: 401 }
      );
    }

    // Verify and decode JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json(
        {
          message: 'Invalid token',
          error: jwtError instanceof Error ? jwtError.message : 'Unknown error',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Token decoded successfully',
      decoded: decoded,
      tokenUserId: decoded.userId,
      tokenInfo: {
        issued: new Date(decoded.iat * 1000),
        expires: new Date(decoded.exp * 1000),
      },
    });
  } catch (error) {
    console.error('Debug token error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
