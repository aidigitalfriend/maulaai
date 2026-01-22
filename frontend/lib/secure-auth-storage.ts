/**
 * Secure Auth Storage Utility for HttpOnly Session Cookies
 *
 * IMPORTANT: With HttpOnly cookies, localStorage is used ONLY for UI display data
 * - Session ID: Stored in HttpOnly cookie (not accessible to JavaScript)
 * - User Identity: Always verified via server session validation
 * - localStorage: Contains user profile data for UI rendering only
 *
 * This prevents localStorage user ID from overriding server session user ID
 */

const USER_KEY = 'auth_user';

export const secureAuthStorage = {
  /**
   * Store user data in localStorage (safe - no sensitive tokens)
   */
  setUser: (user: any) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('✅ User data saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving user data:', error);
    }
  },

  /**
   * Get user data from localStorage
   */
  getUser: () => {
    if (typeof window === 'undefined') return null;

    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  },

  /**
   * Verify session via server call (HttpOnly cookie sent automatically)
   */
  verifySession: async (): Promise<{ valid: boolean; user?: any }> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        credentials: 'include', // Sends HttpOnly cookies automatically
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        return { valid: data.valid, user: data.user };
      }

      return { valid: false };
    } catch (error) {
      console.error('❌ Session verification failed:', error);
      return { valid: false };
    }
  },

  /**
   * Clear user data from localStorage (token cleared via logout endpoint)
   */
  clearUser: () => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(USER_KEY);
      console.log('✅ User data cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
    }
  },

  /**
   * Logout and clear HttpOnly cookie via server
   */
  logout: async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Sends HttpOnly cookies automatically
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear local user data regardless of server response
      secureAuthStorage.clearUser();

      if (response.ok) {
        console.log('✅ Logged out successfully');
        return true;
      } else {
        console.warn('⚠️ Server logout failed, but local data cleared');
        return false;
      }
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Still clear local data
      secureAuthStorage.clearUser();
      return false;
    }
  },
};

export default secureAuthStorage;
