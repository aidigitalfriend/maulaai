'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';


export default function IndustriesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const industries = [
    { name: 'Healthcare', icon: '🏥', href: '/industries/healthcare', color: 'red' },
    { name: 'Finance & Banking', icon: '🏦', href: '/industries/finance-banking', color: 'green' },
    { name: 'Retail & E-commerce', icon: '🛒', href: '/industries/retail-ecommerce', color: 'purple' },
    { name: 'Manufacturing', icon: '🏭', href: '/industries/manufacturing', color: 'orange' },
    { name: 'Technology', icon: '💻', href: '/industries/technology', color: 'blue' },
    { name: 'Education', icon: '🎓', href: '/industries/education', color: 'pink' }
  ];

  const stats = [
    { value: '50+', label: 'Enterprise Clients' },
    { value: '6', label: 'Industry Verticals' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '24/7', label: 'Support' }
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

      // 2. ScrambleText on stat values
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(el, { duration: 1, scrambleText: { text: originalText, chars: '0123456789+%', speed: 0.3 }, delay: i * 0.1 });
          }
        });
      });

      // 3. ScrollTrigger for industry cards
      gsap.set('.industry-card', { y: 60, opacity: 0, scale: 0.9 });
      ScrollTrigger.batch('.industry-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: 'back.out(1.7)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 60, opacity: 0, scale: 0.9, duration: 0.3 })
      });

      // 4. Flip for stat cards
      gsap.set('.stat-card', { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: '.stats-grid',
        start: 'top 80%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.stat-card').forEach((el, i) => {
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
          path: [{ x: 0, y: 0 }, { x: 60, y: -30 }, { x: 120, y: 0 }, { x: 60, y: 30 }, { x: 0, y: 0 }],
          curviness: 2,
        },
        duration: 14,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on action buttons
      gsap.utils.toArray<HTMLElement>('.action-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.05, duration: 0.4, ease: 'industriesWiggle' });
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

      // 11. Industry icons hover bounce
      gsap.utils.toArray<HTMLElement>('.industry-icon').forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.4, rotation: 15, duration: 0.3, ease: 'back.out(2)' });
        });
        icon.addEventListener('mouseleave', () => {
          gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3 });
        });
      });

      // 12. CTA section reveal
      gsap.set('.cta-section', { y: 40, opacity: 0 });
      ScrollTrigger.create({
        trigger: '.cta-section',
        start: 'top 85%',
        onEnter: () => gsap.to('.cta-section', { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' })
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-orb-1 absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[150px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[130px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(12)].map((_, i) => (
          <div key={i} className="float-particle absolute w-2 h-2 bg-indigo-400/30 rounded-full" style={{ left: `${8 + i * 7}%`, top: `${12 + (i % 5) * 16}%` }} />
        ))}
        <div className="orbit-element absolute top-40 left-1/3 w-3 h-3 bg-purple-400/60 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-full border border-indigo-500/30 mb-6">
            <span className="text-xl">🏢</span>
            <span className="font-medium">Enterprise AI Solutions</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Industry Solutions</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Specialized AI solutions designed for your industry's unique challenges and opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/industries/overview" className="action-btn px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
              Explore Industries
            </Link>
            <Link href="/support/book-consultation" className="action-btn px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
              Book Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center">
                <p className="stat-value text-3xl md:text-4xl font-bold text-indigo-400 mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
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
            <line className="draw-line" x1="0" y1="0" x2="100%" y2="0" stroke="url(#industriesGrad)" strokeWidth="2" />
            <defs>
              <linearGradient id="industriesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Industry Verticals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, idx) => (
              <Link key={idx} href={industry.href} className="industry-card draggable-card group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-indigo-500/50 transition-all block text-center">
                <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-indigo-500/30 rounded-tr-lg" />
                <div className="industry-icon text-6xl mb-4 inline-block">{industry.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{industry.name}</h3>
                <span className="text-indigo-400 text-sm font-medium">Explore Solutions →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="cta-section relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Industry?</h2>
              <p className="text-gray-400 mb-8 text-lg">Schedule a consultation with our industry experts to discover how AI can revolutionize your business.</p>
              <Link href="/support/book-consultation" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                📞 Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
