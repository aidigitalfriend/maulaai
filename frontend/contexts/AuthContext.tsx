'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  joinedAt: string
  lastLoginAt?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  getAuthToken: () => string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      // Check session with backend (uses HTTP-only cookies)
      const response = await fetch('/api/session/profile', {
        method: 'GET',
        credentials: 'include' // Include cookies
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: data.data.user })
        } else {
          dispatch({ type: 'AUTH_LOGOUT' })
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' })
      }
    } catch (error) {
      console.error('Session check error:', error)
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' })

      const response = await fetch('/api/session/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed')
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: data.data.user })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' })

      const response = await fetch('/api/session/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed')
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: data.data.user })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/session/logout', {
        method: 'POST',
        credentials: 'include' // Include cookies
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const getAuthToken = (): string | null => {
    // For backward compatibility with components that still expect tokens
    // In session-based auth, we rely on HTTP-only cookies instead
    // Return null to encourage migration to session-based auth
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        getAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext