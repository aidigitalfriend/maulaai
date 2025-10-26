'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../../lib/auth-context'

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'passwordless' | 'password'>('passwordless')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const { loginWithPassword, loginPasswordless, verifyPassageMagicLink, state } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for magic link token on component mount
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      handleMagicLinkVerification(token)
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/dashboard'
      router.push(redirectTo)
    }
  }, [state.isAuthenticated, router, searchParams])

  const handleMagicLinkVerification = async (token: string) => {
    try {
      await verifyPassageMagicLink(token)
      // Redirect will happen via useEffect when state changes
    } catch (error) {
      console.error('Magic link verification failed:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (authMode === 'passwordless') {
        await loginPasswordless(formData.email)
        setSuccessMessage('🎉 Check your email! We sent you a secure login link from 1Password/Passage.')
      } else {
        await loginWithPassword(formData.email, formData.password)
        // Redirect handled by useEffect
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-neural-600 text-lg">
            Sign in to access your AI agents
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-center font-medium">{successMessage}</p>
            <p className="text-green-700 text-sm text-center mt-2">
              The secure link will expire in 15 minutes for your security.
            </p>
          </div>
        )}

        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-center font-medium">{state.error}</p>
          </div>
        )}

        {/* Loading State for Magic Link Verification */}
        {state.isLoading && searchParams.get('token') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-3"></div>
              <p className="text-blue-800 font-medium">Verifying your secure login link...</p>
            </div>
          </div>
        )}

        {/* Auth Mode Selection */}
        <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neural-800 mb-4">Choose your login method</h2>
            
            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('passwordless')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  authMode === 'passwordless'
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-neural-200 hover:border-neural-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🔐</span>
                  <span className="font-medium text-neural-800">Passwordless</span>
                  {authMode === 'passwordless' && (
                    <span className="ml-auto text-brand-600 text-sm font-medium">Secure</span>
                  )}
                </div>
                <p className="text-sm text-neural-600">
                  Secure magic link login
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('password')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  authMode === 'password'
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-neural-200 hover:border-neural-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🔑</span>
                  <span className="font-medium text-neural-800">Password</span>
                </div>
                <p className="text-sm text-neural-600">
                  Email + password
                </p>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-neural-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Password Field (only for traditional mode) */}
            {authMode === 'password' && (
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neural-400 hover:text-neural-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Link */}
            {authMode === 'password' && (
              <div className="text-right">
                <Link 
                  href="/auth/reset-password" 
                  className="text-sm text-brand-600 hover:text-brand-700"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || state.isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isSubmitting || state.isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:from-brand-700 hover:to-accent-600 transform hover:scale-105'
              }`}
            >
              {isSubmitting || state.isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {authMode === 'passwordless' ? 'Sending secure link...' : 'Signing in...'}
                </span>
              ) : (
                authMode === 'passwordless' ? '🔐 Send Secure Link' : '🔑 Sign In'
              )}
            </button>
          </form>

          {/* Switch Auth Mode */}
          <div className="mt-6 pt-6 border-t border-neural-200">
            {authMode === 'passwordless' ? (
              <div className="text-center">
                <p className="text-sm text-neural-600 mb-3">
                  Prefer the traditional way?
                </p>
                <button
                  type="button"
                  onClick={() => setAuthMode('password')}
                  className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                >
                  Use password instead
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-neural-600 mb-3">
                  Want a more secure way?
                </p>
                <button
                  type="button"
                  onClick={() => setAuthMode('passwordless')}
                  className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                >
                  Try passwordless login
                </button>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-4">
            {authMode === 'passwordless' ? (
              <div className="bg-brand-50 rounded-lg p-4">
                <h3 className="font-medium text-brand-800 mb-2">🛡️ Passwordless Benefits</h3>
                <ul className="text-sm text-brand-700 space-y-1">
                  <li>• No passwords to remember</li>
                  <li>• More secure than traditional login</li>
                  <li>• Powered by 1Password/Passage</li>
                  <li>• One-click secure access</li>
                </ul>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">🔐 Security Reminder</h3>
                <p className="text-sm text-yellow-700">
                  Make sure you're on a trusted device. Consider switching to passwordless for better security!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-neural-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-neural-500 hover:text-neural-600"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}