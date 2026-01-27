'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  UserIcon,
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  CpuChipIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

export default function AuthPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tl.fromTo('.hero-icon', { opacity: 0, scale: 0.5, rotate: -180 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.8 })
      .fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .fromTo('.auth-card', { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15 }, '-=0.2')
      .fromTo('.features-section', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .fromTo('.feature-item', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '-=0.2');
  }, { scope: containerRef });

  const glassCard = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-16">
            <div className="hero-icon flex justify-center mb-8">
              <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(34, 211, 238, 0.3) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <SparklesIcon className="w-14 h-14 text-cyan-400" />
              </div>
            </div>
            <h1 className="hero-title text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-6">
              Welcome to One Last AI
            </h1>
            <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto">
              Join our platform to access powerful AI agents, save your
              conversations, and unlock personalized experiences tailored just
              for you.
            </p>
          </div>

          {/* Authentication Options */}
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-16">
            {/* Sign Up Card */}
            <div className="auth-card group rounded-2xl p-8 hover:scale-[1.02] transition-all duration-500 cursor-pointer" style={glassCard}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: 'inset 0 0 0 1px rgba(52, 211, 153, 0.3)' }} />
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)' }}>
                  <UserIcon className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Create Account
              </h2>
              <p className="text-gray-400 mb-6">
                New to our platform? Sign up to start your AI journey with
                personalized agents and saved conversations.
              </p>
              <Link
                href="/auth/signup"
                className="group/btn w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
              >
                Get Started
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                Paid per-agent access • Starting at $1/day
              </p>
            </div>

            {/* Login Card */}
            <div className="auth-card group rounded-2xl p-8 hover:scale-[1.02] transition-all duration-500 cursor-pointer" style={glassCard}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: 'inset 0 0 0 1px rgba(168, 85, 247, 0.3)' }} />
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)' }}>
                  <LockClosedIcon className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome Back
              </h2>
              <p className="text-gray-400 mb-6">
                Already have an account? Sign in to continue your conversations
                and access your personalized AI agents.
              </p>
              <Link
                href="/auth/login"
                className="group/btn w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
              >
                Sign In
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">Secure • Fast • Easy</p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="features-section rounded-2xl p-8 mb-12" style={glassCard}>
            <h3 className="text-2xl font-bold text-white mb-8">
              What you'll get with an account
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="feature-item text-center group">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                  <ChatBubbleLeftRightIcon className="w-7 h-7 text-cyan-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">
                  Saved Conversations
                </h4>
                <p className="text-sm text-gray-400">
                  Your chat history persists across sessions
                </p>
              </div>
              <div className="feature-item text-center group">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  <CpuChipIcon className="w-7 h-7 text-purple-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">
                  18 AI Agents
                </h4>
                <p className="text-sm text-gray-400">
                  Access to all specialized AI assistants
                </p>
              </div>
              <div className="feature-item text-center group">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                  <BoltIcon className="w-7 h-7 text-emerald-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">
                  Personalized Experience
                </h4>
                <p className="text-sm text-gray-400">
                  Tailored recommendations and preferences
                </p>
              </div>
            </div>
          </div>

          {/* Additional Links */}
          <div className="text-center space-x-6">
            <Link
              href="/auth/reset-password"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Forgot Password?
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="/legal"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms & Privacy
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="/support"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Need Help?
            </Link>
          </div>
        </div>
      </div>

      {/* CSS for gradient radial */}
      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
