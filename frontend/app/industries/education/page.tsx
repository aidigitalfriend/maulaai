'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, CustomEase, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';

export default function EducationIndustry() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: '🎯',
      title: 'Personalized Learning',
      description: 'AI-driven adaptive learning paths that adjust to each student\'s pace, style, and knowledge gaps for optimal outcomes.',
      benefits: ['Adaptive Content', 'Learning Styles', 'Progress Tracking']
    },
    {
      icon: '🤖',
      title: 'Intelligent Tutoring',
      description: '24/7 AI tutors that provide instant help, explanations, and guided problem-solving across all subjects.',
      benefits: ['24/7 Availability', 'Multi-Subject', 'Instant Feedback']
    },
    {
      icon: '📈',
      title: 'Learning Analytics',
      description: 'Comprehensive dashboards for educators to track student progress, identify at-risk learners, and optimize instruction.',
      benefits: ['Performance Metrics', 'Early Warning', 'Class Insights']
    },
    {
      icon: '⚙️',
      title: 'Admin Automation',
      description: 'Streamline administrative tasks including enrollment, scheduling, grading, and communication workflows.',
      benefits: ['Auto-Grading', 'Smart Scheduling', 'Parent Portal']
    }
  ];

  const stats = [
    { value: '35%', label: 'Improved Grades' },
    { value: '60%', label: 'Time Saved' },
    { value: '90%', label: 'Engagement Rate' },
    { value: '1M+', label: 'Students Helped' }
  ];

  const useCases = [
    { title: 'Homework Help', desc: 'Instant assistance on assignments' },
    { title: 'Test Prep', desc: 'Personalized practice and review' },
    { title: 'Language Learning', desc: 'Interactive conversation practice' },
    { title: 'STEM Tutoring', desc: 'Math and science problem solving' },
    { title: 'Essay Feedback', desc: 'Writing improvement suggestions' },
    { title: 'Study Planning', desc: 'Smart study schedule creation' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Create custom wiggle ease
      CustomWiggle.create('eduWiggle', { wiggles: 5, type: 'uniform' });

      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 80, opacity: 0, scale: 0.8 });
      gsap.set(heroSub.words, { y: 30, opacity: 0 });
      gsap.set('.hero-badge', { y: -30, opacity: 0, rotateX: -45 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-badge', { y: 0, opacity: 1, rotateX: 0, duration: 0.5, ease: 'back.out(1.6)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.02 }, '-=0.2')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.45, stagger: 0.02 }, '-=0.25');

      // 2. ScrambleText on stat values
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(el, { duration: 1, scrambleText: { text: originalText, chars: '0123456789%+M', speed: 0.45 }, delay: i * 0.1 });
          }
        });
      });

      // 3. ScrollTrigger batch for feature cards
      gsap.set('.feature-card', { y: 55, opacity: 0, rotateX: -15 });
      ScrollTrigger.batch('.feature-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.3)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 55, opacity: 0, rotateX: -15, duration: 0.3 })
      });

      // 4. Flip for stats
      gsap.set('.stat-card', { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: '.stats-section',
        start: 'top 85%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.stat-card').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, y: 0 });
            Flip.from(state, { duration: 0.5, delay: i * 0.09, ease: 'power2.out' });
          });
        }
      });

      // 5. Observer parallax scrolling
      Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const scrollY = self.scrollY;
          gsap.to('.parallax-orb-1', { y: scrollY * 0.13, duration: 0.45, ease: 'none' });
          gsap.to('.parallax-orb-2', { y: scrollY * -0.1, duration: 0.45, ease: 'none' });
          gsap.to('.parallax-orb-3', { y: scrollY * 0.07, duration: 0.45, ease: 'none' });
        }
      });

      // 6. MotionPath for orbiting book
      gsap.to('.orbit-book', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 50, y: -25 }, { x: 100, y: 0 }, { x: 50, y: 25 }, { x: 0, y: 0 }],
          curviness: 1.8,
        },
        duration: 13,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on buttons
      gsap.utils.toArray<HTMLElement>('.action-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.06, duration: 0.35, ease: 'eduWiggle' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.25 });
        });
      });

      // 8. DrawSVG pencil line
      gsap.set('.pencil-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.features-section',
        start: 'top 82%',
        onEnter: () => gsap.to('.pencil-line', { drawSVG: '100%', duration: 1.3, ease: 'power2.inOut' })
      });

      // 9. Draggable use case cards
      if (window.innerWidth > 768) {
        Draggable.create('.usecase-card', {
          type: 'x,y',
          bounds: containerRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.55)' });
          }
        });
      }

      // 10. Floating education particles
      gsap.utils.toArray<HTMLElement>('.edu-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-50, 50)`,
          y: `random(-45, 45)`,
          rotation: `random(-100, 100)`,
          duration: `random(7, 11)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.16
        });
      });

      // 11. Benefit tags stagger
      gsap.set('.benefit-tag', { x: -12, opacity: 0 });
      ScrollTrigger.batch('.benefit-tag', {
        start: 'top 92%',
        onEnter: (batch) => gsap.to(batch, { x: 0, opacity: 1, duration: 0.28, stagger: 0.035, ease: 'power2.out' })
      });

      // 12. Feature icon bounce
      gsap.utils.toArray<HTMLElement>('.feature-icon').forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.3, rotation: -10, duration: 0.3, ease: 'back.out(2)' });
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
        <div className="parallax-orb-1 absolute top-1/4 left-1/5 w-[520px] h-[520px] bg-purple-500/15 rounded-full blur-[135px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[440px] h-[440px] bg-violet-500/12 rounded-full blur-[115px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[360px] h-[360px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.08) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="edu-particle absolute w-2 h-2 bg-purple-400/25 rounded-full" style={{ left: `${9 + i * 8}%`, top: `${14 + (i % 5) * 15}%` }} />
        ))}
        <div className="orbit-book absolute top-40 left-1/3 w-3 h-3 bg-violet-400/55 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Link href="/industries" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            ← Back to Industries
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500/20 to-violet-500/20 backdrop-blur-sm rounded-full border border-purple-500/30 mb-6">
            <span className="text-xl">🎓</span>
            <span className="font-medium text-purple-300">Education Solutions</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Education AI</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Transform learning experiences with AI tutors, adaptive content, and intelligent analytics that empower students and educators
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support/book-consultation" className="action-btn px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all">
              Schedule Education Demo
            </Link>
            <Link href="/resources/case-studies" className="action-btn px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
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
              <div className="stat-value text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* SVG Decorative Pencil Line */}
          <svg className="absolute left-1/2 -translate-x-1/2 -top-4 h-1 w-1/2 opacity-30" preserveAspectRatio="none">
            <line className="pencil-line" x1="0" y1="0" x2="100%" y2="0" stroke="url(#eduGrad)" strokeWidth="2" strokeDasharray="8,4" />
            <defs>
              <linearGradient id="eduGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Learning Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all">
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                <div className="feature-icon text-5xl mb-4 inline-block cursor-pointer">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.benefits.map((benefit, i) => (
                    <span key={i} className="benefit-tag text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
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
              <div key={idx} className="usecase-card p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/40 transition-all cursor-grab active:cursor-grabbing">
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
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-purple-900/30 to-violet-900/30 border border-purple-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Education?</h2>
              <p className="text-gray-400 mb-8 text-lg">Join schools and institutions using Maula AI to improve learning outcomes.</p>
              <Link href="/support/book-consultation" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                🎓 Book Education Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
