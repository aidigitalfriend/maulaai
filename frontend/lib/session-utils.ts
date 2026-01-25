import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Get all session IDs from cookies (both snake_case and camelCase).
 * Returns an array of session IDs to try, in order of preference.
 */
export function getAllSessionIds(request: NextRequest): string[] {
  const sessionIds: string[] = [];
  
  // Check snake_case first (frontend auth routes)
  const sessionIdSnake = request.cookies.get('session_id')?.value;
  if (sessionIdSnake) sessionIds.push(sessionIdSnake);
  
  // Also check camelCase (backend auth routes)
  const sessionIdCamel = request.cookies.get('sessionId')?.value;
  if (sessionIdCamel && sessionIdCamel !== sessionIdSnake) {
    sessionIds.push(sessionIdCamel);
  }
  
  return sessionIds;
}

/**
 * Get the session ID from cookies.
 * Checks both 'session_id' (frontend auth) and 'sessionId' (backend auth) for compatibility.
 * Returns the first valid session ID found.
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
