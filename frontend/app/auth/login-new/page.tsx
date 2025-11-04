'use client'
export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'passwordless' | 'password' | null>(null)

  // Passwordless login (magic link)
  const handlePasswordlessLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push('/auth/verify-email?email=' + encodeURIComponent(email))
      }
    } catch (err) {
      setError('Failed to send magic link. Please try again.')
      console.error('Passwordless login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Password-based login
  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (err) {
      setError('Login failed. Please try again.')
      console.error('Password login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-100">Sign in to your One Last AI account</p>
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
                  Choose how you'd like to sign in:
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
                        Receive a secure link via email
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
                      <p className="text-sm text-gray-600">Use your email and password</p>
                    </div>
                  </div>
                </button>

                {/* Don't have account */}
                <div className="pt-4 text-center border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                      Create one now
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Passwordless login form */}
            {authMode === 'passwordless' && (
              <form onSubmit={handlePasswordlessLogin} className="space-y-4">
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
                    autoComplete="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  {isLoading ? 'Sending link...' : 'Send Magic Link'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  We'll send you a secure login link (expires in 24 hours)
                </p>
              </form>
            )}

            {/* Password login form */}
            {authMode === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                    autoComplete="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          {authMode === null && (
            <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-600">
              <p>
                Prefer magic links?{' '}
                <button
                  onClick={() => setAuthMode('passwordless')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try it
                </button>
                <span className="text-gray-400 mx-2">•</span>
                It's more secure and frictionless
              </p>
            </div>
          )}
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
