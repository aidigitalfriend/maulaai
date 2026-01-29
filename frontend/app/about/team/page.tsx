'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import Link from 'next/link';

export default function TeamPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const teamMembers = [
    { name: "Shahbaz Chaudhry", role: "CEO & Co-founder", bio: "AI researcher with 15+ years of experience", gradient: 'from-cyan-500 to-blue-600' },
    { name: "Adil Pieter", role: "CTO & Co-founder", bio: "Machine learning expert and former Google AI researcher", gradient: 'from-purple-500 to-pink-600' },
    { name: "Zara Faisal", role: "VP of Product", bio: "Product leader focused on user experience", gradient: 'from-amber-500 to-orange-600' },
    { name: "Sarah Williams", role: "VP of Sales", bio: "Enterprise sales veteran with deep market knowledge", gradient: 'from-green-500 to-emerald-600' },
    { name: "Emily Chen", role: "Lead AI Engineer", bio: "PhD in Computer Science from Stanford", gradient: 'from-rose-500 to-red-600' },
    { name: "David Rodriguez", role: "Head of Design", bio: "Design leader passionate about usability", gradient: 'from-indigo-500 to-violet-600' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero animations
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSubtitle = new SplitText('.hero-subtitle', { type: 'words' });

      gsap.set(heroTitle.chars, { y: 100, opacity: 0, rotateX: -90 });
      gsap.set(heroSubtitle.words, { y: 40, opacity: 0 });
      gsap.set('.hero-icon', { scale: 0, rotation: -180 });
      gsap.set('.hero-badge', { scale: 0, opacity: 0 });

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      heroTl
        .to('.hero-icon', { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.02 }, '-=0.4')
        .to(heroSubtitle.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.03 }, '-=0.4')
        .to('.hero-badge', { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(1.7)' }, '-=0.3');

      // Team member cards with staggered reveal
      gsap.utils.toArray<HTMLElement>('.team-card').forEach((card, i) => {
        gsap.set(card, { y: 80, opacity: 0, scale: 0.9, rotateY: -15 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(card, { 
              y: 0, 
              opacity: 1, 
              scale: 1, 
              rotateY: 0,
              duration: 0.7, 
              delay: (i % 3) * 0.15, 
              ease: 'power3.out' 
            });
          }
        });
      });

      // CTA section
      gsap.set('.cta-section', { y: 60, opacity: 0 });
      ScrollTrigger.create({
        trigger: '.cta-section',
        start: 'top 85%',
        onEnter: () => {
          gsap.to('.cta-section', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
        }
      });

      // Floating particles
      gsap.utils.toArray<HTMLElement>('.particle').forEach((p, i) => {
        gsap.to(p, {
          y: 'random(-60, 60)',
          x: 'random(-40, 40)',
          duration: 'random(4, 7)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Card hover effects
  const handleCardHover = (e: React.MouseEvent, entering: boolean) => {
    const card = e.currentTarget;
    gsap.to(card, { 
      y: entering ? -15 : 0, 
      scale: entering ? 1.05 : 1, 
      duration: 0.4,
      ease: 'power2.out'
    });
    gsap.to(card.querySelector('.avatar'), { 
      scale: entering ? 1.1 : 1, 
      rotate: entering ? 5 : 0,
      duration: 0.4, 
      ease: 'back.out(1.7)' 
    });
    gsap.to(card.querySelector('.card-glow'), { 
      opacity: entering ? 1 : 0, 
      scale: entering ? 1 : 0.8,
      duration: 0.4 
    });
    gsap.to(card.querySelector('.role-badge'), { 
      scale: entering ? 1.05 : 1,
      duration: 0.3 
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} />
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle absolute w-1.5 h-1.5 bg-purple-400/40 rounded-full" style={{ left: `${5 + i * 8}%`, top: `${10 + (i % 6) * 15}%` }} />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-16">
          <div className="hero-icon inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 mb-6">
            <span className="text-4xl">👥</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">Meet Our Team</span>
          </h1>
          <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-6">
            Talented people working toward a common goal — building the future of intelligent AI agents
          </p>
          <div className="flex justify-center gap-3">
            <span className="hero-badge px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-mono">TEAM_MEMBERS</span>
            <span className="hero-badge px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono">INNOVATORS</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </section>

      {/* Team Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, idx) => (
            <div 
              key={idx} 
              className="team-card group relative"
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center overflow-hidden">
                {/* Glow effect */}
                <div className={`card-glow absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 blur-xl`} style={{ transform: 'scale(0.8)' }} />
                
                {/* Corner accents */}
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg" />

                <div className="relative z-10">
                  {/* Avatar */}
                  <div className={`avatar w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${member.gradient} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-purple-500/20`}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{member.name}</h3>
                  
                  {/* Role badge */}
                  <div className={`role-badge inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${member.gradient} bg-opacity-20 text-white text-sm font-semibold mb-4`}>
                    {member.role}
                  </div>
                  
                  {/* Bio */}
                  <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hiring CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="cta-section relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.15'%3E%3Cpath d='M36 34h-2v-4h2v4zm0-8h-2v-4h2v4zm-8 8h-2v-4h2v4zm0-8h-2v-4h2v4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }} />
          <div className="relative z-10 text-center p-12 md:p-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <span className="text-3xl">🚀</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">We're Growing</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're actively hiring talented people to join our mission. Check out our open positions and become part of the team.
            </p>
            <Link
              href="/resources/careers"
              className="inline-flex items-center px-10 py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-2xl shadow-xl shadow-black/20 transition-all transform hover:scale-105"
            >
              View Open Positions →
            </Link>
          </div>
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}
