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

const tools = [
  { name: 'AI Chat', icon: '💬', color: 'from-blue-500 to-cyan-500' },
  { name: 'Analytics', icon: '📊', color: 'from-purple-500 to-pink-500' },
  { name: 'Automation', icon: '⚡', color: 'from-amber-500 to-orange-500' },
  { name: 'Canvas', icon: '🎨', color: 'from-emerald-500 to-teal-500' },
  { name: 'Data Gen', icon: '🔢', color: 'from-rose-500 to-red-500' },
  { name: 'Voice AI', icon: '🎙️', color: 'from-indigo-500 to-violet-500' },
  { name: 'Agents', icon: '🤖', color: 'from-cyan-500 to-blue-500' },
  { name: 'Insights', icon: '💡', color: 'from-yellow-500 to-amber-500' },
  { name: 'Memory', icon: '🧠', color: 'from-fuchsia-500 to-pink-500' },
  { name: 'Tools', icon: '🛠️', color: 'from-slate-500 to-gray-500' },
  { name: 'API', icon: '🔗', color: 'from-green-500 to-emerald-500' },
  { name: 'Deploy', icon: '🚀', color: 'from-sky-500 to-blue-500' },
];

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Title animation with SplitText
      if (titleRef.current) {
        gsap.set(titleRef.current, { opacity: 1 });
        
        const split = new SplitText(titleRef.current, { type: 'chars,words' });
        
        gsap.fromTo(split.chars,
          { opacity: 0, y: 60, rotateX: -60 },
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

      // Tools grid 3D entrance from left
      if (gridRef.current) {
        const toolCards = gridRef.current.querySelectorAll('.tool-card');
        
        gsap.fromTo(toolCards,
          { 
            opacity: 0, 
            y: 40,
            rotateX: -20,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Floating sparkle badge
      if (floatingBadgeRef.current) {
        gsap.fromTo(floatingBadgeRef.current,
          { opacity: 0, scale: 0, rotate: -180 },
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

        // Continuous sparkle pulse
        gsap.to(floatingBadgeRef.current, {
          scale: 1.1,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 1.3,
        });
      }

      // CTA buttons entrance
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
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
      className="py-20 md:py-32 bg-gradient-to-b from-[#0a0a10] via-[#0a0a10] to-[#0a0a10] text-white overflow-hidden relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full filter blur-[150px]"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/40"
            style={{
              left: `${10 + (i * 8) % 80}%`,
              top: `${15 + (i * 7) % 70}%`,
              animation: `floatCTA ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Tools Grid */}
          <div 
            ref={gridRef}
            className="grid grid-cols-3 sm:grid-cols-4 gap-3"
            style={{ perspective: '1000px' }}
          >
            {tools.map((tool, index) => (
              <div
                key={index}
                className="tool-card group relative bg-[#12121a]/80 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`}></div>
                <div className="text-2xl mb-2">{tool.icon}</div>
                <div className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{tool.name}</div>
              </div>
            ))}
            
            {/* Floating sparkle badge */}
            <div 
              ref={floatingBadgeRef}
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 z-10"
            >
              <span className="text-2xl">✨</span>
            </div>
          </div>
          
          {/* Right - Content */}
          <div>
            <h2 
              ref={titleRef}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ opacity: 1 }}
            >
              Ready to Transform
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Your Workflow?</span>
            </h2>
            
            <p 
              ref={descRef}
              className="text-xl text-gray-400 mb-8 leading-relaxed"
            >
              Join thousands of professionals who trust our AI platform for their most important work. Start your journey today.
            </p>
            
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 group"
              >
                Contact Us
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                href="/demo" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes floatCTA {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50% { transform: translateY(-10px); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
