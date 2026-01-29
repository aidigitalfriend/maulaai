'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';


export default function TechnologyIndustry() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: '💻',
      title: 'Code Generation',
      description: 'AI-powered code generation and completion that accelerates development, suggests optimizations, and follows best practices.',
      benefits: ['Auto-completion', 'Code Suggestions', 'Best Practices']
    },
    {
      icon: '🐛',
      title: 'Bug Detection',
      description: 'Intelligent code analysis that identifies bugs, vulnerabilities, and potential issues before they reach production.',
      benefits: ['Static Analysis', 'Security Scanning', 'Performance Issues']
    },
    {
      icon: '🚀',
      title: 'DevOps Automation',
      description: 'AI-driven CI/CD optimization, infrastructure management, and deployment automation for faster, safer releases.',
      benefits: ['CI/CD Optimization', 'Infrastructure AI', 'Auto-scaling']
    },
    {
      icon: '🔒',
      title: 'Security AI',
      description: 'Continuous security monitoring, threat detection, and automated response to protect your applications and data.',
      benefits: ['Threat Detection', 'Vulnerability Scanning', 'Incident Response']
    }
  ];

  const stats = [
    { value: '40%', label: 'Faster Development' },
    { value: '60%', label: 'Fewer Bugs' },
    { value: '50%', label: 'Deploy Faster' },
    { value: '99.9%', label: 'Uptime SLA' }
  ];

  const tools = [
    { title: 'Code Review AI', desc: 'Automated pull request analysis' },
    { title: 'Documentation', desc: 'Auto-generated API docs' },
    { title: 'Testing AI', desc: 'Intelligent test generation' },
    { title: 'Refactoring', desc: 'Smart code improvements' },
    { title: 'Monitoring', desc: 'AI-powered observability' },
    { title: 'Knowledge Base', desc: 'Intelligent search for devs' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 70, opacity: 0, rotateY: -45 });
      gsap.set(heroSub.words, { y: 28, opacity: 0 });
      gsap.set('.hero-badge', { scale: 0.5, opacity: 0, y: -20 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-badge', { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateY: 0, duration: 0.55, stagger: 0.02 }, '-=0.25')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.45, stagger: 0.018 }, '-=0.22');

      // 2. ScrambleText on stat values
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(el, { duration: 1, scrambleText: { text: originalText, chars: '0123456789.%', speed: 0.45 }, delay: i * 0.1 });
          }
        });
      });

      // 3. ScrollTrigger batch for feature cards
      gsap.set('.feature-card', { y: 52, opacity: 0, scale: 0.95 });
      ScrollTrigger.batch('.feature-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.4)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 52, opacity: 0, scale: 0.95, duration: 0.3 })
      });

      // 4. Flip for stats
      gsap.set('.stat-card', { opacity: 0, x: -30 });
      ScrollTrigger.create({
        trigger: '.stats-section',
        start: 'top 85%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.stat-card').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, x: 0 });
            Flip.from(state, { duration: 0.5, delay: i * 0.08, ease: 'power2.out' });
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

      // 6. MotionPath for orbiting code symbol
      gsap.to('.orbit-code', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 65, y: -32 }, { x: 130, y: 0 }, { x: 65, y: 32 }, { x: 0, y: 0 }],
          curviness: 2,
        },
        duration: 15,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on CTA buttons
      gsap.utils.toArray<HTMLElement>('.cta-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.055, duration: 0.35, ease: 'techWiggle' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.25 });
        });
      });

      // 8. DrawSVG code brackets
      gsap.set('.code-bracket', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.features-section',
        start: 'top 82%',
        onEnter: () => gsap.to('.code-bracket', { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut' })
      });

      // 9. Draggable tool cards
      if (window.innerWidth > 768) {
        Draggable.create('.tool-card', {
          type: 'x,y',
          bounds: containerRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.55)' });
          }
        });
      }

      // 10. Floating tech particles
      gsap.utils.toArray<HTMLElement>('.tech-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-55, 55)`,
          y: `random(-45, 45)`,
          rotation: `random(-100, 100)`,
          duration: `random(8, 12)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.15
        });
      });

      // 11. Benefit tags stagger
      gsap.set('.benefit-tag', { x: -12, opacity: 0 });
      ScrollTrigger.batch('.benefit-tag', {
        start: 'top 92%',
        onEnter: (batch) => gsap.to(batch, { x: 0, opacity: 1, duration: 0.26, stagger: 0.035, ease: 'power2.out' })
      });

      // 12. Feature icon code effect
      gsap.utils.toArray<HTMLElement>('.feature-icon').forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.3, rotation: -15, duration: 0.3, ease: 'back.out(2)' });
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
        <div className="parallax-orb-1 absolute top-1/4 left-1/5 w-[540px] h-[540px] bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[460px] h-[460px] bg-blue-500/12 rounded-full blur-[120px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[380px] h-[380px] bg-sky-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="tech-particle absolute w-2 h-2 bg-cyan-400/25 rounded-full" style={{ left: `${8 + i * 9}%`, top: `${12 + (i % 5) * 16}%` }} />
        ))}
        <div className="orbit-code absolute top-34 right-1/3 w-3 h-3 bg-blue-400/55 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Link href="/industries" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            ← Back to Industries
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-full border border-cyan-500/30 mb-6">
            <span className="text-xl">💻</span>
            <span className="font-medium text-cyan-300">Technology Solutions</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-400 bg-clip-text text-transparent">Technology AI</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Accelerate development with AI-powered code generation, intelligent bug detection, and automated DevOps workflows
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support/book-consultation" className="cta-btn px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
              Request Tech Demo
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
              <div className="stat-value text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* SVG Code Brackets */}
          <svg className="absolute left-1/2 -translate-x-1/2 -top-6 h-10 w-24 opacity-30" viewBox="0 0 48 40">
            <path className="code-bracket" fill="none" stroke="url(#techGrad)" strokeWidth="2" d="M16,5 L8,20 L16,35" />
            <path className="code-bracket" fill="none" stroke="url(#techGrad)" strokeWidth="2" d="M32,5 L40,20 L32,35" />
            <defs>
              <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Developer Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all">
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                <div className="feature-icon text-5xl mb-4 inline-block cursor-pointer">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.benefits.map((benefit, i) => (
                    <span key={i} className="benefit-tag text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Developer Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tools.map((tool, idx) => (
              <div key={idx} className="tool-card p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/40 transition-all cursor-grab active:cursor-grabbing">
                <h3 className="font-semibold text-white mb-1">{tool.title}</h3>
                <p className="text-gray-400 text-xs">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Development?</h2>
              <p className="text-gray-400 mb-8 text-lg">Join tech leaders using Maula AI to accelerate innovation and ship faster.</p>
              <Link href="/support/book-consultation" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                💻 Book Tech Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
