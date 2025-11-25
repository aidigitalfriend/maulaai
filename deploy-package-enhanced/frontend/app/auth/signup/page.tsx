'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Suspense } from 'react'

function SignupPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      // Get redirect destination or default to dashboard
      const redirectTo = searchParams.get('redirect') || '/dashboard'

      // Sign them in
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: redirectTo,
      })

      if (signInResult?.error) {
        setError('Account created but login failed. Please try logging in.')
      } else if (signInResult?.ok) {
        router.push(redirectTo)
      }
    } catch (err) {
      setError('Failed to create account. Please try again.')
      console.error('Password signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex justify-center mb-4">
              <Link href="/">
                <Image
                  src="/images/logos/company-logo.png"
                  alt="One Last AI"
                  width={60}
                  height={60}
                  className="w-15 h-15 object-contain"
                  priority
                />
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Join One Last AI</h1>
            <p className="text-blue-100 text-center">Create your account in seconds</p>
          </div>

          <div className="p-6">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Password signup form */}
            <form onSubmit={handlePasswordSignup} className="space-y-4">
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="At least 8 characters"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>

              {/* Already have account */}
              <div className="pt-4 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <Link 
                    href={`/auth/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login
                  </Link>
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  )
}