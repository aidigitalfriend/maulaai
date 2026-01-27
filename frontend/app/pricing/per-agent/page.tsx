'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock, Star, Shield, Check, HelpCircle, Users, Mail, Sparkles, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function PerAgentPricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const pricingOptions = [
    {
      name: 'Daily Access',
      description: 'Perfect for short-term projects or trying out agents',
      price: '$1',
      period: 'per day',
      features: [
        'Access to any single agent',
        'Unlimited conversations',
        'Real-time responses',
        'Voice interaction (if supported)',
        'No auto-renewal',
        'Cancel anytime',
      ],
      gradient: 'from-blue-500 to-cyan-500',
      accent: '#00d4ff',
      icon: Clock,
    },
    {
      name: 'Weekly Access',
      description: 'Great value for regular use and projects',
      price: '$5',
      period: 'per week',
      features: [
        'Access to any single agent',
        'Unlimited conversations',
        'Real-time responses',
        'Voice interaction (if supported)',
        'No auto-renewal',
        'Cancel anytime',
        'Save 29% vs daily',
      ],
      gradient: 'from-purple-500 to-pink-500',
      accent: '#a855f7',
      icon: Star,
      recommended: true,
    },
    {
      name: 'Monthly Access',
      description: 'Best value for ongoing work and long-term projects',
      price: '$15',
      period: 'per month',
      features: [
        'Access to any single agent',
        'Unlimited conversations',
        'Real-time responses',
        'Voice interaction (if supported)',
        'No auto-renewal',
        'Cancel anytime',
        'Save 37% vs daily',
        'Best value for extended use',
      ],
      gradient: 'from-amber-500 to-orange-500',
      accent: '#f59e0b',
      icon: Shield,
    },
  ];

  const faqs = [
    {
      q: 'Can I change plans anytime?',
      a: 'Yes! Since each purchase is one-time with no auto-renewal, simply choose a different plan when you repurchase.',
    },
    {
      q: 'Do you offer enterprise plans?',
      a: 'Yes! Contact our sales team for custom enterprise pricing, volume discounts, and dedicated support.',
    },
    {
      q: 'Is there a free trial?',
      a: "No, we don't offer free trials. All agent access requires payment starting at $1/day.",
    },
    {
      q: 'Will I be charged automatically?',
      a: 'No! There is NO auto-renewal. Each purchase is one-time only.',
    },
  ];

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
      }, '-=0.4');

    gsap.from('.pricing-card', {
      scrollTrigger: {
        trigger: '.pricing-grid',
        start: 'top 80%',
      },
      opacity: 0,
      y: 50,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out',
    });

    gsap.from('.faq-item', {
      scrollTrigger: {
        trigger: '.faq-section',
        start: 'top 80%',
      },
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Transparent Pricing</span>
          </div>

          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Simple Per-Agent Pricing
            </span>
          </h1>

          <p className="hero-subtitle text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
            All agents use the same transparent pricing. No hidden fees. Choose your billing cycle.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-grid relative py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingOptions.map((tier, i) => (
              <div
                key={tier.name}
                className={`pricing-card relative rounded-3xl transition-all duration-300 hover:scale-[1.02] ${
                  tier.recommended ? 'md:scale-105 z-10' : ''
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: tier.recommended 
                    ? `2px solid ${tier.accent}` 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: tier.recommended ? `0 0 40px ${tier.accent}30` : 'none',
                }}
              >
                {tier.recommended && (
                  <div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${tier.accent}, #ec4899)` }}
                  >
                    MOST POPULAR
                  </div>
                )}

                {/* Header */}
                <div 
                  className="p-6 rounded-t-3xl"
                  style={{ background: `linear-gradient(135deg, ${tier.accent}20, ${tier.accent}10)` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${tier.accent}30` }}
                    >
                      <tier.icon className="w-5 h-5" style={{ color: tier.accent }} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                  </div>
                  <p className="text-white/60 text-sm">{tier.description}</p>
                </div>

                {/* Body */}
                <div className="p-8">
                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-white/40 text-sm mb-1">Starting at</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">{tier.price}</span>
                      <span className="text-white/50">/{tier.period.split(' ')[1]}</span>
                    </div>
                  </div>

                  {/* Per-Agent Info */}
                  <div 
                    className="p-4 rounded-xl mb-6"
                    style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    <p className="text-xs text-white/40 mb-1">Pricing Structure</p>
                    <p className="text-lg font-semibold text-white">One Agent at a Time</p>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <p className="text-sm font-semibold text-white mb-3">Features:</p>
                    <ul className="space-y-3">
                      {tier.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-white/60">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: `${tier.accent}20` }}
                          >
                            <Check className="w-3 h-3" style={{ color: tier.accent }} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/agents"
                    className="block w-full text-center py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: tier.recommended 
                        ? `linear-gradient(135deg, ${tier.accent}, #ec4899)` 
                        : 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      boxShadow: tier.recommended ? `0 0 20px ${tier.accent}40` : 'none',
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section relative py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-white/50">Everything you need to know about our pricing</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="faq-item p-6 rounded-2xl transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  {faq.q}
                </h3>
                <p className="text-white/60 text-sm pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className="p-10 rounded-3xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
              Choose your plan and start building amazing AI experiences today. Browse our collection of specialized AI agents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/agents"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
                }}
              >
                <Users className="w-5 h-5" />
                Browse Agents
              </Link>
              <Link
                href="/support/contact-us"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                <Mail className="w-5 h-5" />
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
