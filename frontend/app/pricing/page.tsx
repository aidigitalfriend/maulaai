'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, CreditCard, Zap, ArrowRight, Check, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.hero-badge', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out',
    })
      .from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.4')
      .from('.hero-cta', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power3.out',
      }, '-=0.3');

    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '.features-section',
        start: 'top 80%',
      },
      opacity: 0,
      y: 40,
      stagger: 0.15,
      duration: 0.7,
      ease: 'power3.out',
    });

    gsap.from('.quick-plan', {
      scrollTrigger: {
        trigger: '.plans-section',
        start: 'top 80%',
      },
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out',
    });
  }, { scope: containerRef });

  const features = [
    {
      icon: CreditCard,
      title: 'No Hidden Fees',
      description: 'Transparent pricing - what you see is what you pay',
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Start using AI agents immediately after purchase',
    },
    {
      icon: Star,
      title: 'Premium Quality',
      description: 'Access to top-tier AI models and capabilities',
    },
  ];

  const quickPlans = [
    { period: 'Daily', price: '$1', desc: 'Try it out' },
    { period: 'Weekly', price: '$5', desc: 'Best value', popular: true },
    { period: 'Monthly', price: '$15', desc: 'Save 37%' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Simple, Transparent Pricing</span>
          </div>

          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Pricing Plans
            </span>
          </h1>

          <p className="hero-subtitle text-xl text-white/60 leading-relaxed mb-10 max-w-2xl mx-auto">
            Choose the perfect plan for your AI agent needs. Transparent pricing with no hidden fees.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing/overview"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4))',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)',
              }}
            >
              View All Plans
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/agents"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 hover:bg-white/5"
            >
              Explore Agents
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Plans Preview */}
      <section className="plans-section relative py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickPlans.map((plan, idx) => (
              <div
                key={plan.period}
                className={`quick-plan relative p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-purple-500/50' : ''
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white/80 mb-2">{plan.period}</h3>
                  <div className="text-4xl font-bold text-white mb-1">{plan.price}</div>
                  <p className="text-sm text-white/50">{plan.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Why Choose Our Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="feature-card p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="p-8 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(6, 182, 212, 0.15))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white/60 mb-6">
              Choose your plan and start using AI agents today
            </p>
            <Link
              href="/pricing/overview"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
              }}
            >
              <Check className="w-5 h-5" />
              View All Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}