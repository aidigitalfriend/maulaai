'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const legalDocuments = [
  {
    title: 'Privacy Policy',
    description: 'Learn how we collect, use, and protect your personal information and data.',
    icon: '🔒',
    href: '/legal/privacy-policy',
    lastUpdated: 'January 15, 2026',
    sections: ['Data Collection', 'Usage & Processing', 'Data Protection', 'Your Rights'],
    color: '#00d4ff',
  },
  {
    title: 'Terms of Service',
    description: 'Understand the terms and conditions for using our AI agent platform.',
    icon: '📋',
    href: '/legal/terms-of-service',
    lastUpdated: 'January 15, 2026',
    sections: ['Service Usage', 'User Responsibilities', 'Limitations', 'Termination'],
    color: '#a855f7',
  },
  {
    title: 'Cookie Policy',
    description: 'Information about cookies and tracking technologies we use on our website.',
    icon: '🍪',
    href: '/legal/cookie-policy',
    lastUpdated: 'January 15, 2026',
    sections: ['Cookie Types', 'Purpose & Usage', 'Your Choices', 'Third-Party Cookies'],
    color: '#f59e0b',
  },
  {
    title: 'Payments & Refunds',
    description: 'Policies regarding one-time purchases, payments, refunds, and access management.',
    icon: '💳',
    href: '/legal/payments-refunds',
    lastUpdated: 'November 6, 2025',
    sections: ['One-Time Purchase Terms', 'Payment Methods', 'No Refund Policy', 'Cancellation'],
    color: '#00ff88',
  },
  {
    title: 'Reports',
    description: 'Report inappropriate activities, misuse, or violations of our policies.',
    icon: '⚠️',
    href: '/legal/reports',
    lastUpdated: 'October 22, 2024',
    sections: ['How to Report', 'Report Types', 'Investigation Process', 'Legal Disclaimer'],
    color: '#ef4444',
  },
];

export default function LegalPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // 3D Tilt effect for cards
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  useGSAP(() => {
    // Hero animation
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' })
      .fromTo('.hero-title', { opacity: 0, y: 40, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    // Document cards - explosive stagger from center
    const docCards = gsap.utils.toArray('.doc-card');
    docCards.forEach((card: any, i) => {
      const directions = [
        { x: 0, y: -60, rotate: 0 },
        { x: -50, y: 30, rotate: -5 },
        { x: 50, y: 30, rotate: 5 },
        { x: -60, y: 50, rotate: -3 },
        { x: 60, y: 50, rotate: 3 },
      ];
      const dir = directions[i % directions.length];
      
      gsap.fromTo(card, 
        { opacity: 0, x: dir.x, y: dir.y, rotate: dir.rotate, scale: 0.8, filter: 'blur(5px)' },
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          delay: i * 0.1,
          ease: 'elastic.out(1, 0.8)',
          scrollTrigger: {
            trigger: '.docs-grid',
            start: 'top 80%',
          },
        }
      );
    });

    // Info cards - wave effect
    const infoCards = gsap.utils.toArray('.info-card');
    infoCards.forEach((card: any, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40, rotateY: -20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: '.info-section',
            start: 'top 80%',
          },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white relative">
      
      {/* Custom CSS for creative card effects */}
      <style jsx global>{`
        .glow-card {
          position: relative;
          overflow: hidden;
        }
        .glow-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, #00d4ff, #00ff88, #0066ff, #00d4ff);
          background-size: 400% 100%;
          animation: glow-rotate 4s linear infinite;
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .glow-card:hover::before {
          opacity: 1;
        }
        .glow-card::after {
          content: '';
          position: absolute;
          inset: 1px;
          background: #0f0f0f;
          border-radius: inherit;
          z-index: -1;
        }
        
        @keyframes glow-rotate {
          0% { background-position: 0% 50%; }
          100% { background-position: 400% 50%; }
        }
        
        .shimmer-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(0, 212, 255, 0.1), transparent);
          transition: left 0.6s ease;
        }
        .shimmer-card:hover::before {
          left: 100%;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        
        .float-card {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
        }
        .float-card:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 212, 255, 0.25);
        }
        
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-16 md:py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/30 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-[#00ff88]/5 via-transparent to-transparent blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/10 hover:border-[#00d4ff]/30 transition-colors cursor-default">
            <span className="text-xl">⚖️</span>
            <span className="text-gray-300">Legal & Compliance</span>
          </div>
          
          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
            Legal Information
          </h1>
          
          <p className="hero-subtitle text-lg text-gray-400 max-w-2xl mx-auto">
            Important legal documents and policies governing your use of our AI agent platform. 
            We're committed to transparency and protecting your rights.
          </p>
        </div>
      </section>

      {/* Documents Grid */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="docs-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalDocuments.map((doc, index) => (
              <Link
                key={doc.href}
                href={doc.href}
                className={`doc-card glow-card shimmer-card group relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 overflow-hidden transition-all duration-500 cursor-pointer cyber-grid ${
                  index === 0 ? 'md:col-span-2' : ''
                }`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Background glow on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${doc.color}15, transparent 60%)` }}
                ></div>
                
                {/* Left accent bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to bottom, transparent, ${doc.color}, transparent)` }}
                ></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="text-4xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500"
                      style={{ filter: `drop-shadow(0 0 20px ${doc.color}50)` }}
                    >
                      {doc.icon}
                    </div>
                    <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full group-hover:bg-white/10 transition-colors">
                      Updated {doc.lastUpdated}
                    </span>
                  </div>
                  
                  <h2 
                    className="text-xl font-bold mb-2 transition-colors duration-300"
                    style={{ color: 'white' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = doc.color}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                  >
                    {doc.title}
                  </h2>
                  
                  <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors">
                    {doc.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {doc.sections.map((section) => (
                      <span 
                        key={section} 
                        className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-500 transition-all duration-300 group-hover:scale-105"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${doc.color}20`;
                          e.currentTarget.style.color = doc.color;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.color = 'rgb(107, 114, 128)';
                        }}
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 transition-all duration-300 group-hover:translate-x-2" style={{ color: doc.color }}>
                    <span>Read full document</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🔐', title: 'GDPR Compliant', desc: 'We adhere to European data protection regulations for all users worldwide.', color: '#00d4ff' },
              { icon: '🛡️', title: 'Data Security', desc: 'Enterprise-grade encryption and security measures protect your data.', color: '#00ff88' },
              { icon: '📞', title: 'Contact Us', desc: 'Questions about our policies? Reach out to our legal team anytime.', color: '#0066ff' },
            ].map((item, i) => (
              <div 
                key={i}
                className="info-card float-card glass-card group p-6 rounded-2xl overflow-hidden relative cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}20, transparent 60%)` }}
                ></div>
                
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                  style={{ background: `linear-gradient(135deg, ${item.color}30, transparent)` }}
                >
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-white transition-colors" style={{ color: item.color }}>{item.title}</h3>
                <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-8 md:p-12 text-center relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Have Questions?</h2>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Our legal and support teams are here to help clarify any policies or address concerns.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/support" 
                  className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
                >
                  Contact Support
                </Link>
                <a 
                  href="mailto:legal@onelastai.com" 
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-[#00d4ff]/30 transition-all"
                >
                  Email Legal Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
