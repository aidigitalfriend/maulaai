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

const roadmapItems = [
  { 
    quarter: 'Q1 2026', 
    features: ['Multi-language Support', 'Real-time Translation', 'Enterprise SSO'], 
    status: 'In Progress',
    statusColor: 'blue'
  },
  { 
    quarter: 'Q2 2026', 
    features: ['AI Agent Marketplace', 'White-label Solution', 'Advanced API'], 
    status: 'Planned',
    statusColor: 'purple'
  },
];

export default function RoadmapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);
  const statsBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Badge animation
      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current,
          { opacity: 0, x: -50 },
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
          { opacity: 0, y: 50, rotateX: -45 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.5,
            stagger: 0.02,
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

      // Image 3D entrance from right
      if (imageRef.current) {
        gsap.fromTo(imageRef.current,
          { 
            opacity: 0, 
            x: 150,
            rotateY: -25,
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

      // Floating rocket badge
      if (floatingBadgeRef.current) {
        gsap.fromTo(floatingBadgeRef.current,
          { opacity: 0, scale: 0, rotate: -180, y: 30 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            y: 0,
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

        // Continuous rocket hover animation
        gsap.to(floatingBadgeRef.current, {
          y: -8,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 1.3,
        });
      }

      // Stats badge animation
      if (statsBadgeRef.current) {
        gsap.fromTo(statsBadgeRef.current,
          { opacity: 0, x: -30, scale: 0.8 },
          {
            opacity: 1,
            x: 0,
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

      // Roadmap cards staggered entrance with 3D effect
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.roadmap-card');
        
        gsap.fromTo(cards,
          { opacity: 0, x: -80, rotateY: 30, scale: 0.9 },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Animate feature tags within cards
        const featureTags = cardsRef.current.querySelectorAll('.feature-tag');
        gsap.fromTo(featureTags,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            stagger: 0.05,
            delay: 0.5,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: cardsRef.current,
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
      className="py-20 md:py-32 bg-gradient-to-b from-[#0a0a10] via-[#0c080a] to-[#0a0a10] text-white overflow-hidden relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full filter blur-[150px]"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-rose-400/50"
            style={{
              left: `${8 + (i * 7) % 84}%`,
              top: `${12 + (i * 8) % 76}%`,
              animation: `floatRoadmap ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <span 
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-full text-rose-300 text-sm font-medium mb-6 border border-rose-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Product Roadmap
            </span>
            
            <h2 
              ref={titleRef}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ opacity: 1 }}
            >
              What's Coming
              <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent"> Next</span>
            </h2>
            
            <p 
              ref={descRef}
              className="text-lg text-gray-400 mb-8 leading-relaxed"
            >
              See what we're building next. Our transparent roadmap keeps you informed about upcoming features.
            </p>
            
            <div 
              ref={cardsRef}
              className="space-y-4 mb-8"
              style={{ perspective: '1000px' }}
            >
              {roadmapItems.map((roadmap, idx) => (
                <div 
                  key={idx} 
                  className="roadmap-card p-5 bg-white/5 rounded-xl border border-white/10 hover:border-rose-500/50 transition-all hover:-translate-y-1"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">{roadmap.quarter}</h3>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      roadmap.statusColor === 'blue' 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {roadmap.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.features.map((f, i) => (
                      <span 
                        key={i} 
                        className="feature-tag text-xs px-3 py-1.5 bg-white/10 rounded-lg text-gray-300 border border-white/5"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <Link 
              ref={ctaRef}
              href="/community/roadmap" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-rose-500/30 group"
            >
              View Full Roadmap
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {/* Right - Image */}
          <div 
            ref={imageRef}
            className="relative"
            style={{ perspective: '1000px' }}
          >
            <div className="relative rounded-2xl shadow-2xl border border-white/10 overflow-hidden h-[400px] md:h-[450px]">
              <Image
                src="/images/products/roadmap.jpeg"
                alt="Product Roadmap"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10]/60 via-transparent to-transparent"></div>
            </div>
            
            {/* Floating rocket badge */}
            <div 
              ref={floatingBadgeRef}
              className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/30"
            >
              <span className="text-3xl">🚀</span>
            </div>
            
            {/* Stats badge */}
            <div 
              ref={statsBadgeRef}
              className="absolute -top-4 -left-4 bg-[#12121a]/90 backdrop-blur-sm rounded-xl p-4 border border-rose-500/30 hidden lg:block shadow-lg"
            >
              <div className="text-xl font-bold text-rose-400">2026</div>
              <div className="text-xs text-gray-400">Big Plans</div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes floatRoadmap {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-12px); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
