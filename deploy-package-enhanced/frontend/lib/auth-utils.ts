/**
 * Authentication utility functions
 * Handles auth checks and redirects
 */

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  
  return !!(token && user);
}

/**
 * Get current user data
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
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
  
  // Encode the return URL
  const redirectParam = encodeURIComponent(returnTo);
  return `${loginUrl}?redirect=${redirectParam}`;
}

/**
 * Build signup redirect URL with return path
 * @param returnTo - The URL to return to after signup
 */
export function buildSignupUrl(returnTo?: string): string {
  const signupUrl = '/auth/signup';
  
  if (!returnTo) return signupUrl;
  
  const redirectParam = encodeURIComponent(returnTo);
  return `${signupUrl}?redirect=${redirectParam}`;
}

/**
 * Require authentication - redirect to login if not authenticated
 * @param currentPath - Current page path to return to after login
 * @returns boolean - true if authenticated, false if redirected
 */
export function requireAuth(currentPath?: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    // Get the current full path including query params
    const returnPath = currentPath || window.location.pathname + window.location.search;
    const loginUrl = buildLoginUrl(returnPath);
    
    // Redirect to login
    window.location.href = loginUrl;
    return false;
  }
  
  return true;
}

/**
 * Store intended destination before redirecting to login
 * Useful for preserving agent/plan selection
 */
export function setIntendedDestination(path: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('intended_destination', path);
}

/**
 * Get and clear intended destination
 */
export function getIntendedDestination(): string | null {
  if (typeof window === 'undefined') return null;
  
  const destination = sessionStorage.getItem('intended_destination');
  if (destination) {
    sessionStorage.removeItem('intended_destination');
  }
  return destination;
}

/**
 * Logout user
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  
  // Redirect to home
  window.location.href = '/';
}
