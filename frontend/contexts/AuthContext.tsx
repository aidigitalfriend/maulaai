'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import authStorage from '@/lib/auth-storage';

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

      const storedToken = authStorage.getToken();
      const storedUser = authStorage.getUser();

      if (storedToken && storedUser && !authStorage.isTokenExpired()) {
        // Try to verify with server, but don't logout on network errors
        try {
          const response = await fetch(`/api/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${storedToken}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.valid) {
              console.log('✅ Session verified with server');
              dispatch({ type: 'AUTH_SUCCESS', payload: storedUser });
              authStorage.refreshExpiry();
              return;
            } else {
              // Server says token is invalid, logout
              console.log('⚠️ Server rejected token');
              authStorage.clearAll();
              dispatch({ type: 'AUTH_LOGOUT' });
              return;
            }
          } else if (response.status === 401) {
            // Unauthorized - token is invalid
            console.log('⚠️ Token unauthorized');
            authStorage.clearAll();
            dispatch({ type: 'AUTH_LOGOUT' });
            return;
          }
        } catch (verifyError) {
          // Network error or server down - trust local token if not expired
          console.log('⚠️ Could not verify with server, using local token');
        }

        // If we reach here, either verification failed with network error
        // or server is down, but token exists and isn't expired locally
        // Trust the local token
        console.log('✅ Session restored from local storage (offline)');
        dispatch({ type: 'AUTH_SUCCESS', payload: storedUser });
        return;
      }

      // No valid token found
      authStorage.clearAll();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Session check error:', error);
      // Don't logout on errors - just use whatever state we have
      const storedToken = authStorage.getToken();
      const storedUser = authStorage.getUser();
      if (storedToken && storedUser) {
        dispatch({ type: 'AUTH_SUCCESS', payload: storedUser });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      if (data.token) {
        authStorage.setToken(data.token, 7);
      }

      if (data.user) {
        authStorage.setUser(data.user);
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
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

      if (data.token) {
        authStorage.setToken(data.token, 7);
      }

      if (data.user) {
        authStorage.setUser(data.user);
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
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
      const token = authStorage.getToken();
      if (token) {
        await fetch(`/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authStorage.clearAll();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const getAuthToken = (): string | null => {
    return authStorage.getToken();
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
