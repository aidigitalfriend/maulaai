'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';


export default function DocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const docSections = [
    { title: 'Agent Documentation', description: 'Learn how to create, configure, and deploy AI agents', icon: '🤖', href: '/docs/agents', topics: ['Getting Started', 'Configuration', 'API Reference', 'Best Practices'], color: 'from-blue-500 to-cyan-500' },
    { title: 'Canvas Builder', description: 'Build complete web applications with AI-powered generation', icon: '🎨', href: '/docs/canvas', topics: ['Text to App', 'Live Preview', 'Export Code', 'Components'], color: 'from-purple-500 to-fuchsia-500' },
    { title: 'Data Generator', description: 'Generate realistic test data for your applications', icon: '📊', href: '/docs/data-generator', topics: ['Users & Profiles', 'Products', 'Analytics', 'Custom Data'], color: 'from-blue-500 to-indigo-500' },
    { title: 'API Reference', description: 'Complete API documentation for all endpoints and methods', icon: '📚', href: '/docs/api', topics: ['Authentication', 'Endpoints', 'Rate Limits', 'Error Codes'], color: 'from-orange-500 to-red-500' },
    { title: 'Integration Guides', description: 'Step-by-step guides for integrating with popular platforms', icon: '🔗', href: '/docs/integrations', topics: ['Slack', 'Discord', 'Teams', 'Webhooks'], color: 'from-green-500 to-emerald-500' },
    { title: 'SDKs & Libraries', description: 'Official SDKs and community libraries for various languages', icon: '💻', href: '/docs/sdks', topics: ['JavaScript', 'Python', 'Go', 'PHP'], color: 'from-teal-500 to-cyan-500' },
    { title: 'Tutorials', description: 'Hands-on tutorials to help you build amazing AI experiences', icon: '🎓', href: '/docs/tutorials', topics: ['Quick Start', 'Advanced Features', 'Use Cases', 'Examples'], color: 'from-indigo-500 to-purple-500' },
    { title: 'Support', description: 'Get help, report bugs, and connect with the community', icon: '🛠️', href: '/support', topics: ['FAQ', 'Contact Support', 'Community', 'Bug Reports'], color: 'from-rose-500 to-pink-500' }
  ];

  const stats = [
    { value: '18', label: 'AI Agents' },
    { value: '50+', label: 'API Endpoints' },
    { value: '4', label: 'SDK Languages' },
    { value: '2', label: 'App Builders' }
  ];

  const quickStartSteps = [
    { step: 1, title: 'Choose an Agent', desc: 'Select from our library of pre-built agents' },
    { step: 2, title: 'Configure', desc: 'Customize the agent to fit your needs' },
    { step: 3, title: 'Deploy', desc: 'Launch your agent and start using it' }
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
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.02 }, '-=0.4');

      // 2. ScrambleText on stats
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(el, { duration: 1.5, scrambleText: { text: originalText, chars: '0123456789+', speed: 0.4 }, delay: i * 0.1 });
          }
        });
      });

      // 3. ScrollTrigger for doc section cards
      gsap.set('.doc-card', { y: 60, opacity: 0, scale: 0.95 });
      ScrollTrigger.batch('.doc-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.4)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 60, opacity: 0, scale: 0.95, duration: 0.3 })
      });

      // 4. Flip animation for quick start steps
      gsap.set('.quick-step', { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: '.quick-start-section',
        start: 'top 75%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.quick-step').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, y: 0 });
            Flip.from(state, { duration: 0.5, delay: i * 0.15, ease: 'power2.out' });
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
          gsap.to('.parallax-orb-3', { y: scrollY * 0.08, x: scrollY * 0.02, duration: 0.4, ease: 'none' });
        }
      });

      // 6. MotionPath for orbiting docs icon
      gsap.to('.orbit-element', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 50, y: -25 }, { x: 100, y: 0 }, { x: 50, y: 25 }, { x: 0, y: 0 }],
          curviness: 2,
        },
        duration: 12,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on search button
      const searchBtn = document.querySelector('.search-btn');
      if (searchBtn) {
        searchBtn.addEventListener('mouseenter', () => {
          gsap.to(searchBtn, { scale: 1.05, duration: 0.4, ease: 'docsWiggle' });
        });
        searchBtn.addEventListener('mouseleave', () => {
          gsap.to(searchBtn, { scale: 1, duration: 0.3 });
        });
      }

      // 8. DrawSVG for decorative lines
      gsap.set('.draw-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.stats-section',
        start: 'top 80%',
        onEnter: () => gsap.to('.draw-line', { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut' })
      });

      // 9. Draggable cards with Inertia
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
          y: `random(-40, 40)`,
          rotation: `random(-100, 100)`,
          duration: `random(5, 8)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.15
        });
      });

      // 11. Stats section reveal
      gsap.set('.stat-card', { y: 30, opacity: 0, scale: 0.9 });
      ScrollTrigger.batch('.stat-card', {
        start: 'top 90%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' })
      });

      // 12. Card icon wiggle on hover
      gsap.utils.toArray<HTMLElement>('.doc-card').forEach((card) => {
        const icon = card.querySelector('.card-icon');
        card.addEventListener('mouseenter', () => {
          gsap.to(icon, { rotation: 15, scale: 1.2, duration: 0.3, ease: 'back.out(2)' });
          gsap.to(card.querySelector('.card-glow'), { opacity: 0.15, duration: 0.3 });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(icon, { rotation: 0, scale: 1, duration: 0.3 });
          gsap.to(card.querySelector('.card-glow'), { opacity: 0, duration: 0.3 });
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-orb-1 absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[150px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[120px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(12)].map((_, i) => (
          <div key={i} className="float-particle absolute w-1.5 h-1.5 bg-blue-400/30 rounded-full" style={{ left: `${8 + i * 7}%`, top: `${12 + (i % 5) * 16}%` }} />
        ))}
        <div className="orbit-element absolute top-28 left-1/3 w-2 h-2 bg-cyan-400/60 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-full border border-blue-500/30 mb-6">
            <span className="text-xl">📖</span>
            <span className="font-medium">Developer Documentation</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Documentation</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
            Everything you need to build amazing AI agent experiences
          </p>
          <button className="search-btn px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-3 mx-auto">
            <span>🔍</span>
            Search Documentation
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* SVG Decorative Line */}
          <svg className="absolute left-1/2 -translate-x-1/2 top-0 h-1 w-1/2 opacity-30" preserveAspectRatio="none">
            <line className="draw-line" x1="0" y1="0" x2="100%" y2="0" stroke="url(#docsGrad)" strokeWidth="2" />
            <defs>
              <linearGradient id="docsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
            <div className="grid grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="stat-card text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
                  <div className="stat-value text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Grid */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docSections.map((section, idx) => (
              <Link key={idx} href={section.href} className="doc-card draggable-card group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-colors block">
                <div className="card-glow absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-0" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-blue-500/30 rounded-tr-lg" />
                <div className="relative z-10">
                  <div className={`card-icon w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="text-2xl">{section.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{section.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{section.description}</p>
                  <ul className="space-y-1.5">
                    {section.topics.map((topic, ti) => (
                      <li key={ti} className="text-sm text-gray-500 flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="quick-start-section relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-500/30 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
            <div className="relative z-10 text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Start</h2>
              <p className="text-gray-400">Get up and running with your first AI agent in minutes</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {quickStartSteps.map((s, idx) => (
                <div key={idx} className="quick-step text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700/30">
                  <div className={`w-12 h-12 ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-green-500'} rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl`}>
                    {s.step}
                  </div>
                  <h3 className="font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs/agents" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all text-center">
                View Agent Docs
              </Link>
              <Link href="/agents" className="px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all text-center">
                Browse Agents
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-10 rounded-3xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Help?</h2>
              <p className="text-gray-400 mb-6">Can't find what you're looking for? Our support team is here to help.</p>
              <Link href="/support" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
                🛠️ Get Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
