'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Users, Linkedin, Twitter, Mail, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function TeamPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const leadership = [
    { name: 'Shahbaz Chaudhry', role: 'CEO & Co-founder', bio: 'AI researcher with 15+ years of experience building intelligent systems', color: '#00d4ff', avatar: '👨‍💼' },
    { name: 'Adil Pieter', role: 'CTO & Co-founder', bio: 'Machine learning expert and former Google AI researcher', color: '#a855f7', avatar: '👨‍💻' },
    { name: 'Zara Faisal', role: 'VP of Product', bio: 'Product leader focused on user experience and innovation', color: '#00ff88', avatar: '👩‍💼' }
  ];

  const team = [
    { name: 'Sarah Williams', role: 'VP of Sales', bio: 'Enterprise sales veteran with deep market knowledge', color: '#f59e0b', avatar: '👩‍💻' },
    { name: 'Emily Chen', role: 'Lead AI Engineer', bio: 'PhD in Computer Science from Stanford University', color: '#ec4899', avatar: '👩‍🔬' },
    { name: 'David Rodriguez', role: 'Head of Design', bio: 'Design leader passionate about usability and aesthetics', color: '#06b6d4', avatar: '👨‍🎨' }
  ];

  const departments = [
    { name: 'Engineering', count: '25+', color: '#00d4ff' },
    { name: 'Product', count: '12', color: '#a855f7' },
    { name: 'Sales', count: '18', color: '#00ff88' },
    { name: 'Research', count: '8', color: '#f59e0b' },
    { name: 'Design', count: '6', color: '#ec4899' },
    { name: 'Support', count: '15', color: '#6366f1' }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.leadership-card',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.leadership-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.team-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.team-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.dept-card',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.depts-grid', start: 'top 85%' } }
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/about" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#a855f7] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to About
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Users className="w-4 h-4 text-[#a855f7]" />
              <span className="text-gray-300">Our Team</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Meet the Team</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              The passionate people behind One Last AI driving innovation in artificial intelligence
            </p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Leadership</h2>
            <p className="text-gray-400">Visionaries leading our AI revolution</p>
          </div>
          <div className="leadership-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((person, i) => (
              <div key={i} className="leadership-card glass-card rounded-2xl p-8 text-center group opacity-0 hover:scale-[1.02] transition-transform">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl" style={{ background: `${person.color}20`, border: `2px solid ${person.color}` }}>
                  {person.avatar}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{person.name}</h3>
                <p className="text-sm mb-4" style={{ color: person.color }}>{person.role}</p>
                <p className="text-gray-500 text-sm mb-6">{person.bio}</p>
                <div className="flex justify-center gap-3">
                  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Twitter className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Key Team Members</h2>
            <p className="text-gray-400">Experts driving excellence across every department</p>
          </div>
          <div className="team-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((person, i) => (
              <div key={i} className="team-card glass-card rounded-xl p-6 opacity-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: `${person.color}20`, border: `1px solid ${person.color}` }}>
                    {person.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{person.name}</h4>
                    <p className="text-sm" style={{ color: person.color }}>{person.role}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Our Departments</h2>
            <p className="text-gray-400">A growing team of talented professionals</p>
          </div>
          <div className="depts-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {departments.map((dept, i) => (
              <div key={i} className="dept-card glass-card rounded-xl p-4 text-center opacity-0 hover:scale-105 transition-transform">
                <div className="text-2xl font-bold mb-1" style={{ color: dept.color }}>{dept.count}</div>
                <div className="text-gray-400 text-sm">{dept.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Join Our Team</h2>
          <p className="text-gray-400 mb-8">We&apos;re always looking for talented individuals to join our mission</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/resources/careers" className="px-8 py-4 bg-gradient-to-r from-[#a855f7] to-[#6366f1] rounded-xl font-semibold hover:opacity-90 transition-all">
              View Open Positions
            </Link>
            <Link href="/about/partnerships" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Partner With Us →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
