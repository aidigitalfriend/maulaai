'use client''use client'

export const dynamic = 'force-dynamic'export const dynamic = 'force-dynamic'



import { useState, useEffect, Suspense } from 'react'import { useState, useEffect, Suspense } from 'react'

import Link from 'next/link'import Link from 'next/link'

import Image from 'next/image'import Image from 'next/image'

import { useRouter, useSearchParams } from 'next/navigation'import { useRouter, useSearchParams } from 'next/navigation'

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

import { useAuth } from '../../../lib/auth-context'import { useAuth } from '../../../lib/auth-context'



function LoginPageContent() {function LoginPageContent() {

  const [formData, setFormData] = useState({  const [formData, setFormData] = useState({

    email: '',    email: '',

    password: ''    password: ''

  })  })

  const [showPassword, setShowPassword] = useState(false)  const [showPassword, setShowPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)  const [isSubmitting, setIsSubmitting] = useState(false)



  const { loginWithPassword, state } = useAuth()  const { loginWithPassword, state } = useAuth()

  const router = useRouter()  const router = useRouter()

  const searchParams = useSearchParams()  const searchParams = useSearchParams()



  // Redirect if already authenticated  // Redirect if already authenticated

  useEffect(() => {  useEffect(() => {

    if (state.isAuthenticated) {    if (state.isAuthenticated) {

      const redirectTo = searchParams.get('redirect') || '/dashboard'      const redirectTo = searchParams.get('redirect') || '/dashboard'

      router.push(redirectTo)      router.push(redirectTo)

    }    }

  }, [state.isAuthenticated, router, searchParams])  }, [state.isAuthenticated, router, searchParams])



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setFormData(prev => ({    setFormData(prev => ({

      ...prev,      ...prev,

      [e.target.name]: e.target.value      [e.target.name]: e.target.value

    }))    }))

  }  }



  const handleSubmit = async (e: React.FormEvent) => {  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()    e.preventDefault()

    setIsSubmitting(true)    setIsSubmitting(true)

        

    try {    try {

      await loginWithPassword(formData.email, formData.password)      await loginWithPassword(formData.email, formData.password)

      // Redirect handled by useEffect      // Redirect handled by useEffect

    } catch (error) {    } catch (error) {

      console.error('Login error:', error)      console.error('Login error:', error)

    } finally {    } finally {

      setIsSubmitting(false)      setIsSubmitting(false)

    }    }

  }  }



  return (  return (

    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-8">      <div className="max-w-md w-full space-y-8">

        {/* Header with Logo */}        {/* Header with Logo */}

        <div className="text-center">        <div className="text-center">

          <Link href="/" className="inline-flex items-center justify-center mb-6">          <Link href="/" className="inline-flex items-center justify-center mb-6">

            <Image            <Image

              src="/images/logos/company-logo.png"              src="/images/logos/company-logo.png"

              alt="One Last AI"              alt="One Last AI"

              width={80}              width={80}

              height={80}              height={80}

              className="w-20 h-20 object-contain"              className="w-20 h-20 object-contain"

              priority              priority

            />            />

          </Link>          </Link>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent mb-2">          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent mb-2">

            Welcome Back            Welcome Back

          </h1>          </h1>

          <p className="text-neural-600 text-lg">          <p className="text-neural-600 text-lg">

            Sign in to access your AI agents            Sign in to access your AI agents

          </p>          </p>

        </div>        </div>



        {state.error && (        {successMessage && (

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">          <div className="bg-green-50 border border-green-200 rounded-lg p-4">

            <p className="text-red-800 text-center font-medium">{state.error}</p>            <p className="text-green-800 text-center font-medium">{successMessage}</p>

          </div>            <p className="text-green-700 text-sm text-center mt-2">

        )}              The secure link will expire in 15 minutes for your security.

            </p>

        {/* Login Form */}          </div>

        <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6">        )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Field */}        {state.error && (

            <div>          <div className="bg-red-50 border border-red-200 rounded-lg p-4">

              <label className="block text-sm font-medium text-neural-700 mb-2">            <p className="text-red-800 text-center font-medium">{state.error}</p>

                Email Address          </div>

              </label>        )}

              <input

                type="email"        {/* Loading State for Magic Link Verification */}

                name="email"        {state.isLoading && searchParams.get('token') && (

                value={formData.email}          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

                onChange={handleInputChange}            <div className="flex items-center justify-center">

                required              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-3"></div>

                placeholder="Enter your email address"              <p className="text-blue-800 font-medium">Verifying your secure login link...</p>

                className="w-full px-4 py-3 border border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"            </div>

              />          </div>

            </div>        )}



            {/* Password Field */}        {/* Auth Mode Selection */}

            <div>        <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6">

              <label className="block text-sm font-medium text-neural-700 mb-2">          <div className="mb-6">

                Password            <h2 className="text-xl font-semibold text-neural-800 mb-4">Choose your login method</h2>

              </label>            

              <div className="relative">            {/* Mode Toggle */}

                <input            <div className="grid grid-cols-2 gap-3 mb-6">

                  type={showPassword ? 'text' : 'password'}              <button

                  name="password"                type="button"

                  value={formData.password}                onClick={() => setAuthMode('passwordless')}

                  onChange={handleInputChange}                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${

                  required                  authMode === 'passwordless'

                  placeholder="Enter your password"                    ? 'border-brand-500 bg-brand-50'

                  className="w-full px-4 py-3 pr-12 border border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"                    : 'border-neural-200 hover:border-neural-300'

                />                }`}

                <button              >

                  type="button"                <div className="flex items-center mb-2">

                  onClick={() => setShowPassword(!showPassword)}                  <span className="text-2xl mr-3">🔐</span>

                  className="absolute right-3 top-3 text-neural-400 hover:text-neural-600"                  <span className="font-medium text-neural-800">Passwordless</span>

                >                  {authMode === 'passwordless' && (

                  {showPassword ? (                    <span className="ml-auto text-brand-600 text-sm font-medium">Secure</span>

                    <EyeSlashIcon className="w-5 h-5" />                  )}

                  ) : (                </div>

                    <EyeIcon className="w-5 h-5" />                <p className="text-sm text-neural-600">

                  )}                  Secure magic link login

                </button>                </p>

              </div>              </button>

            </div>

              <button

            {/* Forgot Password Link */}                type="button"

            <div className="text-right">                onClick={() => setAuthMode('password')}

              <Link                 className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${

                href="/auth/reset-password"                   authMode === 'password'

                className="text-sm text-brand-600 hover:text-brand-700"                    ? 'border-brand-500 bg-brand-50'

              >                    : 'border-neural-200 hover:border-neural-300'

                Forgot your password?                }`}

              </Link>              >

            </div>                <div className="flex items-center mb-2">

                  <span className="text-2xl mr-3">🔑</span>

            {/* Submit Button */}                  <span className="font-medium text-neural-800">Password</span>

            <button                </div>

              type="submit"                <p className="text-sm text-neural-600">

              disabled={isSubmitting || state.isLoading}                  Email + password

              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${                </p>

                isSubmitting || state.isLoading              </button>

                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'            </div>

                  : 'bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:from-brand-700 hover:to-accent-600 transform hover:scale-105'          </div>

              }`}

            >          {/* Login Form */}

              {isSubmitting || state.isLoading ? (          <form onSubmit={handleSubmit} className="space-y-4">

                <span className="flex items-center justify-center">            {/* Email Field */}

                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>            <div>

                  Signing in...              <label className="block text-sm font-medium text-neural-700 mb-2">

                </span>                Email Address

              ) : (              </label>

                '🔑 Sign In'              <input

              )}                type="email"

            </button>                name="email"

          </form>                value={formData.email}

        </div>                onChange={handleInputChange}

                required

        {/* Signup Link */}                placeholder="Enter your email address"

        <div className="text-center">                className="w-full px-4 py-3 border border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"

          <p className="text-neural-600">              />

            Don't have an account?{' '}            </div>

            <Link href="/auth/signup" className="text-brand-600 hover:text-brand-700 font-medium">

              Sign up here            {/* Password Field (only for traditional mode) */}

            </Link>            {authMode === 'password' && (

          </p>              <div>

        </div>                <label className="block text-sm font-medium text-neural-700 mb-2">

                  Password

        {/* Back to Home */}                </label>

        <div className="text-center">                <div className="relative">

          <Link                   <input

            href="/"                     type={showPassword ? 'text' : 'password'}

            className="text-sm text-neural-500 hover:text-neural-600"                    name="password"

          >                    value={formData.password}

            ← Back to homepage                    onChange={handleInputChange}

          </Link>                    required

        </div>                    placeholder="Enter your password"

      </div>                    className="w-full px-4 py-3 pr-12 border border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"

    </div>                  />

  )                  <button

}                    type="button"

                    onClick={() => setShowPassword(!showPassword)}

export default function LoginPage() {                    className="absolute right-3 top-3 text-neural-400 hover:text-neural-600"

  return (                  >

    <Suspense fallback={null}>                    {showPassword ? (

      <LoginPageContent />                      <EyeSlashIcon className="w-5 h-5" />

    </Suspense>                    ) : (

  )                      <EyeIcon className="w-5 h-5" />

}                    )}

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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}