'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import { Sparkles, Check, Crown, Zap, Clock, Shield, MessageSquare, ArrowRight, Star, Infinity, Users, Gift } from 'lucide-react';

const pricingTiers = [
  {
    duration: '1 Day',
    price: '$1',
    perDay: '$1.00/day',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    bgGlow: 'bg-cyan-500/20',
    borderHover: 'hover:border-cyan-500/50',
    textColor: 'text-cyan-400',
    popular: false,
    features: [
      '24-hour full access',
      'Unlimited conversations',
      'All agent capabilities',
      'Priority response time',
      'No auto-renewal',
    ],
  },
  {
    duration: '1 Week',
    price: '$5',
    perDay: '$0.71/day',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    bgGlow: 'bg-purple-500/20',
    borderHover: 'hover:border-purple-500/50',
    textColor: 'text-purple-400',
    popular: true,
    features: [
      '7-day full access',
      'Unlimited conversations',
      'All agent capabilities',
      'Priority response time',
      'No auto-renewal',
      'Save 29%',
    ],
  },
  {
    duration: '1 Month',
    price: '$15',
    perDay: '$0.50/day',
    color: 'emerald',
    gradient: 'from-emerald-500 to-cyan-500',
    bgGlow: 'bg-emerald-500/20',
    borderHover: 'hover:border-emerald-500/50',
    textColor: 'text-emerald-400',
    popular: false,
    features: [
      '30-day full access',
      'Unlimited conversations',
      'All agent capabilities',
      'Priority response time',
      'No auto-renewal',
      'Save 50%',
    ],
  },
];

export default function PricingOverviewPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('tierWiggle', { wiggles: 6, type: 'uniform' });
        gsap.registerPlugin(ScrollTrigger);

        // Floating elements animation only
        gsap.fromTo('.floating-element',
          { y: 30, opacity: 0, scale: 0 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' }
        );

        gsap.fromTo('.gradient-orb',
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' }
        );

        // ScrollTrigger for comparison section
        ScrollTrigger.batch('.comparison-row', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { x: -50, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // ScrollTrigger for FAQ section
        ScrollTrigger.batch('.faq-item', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // Floating elements animation
        document.querySelectorAll('.floating-element').forEach((el, i) => {
          gsap.to(el, {
            y: `random(-15, 15)`,
            x: `random(-10, 10)`,
            rotation: `random(-8, 8)`,
            duration: `random(3, 5)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2
          });
        });

        // Gradient orbs animation
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

        // Card hover effects
      const cards = document.querySelectorAll('.pricing-card');
      cards.forEach(card => {
        const glow = card.querySelector('.card-glow');
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { scale: 1.02, y: -10, duration: 0.4, ease: 'power2.out' });
          if (glow) gsap.to(glow, { opacity: 1, duration: 0.3 });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
          if (glow) gsap.to(glow, { opacity: 0, duration: 0.3 });
        });
      });

      // Popular badge pulse
      gsap.to('.popular-badge', {
        scale: 1.05,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      ScrollTrigger.refresh();
      }, containerRef);

      return () => ctx.revert();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12] text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-element absolute top-24 left-[8%]">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/20">
            <Crown className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="floating-element absolute top-40 right-[12%]">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/20">
            <Star className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="floating-element absolute bottom-48 left-[12%]">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">All Plans Include Full Access</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Pricing Overview
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Simple per-agent pricing with no hidden fees. Choose your access duration and
              <span className="text-purple-400"> start chatting instantly.</span>
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`pricing-card relative group ${tier.popular ? 'md:-mt-4 md:mb-4' : ''}`}>
                {tier.popular && (
                  <div className="popular-badge absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-purple-500/30">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className={`card-glow absolute inset-0 bg-gradient-to-br ${tier.gradient} rounded-2xl opacity-0 blur-xl`} style={{ transform: 'scale(0.8)' }} />
                
                <div className={`relative h-full p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border ${tier.popular ? 'border-purple-500/50' : 'border-gray-700/50'} backdrop-blur-sm overflow-hidden transition-colors`}>
                  {/* Corner accents */}
                  <div className={`absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 ${tier.popular ? 'border-purple-500/50' : 'border-cyan-500/30'} rounded-tr-lg`} />
                  <div className={`absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 ${tier.popular ? 'border-purple-500/50' : 'border-cyan-500/30'} rounded-bl-lg`} />
                  
                  {/* Header */}
                  <div className="relative z-10 mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">{tier.duration}</h3>
                    <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${tier.gradient} bg-opacity-20 text-white text-xs font-semibold mt-2`}>
                      {tier.perDay}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="relative z-10 mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">{tier.price}</span>
                      <span className="text-gray-500">/{tier.duration.toLowerCase()}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="relative z-10 space-y-4 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="relative z-10 pt-4 border-t border-gray-700/50">
                    <Link
                      href="/agents"
                      className={`flex items-center justify-between w-full py-4 px-6 rounded-xl font-bold transition-all ${
                        tier.popular
                          ? `bg-gradient-to-r ${tier.gradient} text-white hover:shadow-lg hover:shadow-purple-500/25`
                          : 'bg-gray-800/80 text-white hover:bg-gray-700'
                      }`}
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What's Included */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Every Plan Includes
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: MessageSquare, title: 'Unlimited Chats', desc: 'No message limits', color: 'from-cyan-500 to-blue-500' },
                { icon: Zap, title: 'Fast Responses', desc: 'Priority processing', color: 'from-purple-500 to-pink-500' },
                { icon: Shield, title: 'Secure & Private', desc: 'End-to-end encrypted', color: 'from-emerald-500 to-teal-500' },
                { icon: Gift, title: 'No Subscriptions', desc: 'Pay as you go', color: 'from-amber-500 to-orange-500' },
              ].map((item, i) => (
                <div key={i} className="comparison-row group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center overflow-hidden hover:border-cyan-500/30 transition-all">
                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                  
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Is there a subscription or auto-renewal?',
                  a: 'No! We believe in transparent, simple pricing. You purchase access for a specific duration and it ends when the time is up. No hidden charges, no auto-renewals.',
                  icon: '🔄',
                },
                {
                  q: 'Can I use an agent across multiple devices?',
                  a: 'Yes! Your access is tied to your account, not your device. Log in from any device and continue your conversations.',
                  icon: '📱',
                },
                {
                  q: 'What happens when my access expires?',
                  a: 'Your chat history is preserved, but you won\'t be able to send new messages until you purchase more access. Simply buy more time when you\'re ready.',
                  icon: '⏰',
                },
                {
                  q: 'Can I upgrade my plan mid-duration?',
                  a: 'Currently, each purchase is separate. You can buy additional access at any time, and the durations will stack.',
                  icon: '⬆️',
                },
              ].map((faq, i) => (
                <div key={i} className="faq-item group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden hover:border-purple-500/30 transition-all">
                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 text-2xl border border-purple-500/20">
                      {faq.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{faq.q}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-10 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-50" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Start?
                </h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                  Browse our collection of AI agents and find your perfect match.
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
