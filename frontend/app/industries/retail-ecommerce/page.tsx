'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';


export default function RetailEcommerceIndustry() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: '🎁',
      title: 'Product Recommendations',
      description: 'AI-powered personalization engines that analyze customer behavior to suggest products they\'ll love, increasing conversion rates.',
      benefits: ['Personalized Suggestions', 'Cross-selling', 'Upselling AI']
    },
    {
      icon: '💬',
      title: 'Customer Service AI',
      description: '24/7 intelligent chatbots that handle inquiries, process returns, track orders, and provide instant support.',
      benefits: ['24/7 Support', 'Order Tracking', 'Returns Processing']
    },
    {
      icon: '📦',
      title: 'Inventory Intelligence',
      description: 'Smart inventory management that predicts demand, prevents stockouts, and optimizes warehouse operations.',
      benefits: ['Demand Forecasting', 'Stock Optimization', 'Warehouse AI']
    },
    {
      icon: '💰',
      title: 'Dynamic Pricing',
      description: 'AI-driven pricing strategies that maximize revenue while remaining competitive in real-time market conditions.',
      benefits: ['Real-time Pricing', 'Competitor Analysis', 'Margin Optimization']
    }
  ];

  const stats = [
    { value: '35%', label: 'Higher Conversion' },
    { value: '45%', label: 'Less Cart Abandon' },
    { value: '50%', label: 'Faster Support' },
    { value: '$5M+', label: 'Revenue Lift' }
  ];

  const solutions = [
    { title: 'Virtual Shopping', desc: 'AI-powered shopping assistants' },
    { title: 'Size Finder', desc: 'Smart size recommendations' },
    { title: 'Visual Search', desc: 'Find products from images' },
    { title: 'Review Analysis', desc: 'AI sentiment from reviews' },
    { title: 'Fraud Prevention', desc: 'Secure transaction monitoring' },
    { title: 'Loyalty Programs', desc: 'Personalized rewards AI' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 75, opacity: 0, scaleY: 1.5 });
      gsap.set(heroSub.words, { y: 32, opacity: 0 });
      gsap.set('.hero-badge', { x: 40, opacity: 0, rotation: 5 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-badge', { x: 0, opacity: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.6)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, scaleY: 1, duration: 0.58, stagger: 0.022 }, '-=0.28')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.46, stagger: 0.018 }, '-=0.25');

      // 2. ScrambleText on stat values
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(el, { duration: 1.1, scrambleText: { text: originalText, chars: '$0123456789%+M', speed: 0.44 }, delay: i * 0.1 });
          }
        });
      });

      // 3. ScrollTrigger batch for feature cards
      gsap.set('.feature-card', { y: 55, opacity: 0, scale: 0.94 });
      ScrollTrigger.batch('.feature-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.64, stagger: 0.11, ease: 'back.out(1.35)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 55, opacity: 0, scale: 0.94, duration: 0.3 })
      });

      // 4. Flip for stats
      gsap.set('.stat-card', { opacity: 0, scale: 0.6, rotation: -10 });
      ScrollTrigger.create({
        trigger: '.stats-section',
        start: 'top 85%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.stat-card').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, scale: 1, rotation: 0 });
            Flip.from(state, { duration: 0.52, delay: i * 0.09, ease: 'back.out(1.4)' });
          });
        }
      });

      // 5. Observer parallax
      Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const scrollY = self.scrollY;
          gsap.to('.parallax-orb-1', { y: scrollY * 0.12, duration: 0.44, ease: 'none' });
          gsap.to('.parallax-orb-2', { y: scrollY * -0.1, duration: 0.44, ease: 'none' });
          gsap.to('.parallax-orb-3', { y: scrollY * 0.08, duration: 0.44, ease: 'none' });
        }
      });

      // 6. MotionPath for orbiting cart
      gsap.to('.orbit-cart', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 58, y: -30 }, { x: 116, y: 0 }, { x: 58, y: 30 }, { x: 0, y: 0 }],
          curviness: 1.7,
        },
        duration: 13,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on CTA buttons
      gsap.utils.toArray<HTMLElement>('.cta-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.06, duration: 0.36, ease: 'retailWiggle' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.26 });
        });
      });

      // 8. DrawSVG shopping bag outline
      gsap.set('.bag-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.features-section',
        start: 'top 82%',
        onEnter: () => gsap.to('.bag-line', { drawSVG: '100%', duration: 1.3, ease: 'power2.inOut' })
      });

      // 9. Draggable solution cards
      if (window.innerWidth > 768) {
        Draggable.create('.solution-card', {
          type: 'x,y',
          bounds: containerRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.55)' });
          }
        });
      }

      // 10. Floating retail particles
      gsap.utils.toArray<HTMLElement>('.retail-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-55, 55)`,
          y: `random(-48, 48)`,
          rotation: `random(-110, 110)`,
          duration: `random(7, 11)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.16
        });
      });

      // 11. Benefit tags stagger
      gsap.set('.benefit-tag', { y: 12, opacity: 0 });
      ScrollTrigger.batch('.benefit-tag', {
        start: 'top 92%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.28, stagger: 0.036, ease: 'power2.out' })
      });

      // 12. Feature icon bounce
      gsap.utils.toArray<HTMLElement>('.feature-icon').forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.28, y: -8, duration: 0.3, ease: 'back.out(2.5)' });
        });
        icon.addEventListener('mouseleave', () => {
          gsap.to(icon, { scale: 1, y: 0, duration: 0.25 });
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-orb-1 absolute top-1/4 left-1/5 w-[520px] h-[520px] bg-pink-500/15 rounded-full blur-[135px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[440px] h-[440px] bg-fuchsia-500/12 rounded-full blur-[118px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[360px] h-[360px] bg-rose-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: 'linear-gradient(rgba(236, 72, 153, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 72, 153, 0.08) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="retail-particle absolute w-2 h-2 bg-pink-400/25 rounded-full" style={{ left: `${9 + i * 8}%`, top: `${14 + (i % 5) * 15}%` }} />
        ))}
        <div className="orbit-cart absolute top-38 left-1/4 w-3 h-3 bg-fuchsia-400/55 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Link href="/industries" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            ← Back to Industries
          </Link>
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 backdrop-blur-sm rounded-full border border-pink-500/30 mb-6">
            <span className="text-xl">🛒</span>
            <span className="font-medium text-pink-300">Retail & E-commerce</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-pink-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">Retail AI</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Transform shopping experiences with AI-powered personalization, intelligent customer service, and smart inventory management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support/book-consultation" className="cta-btn px-8 py-4 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all">
              Request Retail Demo
            </Link>
            <Link href="/resources/case-studies" className="cta-btn px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
              View Success Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center">
              <div className="stat-value text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-fuchsia-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* SVG Shopping Bag */}
          <svg className="absolute left-1/2 -translate-x-1/2 -top-6 h-10 w-20 opacity-30" viewBox="0 0 40 40">
            <path className="bag-line" fill="none" stroke="url(#retailGrad)" strokeWidth="2" d="M10,15 L10,35 L30,35 L30,15 M15,15 L15,10 C15,5 25,5 25,10 L25,15" />
            <defs>
              <linearGradient id="retailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">E-commerce Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-pink-500/50 transition-all">
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-pink-500/30 rounded-tr-lg" />
                <div className="feature-icon text-5xl mb-4 inline-block cursor-pointer">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.benefits.map((benefit, i) => (
                    <span key={i} className="benefit-tag text-xs px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full border border-pink-500/30">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Retail Solutions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {solutions.map((solution, idx) => (
              <div key={idx} className="solution-card p-5 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-pink-500/40 transition-all cursor-grab active:cursor-grabbing">
                <h3 className="font-semibold text-white mb-1">{solution.title}</h3>
                <p className="text-gray-400 text-xs">{solution.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-pink-900/30 to-fuchsia-900/30 border border-pink-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-fuchsia-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Retail?</h2>
              <p className="text-gray-400 mb-8 text-lg">Join leading retailers using Maula AI to boost sales and customer satisfaction.</p>
              <Link href="/support/book-consultation" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all">
                🛒 Book Retail Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
