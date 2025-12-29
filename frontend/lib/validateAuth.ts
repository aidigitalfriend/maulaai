import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify request using HttpOnly session_id cookie.
 * This checks if the session cookie exists - actual validation happens on backend.
 */
export function verifyRequest(request: NextRequest) {
  // Check for session_id cookie (HttpOnly session-based auth)
  const sessionId = request.cookies.get('session_id')?.value;
  
  if (!sessionId) {
    return { ok: false, error: 'No session found' };
  }

  // Session exists - backend will validate it when we proxy the request
  return { ok: true, sessionId };
}

/**
 * Async version that actually verifies the session with the backend.
 * Use this when you need to get user data from the session.
 */
export async function verifyRequestAsync(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  
  if (!sessionId) {
    return { ok: false, error: 'No session found' };
  }

  try {
    const backendBase = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3005';
    const response = await fetch(`${backendBase}/api/auth/verify`, {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { ok: false, error: 'Invalid or expired session' };
    }

    const data = await response.json();
    if (!data.valid) {
      return { ok: false, error: data.message || 'Session not valid' };
    }

    return { ok: true, user: data.user, sessionId };
  } catch (err: any) {
    return { ok: false, error: 'Session verification failed' };
  }
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}
