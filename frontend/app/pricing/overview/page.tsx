'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Check, ArrowRight, Zap, Shield, Clock, Star, HelpCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function PricingOverview() {
  const containerRef = useRef<HTMLDivElement>(null);

  const plans = [
    {
      name: 'Daily',
      price: '$1',
      period: '/day',
      description: 'Perfect for short-term projects or trying out agents',
      features: [
        'Access to any single agent',
        'Unlimited conversations',
        'Real-time responses',
        'Voice interaction (if supported)',
        'Cancel anytime',
      ],
      cta: 'Choose Agent',
      href: '/agents',
      gradient: 'from-blue-500 to-cyan-500',
      accent: '#00d4ff',
    },
    {
      name: 'Weekly',
      price: '$5',
      period: '/week',
      description: 'Great value for regular use and projects',
      features: [
        'Access to any single agent',
        'Unlimited conversations',
        'Real-time responses',
        'Voice interaction (if supported)',
        'Cancel anytime',
        'Save 29% vs daily',
      ],
      cta: 'Choose Agent',
      href: '/agents',
      popular: true,
      gradient: 'from-purple-500 to-pink-500',
      accent: '#a855f7',
    },
    {
      name: 'Monthly',
      price: '$15',
      period: '/month',
      description: 'Best value for ongoing work and long-term projects',
      features: [
        'Access to any single agent',
        'Unlimited conversations',
        'Real-time responses',
        'Voice interaction (if supported)',
        'Cancel anytime',
        'Save 37% vs daily',
        'Best value',
      ],
      cta: 'Choose Agent',
      href: '/agents',
      gradient: 'from-emerald-500 to-teal-500',
      accent: '#10b981',
    },
  ];

  const faqs = [
    {
      q: 'How does per-agent pricing work?',
      a: 'Each purchase gives you unlimited access to one AI agent for your chosen period. You can subscribe to multiple agents if needed.',
    },
    {
      q: 'Is there auto-renewal?',
      a: 'No! We don\'t do auto-renewal. Pay only when you want access - simple and transparent.',
    },
    {
      q: 'Can I switch agents?',
      a: 'Your subscription is tied to the specific agent. To use a different agent, you\'ll need a separate subscription.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards, debit cards, and digital wallets through our secure Stripe payment system.',
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

    gsap.from('.plan-card', {
      scrollTrigger: {
        trigger: '.plans-grid',
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
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">No Auto-Renewal • Pay As You Go</span>
          </div>

          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h1>

          <p className="hero-subtitle text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
            Simple per-agent pricing. Each purchase gives you unlimited access
            to one AI agent for your chosen period. No auto-renewal—pay only
            when you want access.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="plans-grid relative py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={plan.name}
                className={`plan-card relative p-8 rounded-3xl transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'lg:scale-105 z-10' : ''
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: plan.popular 
                    ? `2px solid ${plan.accent}` 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: plan.popular ? `0 0 40px ${plan.accent}30` : 'none',
                }}
              >
                {plan.popular && (
                  <div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${plan.accent}, #ec4899)` }}
                  >
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-8">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${plan.accent}20, ${plan.accent}10)` }}
                  >
                    {idx === 0 && <Clock className="w-8 h-8" style={{ color: plan.accent }} />}
                    {idx === 1 && <Star className="w-8 h-8" style={{ color: plan.accent }} />}
                    {idx === 2 && <Shield className="w-8 h-8" style={{ color: plan.accent }} />}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/50">{plan.period}</span>
                  </div>
                  
                  <p className="text-sm text-white/40 mb-2">per agent</p>
                  <p className="text-white/60">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${plan.accent}20` }}
                      >
                        <Check className="w-3 h-3" style={{ color: plan.accent }} />
                      </div>
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className="block w-full text-center py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: plan.popular 
                      ? `linear-gradient(135deg, ${plan.accent}, #ec4899)` 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    boxShadow: plan.popular ? `0 0 20px ${plan.accent}40` : 'none',
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Row */}
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Instant Access', desc: 'Start immediately after payment' },
              { icon: Shield, title: 'No Auto-Renewal', desc: 'Pay only when you want' },
              { icon: Clock, title: 'Flexible Plans', desc: 'Daily, weekly, or monthly' },
            ].map((item, idx) => (
              <div 
                key={item.title}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <p className="text-sm text-white/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section relative py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="faq-item p-6 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-white/60">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="p-8 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(6, 182, 212, 0.15))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Need a Custom Solution?</h2>
            <p className="text-white/60 mb-6">
              Have specific requirements? Our team is here to help you find the perfect plan.
            </p>
            <Link
              href="/support/contact-us"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
              }}
            >
              Contact Sales Team
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
