'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { secureAuthStorage } from '@/lib/secure-auth-storage';

function Verify2FAContent() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { state } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tempToken = searchParams.get('token');
  const userId = searchParams.get('userId');

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      router.push('/dashboard/overview');
    }
  }, [state.isAuthenticated, router]);

  // Redirect if no token/userId
  useEffect(() => {
    if (!tempToken || !userId) {
      router.push('/auth/login');
    }
  }, [tempToken, userId, router]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth-backend/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tempToken,
          userId,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      if (data.user) {
        // Clear temp token from session storage
        sessionStorage.removeItem('tempToken');
        
        // Store user data for UI display
        secureAuthStorage.setUser(data.user);
        
        // Hard navigate to trigger full session check
        window.location.href = '/dashboard/overview';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-submit when all digits entered
  useEffect(() => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6 && !isSubmitting) {
      const form = document.getElementById('verify-form') as HTMLFormElement;
      form?.requestSubmit();
    }
  }, [code, isSubmitting]);

  if (!tempToken || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
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
          
          {/* Shield Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-8 h-8 text-brand-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-neural-600 text-lg">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Verification Form */}
        <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-8">
          <form id="verify-form" onSubmit={handleSubmit} className="space-y-6">
            {/* 6-Digit Code Input */}
            <div className="flex justify-center gap-3" role="group" aria-label="6-digit verification code">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  aria-label={`Digit ${index + 1} of 6`}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-neural-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                           transition-all duration-200"
                  disabled={isSubmitting}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || code.join('').length !== 6}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isSubmitting || code.join('').length !== 6
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:from-brand-700 hover:to-accent-600 transform hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Verifying...
                </span>
              ) : (
                '🔐 Verify & Sign In'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-neural-500">
            <p>Open your authenticator app (Google Authenticator, Authy, etc.)</p>
            <p>and enter the 6-digit code shown for One Last AI</p>
          </div>
        </div>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>

        {/* Recovery Options */}
        <div className="text-center text-sm text-neural-500">
          <p>
            Lost access to your authenticator?{' '}
            <Link href="/auth/recovery" className="text-brand-600 hover:text-brand-700">
              Use a backup code
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <Verify2FAContent />
    </Suspense>
  );
}
