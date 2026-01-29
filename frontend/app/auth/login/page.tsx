'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { gsap, SplitText } from '@/lib/gsap';

function LoginPageContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, state } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMessage = searchParams.get('message');

  useEffect(() => {
    if (state.isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/dashboard/overview';
      router.push(redirectTo);
    }
  }, [state.isAuthenticated, router, searchParams]);

  useEffect(() => {
    if (!containerRef.current || state.isLoading || state.isAuthenticated) return;

    const ctx = gsap.context(() => {
      const title = new SplitText('.login-title', { type: 'chars' });
      gsap.set(title.chars, { y: 50, opacity: 0, rotateX: -90 });
      gsap.set('.login-subtitle', { y: 20, opacity: 0 });
      gsap.set('.login-logo', { scale: 0, rotation: -180 });
      gsap.set('.login-form', { y: 40, opacity: 0 });
      gsap.set('.login-footer', { y: 20, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.login-logo', { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' })
        .to(title.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.03 }, '-=0.4')
        .to('.login-subtitle', { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
        .to('.login-form', { y: 0, opacity: 1, duration: 0.6 }, '-=0.2')
        .to('.login-footer', { y: 0, opacity: 1, duration: 0.4 }, '-=0.2');

      gsap.utils.toArray<HTMLElement>('.particle').forEach((p, i) => {
        gsap.to(p, { y: 'random(-40, 40)', x: 'random(-25, 25)', duration: 'random(4, 6)', repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.2 });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [state.isLoading, state.isAuthenticated]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Already signed in! Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[350px] h-[350px] bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle absolute w-1 h-1 bg-purple-400/40 rounded-full" style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 4) * 20}%` }} />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="login-logo inline-block mb-6">
            <Image src="/images/logos/company-logo.png" alt="Maula AI" width={80} height={80} className="w-20 h-20 object-contain" priority />
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            <span className="login-title bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Welcome Back</span>
          </h1>
          <p className="login-subtitle text-gray-400 text-lg">Sign in to access your AI agents</p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-center font-medium">{successMessage}</p>
          </div>
        )}
        {state.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-center font-medium">{state.error}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="login-form relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg" />
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/auth/reset-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Forgot your password?</Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || state.isLoading}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                isSubmitting || state.isLoading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]'
              }`}
            >
              {isSubmitting || state.isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </span>
              ) : '🔑 Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="login-footer text-center space-y-4">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link
              href={`/auth/signup${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Sign up here
            </Link>
          </p>
          <Link href="/" className="inline-block text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back to homepage</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
