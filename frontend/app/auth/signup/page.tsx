'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'passwordless' | 'password' | null>(null)

  // Passwordless signup (magic link)
  const handlePasswordlessSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const name = formData.get('name') as string

    try {
      // Send email with magic link
      const result = await signIn('email', {
        email,
        name,
        redirect: false,
        callbackUrl: '/dashboard',
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        // Redirect to verification page
        router.push('/auth/verify-email?email=' + encodeURIComponent(email))
      }
    } catch (err) {
      setError('Failed to send magic link. Please try again.')
      console.error('Passwordless signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

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

            {/* No mode selected - show options */}
            {authMode === null && (
              <div className="space-y-4">
                <p className="text-gray-700 text-center font-medium mb-6">
                  Choose how you'd like to sign up:
                </p>

                {/* Passwordless option */}
                <button
                  onClick={() => setAuthMode('passwordless')}
                  className="w-full p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition text-left"
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">🔐</div>
                    <div>
                      <p className="font-semibold text-gray-900">Magic Link (Recommended)</p>
                      <p className="text-sm text-gray-600">
                        Sign in with a secure link sent to your email
                      </p>
                    </div>
                  </div>
                </button>

                {/* Password option */}
                <button
                  onClick={() => setAuthMode('password')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">🔑</div>
                    <div>
                      <p className="font-semibold text-gray-900">Email & Password</p>
                      <p className="text-sm text-gray-600">Traditional sign up with a password</p>
                    </div>
                  </div>
                </button>

                {/* Already have account */}
                <div className="pt-4 text-center">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                      Login
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Passwordless signup form */}
            {authMode === 'passwordless' && (
              <form onSubmit={handlePasswordlessSignup} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setAuthMode(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
                >
                  ← Back
                </button>

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
                    Full Name (optional)
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  {isLoading ? 'Sending link...' : 'Send Magic Link'}
                </button>
              </form>
            )}

            {/* Password signup form */}
            {authMode === 'password' && (
              <form onSubmit={handlePasswordSignup} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setAuthMode(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
                >
                  ← Back
                </button>

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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}