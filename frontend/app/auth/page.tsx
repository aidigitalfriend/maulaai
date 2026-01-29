'use client';

import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '@/lib/gsap';
import Link from 'next/link';

export default function AuthPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    { icon: '💬', title: 'Saved Conversations', desc: 'Your chat history persists across sessions' },
    { icon: '🤖', title: '18 AI Agents', desc: 'Access to all specialized AI assistants' },
    { icon: '⚡', title: 'Personalized Experience', desc: 'Tailored recommendations and preferences' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero animations
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSubtitle = new SplitText('.hero-subtitle', { type: 'words' });

      gsap.set(heroTitle.chars, { y: 80, opacity: 0, rotateX: -90 });
      gsap.set(heroSubtitle.words, { y: 30, opacity: 0 });
      gsap.set('.hero-icon', { scale: 0, rotation: -180 });
      gsap.set('.auth-card', { y: 60, opacity: 0, scale: 0.95 });
      gsap.set('.features-card', { y: 60, opacity: 0 });
      gsap.set('.feature-item', { y: 30, opacity: 0 });
      gsap.set('.footer-links', { y: 20, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-icon', { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.02 }, '-=0.4')
        .to(heroSubtitle.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.02 }, '-=0.4')
        .to('.auth-card', { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.4)' }, '-=0.3')
        .to('.features-card', { y: 0, opacity: 1, duration: 0.6 }, '-=0.3')
        .to('.feature-item', { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 }, '-=0.2')
        .to('.footer-links', { y: 0, opacity: 1, duration: 0.4 }, '-=0.2');

      // Floating particles
      gsap.utils.toArray<HTMLElement>('.particle').forEach((p, i) => {
        gsap.to(p, {
          y: 'random(-50, 50)',
          x: 'random(-30, 30)',
          duration: 'random(4, 7)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCardHover = (e: React.MouseEvent, entering: boolean) => {
    const card = e.currentTarget;
    gsap.to(card, { y: entering ? -10 : 0, scale: entering ? 1.03 : 1, duration: 0.3 });
    gsap.to(card.querySelector('.card-glow'), { opacity: entering ? 1 : 0, duration: 0.3 });
    gsap.to(card.querySelector('.card-icon'), { scale: entering ? 1.2 : 1, rotate: entering ? 10 : 0, duration: 0.4, ease: 'back.out(2)' });
    gsap.to(card.querySelector('.card-arrow'), { x: entering ? 8 : 0, duration: 0.3 });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="particle absolute w-1.5 h-1.5 bg-cyan-400/30 rounded-full" style={{ left: `${5 + i * 10}%`, top: `${10 + (i % 5) * 18}%` }} />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="hero-icon inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl border border-cyan-500/30 mb-6">
              <span className="text-4xl">✨</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="hero-title bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">Welcome to AI Agents</span>
            </h1>
            <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto">
              Join our platform to access powerful AI agents, save your conversations, and unlock personalized experiences tailored just for you.
            </p>
          </div>

          {/* Auth Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            {/* Sign Up Card */}
            <Link
              href="/auth/signup"
              className="auth-card group relative block"
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden h-full">
                <div className="card-glow absolute inset-0 bg-gradient-to-br from-green-500/20 to-cyan-500/20 opacity-0" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-green-500/30 rounded-tr-lg" />
                <div className="relative z-10">
                  <div className="card-icon w-14 h-14 bg-gradient-to-br from-green-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">Create Account</h2>
                  <p className="text-gray-400 mb-6">New to our platform? Sign up to start your AI journey with personalized agents.</p>
                  <div className="flex items-center justify-center gap-2 text-cyan-400 font-semibold">
                    Get Started <span className="card-arrow">→</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Paid per-agent access • Starting at $1/day</p>
                </div>
              </div>
            </Link>

            {/* Login Card */}
            <Link
              href="/auth/login"
              className="auth-card group relative block"
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden h-full">
                <div className="card-glow absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                <div className="relative z-10">
                  <div className="card-icon w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">Welcome Back</h2>
                  <p className="text-gray-400 mb-6">Already have an account? Sign in to continue your conversations.</p>
                  <div className="flex items-center justify-center gap-2 text-purple-400 font-semibold">
                    Sign In <span className="card-arrow">→</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Secure • Fast • Easy</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="features-card relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm mb-8">
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
            <h3 className="text-2xl font-bold text-white mb-8">What you'll get with an account</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="feature-item text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-600/50">
                    <span className="text-2xl">{f.icon}</span>
                  </div>
                  <h4 className="font-semibold text-white mb-2">{f.title}</h4>
                  <p className="text-sm text-gray-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="footer-links flex justify-center items-center gap-6 flex-wrap text-sm">
            <Link href="/auth/reset-password" className="text-cyan-400 hover:text-cyan-300 transition-colors">Forgot Password?</Link>
            <span className="text-gray-600">•</span>
            <Link href="/legal" className="text-gray-400 hover:text-white transition-colors">Terms & Privacy</Link>
            <span className="text-gray-600">•</span>
            <Link href="/support" className="text-gray-400 hover:text-white transition-colors">Need Help?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
