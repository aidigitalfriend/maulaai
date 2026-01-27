'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import secureAuthStorage from '@/lib/secure-auth-storage';

function Verify2FAContent() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { state, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tempToken = searchParams.get('token');
  const userId = searchParams.get('userId');

  // Redirect if no token or already authenticated
  useEffect(() => {
    if (!tempToken || !userId) {
      router.push('/auth/login');
    }
    if (state.isAuthenticated) {
      router.push('/dashboard/overview');
    }
  }, [tempToken, userId, state.isAuthenticated, router]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 5 && newCode.every(d => d)) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    
    // Focus last filled input or next empty
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (codeStr?: string) => {
    const verificationCode = codeStr || (useBackupCode ? backupCode : code.join(''));
    
    if (!useBackupCode && verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (useBackupCode && !backupCode.trim()) {
      setError('Please enter your backup code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tempToken,
          userId,
          code: verificationCode.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      if (data.success && data.user) {
        // Store user data
        secureAuthStorage.setUser(data.user);
        // Redirect to dashboard
        router.push('/dashboard/overview');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      // Clear code on error
      if (!useBackupCode) {
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-brand-100 rounded-full">
              <ShieldCheckIcon className="w-8 h-8 text-brand-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neural-900 mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-neural-600">
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
        <div className="bg-white rounded-xl shadow-lg border border-neural-200 p-6">
          {!useBackupCode ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-4 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                      disabled={isSubmitting}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || code.some(d => !d)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting || code.some(d => !d)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:from-brand-700 hover:to-accent-600'
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
          ) : (
            /* Backup Code Form */
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neural-700 mb-2">
                  Enter Backup Code
                </label>
                <input
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest border-2 border-neural-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  disabled={isSubmitting}
                  autoFocus
                />
                <p className="text-xs text-neural-500 mt-2 text-center">
                  Enter one of your 8-character backup codes
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !backupCode.trim()}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting || !backupCode.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:from-brand-700 hover:to-accent-600'
                }`}
              >
                {isSubmitting ? 'Verifying...' : '🔐 Use Backup Code'}
              </button>
            </form>
          )}

          {/* Toggle between code types */}
          <div className="mt-4 pt-4 border-t border-neural-100">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setError('');
                setCode(['', '', '', '', '', '']);
                setBackupCode('');
              }}
              className="w-full text-center text-sm text-brand-600 hover:text-brand-700 flex items-center justify-center gap-2"
            >
              <KeyIcon className="w-4 h-4" />
              {useBackupCode ? 'Use authenticator app code' : 'Use a backup code instead'}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-neural-500">
            Open your authenticator app (Google Authenticator, Authy, etc.) to view your code
          </p>
          <Link href="/auth/login" className="text-sm text-brand-600 hover:text-brand-700">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"></div>
      </div>
    }>
      <Verify2FAContent />
    </Suspense>
  );
}
