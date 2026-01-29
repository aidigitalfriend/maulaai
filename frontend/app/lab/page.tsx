'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { LockedCard } from '@/components/LockedCard';


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://onelastai.co';

interface Experiment {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  status: 'live' | 'beta' | 'coming-soon';
}

interface LabStats {
  totalTestsAllTime: number;
  labActiveUsers: number;
  totalUsers: number;
}

export default function AILabPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { hasActiveSubscription } = useSubscriptionStatus();
  const [labStats, setLabStats] = useState<LabStats>({
    totalTestsAllTime: 0,
    labActiveUsers: 0,
    totalUsers: 0
  });
  const [experimentTestCounts, setExperimentTestCounts] = useState<Record<string, number>>({});

  const fetchLabStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/analytics/lab/stats`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return;
      const result = await response.json();
      if (result.success && result.data) {
        setLabStats({
          totalTestsAllTime: result.data.realtime.totalTestsAllTime || 0,
          labActiveUsers: result.data.realtime.labActiveUsers || 0,
          totalUsers: result.data.realtime.totalUsers || 0
        });
        const counts: Record<string, number> = {};
        result.data.experiments?.forEach((exp: { id: string; tests: number }) => {
          counts[exp.id] = exp.tests || 0;
        });
        setExperimentTestCounts(counts);
      }
    } catch (err) {
      console.error('Error fetching lab stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchLabStats();
    const interval = setInterval(fetchLabStats, 10000);
    return () => clearInterval(interval);
  }, [fetchLabStats]);

  const experiments: Experiment[] = [
    { id: 'battle-arena', name: 'AI Battle Arena', description: 'Watch AI models compete head-to-head and vote for the winner', icon: '⚔️', color: 'from-yellow-500 to-red-500', href: '/lab/battle-arena', status: 'live' },
    { id: 'image-playground', name: 'AI Image Playground', description: 'Generate stunning images with cutting-edge AI models', icon: '✨', color: 'from-pink-500 to-rose-500', href: '/lab/image-playground', status: 'live' },
    { id: 'voice-cloning', name: 'Voice Cloning Studio', description: 'Clone voices and create custom speech synthesis', icon: '🎙️', color: 'from-purple-500 to-indigo-500', href: '/lab/voice-cloning', status: 'live' },
    { id: 'music-generator', name: 'AI Music Generator', description: 'Compose original music from text descriptions', icon: '🎵', color: 'from-blue-500 to-cyan-500', href: '/lab/music-generator', status: 'live' },
    { id: 'neural-art', name: 'Neural Art Studio', description: 'Transform photos with AI-powered style transfer', icon: '🎨', color: 'from-orange-500 to-amber-500', href: '/lab/neural-art', status: 'live' },
    { id: 'dream-interpreter', name: 'Dream Interpreter', description: 'Analyze dreams and discover subconscious patterns', icon: '🌙', color: 'from-violet-500 to-purple-500', href: '/lab/dream-interpreter', status: 'live' },
    { id: 'story-weaver', name: 'Story Weaver', description: 'Create interactive narratives with AI assistance', icon: '📖', color: 'from-emerald-500 to-teal-500', href: '/lab/story-weaver', status: 'live' },
    { id: 'personality-mirror', name: 'Personality Mirror', description: 'Discover your communication style and traits', icon: '🪞', color: 'from-teal-500 to-cyan-500', href: '/lab/personality-mirror', status: 'live' },
    { id: 'future-predictor', name: 'Future Predictor', description: 'Forecast trends and explore future scenarios', icon: '🔮', color: 'from-indigo-500 to-blue-500', href: '/lab/future-predictor', status: 'live' },
    { id: 'emotion-visualizer', name: 'Emotion Visualizer', description: 'Analyze emotions and visualize feelings in text', icon: '❤️', color: 'from-red-500 to-pink-500', href: '/lab/emotion-visualizer', status: 'live' },
    { id: 'debate-arena', name: 'Debate Arena', description: 'Watch AI agents debate on any topic', icon: '💬', color: 'from-sky-500 to-blue-500', href: '/lab/debate-arena', status: 'live' },
    { id: 'analytics', name: 'Lab Analytics', description: 'Real-time statistics and insights dashboard', icon: '📊', color: 'from-green-500 to-emerald-500', href: '/lab/analytics', status: 'live' },
  ];

  const stats = [
    { value: labStats.totalTestsAllTime.toLocaleString(), label: 'Total Experiments' },
    { value: labStats.labActiveUsers.toLocaleString(), label: 'Active Users' },
    { value: '12', label: 'AI Tools' },
    { value: '24/7', label: 'Availability' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 100, opacity: 0, rotateX: -90 });
      gsap.set(heroSub.words, { y: 40, opacity: 0 });
      gsap.set('.hero-badge', { scale: 0.5, opacity: 0, rotation: -15 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-badge', { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.02 }, '-=0.3')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.02 }, '-=0.3');

      // 2. ScrambleText on stat values
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el, i) => {
        const originalText = el.textContent || '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(el, { duration: 1, scrambleText: { text: originalText, chars: '0123456789,', speed: 0.5 }, delay: i * 0.1 });
          }
        });
      });

      // 3. ScrollTrigger batch for experiment cards
      gsap.set('.experiment-card', { y: 60, opacity: 0, scale: 0.95 });
      ScrollTrigger.batch('.experiment-card', {
        start: 'top 90%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.4)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 60, opacity: 0, scale: 0.95, duration: 0.3 })
      });

      // 4. Flip for stats
      gsap.set('.stat-card', { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: '.stats-grid',
        start: 'top 85%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.stat-card').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, y: 0 });
            Flip.from(state, { duration: 0.5, delay: i * 0.1, ease: 'power2.out' });
          });
        }
      });

      // 5. Observer parallax
      Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const scrollY = self.scrollY;
          gsap.to('.parallax-orb-1', { y: scrollY * 0.15, duration: 0.4, ease: 'none' });
          gsap.to('.parallax-orb-2', { y: scrollY * -0.1, duration: 0.4, ease: 'none' });
          gsap.to('.parallax-orb-3', { y: scrollY * 0.08, duration: 0.4, ease: 'none' });
        }
      });

      // 6. MotionPath for orbiting beaker
      gsap.to('.orbit-beaker', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 80, y: -40 }, { x: 160, y: 0 }, { x: 80, y: 40 }, { x: 0, y: 0 }],
          curviness: 2,
        },
        duration: 16,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on buttons
      gsap.utils.toArray<HTMLElement>('.action-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.05, duration: 0.4, ease: 'labWiggle' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.3 });
        });
      });

      // 8. DrawSVG for decorative elements
      gsap.set('.draw-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.experiments-section',
        start: 'top 80%',
        onEnter: () => gsap.to('.draw-line', { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut' })
      });

      // 9. Draggable experiment cards
      if (window.innerWidth > 768) {
        Draggable.create('.draggable-card', {
          type: 'x,y',
          bounds: containerRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
          }
        });
      }

      // 10. Floating particles
      gsap.utils.toArray<HTMLElement>('.float-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-60, 60)`,
          y: `random(-50, 50)`,
          rotation: `random(-180, 180)`,
          duration: `random(6, 10)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

      // 11. Experiment icon hover pulse
      gsap.utils.toArray<HTMLElement>('.experiment-icon').forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.3, rotation: 10, duration: 0.3, ease: 'back.out(2)' });
        });
        icon.addEventListener('mouseleave', () => {
          gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3 });
        });
      });

      // 12. Status badge pulse
      gsap.utils.toArray<HTMLElement>('.status-badge').forEach((badge) => {
        gsap.to(badge, {
          boxShadow: '0 0 15px rgba(34, 197, 94, 0.6)',
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, [labStats]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-orb-1 absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[150px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[130px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(12)].map((_, i) => (
          <div key={i} className="float-particle absolute w-2 h-2 bg-purple-400/30 rounded-full" style={{ left: `${8 + i * 7}%`, top: `${12 + (i % 5) * 16}%` }} />
        ))}
        <div className="orbit-beaker absolute top-40 left-1/3 w-4 h-4 bg-cyan-400/60 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm rounded-full border border-purple-500/30 mb-6">
            <span className="text-xl">🧪</span>
            <span className="font-medium">Experimental AI Laboratory</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">AI Lab</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Explore cutting-edge AI experiments. Generate art, clone voices, compose music, and discover the future of artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#experiments" className="action-btn px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all">
              Start Experimenting
            </Link>
            <Link href="/lab/analytics" className="action-btn px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
              📊 View Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-10 px-4">
        <div className="max-w-5xl mx-auto stats-grid grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center">
              <div className="stat-value text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Experiments Grid */}
      <section id="experiments" className="experiments-section relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <svg className="absolute left-1/2 -translate-x-1/2 -top-6 h-1 w-1/2 opacity-30" preserveAspectRatio="none">
            <line className="draw-line" x1="0" y1="0" x2="100%" y2="0" stroke="url(#labGrad)" strokeWidth="2" />
            <defs>
              <linearGradient id="labGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">AI Experiments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map((exp, idx) => {
              const testCount = experimentTestCounts[exp.id] || 0;
              const CardContent = (
                <div className={`experiment-card draggable-card group relative p-6 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all ${!hasActiveSubscription && exp.status !== 'live' ? 'opacity-60' : ''}`}>
                  <div className="absolute top-4 right-4">
                    <span className={`status-badge text-xs px-2 py-1 rounded-full ${exp.status === 'live' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : exp.status === 'beta' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                      {exp.status === 'live' ? '● Live' : exp.status === 'beta' ? '● Beta' : 'Coming Soon'}
                    </span>
                  </div>
                  <div className={`experiment-icon text-5xl mb-4 inline-block p-3 rounded-2xl bg-gradient-to-br ${exp.color} shadow-lg cursor-pointer`}>
                    {exp.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{exp.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{exp.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{testCount.toLocaleString()} experiments</span>
                    <span className="text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">Explore →</span>
                  </div>
                </div>
              );

              if (!hasActiveSubscription && exp.status !== 'live') {
                return (
                  <LockedCard key={exp.id} title={exp.name} description="Subscribe to unlock this experiment">
                    {CardContent}
                  </LockedCard>
                );
              }

              return (
                <Link key={exp.id} href={exp.href} className="block">
                  {CardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border border-purple-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experiment?</h2>
              <p className="text-gray-400 mb-8 text-lg">Dive into our AI laboratory and discover what's possible with cutting-edge AI technology.</p>
              <Link href="/lab/battle-arena" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                ⚔️ Start with Battle Arena
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
