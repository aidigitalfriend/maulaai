'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import { Video, Calendar, Clock, User, ArrowRight, Play, Users, Bell } from 'lucide-react';

const webinars = [
  {
    title: "Getting Started with AI Agents",
    date: "November 15, 2025",
    time: "2:00 PM EST",
    speaker: "John Smith",
    role: "AI Product Lead",
    status: "Upcoming",
    description: "Learn the fundamentals of AI agents and how to integrate them into your workflow.",
    topics: ["Agent Basics", "Integration Guide", "Best Practices"],
    color: 'emerald'
  },
  {
    title: "Advanced Customization Techniques",
    date: "November 22, 2025",
    time: "3:00 PM EST",
    speaker: "Sarah Johnson",
    role: "Senior Engineer",
    status: "Upcoming",
    description: "Deep dive into advanced customization options and personality tuning.",
    topics: ["Custom Prompts", "Personality Tuning", "API Deep Dive"],
    color: 'purple'
  },
  {
    title: "Building Enterprise Solutions",
    date: "November 29, 2025",
    time: "2:00 PM EST",
    speaker: "Mike Chen",
    role: "Enterprise Architect",
    status: "Upcoming",
    description: "Scale AI agents for enterprise deployment with security and compliance.",
    topics: ["Enterprise Scale", "Security", "Compliance"],
    color: 'cyan'
  },
  {
    title: "Real-time Analytics & Reporting",
    date: "October 20, 2025",
    time: "2:00 PM EST",
    speaker: "Emily Davis",
    role: "Data Scientist",
    status: "Recorded",
    description: "Master analytics and reporting to track agent performance and insights.",
    topics: ["Analytics Dashboard", "Custom Reports", "Data Insights"],
    color: 'amber'
  },
  {
    title: "Voice Integration Masterclass",
    date: "October 15, 2025",
    time: "3:00 PM EST",
    speaker: "Alex Rivera",
    role: "Voice AI Specialist",
    status: "Recorded",
    description: "Comprehensive guide to implementing voice capabilities in your agents.",
    topics: ["TTS Setup", "Voice Customization", "Real-time Voice"],
    color: 'pink'
  },
  {
    title: "Canvas & Code Generation",
    date: "October 10, 2025",
    time: "2:00 PM EST",
    speaker: "Jordan Lee",
    role: "Developer Advocate",
    status: "Recorded",
    description: "Explore the Canvas feature for AI-powered code and content generation.",
    topics: ["Canvas Basics", "Code Generation", "Content Creation"],
    color: 'blue'
  }
];

export default function WebinarsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'recorded'>('all');

  const filteredWebinars = webinars.filter(w => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return w.status === 'Upcoming';
    if (filter === 'recorded') return w.status === 'Recorded';
    return true;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('webinarWiggle', { wiggles: 5, type: 'uniform' });

        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.fromTo('.gradient-orb', 
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' }
        )
        .fromTo('.floating-icon',
          { y: 30, opacity: 0, scale: 0 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' },
          '-=1'
        )
        .fromTo('.filter-btn',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 },
          '-=0.3'
        )
        .fromTo('.webinar-card',
          { y: 60, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' },
          '-=0.3'
        );

      // Floating icons animation
      document.querySelectorAll('.floating-icon').forEach((icon, i) => {
        gsap.to(icon, {
          y: `random(-15, 15)`,
          x: `random(-10, 10)`,
          rotation: `random(-10, 10)`,
          duration: `random(3, 5)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

      // Gradient orbs animation
      gsap.to('.gradient-orb-1', {
        x: 80,
        y: -60,
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-2', {
        x: -70,
        y: 80,
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Card hover effects
      const cards = document.querySelectorAll('.webinar-card');
      cards.forEach(card => {
        const glow = card.querySelector('.card-glow');
        
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { scale: 1.02, y: -5, duration: 0.3, ease: 'back.out(2)' });
          if (glow) gsap.to(glow, { opacity: 1, duration: 0.3 });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' });
          if (glow) gsap.to(glow, { opacity: 0, duration: 0.3 });
        });
        });

      }, containerRef);

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-24 left-[10%]">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
            <Video className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-40 right-[12%]">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/20">
            <Play className="w-5 h-5 text-purple-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-48 left-[12%]">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/20">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8">
              <Video className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Live & On-Demand</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Webinars
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Join live sessions and access recorded presentations from
              <span className="text-emerald-400"> industry experts.</span>
            </p>
          </div>
        </section>

        {/* Filter */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto flex justify-center gap-3">
            {[
              { id: 'all', label: 'All Webinars' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'recorded', label: 'Recorded' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`filter-btn px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  filter === f.id
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* Webinars Grid */}
        <section className="py-8 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebinars.map((webinar, index) => (
              <div key={index} className="webinar-card group relative">
                <div className={`card-glow absolute inset-0 bg-${webinar.color}-500/20 rounded-2xl opacity-0 blur-xl transition-opacity`} />
                
                <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 flex flex-col overflow-hidden">
                  {/* Corner Accents */}
                  <div className={`absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-${webinar.color}-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className={`absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-${webinar.color}-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  {/* Status Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br border ${webinar.status === 'Upcoming' ? 'border-emerald-500/30' : 'border-purple-500/30'} ${
                      webinar.status === 'Upcoming' ? 'from-emerald-500/20 to-cyan-500/20' : 'from-purple-500/20 to-pink-500/20'
                    } flex items-center justify-center backdrop-blur-sm`}>
                      {webinar.status === 'Upcoming' ? (
                        <Calendar className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      webinar.status === 'Upcoming' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {webinar.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {webinar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                    {webinar.description}
                  </p>

                  {/* Meta */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {webinar.date}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {webinar.time}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <User className="w-4 h-4" />
                      {webinar.speaker} • {webinar.role}
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {webinar.topics.map((topic, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href="/resources/webinars/register"
                    className={`w-full py-3 rounded-xl text-center font-semibold transition-all flex items-center justify-center gap-2 ${
                      webinar.status === 'Upcoming'
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {webinar.status === 'Upcoming' ? (
                      <>
                        Register Now
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Watch Recording
                        <Play className="w-4 h-4" />
                      </>
                    )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-gray-900 to-cyan-500/10 border border-gray-800 text-center overflow-hidden">
                {/* Corner Accents */}
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-500/40 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-lg" />
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Bell className="w-8 h-8 text-emerald-400" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Stay Updated
                </h2>
                
                <p className="text-gray-400 mb-8">
                  Subscribe to get notifications about upcoming webinars and events.
                </p>
                
                <Link
                  href="/subscribe"
                  className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/25 transition-all hover:scale-105"
                >
                  Subscribe Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
