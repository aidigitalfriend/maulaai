'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
}

const trustBadges = [
  { badge: '🔒', title: 'SOC 2 Type II', desc: 'Security verified' },
  { badge: '🌍', title: 'GDPR Compliant', desc: 'EU data protection' },
  { badge: '🛡️', title: 'ISO 27001', desc: 'Info security' },
  { badge: '✅', title: 'HIPAA Ready', desc: 'Healthcare ready' },
];

export default function SecuritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);
  const statsBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Badge animation
      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current,
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: badgeRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Title animation with SplitText
      if (titleRef.current) {
        gsap.set(titleRef.current, { opacity: 1 });
        
        const split = new SplitText(titleRef.current, { type: 'chars,words' });
        
        gsap.fromTo(split.chars,
          { opacity: 0, y: 40, rotateY: -30 },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            duration: 0.5,
            stagger: 0.025,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Description scramble text
      if (descRef.current) {
        const originalText = descRef.current.textContent || '';
        
        gsap.fromTo(descRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            scrollTrigger: {
              trigger: descRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              onEnter: () => {
                gsap.to(descRef.current, {
                  duration: 1.5,
                  scrambleText: {
                    text: originalText,
                    chars: 'lowerCase',
                    revealDelay: 0.3,
                    speed: 0.5,
                  },
                });
              },
            },
          }
        );
      }

      // Image 3D entrance from left
      if (imageRef.current) {
        gsap.fromTo(imageRef.current,
          { 
            opacity: 0, 
            x: -150,
            rotateY: 25,
            scale: 0.85,
          },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            scale: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: imageRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Floating shield badge
      if (floatingBadgeRef.current) {
        gsap.fromTo(floatingBadgeRef.current,
          { opacity: 0, scale: 0, rotate: -90 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.8,
            delay: 0.5,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: floatingBadgeRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Continuous shield pulse animation
        gsap.to(floatingBadgeRef.current, {
          scale: 1.05,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 1.3,
        });
      }

      // Stats badge animation
      if (statsBadgeRef.current) {
        gsap.fromTo(statsBadgeRef.current,
          { opacity: 0, y: -30, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: 0.3,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: statsBadgeRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Trust badges 3D flip entrance
      if (gridRef.current) {
        const items = gridRef.current.querySelectorAll('.trust-badge');
        
        gsap.fromTo(items,
          { opacity: 0, rotateX: -60, scale: 0.8, y: 30 },
          {
            opacity: 1,
            rotateX: 0,
            scale: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Badge icons bounce
        const icons = gridRef.current.querySelectorAll('.badge-icon');
        gsap.fromTo(icons,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.4,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // CTA button entrance
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 md:py-32 bg-gradient-to-b from-[#0a0a10] via-[#090a0c] to-[#0a0a10] text-white overflow-hidden relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-slate-600/10 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gray-500/10 rounded-full filter blur-[150px]"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-slate-400/50"
            style={{
              left: `${8 + (i * 7) % 84}%`,
              top: `${12 + (i * 8) % 76}%`,
              animation: `floatSecurity ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div 
            ref={imageRef}
            className="relative h-[400px] md:h-[450px]"
            style={{ perspective: '1000px' }}
          >
            <Image
              src="/images/products/security-trust.jpeg"
              alt="Enterprise Security"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-2xl shadow-2xl border border-white/10 object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10]/60 via-transparent to-transparent rounded-2xl"></div>
            
            {/* Floating shield badge */}
            <div 
              ref={floatingBadgeRef}
              className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-500/30"
            >
              <span className="text-3xl">🛡️</span>
            </div>
            
            {/* Stats badge */}
            <div 
              ref={statsBadgeRef}
              className="absolute -top-4 -right-4 bg-[#12121a]/90 backdrop-blur-sm rounded-xl p-4 border border-green-500/30 hidden lg:block shadow-lg"
            >
              <div className="text-xl font-bold text-green-400">100%</div>
              <div className="text-xs text-gray-400">Secure</div>
            </div>
          </div>
          
          {/* Right - Content */}
          <div>
            <span 
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/20 rounded-full text-slate-300 text-sm font-medium mb-6 border border-slate-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Enterprise Trust
            </span>
            
            <h2 
              ref={titleRef}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ opacity: 1 }}
            >
              Security &
              <span className="bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent"> Compliance</span>
            </h2>
            
            <p 
              ref={descRef}
              className="text-lg text-gray-400 mb-8 leading-relaxed"
            >
              Meet the highest security and compliance standards. Your data is protected with enterprise-grade security.
            </p>
            
            <div 
              ref={gridRef}
              className="grid grid-cols-2 gap-4 mb-8"
              style={{ perspective: '1000px' }}
            >
              {trustBadges.map((trust, idx) => (
                <div 
                  key={idx} 
                  className="trust-badge text-center p-4 bg-white/5 border border-white/10 rounded-xl hover:border-slate-500/50 transition-all hover:-translate-y-1"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="badge-icon text-2xl mb-2">{trust.badge}</div>
                  <h4 className="font-bold text-sm text-white">{trust.title}</h4>
                  <p className="text-xs text-gray-400">{trust.desc}</p>
                </div>
              ))}
            </div>
            
            <Link 
              ref={ctaRef}
              href="/security" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-slate-500/30 group"
            >
              Learn About Security
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes floatSecurity {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-12px); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
