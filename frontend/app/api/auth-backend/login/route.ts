import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const backendBase = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3005';
    const body = await request.json();

    console.log('[auth-backend/login] Proxying to backend:', backendBase);

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
    console.log('[auth-backend/login] Backend response status:', response.status, 'success:', data.success);

    // Create response with the same status
    const nextResponse = NextResponse.json(data, { status: response.status });

    // If login was successful, set the session cookie properly
    // The backend returns the session in the response, but we need to set
    // the cookie from the frontend domain for it to work correctly
    if (response.ok && data.success) {
      // Parse the Set-Cookie header to get the session ID
      const setCookieHeader = response.headers.get('set-cookie');
      console.log('[auth-backend/login] Set-Cookie header:', setCookieHeader);
      
      if (setCookieHeader) {
        // Extract sessionId value from the cookie header
        // The backend may return multiple sessionId cookies - we need the LAST one (64-char hex)
        // which is the real session saved in the database by the login handler
        const allMatches = [...setCookieHeader.matchAll(/sessionId=([^;,\s]+)/g)];
        // Get the last match, which is the actual session from the login handler
        const sessionMatch = allMatches.length > 0 ? allMatches[allMatches.length - 1] : null;
        if (sessionMatch) {
          const sessionId = sessionMatch[1];
          console.log('[auth-backend/login] Found', allMatches.length, 'sessionId cookies');
          console.log('[auth-backend/login] Using last sessionId:', sessionId.substring(0, 10) + '... (length:', sessionId.length + ')');
          
          // In production with Cloudflare, always use Secure cookies
          // Cloudflare terminates SSL and forwards to Nginx, which proxies to Next.js
          const isProduction = process.env.NODE_ENV === 'production' ||
                              request.headers.get('x-forwarded-proto') === 'https' || 
                              request.url.startsWith('https://') ||
                              request.headers.get('host')?.includes('maula.ai');
          
          console.log('[auth-backend/login] Setting cookie with secure:', isProduction, 'host:', request.headers.get('host'));
          
          // Set both cookie names for compatibility
          nextResponse.cookies.set('sessionId', sessionId, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: '/',
          });
          nextResponse.cookies.set('session_id', sessionId, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: '/',
          });
        } else {
          console.log('[auth-backend/login] Could not parse sessionId from Set-Cookie');
        }
      } else {
        console.log('[auth-backend/login] No Set-Cookie header from backend');
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
