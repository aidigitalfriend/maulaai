'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, CheckCircle } from 'lucide-react'

function VerifyEmailPageContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleResend = async () => {
    if (!email || !canResend) return

    setIsResending(true)
    setResendMessage(null)

    try {
      const { signIn } = await import('next-auth/react')
      const result = await signIn('email', {
        email,
        redirect: false,
      })

      if (result?.ok) {
        setResendMessage('✅ Magic link sent! Check your email.')
        setCountdown(60)
        setCanResend(false)
      } else {
        setResendMessage('❌ Failed to resend. Please try again.')
      }
    } catch (error) {
      setResendMessage('❌ Failed to resend. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
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
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Check Your Email</h1>
            <p className="text-blue-100 text-center">We've sent you a magic link</p>
          </div>

          <div className="p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Mail className="w-20 h-20 text-blue-600" />
                <CheckCircle className="w-8 h-8 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Magic Link Sent! ✨
              </h2>
              <p className="text-gray-600 mb-2">
                We've sent a secure sign-in link to:
              </p>
              <p className="text-blue-600 font-semibold text-lg mb-4">
                {email || 'your email'}
              </p>
              <p className="text-gray-500 text-sm">
                Click the link in the email to complete your sign-up. The link expires in 24 hours.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                📧 Didn't receive the email?
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes for delivery</li>
              </ul>
            </div>

            {/* Resend Message */}
            {resendMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm text-center ${
                resendMessage.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {resendMessage}
              </div>
            )}

            {/* Resend Button */}
            <button
              onClick={handleResend}
              disabled={!canResend || isResending}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? (
                'Sending...'
              ) : canResend ? (
                'Resend Magic Link'
              ) : (
                `Resend in ${countdown}s`
              )}
            </button>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-white text-sm opacity-75">
            🔒 Your security is our priority. This link can only be used once.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}
