'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';


export default function CommunityOverviewPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const communityLinks = [
    { icon: '💬', emoji: '💬', title: 'Discord Community', description: 'Join our active Discord server to connect with other AI enthusiasts, get help, and share your projects.', link: '/community/discord', linkText: 'Join Discord', color: 'from-indigo-500 to-purple-600' },
    { icon: '🔧', emoji: '🔧', title: 'Contributing', description: 'Help improve Maula AI by contributing code, reporting bugs, or suggesting new features.', link: '/community/contributing', linkText: 'Get Involved', color: 'from-green-500 to-emerald-600' },
    { icon: '🗺️', emoji: '🗺️', title: 'Open Roadmap', description: 'See what features are coming next, track progress, and vote on what matters to you.', link: '/community/roadmap', linkText: 'View Roadmap', color: 'from-amber-500 to-orange-600' },
    { icon: '💡', emoji: '💡', title: 'Suggestions', description: 'Share your ideas and feature requests. We love hearing from our community!', link: '/community/suggestions', linkText: 'Submit Ideas', color: 'from-pink-500 to-rose-600' }
  ];

  const stats = [
    { number: '10K+', label: 'Active Members', emoji: '👥', color: 'cyan' },
    { number: '5K+', label: 'GitHub Stars', emoji: '⭐', color: 'amber' },
    { number: '500+', label: 'Contributions', emoji: '🔧', color: 'green' },
    { number: '18', label: 'AI Agents', emoji: '🤖', color: 'purple' }
  ];

  const highlights = [
    { icon: '❤️', title: 'Supportive Environment', description: 'Our community is welcoming to all skill levels' },
    { icon: '💻', title: 'Open Source Spirit', description: 'Transparency and collaboration at our core' },
    { icon: '⭐', title: 'Recognition', description: 'Top contributors get featured and rewarded' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 100, opacity: 0, rotateX: -90 });
      gsap.set(heroSub.words, { y: 40, opacity: 0 });
      gsap.set('.hero-icon', { scale: 0, rotation: -720 });
      gsap.set('.cta-btn', { y: 30, opacity: 0, scale: 0.9 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-icon', { scale: 1, rotation: 0, duration: 1.4, ease: 'elastic.out(1, 0.4)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.02 }, '-=0.9')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.02 }, '-=0.4')
        .to('.cta-btn', { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' }, '-=0.3');

      // 2. ScrambleText on stats numbers
      gsap.utils.toArray<HTMLElement>('.stat-number').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(el, {
              duration: 1.8,
              scrambleText: { text: el.dataset.value || el.innerText, chars: '0123456789+K', speed: 0.5 },
            });
          },
          once: true
        });
      });

      // 3. ScrollTrigger batch for stat cards
      gsap.set('.stat-card', { y: 80, opacity: 0, scale: 0.85, rotateY: -20 });
      ScrollTrigger.batch('.stat-card', {
        start: 'top 85%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, rotateY: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.5)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 80, opacity: 0, scale: 0.85, rotateY: -20, duration: 0.3 })
      });

      // 4. Flip animation for link cards on scroll reveal
      gsap.set('.link-card', { opacity: 0, y: 60, rotateX: -15 });
      ScrollTrigger.batch('.link-card', {
        start: 'top 80%',
        onEnter: (batch) => {
          batch.forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, y: 0, rotateX: 0 });
            Flip.from(state, { duration: 0.6, delay: i * 0.1, ease: 'power2.out' });
          });
        }
      });

      // 5. Observer for parallax
      Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const scrollY = self.scrollY;
          gsap.to('.parallax-bg-1', { y: scrollY * 0.25, duration: 0.5, ease: 'none' });
          gsap.to('.parallax-bg-2', { y: scrollY * -0.15, duration: 0.5, ease: 'none' });
        }
      });

      // 6. MotionPath orbiting decoration
      gsap.to('.orbit-dot', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 80, y: -40 }, { x: 160, y: 0 }, { x: 80, y: 40 }, { x: 0, y: 0 }],
          curviness: 2,
        },
        duration: 10,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on icons
      gsap.utils.toArray<HTMLElement>('.wiggle-icon').forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { rotation: 25, duration: 0.6, ease: 'communityWiggle' });
        });
        icon.addEventListener('mouseleave', () => {
          gsap.to(icon, { rotation: 0, duration: 0.3 });
        });
      });

      // 8. DrawSVG for decorative lines
      gsap.set('.draw-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.draw-section',
        start: 'top 70%',
        onEnter: () => gsap.to('.draw-line', { drawSVG: '100%', duration: 1.5, ease: 'power2.inOut' })
      });

      // 9. Highlight cards with 3D hover
      gsap.set('.highlight-card', { y: 50, opacity: 0 });
      ScrollTrigger.batch('.highlight-card', {
        start: 'top 85%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out' })
      });

      // 10. Floating particles with physics-like motion
      gsap.utils.toArray<HTMLElement>('.float-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-80, 80)`,
          y: `random(-60, 60)`,
          rotation: `random(-90, 90)`,
          duration: `random(5, 10)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.25
        });
      });

      // 11. Draggable cards with inertia
      if (cardsContainerRef.current) {
        Draggable.create('.draggable-highlight', {
          type: 'x,y',
          bounds: cardsContainerRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
          }
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCardHover = (e: React.MouseEvent, entering: boolean) => {
    const card = e.currentTarget;
    gsap.to(card, { y: entering ? -8 : 0, scale: entering ? 1.02 : 1, duration: 0.3 });
    gsap.to(card.querySelector('.card-glow'), { opacity: entering ? 1 : 0, duration: 0.3 });
    gsap.to(card.querySelector('.card-arrow'), { x: entering ? 8 : 0, duration: 0.3 });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-bg-1 absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px]" />
        <div className="parallax-bg-2 absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        {[...Array(12)].map((_, i) => (
          <div key={i} className="float-particle absolute w-1.5 h-1.5 bg-cyan-400/30 rounded-full" style={{ left: `${8 + i * 7}%`, top: `${12 + (i % 4) * 20}%` }} />
        ))}
        <div className="orbit-dot absolute top-32 left-1/4 w-2 h-2 bg-purple-400/60 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="hero-icon inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl border border-cyan-500/30 mb-8 shadow-2xl shadow-cyan-500/20">
            <span className="text-5xl wiggle-icon">👥</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">Our Community</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Join thousands of AI enthusiasts, developers, and innovators building the future together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/community/discord" className="cta-btn inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105">
              💬 Join Discord
            </Link>
            <Link href="/community/contributing" className="cta-btn inline-flex items-center gap-2 px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
              🔧 Contribute
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-4 draw-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Community Stats</h2>
            <p className="text-gray-400 text-lg">A growing community making AI accessible to everyone</p>
          </div>

          {/* SVG Decorative Line */}
          <svg className="absolute left-0 right-0 top-1/2 h-1 w-full opacity-30" preserveAspectRatio="none">
            <line className="draw-line" x1="0" y1="0" x2="100%" y2="0" stroke="url(#lineGradient)" strokeWidth="2" />
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                <span className="text-4xl mb-3 block wiggle-icon">{stat.emoji}</span>
                <div className="stat-number text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" data-value={stat.number}>
                  {stat.number}
                </div>
                <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/30 mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Get Involved</h2>
            <p className="text-gray-400 text-lg">There are many ways to be part of our community</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {communityLinks.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="link-card group relative block"
                onMouseEnter={(e) => handleCardHover(e, true)}
                onMouseLeave={(e) => handleCardHover(e, false)}
              >
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden transition-all duration-300">
                  <div className={`card-glow absolute inset-0 bg-gradient-to-br ${item.color} opacity-0`} style={{ opacity: 0 }} />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                  <div className="relative z-10 flex items-start gap-5">
                    <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 wiggle-icon`}>
                      {item.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                      <p className="text-gray-400 mb-4">{item.description}</p>
                      <div className="flex items-center gap-2 text-cyan-400 font-medium">
                        {item.linkText}
                        <span className="card-arrow transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section ref={cardsContainerRef} className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Why Join Us?</h2>
            <p className="text-gray-400 text-lg">Be part of a community that values collaboration, learning, and innovation</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((item, idx) => (
              <div key={idx} className="highlight-card draggable-highlight relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center group hover:border-cyan-500/50 transition-colors cursor-grab">
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-4xl">🚀</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join our community today and be part of the AI revolution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/community/discord" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                  💬 Join Discord
                </Link>
                <Link href="/community" className="px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
                  Browse Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
