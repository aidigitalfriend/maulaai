'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, FileText, Newspaper, Video, GraduationCap, Briefcase, ArrowRight, Mail } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ResourcesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const resources = [
    {
      title: 'Blog',
      description: 'Explore 80+ articles on AI history, machine learning, and industry insights.',
      icon: FileText,
      href: '/resources/blog',
      items: ['AI History & Evolution', 'Machine Learning Guides', 'Agent Development', 'Industry Insights'],
      color: '#00d4ff'
    },
    {
      title: 'Case Studies',
      description: 'Real-world success stories and implementations from our clients.',
      icon: BookOpen,
      href: '/resources/case-studies',
      items: ['Customer Success', 'ROI Analysis', 'Implementation Stories', 'Before & After'],
      color: '#a855f7'
    },
    {
      title: 'News',
      description: 'Latest announcements, product updates, and company news.',
      icon: Newspaper,
      href: '/resources/news',
      items: ['Product Updates', 'Company Announcements', 'Partnership News', 'Feature Releases'],
      color: '#00ff88'
    },
    {
      title: 'Webinars',
      description: 'Live sessions and recorded presentations from industry experts.',
      icon: Video,
      href: '/resources/webinars',
      items: ['Live Sessions', 'Recorded Content', 'Expert Panels', 'Q&A Sessions'],
      color: '#f59e0b'
    },
    {
      title: 'Documentation',
      description: 'Comprehensive guides and technical documentation for our platform.',
      icon: BookOpen,
      href: '/resources/documentation',
      items: ['API Reference', 'Integration Guides', 'Best Practices', 'Troubleshooting'],
      color: '#ec4899'
    },
    {
      title: 'Tutorials',
      description: 'Step-by-step guides to help you get the most out of our AI agents.',
      icon: GraduationCap,
      href: '/resources/tutorials',
      items: ['Getting Started', 'Advanced Features', 'Video Guides', 'Interactive Demos'],
      color: '#6366f1'
    }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.resource-card',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.resources-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.cta-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.cta-section', start: 'top 85%' } }
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <BookOpen className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-gray-300">Knowledge Hub</span>
          </div>
          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">
            Resources & Learning
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
            Discover insights, learn best practices, and stay ahead with our comprehensive resource library.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="resources-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, i) => {
              const Icon = resource.icon;
              return (
                <Link key={i} href={resource.href} className="resource-card glass-card rounded-2xl p-8 group opacity-0 hover:scale-[1.02] transition-transform">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: `${resource.color}20`, border: `1px solid ${resource.color}40` }}>
                    <Icon className="w-7 h-7" style={{ color: resource.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00d4ff] transition-colors">{resource.title}</h3>
                  <p className="text-gray-500 text-sm mb-6">{resource.description}</p>
                  <ul className="space-y-2 mb-6">
                    {resource.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: resource.color }}></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <span className="text-sm flex items-center gap-1" style={{ color: resource.color }}>
                    Explore <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Careers Banner */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/resources/careers" className="glass-card rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-[#a855f7]/30">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#a855f7]/20 rounded-xl flex items-center justify-center border border-[#a855f7]/40">
                <Briefcase className="w-8 h-8 text-[#a855f7]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#a855f7] transition-colors">Join Our Team</h3>
                <p className="text-gray-400">Explore career opportunities at One Last AI</p>
              </div>
            </div>
            <span className="text-[#a855f7] flex items-center gap-2 font-semibold">
              View Openings <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 px-6 cta-section">
        <div className="cta-card max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <Mail className="w-12 h-12 text-[#00d4ff] mx-auto mb-6" />
          <h2 className="text-2xl font-bold metallic-text mb-4">Stay Updated</h2>
          <p className="text-gray-400 mb-8">Subscribe to our newsletter for the latest resources, insights, and updates.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold hover:opacity-90 transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
