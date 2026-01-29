'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, Observer, CustomWiggle, CustomEase } from '@/lib/gsap';
import { CheckCircle, Sparkles, ArrowRight, Zap, MessageSquare, Clock, Download, PartyPopper } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionId = searchParams.get('session_id');
  const agentName = searchParams.get('agent') || 'AI Agent';

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      CustomWiggle.create('successWiggle', { wiggles: 6, type: 'uniform' });

      // Success icon animation
      gsap.set('.success-icon', { scale: 0, rotate: -180 });
      gsap.set('.success-ring', { scale: 0, opacity: 0 });
      gsap.set('.success-title', { y: 50, opacity: 0 });
      gsap.set('.success-subtitle', { y: 30, opacity: 0 });
      gsap.set('.success-card', { y: 40, opacity: 0, scale: 0.95 });
      gsap.set('.success-action', { y: 30, opacity: 0 });
      gsap.set('.confetti-particle', { y: -100, opacity: 0, scale: 0 });
      gsap.set('.next-step', { x: -30, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.to('.success-ring', {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.5)'
      })
      .to('.success-icon', {
        scale: 1,
        rotate: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.5)'
      }, '-=0.5')
      .to('.confetti-particle', {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.03,
        ease: 'back.out(2)'
      }, '-=0.6')
      .to('.success-title', {
        y: 0,
        opacity: 1,
        duration: 0.6
      }, '-=0.5')
      .to('.success-subtitle', {
        y: 0,
        opacity: 1,
        duration: 0.5
      }, '-=0.3')
      .to('.success-card', {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.5)'
      }, '-=0.3')
      .to('.success-action', {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1
      }, '-=0.3')
      .to('.next-step', {
        x: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08
      }, '-=0.3');

      // Pulsing success icon
      gsap.to('.success-icon', {
        scale: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5
      });

      // Floating confetti
      document.querySelectorAll('.confetti-particle').forEach((particle, i) => {
        gsap.to(particle, {
          y: `random(-40, 40)`,
          x: `random(-30, 30)`,
          rotation: `random(-30, 30)`,
          duration: `random(3, 5)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.1
        });
      });

      // Gradient orbs
      gsap.to('.gradient-orb-1', {
        x: 60,
        y: -40,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-2', {
        x: -50,
        y: 50,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb-1 absolute top-20 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="gradient-orb-2 absolute bottom-20 right-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Confetti Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti-particle absolute w-3 h-3 rounded-full"
            style={{
              left: `${5 + i * 4.5}%`,
              top: `${15 + (i % 5) * 12}%`,
              background: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'][i % 5]
            }}
          />
        ))}
      </div>

      <div className="relative min-h-screen flex items-center justify-center py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="relative mb-8 inline-block">
            <div className="success-ring absolute inset-0 w-32 h-32 rounded-full bg-emerald-500/20 blur-xl" />
            <div className="success-icon relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="success-title text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
            Payment Successful!
          </h1>
          
          <p className="success-subtitle text-xl text-gray-400 mb-8">
            You now have access to <span className="text-emerald-400 font-semibold">{agentName}</span>
          </p>

          {/* Success Card */}
          <div className="success-card p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-800">
                <span className="text-gray-400">Status</span>
                <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-800">
                <span className="text-gray-400">Agent</span>
                <span className="text-white font-semibold">{agentName}</span>
              </div>
              {sessionId && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="text-gray-500 font-mono text-sm">
                    {sessionId.substring(0, 16)}...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href={`/agents/${agentName.toLowerCase().replace(/\s+/g, '-')}`}
              className="success-action inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Chatting
            </Link>
            <Link
              href="/dashboard"
              className="success-action inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white font-medium hover:bg-gray-700 transition-all"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {/* What's Next */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 text-left">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-amber-400" />
              What's Next?
            </h3>
            <ul className="space-y-3">
              <li className="next-step flex items-center gap-3 text-gray-300 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                A confirmation email has been sent to your inbox
              </li>
              <li className="next-step flex items-center gap-3 text-gray-300 text-sm">
                <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Your access is now active and ready to use
              </li>
              <li className="next-step flex items-center gap-3 text-gray-300 text-sm">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Manage your purchases from the Dashboard
              </li>
              <li className="next-step flex items-center gap-3 text-gray-300 text-sm">
                <Download className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                No auto-renewal - buy again when you want more access
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
