import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout endpoint called');

    // Create response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear the HttpOnly session cookie - must match how it was set
    response.cookies.set('session_id', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax', // Must match login cookie settings
      maxAge: 0, // Immediately expire the cookie
      path: '/',
    });

    console.log('✅ Auth cookie cleared');
    return response;
  } catch (error) {
    console.error('❌ Logout error:', error);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}
