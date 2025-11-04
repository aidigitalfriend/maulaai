'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function SetNewPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token')
      setTokenValid(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          setTokenValid(true)
        } else {
          setError('Reset link has expired or is invalid')
          setTokenValid(false)
        }
      } catch (err) {
        setError('Failed to verify reset link')
        setTokenValid(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to reset password')
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Failed to reset password. Please try again.')
      console.error('Reset password error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Token validation in progress
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Verifying reset link...</p>
          </div>
        </div>
      </div>
    )
  }

  // Token invalid
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-8">
              <h1 className="text-3xl font-bold text-white mb-2">❌ Invalid Link</h1>
              <p className="text-red-100">This password reset link has expired</p>
            </div>

            <div className="p-6 text-center">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Password reset links expire after 1 hour for security.
                </p>
              </div>

              <Link
                href="/auth/forgot-password"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition mb-4"
              >
                Request New Link
              </Link>

              <p className="text-gray-600 text-sm">
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8">
              <h1 className="text-3xl font-bold text-white mb-2">✅ Password Updated</h1>
              <p className="text-green-100">Your password has been reset successfully</p>
            </div>

            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🔐</div>
                <p className="text-gray-700">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
              </div>

              <Link
                href="/auth/login"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
            <p className="text-blue-100">Choose a strong password</p>
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="At least 8 characters"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use at least 8 characters, including letters, numbers, and symbols
                </p>
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
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Password requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">💡 Password Tips:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Use at least 8 characters</li>
                  <li>✓ Mix letters, numbers, and symbols</li>
                  <li>✓ Avoid dictionary words</li>
                  <li>✓ Don't reuse old passwords</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading || password.length < 8 || password !== confirmPassword}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
              >
                {isLoading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Back link */}
            <div className="text-center">
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SetNewPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetNewPasswordPageContent />
    </Suspense>
  )
}
