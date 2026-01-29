'use client';

import { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { gsap, SplitText, ScrambleTextPlugin, CustomWiggle, CustomEase } from '@/lib/gsap';

gsap.registerPlugin(SplitText, ScrambleTextPlugin, CustomWiggle, CustomEase);

export default function HeroSectionGSAP() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const spinning3DRef = useRef<HTMLDivElement>(null);

  // 3D Spinning orbit text - decorative
  const orbitText = "✦ AI ✦ MAGIC ✦ POWER ✦ CREATE ✦ BUILD ✦ DREAM ✦ ";
  const orbitLetters = useMemo(() => orbitText.split(''), []);

  useEffect(() => {
    // Check if all refs are available before running GSAP
    if (!titleRef.current || !subtitleRef.current || !descRef.current || !buttonsRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      // Custom eases
      CustomWiggle.create('heroWiggle', { wiggles: 8, type: 'easeOut' });
      CustomEase.create('heroBounce', 'M0,0 C0.14,0 0.27,0.428 0.32,0.66 0.366,0.862 0.455,1.076 0.54,1.076 0.636,1.076 0.71,0.884 0.782,0.884 0.858,0.884 0.912,1 1,1');

      // Initial states - title visible, others hidden
      gsap.set(titleRef.current, { opacity: 1, scale: 1 });
      gsap.set([subtitleRef.current, descRef.current], { opacity: 0, y: 30 });
      gsap.set(buttonsRef.current, { opacity: 0, y: 20 });

      // Create main timeline
      const tl = gsap.timeline({ defaults: { ease: 'heroBounce' } });

      // ============================================
      // STAGE 1: ScrambleText on Title
      // ============================================
      if (titleRef.current) {
        gsap.fromTo(titleRef.current, 
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
        );
        
        gsap.to(titleRef.current, {
          duration: 2.5,
          scrambleText: {
            text: 'Unleash AI Magic',
            chars: 'upperAndLowerCase',
            revealDelay: 0.5,
            speed: 0.4,
            newClass: 'text-revealed'
          },
          delay: 0.3,
          ease: 'none'
        });
      }

      // ============================================
      // STAGE 5: ScrambleText - Subtitle & Description
      // ============================================
      tl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.5');
      tl.to(subtitleRef.current, {
        duration: 2,
        scrambleText: {
          text: 'Transform ideas into intelligent AI agents instantly',
          chars: 'lowerCase',
          revealDelay: 0.3,
          speed: 0.5,
        }
      }, '-=0.2');

      tl.to(descRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=1.5');
      tl.to(descRef.current, {
        duration: 1.8,
        scrambleText: {
          text: 'Zero code. Pure innovation. Deploy powerful AI that thinks, learns, and evolves.',
          chars: 'upperCase',
          revealDelay: 0.2,
          speed: 0.4,
        }
      }, '-=1.3');

      // Buttons
      tl.to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'back.out(1.4)'
      }, '-=1');

      // Stats counter animation
      if (statsRef.current) {
        const statNumbers = statsRef.current.querySelectorAll('.stat-number');
        statNumbers.forEach((stat) => {
          gsap.from(stat, {
            textContent: 0,
            duration: 2,
            snap: { textContent: 1 },
            delay: 1.5,
            ease: 'power2.out',
          });
        });
      }

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-[#0a0a10]"
    >
      {/* Base gradient background - deep dark like second image */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10] via-[#0c0c18] to-[#0a0a10]" />

      {/* Floating cyan dots - matching second image style */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400/60"
            style={{
              left: `${5 + (i * 5) % 90}%`,
              top: `${10 + (i * 7) % 80}%`,
              animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle center glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-900/20 via-indigo-900/15 to-purple-900/20 blur-3xl" />

      {/* 3D Spinning Globe - Decorative orbit around title */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: '1200px' }}>
        <div 
          ref={spinning3DRef}
          className="spinning-globe absolute"
          style={{ 
            width: '60vmin',
            height: '60vmin',
            transformStyle: 'preserve-3d',
            animation: 'globeSpin 30s linear infinite',
          }}
        >
          {orbitLetters.map((char, i) => (
            <span
              key={i}
              className="absolute text-lg md:text-xl font-semibold"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotateY(${(i / orbitLetters.length) * 360}deg) translateZ(28vmin)`,
                backfaceVisibility: 'visible',
                color: char === '✦' ? '#22d3ee' : '#c084fc',
                textShadow: char === '✦' ? '0 0 10px #22d3ee' : '0 0 8px #c084fc',
                opacity: 0.7,
              }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Content container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span className="text-sm text-gray-300">Now with Canvas Builder & AI Labs</span>
          </div>

          {/* Main Heading */}
          <div className="relative inline-block mb-8">
            <h1 
              ref={titleRef}
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight bg-gradient-to-r from-white via-cyan-300 to-purple-400 bg-clip-text text-transparent"
            >
              Unleash AI Magic
            </h1>
          </div>
          
          {/* Subheading */}
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-6 mt-8 font-light"
          >
            Transform ideas into intelligent AI agents instantly
          </p>
          
          {/* Description */}
          <p 
            ref={descRef}
            className="text-base md:text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Zero code. Pure innovation. Deploy powerful AI that thinks, learns, and evolves.
          </p>

          {/* CTA Buttons */}
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/canvas-app"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-500 to-indigo-500 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/25 hover:scale-105"
            >
              <span className="relative z-10">Start Building</span>
              <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <Link
              href="/lab"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300"
            >
              <span>Explore Labs</span>
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">🧪</span>
            </Link>
          </div>

          {/* Stats row */}
          <div ref={statsRef} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: '20+', label: 'AI Agents' },
              { value: '99.9%', label: 'Uptime' },
              { value: '10K+', label: 'Users' },
              { value: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="stat-number text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a10] to-transparent pointer-events-none z-20" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-10px); opacity: 0.8; }
        }
        
        @keyframes globeSpin {
          0% {
            transform: rotateX(-20deg) rotateY(0deg);
          }
          100% {
            transform: rotateX(-20deg) rotateY(360deg);
          }
        }
        
        .spinning-globe {
          transform: rotateX(-20deg);
        }
      `}</style>
    </section>
  );
}
