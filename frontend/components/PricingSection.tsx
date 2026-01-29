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

const pricingPlans = [
  { name: 'Daily', price: '$1/day', desc: 'Perfect for trying out', highlight: false },
  { name: 'Weekly', price: '$5/week', desc: 'Save 29% - Popular choice', highlight: true },
  { name: 'Monthly', price: '$15/month', desc: 'Save 37% - Best value', highlight: false },
];

export default function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
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
          { opacity: 0, y: 40, rotateX: -45 },
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

      // Floating diamond badge
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

        // Continuous sparkle
        gsap.to(floatingBadgeRef.current, {
          scale: 1.08,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 1.3,
        });
      }

      // Stats badge
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

      // Pricing plans staggered entrance
      if (plansRef.current) {
        const plans = plansRef.current.querySelectorAll('.pricing-plan');
        
        gsap.fromTo(plans,
          { opacity: 0, x: 80, scale: 0.9 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: plansRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
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
      className="py-20 md:py-32 bg-gradient-to-b from-[#0a0a10] via-[#080a0e] to-[#0a0a10] text-white overflow-hidden relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full filter blur-[150px]"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/50"
            style={{
              left: `${8 + (i * 7) % 84}%`,
              top: `${12 + (i * 8) % 76}%`,
              animation: `floatPricing ${3 + (i % 3)}s ease-in-out infinite`,
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
            className="relative h-[400px] md:h-[500px]"
            style={{ perspective: '1000px' }}
          >
            <Image
              src="/images/products/pricing-plans.jpeg"
              alt="Simple Pricing"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-2xl shadow-2xl border border-white/10 object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10]/60 via-transparent to-transparent rounded-2xl"></div>
            
            {/* Floating diamond badge */}
            <div 
              ref={floatingBadgeRef}
              className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30"
            >
              <span className="text-3xl">💎</span>
            </div>
            
            {/* Stats badge */}
            <div 
              ref={statsBadgeRef}
              className="absolute -top-4 -right-4 bg-[#12121a]/90 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 hidden lg:block shadow-lg"
            >
              <div className="text-xl font-bold text-blue-400">Save</div>
              <div className="text-xs text-gray-400">Up to 37%</div>
            </div>
          </div>
          
          {/* Right - Content */}
          <div>
            <span 
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6 border border-blue-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Simple Pricing
            </span>
            
            <h2 
              ref={titleRef}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ opacity: 1 }}
            >
              Transparent
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            
            <p 
              ref={descRef}
              className="text-lg text-gray-400 mb-8 leading-relaxed"
            >
              Choose the plan that works for you. Simple per-agent pricing with no hidden fees.
            </p>
            
            <div 
              ref={plansRef}
              className="space-y-4 mb-8"
            >
              {pricingPlans.map((plan, idx) => (
                <div 
                  key={idx} 
                  className={`pricing-plan flex items-center justify-between p-4 rounded-xl border transition-all hover:-translate-y-1 ${
                    plan.highlight 
                      ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                      : 'bg-white/5 border-white/10 hover:border-blue-500/50'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-white">{plan.name}</h4>
                    <p className="text-sm text-gray-400">{plan.desc}</p>
                  </div>
                  <div className="text-xl font-bold text-blue-400">{plan.price}</div>
                </div>
              ))}
            </div>
            
            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Link 
                href="/pricing/overview" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 group"
              >
                View All Plans
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                href="/agents" 
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
              >
                Browse Agents
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes floatPricing {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-12px); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
