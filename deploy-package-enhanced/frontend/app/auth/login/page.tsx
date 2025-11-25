'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../../lib/auth-context'

function LoginPageContent() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { loginWithPassword, state } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/dashboard'
      router.push(redirectTo)
    }
  }, [state.isAuthenticated, router, searchParams])

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
      await loginWithPassword(formData.email, formData.password)
      // Redirect handled by useEffect
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header with Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Image
              src="/images/logos/company-logo.png"
              alt="One Last AI"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
              priority
            />
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-neural-600 text-lg">
            Sign in to access your AI agents
          </p>
        </div>

        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-center font-medium">{state.error}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6">
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

            {/* Password Field */}
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/auth/reset-password" 
                className="text-sm text-brand-600 hover:text-brand-700"
              >
                Forgot your password?
              </Link>
            </div>

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
                  Signing in...
                </span>
              ) : (
                '🔑 Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-neural-600">
            Don't have an account?{' '}
            <Link 
              href={`/auth/signup${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}