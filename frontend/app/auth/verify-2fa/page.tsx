'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ShieldCheckIcon, KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import secureAuthStorage from '@/lib/secure-auth-storage';

function Verify2FAContent() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { state, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tempToken = searchParams.get('token');
  const userId = searchParams.get('userId');

  useGSAP(
    () => {
      gsap.from('.twofa-card', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
      gsap.from('.form-element', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.3,
        ease: 'power2.out',
      });
    },
    { scope: containerRef }
  );

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
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Back to login link */}
        <Link
          href="/auth/login"
          className="form-element inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Header with Logo */}
        <div className="form-element text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Image
              src="/images/logos/company-logo.png"
              alt="One Last AI"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
              priority
            />
          </Link>
          <div className="flex justify-center mb-4">
            <div
              className="p-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              }}
            >
              <ShieldCheckIcon className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-400">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="form-element p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Verification Form */}
        <div
          className="twofa-card rounded-2xl p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {!useBackupCode ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
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
                      className="w-12 h-14 text-center text-2xl font-bold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
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
                className="w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: isSubmitting || code.some(d => !d)
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                    Verifying...
                  </span>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-5 h-5" />
                    Verify & Sign In
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Backup Code Form */
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter Backup Code
                </label>
                <input
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  disabled={isSubmitting}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter one of your 8-character backup codes
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !backupCode.trim()}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: isSubmitting || !backupCode.trim()
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                    Verifying...
                  </span>
                ) : (
                  <>
                    <KeyIcon className="w-5 h-5" />
                    Use Backup Code
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle between code types */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setError('');
                setCode(['', '', '', '', '', '']);
                setBackupCode('');
              }}
              className="w-full text-center text-sm text-purple-400 hover:text-purple-300 flex items-center justify-center gap-2 transition-colors"
            >
              <KeyIcon className="w-4 h-4" />
              {useBackupCode ? 'Use authenticator app code' : 'Use a backup code instead'}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="form-element text-center space-y-3">
          <p className="text-sm text-gray-500">
            Open your authenticator app (Google Authenticator, Authy, etc.) to view your code
          </p>
          <Link href="/auth/login" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <Verify2FAContent />
    </Suspense>
  );
}
