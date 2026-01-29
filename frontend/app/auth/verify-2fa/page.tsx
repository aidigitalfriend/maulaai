'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { secureAuthStorage } from '@/lib/secure-auth-storage';
import { gsap, SplitText } from '@/lib/gsap';

function Verify2FAContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { state } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tempToken = searchParams.get('token');
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (state.isAuthenticated) {
      router.push('/dashboard/overview');
    }
  }, [state.isAuthenticated, router]);

  useEffect(() => {
    if (!tempToken || !userId) {
      router.push('/auth/login');
    }
  }, [tempToken, userId, router]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !tempToken || !userId) return;

    const ctx = gsap.context(() => {
      const title = new SplitText('.verify-title', { type: 'chars' });
      gsap.set(title.chars, { y: 50, opacity: 0, rotateX: -90 });
      gsap.set('.verify-subtitle', { y: 20, opacity: 0 });
      gsap.set('.verify-icon', { scale: 0, rotation: -180 });
      gsap.set('.verify-form', { y: 40, opacity: 0 });
      gsap.set('.code-input', { scale: 0, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.verify-icon', { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' })
        .to(title.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.02 }, '-=0.4')
        .to('.verify-subtitle', { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
        .to('.verify-form', { y: 0, opacity: 1, duration: 0.6 }, '-=0.2')
        .to('.code-input', { scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.7)' }, '-=0.3');

      gsap.utils.toArray<HTMLElement>('.particle').forEach((p, i) => {
        gsap.to(p, { y: 'random(-40, 40)', x: 'random(-25, 25)', duration: 'random(4, 6)', repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.2 });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [tempToken, userId]);

  const handleInputChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
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
        body: JSON.stringify({ tempToken, userId, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      if (data.user) {
        sessionStorage.removeItem('tempToken');
        secureAuthStorage.setUser(data.user);
        window.location.href = '/dashboard/overview';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6 && !isSubmitting) {
      const form = document.getElementById('verify-form') as HTMLFormElement;
      form?.requestSubmit();
    }
  }, [code, isSubmitting]);

  if (!tempToken || !userId) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle absolute w-1 h-1 bg-emerald-400/40 rounded-full" style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 4) * 20}%` }} />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <Image src="/images/logos/company-logo.png" alt="Maula AI" width={80} height={80} className="w-20 h-20 object-contain" priority />
          </Link>

          <div className="verify-icon inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl border border-emerald-500/30 mb-6">
            <span className="text-3xl">🛡️</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            <span className="verify-title bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Two-Factor Authentication</span>
          </h1>
          <p className="verify-subtitle text-gray-400 text-lg">Enter the 6-digit code from your authenticator app</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Verification Form */}
        <div className="verify-form relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-lg" />

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
                  className="code-input w-12 h-14 text-center text-2xl font-bold bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                  disabled={isSubmitting}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.join('').length !== 6}
              className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-300 ${
                isSubmitting || code.join('').length !== 6
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 transform hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Verifying...
                </span>
              ) : '🔐 Verify Code'}
            </button>
          </form>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <Verify2FAContent />
    </Suspense>
  );
}
