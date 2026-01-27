'use client';

import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { XCircle, ArrowRight, RotateCcw, Users, HelpCircle, CreditCard, FileText } from 'lucide-react';

function CancelContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const agentName = searchParams.get('agent') || 'AI Agent';

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.cancel-icon', {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
    })
      .from('.cancel-title', {
        opacity: 0,
        y: 20,
        duration: 0.5,
      }, '-=0.2')
      .from('.cancel-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.5,
      }, '-=0.3')
      .from('.info-card', {
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
      .from('.help-box', {
        opacity: 0,
        y: 20,
        duration: 0.5,
      }, '-=0.2');
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Cancel Icon */}
          <div className="cancel-icon mb-8">
            <div 
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 0 60px rgba(249, 115, 22, 0.4)',
              }}
            >
              <XCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Cancel Message */}
          <h1 className="cancel-title text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Payment Cancelled
            </span>
          </h1>
          <p className="cancel-subtitle text-xl text-white/60 mb-10">
            Your purchase of{' '}
            <span className="font-semibold text-orange-400">{agentName}</span>{' '}
            was not completed
          </p>

          {/* Info Card */}
          <div 
            className="info-card p-8 rounded-2xl mb-10"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <p className="text-white/80 mb-4">
              Don&apos;t worry! No charges were made to your account.
            </p>
            <p className="text-white/50 text-sm">
              You can try again anytime or explore our other agents.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href={`/subscribe?agent=${encodeURIComponent(agentName)}`}
              className="action-btn group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)',
              }}
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/agents"
              className="action-btn inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 hover:bg-white/5"
            >
              <Users className="w-5 h-5" />
              Browse All Agents
            </Link>
          </div>

          {/* Help Box */}
          <div 
            className="help-box p-6 rounded-2xl text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))',
              border: '1px solid rgba(6, 182, 212, 0.2)',
            }}
          >
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              Need Help?
            </h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  Having payment issues?{' '}
                  <Link href="/support" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                    Contact Support
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  Want to learn more about plans?{' '}
                  <Link href="/pricing" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                    View Pricing
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  Questions about pricing? Check our{' '}
                  <Link href="/support/faqs" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                    FAQ
                  </Link>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
