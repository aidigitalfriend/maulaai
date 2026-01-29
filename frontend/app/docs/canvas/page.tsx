'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';
import { Layout, Code, Sparkles, Download, Play, Rocket } from 'lucide-react';


export default function CanvasDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    { icon: Sparkles, title: 'Text to App', description: 'Describe your app in plain English and watch it come to life with AI.', color: 'from-purple-500 to-fuchsia-500' },
    { icon: Play, title: 'Live Preview', description: 'See your application running in real-time as it\'s being generated.', color: 'from-green-500 to-emerald-500' },
    { icon: Code, title: 'Clean Code Output', description: 'Generated code follows best practices with TypeScript and Tailwind.', color: 'from-blue-500 to-cyan-500' },
    { icon: Download, title: 'Export & Deploy', description: 'Download your app ready for deployment to Vercel or Netlify.', color: 'from-orange-500 to-red-500' }
  ];

  const useCases = [
    { title: 'Landing Pages', description: 'Create beautiful marketing pages with hero sections and CTAs', icon: '🎯' },
    { title: 'Dashboards', description: 'Build data visualization dashboards with charts and metrics', icon: '📊' },
    { title: 'Forms & Surveys', description: 'Generate complex forms with validation and multi-step wizards', icon: '📝' },
    { title: 'E-commerce', description: 'Create product listings, shopping carts, and checkout flows', icon: '🛒' },
    { title: 'Admin Panels', description: 'Build CRUD interfaces, data tables, and management consoles', icon: '⚙️' },
    { title: 'Portfolio Sites', description: 'Design personal portfolios, galleries, and showcase pages', icon: '🎨' }
  ];

  const steps = [
    { step: 1, title: 'Describe Your App', description: 'Type a natural language description of what you want to build.' },
    { step: 2, title: 'AI Generates Code', description: 'Watch as the AI generates complete React components in real-time.' },
    { step: 3, title: 'Preview & Iterate', description: 'See your app running live. Request modifications to refine it.' },
    { step: 4, title: 'Export & Use', description: 'Download the complete project or copy individual components.' }
  ];

  const techStack = [
    { name: 'React', description: 'Component architecture', icon: '⚛️' },
    { name: 'TypeScript', description: 'Type-safe code', icon: '📘' },
    { name: 'Tailwind CSS', description: 'Utility styling', icon: '🎨' },
    { name: 'Lucide Icons', description: 'Icon library', icon: '✨' },
    { name: 'Recharts', description: 'Data visualization', icon: '📈' },
    { name: 'Framer Motion', description: 'Animations', icon: '🎬' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 100, opacity: 0, rotateX: -90 });
      gsap.set(heroSub.words, { y: 40, opacity: 0 });
      gsap.set('.hero-icon', { scale: 0, rotation: -180 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-icon', { scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.02 }, '-=0.4')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.02 }, '-=0.3');

      // 2. ScrambleText on step numbers
      gsap.utils.toArray<HTMLElement>('.step-number').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(el, { duration: 0.8, scrambleText: { text: originalText, chars: '1234', speed: 0.5 }, delay: i * 0.1 });
          }
        });
      });

      // 3. ScrollTrigger for feature cards
      gsap.set('.feature-card', { y: 50, opacity: 0, scale: 0.95 });
      ScrollTrigger.batch('.feature-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.4)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 50, opacity: 0, scale: 0.95, duration: 0.3 })
      });

      // 4. Flip for use case cards
      gsap.set('.usecase-card', { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: '.usecases-grid',
        start: 'top 80%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.usecase-card').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, y: 0 });
            Flip.from(state, { duration: 0.5, delay: i * 0.06, ease: 'power2.out' });
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
        duration: 10,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on launch button
      const launchBtn = document.querySelector('.launch-btn');
      if (launchBtn) {
        launchBtn.addEventListener('mouseenter', () => {
          gsap.to(launchBtn, { scale: 1.05, duration: 0.4, ease: 'canvasWiggle' });
          gsap.to('.launch-icon', { rotation: 15, scale: 1.2, duration: 0.3 });
        });
        launchBtn.addEventListener('mouseleave', () => {
          gsap.to(launchBtn, { scale: 1, duration: 0.3 });
          gsap.to('.launch-icon', { rotation: 0, scale: 1, duration: 0.3 });
        });
      }

      // 8. DrawSVG for decorative lines
      gsap.set('.draw-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.features-section',
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
          y: `random(-40, 40)`,
          rotation: `random(-100, 100)`,
          duration: `random(5, 8)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.15
        });
      });

      // 11. Tech stack reveal
      gsap.set('.tech-item', { y: 20, opacity: 0, scale: 0.9 });
      ScrollTrigger.batch('.tech-item', {
        start: 'top 90%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.5)' })
      });

      // 12. Steps timeline animation
      gsap.set('.step-card', { x: -30, opacity: 0 });
      ScrollTrigger.batch('.step-card', {
        start: 'top 85%',
        onEnter: (batch) => gsap.to(batch, { x: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: 'power2.out' })
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-orb-1 absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[150px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/15 rounded-full blur-[120px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="float-particle absolute w-1.5 h-1.5 bg-purple-400/30 rounded-full" style={{ left: `${10 + i * 8}%`, top: `${15 + (i % 4) * 18}%` }} />
        ))}
        <div className="orbit-element absolute top-32 left-1/3 w-2 h-2 bg-fuchsia-400/60 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="hero-icon inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 mb-6">
            <span className="text-4xl">🎨</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">Canvas Builder</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
            Build complete web applications with AI-powered code generation
          </p>
        </div>
      </section>

      {/* Quick Start CTA */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border border-purple-500/30 backdrop-blur-sm overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Ready to Build?</h2>
              <p className="text-gray-400 mb-6">Jump right in and start creating your first app with Canvas Builder.</p>
              <Link href="/canvas-app" className="launch-btn inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                <Rocket className="launch-icon w-5 h-5" />
                Launch Canvas Builder
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* SVG Decorative Line */}
          <svg className="absolute left-1/2 -translate-x-1/2 -top-4 h-1 w-1/3 opacity-30" preserveAspectRatio="none">
            <line className="draw-line" x1="0" y1="0" x2="100%" y2="0" stroke="url(#canvasGrad)" strokeWidth="2" />
            <defs>
              <linearGradient id="canvasGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="feature-card draggable-card group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="step-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex items-start gap-6">
                  <div className={`step-number w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">What You Can Build</h2>
          <div className="usecases-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="usecase-card relative p-5 rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                <div className="text-3xl mb-3">{useCase.icon}</div>
                <h3 className="font-bold text-white mb-1">{useCase.title}</h3>
                <p className="text-sm text-gray-400">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Generated Tech Stack</h2>
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {techStack.map((tech, idx) => (
                <div key={idx} className="tech-item text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
                  <div className="text-3xl mb-2">{tech.icon}</div>
                  <h4 className="font-bold text-white text-sm">{tech.name}</h4>
                  <p className="text-xs text-gray-500">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-10 rounded-3xl bg-gradient-to-br from-purple-900/30 to-fuchsia-900/30 border border-purple-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Building Now</h2>
              <p className="text-gray-400 mb-6">Transform your ideas into working applications in minutes.</p>
              <Link href="/canvas-app" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                🚀 Launch Canvas Builder
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
