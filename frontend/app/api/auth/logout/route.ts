import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout endpoint called');

    // Get the session ID from cookies
    const sessionId = request.cookies.get('session_id')?.value || 
                      request.cookies.get('sessionId')?.value;

    // Clear session from database if we have one
    if (sessionId) {
      try {
        await prisma.user.updateMany({
          where: { sessionId },
          data: {
            sessionId: null,
            sessionExpiry: null,
          },
        });
        console.log('✅ Session cleared from database');
      } catch (dbError) {
        console.error('⚠️ Failed to clear session from DB:', dbError);
      }
    }

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear the session_id HttpOnly cookie
    response.cookies.set('session_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    // Also clear sessionId cookie (backend uses this name)
    response.cookies.set('sessionId', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    // Clear visitorId cookie too
    response.cookies.set('visitorId', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    console.log('✅ All auth cookies cleared');
    return response;
  } catch (error) {
    console.error('❌ Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' }, 
      { status: 500 }
    );
  }
}
