'use client';

import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CheckCircle, ArrowRight, MessageSquare, LayoutDashboard, Mail, Clock, Shield, Zap } from 'lucide-react';

function SuccessContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const agentName = searchParams.get('agent') || 'AI Agent';

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.success-icon', {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
    })
      .from('.success-title', {
        opacity: 0,
        y: 20,
        duration: 0.5,
      }, '-=0.2')
      .from('.success-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.5,
      }, '-=0.3')
      .from('.details-card', {
        opacity: 0,
        y: 30,
        duration: 0.6,
      }, '-=0.2')
      .from('.action-btn', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.4,
      }, '-=0.2')
      .from('.info-box', {
        opacity: 0,
        y: 20,
        duration: 0.5,
      }, '-=0.2');
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="success-icon mb-8">
            <div 
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 0 60px rgba(16, 185, 129, 0.4)',
              }}
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="success-title text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
              🎉 Payment Successful!
            </span>
          </h1>
          <p className="success-subtitle text-xl text-white/60 mb-10">
            You now have access to{' '}
            <span className="font-semibold text-emerald-400">{agentName}</span>
          </p>

          {/* Details Card */}
          <div 
            className="details-card p-8 rounded-2xl mb-10"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span className="text-white/60">Access Status:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span className="text-white/60">Agent:</span>
                <span className="font-semibold text-white">{agentName}</span>
              </div>
              {sessionId && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Session ID:</span>
                  <span className="font-mono text-sm text-white/50">
                    {sessionId.substring(0, 20)}...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href={`/agents/${agentName.toLowerCase().replace(/\s+/g, '-')}`}
              className="action-btn group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
              }}
            >
              <MessageSquare className="w-5 h-5" />
              Start Chatting with {agentName}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="action-btn inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 hover:bg-white/5"
            >
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard
            </Link>
          </div>

          {/* Info Box */}
          <div 
            className="info-box p-6 rounded-2xl text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              What&apos;s Next?
            </h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                A confirmation email has been sent to your inbox
              </li>
              <li className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Your access is now active and ready to use
              </li>
              <li className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                You can manage your purchases from the Dashboard
              </li>
              <li className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
