'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign, Check, ArrowRight, Users, Zap, Heart, Globe } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CareersPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const departments = ['All', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations'];

  const jobs = [
    {
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote / San Francisco',
      type: 'Full-time',
      salary: '$180K - $250K',
      color: '#00d4ff'
    },
    {
      title: 'ML Engineer - NLP',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$200K - $280K',
      color: '#00d4ff'
    },
    {
      title: 'Product Manager - AI Agents',
      department: 'Product',
      location: 'San Francisco',
      type: 'Full-time',
      salary: '$150K - $200K',
      color: '#a855f7'
    },
    {
      title: 'Senior Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      salary: '$140K - $180K',
      color: '#00ff88'
    },
    {
      title: 'Growth Marketing Manager',
      department: 'Marketing',
      location: 'New York / Remote',
      type: 'Full-time',
      salary: '$120K - $160K',
      color: '#f59e0b'
    },
    {
      title: 'Enterprise Account Executive',
      department: 'Sales',
      location: 'San Francisco',
      type: 'Full-time',
      salary: '$150K - $250K OTE',
      color: '#ec4899'
    }
  ];

  const benefits = [
    { icon: Heart, title: 'Healthcare', description: 'Comprehensive medical, dental, and vision coverage' },
    { icon: DollarSign, title: 'Competitive Pay', description: 'Top-tier salaries plus equity packages' },
    { icon: Globe, title: 'Remote First', description: 'Work from anywhere in the world' },
    { icon: Zap, title: 'Learning Budget', description: '$2,500 annual learning & development stipend' }
  ];

  const values = [
    { title: 'Innovation First', description: 'We push boundaries and embrace new ideas' },
    { title: 'User Obsessed', description: 'Everything we build starts with user needs' },
    { title: 'Move Fast', description: 'We ship quickly and iterate based on feedback' },
    { title: 'Win Together', description: 'Collaboration and support define our culture' }
  ];

  const filteredJobs = jobs.filter(job => 
    selectedDepartment === 'All' || job.department === selectedDepartment
  );

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.benefit-card',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.benefits-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.value-card',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.values-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.job-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.jobs-grid', start: 'top 85%' } }
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
          <Link href="/resources" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#a855f7] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Briefcase className="w-4 h-4 text-[#a855f7]" />
              <span className="text-gray-300">Join Our Team</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Careers</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Help us build the future of AI agents and transform how businesses operate
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold metallic-text text-center mb-12">Why Join Us?</h2>
          <div className="benefits-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="benefit-card glass-card rounded-2xl p-6 text-center opacity-0">
                  <div className="w-14 h-14 bg-[#a855f7]/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#a855f7]/40">
                    <Icon className="w-7 h-7 text-[#a855f7]" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-500 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold metallic-text text-center mb-12">Our Values</h2>
          <div className="values-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={i} className="value-card glass-card rounded-xl p-6 opacity-0">
                <h3 className="font-bold text-white mb-2">{value.title}</h3>
                <p className="text-gray-500 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold metallic-text text-center mb-4">Open Positions</h2>
          <p className="text-gray-400 text-center mb-8">Find your next opportunity</p>

          {/* Department Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {departments.map((dept, i) => (
              <button
                key={i}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedDepartment === dept
                    ? 'bg-[#a855f7] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Jobs Grid */}
          <div className="jobs-grid space-y-4">
            {filteredJobs.map((job, i) => (
              <Link key={i} href={`/resources/apply-job?position=${encodeURIComponent(job.title)}`} className="job-card glass-card rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 opacity-0 group hover:border-[#a855f7]/30">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-white group-hover:text-[#a855f7] transition-colors">{job.title}</h3>
                    <span className="px-2 py-0.5 rounded text-xs" style={{ background: `${job.color}20`, color: job.color }}>
                      {job.department}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> {job.salary}
                    </span>
                  </div>
                </div>
                <span className="text-[#a855f7] flex items-center gap-1 font-medium">
                  Apply Now <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No open positions in this department at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <Users className="w-12 h-12 text-[#a855f7] mx-auto mb-6" />
          <h2 className="text-2xl font-bold metallic-text mb-4">Don't See Your Role?</h2>
          <p className="text-gray-400 mb-8">We're always looking for talented people. Send us your resume!</p>
          <a href="mailto:careers@onelastai.com" className="inline-block px-8 py-4 bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-xl font-semibold hover:opacity-90 transition-all">
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
