/**
 * Session-based authentication utility functions
 * Replaces localStorage-based auth with secure session management
 */

/**
 * Check if user is authenticated via session API
 */
export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch('/api/session/profile', {
      method: 'GET',
      credentials: 'include' // Include session cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.success && !!data.data?.user;
    }
    return false;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

/**
 * Get current user data from session API
 */
export async function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const response = await fetch('/api/session/profile', {
      method: 'GET',
      credentials: 'include' // Include session cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.data?.user : null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

/**
 * Get auth token - deprecated in favor of session cookies
 * @deprecated Use session-based authentication instead
 */
export function getAuthToken(): string | null {
  console.warn('getAuthToken() is deprecated. Use session-based authentication instead.');
  return null;
}

/**
 * Legacy localStorage token getter for backward compatibility
 * @deprecated Migrate to session-based auth
 */
export function getLegacyAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Build login redirect URL with return path
 * @param returnTo - The URL to return to after login
 */
export function buildLoginUrl(returnTo?: string): string {
  const loginUrl = '/auth/login';
  
  if (!returnTo) return loginUrl;
  
  const encodedReturnTo = encodeURIComponent(returnTo);
  return `${loginUrl}?returnTo=${encodedReturnTo}`;
}

/**
 * Get return URL from query params
 */
export function getReturnUrl(): string {
  if (typeof window === 'undefined') return '/dashboard';
  
  const params = new URLSearchParams(window.location.search);
  return params.get('returnTo') || '/dashboard';
}

/**
 * Redirect to login page with current URL as return path
 */
export function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  
  const currentUrl = window.location.pathname + window.location.search;
  const loginUrl = buildLoginUrl(currentUrl);
  window.location.href = loginUrl;
}

/**
 * Redirect to a URL (helper function)
 */
export function redirect(url: string): void {
  if (typeof window === 'undefined') return;
  window.location.href = url;
}

/**
 * Session logout function
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/session/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear any legacy localStorage items
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
    }
    
    // Redirect to home
    window.location.href = '/';
  }
}

/**
 * Validate authentication and redirect if not authenticated
 */
export async function requireAuth(): Promise<boolean> {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirectToLogin();
    return false;
  }
  
  return true;
}

/**
 * Get user ID from session (backward compatibility helper)
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Get user email from session (backward compatibility helper)
 */
export async function getUserEmail(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.email || null;
}