'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap, SplitText } from '@/lib/gsap';

export default function ResetPasswordPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const title = new SplitText('.reset-title', { type: 'chars' });
      gsap.set(title.chars, { y: 50, opacity: 0, rotateX: -90 });
      gsap.set('.reset-subtitle', { y: 20, opacity: 0 });
      gsap.set('.reset-icon', { scale: 0, rotation: -180 });
      gsap.set('.reset-form', { y: 40, opacity: 0 });
      gsap.set('.reset-footer', { y: 20, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.reset-icon', { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' })
        .to(title.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.03 }, '-=0.4')
        .to('.reset-subtitle', { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
        .to('.reset-form', { y: 0, opacity: 1, duration: 0.6 }, '-=0.2')
        .to('.reset-footer', { y: 0, opacity: 1, duration: 0.4 }, '-=0.2');

      gsap.utils.toArray<HTMLElement>('.particle').forEach((p, i) => {
        gsap.to(p, { y: 'random(-40, 40)', x: 'random(-25, 25)', duration: 'random(4, 6)', repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.2 });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset link sent to your email!');
        setTimeout(() => router.push('/auth/login'), 3000);
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-pink-500/15 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle absolute w-1 h-1 bg-indigo-400/40 rounded-full" style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 4) * 20}%` }} />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="reset-icon inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl border border-indigo-500/30 mb-6">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="reset-title bg-gradient-to-r from-indigo-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Reset Password</span>
          </h1>
          <p className="reset-subtitle text-gray-400">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {/* Reset Form */}
        <div className="reset-form relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-indigo-500/30 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-indigo-500/30 rounded-bl-lg" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            {message && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-300 ${
                loading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:shadow-lg hover:shadow-indigo-500/25 transform hover:scale-[1.02]'
              }`}
            >
              {loading ? 'Sending...' : '📧 Send Reset Link'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="reset-footer mt-6 text-center">
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
