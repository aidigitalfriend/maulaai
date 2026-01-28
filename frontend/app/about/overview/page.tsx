'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  ScrambleTextPlugin,
  TextPlugin,
  Observer,
  CustomBounce,
  CustomWiggle,
} from '@/lib/gsap-plugins';
import { ArrowLeft, Heart, Zap, Shield, Lightbulb, Users, Star, Award, Globe, Target, Rocket, Eye, TrendingUp, Code, Cpu, Brain } from 'lucide-react';

// Register custom eases
gsap.registerPlugin(CustomBounce, CustomWiggle);
CustomBounce.create('overviewBounce', { strength: 0.5, squash: 1.5 });
CustomWiggle.create('overviewWiggle', { wiggles: 4, type: 'uniform' });

export default function AboutOverviewPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);

  const values = [
    { icon: Heart, title: 'User-First', desc: 'Every decision starts with our users in mind', color: '#ec4899' },
    { icon: Zap, title: 'Innovation', desc: 'Constantly pushing the boundaries of AI', color: '#f59e0b' },
    { icon: Shield, title: 'Trust', desc: 'Building secure and reliable AI systems', color: '#00d4ff' },
    { icon: Lightbulb, title: 'Transparency', desc: 'Open and honest about our technology', color: '#00ff88' },
    { icon: Users, title: 'Collaboration', desc: 'Better together, with our users and partners', color: '#a855f7' },
    { icon: Star, title: 'Excellence', desc: 'Striving for the highest quality in all we do', color: '#6366f1' }
  ];

  const milestones = [
    { year: '2023', title: 'Founded', desc: 'One Last AI was founded with a vision to democratize AI access', icon: Rocket },
    { year: '2024', title: 'First Million', desc: 'Reached 1 million conversations processed globally', icon: TrendingUp },
    { year: '2025', title: 'Global Expansion', desc: 'Expanded to 150+ countries with enterprise features', icon: Globe },
    { year: '2026', title: 'The Future', desc: 'Continuing to innovate with next-gen AI capabilities', icon: Brain }
  ];

  const platforms = [
    { name: 'OpenAI', desc: 'GPT-4 and beyond', color: '#00d4ff' },
    { name: 'Anthropic', desc: 'Claude models', color: '#a855f7' },
    { name: 'Google', desc: 'Gemini AI', color: '#00ff88' },
    { name: 'Mistral', desc: 'Open-weight models', color: '#f59e0b' },
    { name: 'xAI', desc: 'Grok models', color: '#ef4444' },
    { name: 'Meta', desc: 'Llama models', color: '#6366f1' }
  ];

  const techStats = [
    { value: 99.99, suffix: '%', label: 'Uptime SLA', color: '#00ff88' },
    { value: 50, suffix: 'ms', label: 'Avg Response', color: '#00d4ff' },
    { value: 10, suffix: 'M+', label: 'API Calls/Day', color: '#a855f7' },
    { value: 256, suffix: '-bit', label: 'Encryption', color: '#f59e0b' },
  ];

  useGSAP(() => {
    // ====== EFFECT 1: SplitText Hero Title with 3D rotation ======
    if (heroTitleRef.current) {
      const split = new SplitText(heroTitleRef.current, { type: 'chars,words' });
      gsap.from(split.chars, {
        opacity: 0,
        y: 100,
        rotationX: -90,
        stagger: 0.03,
        duration: 1,
        ease: 'back.out(1.7)',
        delay: 0.4,
      });
    }

    // ====== EFFECT 2: ScrambleText Badge ======
    gsap.to('.overview-badge-text', {
      scrambleText: {
        text: 'Company Overview',
        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234',
        speed: 0.3,
      },
      duration: 1.5,
      delay: 0.3,
    });

    // ====== EFFECT 3: Hero subtitle blur-in ======
    gsap.from('.hero-subtitle', {
      opacity: 0,
      y: 40,
      filter: 'blur(15px)',
      duration: 1.2,
      delay: 0.8,
      ease: 'power3.out',
    });

    // ====== EFFECT 4: Back button slide in ======
    gsap.from('.back-button', {
      x: -50,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
    });

    // ====== EFFECT 5: Mission cards with 3D perspective ======
    gsap.from('.mission-card', {
      opacity: 0,
      y: 60,
      rotationY: -15,
      transformPerspective: 1000,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.mission-grid',
        start: 'top 80%',
      },
    });

    // ====== EFFECT 6: Mission icons wiggle on enter ======
    ScrollTrigger.create({
      trigger: '.mission-grid',
      start: 'top 80%',
      onEnter: () => {
        gsap.to('.mission-icon', {
          rotation: 'random(-10, 10)',
          ease: 'overviewWiggle',
          duration: 0.8,
        });
      },
    });

    // ====== EFFECT 7: Values grid with CustomBounce stagger ======
    gsap.from('.value-card', {
      y: 80,
      opacity: 0,
      scale: 0.7,
      stagger: {
        amount: 0.6,
        grid: [2, 3],
        from: 'start',
      },
      duration: 1,
      ease: 'overviewBounce',
      scrollTrigger: {
        trigger: '.values-grid',
        start: 'top 80%',
      },
    });

    // ====== EFFECT 8: Value icons pulse on hover ======
    const valueCards = document.querySelectorAll('.value-card');
    valueCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card.querySelector('.value-icon'), {
          scale: 1.2,
          rotation: 360,
          duration: 0.5,
          ease: 'power2.out',
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card.querySelector('.value-icon'), {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    });

    // ====== EFFECT 9: Timeline draw line effect ======
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

    // ====== EFFECT 10: Milestone items slide from alternate sides ======
    gsap.from('.milestone-item', {
      opacity: 0,
      x: (i) => (i % 2 === 0 ? -100 : 100),
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.timeline-section',
        start: 'top 80%',
      },
    });

    // ====== EFFECT 11: Milestone year counter ======
    const yearElements = document.querySelectorAll('.milestone-year');
    yearElements.forEach((el, i) => {
      const targetYear = parseInt(milestones[i].year);
      const obj = { value: 2020 };
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(obj, {
            value: targetYear,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.value).toString();
            },
          });
        },
        once: true,
      });
    });

    // ====== EFFECT 12: Platforms grid elastic stagger ======
    gsap.from('.platform-card', {
      opacity: 0,
      scale: 0,
      rotation: -45,
      stagger: {
        amount: 0.8,
        from: 'random',
      },
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
      scrollTrigger: {
        trigger: '.platforms-grid',
        start: 'top 85%',
      },
    });

    // ====== EFFECT 13: Tech stats counter animation ======
    const statElements = document.querySelectorAll('.tech-stat-value');
    statElements.forEach((el, i) => {
      const target = techStats[i];
      const obj = { value: 0 };
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(obj, {
            value: target.value,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              if (target.value < 100) {
                el.textContent = `${obj.value.toFixed(2)}${target.suffix}`;
              } else {
                el.textContent = `${Math.round(obj.value)}${target.suffix}`;
              }
            },
          });
        },
        once: true,
      });
    });

    // ====== EFFECT 14: Floating background orbs ======
    gsap.to('.floating-orb', {
      y: -40,
      duration: 4,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      stagger: {
        each: 0.8,
        from: 'random',
      },
    });

    // ====== EFFECT 15: CTA parallax background ======
    gsap.to('.cta-bg', {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });

    // ====== EFFECT 16: Observer scroll direction indicator ======
    Observer.create({
      target: containerRef.current,
      type: 'scroll',
      onChangeY: (self) => {
        const direction = self.deltaY > 0 ? 1 : -1;
        gsap.to('.progress-bar', {
          scaleX: window.scrollY / (document.body.scrollHeight - window.innerHeight),
          transformOrigin: 'left',
          duration: 0.3,
        });
      },
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); transform: translateY(-4px); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Progress Bar */}
      <div className="progress-bar fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] z-50 scale-x-0" />

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb absolute top-1/3 left-1/4 w-72 h-72 bg-[#00d4ff]/8 rounded-full blur-3xl" />
        <div className="floating-orb absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#a855f7]/8 rounded-full blur-3xl" />
        <div className="floating-orb absolute top-2/3 right-1/4 w-64 h-64 bg-[#00ff88]/8 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/about" className="back-button inline-flex items-center gap-2 text-gray-400 hover:text-[#00d4ff] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to About
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6">
              <Globe className="w-4 h-4 text-[#00d4ff]" />
              <span className="overview-badge-text text-gray-300"></span>
            </div>
            <h1 ref={heroTitleRef} className="text-5xl md:text-7xl font-bold mb-6 metallic-text">Our Story</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              From a vision to democratize AI to a platform serving millions worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stats */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStats.map((stat, i) => (
              <div key={i} className="glass-card rounded-xl p-5 text-center">
                <div className="tech-stat-value text-2xl md:text-3xl font-bold mb-1" style={{ color: stat.color }}>
                  0
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mission-grid grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="mission-card glass-card rounded-2xl p-8">
              <div className="mission-icon w-14 h-14 bg-[#00d4ff]/20 rounded-xl flex items-center justify-center mb-6 border border-[#00d4ff]/40">
                <Target className="w-7 h-7 text-[#00d4ff]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                To democratize access to artificial intelligence by providing intuitive, powerful, and 
                accessible AI agents that empower individuals and businesses to achieve more. We believe 
                AI should be a tool that augments human capability, not replaces it.
              </p>
            </div>
            <div className="mission-card glass-card rounded-2xl p-8">
              <div className="mission-icon w-14 h-14 bg-[#a855f7]/20 rounded-xl flex items-center justify-center mb-6 border border-[#a855f7]/40">
                <Eye className="w-7 h-7 text-[#a855f7]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-gray-400 leading-relaxed">
                A world where everyone has access to intelligent AI assistance that helps them learn, 
                create, and solve problems more effectively. We envision AI as a collaborative partner 
                that enhances human potential across all domains of life and work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Our Core Values</h2>
            <p className="text-gray-400">The principles that guide our decisions and actions</p>
          </div>
          <div className="values-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="value-card glass-card rounded-2xl p-6 cursor-pointer">
                  <div className="value-icon w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${value.color}20`, border: `1px solid ${value.color}40` }}>
                    <Icon className="w-6 h-6" style={{ color: value.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-gray-500 text-sm">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 timeline-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Our Journey</h2>
            <p className="text-gray-400">Key milestones in our story</p>
          </div>
          <div className="relative">
            <div className="timeline-line absolute left-8 md:left-1/2 md:-translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00d4ff] via-[#a855f7] to-[#00ff88]" />
            <div className="space-y-8">
              {milestones.map((milestone, i) => {
                const Icon = milestone.icon;
                return (
                  <div key={i} className={`milestone-item relative flex gap-6 items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`hidden md:block w-1/2 ${i % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="glass-card rounded-xl p-6 inline-block">
                        <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                        <p className="text-gray-400 text-sm">{milestone.desc}</p>
                      </div>
                    </div>
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-[#0a0a0a] border-2 border-[#00d4ff] flex items-center justify-center z-10">
                      <span className="milestone-year font-bold text-[#00d4ff]">2020</span>
                    </div>
                    <div className="md:w-1/2 pl-20 md:pl-8">
                      <div className="glass-card rounded-xl p-6 md:hidden">
                        <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                        <p className="text-gray-400 text-sm">{milestone.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Powered By Leading AI</h2>
            <p className="text-gray-400">We integrate with the world&apos;s most advanced AI platforms</p>
          </div>
          <div className="platforms-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {platforms.map((platform, i) => (
              <div key={i} className="platform-card glass-card rounded-xl p-4 text-center">
                <div className="text-lg font-bold mb-1" style={{ color: platform.color }}>{platform.name}</div>
                <div className="text-gray-500 text-xs">{platform.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-24 px-6 relative overflow-hidden">
        <div className="cta-bg absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-transparent to-[#a855f7]/10" />
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center relative z-10">
          <h2 className="text-2xl font-bold metallic-text mb-4">Ready to Experience the Future?</h2>
          <p className="text-gray-400 mb-8">Join thousands of users already transforming their work with AI</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold hover:opacity-90 transition-all">
              Explore Agents
            </Link>
            <Link href="/about/team" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Meet the Team →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
