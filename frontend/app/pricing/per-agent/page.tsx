'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import { Sparkles, Check, Crown, Zap, Clock, Shield, MessageSquare, ArrowRight, Star, Bot, ChevronDown, ChevronUp, Users, Gift, Brain, Palette, Code, Heart, Briefcase, Music } from 'lucide-react';

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
    description: 'Perfect for trying out an agent',
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
    description: 'Most popular choice',
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
    description: 'Best value for dedicated users',
  },
];

const agentCategories = [
  { name: 'AI Assistants', icon: Brain, color: 'text-purple-400', count: 12 },
  { name: 'Creative', icon: Palette, color: 'text-pink-400', count: 8 },
  { name: 'Technical', icon: Code, color: 'text-cyan-400', count: 15 },
  { name: 'Wellness', icon: Heart, color: 'text-red-400', count: 6 },
  { name: 'Business', icon: Briefcase, color: 'text-amber-400', count: 10 },
  { name: 'Entertainment', icon: Music, color: 'text-emerald-400', count: 7 },
];

const faqs = [
  {
    q: 'How does per-agent pricing work?',
    a: 'Each agent has its own access period. When you purchase access to an agent, you get unlimited conversations with that specific agent for the chosen duration (1 day, 1 week, or 1 month).',
  },
  {
    q: 'Can I access multiple agents?',
    a: 'Yes! You can purchase access to as many agents as you like. Each agent subscription is independent, so you can mix and match durations based on your needs.',
  },
  {
    q: 'What if I don\'t like an agent?',
    a: 'We encourage you to try the 1-day access first if you\'re unsure. While we don\'t offer refunds, the low entry price of $1 allows you to test any agent before committing to longer durations.',
  },
  {
    q: 'Are there any limits on conversations?',
    a: 'No limits! During your access period, you can have as many conversations as you want. Message as much as you need - there are no hidden caps or throttling.',
  },
  {
    q: 'Can I gift agent access to someone?',
    a: 'This feature is coming soon! We\'re working on a gifting system that will let you purchase access codes for friends and family.',
  },
  {
    q: 'Do prices change based on the agent?',
    a: 'All agents use the same pricing structure. Whether you\'re accessing a creative writing agent or a technical coding assistant, the price is always $1/day, $5/week, or $15/month.',
  },
];

export default function PerAgentPricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('agentWiggle', { wiggles: 5, type: 'uniform' });
        gsap.registerPlugin(ScrollTrigger);

        // Floating bots animation
        gsap.fromTo('.floating-bot',
          { y: 30, opacity: 0, scale: 0 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' }
        );

        gsap.fromTo('.gradient-orb',
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' }
        );

        // ScrollTrigger for categories
        ScrollTrigger.batch('.category-card', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { y: 40, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // ScrollTrigger for features
        ScrollTrigger.batch('.feature-item', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { x: -30, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // ScrollTrigger for FAQs
        ScrollTrigger.batch('.faq-card', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
            );
          },
          start: 'top 90%',
          once: true
        });

      // Floating bots animation
      document.querySelectorAll('.floating-bot').forEach((bot, i) => {
        gsap.to(bot, {
          y: `random(-20, 20)`,
          x: `random(-15, 15)`,
          rotation: `random(-12, 12)`,
          duration: `random(4, 6)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3
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

      gsap.to('.gradient-orb-3', {
        x: 50,
        y: -50,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

        // Category card hover effects
        const cards = document.querySelectorAll('.category-card');
        cards.forEach(card => {
          card.addEventListener('mouseenter', () => {
            gsap.to(card, { scale: 1.03, y: -5, duration: 0.3, ease: 'power2.out' });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(card, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' });
          });
        });

        ScrollTrigger.refresh();
      }, containerRef);

      return () => ctx.revert();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleTierSelect = (index: number) => {
    setSelectedTier(index);
    gsap.to('.tier-option', {
      scale: 1,
      duration: 0.2
    });
    gsap.to(`.tier-option-${index}`, {
      scale: 1.02,
      duration: 0.3,
      ease: 'back.out(2)'
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-purple-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating bots */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-bot absolute top-24 left-[10%]">
          <div className="w-14 h-14 rounded-xl bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/20">
            <Bot className="w-7 h-7 text-purple-400" />
          </div>
        </div>
        <div className="floating-bot absolute top-40 right-[12%]">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/20">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <div className="floating-bot absolute bottom-48 left-[12%]">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
            <Star className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div className="floating-bot absolute bottom-32 right-[8%]">
          <div className="w-10 h-10 rounded-lg bg-pink-500/10 backdrop-blur-sm flex items-center justify-center border border-pink-500/20">
            <Crown className="w-5 h-5 text-pink-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Pay Per Agent, No Subscriptions</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Per-Agent Pricing
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Every agent uses the same simple pricing. Pick your duration and
              <span className="text-emerald-400"> get unlimited access.</span>
            </p>
          </div>
        </section>

        {/* Tier Selector */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg" />
              
              <div className="grid md:grid-cols-3 gap-3">
                {pricingTiers.map((tier, index) => (
                  <button
                    key={index}
                    onClick={() => handleTierSelect(index)}
                    className={`tier-option tier-option-${index} relative p-6 rounded-xl transition-all overflow-hidden ${
                      selectedTier === index
                        ? `bg-gradient-to-br ${tier.gradient} shadow-lg`
                        : 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-gray-900 rounded-b-lg text-xs font-bold">
                        POPULAR
                      </div>
                    )}
                    {selectedTier === index && (
                      <>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/30 rounded-tr" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/30 rounded-bl" />
                      </>
                    )}
                    <div className={`text-2xl font-bold ${selectedTier === index ? 'text-white' : 'text-gray-300'}`}>
                      {tier.price}
                    </div>
                    <div className={`text-sm ${selectedTier === index ? 'text-white/80' : 'text-gray-500'}`}>
                      {tier.duration}
                    </div>
                    <div className={`text-xs mt-2 ${selectedTier === index ? 'text-white/70' : 'text-gray-600'}`}>
                      {tier.perDay}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-center text-gray-500 text-sm mt-4">
              {pricingTiers[selectedTier].description}
            </p>
          </div>
        </section>

        {/* Agent Categories */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Explore Agent Categories
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              All agents across every category use the same pricing. Browse our collection and find your perfect AI companion.
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentCategories.map((category, i) => (
                <Link
                  key={i}
                  href="/agents"
                  className="category-card group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden"
                >
                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gray-800/80 border border-gray-700/50 flex items-center justify-center`}>
                      <category.icon className={`w-7 h-7 ${category.color}`} />
                    </div>
                    <span className="text-gray-500 text-sm px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700/30">{category.count} agents</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{category.name}</h3>
                  <div className="flex items-center text-gray-500 text-sm group-hover:text-cyan-400 transition-colors">
                    Browse agents
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
              
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                What You Get With Every Agent
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: MessageSquare, title: 'Unlimited Conversations', desc: 'Chat as much as you want during your access period', color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' },
                  { icon: Zap, title: 'Priority Response Time', desc: 'Fast, reliable responses every time', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
                  { icon: Shield, title: 'Private & Secure', desc: 'Your conversations are encrypted and protected', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
                  { icon: Gift, title: 'No Auto-Renewal', desc: 'Pay once, no surprise charges', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
                  { icon: Users, title: 'Multi-Device Access', desc: 'Use on any device with your account', color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/30' },
                  { icon: Star, title: 'Full Capabilities', desc: 'Access all agent features and abilities', color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30' },
                ].map((feature, i) => (
                  <div key={i} className="feature-item flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
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
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="faq-card group relative rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-purple-500/30 overflow-hidden transition-colors"
                >
                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/20 group-hover:border-purple-500/40 rounded-tr-lg transition-colors" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-purple-500/20 group-hover:border-purple-500/40 rounded-bl-lg transition-colors" />
                  
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-6 flex items-center gap-4 text-left hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-lg">
                      {i === 0 ? '💰' : i === 1 ? '🤖' : i === 2 ? '🔄' : i === 3 ? '💬' : i === 4 ? '🎁' : '📊'}
                    </div>
                    <span className="font-bold text-white flex-1 group-hover:text-purple-300 transition-colors">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 pt-0 ml-14">
                      <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-12 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 text-center overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
              
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500/40 rounded-bl-lg" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Find Your Perfect AI Agent
                </h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  Browse our collection of specialized AI agents. Each one is designed to help you with specific tasks and goals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/agents"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105 group"
                  >
                    <Bot className="w-5 h-5 mr-2" />
                    Browse All Agents
                  </Link>
                  <Link
                    href="/pricing/overview"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white font-medium hover:bg-gray-700 hover:border-gray-600 transition-all group"
                  >
                    View Pricing Overview
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
