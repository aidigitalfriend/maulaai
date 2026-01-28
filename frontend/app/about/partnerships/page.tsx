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
import { ArrowLeft, Cloud, Zap, Globe, Link2, Award, Users, ArrowRight, Handshake, Building2, Sparkles, Shield, Rocket, Target } from 'lucide-react';

export default function PartnershipsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const [isClient, setIsClient] = useState(false);

  const technologyPartners = [
    { name: 'Google Cloud', icon: '☁️', description: 'Infrastructure and AI/ML services', details: 'Leveraging Google Cloud for scalable agent deployment.', color: '#4285f4' },
    { name: 'Amazon Web Services', icon: '⚙️', description: 'Cloud computing and storage', details: 'Using AWS for reliable hosting and data processing.', color: '#ff9900' },
    { name: 'Microsoft Azure', icon: '🔷', description: 'Enterprise cloud and AI services', details: 'Integrating Azure for advanced AI capabilities.', color: '#00a4ef' }
  ];

  const integrationPartners = [
    { name: 'Slack', icon: '💬', description: 'Team communication', color: '#4a154b' },
    { name: 'Microsoft Teams', icon: '👥', description: 'Enterprise collaboration', color: '#6264a7' },
    { name: 'Zapier', icon: '⚡', description: 'Automation platform', color: '#ff4a00' },
    { name: 'HubSpot', icon: '📊', description: 'CRM & marketing', color: '#ff7a59' }
  ];

  const resellerPartners = [
    { name: 'Accenture', icon: '🏢', description: 'Technology consulting', color: '#a100ff' },
    { name: 'Deloitte', icon: '📈', description: 'Professional services', color: '#86bc25' },
    { name: 'IBM Consulting', icon: '🔧', description: 'Enterprise solutions', color: '#0530ad' }
  ];

  const stats = [
    { value: 50, suffix: '+', label: 'Active Partnerships', color: '#00d4ff' },
    { value: 150, suffix: '+', label: 'Countries Reached', color: '#a855f7' },
    { value: 10, suffix: 'K+', label: 'Enterprises Supported', color: '#00ff88' },
    { value: 99.99, suffix: '%', label: 'Uptime SLA', color: '#f59e0b' }
  ];

  const benefits = [
    { icon: Award, title: 'Certified Partners', desc: 'Access to official certifications and training', color: '#00d4ff' },
    { icon: Users, title: 'Dedicated Support', desc: 'Priority support for all partner integrations', color: '#a855f7' },
    { icon: Zap, title: 'Early Access', desc: 'First to receive new features and updates', color: '#00ff88' },
    { icon: Globe, title: 'Co-Marketing', desc: 'Joint marketing opportunities and exposure', color: '#f59e0b' }
  ];

  const partnerLogos = [
    { name: 'AWS', color: '#ff9900' },
    { name: 'GCP', color: '#4285f4' },
    { name: 'Azure', color: '#00a4ef' },
    { name: 'Slack', color: '#4a154b' },
    { name: 'Zoom', color: '#2d8cff' },
    { name: 'SAP', color: '#0faaff' },
  ];

  // Register CustomBounce/CustomWiggle on client only
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      CustomBounce.create('partnerBounce', { strength: 0.6, squash: 1.2 });
      CustomWiggle.create('partnerWiggle', { wiggles: 5, type: 'anticipate' });
    }
  }, []);

  useGSAP(() => {
    if (!isClient) return;
    
    // ====== EFFECT 1: SplitText Hero Title - Immediate Animation ======
    if (heroTitleRef.current) {
      const split = new SplitText(heroTitleRef.current, { type: 'chars,words' });
      gsap.fromTo(split.chars,
        { opacity: 0, y: 60, scale: 0.7, transformPerspective: 1000 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.04, duration: 0.8, ease: 'back.out(1.7)', delay: 0.3 }
      );
    }

    // ====== EFFECT 2: ScrambleText Badge - Immediate ======
    gsap.to('.partner-badge-text', {
      scrambleText: { text: 'Our Partners', chars: 'PARTNERSHIP01234', speed: 0.4 },
      duration: 1.5,
      delay: 0.2,
    });

    // ====== EFFECT 3: Hero subtitle - Immediate ======
    gsap.fromTo('.hero-subtitle',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.6, ease: 'power3.out' }
    );

    // ====== EFFECT 4: Back button - Immediate ======
    gsap.fromTo('.back-button',
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: 'power3.out' }
    );

    // ====== EFFECT 5: Stats counter with scroll reverse ======
    const statElements = document.querySelectorAll('.stat-value');
    statElements.forEach((el, i) => {
      const target = stats[i];
      const obj = { value: 0 };
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        end: 'top 20%',
        toggleActions: 'play reverse play reverse',
        onEnter: () => {
          gsap.to(obj, {
            value: target.value, duration: 1.8, ease: 'power2.out',
            onUpdate: () => { el.textContent = target.value < 100 ? `${obj.value.toFixed(2)}${target.suffix}` : `${Math.round(obj.value)}${target.suffix}`; },
          });
        },
        onLeaveBack: () => {
          gsap.to(obj, {
            value: 0, duration: 0.6, ease: 'power2.in',
            onUpdate: () => { el.textContent = target.value < 100 ? `${obj.value.toFixed(2)}${target.suffix}` : `${Math.round(obj.value)}${target.suffix}`; },
          });
        },
      });
    });

    // ====== EFFECT 6: Stats cards with scroll reverse ======
    gsap.set('.stat-card', { y: 50, opacity: 0, scale: 0.85 });
    ScrollTrigger.create({
      trigger: '.stats-grid',
      start: 'top 85%',
      end: 'top 15%',
      toggleActions: 'play reverse play reverse',
      onEnter: () => gsap.to('.stat-card', { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.7, ease: 'back.out(1.5)' }),
      onLeaveBack: () => gsap.to('.stat-card', { y: 50, opacity: 0, scale: 0.85, stagger: 0.05, duration: 0.5, ease: 'power2.in' }),
    });

    // ====== EFFECT 7: Partner cards with scroll reverse ======
    gsap.set('.partner-card', { opacity: 0, rotationY: -60, transformPerspective: 1000, transformOrigin: 'left center' });
    ScrollTrigger.create({
      trigger: '.tech-partners',
      start: 'top 85%',
      end: 'top 15%',
      toggleActions: 'play reverse play reverse',
      onEnter: () => gsap.to('.partner-card', { opacity: 1, rotationY: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' }),
      onLeaveBack: () => gsap.to('.partner-card', { opacity: 0, rotationY: -60, stagger: 0.08, duration: 0.5, ease: 'power2.in' }),
    });

    // ====== EFFECT 8: Partner icon pulse on hover ======
    const partnerCards = document.querySelectorAll('.partner-card');
    partnerCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card.querySelector('.partner-icon'), { scale: 1.3, rotation: 10, duration: 0.4, ease: 'power2.out' });
        gsap.to(card, { borderColor: 'rgba(0, 212, 255, 0.4)', duration: 0.3 });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card.querySelector('.partner-icon'), { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' });
        gsap.to(card, { borderColor: 'rgba(255, 255, 255, 0.08)', duration: 0.3 });
      });
    });

    // ====== EFFECT 9: Integration grid with scroll reverse ======
    gsap.set('.integration-card', { opacity: 0, scale: 0.7, rotation: (i) => (i % 2 === 0 ? -15 : 15) });
    ScrollTrigger.create({
      trigger: '.integrations-grid',
      start: 'top 85%',
      end: 'top 15%',
      toggleActions: 'play reverse play reverse',
      onEnter: () => gsap.to('.integration-card', { opacity: 1, scale: 1, rotation: 0, stagger: { amount: 0.5, from: 'random' }, duration: 0.7, ease: 'back.out(1.5)' }),
      onLeaveBack: () => gsap.to('.integration-card', { opacity: 0, scale: 0.7, rotation: (i) => (i % 2 === 0 ? -15 : 15), stagger: 0.05, duration: 0.5, ease: 'power2.in' }),
    });

    // ====== EFFECT 10: Integration card wiggle on hover ======
    const integrationCards = document.querySelectorAll('.integration-card');
    integrationCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { rotation: 'random(-5, 5)', ease: 'partnerWiggle', duration: 0.5 });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotation: 0, duration: 0.3 });
      });
    });

    // ====== EFFECT 11: Reseller cards with scroll reverse ======
    gsap.set('.reseller-card', { opacity: 0, y: -60 });
    ScrollTrigger.create({
      trigger: '.reseller-section',
      start: 'top 85%',
      end: 'top 15%',
      toggleActions: 'play reverse play reverse',
      onEnter: () => gsap.to('.reseller-card', { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' }),
      onLeaveBack: () => gsap.to('.reseller-card', { opacity: 0, y: -60, stagger: 0.06, duration: 0.5, ease: 'power2.in' }),
    });

    // ====== EFFECT 12: Benefits grid with scroll reverse ======
    gsap.set('.benefit-card', { opacity: 0, x: (i) => (i % 2 === 0 ? -50 : 50) });
    ScrollTrigger.create({
      trigger: '.benefits-grid',
      start: 'top 85%',
      end: 'top 15%',
      toggleActions: 'play reverse play reverse',
      onEnter: () => gsap.to('.benefit-card', { opacity: 1, x: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }),
      onLeaveBack: () => gsap.to('.benefit-card', { opacity: 0, x: (i) => (i % 2 === 0 ? -50 : 50), stagger: 0.05, duration: 0.5, ease: 'power2.in' }),
    });

    // ====== EFFECT 13: Benefit icons with scroll reverse ======
    ScrollTrigger.create({
      trigger: '.benefits-grid',
      start: 'top 80%',
      end: 'top 20%',
      toggleActions: 'play reverse play reverse',
      onEnter: () => gsap.to('.benefit-icon', { rotation: 12, ease: 'partnerWiggle', duration: 0.6 }),
      onLeaveBack: () => gsap.to('.benefit-icon', { rotation: 0, duration: 0.3 }),
    });

    // ====== EFFECT 14: Floating background orbs ======
    gsap.to('.floating-orb', {
      y: -50,
      duration: 4.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      stagger: { each: 0.9, from: 'random' },
    });

    // ====== EFFECT 15: CTA parallax effect ======
    gsap.to('.cta-bg', {
      y: -70,
      ease: 'none',
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });

    // ====== EFFECT 16: Progress bar scroll indicator ======
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

    // ====== EFFECT 17: Logo marquee animation ======
    gsap.to('.logo-track', {
      x: '-50%',
      duration: 20,
      ease: 'none',
      repeat: -1,
    });

  }, { scope: containerRef, dependencies: [isClient] });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); transform: translateY(-4px); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Progress Bar */}
      <div className="progress-bar fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] z-50 scale-x-0" />

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb absolute top-1/4 left-1/5 w-80 h-80 bg-[#00ff88]/8 rounded-full blur-3xl" />
        <div className="floating-orb absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#00d4ff]/8 rounded-full blur-3xl" />
        <div className="floating-orb absolute top-2/3 left-1/3 w-64 h-64 bg-[#a855f7]/8 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,255,136,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/about" className="back-button inline-flex items-center gap-2 text-gray-400 hover:text-[#00ff88] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to About
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6">
              <Handshake className="w-4 h-4 text-[#00ff88]" />
              <span className="partner-badge-text text-gray-300"></span>
            </div>
            <h1 ref={heroTitleRef} className="text-5xl md:text-7xl font-bold mb-6 metallic-text">Partnerships</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Building the future of AI together with industry leaders and innovators
            </p>
          </div>
        </div>
      </section>

      {/* Logo Marquee */}
      <section className="py-8 border-y border-white/5 overflow-hidden">
        <div className="logo-track flex gap-12 whitespace-nowrap">
          {[...partnerLogos, ...partnerLogos].map((logo, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-lg">
              <div className="w-3 h-3 rounded-full" style={{ background: logo.color }} />
              <span className="text-white font-semibold">{logo.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card glass-card rounded-2xl p-6 text-center">
                <div className="stat-value text-3xl md:text-4xl font-bold mb-2" style={{ color: stat.color }}>
                  0
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-24 px-6 tech-partners">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Technology Partners</h2>
            <p className="text-gray-400">World-class infrastructure powering our platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {technologyPartners.map((partner, i) => (
              <div key={i} className="partner-card glass-card rounded-2xl p-8">
                <div className="partner-icon text-4xl mb-4">{partner.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{partner.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{partner.description}</p>
                <p className="text-gray-400 text-sm">{partner.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Integration Partners</h2>
            <p className="text-gray-400">Seamless connections with your favorite tools</p>
          </div>
          <div className="integrations-grid grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrationPartners.map((partner, i) => (
              <div key={i} className="integration-card glass-card rounded-xl p-6 text-center cursor-pointer">
                <div className="text-3xl mb-3">{partner.icon}</div>
                <h4 className="font-bold text-white mb-1">{partner.name}</h4>
                <p className="text-gray-500 text-sm">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reseller Partners */}
      <section className="py-24 px-6 reseller-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Channel Partners</h2>
            <p className="text-gray-400">Global consulting and implementation partners</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resellerPartners.map((partner, i) => (
              <div key={i} className="reseller-card glass-card rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">{partner.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{partner.name}</h3>
                <p className="text-gray-500 text-sm">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Partner Benefits</h2>
            <p className="text-gray-400">Why companies choose to partner with us</p>
          </div>
          <div className="benefits-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="benefit-card glass-card rounded-xl p-6">
                  <Icon className="benefit-icon w-8 h-8 mb-4" style={{ color: benefit.color }} />
                  <h4 className="font-bold text-white mb-2">{benefit.title}</h4>
                  <p className="text-gray-500 text-sm">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-24 px-6 relative overflow-hidden">
        <div className="cta-bg absolute inset-0 bg-gradient-to-br from-[#00ff88]/10 via-transparent to-[#00d4ff]/10" />
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center relative z-10">
          <h2 className="text-2xl font-bold metallic-text mb-4">Become a Partner</h2>
          <p className="text-gray-400 mb-8">Join our ecosystem and grow together with One Last AI</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-xl font-semibold text-black hover:opacity-90 transition-all">
              Apply for Partnership
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
