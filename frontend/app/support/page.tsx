'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';

export default function SupportPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const supportOptions = [
    {
      title: 'Help Center',
      description: 'Browse our comprehensive knowledge base and documentation',
      icon: '📚',
      href: '/support/help-center',
      color: 'from-blue-500 to-cyan-500',
      features: ['Documentation', 'Tutorials', 'Guides']
    },
    {
      title: 'FAQs',
      description: 'Find answers to frequently asked questions',
      icon: '❓',
      href: '/support/faqs',
      color: 'from-purple-500 to-pink-500',
      features: ['Common Questions', 'Quick Answers', 'Troubleshooting']
    },
    {
      title: 'Live Support',
      description: 'Chat with our AI assistant Luna for real-time help',
      icon: '💬',
      href: '/support/live-support',
      color: 'from-green-500 to-emerald-500',
      features: ['24/7 Available', 'Instant Response', 'AI Powered']
    },
    {
      title: 'Create Ticket',
      description: 'Submit a detailed support ticket for complex issues',
      icon: '🎫',
      href: '/support/create-ticket',
      color: 'from-orange-500 to-red-500',
      features: ['Priority Support', 'Issue Tracking', 'Human Response']
    },
    {
      title: 'Contact Us',
      description: 'Send us a direct message for general inquiries',
      icon: '📧',
      href: '/support/contact-us',
      color: 'from-indigo-500 to-violet-500',
      features: ['Email Support', 'Direct Contact', 'Fast Response']
    },
    {
      title: 'Book Consultation',
      description: 'Schedule a one-on-one call with our experts',
      icon: '📅',
      href: '/support/book-consultation',
      color: 'from-teal-500 to-cyan-500',
      features: ['Expert Advice', 'Personalized', '30-min Sessions']
    }
  ];

  const stats = [
    { value: 99, suffix: '%', label: 'Satisfaction Rate' },
    { value: 2, suffix: 'hrs', label: 'Avg Response Time' },
    { value: 24, suffix: '/7', label: 'Live Support' },
    { value: 50, suffix: 'K+', label: 'Issues Resolved' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('supportWiggle', { wiggles: 6, type: 'uniform' });
        gsap.registerPlugin(ScrollTrigger);

        // Hero gradient orbs
        gsap.fromTo('.hero-orb',
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 0.4, duration: 2, ease: 'elastic.out(1, 0.5)', stagger: 0.3 }
        );

        // Stats counter animation
        gsap.utils.toArray('.stat-counter').forEach((stat: any) => {
          const target = parseInt(stat.dataset.target);
          gsap.from(stat, {
            textContent: 0,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: stat,
              start: 'top 85%',
              once: true
            },
            onUpdate: function() {
              stat.textContent = Math.ceil(parseFloat(stat.textContent));
            }
          });
        });

        // Support cards animation
        ScrollTrigger.batch('.support-card', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { y: 40, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // Card hover effects
        const cards = document.querySelectorAll('.support-card');
        cards.forEach(card => {
          const icon = card.querySelector('.card-icon');
          card.addEventListener('mouseenter', () => {
            gsap.to(icon, { rotation: 15, scale: 1.1, duration: 0.3 });
            gsap.to(card, { y: -8, duration: 0.3 });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(icon, { rotation: 0, scale: 1, duration: 0.3 });
            gsap.to(card, { y: 0, duration: 0.3 });
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
        <div className="hero-orb absolute top-20 left-1/4 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[150px]" />
        <div className="hero-orb absolute bottom-40 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8">
            <span className="text-lg">🎧</span>
            <span className="text-sm font-medium text-purple-300">We're Here to Help</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Support Center
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
            Get help, contact support, book consultations, and find answers to
            <span className="text-purple-400"> all your questions.</span>
          </p>

          <Link href="/support/help-center" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105">
            <span>Get Support</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="group relative text-center p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                
                <div className="text-4xl md:text-5xl font-bold text-white">
                  <span className="stat-counter" data-target={stat.value}>{stat.value}</span>
                  <span className="text-purple-400">{stat.suffix}</span>
                </div>
                <p className="text-gray-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            How Can We Help You?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportOptions.map((option, i) => (
              <Link
                key={i}
                href={option.href}
                className="support-card group relative block p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-purple-500/50 transition-all overflow-hidden"
              >
                {/* Corner accents */}
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={`card-icon w-16 h-16 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center text-3xl mb-4`}>
                  {option.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {option.title}
                </h3>
                <p className="text-gray-400 mb-4">{option.description}</p>
                <div className="flex flex-wrap gap-2">
                  {option.features.map((feature, fi) => (
                    <span key={fi} className="feature-tag px-3 py-1 text-xs bg-gray-800/80 border border-gray-700/50 rounded-full text-gray-300">
                      {feature}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Support Banner */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-red-500/30 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10" />
            
            {/* Corner accents */}
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-red-500/40 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-orange-500/40 rounded-bl-lg" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-3xl">
                  🚨
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Need Urgent Help?</h3>
                  <p className="text-gray-400">For critical issues, use our priority support channel</p>
                </div>
              </div>
              <Link
                href="/support/create-ticket?priority=critical"
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl font-semibold transition-all whitespace-nowrap hover:scale-105"
              >
                Create Urgent Ticket
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
