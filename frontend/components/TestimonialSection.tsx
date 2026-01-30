'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "This platform completely transformed how we handle customer support. Our response times dropped by 70%.",
    author: "Sarah Johnson",
    role: "CEO",
    company: "Tech Innovations Inc",
    rating: 5
  },
  {
    quote: "The AI agents are incredibly smart and customizable. We integrated them in less than a day.",
    author: "Michael Chen",
    role: "CTO",
    company: "Digital Solutions Ltd",
    rating: 5
  },
  {
    quote: "Best investment we made this year. The ROI has been phenomenal and our team loves using it.",
    author: "Emily Rodriguez",
    role: "Director of Operations",
    company: "Growth Co",
    rating: 5
  }
];

export default function TestimonialSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Title animation with SplitText
      if (titleRef.current) {
        // Set initial visibility
        gsap.set(titleRef.current, { opacity: 1 });
        
        const split = new SplitText(titleRef.current, { type: 'chars,words' });
        
        gsap.fromTo(split.chars,
          { opacity: 0, y: 50, rotateX: -90 },
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

      // Cards 3D flip entrance
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.testimonial-card');
        
        cards.forEach((card, index) => {
          gsap.fromTo(card,
            { 
              opacity: 0, 
              rotateY: -60,
              scale: 0.8,
              x: -50,
            },
            {
              opacity: 1,
              rotateY: 0,
              scale: 1,
              x: 0,
              duration: 0.8,
              delay: index * 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );

          // Stars animation inside each card
          const stars = card.querySelectorAll('.star');
          gsap.fromTo(stars,
            { opacity: 0, scale: 0, rotate: -180 },
            {
              opacity: 1,
              scale: 1,
              rotate: 0,
              duration: 0.4,
              stagger: 0.08,
              delay: index * 0.15 + 0.3,
              ease: 'back.out(2)',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }

      // CTA entrance
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
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
      className="relative py-20 md:py-32 overflow-hidden"
    >
      {/* Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10] via-[#0a0c14] to-[#0a0a10] -z-10" />
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none -z-5">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full filter blur-[150px]"></div>
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
              animation: `floatTestimonial ${3 + (i % 3)}s ease-in-out infinite`,
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
            Trusted by Industry Leaders
          </h2>
          <p 
            ref={subtitleRef}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            See what our users have to say about transforming their workflows
          </p>
        </div>

        {/* Testimonials Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6"
          style={{ perspective: '1000px' }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card group relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Card Background with gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-1" />
              
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-[#1a1a24]/80 via-[#16161f]/60 to-[#12121a]/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 h-full hover:-translate-y-2">
                
                {/* Star Rating */}
                <div className="flex gap-2 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="star text-xl">⭐</span>
                  ))}
                </div>

                {/* Quote Text */}
                <blockquote className="text-gray-300 mb-8 text-lg leading-relaxed italic">
                  <span className="text-blue-400 font-bold text-2xl mr-2">&quot;</span>
                  {testimonial.quote}
                  <span className="text-blue-400 font-bold text-2xl ml-2">&quot;</span>
                </blockquote>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-6" />

                {/* Author Info */}
                <div>
                  <p className="font-bold text-white text-lg">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-400">
                    {testimonial.role}, <span className="text-blue-400">{testimonial.company}</span>
                  </p>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-4 right-4 text-4xl opacity-10 group-hover:opacity-30 transition-opacity">
                  💭
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div ref={ctaRef} className="text-center mt-16">
          <p className="text-gray-400 mb-6">
            Join 10,000+ companies transforming their business with Maula AI
          </p>
          <a
            href="/community"
            className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 group"
          >
            <span>Join Community</span>
            <span className="border-l border-white/30 pl-3 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes floatTestimonial {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50% { transform: translateY(-10px); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
