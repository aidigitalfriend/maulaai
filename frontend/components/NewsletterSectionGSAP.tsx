'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
}

export default function NewsletterSectionGSAP() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statsBadgeRef = useRef<HTMLDivElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLParagraphElement>(null);

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
          { opacity: 0, y: 50, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.03,
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

      // Form entrance
      if (formRef.current) {
        gsap.fromTo(formRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: formRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Stats badge
      if (statsBadgeRef.current) {
        gsap.fromTo(statsBadgeRef.current,
          { opacity: 0, x: 50, scale: 0.8 },
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

      // Floating badge
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
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Continuous float
        gsap.to(floatingBadgeRef.current, {
          y: -10,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: 1.3,
        });
      }

      // Privacy text
      if (privacyRef.current) {
        gsap.fromTo(privacyRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.3,
            scrollTrigger: {
              trigger: privacyRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setMessage('Thanks for subscribing! Check your inbox for confirmation.');
      setEmail('');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 md:py-32 bg-gradient-to-b from-[#0a0a10] via-[#0a0c0e] to-[#0a0a10] text-white overflow-hidden relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-slate-600/8 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gray-500/8 rounded-full filter blur-[150px]"></div>
      </div>

      {/* Decorative line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gray-500/40"
            style={{
              left: `${10 + (i * 8) % 80}%`,
              top: `${15 + (i * 7) % 70}%`,
              animation: `floatNewsletter ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left - Content */}
            <div className="lg:w-2/3">
              <span 
                ref={badgeRef}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/20 rounded-full text-gray-300 text-sm font-medium mb-6 border border-gray-500/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Newsletter
              </span>
              
              <h2 
                ref={titleRef}
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
                style={{ opacity: 1 }}
              >
                Stay <span className="text-gray-300">Updated</span>
              </h2>
              
              <p 
                ref={descRef}
                className="text-lg text-gray-400 mb-8 leading-relaxed"
              >
                Get the latest news, features, and tips delivered to your inbox every week. Join 5,000+ subscribers.
              </p>
              
              <form ref={formRef} onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={status === 'loading'}
                  className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/30 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </form>
              
              {/* Status messages */}
              {status === 'success' && (
                <p className="text-sm text-emerald-400 flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {message}
                </p>
              )}
              
              {status === 'error' && (
                <p className="text-sm text-red-400 flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {message}
                </p>
              )}
              
              <p ref={privacyRef} className="text-sm text-gray-500">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
            
            {/* Right - Stats & Badge */}
            <div className="lg:w-1/3 flex lg:flex-col items-center lg:items-end gap-6">
              {/* Stats badge */}
              <div 
                ref={statsBadgeRef}
                className="bg-[#12121a]/90 backdrop-blur-sm rounded-xl p-5 border border-gray-500/30 shadow-lg"
              >
                <div className="text-2xl font-bold text-white">5K+</div>
                <div className="text-sm text-gray-400">Subscribers</div>
              </div>
              
              {/* Floating badge */}
              <div 
                ref={floatingBadgeRef}
                className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center shadow-xl border border-gray-600/30"
              >
                <span className="text-2xl">📬</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes floatNewsletter {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50% { transform: translateY(-10px); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
