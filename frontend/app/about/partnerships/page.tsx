'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Cloud, Zap, Globe, Link2, Award, Users, ArrowRight, Handshake, Building2 } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function PartnershipsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const technologyPartners = [
    { name: 'Google Cloud', icon: '☁️', description: 'Infrastructure and AI/ML services', details: 'Leveraging Google Cloud for scalable agent deployment.', color: '#4285f4' },
    { name: 'Amazon Web Services', icon: '⚙️', description: 'Cloud computing and storage', details: 'Using AWS for reliable hosting and data processing.', color: '#ff9900' },
    { name: 'Microsoft Azure', icon: '🔷', description: 'Enterprise cloud and AI services', details: 'Integrating Azure for advanced AI capabilities.', color: '#00a4ef' }
  ];

  const integrationPartners = [
    { name: 'Slack', icon: '💬', description: 'Team communication', color: '#4a154b' },
    { name: 'Microsoft Teams', icon: '👥', description: 'Enterprise collaboration', color: '#6264a7' },
    { name: 'Zapier', icon: '⚡', description: 'Automation platform', color: '#ff4a00' },
    { name: 'HubSpot', icon: '📊', description: 'CRM & marketing', color: '#ff7a59' }
  ];

  const resellerPartners = [
    { name: 'Accenture', icon: '🏢', description: 'Technology consulting', color: '#a100ff' },
    { name: 'Deloitte', icon: '📈', description: 'Professional services', color: '#86bc25' },
    { name: 'IBM Consulting', icon: '🔧', description: 'Enterprise solutions', color: '#0530ad' }
  ];

  const stats = [
    { number: '50+', label: 'Active Partnerships', color: '#00d4ff' },
    { number: '150+', label: 'Countries Reached', color: '#a855f7' },
    { number: '10K+', label: 'Enterprises Supported', color: '#00ff88' },
    { number: '99.99%', label: 'Uptime SLA', color: '#f59e0b' }
  ];

  const benefits = [
    { icon: Award, title: 'Certified Partners', desc: 'Access to official certifications and training', color: '#00d4ff' },
    { icon: Users, title: 'Dedicated Support', desc: 'Priority support for all partner integrations', color: '#a855f7' },
    { icon: Zap, title: 'Early Access', desc: 'First to receive new features and updates', color: '#00ff88' },
    { icon: Globe, title: 'Co-Marketing', desc: 'Joint marketing opportunities and exposure', color: '#f59e0b' }
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

    gsap.fromTo('.partner-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.tech-partners', start: 'top 85%' } }
    );

    gsap.fromTo('.integration-card',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.integrations-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.benefit-card',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.benefits-grid', start: 'top 85%' } }
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,255,136,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/about" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00ff88] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to About
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Handshake className="w-4 h-4 text-[#00ff88]" />
              <span className="text-gray-300">Our Partners</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Partnerships</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Building the future of AI together with industry leaders and innovators
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card glass-card rounded-2xl p-6 text-center opacity-0">
                <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: stat.color }}>
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-24 px-6 tech-partners">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Technology Partners</h2>
            <p className="text-gray-400">World-class infrastructure powering our platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {technologyPartners.map((partner, i) => (
              <div key={i} className="partner-card glass-card rounded-2xl p-8 opacity-0">
                <div className="text-4xl mb-4">{partner.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{partner.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{partner.description}</p>
                <p className="text-gray-400 text-sm">{partner.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Integration Partners</h2>
            <p className="text-gray-400">Seamless connections with your favorite tools</p>
          </div>
          <div className="integrations-grid grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrationPartners.map((partner, i) => (
              <div key={i} className="integration-card glass-card rounded-xl p-6 text-center opacity-0 hover:scale-105 transition-transform">
                <div className="text-3xl mb-3">{partner.icon}</div>
                <h4 className="font-bold text-white mb-1">{partner.name}</h4>
                <p className="text-gray-500 text-sm">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reseller Partners */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Channel Partners</h2>
            <p className="text-gray-400">Global consulting and implementation partners</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resellerPartners.map((partner, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 text-center hover:scale-[1.02] transition-transform">
                <div className="text-4xl mb-4">{partner.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{partner.name}</h3>
                <p className="text-gray-500 text-sm">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Partner Benefits</h2>
            <p className="text-gray-400">Why companies choose to partner with us</p>
          </div>
          <div className="benefits-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="benefit-card glass-card rounded-xl p-6 opacity-0">
                  <Icon className="w-8 h-8 mb-4" style={{ color: benefit.color }} />
                  <h4 className="font-bold text-white mb-2">{benefit.title}</h4>
                  <p className="text-gray-500 text-sm">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Become a Partner</h2>
          <p className="text-gray-400 mb-8">Join our ecosystem and grow together with One Last AI</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-xl font-semibold text-black hover:opacity-90 transition-all">
              Apply for Partnership
            </Link>
            <Link href="/about/team" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Meet the Team →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
