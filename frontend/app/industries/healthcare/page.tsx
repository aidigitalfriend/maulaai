'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';


export default function HealthcareIndustry() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: '🩺',
      title: 'Patient Support',
      description: 'AI-powered virtual assistants provide 24/7 patient support, answering health queries and guiding patients through their care journey.',
      benefits: ['24/7 Availability', 'Multilingual Support', 'HIPAA Compliant']
    },
    {
      icon: '📋',
      title: 'Medical Documentation',
      description: 'Automated transcription and documentation of patient encounters, reducing administrative burden on healthcare providers.',
      benefits: ['Voice-to-Text', 'Smart Templates', 'EHR Integration']
    },
    {
      icon: '📅',
      title: 'Appointment Scheduling',
      description: 'Intelligent scheduling systems that optimize provider availability and reduce no-shows through smart reminders.',
      benefits: ['Smart Reminders', 'Waitlist Management', 'Provider Matching']
    },
    {
      icon: '🔬',
      title: 'Diagnostic Support',
      description: 'AI-assisted diagnostic tools help healthcare providers identify patterns and make informed decisions faster.',
      benefits: ['Pattern Recognition', 'Clinical Guidelines', 'Risk Assessment']
    }
  ];

  const stats = [
    { value: '40%', label: 'Reduced Wait Times' },
    { value: '60%', label: 'Less Admin Work' },
    { value: '95%', label: 'Patient Satisfaction' },
    { value: '24/7', label: 'Support Available' }
  ];

  const useCases = [
    { title: 'Symptom Checker', desc: 'AI-guided symptom assessment and triage' },
    { title: 'Medication Reminders', desc: 'Personalized medication management' },
    { title: 'Health Records', desc: 'Secure access to patient information' },
    { title: 'Provider Chat', desc: 'Secure messaging with healthcare team' },
    { title: 'Lab Results', desc: 'Easy-to-understand result explanations' },
    { title: 'Care Plans', desc: 'Personalized treatment plan tracking' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 80, opacity: 0, rotateX: -90 });
      gsap.set(heroSub.words, { y: 30, opacity: 0 });
      gsap.set('.hero-badge', { scale: 0, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-badge', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.02 }, '-=0.2')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.02 }, '-=0.3');

      // 2. ScrambleText on stat values
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(el, { duration: 1, scrambleText: { text: originalText, chars: '0123456789%', speed: 0.5 }, delay: i * 0.1 });
          }
        });
      });

      // 3. ScrollTrigger batch for feature cards
      gsap.set('.feature-card', { y: 50, opacity: 0, scale: 0.95 });
      ScrollTrigger.batch('.feature-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.4)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 50, opacity: 0, scale: 0.95, duration: 0.3 })
      });

      // 4. Flip for stats
      gsap.set('.stat-card', { opacity: 0, rotateY: 90 });
      ScrollTrigger.create({
        trigger: '.stats-section',
        start: 'top 85%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.stat-card').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, rotateY: 0 });
            Flip.from(state, { duration: 0.6, delay: i * 0.1, ease: 'power3.out' });
          });
        }
      });

      // 5. Observer parallax
      Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const scrollY = self.scrollY;
          gsap.to('.parallax-orb-1', { y: scrollY * 0.12, duration: 0.5, ease: 'none' });
          gsap.to('.parallax-orb-2', { y: scrollY * -0.08, duration: 0.5, ease: 'none' });
          gsap.to('.parallax-orb-3', { y: scrollY * 0.06, duration: 0.5, ease: 'none' });
        }
      });

      // 6. MotionPath pulse ring
      gsap.to('.pulse-ring', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 40, y: -20 }, { x: 80, y: 0 }, { x: 40, y: 20 }, { x: 0, y: 0 }],
          curviness: 1.5,
        },
        duration: 12,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on CTA buttons
      gsap.utils.toArray<HTMLElement>('.cta-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.06, duration: 0.4, ease: 'healthWiggle' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.3 });
        });
      });

      // 8. DrawSVG heartbeat line
      gsap.set('.heartbeat-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.features-section',
        start: 'top 85%',
        onEnter: () => gsap.to('.heartbeat-line', { drawSVG: '100%', duration: 1.5, ease: 'power2.inOut' })
      });

      // 9. Draggable use case cards
      if (window.innerWidth > 768) {
        Draggable.create('.usecase-card', {
          type: 'x,y',
          bounds: containerRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
          }
        });
      }

      // 10. Floating medical particles
      gsap.utils.toArray<HTMLElement>('.medical-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-50, 50)`,
          y: `random(-40, 40)`,
          rotation: `random(-90, 90)`,
          duration: `random(7, 11)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.15
        });
      });

      // 11. Benefit tags stagger
      gsap.set('.benefit-tag', { x: -15, opacity: 0 });
      ScrollTrigger.batch('.benefit-tag', {
        start: 'top 92%',
        onEnter: (batch) => gsap.to(batch, { x: 0, opacity: 1, duration: 0.25, stagger: 0.04, ease: 'power2.out' })
      });

      // 12. Icon heartbeat effect
      gsap.utils.toArray<HTMLElement>('.feature-icon').forEach((icon) => {
        gsap.to(icon, {
          scale: 1.15,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-orb-1 absolute top-1/4 left-1/5 w-[550px] h-[550px] bg-rose-500/15 rounded-full blur-[140px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-red-500/12 rounded-full blur-[120px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: 'linear-gradient(rgba(244, 63, 94, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 63, 94, 0.08) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="medical-particle absolute w-2 h-2 bg-rose-400/25 rounded-full" style={{ left: `${10 + i * 8}%`, top: `${15 + (i % 4) * 18}%` }} />
        ))}
        <div className="pulse-ring absolute top-32 left-1/4 w-4 h-4 bg-red-400/50 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Link href="/industries" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            ← Back to Industries
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-rose-500/20 to-red-500/20 backdrop-blur-sm rounded-full border border-rose-500/30 mb-6">
            <span className="text-xl">🏥</span>
            <span className="font-medium text-rose-300">Healthcare Solutions</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-rose-400 via-red-400 to-pink-400 bg-clip-text text-transparent">Healthcare AI</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Transform patient care with AI-powered solutions that enhance accessibility, reduce administrative burden, and improve outcomes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents/emma" className="cta-btn px-8 py-4 bg-gradient-to-r from-rose-500 to-red-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all">
              Meet Emma Health AI
            </Link>
            <Link href="/support/book-consultation" className="cta-btn px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center">
              <div className="stat-value text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* SVG Decorative Heartbeat */}
          <svg className="absolute left-1/2 -translate-x-1/2 -top-4 h-2 w-2/3 opacity-30" preserveAspectRatio="none">
            <polyline className="heartbeat-line" fill="none" stroke="url(#healthGrad)" strokeWidth="2" points="0,10 50,10 60,2 70,18 80,10 130,10" />
            <defs>
              <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Core Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-rose-500/50 transition-all">
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-rose-500/30 rounded-tr-lg" />
                <div className="feature-icon text-5xl mb-4 inline-block">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.benefits.map((benefit, i) => (
                    <span key={i} className="benefit-tag text-xs px-2 py-1 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Popular Use Cases</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="usecase-card p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-rose-500/40 transition-all cursor-grab active:cursor-grabbing">
                <h3 className="font-semibold text-white mb-1">{useCase.title}</h3>
                <p className="text-gray-400 text-xs">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-rose-900/30 to-red-900/30 border border-rose-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Healthcare?</h2>
              <p className="text-gray-400 mb-8 text-lg">Join leading healthcare organizations using Maula AI to improve patient outcomes.</p>
              <Link href="/support/book-consultation" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-rose-500 to-red-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-rose-500/25 transition-all">
                🏥 Book Healthcare Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
