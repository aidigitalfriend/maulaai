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
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    title: 'Terms of Service',
    description: 'Understand the terms and conditions for using our AI agent platform.',
    icon: '📋',
    href: '/legal/terms-of-service',
    lastUpdated: 'January 15, 2026',
    sections: ['Service Usage', 'User Responsibilities', 'Limitations', 'Termination'],
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    title: 'Cookie Policy',
    description: 'Information about cookies and tracking technologies we use on our website.',
    icon: '🍪',
    href: '/legal/cookie-policy',
    lastUpdated: 'January 15, 2026',
    sections: ['Cookie Types', 'Purpose & Usage', 'Your Choices', 'Third-Party Cookies'],
    color: 'from-amber-500/20 to-orange-500/20',
  },
  {
    title: 'Payments & Refunds',
    description: 'Policies regarding one-time purchases, payments, refunds, and access management.',
    icon: '💳',
    href: '/legal/payments-refunds',
    lastUpdated: 'November 6, 2025',
    sections: ['One-Time Purchase Terms', 'Payment Methods', 'No Refund Policy', 'Cancellation'],
    color: 'from-green-500/20 to-emerald-500/20',
  },
  {
    title: 'Reports',
    description: 'Report inappropriate activities, misuse, or violations of our policies.',
    icon: '⚠️',
    href: '/legal/reports',
    lastUpdated: 'October 22, 2024',
    sections: ['How to Report', 'Report Types', 'Investigation Process', 'Legal Disclaimer'],
    color: 'from-red-500/20 to-rose-500/20',
  },
];

export default function LegalPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero animation
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    // Document cards stagger
    gsap.fromTo('.doc-card',
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: '.docs-grid',
          start: 'top 80%',
        },
      }
    );

    // Info cards
    gsap.fromTo('.info-card',
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.info-section',
          start: 'top 80%',
        },
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-16 md:py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/30 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/10">
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
                className={`doc-card group relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300 ${
                  index === 0 ? 'md:col-span-2' : ''
                }`}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${doc.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {doc.icon}
                    </div>
                    <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                      Updated {doc.lastUpdated}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold mb-2 group-hover:text-[#00d4ff] transition-colors">
                    {doc.title}
                  </h2>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {doc.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {doc.sections.map((section) => (
                      <span 
                        key={section} 
                        className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-500 group-hover:bg-[#00d4ff]/10 group-hover:text-[#00d4ff]/80 transition-colors"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-[#00d4ff] transition-colors">
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
            <div className="info-card p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center text-2xl mb-4">
                🔐
              </div>
              <h3 className="font-semibold mb-2">GDPR Compliant</h3>
              <p className="text-sm text-gray-500">
                We adhere to European data protection regulations for all users worldwide.
              </p>
            </div>
            
            <div className="info-card p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center text-2xl mb-4">
                🛡️
              </div>
              <h3 className="font-semibold mb-2">Data Security</h3>
              <p className="text-sm text-gray-500">
                Enterprise-grade encryption and security measures protect your data.
              </p>
            </div>
            
            <div className="info-card p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center text-2xl mb-4">
                📞
              </div>
              <h3 className="font-semibold mb-2">Contact Us</h3>
              <p className="text-sm text-gray-500">
                Questions about our policies? Reach out to our legal team anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] border border-white/10 p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Have Questions?</h2>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Our legal and support teams are here to help clarify any policies or address concerns.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/support" 
                  className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-all hover:scale-105"
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
