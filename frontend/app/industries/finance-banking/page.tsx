'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';


export default function FinanceBankingIndustry() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: '🛡️',
      title: 'Fraud Detection',
      description: 'Advanced AI algorithms detect suspicious activities in real-time, protecting both institutions and customers from fraudulent transactions.',
      benefits: ['Real-time Detection', 'Pattern Analysis', 'Automated Alerts']
    },
    {
      icon: '📊',
      title: 'Risk Assessment',
      description: 'Comprehensive risk modeling and credit scoring powered by machine learning for more accurate lending decisions.',
      benefits: ['Credit Scoring', 'Portfolio Analysis', 'Regulatory Compliance']
    },
    {
      icon: '🎯',
      title: 'Customer Analytics',
      description: 'Deep insights into customer behavior, preferences, and lifetime value to drive personalized financial products.',
      benefits: ['Behavior Analysis', 'Personalization', 'Retention Insights']
    },
    {
      icon: '📜',
      title: 'Compliance Automation',
      description: 'Automated compliance monitoring and reporting to meet regulatory requirements efficiently and accurately.',
      benefits: ['KYC/AML', 'Audit Trails', 'Report Generation']
    }
  ];

  const stats = [
    { value: '99.9%', label: 'Fraud Detection' },
    { value: '50%', label: 'Faster Processing' },
    { value: '80%', label: 'Cost Reduction' },
    { value: '$2B+', label: 'Protected Assets' }
  ];

  const services = [
    { title: 'Transaction Monitoring', desc: 'Real-time analysis of transactions' },
    { title: 'Credit Decisioning', desc: 'AI-powered lending decisions' },
    { title: 'Wealth Management', desc: 'Personalized investment advice' },
    { title: 'Customer Onboarding', desc: 'Streamlined KYC processes' },
    { title: 'Chatbot Banking', desc: '24/7 customer service AI' },
    { title: 'Document Processing', desc: 'Intelligent document analysis' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 70, opacity: 0, rotateY: 90 });
      gsap.set(heroSub.words, { y: 25, opacity: 0 });
      gsap.set('.hero-badge', { x: -50, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-badge', { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateY: 0, duration: 0.6, stagger: 0.025 }, '-=0.3')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.02 }, '-=0.2');

      // 2. ScrambleText stats
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(el, { duration: 1.2, scrambleText: { text: originalText, chars: '$0123456789%+B', speed: 0.4 }, delay: i * 0.12 });
          }
        });
      });

      // 3. ScrollTrigger batch features
      gsap.set('.feature-card', { y: 60, opacity: 0, scale: 0.92 });
      ScrollTrigger.batch('.feature-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.1, ease: 'back.out(1.3)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 60, opacity: 0, scale: 0.92, duration: 0.3 })
      });

      // 4. Flip for stat cards
      gsap.set('.stat-card', { opacity: 0, scale: 0.5 });
      ScrollTrigger.create({
        trigger: '.stats-grid',
        start: 'top 85%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.stat-card').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, scale: 1 });
            Flip.from(state, { duration: 0.5, delay: i * 0.08, ease: 'back.out(1.5)' });
          });
        }
      });

      // 5. Observer parallax
      Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const scrollY = self.scrollY;
          gsap.to('.parallax-orb-1', { y: scrollY * 0.1, duration: 0.4, ease: 'none' });
          gsap.to('.parallax-orb-2', { y: scrollY * -0.12, duration: 0.4, ease: 'none' });
          gsap.to('.parallax-orb-3', { y: scrollY * 0.08, duration: 0.4, ease: 'none' });
        }
      });

      // 6. MotionPath for orbiting coin
      gsap.to('.orbit-coin', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 60, y: -30 }, { x: 120, y: 0 }, { x: 60, y: 30 }, { x: 0, y: 0 }],
          curviness: 2,
        },
        duration: 14,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle buttons
      gsap.utils.toArray<HTMLElement>('.action-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.05, duration: 0.35, ease: 'financeWiggle' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.25 });
        });
      });

      // 8. DrawSVG chart line
      gsap.set('.chart-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.features-section',
        start: 'top 80%',
        onEnter: () => gsap.to('.chart-line', { drawSVG: '100%', duration: 1.5, ease: 'power3.inOut' })
      });

      // 9. Draggable service cards
      if (window.innerWidth > 768) {
        Draggable.create('.service-card', {
          type: 'x,y',
          bounds: containerRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
          }
        });
      }

      // 10. Floating money particles
      gsap.utils.toArray<HTMLElement>('.money-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-55, 55)`,
          y: `random(-45, 45)`,
          rotation: `random(-120, 120)`,
          duration: `random(8, 12)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.18
        });
      });

      // 11. Benefit tags animation
      gsap.set('.benefit-tag', { y: 10, opacity: 0 });
      ScrollTrigger.batch('.benefit-tag', {
        start: 'top 92%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out' })
      });

      // 12. Feature icon pulse
      gsap.utils.toArray<HTMLElement>('.feature-icon').forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.25, rotation: 5, duration: 0.3, ease: 'back.out(2)' });
        });
        icon.addEventListener('mouseleave', () => {
          gsap.to(icon, { scale: 1, rotation: 0, duration: 0.25 });
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-orb-1 absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[130px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-green-500/12 rounded-full blur-[120px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[380px] h-[380px] bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="money-particle absolute w-2 h-2 bg-emerald-400/25 rounded-full" style={{ left: `${8 + i * 9}%`, top: `${12 + (i % 5) * 16}%` }} />
        ))}
        <div className="orbit-coin absolute top-36 right-1/4 w-3 h-3 bg-green-400/60 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Link href="/industries" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            ← Back to Industries
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-full border border-emerald-500/30 mb-6">
            <span className="text-xl">🏦</span>
            <span className="font-medium text-emerald-300">Finance & Banking</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">Financial AI</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Secure, intelligent solutions for modern financial services—from fraud detection to personalized banking experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support/book-consultation" className="action-btn px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
              Request Enterprise Demo
            </Link>
            <Link href="/resources/case-studies" className="action-btn px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
              View Success Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto stats-grid grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center">
              <div className="stat-value text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* SVG Chart Line */}
          <svg className="absolute left-1/2 -translate-x-1/2 -top-4 h-8 w-2/3 opacity-30" viewBox="0 0 200 30" preserveAspectRatio="none">
            <polyline className="chart-line" fill="none" stroke="url(#financeGrad)" strokeWidth="2" points="0,25 30,20 60,15 90,18 120,8 150,12 180,5 200,10" />
            <defs>
              <linearGradient id="financeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Core Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all">
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-lg" />
                <div className="feature-icon text-5xl mb-4 inline-block cursor-pointer">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.benefits.map((benefit, i) => (
                    <span key={i} className="benefit-tag text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Financial Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((service, idx) => (
              <div key={idx} className="service-card p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-emerald-500/40 transition-all cursor-grab active:cursor-grabbing">
                <h3 className="font-semibold text-white mb-1">{service.title}</h3>
                <p className="text-gray-400 text-xs">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Finance?</h2>
              <p className="text-gray-400 mb-8 text-lg">Join leading financial institutions using Maula AI to drive innovation and security.</p>
              <Link href="/support/book-consultation" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
                🏦 Schedule Finance Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
