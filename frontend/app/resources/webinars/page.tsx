'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Video, Calendar, Clock, User, Play, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function WebinarsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const upcomingWebinars = [
    {
      title: 'Getting Started with AI Agents',
      date: 'February 15, 2026',
      time: '2:00 PM EST',
      speaker: 'John Smith',
      description: 'Learn the fundamentals of AI agents and how to deploy them effectively.',
      color: '#00d4ff'
    },
    {
      title: 'Advanced Customization Techniques',
      date: 'February 22, 2026',
      time: '3:00 PM EST',
      speaker: 'Sarah Johnson',
      description: 'Deep dive into agent customization and advanced configuration options.',
      color: '#a855f7'
    },
    {
      title: 'Building Enterprise Solutions',
      date: 'February 29, 2026',
      time: '2:00 PM EST',
      speaker: 'Mike Chen',
      description: 'Scale your AI implementation for enterprise-grade deployments.',
      color: '#00ff88'
    }
  ];

  const recordedWebinars = [
    {
      title: 'Real-time Analytics & Reporting',
      date: 'January 20, 2026',
      speaker: 'Emily Davis',
      duration: '45 min',
      views: '1.2K',
      color: '#f59e0b'
    },
    {
      title: 'Security Best Practices',
      date: 'January 15, 2026',
      speaker: 'David Chen',
      duration: '38 min',
      views: '890',
      color: '#ec4899'
    },
    {
      title: 'Integration Masterclass',
      date: 'January 8, 2026',
      speaker: 'Lisa Park',
      duration: '52 min',
      views: '2.1K',
      color: '#6366f1'
    }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.upcoming-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.upcoming-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.recorded-card',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.recorded-grid', start: 'top 85%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/resources" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#f59e0b] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Video className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-gray-300">Live Sessions</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Webinars</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Live training sessions and recorded presentations to help you master AI agents
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Upcoming Webinars</h2>
            <p className="text-gray-400">Register now to secure your spot</p>
          </div>
          <div className="upcoming-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingWebinars.map((webinar, i) => (
              <div key={i} className="upcoming-card glass-card rounded-2xl p-6 opacity-0 group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    Upcoming
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#00d4ff] transition-colors">{webinar.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{webinar.description}</p>
                <div className="space-y-2 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {webinar.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {webinar.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> {webinar.speaker}
                  </div>
                </div>
                <Link href="/webinars/register-now" className="w-full py-3 rounded-xl font-semibold text-center block" style={{ background: `${webinar.color}20`, color: webinar.color, border: `1px solid ${webinar.color}40` }}>
                  Register Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recorded */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Recorded Sessions</h2>
            <p className="text-gray-400">Watch anytime, at your own pace</p>
          </div>
          <div className="recorded-grid space-y-4">
            {recordedWebinars.map((webinar, i) => (
              <div key={i} className="recorded-card glass-card rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 opacity-0 group hover:border-[#00d4ff]/30">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: `${webinar.color}20`, border: `1px solid ${webinar.color}40` }}>
                    <Play className="w-6 h-6" style={{ color: webinar.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 group-hover:text-[#00d4ff] transition-colors">{webinar.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{webinar.speaker}</span>
                      <span>•</span>
                      <span>{webinar.date}</span>
                      <span>•</span>
                      <span>{webinar.duration}</span>
                      <span>•</span>
                      <span>{webinar.views} views</span>
                    </div>
                  </div>
                </div>
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" /> Watch Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Stay Updated</h2>
          <p className="text-gray-400 mb-8">Get notified about upcoming webinars and events</p>
          <Link href="/subscribe" className="inline-block px-8 py-4 bg-gradient-to-r from-[#f59e0b] to-[#ef4444] rounded-xl font-semibold hover:opacity-90 transition-all">
            Subscribe Now
          </Link>
        </div>
      </section>
    </div>
  );
}
