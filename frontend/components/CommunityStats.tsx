'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
}

interface Stat {
  number: string;
  label: string;
  icon: string;
  color: string;
}

interface CommunityStatsProps {
  stats?: Stat[];
}

const defaultStats: Stat[] = [
  { number: "10K+", label: "Active Members", icon: "👥", color: "from-blue-500 to-cyan-500" },
  { number: "5K+", label: "GitHub Stars", icon: "⭐", color: "from-purple-500 to-pink-500" },
  { number: "500+", label: "Contributions", icon: "🤝", color: "from-green-500 to-emerald-500" }
];

export default function CommunityStats({ stats = defaultStats }: CommunityStatsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Title animation with SplitText
      if (titleRef.current) {
        gsap.set(titleRef.current, { opacity: 1 });
        
        const split = new SplitText(titleRef.current, { type: 'chars,words' });
        
        gsap.fromTo(split.chars,
          { opacity: 0, y: 40, rotateY: -60 },
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

      // Subtitle scramble text
      if (subtitleRef.current) {
        const originalText = subtitleRef.current.textContent || '';
        
        gsap.fromTo(subtitleRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            scrollTrigger: {
              trigger: subtitleRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              onEnter: () => {
                gsap.to(subtitleRef.current, {
                  duration: 1.2,
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

      // Cards 3D entrance
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.stat-card');
        
        cards.forEach((card, index) => {
          // Card entrance
          gsap.fromTo(card,
            { 
              opacity: 0, 
              y: 60,
              rotateX: -30,
              scale: 0.8,
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
              duration: 0.8,
              delay: index * 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                onEnter: () => {
                  if (!hasAnimated) {
                    setHasAnimated(true);
                    startCountAnimation();
                  }
                },
              },
            }
          );

          // Icon bounce animation
          const icon = card.querySelector('.stat-icon');
          if (icon) {
            gsap.fromTo(icon,
              { opacity: 0, scale: 0, rotate: -180 },
              {
                opacity: 1,
                scale: 1,
                rotate: 0,
                duration: 0.6,
                delay: index * 0.15 + 0.3,
                ease: 'back.out(2)',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 85%',
                  toggleActions: 'play none none reverse',
                },
              }
            );
          }
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  // Counter animation function
  const startCountAnimation = () => {
    stats.forEach((stat, index) => {
      const finalNumber = parseInt(stat.number.replace(/\D/g, ''));
      const duration = 2000;
      const steps = 60;
      const stepValue = finalNumber / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep <= steps) {
          setCounts(prev => ({
            ...prev,
            [index]: Math.floor(stepValue * currentStep)
          }));
          currentStep++;
        } else {
          clearInterval(interval);
        }
      }, duration / steps);
    });
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 md:py-32 overflow-hidden"
    >
      {/* Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10] via-[#0a0c12] to-[#0a0a10] -z-10" />

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none -z-5">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full filter blur-[150px]"></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full filter blur-[150px]"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/40"
            style={{
              left: `${10 + (i * 8) % 80}%`,
              top: `${15 + (i * 9) % 70}%`,
              animation: `floatStats ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-100 via-blue-200 to-cyan-200 bg-clip-text text-transparent mb-4"
            style={{ opacity: 1 }}
          >
            Community Stats
          </h2>
          <p 
            ref={subtitleRef}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Join thousands of developers, researchers, and AI enthusiasts
          </p>
        </div>

        {/* Stats Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6"
          style={{ perspective: '1000px' }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card group relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Gradient background glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-300 -z-1`} />

              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-[#1a1a24]/80 via-[#16161f]/60 to-[#12121a]/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 group-hover:border-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl h-full hover:-translate-y-2">
                
                {/* Icon */}
                <div className="stat-icon text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>

                {/* Number with counter animation */}
                <div className="mb-3">
                  <div className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {counts[index] || 0}
                    <span className="text-3xl">+</span>
                  </div>
                </div>

                {/* Label */}
                <p className="text-gray-400 font-medium text-lg">
                  {stat.label}
                </p>

                {/* Decorative line */}
                <div className={`h-1 bg-gradient-to-r ${stat.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-6`} />

                {/* Corner accent */}
                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mt-16" />
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes floatStats {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50% { transform: translateY(-10px); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
