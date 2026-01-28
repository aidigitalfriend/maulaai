'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  ScrambleTextPlugin,
  TextPlugin,
  Observer,
  CustomEase,
  CustomBounce,
  CustomWiggle,
  Flip,
  Draggable,
} from '@/lib/gsap-plugins';
import { ArrowLeft, Users, Linkedin, Twitter, Mail, ArrowRight, Star, Briefcase, GraduationCap, Code, Heart, Rocket, Globe, Award } from 'lucide-react';

export default function TeamPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const [isClient, setIsClient] = useState(false);

  const leadership = [
    { name: 'Shahbaz Chaudhry', role: 'CEO & Co-founder', bio: 'AI researcher with 15+ years of experience building intelligent systems', color: '#00d4ff', avatar: '👨‍💼' },
    { name: 'Adil Pieter', role: 'CTO & Co-founder', bio: 'Machine learning expert and former Google AI researcher', color: '#a855f7', avatar: '👨‍💻' },
    { name: 'Zara Faisal', role: 'VP of Product', bio: 'Product leader focused on user experience and innovation', color: '#00ff88', avatar: '👩‍💼' }
  ];

  const team = [
    { name: 'Sarah Williams', role: 'VP of Sales', bio: 'Enterprise sales veteran with deep market knowledge', color: '#f59e0b', avatar: '👩‍💻' },
    { name: 'Emily Chen', role: 'Lead AI Engineer', bio: 'PhD in Computer Science from Stanford University', color: '#ec4899', avatar: '👩‍🔬' },
    { name: 'David Rodriguez', role: 'Head of Design', bio: 'Design leader passionate about usability and aesthetics', color: '#06b6d4', avatar: '👨‍🎨' }
  ];

  const departments = [
    { name: 'Engineering', count: 25, suffix: '+', color: '#00d4ff', icon: Code },
    { name: 'Product', count: 12, suffix: '', color: '#a855f7', icon: Briefcase },
    { name: 'Sales', count: 18, suffix: '', color: '#00ff88', icon: Star },
    { name: 'Research', count: 8, suffix: '', color: '#f59e0b', icon: GraduationCap },
    { name: 'Design', count: 6, suffix: '', color: '#ec4899', icon: Heart },
    { name: 'Support', count: 15, suffix: '', color: '#6366f1', icon: Users }
  ];

  const cultureHighlights = [
    { icon: Rocket, title: 'Innovation First', desc: 'We encourage bold ideas', color: '#00d4ff' },
    { icon: Globe, title: 'Remote Friendly', desc: 'Work from anywhere', color: '#a855f7' },
    { icon: Award, title: 'Growth Focused', desc: 'Continuous learning', color: '#00ff88' },
    { icon: Heart, title: 'Inclusive Culture', desc: 'Diversity matters', color: '#f59e0b' },
  ];

  // Register CustomBounce/CustomWiggle on client only
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      CustomBounce.create('teamBounce', { strength: 0.55, squash: 1.3 });
      CustomWiggle.create('teamWiggle', { wiggles: 4, type: 'uniform' });
    }
  }, []);

  useGSAP(() => {
    if (!isClient) return;

    // ====== EFFECT 1: SplitText Hero Title ======
    if (heroTitleRef.current) {
      const split = new SplitText(heroTitleRef.current, { type: 'chars,words' });
      // Set initial state immediately
      gsap.set(split.chars, { opacity: 0, y: -60, rotateX: 90, transformPerspective: 1000 });
      // Animate to visible - coming from behind
      gsap.to(split.chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.04,
        duration: 1,
        ease: 'back.out(1.7)',
        delay: 0.3,
      });
    }

    // ====== EFFECT 2: ScrambleText Badge ======
    gsap.to('.team-badge-text', {
      scrambleText: {
        text: 'Our Team',
        chars: 'TEAMWORK01234',
        speed: 0.4,
      },
      duration: 1.5,
      delay: 0.3,
    });

    // ====== EFFECT 3: Hero subtitle from behind ======
    gsap.set('.hero-subtitle', { opacity: 0, y: -20, scale: 0.9 });
    gsap.to('.hero-subtitle', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      delay: 0.6,
      ease: 'power3.out',
    });

    // ====== EFFECT 4: Back button slide ======
    gsap.from('.back-button', {
      x: -50,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
    });

    // ====== EFFECT 5: Culture highlights stagger ======
    gsap.from('.culture-card', {
      opacity: 0,
      y: 40,
      stagger: 0.1,
      duration: 0.6,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: '.culture-grid',
        start: 'top 85%',
      },
    });

    // ====== EFFECT 6: Leadership cards 3D flip entrance ======
    gsap.from('.leadership-card', {
      opacity: 0,
      rotationY: -45,
      transformPerspective: 1000,
      scale: 0.9,
      stagger: 0.2,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.leadership-grid',
        start: 'top 85%',
      },
    });

    // ====== EFFECT 7: Leadership avatar bounce on entry ======
    ScrollTrigger.create({
      trigger: '.leadership-grid',
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.leader-avatar', {
          scale: 0,
          rotation: 360,
          stagger: 0.15,
          duration: 0.8,
          ease: 'teamBounce',
        });
      },
    });

    // ====== EFFECT 8: Leadership card hover magnetic effect ======
    const leaderCards = document.querySelectorAll('.leadership-card');
    leaderCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          y: -10,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(card.querySelector('.leader-avatar'), {
          scale: 1.15,
          duration: 0.4,
          ease: 'power2.out',
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          boxShadow: 'none',
          duration: 0.3,
        });
        gsap.to(card.querySelector('.leader-avatar'), {
          scale: 1,
          duration: 0.3,
        });
      });
    });

    // ====== EFFECT 9: Social icons wiggle on hover ======
    const socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, {
          rotation: 15,
          ease: 'teamWiggle',
          duration: 0.5,
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { rotation: 0, duration: 0.3 });
      });
    });

    // ====== EFFECT 10: Team cards cascade slide ======
    gsap.from('.team-card', {
      opacity: 0,
      x: (i) => (i % 2 === 0 ? -80 : 80),
      rotationZ: (i) => (i % 2 === 0 ? -5 : 5),
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.team-grid',
        start: 'top 85%',
      },
    });

    // ====== EFFECT 11: Department counter animation ======
    const deptElements = document.querySelectorAll('.dept-count');
    deptElements.forEach((el, i) => {
      const target = departments[i];
      const obj = { value: 0 };
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(obj, {
            value: target.count,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = `${Math.round(obj.value)}${target.suffix}`;
            },
          });
        },
        once: true,
      });
    });

    // ====== EFFECT 12: Department cards elastic bounce ======
    gsap.from('.dept-card', {
      opacity: 0,
      scale: 0,
      stagger: {
        amount: 0.6,
        from: 'random',
      },
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
      scrollTrigger: {
        trigger: '.depts-grid',
        start: 'top 85%',
      },
    });

    // ====== EFFECT 13: Department icon CustomWiggle on hover ======
    const deptCards = document.querySelectorAll('.dept-card');
    deptCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card.querySelector('.dept-icon'), {
          rotation: 'random(-15, 15)',
          scale: 1.2,
          ease: 'teamWiggle',
          duration: 0.5,
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card.querySelector('.dept-icon'), {
          rotation: 0,
          scale: 1,
          duration: 0.3,
        });
      });
    });

    // ====== EFFECT 14: Floating background orbs ======
    gsap.to('.floating-orb', {
      y: -45,
      duration: 4.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      stagger: {
        each: 1,
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

    // ====== EFFECT 16: Observer scroll progress bar ======
    Observer.create({
      target: containerRef.current,
      type: 'scroll',
      onChangeY: () => {
        gsap.to('.progress-bar', {
          scaleX: window.scrollY / (document.body.scrollHeight - window.innerHeight),
          transformOrigin: 'left',
          duration: 0.3,
        });
      },
    });

    // ====== EFFECT 17: CTA buttons typewriter effect ======
    gsap.to('.cta-title', {
      text: {
        value: 'Join Our Team',
        delimiter: '',
      },
      duration: 1.5,
      ease: 'none',
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 80%',
        once: true,
      },
    });

  }, { scope: containerRef, dependencies: [isClient] });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Progress Bar */}
      <div className="progress-bar fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#a855f7] to-[#6366f1] z-50 scale-x-0" />

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb absolute top-1/4 left-1/4 w-80 h-80 bg-[#a855f7]/8 rounded-full blur-3xl" />
        <div className="floating-orb absolute bottom-1/3 right-1/3 w-96 h-96 bg-[#00d4ff]/8 rounded-full blur-3xl" />
        <div className="floating-orb absolute top-2/3 right-1/4 w-64 h-64 bg-[#00ff88]/8 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/about" className="back-button inline-flex items-center gap-2 text-gray-400 hover:text-[#a855f7] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to About
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6">
              <Users className="w-4 h-4 text-[#a855f7]" />
              <span className="team-badge-text text-gray-300"></span>
            </div>
            <h1 ref={heroTitleRef} className="text-5xl md:text-7xl font-bold mb-6 metallic-text">Meet the Team</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              The passionate people behind One Last AI driving innovation in artificial intelligence
            </p>
          </div>
        </div>
      </section>

      {/* Culture Highlights */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="culture-grid grid grid-cols-2 md:grid-cols-4 gap-4">
            {cultureHighlights.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="culture-card glass-card rounded-xl p-5 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: item.color }} />
                  <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Leadership</h2>
            <p className="text-gray-400">Visionaries leading our AI revolution</p>
          </div>
          <div className="leadership-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((person, i) => (
              <div key={i} className="leadership-card glass-card rounded-2xl p-8 text-center cursor-pointer">
                <div className="leader-avatar w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl" style={{ background: `${person.color}20`, border: `2px solid ${person.color}` }}>
                  {person.avatar}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{person.name}</h3>
                <p className="text-sm mb-4" style={{ color: person.color }}>{person.role}</p>
                <p className="text-gray-500 text-sm mb-6">{person.bio}</p>
                <div className="flex justify-center gap-3">
                  <button className="social-btn w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="social-btn w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Twitter className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="social-btn w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Key Team Members</h2>
            <p className="text-gray-400">Experts driving excellence across every department</p>
          </div>
          <div className="team-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((person, i) => (
              <div key={i} className="team-card glass-card rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: `${person.color}20`, border: `1px solid ${person.color}` }}>
                    {person.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{person.name}</h4>
                    <p className="text-sm" style={{ color: person.color }}>{person.role}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Our Departments</h2>
            <p className="text-gray-400">A growing team of talented professionals</p>
          </div>
          <div className="depts-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {departments.map((dept, i) => {
              const Icon = dept.icon;
              return (
                <div key={i} className="dept-card glass-card rounded-xl p-4 text-center cursor-pointer">
                  <Icon className="dept-icon w-6 h-6 mx-auto mb-2" style={{ color: dept.color }} />
                  <div className="dept-count text-2xl font-bold mb-1" style={{ color: dept.color }}>0</div>
                  <div className="text-gray-400 text-sm">{dept.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="cta-bg absolute inset-0 bg-gradient-to-br from-[#a855f7]/10 via-transparent to-[#6366f1]/10" />
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center relative z-10">
          <h2 className="cta-title text-2xl font-bold metallic-text mb-4"></h2>
          <p className="text-gray-400 mb-8">We&apos;re always looking for talented individuals to join our mission</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/resources/careers" className="px-8 py-4 bg-gradient-to-r from-[#a855f7] to-[#6366f1] rounded-xl font-semibold hover:opacity-90 transition-all">
              View Open Positions
            </Link>
            <Link href="/about/partnerships" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Partner With Us →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
