'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../../lib/auth-context'

function SetNewPasswordPageContent() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenError, setTokenError] = useState('')

  const { setNewPassword, state } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setTokenError('Invalid or missing reset token. Please request a new password reset.')
    }
  }, [token])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (formData.password !== formData.confirmPassword) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await setNewPassword(token, formData.password)
      setIsSuccess(true)
    } catch (error) {
      console.error('Set new password error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Password validation
  const isPasswordLongEnough = formData.password.length >= 8
  const hasUpperCase = /[A-Z]/.test(formData.password)
  const hasLowerCase = /[a-z]/.test(formData.password)
  const hasNumber = /\d/.test(formData.password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0

  const isPasswordValid = isPasswordLongEnough && hasUpperCase && hasLowerCase && hasNumber

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <XMarkIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-neural-800 mb-4">
              Invalid Reset Link
            </h1>
            <p className="text-neural-600 text-lg mb-6">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6 text-center">
            <p className="text-neural-600 mb-6">
              Password reset links expire after 1 hour for security reasons.
            </p>
            <Link 
              href="/auth/reset-password"
              className="inline-block w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500 text-white rounded-lg font-medium hover:from-brand-700 hover:to-accent-600 transition-all duration-200"
            >
              Request New Reset Link
            </Link>
          </div>

          <div className="text-center">
            <Link 
              href="/auth/login"
              className="text-brand-600 hover:text-brand-700"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-neural-800 mb-4">
              Password Updated!
            </h1>
            <p className="text-neural-600 text-lg">
              Your password has been updated successfully.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6">
            <div className="text-center">
              <p className="text-neural-600 mb-6">
                You can now sign in with your new password.
              </p>
              <Link 
                href="/auth/login"
                className="inline-block w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-accent-500 text-white rounded-lg font-medium hover:from-brand-700 hover:to-accent-600 transition-all duration-200 transform hover:scale-105"
              >
                🔑 Sign In Now
              </Link>
            </div>
          </div>

          <div className="bg-brand-50 rounded-lg p-4">
            <h3 className="font-medium text-brand-800 mb-2">🛡️ Security Tips</h3>
            <ul className="text-sm text-brand-700 space-y-1">
              <li>• Keep your password secure and don't share it</li>
              <li>• Consider using a password manager</li>
              <li>• Switch to passwordless login for better security</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-100 mb-6">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-neural-800 mb-4">
            Set New Password
          </h1>
          <p className="text-neural-600 text-lg">
            Create a strong new password for your account
          </p>
        </div>

        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-center font-medium">{state.error}</p>
          </div>
        )}

        {/* New Password Form */}
        <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-neural-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    formData.password && !isPasswordValid
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-neural-300 focus:ring-brand-500'
                  }`}
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

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isPasswordLongEnough ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isPasswordLongEnough ? (
                        <CheckIcon className="w-3 h-3 text-green-600" />
                      ) : (
                        <XMarkIcon className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                    <span className={`text-sm ${isPasswordLongEnough ? 'text-green-700' : 'text-red-700'}`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      hasUpperCase ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {hasUpperCase ? (
                        <CheckIcon className="w-3 h-3 text-green-600" />
                      ) : (
                        <XMarkIcon className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                    <span className={`text-sm ${hasUpperCase ? 'text-green-700' : 'text-red-700'}`}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      hasLowerCase ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {hasLowerCase ? (
                        <CheckIcon className="w-3 h-3 text-green-600" />
                      ) : (
                        <XMarkIcon className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                    <span className={`text-sm ${hasLowerCase ? 'text-green-700' : 'text-red-700'}`}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      hasNumber ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {hasNumber ? (
                        <CheckIcon className="w-3 h-3 text-green-600" />
                      ) : (
                        <XMarkIcon className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                    <span className={`text-sm ${hasNumber ? 'text-green-700' : 'text-red-700'}`}>
                      One number
                    </span>
                  </div>
                  {hasSpecialChar && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-green-100">
                        <CheckIcon className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm text-green-700">
                        Special character (bonus security!)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-neural-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your new password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    formData.confirmPassword && !doPasswordsMatch
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-neural-300 focus:ring-brand-500'
                  }`}
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
              {formData.confirmPassword && !doPasswordsMatch && (
                <p className="text-red-600 text-sm mt-1">Passwords don't match</p>
              )}
              {formData.confirmPassword && doPasswordsMatch && (
                <p className="text-green-600 text-sm mt-1 flex items-center">
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isPasswordValid || !doPasswordsMatch || isSubmitting || state.isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                !isPasswordValid || !doPasswordsMatch || isSubmitting || state.isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:from-brand-700 hover:to-accent-600 transform hover:scale-105'
              }`}
            >
              {isSubmitting || state.isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Updating password...
                </span>
              ) : (
                '🔐 Update Password'
              )}
            </button>
          </form>
        </div>

        {/* Security Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">🛡️ Password Security</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your password is encrypted and never stored in plain text</li>
            <li>• Consider using a password manager for security</li>
            <li>• You can switch to passwordless login anytime</li>
          </ul>
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