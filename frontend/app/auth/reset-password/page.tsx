'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { resetPassword, state } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await resetPassword(email)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Reset password error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Success Message */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-3xl font-bold text-neural-800 mb-4">
              Check Your Email
            </h1>
            <p className="text-neural-600 text-lg leading-relaxed">
              We've sent a password reset link to{' '}
              <span className="font-medium text-brand-600">{email}</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6">
            <h2 className="text-xl font-semibold text-neural-800 mb-4">What's next?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <p className="text-neural-600">
                  Check your email inbox (and spam/junk folder just in case)
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <p className="text-neural-600">
                  Click the secure reset link we sent you
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <p className="text-neural-600">
                  Create a new strong password
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                <p className="text-neural-600">
                  Sign in with your new password
                </p>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">🔒 Security Notice</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• The reset link will expire in 1 hour for security</li>
              <li>• Only the most recent reset link will work</li>
              <li>• If you didn't request this, you can safely ignore the email</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-neural-600 mb-4">
                Didn't receive the email?
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                }}
                className="text-brand-600 hover:text-brand-700 font-medium"
              >
                Try a different email address
              </button>
            </div>

            <div className="text-center pt-4 border-t border-neural-200">
              <Link 
                href="/auth/login"
                className="inline-flex items-center text-neural-500 hover:text-neural-600"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-neural-800 mb-4">
            Reset Your Password
          </h1>
          <p className="text-neural-600 text-lg">
            Enter your email address and we'll send you a secure reset link
          </p>
        </div>

        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-center font-medium">{state.error}</p>
          </div>
        )}

        {/* Reset Form */}
        <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neural-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter the email address for your account"
                className="w-full px-4 py-3 border border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <p className="text-xs text-neural-500 mt-2">
                This should be the email address you used to create your account
              </p>
            </div>

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
                  Sending reset link...
                </span>
              ) : (
                '📧 Send Reset Link'
              )}
            </button>
          </form>
        </div>

        {/* Alternative Options */}
        <div className="bg-brand-50 rounded-lg p-4">
          <h3 className="font-medium text-brand-800 mb-2">💡 Consider Passwordless</h3>
          <p className="text-sm text-brand-700 mb-3">
            Skip the password hassle entirely! Our passwordless login is more secure and convenient.
          </p>
          <Link 
            href="/auth/login"
            className="text-brand-600 hover:text-brand-700 text-sm font-medium"
          >
            Try passwordless login instead →
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between text-sm">
          <Link 
            href="/auth/login"
            className="inline-flex items-center text-neural-500 hover:text-neural-600"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to login
          </Link>
          
          <Link 
            href="/auth/signup"
            className="text-brand-600 hover:text-brand-700"
          >
            Create new account
          </Link>
        </div>
      </div>
    </div>
  )
}