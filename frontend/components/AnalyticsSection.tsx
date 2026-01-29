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

const features = [
  'Live conversation tracking',
  'Usage & engagement metrics',
  'Performance insights',
  'Custom reporting dashboards',
  'Export data anytime',
];

export default function AnalyticsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Badge animation
      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current,
          { opacity: 0, x: -30 },
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
        const split = new SplitText(titleRef.current, { type: 'chars,words' });
        
        gsap.fromTo(split.chars,
          { opacity: 0, y: 40, rotateX: -60 },
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

      // Features list staggered entrance
      if (featuresRef.current) {
        const items = featuresRef.current.querySelectorAll('li');
        
        gsap.fromTo(items,
          { opacity: 0, x: 50, scale: 0.9 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featuresRef.current,
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
      className="py-20 md:py-32 bg-gradient-to-b from-[#0a0a10] via-[#0a1015] to-[#0a0a10] text-white overflow-hidden relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full filter blur-[150px]"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-teal-400/50"
            style={{
              left: `${8 + (i * 7) % 84}%`,
              top: `${12 + (i * 8) % 76}%`,
              animation: `floatAnalytics ${3 + (i % 3)}s ease-in-out infinite`,
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
            className="relative order-2 lg:order-1"
            style={{ perspective: '1000px' }}
          >
            <div className="relative rounded-2xl shadow-2xl border border-white/10 overflow-hidden h-[400px] md:h-[450px] bg-[#12121a]">
              <Image
                src="/images/products/analytics-dashboard.jpeg"
                alt="Real-time Analytics"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10]/60 via-transparent to-transparent"></div>
            </div>
            
            {/* Floating emoji badge */}
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/30">
              <span className="text-3xl">📊</span>
            </div>
            
            {/* Live badge */}
            <div className="absolute -top-4 -right-4 bg-[#12121a]/90 backdrop-blur-sm rounded-xl p-4 border border-teal-500/30 hidden lg:block shadow-lg">
              <div className="text-xl font-bold text-teal-400">Live</div>
              <div className="text-xs text-gray-400">Real-time Data</div>
            </div>
          </div>
          
          {/* Right - Content */}
          <div className="order-1 lg:order-2">
            <span 
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 rounded-full text-teal-300 text-sm font-medium mb-6 border border-teal-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Real-time Analytics
            </span>
            
            <h2 
              ref={titleRef}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
            >
              Monitor Your AI
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"> In Real-time</span>
            </h2>
            
            <p 
              ref={descRef}
              className="text-lg text-gray-400 mb-8 leading-relaxed"
            >
              Comprehensive dashboards, usage analytics, and performance insights. Track conversations, measure engagement, and optimize your AI interactions.
            </p>
            
            <ul ref={featuresRef} className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-teal-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <Link 
              ref={ctaRef}
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-teal-500/30 group"
            >
              View Dashboard
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes floatAnalytics {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-12px); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
