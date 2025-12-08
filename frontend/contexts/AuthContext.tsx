'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import secureAuthStorage from '@/lib/secure-auth-storage';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  joinedAt?: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Check if we have user data locally
      const storedUser = secureAuthStorage.getUser();

      // Verify session with server (HttpOnly cookie sent automatically)
      const { valid, user } = await secureAuthStorage.verifySession();

      if (valid && user) {
        console.log('✅ Session verified with server via HttpOnly cookie');
        // Update stored user data if server returned updated info
        secureAuthStorage.setUser(user);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        return;
      }

      // If server verification failed but we have local user data,
      // still try to use it (for offline scenarios)
      if (storedUser) {
        console.log('⚠️ Server verification failed, but using local user data');
        dispatch({ type: 'AUTH_SUCCESS', payload: storedUser });
        return;
      }

      // No valid session found
      console.log('❌ No valid session found');
      secureAuthStorage.clearUser();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('❌ Session check error:', error);
      
      // On error, try to use local user data if available
      const storedUser = secureAuthStorage.getUser();
      if (storedUser) {
        console.log('⚠️ Using cached user data due to error');
        dispatch({ type: 'AUTH_SUCCESS', payload: storedUser });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: enables HttpOnly cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      // With HttpOnly cookies, no token is returned in response
      if (data.user) {
        secureAuthStorage.setUser(data.user);
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        console.log('✅ Login successful - HttpOnly cookie authentication');
      }

      // Check if 2FA is required
      if (data.requires2FA && data.tempToken && data.userId) {
        // Store temp token for verification page
        sessionStorage.setItem('tempToken', data.tempToken);
        // Redirect to 2FA verification
        if (typeof window !== 'undefined') {
          window.location.href = `/auth/verify-2fa?token=${data.tempToken}&userId=${data.userId}`;
        }
        return;
      }

      return { success: true, user: data.user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      console.error('❌ Login error:', message);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      // With HttpOnly cookies, no token is returned in response
      if (data.user) {
        secureAuthStorage.setUser(data.user);
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        console.log('✅ Registration successful - HttpOnly cookie authentication');
      }

      return { success: true, user: data.user };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      console.error('❌ Registration error:', message);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || 'Reset password failed');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Reset password failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear HttpOnly cookie on server
      await secureAuthStorage.logout();
      console.log('✅ Logout successful - HttpOnly cookie cleared');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Clear local user data
      secureAuthStorage.clearUser();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const getAuthToken = (): string | null => {
    // With HttpOnly cookies, tokens are not accessible to client-side JavaScript
    // This method is deprecated for security - use server-side verification instead
    console.warn('⚠️ getAuthToken() deprecated - HttpOnly cookies are not accessible to client-side JS');
    return null;
  };

  const contextValue = useMemo(
    () => ({
      state,
      login,
      register,
      resetPassword,
      logout,
      clearError,
      getAuthToken,
    }),
    [state]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

const defaultAuthValue = {
  state: initialState,
  login: async () => {},
  register: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
  clearError: () => {},
  getAuthToken: () => null,
};

export function useAuth() {
  const context = useContext(AuthContext);
  // Always use context if available, fallback to default if null (SSR case)
  // This ensures hook order is consistent between SSR and client hydration
  if (!context || context === null) {
    return defaultAuthValue;
  }
  return context;
}

export default AuthContext;
