'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCodeInput, setBackupCodeInput] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const tempToken = searchParams.get('token');
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (!tempToken || !userId) {
      router.push('/auth/login');
    }
  }, [tempToken, userId, router]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value && newCode.every(digit => digit)) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const verificationCode = codeToVerify || (useBackupCode ? backupCodeInput : code.join(''));
    
    if (!verificationCode || (useBackupCode && verificationCode.length < 8) || (!useBackupCode && verificationCode.length !== 6)) {
      setError(useBackupCode ? 'Please enter a valid backup code' : 'Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          code: verificationCode,
          userId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // HttpOnly cookies handle token storage securely
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid code. Please try again.');
        if (!useBackupCode) {
          setCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        } else {
          setBackupCodeInput('');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-neural-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-neural-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-neural-900 mb-2">
              Two-Factor Authentication
            </h1>
            <p className="text-neural-600">
              {useBackupCode 
                ? 'Enter one of your backup codes' 
                : 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!useBackupCode ? (
            <>
              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
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
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-neural-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none transition-all"
                    disabled={loading}
                  />
                ))}
              </div>

              <button
                onClick={() => handleVerify()}
                disabled={loading || code.some(digit => !digit)}
                className="w-full btn-primary mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <input
                  type="text"
                  value={backupCodeInput}
                  onChange={(e) => setBackupCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter backup code"
                  className="w-full p-4 border-2 border-neural-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none text-center font-mono text-lg"
                  disabled={loading}
                  maxLength={12}
                />
              </div>

              <button
                onClick={() => handleVerify()}
                disabled={loading || backupCodeInput.length < 8}
                className="w-full btn-primary mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Backup Code'}
              </button>
            </>
          )}

          <button
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setError('');
              setCode(['', '', '', '', '', '']);
              setBackupCodeInput('');
            }}
            className="w-full text-sm text-brand-600 hover:text-brand-700 font-medium mb-4"
          >
            {useBackupCode ? '← Use authenticator code' : 'Use backup code instead'}
          </button>

          <div className="text-center">
            <Link href="/auth/login" className="text-sm text-neural-600 hover:text-neural-900">
              ← Back to login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-neural-600">
            Lost access to your authenticator?{' '}
            <Link href="/support/contact-us" className="text-brand-600 hover:text-brand-700">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Verify2FAContent />
    </Suspense>
  );
}
