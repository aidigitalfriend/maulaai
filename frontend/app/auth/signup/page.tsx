'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { gsap, SplitText } from '@/lib/gsap';

function SignupPageContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const title = new SplitText('.signup-title', { type: 'chars' });
      gsap.set(title.chars, { y: 50, opacity: 0, rotateX: -90 });
      gsap.set('.signup-subtitle', { y: 20, opacity: 0 });
      gsap.set('.signup-logo', { scale: 0, rotation: -180 });
      gsap.set('.signup-form', { y: 40, opacity: 0 });
      gsap.set('.signup-footer', { y: 20, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.signup-logo', { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' })
        .to(title.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.03 }, '-=0.4')
        .to('.signup-subtitle', { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
        .to('.signup-form', { y: 0, opacity: 1, duration: 0.6 }, '-=0.2')
        .to('.signup-footer', { y: 0, opacity: 1, duration: 0.4 }, '-=0.2');

      gsap.utils.toArray<HTMLElement>('.particle').forEach((p, i) => {
        gsap.to(p, { y: 'random(-40, 40)', x: 'random(-25, 25)', duration: 'random(4, 6)', repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.2 });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handlePasswordSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, authMethod: 'password' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create account');
        return;
      }

      const redirectTo = searchParams.get('redirect') || '/dashboard/overview';
      const loginUrl = `/auth/login?message=Account created successfully! Please sign in.${redirectTo !== '/dashboard/overview' ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`;
      router.push(loginUrl);
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Password signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-green-500/15 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle absolute w-1 h-1 bg-cyan-400/40 rounded-full" style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 4) * 20}%` }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="signup-logo inline-block mb-4">
            <Image src="/images/logos/company-logo.png" alt="Maula AI" width={60} height={60} className="w-15 h-15 object-contain" priority />
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            <span className="signup-title bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">Join Maula AI</span>
          </h1>
          <p className="signup-subtitle text-gray-400">Create your account in seconds</p>
        </div>

        {/* Signup Form */}
        <div className="signup-form relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSignup} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                placeholder="At least 8 characters"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 font-semibold rounded-xl transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-green-500 text-white hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-[1.02]'
              }`}
            >
              {isLoading ? 'Creating account...' : '✨ Create Account'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="signup-footer pt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link
              href={`/auth/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400">Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}
