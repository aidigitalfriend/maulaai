'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import { Briefcase, Users, Code, TrendingUp, MapPin, Clock, DollarSign, Heart, Zap, Coffee, GraduationCap, ArrowRight, Sparkles, Check, ChevronRight } from 'lucide-react';

const jobListings = [
  {
    id: 'sales-executive',
    title: 'Sales Executive',
    department: 'Business Development',
    location: 'Remote / Hybrid',
    type: 'Full-time',
    experience: '3+ years',
    salary: '$60,000 - $90,000',
    color: 'emerald',
    gradient: 'from-emerald-500 to-cyan-500',
    icon: TrendingUp,
  },
  {
    id: 'sales-manager',
    title: 'Sales Manager',
    department: 'Business Development',
    location: 'Remote / Hybrid',
    type: 'Full-time',
    experience: '5+ years',
    salary: '$90,000 - $130,000',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    icon: Briefcase,
  },
  {
    id: 'fullstack-developer',
    title: 'Full Stack Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    experience: '2+ years',
    salary: '$70,000 - $110,000',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    icon: Code,
  },
  {
    id: 'ai-engineer',
    title: 'AI/ML Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    experience: '3+ years',
    salary: '$100,000 - $150,000',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    icon: Zap,
  },
  {
    id: 'product-designer',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    experience: '2+ years',
    salary: '$65,000 - $95,000',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    icon: Sparkles,
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    experience: '3+ years',
    salary: '$85,000 - $125,000',
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
    icon: Code,
  },
];

const benefits = [
  { icon: DollarSign, title: 'Competitive Salary', desc: 'Top-of-market compensation with equity options' },
  { icon: Heart, title: 'Health Benefits', desc: 'Comprehensive health, dental, and vision coverage' },
  { icon: Coffee, title: 'Remote First', desc: 'Work from anywhere with flexible hours' },
  { icon: GraduationCap, title: 'Learning Budget', desc: '$2,000/year for courses and conferences' },
  { icon: Users, title: 'Great Team', desc: 'Collaborative culture with talented people' },
  { icon: Zap, title: 'Fast Growth', desc: 'Rapid career advancement opportunities' },
];

const values = [
  { title: 'Innovation', desc: 'We push boundaries and embrace new ideas' },
  { title: 'Transparency', desc: 'Open communication and honest feedback' },
  { title: 'Impact', desc: 'Every contribution matters and makes a difference' },
  { title: 'Growth', desc: 'Continuous learning and personal development' },
];

export default function CareersPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('careerWiggle', { wiggles: 5, type: 'uniform' });
        gsap.registerPlugin(ScrollTrigger);

        // Floating elements
        gsap.fromTo('.floating-icon',
          { y: 30, opacity: 0, scale: 0 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' }
        );

        gsap.fromTo('.gradient-orb',
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' }
        );

        // ScrollTrigger for job cards
        ScrollTrigger.batch('.job-card', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { y: 60, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // ScrollTrigger for benefits
        ScrollTrigger.batch('.benefit-card', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // ScrollTrigger for values
        ScrollTrigger.batch('.value-card', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { x: -30, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
            );
          },
          start: 'top 90%',
          once: true
        });

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
        gsap.to('.gradient-orb-1', { x: 80, y: -60, duration: 15, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.gradient-orb-2', { x: -70, y: 80, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut' });

        // Card hover effects
        const cards = document.querySelectorAll('.job-card');
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

        ScrollTrigger.refresh();
      }, containerRef);

      return () => ctx.revert();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-violet-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-24 left-[10%]">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 backdrop-blur-sm flex items-center justify-center border border-violet-500/20">
            <Briefcase className="w-6 h-6 text-violet-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-40 right-[12%]">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/20">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-48 left-[12%]">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-8">
              <Briefcase className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Join Our Team</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Build the Future
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Join Maula AI and help shape the future of
              <span className="text-violet-400"> conversational AI.</span>
            </p>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Open Positions</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobListings.map((job) => (
                <Link
                  key={job.id}
                  href={`/resources/apply-job?position=${encodeURIComponent(job.title)}&id=${job.id}`}
                  className="job-card group relative block"
                >
                  <div className={`card-glow absolute inset-0 bg-gradient-to-r ${job.gradient} rounded-2xl opacity-0 blur-xl transition-opacity`} />
                  
                  <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 overflow-hidden">
                    {/* Corner accents */}
                    <div className={`absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-${job.color}-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className={`absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-${job.color}-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                    
                    <div className={`w-12 h-12 rounded-xl bg-${job.color}-500/20 border border-${job.color}-500/30 flex items-center justify-center mb-4`}>
                      <job.icon className={`w-6 h-6 text-${job.color}-400`} />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {job.title}
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-4">{job.department}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        {job.type} • {job.experience}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-cyan-400 text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                      Apply Now
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Why Join Us?</h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              We offer competitive benefits and a culture that values your growth.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="benefit-card group relative p-6 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-violet-500/30 rounded-bl-lg" />
                  
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, i) => (
                <div key={i} className="value-card group relative flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-violet-500/30 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                  
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{value.title}</h3>
                    <p className="text-gray-400 text-sm">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 text-center overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10" />
              
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-violet-500/40 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-lg" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Don't See Your Role?
                </h2>
                <p className="text-gray-400 mb-8">
                  We're always looking for talented people. Send us your resume and we'll reach out if there's a fit.
                </p>
                <Link
                  href="/resources/apply-job?position=General Application&id=general"
                  className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-violet-500/25 transition-all hover:scale-105"
                >
                  Submit General Application
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
