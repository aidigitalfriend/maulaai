'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password-based signup (traditional)
  const handlePasswordSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          password,
          authMethod: 'password',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to create account')
        return
      }

      // Sign them in
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      })

      if (signInResult?.error) {
        setError('Account created but login failed. Please try logging in.')
      } else if (signInResult?.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Failed to create account. Please try again.')
      console.error('Password signup error:', err)
    } finally {
      setIsLoading(false)
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
            Join One Last AI
          </h1>
          <p className="text-neural-600 text-lg">
            Create your account to get started
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6">
          <form onSubmit={handlePasswordSignup} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-neural-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-neural-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
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
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
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
              <p className="text-xs text-neural-500 mt-1">Minimum 8 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-neural-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 pr-12 border border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-neural-400 hover:text-neural-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:from-brand-700 hover:to-accent-600 transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Creating account...
                </span>
              ) : (
                '🚀 Create Account'
              )}
            </button>

            <p className="text-xs text-neural-500 text-center mt-4">
              By signing up, you agree to our{' '}
              <Link href="/legal/terms-of-service" className="text-brand-600 hover:text-brand-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy-policy" className="text-brand-600 hover:text-brand-700">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-neural-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Login
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
