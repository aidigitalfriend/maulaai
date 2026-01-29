'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';


export default function IndustriesOverview() {
  const containerRef = useRef<HTMLDivElement>(null);

  const industries = [
    {
      title: 'Healthcare',
      description: 'AI-powered solutions for patient care, diagnostics, and healthcare management',
      icon: '🏥',
      link: '/industries/healthcare',
      useCases: ['Patient Support', 'Medical Documentation', 'Appointment Scheduling'],
      color: 'red'
    },
    {
      title: 'Finance & Banking',
      description: 'Intelligent financial services, risk assessment, and customer support',
      icon: '🏦',
      link: '/industries/finance-banking',
      useCases: ['Customer Service', 'Risk Analysis', 'Fraud Detection'],
      color: 'green'
    },
    {
      title: 'Retail & E-commerce',
      description: 'Personalized shopping experiences and intelligent customer engagement',
      icon: '🛒',
      link: '/industries/retail-ecommerce',
      useCases: ['Product Recommendations', 'Customer Support', 'Inventory Management'],
      color: 'purple'
    },
    {
      title: 'Manufacturing',
      description: 'Smart manufacturing processes and predictive maintenance solutions',
      icon: '🏭',
      link: '/industries/manufacturing',
      useCases: ['Quality Control', 'Predictive Maintenance', 'Supply Chain Optimization'],
      color: 'orange'
    },
    {
      title: 'Technology',
      description: 'Advanced AI integration for tech companies and software development',
      icon: '💻',
      link: '/industries/technology',
      useCases: ['Code Review', 'Technical Support', 'Product Development'],
      color: 'blue'
    },
    {
      title: 'Education',
      description: 'Personalized learning experiences and educational support systems',
      icon: '🎓',
      link: '/industries/education',
      useCases: ['Personalized Tutoring', 'Administrative Support', 'Learning Analytics'],
      color: 'pink'
    }
  ];

  const benefits = [
    { icon: '⚡', title: 'Fast Deployment', desc: 'Get up and running in days, not months' },
    { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-grade security and compliance' },
    { icon: '📈', title: 'Proven ROI', desc: 'Measurable results and cost savings' },
    { icon: '🤝', title: 'Dedicated Support', desc: '24/7 expert assistance' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 100, opacity: 0, rotateX: -90 });
      gsap.set(heroSub.words, { y: 40, opacity: 0 });
      gsap.set('.hero-badge', { y: 30, opacity: 0, scale: 0.8 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-badge', { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.02 }, '-=0.3')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.02 }, '-=0.3');

      // 2. ScrambleText on industry titles
      gsap.utils.toArray<HTMLElement>('.industry-title').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(el, { duration: 0.8, scrambleText: { text: originalText, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: 0.4 }, delay: i * 0.05 });
          }
        });
      });

      // 3. ScrollTrigger for industry cards
      gsap.set('.industry-card', { y: 60, opacity: 0, scale: 0.95 });
      ScrollTrigger.batch('.industry-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: 'back.out(1.5)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 60, opacity: 0, scale: 0.95, duration: 0.3 })
      });

      // 4. Flip for benefit cards
      gsap.set('.benefit-card', { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: '.benefits-grid',
        start: 'top 80%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.benefit-card').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, y: 0 });
            Flip.from(state, { duration: 0.5, delay: i * 0.1, ease: 'power2.out' });
          });
        }
      });

      // 5. Observer for parallax
      Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const scrollY = self.scrollY;
          gsap.to('.parallax-orb-1', { y: scrollY * 0.15, duration: 0.4, ease: 'none' });
          gsap.to('.parallax-orb-2', { y: scrollY * -0.1, duration: 0.4, ease: 'none' });
          gsap.to('.parallax-orb-3', { y: scrollY * 0.08, duration: 0.4, ease: 'none' });
        }
      });

      // 6. MotionPath for orbiting element
      gsap.to('.orbit-element', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 70, y: -35 }, { x: 140, y: 0 }, { x: 70, y: 35 }, { x: 0, y: 0 }],
          curviness: 2,
        },
        duration: 15,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on action buttons
      gsap.utils.toArray<HTMLElement>('.action-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.05, duration: 0.4, ease: 'overviewWiggle' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.3 });
        });
      });

      // 8. DrawSVG for decorative lines
      gsap.set('.draw-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.industries-section',
        start: 'top 80%',
        onEnter: () => gsap.to('.draw-line', { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut' })
      });

      // 9. Draggable cards
      if (window.innerWidth > 768) {
        Draggable.create('.draggable-card', {
          type: 'x,y',
          bounds: containerRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
          }
        });
      }

      // 10. Floating particles
      gsap.utils.toArray<HTMLElement>('.float-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-60, 60)`,
          y: `random(-50, 50)`,
          rotation: `random(-180, 180)`,
          duration: `random(6, 10)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

      // 11. Use case tags stagger
      gsap.set('.usecase-tag', { x: -10, opacity: 0 });
      ScrollTrigger.batch('.usecase-tag', {
        start: 'top 90%',
        onEnter: (batch) => gsap.to(batch, { x: 0, opacity: 1, duration: 0.3, stagger: 0.03, ease: 'power2.out' })
      });

      // 12. Industry icon hover
      gsap.utils.toArray<HTMLElement>('.industry-icon').forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.3, rotation: 10, duration: 0.3, ease: 'back.out(2)' });
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
        <div className="parallax-orb-1 absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-[150px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[130px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(12)].map((_, i) => (
          <div key={i} className="float-particle absolute w-2 h-2 bg-violet-400/30 rounded-full" style={{ left: `${8 + i * 7}%`, top: `${12 + (i % 5) * 16}%` }} />
        ))}
        <div className="orbit-element absolute top-40 left-1/3 w-3 h-3 bg-indigo-400/60 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 backdrop-blur-sm rounded-full border border-violet-500/30 mb-6">
            <span className="text-xl">🏢</span>
            <span className="font-medium">Complete Industry Overview</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-violet-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">Industry Solutions</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Specialized AI solutions tailored for specific industries, addressing unique challenges and delivering measurable results
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support/book-consultation" className="action-btn px-8 py-4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all">
              Industry Consultation
            </Link>
            <Link href="/resources/case-studies" className="action-btn px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
              View Case Studies
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="benefits-grid grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="benefit-card relative p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center">
                <div className="text-3xl mb-2">{benefit.icon}</div>
                <h3 className="text-sm font-bold text-white mb-1">{benefit.title}</h3>
                <p className="text-gray-400 text-xs">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="industries-section relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* SVG Decorative Line */}
          <svg className="absolute left-1/2 -translate-x-1/2 -top-6 h-1 w-1/2 opacity-30" preserveAspectRatio="none">
            <line className="draw-line" x1="0" y1="0" x2="100%" y2="0" stroke="url(#overviewGrad)" strokeWidth="2" />
            <defs>
              <linearGradient id="overviewGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Explore Industries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, idx) => (
              <Link key={idx} href={industry.link} className="industry-card draggable-card group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-violet-500/50 transition-all block">
                <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-violet-500/30 rounded-tr-lg" />
                <div className="industry-icon text-5xl mb-4">{industry.icon}</div>
                <h3 className="industry-title text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">{industry.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{industry.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {industry.useCases.map((useCase, i) => (
                    <span key={i} className="usecase-tag text-xs px-2 py-1 bg-violet-500/20 text-violet-400 rounded-full border border-violet-500/30">
                      {useCase}
                    </span>
                  ))}
                </div>
                <span className="text-violet-400 text-sm font-medium">Learn More →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border border-violet-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Don't See Your Industry?</h2>
              <p className="text-gray-400 mb-8 text-lg">Contact us to discuss custom AI solutions for your specific business needs.</p>
              <Link href="/support/contact" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-violet-500/25 transition-all">
                💬 Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
