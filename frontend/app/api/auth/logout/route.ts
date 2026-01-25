import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout endpoint called');

    // Also call backend logout to clear database session
    const backendBase = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3005';
    try {
      await fetch(`${backendBase}/api/auth/logout`, {
        method: 'POST',
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });
      console.log('✅ Backend session cleared');
    } catch (backendError) {
      console.warn('⚠️ Backend logout failed:', backendError);
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear BOTH cookie names (snake_case and camelCase) for compatibility
    // Some parts of the system use session_id, others use sessionId
    response.cookies.set('session_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('sessionId', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    console.log('✅ Auth cookies cleared (session_id & sessionId)');
    return response;
  } catch (error) {
    console.error('❌ Logout error:', error);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}
