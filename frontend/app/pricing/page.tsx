'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import { Sparkles, ArrowRight, Zap, Users, Clock, Crown, Gift, Shield, ChevronRight } from 'lucide-react';

export default function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('priceWiggle', { wiggles: 5, type: 'uniform' });
        gsap.registerPlugin(ScrollTrigger);

        // Floating icons animation
        gsap.fromTo('.floating-icon',
          { y: 30, opacity: 0, scale: 0 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' }
        );

        gsap.fromTo('.gradient-orb',
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' }
        );

        // Floating icons continuous animation
        document.querySelectorAll('.floating-icon').forEach((icon, i) => {
          gsap.to(icon, {
            y: `random(-15, 15)`,
            x: `random(-10, 10)`,
            rotation: `random(-10, 10)`,
            duration: `random(3, 5)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2
          });
        });

        // Gradient orbs floating
        gsap.to('.gradient-orb-1', {
          x: 80,
          y: -60,
          duration: 15,
          repeat: -1,
          yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-2', {
        x: -70,
        y: 80,
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-3', {
        x: 50,
        y: 50,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Card hover effects
      const cards = document.querySelectorAll('.pricing-option');
      cards.forEach(card => {
        const glow = card.querySelector('.card-glow');
        const icon = card.querySelector('.card-icon');
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { scale: 1.02, y: -8, duration: 0.4, ease: 'power2.out' });
          if (glow) gsap.to(glow, { opacity: 1, duration: 0.3 });
          if (icon) gsap.to(icon, { scale: 1.1, rotate: 10, duration: 0.3, ease: 'back.out(2)' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
          if (glow) gsap.to(glow, { opacity: 0, duration: 0.3 });
          if (icon) gsap.to(icon, { scale: 1, rotate: 0, duration: 0.3, ease: 'power2.out' });
        });
      });

      ScrollTrigger.refresh();
      }, containerRef);

      return () => ctx.revert();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-purple-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-20 left-[10%]">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/20">
            <Crown className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-32 right-[15%]">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/20">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-40 left-[15%]">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
            <Gift className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-32 right-[10%]">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 backdrop-blur-sm flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Simple, Transparent Pricing</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-white">
              Pay Per Agent
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Access premium AI agents with flexible pricing. No subscriptions, no hidden fees.
              <span className="text-cyan-400"> Pay only for what you use.</span>
            </p>
          </div>
        </section>

        {/* Pricing Options */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Overview Option */}
            <Link href="/pricing/overview" className="pricing-option group relative block">
              <div className="card-glow absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl opacity-0 blur-xl transition-opacity duration-500" />
              <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-cyan-500/50 transition-colors overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                
                <div className="card-icon w-16 h-16 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">Pricing Overview</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Compare all pricing tiers and find the perfect plan for your needs. Daily, weekly, and monthly options available.
                </p>
                <div className="flex items-center text-cyan-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                  View All Plans
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Per-Agent Option */}
            <Link href="/pricing/per-agent" className="pricing-option group relative block">
              <div className="card-glow absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl opacity-0 blur-xl transition-opacity duration-500" />
              <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-emerald-500/50 transition-colors overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-lg" />
                
                <div className="card-icon w-16 h-16 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">Per-Agent Pricing</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Get detailed pricing for each agent. Choose exactly what you need and only pay for what you use.
                </p>
                <div className="flex items-center text-emerald-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                  Explore Agents
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Quick Price Highlights */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg" />
              
              <h3 className="text-xl font-bold text-white text-center mb-8">Quick Price Reference</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="relative text-center p-6 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 overflow-hidden">
                  <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-cyan-500/30 rounded-tr" />
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">$1</div>
                  <div className="text-gray-400 text-sm">per day</div>
                </div>
                <div className="relative text-center p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-900/20 border border-purple-500/30 overflow-hidden">
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-lg text-xs font-bold text-white">POPULAR</div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-purple-500/50 rounded-tr" />
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3 mt-2">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">$5</div>
                  <div className="text-gray-400 text-sm">per week</div>
                </div>
                <div className="relative text-center p-6 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 overflow-hidden">
                  <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-emerald-500/30 rounded-tr" />
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">$15</div>
                  <div className="text-gray-400 text-sm">per month</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-6">
              <div className="trust-badge flex items-center gap-3 px-5 py-3 rounded-full bg-gray-900/50 border border-gray-800">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300 text-sm">Secure Payments</span>
              </div>
              <div className="trust-badge flex items-center gap-3 px-5 py-3 rounded-full bg-gray-900/50 border border-gray-800">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-gray-300 text-sm">Instant Access</span>
              </div>
              <div className="trust-badge flex items-center gap-3 px-5 py-3 rounded-full bg-gray-900/50 border border-gray-800">
                <Gift className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 text-sm">No Subscriptions</span>
              </div>
              <div className="trust-badge flex items-center gap-3 px-5 py-3 rounded-full bg-gray-900/50 border border-gray-800">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-300 text-sm">Premium Agents</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-10 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 text-center overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
              
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500/40 rounded-bl-lg" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                  Browse our collection of AI agents and find the perfect one for your needs.
                </p>
                <Link
                  href="/agents"
                  className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105 group"
                >
                  Browse All Agents
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
