'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, Observer, CustomWiggle, CustomEase, DrawSVGPlugin, MotionPathPlugin, Draggable } from '@/lib/gsap';
import Link from 'next/link';
import { Scale, Shield, FileText, CreditCard, AlertTriangle, Cookie, ArrowRight, Sparkles, Lock, Eye, CheckCircle } from 'lucide-react';

export default function LegalHubPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const legalDocuments = [
    {
      title: 'Privacy Policy',
      description: 'Learn how we collect, use, and protect your personal information and data across our AI platform.',
      icon: Shield,
      href: '/legal/privacy-policy',
      lastUpdated: 'January 15, 2026',
      gradient: 'from-cyan-500 to-blue-600',
      iconBg: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30',
      sections: ['Data Collection', 'Usage & Processing', 'Data Protection', 'Your Rights'],
    },
    {
      title: 'Terms of Service',
      description: 'Understand the terms and conditions governing your use of our AI agent platform and services.',
      icon: FileText,
      href: '/legal/terms-of-service',
      lastUpdated: 'January 15, 2026',
      gradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      sections: ['Service Usage', 'User Responsibilities', 'Limitations', 'Termination'],
    },
    {
      title: 'Cookie Policy',
      description: 'Information about cookies and tracking technologies we use to enhance your browsing experience.',
      icon: Cookie,
      href: '/legal/cookie-policy',
      lastUpdated: 'January 15, 2026',
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      sections: ['Cookie Types', 'Purpose & Usage', 'Your Choices', 'Third-Party Cookies'],
    },
    {
      title: 'Payments & Refunds',
      description: 'Policies regarding one-time purchases, payment methods, refunds, and access management.',
      icon: CreditCard,
      href: '/legal/payments-refunds',
      lastUpdated: 'January 15, 2026',
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      sections: ['Pricing Structure', 'Payment Methods', 'Refund Policy', 'Access Duration'],
    },
    {
      title: 'Reports & Violations',
      description: 'Report inappropriate activities, misuse, or policy violations to our trust and safety team.',
      icon: AlertTriangle,
      href: '/legal/reports',
      lastUpdated: 'January 15, 2026',
      gradient: 'from-red-500 to-rose-600',
      iconBg: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      sections: ['How to Report', 'Report Types', 'Investigation Process', 'Legal Disclaimer'],
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Register custom wiggle for hover effects
      CustomWiggle.create('legalWiggle', { wiggles: 6, type: 'uniform' });

      // Hero title split text animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSubtitle = new SplitText('.hero-subtitle', { type: 'words' });

      gsap.set(heroTitle.chars, { y: 100, opacity: 0, rotateX: -90 });
      gsap.set(heroSubtitle.words, { y: 30, opacity: 0 });
      gsap.set('.hero-badge', { scale: 0, opacity: 0 });
      gsap.set('.hero-scale-icon', { y: -100, opacity: 0, rotate: -45 });
      gsap.set('.hero-line', { scaleX: 0 });
      gsap.set('.floating-particle', { scale: 0, opacity: 0 });

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      heroTl
        .to('.hero-scale-icon', {
          y: 0,
          opacity: 1,
          rotate: 0,
          duration: 1,
          ease: 'bounce.out'
        })
        .to(heroTitle.chars, {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.02
        }, '-=0.5')
        .to(heroSubtitle.words, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.03
        }, '-=0.4')
        .to('.hero-line', {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.inOut'
        }, '-=0.3')
        .to('.hero-badge', {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)'
        }, '-=0.4')
        .to('.floating-particle', {
          scale: 1,
          opacity: 0.6,
          duration: 0.6,
          stagger: 0.05,
          ease: 'back.out(2)'
        }, '-=0.3');

      // Floating scale icon animation
      gsap.to('.hero-scale-icon', {
        y: -15,
        rotate: 8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1
      });

      // Floating particles continuous animation
      document.querySelectorAll('.floating-particle').forEach((particle, i) => {
        gsap.to(particle, {
          y: `random(-30, 30)`,
          x: `random(-20, 20)`,
          duration: `random(3, 5)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

      // Legal document cards staggered entrance with ScrollTrigger
      gsap.set('.legal-card', { y: 80, opacity: 0, scale: 0.9 });
      
      ScrollTrigger.create({
        trigger: cardsRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.legal-card', {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out'
          });
        }
      });

      // Card hover effects with GSAP
      const cards = document.querySelectorAll('.legal-card');
      cards.forEach((card) => {
        const icon = card.querySelector('.card-icon');
        const iconInner = card.querySelector('.card-icon-inner');
        const arrow = card.querySelector('.card-arrow');
        const sections = card.querySelector('.card-sections');
        const glow = card.querySelector('.card-glow');

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            scale: 1.02,
            duration: 0.4,
            ease: 'power2.out'
          });
          gsap.to(icon, {
            scale: 1.15,
            duration: 0.3,
            ease: 'back.out(2)'
          });
          gsap.to(iconInner, {
            rotate: 15,
            duration: 0.4,
            ease: 'power2.out'
          });
          gsap.to(arrow, {
            x: 8,
            duration: 0.3,
            ease: 'power2.out'
          });
          gsap.to(glow, {
            opacity: 1,
            duration: 0.4
          });
          if (sections) {
            gsap.to(sections, {
              height: 'auto',
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out'
            });
          }
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out'
          });
          gsap.to(icon, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
          gsap.to(iconInner, {
            rotate: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
          gsap.to(arrow, {
            x: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
          gsap.to(glow, {
            opacity: 0,
            duration: 0.3
          });
          if (sections) {
            gsap.to(sections, {
              height: 0,
              opacity: 0,
              duration: 0.3,
              ease: 'power2.in'
            });
          }
        });
      });

      // ScrambleText on card titles when they come into view
      cards.forEach((card) => {
        const title = card.querySelector('.card-title');
        if (title) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 75%',
            onEnter: () => {
              gsap.to(title, {
                duration: 1.2,
                scrambleText: {
                  text: title.textContent || '',
                  chars: 'LEGAL§©®™',
                  speed: 0.4
                }
              });
            }
          });
        }
      });

      // Trust badges section animation
      gsap.set('.trust-badge', { y: 50, opacity: 0, scale: 0.9 });
      
      ScrollTrigger.create({
        trigger: '.trust-section',
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.trust-badge', {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'back.out(1.5)'
          });
        }
      });

      // Trust badge icons wiggle
      document.querySelectorAll('.trust-badge').forEach((badge) => {
        badge.addEventListener('mouseenter', () => {
          gsap.to(badge.querySelector('.trust-icon'), {
            rotation: 15,
            duration: 0.5,
            ease: 'legalWiggle'
          });
        });
      });

      // Bottom CTA section parallax
      gsap.to('.cta-bg-gradient', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });

      // Observer for scroll velocity effects
      Observer.create({
        target: containerRef.current,
        type: 'scroll',
        onChangeY: (self) => {
          const velocity = Math.min(Math.abs(self.velocityY) / 1000, 1);
          gsap.to('.legal-card', {
            skewY: self.velocityY > 0 ? velocity * 1.5 : -velocity * 1.5,
            duration: 0.3,
            ease: 'power2.out'
          });
        },
        onStop: () => {
          gsap.to('.legal-card', {
            skewY: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.4)'
          });
        }
      });

      // Gradient orbs floating animation
      gsap.to('.gradient-orb-1', {
        x: 80,
        y: -40,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-2', {
        x: -60,
        y: 50,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-3', {
        x: 40,
        y: 30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb-1 absolute top-20 left-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="gradient-orb-2 absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl" />
        <div className="gradient-orb-3 absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[75vh] flex items-center justify-center py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-black to-black" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="floating-particle absolute w-2 h-2 rounded-full"
              style={{
                left: `${10 + (i * 6)}%`,
                top: `${20 + (i % 4) * 18}%`,
                background: i % 3 === 0 ? '#22d3ee' : i % 3 === 1 ? '#a855f7' : '#10b981',
                opacity: 0.3
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Scale Icon */}
          <div className="hero-scale-icon mb-8 inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
            <Scale className="w-14 h-14 text-cyan-400" />
          </div>

          <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
            Legal & Compliance
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Transparency and trust are at the core of our AI platform. Review our legal documents to understand how we protect your rights.
          </p>

          <div className="hero-line w-40 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 mx-auto mb-10 rounded-full" />

          <div className="flex flex-wrap justify-center gap-4">
            <div className="hero-badge px-5 py-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-medium backdrop-blur-sm">
              <Lock className="w-4 h-4 inline mr-2" />
              GDPR Compliant
            </div>
            <div className="hero-badge px-5 py-2.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium backdrop-blur-sm">
              <Shield className="w-4 h-4 inline mr-2" />
              CCPA Ready
            </div>
            <div className="hero-badge px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              SOC 2 Type II
            </div>
          </div>
        </div>
      </section>

      {/* Legal Documents Grid */}
      <section ref={cardsRef} className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {legalDocuments.map((doc, index) => {
              const IconComponent = doc.icon;
              return (
                <Link
                  key={doc.title}
                  href={doc.href}
                  className="legal-card group block"
                >
                  <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden">
                    {/* Glow effect on hover */}
                    <div className={`card-glow absolute inset-0 bg-gradient-to-br ${doc.gradient} opacity-0 blur-xl transition-opacity duration-500`} />
                    
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${doc.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`card-icon w-16 h-16 rounded-xl ${doc.iconBg} border ${doc.borderColor} flex items-center justify-center mb-6`}>
                        <IconComponent className="card-icon-inner w-8 h-8 text-white" />
                      </div>

                      {/* Title & Description */}
                      <h3 className="card-title text-2xl font-bold text-white mb-3">
                        {doc.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        {doc.description}
                      </p>

                      {/* Last Updated */}
                      <p className="text-xs text-gray-500 mb-4">
                        Updated: {doc.lastUpdated}
                      </p>

                      {/* Expandable Sections */}
                      <div className="card-sections h-0 opacity-0 overflow-hidden">
                        <div className="pt-4 border-t border-gray-800">
                          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Sections Covered:</p>
                          <div className="flex flex-wrap gap-2">
                            {doc.sections.map((section) => (
                              <span
                                key={section}
                                className="px-3 py-1.5 rounded-lg bg-gray-800/60 text-gray-300 text-xs border border-gray-700/50"
                              >
                                {section}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="card-arrow flex items-center text-cyan-400 font-medium text-sm mt-6">
                        Read Document
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section py-24 px-6 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Your Trust, Our <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Commitment</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We take data protection and privacy seriously. Here's how we ensure your information stays safe.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="trust-badge p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950 border border-gray-800 hover:border-cyan-500/30 transition-colors">
              <div className="trust-icon w-14 h-14 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Data Protection</h3>
              <p className="text-gray-400 text-sm text-center leading-relaxed">
                End-to-end encryption and strict access controls protect your data at all times across our platform.
              </p>
            </div>

            <div className="trust-badge p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950 border border-gray-800 hover:border-purple-500/30 transition-colors">
              <div className="trust-icon w-14 h-14 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
                <Eye className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Full Transparency</h3>
              <p className="text-gray-400 text-sm text-center leading-relaxed">
                Clear, readable policies that explain exactly how we operate and use your information.
              </p>
            </div>

            <div className="trust-badge p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950 border border-gray-800 hover:border-emerald-500/30 transition-colors">
              <div className="trust-icon w-14 h-14 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <Scale className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">User Rights</h3>
              <p className="text-gray-400 text-sm text-center leading-relaxed">
                Access, export, or delete your data anytime. Your rights are always our top priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section relative py-32 px-6 overflow-hidden">
        <div className="cta-bg-gradient absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-purple-900/30 to-cyan-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Questions About Our Policies?
          </h2>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            Our legal team is here to help clarify any questions you may have about our terms and policies.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
          >
            Contact Legal Team
            <ArrowRight className="w-5 h-5 ml-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
