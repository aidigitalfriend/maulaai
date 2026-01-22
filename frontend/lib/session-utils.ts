import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Get the session ID from cookies.
 * Checks both 'session_id' (frontend auth) and 'sessionId' (backend auth) for compatibility.
 */
export function getSessionId(request: NextRequest): string | undefined {
  // Check snake_case first (frontend auth routes)
  const sessionIdSnake = request.cookies.get('session_id')?.value;
  if (sessionIdSnake) return sessionIdSnake;
  
  // Fall back to camelCase (backend auth routes)
  const sessionIdCamel = request.cookies.get('sessionId')?.value;
  return sessionIdCamel;
}

/**
 * Get the session ID from cookie store (for server actions/RSC).
 * Checks both 'session_id' (frontend auth) and 'sessionId' (backend auth) for compatibility.
 */
export async function getSessionIdFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  
  // Check snake_case first (frontend auth routes)
  const sessionIdSnake = cookieStore.get('session_id')?.value;
  if (sessionIdSnake) return sessionIdSnake;
  
  // Fall back to camelCase (backend auth routes)
  const sessionIdCamel = cookieStore.get('sessionId')?.value;
  return sessionIdCamel;
}
