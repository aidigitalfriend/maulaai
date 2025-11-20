// Authentication Context and State Management
'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name?: string
  authMethod: 'passwordless' | 'password'
  createdAt: string
  lastLoginAt: string
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
        isLoading: false,
        isAuthenticated: true,
        error: null
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
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

const AuthContext = createContext<{
  state: AuthState
  signupWithPassword: (email: string, password: string, name?: string) => Promise<void>
  signupPasswordless: (email: string, name?: string) => Promise<void>
  loginWithPassword: (email: string, password: string) => Promise<void>
  loginPasswordless: (email: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setNewPassword: (token: string, newPassword: string) => Promise<void>
  clearError: () => void
  verifyPassageMagicLink: (token: string) => Promise<void>
} | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      // Check localStorage for session
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('auth_user')
      
      if (token && user) {
        // Verify token with backend
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const userData = JSON.parse(user)
          dispatch({ type: 'AUTH_SUCCESS', payload: userData })
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' })
        }
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: '' })
      }
    } catch (error) {
      console.error('Session check failed:', error)
      dispatch({ type: 'AUTH_ERROR', payload: '' })
    }
  }

  const signupWithPassword = async (email: string, password: string, name?: string) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          name,
          authMethod: 'password'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Store token and user data
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user })
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: data.error || 'Signup failed' })
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Network error occurred' })
    }
  }

  const signupPasswordless = async (email: string, name?: string) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      // First register the user intent
      const response = await fetch('/api/auth/signup-passwordless', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          name,
          authMethod: 'passwordless'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Integrate with Passage for magic link
        // This would typically use Passage SDK
        await initiatePassageAuth(email, 'signup')
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user })
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: data.error || 'Passwordless signup failed' })
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Network error occurred' })
    }
  }

  const loginWithPassword = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          authMethod: 'password'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user })
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: data.error || 'Login failed' })
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Network error occurred' })
    }
  }

  const loginPasswordless = async (email: string) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      // Initiate passwordless login via Passage
      await initiatePassageAuth(email, 'login')
      
      // The actual authentication will complete when user clicks the magic link
      // For now, we'll show a pending state
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Passwordless login failed' })
    }
  }

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      // Optionally call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      dispatch({ type: 'AUTH_LOGOUT' })
    } catch (error) {
      // Even if logout API fails, clear local state
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }

  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        dispatch({ type: 'AUTH_ERROR', payload: data.error || 'Reset password failed' })
      }
      // Success case handled by UI showing confirmation message
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Network error occurred' })
    }
  }

  const setNewPassword = async (token: string, newPassword: string) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await fetch('/api/auth/set-new-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        dispatch({ type: 'AUTH_ERROR', payload: data.error || 'Password update failed' })
      }
      // Success case handled by UI
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Network error occurred' })
    }
  }

  const verifyPassageMagicLink = async (token: string) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user })
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: data.error || 'Magic link verification failed' })
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Network error occurred' })
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Helper function to integrate with Passage
  const initiatePassageAuth = async (email: string, type: 'login' | 'signup') => {
    // This would integrate with Passage SDK
    // For now, we'll simulate the flow
    console.log(`Initiating Passage ${type} for:`, email)
    
    // In a real implementation, this would:
    // 1. Initialize Passage SDK
    // 2. Send magic link via Passage
    // 3. Handle the callback when user clicks link
  }

  const contextValue = {
    state,
    signupWithPassword,
    signupPasswordless,
    loginWithPassword,
    loginPasswordless,
    logout,
    resetPassword,
    setNewPassword,
    clearError,
    verifyPassageMagicLink
  }

  return (
    <AuthContext.Provider value={contextValue}>
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

export default AuthProvider