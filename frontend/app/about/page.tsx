'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  ScrambleTextPlugin,
  TextPlugin,
  Flip,
  Draggable,
  Observer,
  CustomBounce,
  CustomWiggle,
} from '@/lib/gsap-plugins';
import { Building2, Users, Handshake, ArrowRight, Sparkles, Globe, Shield, Zap, Rocket, Target, Heart, Award } from 'lucide-react';

// Register custom eases
gsap.registerPlugin(CustomBounce, CustomWiggle);
CustomBounce.create('myBounce', { strength: 0.6, squash: 2 });
CustomWiggle.create('myWiggle', { wiggles: 6, type: 'easeOut' });

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      title: 'About Us',
      description: 'Learn about our mission, vision, and the story behind our AI agent platform.',
      icon: Building2,
      href: '/about/overview',
      highlights: ['Company Mission', 'Our Vision', 'Core Values', 'Company History'],
      color: '#00d4ff'
    },
    {
      title: 'Meet the Team',
      description: 'Get to know the talented individuals driving innovation in AI technology.',
      icon: Users,
      href: '/about/team',
      highlights: ['Leadership Team', 'Engineering', 'Research', 'Customer Success'],
      color: '#a855f7'
    },
    {
      title: 'Partnerships',
      description: 'Discover our strategic partnerships and ecosystem of collaborators.',
      icon: Handshake,
      href: '/about/partnerships',
      highlights: ['Technology Partners', 'Integration Partners', 'Channel Partners', 'Academic Research'],
      color: '#00ff88'
    }
  ];

  const stats = [
    { number: 50000000, label: 'Conversations Processed', color: '#00d4ff', suffix: '+', prefix: '' },
    { number: 10000, label: 'Active Users', color: '#a855f7', suffix: '+', prefix: '' },
    { number: 99.9, label: 'Uptime', color: '#00ff88', suffix: '%', prefix: '' },
    { number: 150, label: 'Countries Served', color: '#f59e0b', suffix: '+', prefix: '' }
  ];

  const values = [
    { icon: Sparkles, title: 'Innovation', desc: 'Pushing the boundaries of AI technology', color: '#00d4ff' },
    { icon: Globe, title: 'Global Impact', desc: 'Serving users across 150+ countries', color: '#00ff88' },
    { icon: Shield, title: 'Trust & Security', desc: 'Enterprise-grade protection for your data', color: '#a855f7' },
    { icon: Zap, title: 'Performance', desc: 'Lightning-fast responses at scale', color: '#f59e0b' }
  ];

  const timeline = [
    { year: '2023', title: 'Founded', desc: 'One Last AI was born with a vision to democratize AI', icon: Rocket },
    { year: '2024', title: 'Global Launch', desc: 'Expanded to 50+ countries with enterprise solutions', icon: Globe },
    { year: '2025', title: '10K Users', desc: 'Reached milestone of 10,000 active users worldwide', icon: Target },
    { year: '2026', title: 'AI Revolution', desc: 'Leading the next generation of AI agents', icon: Award },
  ];

  useGSAP(() => {
    // ====== EFFECT 1: SplitText Hero Title Animation ======
    if (heroTitleRef.current) {
      const split = new SplitText(heroTitleRef.current, { type: 'chars,words' });
      gsap.from(split.chars, {
        opacity: 0,
        y: 80,
        rotateX: -90,
        stagger: 0.02,
        duration: 0.8,
        ease: 'back.out(1.7)',
        delay: 0.3,
      });
    }

    // ====== EFFECT 2: ScrambleText for Badge ======
    gsap.to('.hero-badge-text', {
      scrambleText: {
        text: 'About One Last AI',
        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        speed: 0.4,
      },
      duration: 1.5,
      delay: 0.5,
    });

    // ====== EFFECT 3: Hero subtitle fade with blur ======
    gsap.from('.hero-subtitle', {
      opacity: 0,
      y: 30,
      filter: 'blur(10px)',
      duration: 1,
      delay: 0.8,
      ease: 'power3.out',
    });

    // ====== EFFECT 4: Counter animation for stats ======
    const statElements = document.querySelectorAll('.stat-number');
    statElements.forEach((el, i) => {
      const target = stats[i];
      const obj = { value: 0 };
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(obj, {
            value: target.number,
            duration: 2.5,
            ease: 'power2.out',
            onUpdate: () => {
              if (target.number >= 1000000) {
                el.textContent = `${target.prefix}${(obj.value / 1000000).toFixed(0)}M${target.suffix}`;
              } else if (target.number >= 1000) {
                el.textContent = `${target.prefix}${(obj.value / 1000).toFixed(0)}K${target.suffix}`;
              } else if (target.number < 100) {
                el.textContent = `${target.prefix}${obj.value.toFixed(1)}${target.suffix}`;
              } else {
                el.textContent = `${target.prefix}${Math.round(obj.value)}${target.suffix}`;
              }
            },
          });
        },
        once: true,
      });
    });

    // ====== EFFECT 5: Stats cards with CustomBounce ======
    gsap.from('.stat-card', {
      y: 100,
      opacity: 0,
      scale: 0.5,
      stagger: 0.1,
      duration: 1,
      ease: 'myBounce',
      scrollTrigger: {
        trigger: '.stats-grid',
        start: 'top 85%',
      },
    });

    // ====== EFFECT 6: Section cards with stagger from center ======
    gsap.from('.section-card', {
      opacity: 0,
      scale: 0.8,
      y: 60,
      rotationY: 15,
      stagger: {
        amount: 0.6,
        from: 'center',
      },
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.sections-grid',
        start: 'top 80%',
      },
    });

    // ====== EFFECT 7: Section card icons with wiggle ======
    gsap.to('.section-icon', {
      rotation: 'random(-5, 5)',
      ease: 'myWiggle',
      duration: 0.5,
      scrollTrigger: {
        trigger: '.sections-grid',
        start: 'top 80%',
      },
    });

    // ====== EFFECT 8: Values cards slide from left with elastic ======
    gsap.from('.value-card', {
      x: -100,
      opacity: 0,
      stagger: 0.15,
      duration: 1.2,
      ease: 'elastic.out(1, 0.5)',
      scrollTrigger: {
        trigger: '.values-grid',
        start: 'top 80%',
      },
    });

    // ====== EFFECT 9: Timeline items with alternating slide ======
    gsap.from('.timeline-item', {
      opacity: 0,
      x: (i) => (i % 2 === 0 ? -80 : 80),
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.timeline-section',
        start: 'top 80%',
      },
    });

    // ====== EFFECT 10: Timeline line draw effect ======
    gsap.from('.timeline-line', {
      scaleY: 0,
      transformOrigin: 'top',
      duration: 1.5,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: '.timeline-section',
        start: 'top 80%',
      },
    });

    // ====== EFFECT 11: CTA section parallax ======
    gsap.to('.cta-bg', {
      y: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // ====== EFFECT 12: Floating orbs animation ======
    gsap.to('.floating-orb', {
      y: -30,
      duration: 3,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      stagger: {
        each: 0.5,
        from: 'random',
      },
    });

    // ====== EFFECT 13: Glow pulse on section title ======
    gsap.to('.section-title-glow', {
      textShadow: '0 0 40px rgba(0,212,255,0.8), 0 0 80px rgba(0,212,255,0.4)',
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });

    // ====== EFFECT 14: CTA buttons hover magnetic effect ======
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach((btn) => {
      btn.addEventListener('mousemove', (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = (btn as HTMLElement).getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left - rect.width / 2;
        const y = mouseEvent.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });

    // ====== EFFECT 15: Observer for scroll direction detection ======
    Observer.create({
      target: containerRef.current,
      type: 'scroll',
      onUp: () => {
        gsap.to('.scroll-indicator', { opacity: 1, duration: 0.3 });
      },
      onDown: () => {
        gsap.to('.scroll-indicator', { opacity: 0, duration: 0.3 });
      },
    });

    // ====== EFFECT 16: Typewriter effect for CTA headline ======
    gsap.to('.cta-headline', {
      text: { value: 'Join Us on Our Journey', delimiter: '' },
      duration: 1.5,
      ease: 'none',
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 80%',
      },
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); transform: translateY(-4px); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glow-text { text-shadow: 0 0 20px rgba(0,212,255,0.5); }
      `}</style>

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb absolute top-1/4 left-1/4 w-64 h-64 bg-[#00d4ff]/10 rounded-full blur-3xl" />
        <div className="floating-orb absolute top-3/4 right-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl" />
        <div className="floating-orb absolute top-1/2 right-1/3 w-48 h-48 bg-[#00ff88]/10 rounded-full blur-3xl" />
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 opacity-0">
        <span className="text-xs text-gray-500">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
          <div className="w-1.5 h-3 bg-[#00d4ff] rounded-full animate-bounce" />
        </div>
      </div>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6">
            <Building2 className="w-4 h-4 text-[#00d4ff]" />
            <span className="hero-badge-text text-gray-300"></span>
          </div>
          <h1 ref={heroTitleRef} className="text-5xl md:text-7xl font-bold mb-6 metallic-text section-title-glow">
            Building the Future of AI
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Empowering businesses and individuals with intelligent AI agents that transform the way we work, create, and innovate.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6" ref={statsRef}>
        <div className="max-w-6xl mx-auto">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card glass-card rounded-2xl p-6 text-center">
                <div className="stat-number text-3xl md:text-4xl font-bold mb-2" style={{ color: stat.color }}>
                  0
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Explore Our Story</h2>
            <p className="text-gray-400">Discover what makes One Last AI unique</p>
          </div>
          <div className="sections-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <Link key={i} href={section.href} className="section-card glass-card rounded-2xl p-8 group">
                  <div className="section-icon w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: `${section.color}20`, border: `1px solid ${section.color}40` }}>
                    <Icon className="w-7 h-7" style={{ color: section.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00d4ff] transition-colors">{section.title}</h3>
                  <p className="text-gray-500 text-sm mb-6">{section.description}</p>
                  <ul className="space-y-2 mb-6">
                    {section.highlights.map((h, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: section.color }}></div>
                        {h}
                      </li>
                    ))}
                  </ul>
                  <span className="text-sm flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: section.color }}>
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" ref={timelineRef}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold metallic-text mb-4">Our Journey</h2>
            <p className="text-gray-400">From vision to global impact</p>
          </div>
          <div className="relative">
            <div className="timeline-line absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00d4ff] via-[#a855f7] to-[#00ff88]" />
            <div className="space-y-12">
              {timeline.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`timeline-item relative flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${i % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="glass-card rounded-xl p-6">
                        <div className="text-[#00d4ff] text-sm font-bold mb-2">{item.year}</div>
                        <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#0a0a0a] border-2 border-[#00d4ff] flex items-center justify-center z-10">
                      <Icon className="w-5 h-5 text-[#00d4ff]" />
                    </div>
                    <div className="w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Our Values</h2>
            <p className="text-gray-400">The principles that guide everything we do</p>
          </div>
          <div className="values-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="value-card glass-card rounded-xl p-6">
                  <Icon className="w-8 h-8 mb-4" style={{ color: value.color }} />
                  <h4 className="font-bold text-white mb-2">{value.title}</h4>
                  <p className="text-gray-500 text-sm">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-24 px-6 relative overflow-hidden">
        <div className="cta-bg absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-transparent to-[#a855f7]/10" />
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center relative z-10">
          <h2 className="cta-headline text-2xl font-bold metallic-text mb-4"></h2>
          <p className="text-gray-400 mb-8">Be part of the AI revolution and help shape the future of intelligent technology</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/resources/careers" className="cta-button px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold hover:opacity-90 transition-all inline-block">
              View Careers
            </Link>
            <Link href="/contact" className="cta-button px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all inline-block">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
