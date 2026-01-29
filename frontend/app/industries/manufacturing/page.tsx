'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';


export default function ManufacturingIndustry() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: '🔧',
      title: 'Predictive Maintenance',
      description: 'AI-powered systems monitor equipment health in real-time, predicting failures before they occur to minimize downtime.',
      benefits: ['Failure Prediction', 'Cost Reduction', 'Uptime Optimization']
    },
    {
      icon: '✅',
      title: 'Quality Control',
      description: 'Computer vision and AI inspection systems detect defects with superhuman accuracy, ensuring consistent product quality.',
      benefits: ['Defect Detection', 'Real-time QC', 'Zero-defect Goals']
    },
    {
      icon: '📋',
      title: 'Production Planning',
      description: 'Intelligent scheduling and resource allocation optimize production workflows for maximum efficiency and throughput.',
      benefits: ['Smart Scheduling', 'Resource Optimization', 'Demand Forecasting']
    },
    {
      icon: '🚚',
      title: 'Supply Chain AI',
      description: 'End-to-end supply chain visibility and optimization powered by AI for better inventory and logistics management.',
      benefits: ['Inventory Optimization', 'Logistics AI', 'Supplier Management']
    }
  ];

  const stats = [
    { value: '30%', label: 'Less Downtime' },
    { value: '25%', label: 'Cost Savings' },
    { value: '40%', label: 'Faster QC' },
    { value: '99.5%', label: 'Defect Detection' }
  ];

  const applications = [
    { title: 'Machine Monitoring', desc: 'Real-time equipment health tracking' },
    { title: 'Defect Detection', desc: 'AI-powered visual inspection' },
    { title: 'Demand Forecasting', desc: 'Predictive production planning' },
    { title: 'Worker Safety', desc: 'AI monitoring for safety compliance' },
    { title: 'Energy Management', desc: 'Optimize energy consumption' },
    { title: 'Inventory Control', desc: 'Smart inventory management' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 85, opacity: 0, rotateZ: -5 });
      gsap.set(heroSub.words, { y: 28, opacity: 0 });
      gsap.set('.hero-badge', { scale: 0.7, opacity: 0, rotation: -10 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-badge', { scale: 1, opacity: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.7)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateZ: 0, duration: 0.6, stagger: 0.022 }, '-=0.25')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.48, stagger: 0.02 }, '-=0.28');

      // 2. ScrambleText on stat values
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(el, { duration: 1.1, scrambleText: { text: originalText, chars: '0123456789.%', speed: 0.42 }, delay: i * 0.11 });
          }
        });
      });

      // 3. ScrollTrigger batch for feature cards
      gsap.set('.feature-card', { y: 58, opacity: 0, scale: 0.93 });
      ScrollTrigger.batch('.feature-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.62, stagger: 0.11, ease: 'back.out(1.35)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 58, opacity: 0, scale: 0.93, duration: 0.3 })
      });

      // 4. Flip for stats
      gsap.set('.stat-card', { opacity: 0, rotateX: 45 });
      ScrollTrigger.create({
        trigger: '.stats-section',
        start: 'top 85%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.stat-card').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, rotateX: 0 });
            Flip.from(state, { duration: 0.55, delay: i * 0.1, ease: 'power3.out' });
          });
        }
      });

      // 5. Observer parallax
      Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const scrollY = self.scrollY;
          gsap.to('.parallax-orb-1', { y: scrollY * 0.11, duration: 0.42, ease: 'none' });
          gsap.to('.parallax-orb-2', { y: scrollY * -0.09, duration: 0.42, ease: 'none' });
          gsap.to('.parallax-orb-3', { y: scrollY * 0.07, duration: 0.42, ease: 'none' });
        }
      });

      // 6. MotionPath for orbiting gear
      gsap.to('.orbit-gear', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 55, y: -28 }, { x: 110, y: 0 }, { x: 55, y: 28 }, { x: 0, y: 0 }],
          curviness: 1.6,
        },
        duration: 14,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on CTA buttons
      gsap.utils.toArray<HTMLElement>('.cta-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.055, duration: 0.38, ease: 'manufWiggle' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.28 });
        });
      });

      // 8. DrawSVG production line
      gsap.set('.production-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.features-section',
        start: 'top 82%',
        onEnter: () => gsap.to('.production-line', { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut' })
      });

      // 9. Draggable application cards
      if (window.innerWidth > 768) {
        Draggable.create('.app-card', {
          type: 'x,y',
          bounds: containerRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.52, ease: 'elastic.out(1, 0.55)' });
          }
        });
      }

      // 10. Floating industrial particles
      gsap.utils.toArray<HTMLElement>('.industrial-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-52, 52)`,
          y: `random(-42, 42)`,
          rotation: `random(-90, 90)`,
          duration: `random(8, 12)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.17
        });
      });

      // 11. Benefit tags stagger
      gsap.set('.benefit-tag', { x: -14, opacity: 0 });
      ScrollTrigger.batch('.benefit-tag', {
        start: 'top 92%',
        onEnter: (batch) => gsap.to(batch, { x: 0, opacity: 1, duration: 0.26, stagger: 0.038, ease: 'power2.out' })
      });

      // 12. Feature icon rotation
      gsap.utils.toArray<HTMLElement>('.feature-icon').forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.25, rotation: 180, duration: 0.4, ease: 'back.out(1.5)' });
        });
        icon.addEventListener('mouseleave', () => {
          gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3 });
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-orb-1 absolute top-1/4 left-1/5 w-[530px] h-[530px] bg-orange-500/15 rounded-full blur-[135px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-amber-500/12 rounded-full blur-[118px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[370px] h-[370px] bg-yellow-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.08) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="industrial-particle absolute w-2 h-2 bg-orange-400/25 rounded-full" style={{ left: `${10 + i * 8}%`, top: `${13 + (i % 5) * 16}%` }} />
        ))}
        <div className="orbit-gear absolute top-36 right-1/4 w-3 h-3 bg-amber-400/55 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Link href="/industries" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            ← Back to Industries
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur-sm rounded-full border border-orange-500/30 mb-6">
            <span className="text-xl">🏭</span>
            <span className="font-medium text-orange-300">Manufacturing Solutions</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Manufacturing AI</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Smart factory solutions powered by AI for predictive maintenance, quality control, and production optimization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support/book-consultation" className="cta-btn px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all">
              Request Factory Demo
            </Link>
            <Link href="/resources/case-studies" className="cta-btn px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
              View Case Studies
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center">
              <div className="stat-value text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* SVG Production Line */}
          <svg className="absolute left-1/2 -translate-x-1/2 -top-4 h-2 w-2/3 opacity-30" preserveAspectRatio="none">
            <line className="production-line" x1="0" y1="5" x2="100%" y2="5" stroke="url(#manufGrad)" strokeWidth="3" />
            <defs>
              <linearGradient id="manufGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Smart Factory Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-orange-500/50 transition-all">
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-orange-500/30 rounded-tr-lg" />
                <div className="feature-icon text-5xl mb-4 inline-block cursor-pointer">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.benefits.map((benefit, i) => (
                    <span key={i} className="benefit-tag text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Applications */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Industrial Applications</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {applications.map((app, idx) => (
              <div key={idx} className="app-card p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-orange-500/40 transition-all cursor-grab active:cursor-grabbing">
                <h3 className="font-semibold text-white mb-1">{app.title}</h3>
                <p className="text-gray-400 text-xs">{app.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-orange-900/30 to-amber-900/30 border border-orange-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Manufacturing?</h2>
              <p className="text-gray-400 mb-8 text-lg">Join industry leaders using Maula AI to optimize production and reduce costs.</p>
              <Link href="/support/book-consultation" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all">
                🏭 Book Factory Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
