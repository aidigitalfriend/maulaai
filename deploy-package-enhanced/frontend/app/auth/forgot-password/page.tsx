'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to send reset email')
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
      console.error('Forgot password error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8">
              <div className="flex justify-center mb-4">
                <Link href="/">
                  <Image
                    src="/images/logos/company-logo.png"
                    alt="One Last AI"
                    width={60}
                    height={60}
                    className="w-15 h-15 object-contain filter brightness-0 invert"
                    priority
                  />
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 text-center">✅ Check Your Email</h1>
              <p className="text-green-100 text-center">We've sent you a password reset link</p>
            </div>

            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">📧</div>
                <p className="text-gray-700 mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="font-semibold text-gray-900 mb-6">{email}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> The link will expire in 1 hour for security.
                  If you don't receive it, check your spam folder.
                </p>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Didn't receive the email?{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try again
                </button>
              </p>

              <Link
                href="/auth/login"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
                  className="w-15 h-15 object-contain filter brightness-0 invert"
                  priority
                />
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Reset Password</h1>
            <p className="text-blue-100 text-center">Enter your email to receive a reset link</p>
          </div>

          <div className="p-6">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If an account exists with this email, you'll receive a password reset link. 
                  Check your spam folder if you don't see it.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
              >
                {isLoading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Back links */}
            <div className="space-y-3 text-center">
              <p className="text-gray-600 text-sm">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
