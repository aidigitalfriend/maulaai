'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HeroSectionGSAP() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import GSAP only on client side
    const initGSAP = async () => {
      const gsap = (await import('gsap')).default;
      
      // Initial states
      gsap.set([titleRef.current, subtitleRef.current, descRef.current, buttonsRef.current], {
        opacity: 0,
        y: 50
      });
      
      gsap.set([orb1Ref.current, orb2Ref.current, orb3Ref.current], {
        scale: 0.5,
        opacity: 0
      });

      gsap.set(gridRef.current, {
        opacity: 0
      });

      // Create timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate orbs first
      tl.to([orb1Ref.current, orb2Ref.current, orb3Ref.current], {
        scale: 1,
        opacity: 1,
        duration: 1.5,
        stagger: 0.2
      })
      // Then animate grid
      .to(gridRef.current, {
        opacity: 1,
        duration: 1
      }, '-=1')
      // Then animate text content
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1
      }, '-=0.8')
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.6')
      .to(descRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.5')
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.4');

      // Continuous floating animation for orbs
      gsap.to(orb1Ref.current, {
        y: -30,
        x: 20,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to(orb2Ref.current, {
        y: 25,
        x: -15,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to(orb3Ref.current, {
        y: -20,
        x: -25,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Subtle parallax on mouse move
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;

        gsap.to(orb1Ref.current, {
          x: xPercent * 30,
          y: yPercent * 30,
          duration: 1,
          ease: 'power2.out'
        });

        gsap.to(orb2Ref.current, {
          x: xPercent * -20,
          y: yPercent * -20,
          duration: 1.2,
          ease: 'power2.out'
        });

        gsap.to(orb3Ref.current, {
          x: xPercent * 15,
          y: yPercent * -15,
          duration: 1.4,
          ease: 'power2.out'
        });
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    };

    initGSAP();
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-neural-950"
    >
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950" />

      {/* Animated gradient orbs */}
      <div 
        ref={orb1Ref}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-brand-500/20 via-indigo-500/10 to-transparent blur-3xl"
      />
      <div 
        ref={orb2Ref}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/15 via-accent-500/10 to-transparent blur-3xl"
      />
      <div 
        ref={orb3Ref}
        className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl"
      />

      {/* Subtle grid pattern */}
      <div 
        ref={gridRef}
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-neural-950 via-transparent to-neural-950/50" />

      {/* Content container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span className="text-sm text-neural-300">Now with Canvas Builder & AI Labs</span>
          </div>

          {/* Main Heading */}
          <h1 
            ref={titleRef}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-white to-neural-300 bg-clip-text text-transparent">
              Build{' '}
            </span>
            <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-indigo-400 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>
          
          {/* Subheading */}
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl lg:text-3xl text-neural-200 mb-6 font-light"
          >
            Create powerful AI agents with our visual canvas builder
          </p>
          
          {/* Description */}
          <p 
            ref={descRef}
            className="text-base md:text-lg text-neural-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            No code required. Drag, drop, and deploy intelligent agents that solve real problems.
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
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: '20+', label: 'AI Agents' },
              { value: '99.9%', label: 'Uptime' },
              { value: '10K+', label: 'Users' },
              { value: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-neural-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-neural-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neural-950 to-transparent pointer-events-none z-20" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 text-neural-500">
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
