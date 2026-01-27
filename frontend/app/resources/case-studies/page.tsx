'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, TrendingUp, Check, ArrowRight, Building2, Zap, Users, DollarSign } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CaseStudiesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const caseStudies = [
    {
      title: 'Healthcare Provider Reduces Response Time by 85%',
      industry: 'Healthcare',
      company: 'MedFirst Hospital Network',
      challenge: 'Overwhelming patient inquiries and appointment scheduling',
      solution: 'AI-powered patient support and scheduling assistant',
      results: ['85% faster response time', '60% reduction in call volume', '95% patient satisfaction', '$2M annual savings'],
      image: '🏥',
      color: '#00d4ff'
    },
    {
      title: 'E-commerce Giant Scales Customer Support 10x',
      industry: 'Retail',
      company: 'ShopFlow Commerce',
      challenge: 'Seasonal customer service demands and 24/7 support needs',
      solution: 'Multi-language AI agents for customer service',
      results: ['10x support capacity', '24/7 availability', '40% cost reduction', '92% issue resolution'],
      image: '🛒',
      color: '#a855f7'
    },
    {
      title: 'Financial Services Improves Compliance by 95%',
      industry: 'Finance',
      company: 'SecureBank Holdings',
      challenge: 'Complex regulatory compliance and risk assessment',
      solution: 'AI compliance monitoring and automated risk analysis',
      results: ['95% compliance improvement', '75% faster risk assessment', '50% audit prep time', 'Zero violations'],
      image: '🏦',
      color: '#00ff88'
    },
    {
      title: 'Manufacturing Company Optimizes Production by 30%',
      industry: 'Manufacturing',
      company: 'TechFlow Industries',
      challenge: 'Production inefficiencies and quality control issues',
      solution: 'AI-driven production optimization and quality monitoring',
      results: ['30% production optimization', '25% quality improvement', '20% waste reduction', '$5M cost savings'],
      image: '🏭',
      color: '#f59e0b'
    }
  ];

  const stats = [
    { icon: Building2, value: '500+', label: 'Enterprise Clients', color: '#00d4ff' },
    { icon: Zap, value: '85%', label: 'Avg. Efficiency Gain', color: '#a855f7' },
    { icon: Users, value: '10M+', label: 'Users Impacted', color: '#00ff88' },
    { icon: DollarSign, value: '$50M+', label: 'Customer Savings', color: '#f59e0b' }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.stat-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.stats-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.case-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.cases-grid', start: 'top 85%' } }
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
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/resources" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00d4ff] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-gray-300">Success Stories</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Case Studies</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Discover how organizations across industries are transforming with our AI agents
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="stat-card glass-card rounded-2xl p-6 text-center opacity-0">
                  <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: stat.color }} />
                  <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="cases-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
            {caseStudies.map((study, i) => (
              <div key={i} className="case-card glass-card rounded-2xl p-8 opacity-0 hover:scale-[1.01] transition-transform">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-5xl">{study.image}</div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: `${study.color}20`, color: study.color }}>
                    {study.industry}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{study.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{study.company}</p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Challenge</h4>
                    <p className="text-gray-400 text-sm">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Solution</h4>
                    <p className="text-gray-400 text-sm">{study.solution}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {study.results.map((result, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4" style={{ color: study.color }} />
                      <span className="text-gray-300">{result}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-gray-400 mb-8">Join hundreds of companies transforming with AI</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded-xl font-semibold hover:opacity-90 transition-all">
              Schedule Demo
            </Link>
            <Link href="/contact" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Contact Sales →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
