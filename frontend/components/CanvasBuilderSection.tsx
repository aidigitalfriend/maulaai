'use client';

import { useEffect, useRef } from 'react';
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
  'Generate complete web apps from text prompts',
  'Multiple AI models including Code Expert & Designer',
  'Live preview with code export',
  'Iterative refinement with AI assistant',
  'Pre-built templates for quick starts',
];

export default function CanvasBuilderSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Badge animation with pulse effect
      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current,
          { opacity: 0, scale: 0.8, x: -30 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.6,
            ease: 'back.out(1.7)',
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
          { opacity: 0, y: 60, rotateX: -90 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
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

      // Mockup 3D entrance from right
      if (mockupRef.current) {
        gsap.fromTo(mockupRef.current,
          { 
            opacity: 0, 
            x: 150,
            rotateY: -30,
            scale: 0.8,
          },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            scale: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: mockupRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Floating badge animation
      if (floatingBadgeRef.current) {
        gsap.fromTo(floatingBadgeRef.current,
          { opacity: 0, scale: 0, rotate: 180 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.8,
            delay: 0.6,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: floatingBadgeRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Features list staggered entrance
      if (featuresRef.current) {
        const items = featuresRef.current.querySelectorAll('li');
        
        gsap.fromTo(items,
          { opacity: 0, x: -40, scale: 0.9 },
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

      // CTA buttons entrance
      if (ctaRef.current) {
        const buttons = ctaRef.current.querySelectorAll('a');
        
        gsap.fromTo(buttons,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.15,
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
      className="py-20 md:py-32 bg-gradient-to-b from-[#0a0a10] via-[#0a0a14] to-[#0a0a10] text-white overflow-hidden relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full filter blur-[150px]"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-indigo-400/50"
            style={{
              left: `${8 + (i * 7) % 84}%`,
              top: `${12 + (i * 8) % 76}%`,
              animation: `floatCanvas ${3 + (i % 3)}s ease-in-out infinite`,
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full text-indigo-300 text-sm font-medium mb-6 border border-indigo-500/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              NEW: Canvas Builder
            </span>
            
            <h2 
              ref={titleRef}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
            >
              Build Apps with
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> AI-Powered </span>
              Canvas
            </h2>
            
            <p 
              ref={descRef}
              className="text-lg text-gray-400 mb-8 leading-relaxed"
            >
              Transform your ideas into fully functional web applications in seconds. Our Canvas Builder uses advanced AI to generate beautiful, responsive HTML applications from simple text descriptions.
            </p>
            
            <ul ref={featuresRef} className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Link 
                href="/canvas-app" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/30 group"
              >
                Launch Canvas Builder
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
              >
                View Documentation
              </Link>
            </div>
          </div>
          
          {/* Right - Mockup */}
          <div 
            ref={mockupRef}
            className="relative"
            style={{ perspective: '1000px' }}
          >
            <div className="bg-[#1e1e2e] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
              {/* Window header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#161622] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-xs text-gray-400 ml-2">Canvas Builder</span>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    <span className="text-indigo-400 text-sm font-mono">Prompt:</span>
                    <span className="text-gray-300 text-sm">&quot;Create a modern SaaS landing page...&quot;</span>
                  </div>
                  <div className="h-px bg-white/10 my-4"></div>
                  <div className="bg-[#252536] rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">Generated Preview</span>
                      <span className="text-xs text-green-400">✓ Complete</span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg h-32 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Live Preview Area</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div 
              ref={floatingBadgeRef}
              className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes floatCanvas {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-12px); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
