'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin } from '@/lib/gsap';
import Link from 'next/link';


export default function PartnershipsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const technologyPartners = [
    { name: "Google Cloud", icon: "☁️", description: "Infrastructure and AI/ML services", gradient: 'from-blue-500 to-cyan-500' },
    { name: "Amazon Web Services", icon: "⚙️", description: "Cloud computing and storage solutions", gradient: 'from-orange-500 to-amber-500' },
    { name: "Microsoft Azure", icon: "🔷", description: "Enterprise cloud and AI services", gradient: 'from-blue-600 to-indigo-600' }
  ];

  const integrationPartners = [
    { name: "Slack", icon: "💬", description: "Team communication platform", gradient: 'from-purple-500 to-pink-500' },
    { name: "Microsoft Teams", icon: "👥", description: "Enterprise communication hub", gradient: 'from-blue-500 to-indigo-500' },
    { name: "Zapier", icon: "⚡", description: "Automation and workflow platform", gradient: 'from-orange-500 to-red-500' },
    { name: "HubSpot", icon: "📊", description: "CRM and marketing automation", gradient: 'from-orange-400 to-rose-500' }
  ];

  const resellerPartners = [
    { name: "Accenture", icon: "🏢", description: "Global technology consulting", gradient: 'from-purple-600 to-violet-600' },
    { name: "Deloitte", icon: "📈", description: "Professional services and consulting", gradient: 'from-green-500 to-emerald-500' },
    { name: "IBM Consulting", icon: "🔧", description: "Enterprise technology solutions", gradient: 'from-blue-600 to-sky-500' }
  ];

  const stats = [
    { number: "50+", label: "Active Partnerships", gradient: 'from-cyan-400 to-blue-500' },
    { number: "150+", label: "Countries Reached", gradient: 'from-purple-400 to-pink-500' },
    { number: "10K+", label: "Enterprises Supported", gradient: 'from-amber-400 to-orange-500' },
    { number: "99.99%", label: "Uptime SLA", gradient: 'from-green-400 to-emerald-500' }
  ];

  const benefits = [
    { icon: '🛡️', title: 'Enterprise Reliability', desc: 'Backed by industry-leading infrastructure providers ensuring 99.99% uptime and enterprise-grade security.' },
    { icon: '🔌', title: 'Seamless Integrations', desc: 'Connect with tools your teams already use, reducing friction and accelerating adoption.' },
    { icon: '📈', title: 'Advanced Capabilities', desc: 'Access cutting-edge AI and ML capabilities through our technology partnerships.' },
    { icon: '🚀', title: 'Expert Implementation', desc: 'Get support from world-class consulting firms with deep enterprise AI experience.' }
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

      // Overview cards
      gsap.utils.toArray<HTMLElement>('.overview-card').forEach((card, i) => {
        gsap.set(card, { y: 60, opacity: 0, scale: 0.95 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(card, { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: i * 0.1, ease: 'power3.out' });
          }
        });
      });

      // Section titles with scramble
      gsap.utils.toArray<HTMLElement>('.section-title').forEach((title) => {
        ScrollTrigger.create({
          trigger: title,
          start: 'top 85%',
          onEnter: () => {
            const originalText = title.dataset.text || title.textContent;
            gsap.to(title, { 
              duration: 1.2, 
              scrambleText: { text: originalText || '', chars: 'PARTNERS', speed: 0.5 }
            });
          }
        });
      });

      // Partner cards
      gsap.utils.toArray<HTMLElement>('.partner-card').forEach((card, i) => {
        gsap.set(card, { y: 60, opacity: 0, scale: 0.9 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(card, { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: (i % 4) * 0.1, ease: 'back.out(1.4)' });
          }
        });
      });

      // Benefits section
      gsap.utils.toArray<HTMLElement>('.benefit-card').forEach((card, i) => {
        gsap.set(card, { x: i % 2 === 0 ? -60 : 60, opacity: 0 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(card, { x: 0, opacity: 1, duration: 0.7, delay: i * 0.1, ease: 'power3.out' });
          }
        });
      });

      // Stats with counter effect
      gsap.utils.toArray<HTMLElement>('.stat-item').forEach((stat, i) => {
        gsap.set(stat, { y: 50, opacity: 0, scale: 0.9 });
        ScrollTrigger.create({
          trigger: stat,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(stat, { y: 0, opacity: 1, scale: 1, duration: 0.5, delay: i * 0.1, ease: 'back.out(1.7)' });
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
          y: 'random(-50, 50)',
          x: 'random(-30, 30)',
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

  // Hover effects
  const handleCardHover = (e: React.MouseEvent, entering: boolean) => {
    const card = e.currentTarget;
    gsap.to(card, { y: entering ? -10 : 0, scale: entering ? 1.03 : 1, duration: 0.3, ease: 'power2.out' });
    gsap.to(card.querySelector('.card-glow'), { opacity: entering ? 1 : 0, duration: 0.3 });
    gsap.to(card.querySelector('.partner-icon'), { scale: entering ? 1.2 : 1, rotate: entering ? 10 : 0, duration: 0.4, ease: 'back.out(2)' });
  };

  const handleBenefitHover = (e: React.MouseEvent, entering: boolean) => {
    const card = e.currentTarget;
    gsap.to(card, { x: entering ? 10 : 0, duration: 0.3 });
    gsap.to(card.querySelector('.benefit-icon'), { scale: entering ? 1.3 : 1, rotate: entering ? 15 : 0, duration: 0.4, ease: 'back.out(2)' });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} />
          {[...Array(10)].map((_, i) => (
            <div key={i} className="particle absolute w-1.5 h-1.5 bg-cyan-400/40 rounded-full" style={{ left: `${5 + i * 10}%`, top: `${15 + (i % 5) * 15}%` }} />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-20">
          <div className="hero-icon inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl border border-cyan-500/30 mb-6">
            <span className="text-4xl">🤝</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">Our Partnerships</span>
          </h1>
          <p className="hero-subtitle text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
            Strategic alliances driving innovation in AI — together with industry leaders, we're building the future of intelligent automation
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="hero-badge px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono">TECHNOLOGY</span>
            <span className="hero-badge px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-mono">INTEGRATION</span>
            <span className="hero-badge px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm font-mono">RESELLER</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </section>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '☁️', title: 'Technology Partnerships', desc: 'Infrastructure and cloud services powering Maula AI', color: 'cyan' },
            { icon: '⚡', title: 'Integration Partnerships', desc: 'Tools and platforms that enhance our capabilities', color: 'purple' },
            { icon: '👥', title: 'Reseller Partnerships', desc: 'Consulting firms helping enterprises implement solutions', color: 'pink' }
          ].map((item, i) => (
            <div key={i} className={`overview-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-${item.color}-500/30 backdrop-blur-sm text-center`}>
              <div className={`w-14 h-14 bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-${item.color}-500/30`}>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Technology Partners */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">☁️</span>
            </div>
            <h2 className="section-title text-2xl md:text-3xl font-bold text-white" data-text="Technology Partners">Technology Partners</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {technologyPartners.map((partner, idx) => (
              <div 
                key={idx} 
                className="partner-card group relative"
                onMouseEnter={(e) => handleCardHover(e, true)}
                onMouseLeave={(e) => handleCardHover(e, false)}
              >
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden">
                  <div className={`card-glow absolute inset-0 bg-gradient-to-br ${partner.gradient} opacity-0 blur-xl`} style={{ transform: 'scale(0.8)' }} />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                  <div className="relative z-10">
                    <div className="partner-icon text-4xl mb-4">{partner.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{partner.name}</h3>
                    <p className="text-gray-400 text-sm">{partner.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-gray-300 text-sm">
              We partner with Google Cloud, AWS, and Microsoft Azure to ensure Maula AI runs on best-in-class infrastructure — guaranteeing reliability, security, and scalability.
            </p>
          </div>
        </div>

        {/* Integration Partners */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">🔗</span>
            </div>
            <h2 className="section-title text-2xl md:text-3xl font-bold text-white" data-text="Integration Partners">Integration Partners</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {integrationPartners.map((partner, idx) => (
              <div 
                key={idx} 
                className="partner-card group relative"
                onMouseEnter={(e) => handleCardHover(e, true)}
                onMouseLeave={(e) => handleCardHover(e, false)}
              >
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden">
                  <div className={`card-glow absolute inset-0 bg-gradient-to-br ${partner.gradient} opacity-0 blur-xl`} style={{ transform: 'scale(0.8)' }} />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                  <div className="relative z-10">
                    <div className="partner-icon text-4xl mb-4">{partner.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{partner.name}</h3>
                    <p className="text-gray-400 text-sm">{partner.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-gray-300 text-sm">
              Our integration partnerships enable Maula AI to work seamlessly with tools your team already uses — constantly expanding our ecosystem to enhance productivity.
            </p>
          </div>
        </div>

        {/* Reseller Partners */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">🏆</span>
            </div>
            <h2 className="section-title text-2xl md:text-3xl font-bold text-white" data-text="Reseller Partners">Reseller Partners</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {resellerPartners.map((partner, idx) => (
              <div 
                key={idx} 
                className="partner-card group relative"
                onMouseEnter={(e) => handleCardHover(e, true)}
                onMouseLeave={(e) => handleCardHover(e, false)}
              >
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden">
                  <div className={`card-glow absolute inset-0 bg-gradient-to-br ${partner.gradient} opacity-0 blur-xl`} style={{ transform: 'scale(0.8)' }} />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-pink-500/30 rounded-tr-lg" />
                  <div className="relative z-10">
                    <div className="partner-icon text-4xl mb-4">{partner.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">{partner.name}</h3>
                    <p className="text-gray-400 text-sm">{partner.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <p className="text-gray-300 text-sm">
              Our reseller partners bring deep enterprise expertise and global reach — helping organizations successfully implement and optimize Maula AI for their specific needs.
            </p>
          </div>
        </div>

        {/* Partnership Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Partnership Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx} 
                className="benefit-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm cursor-pointer"
                onMouseEnter={(e) => handleBenefitHover(e, true)}
                onMouseLeave={(e) => handleBenefitHover(e, false)}
              >
                <div className="flex items-start gap-4">
                  <div className="benefit-icon text-3xl">{benefit.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-gray-400 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Impact Stats */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Partnership Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-item text-center p-6 rounded-2xl bg-gradient-to-br from-gray-900/60 to-gray-800/30 border border-gray-700/50">
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Become a Partner CTA */}
        <div className="cta-section relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.15'%3E%3Cpath d='M36 34h-2v-4h2v4zm0-8h-2v-4h2v4zm-8 8h-2v-4h2v4zm0-8h-2v-4h2v4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }} />
          <div className="relative z-10 text-center p-12 md:p-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <span className="text-3xl">🤝</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Interested in Partnering?</h2>
            <p className="text-xl text-white/90 mb-4 max-w-2xl mx-auto">
              We're always looking for innovative companies and consulting firms to partner with Maula AI.
            </p>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Whether you're interested in technology partnerships, integrations, or reselling, we'd love to explore opportunities together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/support/contact-us"
                className="inline-flex items-center justify-center px-10 py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-2xl shadow-xl shadow-black/20 transition-all transform hover:scale-105"
              >
                Contact Partnership Team →
              </Link>
              <Link
                href="/support/contact-us"
                className="inline-flex items-center justify-center px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}
