import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const backendBase = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3005';
    const body = await request.json();

    const response = await fetch(`${backendBase}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();

    // Create response with the same status
    const nextResponse = NextResponse.json(data, { status: response.status });

    // If login successful, set cookies directly from NextResponse for reliability
    if (response.ok && data.success) {
      // Forward all Set-Cookie headers from backend
      const setCookies = response.headers.getSetCookie?.() || [];
      
      // Extract sessionId from backend cookies and set both variants
      let sessionId: string | null = null;
      for (const cookie of setCookies) {
        const match = cookie.match(/sessionId=([^;]+)/);
        if (match) {
          sessionId = match[1];
          break;
        }
      }
      
      if (sessionId) {
        // Set both cookie names for maximum compatibility
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/',
        };
        
        nextResponse.cookies.set('session_id', sessionId, cookieOptions);
        nextResponse.cookies.set('sessionId', sessionId, cookieOptions);
      }
    }

    return nextResponse;
  } catch (error) {
    console.error('Error proxying /api/auth-backend/login:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed - server error' },
      { status: 500 }
    );
  }
}
