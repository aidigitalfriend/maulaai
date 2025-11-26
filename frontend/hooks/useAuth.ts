'use client'

import { useState, useEffect } from 'react'

interface User {
  _id: string
  email: string
  name?: string
  image?: string
  role: string
  authMethod: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // For development, return a mock user with MongoDB ObjectId format
      // In production, this would check JWT token or session
      const mockUser: User = {
        _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId for testing
        email: 'test@onelastai.co',
        name: 'Test User',
        image: undefined,
        role: 'user',
        authMethod: 'password',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }

      setAuthState({
        user: mockUser,
        loading: false,
        error: null,
      })
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Authentication failed',
      })
    }
  }

  const login = async (email: string, password: string) => {
    // Implementation for login
  }

  const logout = async () => {
    setAuthState({
      user: null,
      loading: false,
      error: null,
    })
  }

  return {
    ...authState,
    user: authState.user ? { ...authState.user, id: authState.user._id } : null, // Add id field for compatibility
    login,
    logout,
    refetch: checkAuth,
  }
}