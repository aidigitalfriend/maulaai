'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import Link from 'next/link';

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      title: "About Us",
      description: "Learn about our mission, vision, and the story behind our AI agent platform.",
      icon: "🏢",
      href: "/about/overview",
      gradient: 'from-cyan-500 to-blue-600',
      highlights: ["Company Mission", "Our Vision", "Core Values", "Company History"]
    },
    {
      title: "Meet the Team",
      description: "Get to know the talented individuals driving innovation in AI technology.",
      icon: "👥",
      href: "/about/team",
      gradient: 'from-purple-500 to-pink-600',
      highlights: ["Leadership Team", "Engineering", "Research", "Customer Success"]
    },
    {
      title: "Partnerships",
      description: "Discover our strategic partnerships and ecosystem of collaborators.",
      icon: "🤝",
      href: "/about/partnerships",
      gradient: 'from-amber-500 to-orange-600',
      highlights: ["Technology Partners", "Integration Partners", "Channel Partners", "Academic Research"]
    }
  ];

  const stats = [
    { number: "50M+", label: "Conversations Processed", icon: "💬" },
    { number: "10K+", label: "Active Users", icon: "👥" },
    { number: "99.9%", label: "Uptime", icon: "⚡" },
    { number: "150+", label: "Countries Served", icon: "🌍" }
  ];

  const values = [
    { icon: '🎯', title: 'Innovation', desc: 'Continuously pushing the boundaries of what\'s possible with AI technology.' },
    { icon: '🛡️', title: 'Trust', desc: 'Building secure, reliable, and transparent AI solutions you can depend on.' },
    { icon: '🚀', title: 'Excellence', desc: 'Delivering exceptional experiences that exceed expectations every time.' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero animations
      const heroTitle = new SplitText('.hero-title-text', { type: 'chars,words' });
      const heroSubtitle = new SplitText('.hero-subtitle-text', { type: 'words' });

      gsap.set(heroTitle.chars, { y: 80, opacity: 0, rotateX: -90 });
      gsap.set(heroSubtitle.words, { y: 30, opacity: 0 });
      gsap.set('.hero-badge', { scale: 0, opacity: 0 });
      gsap.set('.hero-line', { scaleX: 0 });

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      heroTl
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.02 })
        .to(heroSubtitle.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.03 }, '-=0.4')
        .to('.hero-line', { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.3')
        .to('.hero-badge', { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' }, '-=0.4');

      // Mission card
      gsap.set('.mission-card', { y: 80, opacity: 0, scale: 0.95 });
      ScrollTrigger.create({
        trigger: '.mission-card',
        start: 'top 85%',
        onEnter: () => {
          gsap.to('.mission-card', { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' });
        }
      });

      // Stats counter animation
      gsap.utils.toArray<HTMLElement>('.stat-item').forEach((stat, i) => {
        gsap.set(stat, { y: 60, opacity: 0 });
        ScrollTrigger.create({
          trigger: stat,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(stat, { y: 0, opacity: 1, duration: 0.6, delay: i * 0.1, ease: 'power3.out' });
            // Animate number
            const numberEl = stat.querySelector('.stat-number');
            if (numberEl) {
              gsap.fromTo(numberEl, { scale: 0.5 }, { scale: 1, duration: 0.5, delay: i * 0.1 + 0.2, ease: 'back.out(1.7)' });
            }
          }
        });
      });

      // Section cards
      gsap.utils.toArray<HTMLElement>('.section-card').forEach((card, i) => {
        gsap.set(card, { y: 100, opacity: 0, scale: 0.9 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(card, { y: 0, opacity: 1, scale: 1, duration: 0.7, delay: i * 0.15, ease: 'power3.out' });
          }
        });

        // Parallax icon
        gsap.to(card.querySelector('.card-icon'), {
          y: -30,
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      });

      // Values section
      gsap.set('.values-section', { y: 80, opacity: 0 });
      ScrollTrigger.create({
        trigger: '.values-section',
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.values-section', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
          gsap.to('.value-item', { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, delay: 0.3, ease: 'power3.out' });
        }
      });
      gsap.set('.value-item', { y: 40, opacity: 0 });

      // Floating particles
      gsap.utils.toArray<HTMLElement>('.particle').forEach((particle, i) => {
        gsap.to(particle, {
          y: 'random(-60, 60)',
          x: 'random(-40, 40)',
          duration: 'random(4, 7)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Hover animations
  const handleCardHover = (e: React.MouseEvent, entering: boolean) => {
    const card = e.currentTarget;
    gsap.to(card, { y: entering ? -12 : 0, scale: entering ? 1.02 : 1, duration: 0.4, ease: 'power2.out' });
    gsap.to(card.querySelector('.card-icon'), { scale: entering ? 1.3 : 1, rotate: entering ? 15 : 0, duration: 0.4, ease: 'back.out(1.7)' });
    gsap.to(card.querySelector('.card-arrow'), { x: entering ? 8 : 0, opacity: entering ? 1 : 0.5, duration: 0.3 });
    gsap.to(card.querySelector('.card-glow'), { opacity: entering ? 1 : 0, scale: entering ? 1 : 0.8, duration: 0.4 });
  };

  const handleStatHover = (e: React.MouseEvent, entering: boolean) => {
    gsap.to(e.currentTarget, { scale: entering ? 1.1 : 1, duration: 0.3, ease: 'power2.out' });
    gsap.to(e.currentTarget.querySelector('.stat-icon'), { scale: entering ? 1.3 : 1, rotate: entering ? 360 : 0, duration: 0.5 });
  };

  const handleValueHover = (e: React.MouseEvent, entering: boolean) => {
    gsap.to(e.currentTarget, { y: entering ? -8 : 0, scale: entering ? 1.05 : 1, duration: 0.3 });
    gsap.to(e.currentTarget.querySelector('.value-icon'), { scale: entering ? 1.4 : 1, rotate: entering ? 20 : 0, duration: 0.4, ease: 'back.out(2)' });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="particle absolute w-2 h-2 bg-cyan-400/30 rounded-full" style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 4) * 15}%` }} />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="flex justify-center gap-3 mb-8">
            <span className="hero-badge px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono">COMPANY_PROFILE</span>
            <span className="hero-badge px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-mono">v2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title-text bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">About Us</span>
          </h1>
          <div className="hero-line w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mb-6" />
          <p className="hero-subtitle-text text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We're building the future of AI agents, empowering businesses to automate and scale with intelligent conversational AI.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </section>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Mission Card */}
        <div className="mission-card relative mb-20 p-10 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-xl" />
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono mb-6">MISSION_STATEMENT</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Our Mission</h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-4">
              To democratize access to advanced AI technology by creating intelligent agents that understand, learn, and adapt to help businesses achieve their goals more efficiently.
            </p>
            <p className="text-gray-500">We believe that AI should be accessible, transparent, and designed to augment human capabilities rather than replace them.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="stat-item text-center p-6 rounded-2xl bg-gradient-to-br from-gray-900/60 to-gray-800/30 border border-gray-700/50 cursor-pointer"
              onMouseEnter={(e) => handleStatHover(e, true)}
              onMouseLeave={(e) => handleStatHover(e, false)}
            >
              <div className="stat-icon text-3xl mb-3 inline-block">{stat.icon}</div>
              <div className="stat-number text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">{stat.number}</div>
              <div className="text-gray-500 text-sm font-mono">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {sections.map((section, i) => (
            <Link
              key={i}
              href={section.href}
              className="section-card group relative"
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden h-full">
                <div className={`card-glow absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 blur-xl`} style={{ transform: 'scale(0.8)' }} />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="card-icon text-5xl">{section.icon}</div>
                    <span className="card-arrow text-cyan-400 opacity-50 text-2xl">→</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{section.title}</h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">{section.description}</p>
                  <ul className="space-y-2">
                    {section.highlights.map((h, j) => (
                      <li key={j} className="flex items-center text-sm text-gray-500">
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${section.gradient} mr-3`} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Values Section */}
        <section className="values-section relative p-10 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.1'%3E%3Cpath d='M36 34h-2v-4h2v4zm0-8h-2v-4h2v4zm-8 8h-2v-4h2v4zm0-8h-2v-4h2v4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }} />
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-white">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v, i) => (
                <div
                  key={i}
                  className="value-item text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm cursor-pointer"
                  onMouseEnter={(e) => handleValueHover(e, true)}
                  onMouseLeave={(e) => handleValueHover(e, false)}
                >
                  <div className="value-icon text-4xl mb-4 inline-block">{v.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-white">{v.title}</h3>
                  <p className="text-white/80">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="h-20" />
    </div>
  );
}
