'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, CustomWiggle, CustomEase } from '@/lib/gsap';
import { Shield, Lock, Key, Server, FileCheck, Eye, AlertTriangle, CheckCircle, Globe, Building, ChevronRight, Sparkles, Mail, ExternalLink, ArrowRight } from 'lucide-react';

const securityFeatures = [
  {
    title: 'Data Encryption',
    description: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption.',
    icon: Lock,
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    details: ['End-to-end encryption', 'TLS 1.3 for data in transit', 'AES-256 for data at rest', 'Regular encryption audits'],
  },
  {
    title: 'Access Control',
    description: 'Advanced authentication and authorization mechanisms to protect your accounts.',
    icon: Key,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/20',
    borderColor: 'border-violet-500/30',
    details: ['Multi-factor authentication (MFA)', 'Role-based access control (RBAC)', 'Single Sign-On (SSO)', 'API key management'],
  },
  {
    title: 'Infrastructure Security',
    description: 'Enterprise-grade infrastructure with multiple layers of security protection.',
    icon: Server,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    details: ['Cloud-based redundancy', 'DDoS protection', 'Firewall protection', 'Intrusion detection systems'],
  },
  {
    title: 'Compliance & Certifications',
    description: 'We maintain the highest industry standards and certifications.',
    icon: FileCheck,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    details: ['SOC 2 Type II certified', 'GDPR compliant', 'ISO 27001 certified', 'HIPAA compliant'],
  },
  {
    title: 'Monitoring & Logging',
    description: 'Continuous monitoring and comprehensive logging of all system activities.',
    icon: Eye,
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30',
    details: ['24/7 system monitoring', 'Detailed audit logs', 'Real-time alerts', 'Security incident response'],
  },
  {
    title: 'Vulnerability Management',
    description: 'Proactive identification and remediation of security vulnerabilities.',
    icon: Shield,
    gradient: 'from-indigo-500 to-blue-600',
    iconBg: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    details: ['Regular penetration testing', 'Security code reviews', 'Bug bounty program', 'Vulnerability scanning'],
  },
];

const complianceStandards = [
  { name: 'GDPR', description: 'General Data Protection Regulation compliance for EU users', icon: '🇪🇺', gradient: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
  { name: 'SOC 2 Type II', description: 'Independently audited security, availability, and confidentiality controls', icon: '📋', gradient: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-500/20', borderColor: 'border-violet-500/30' },
  { name: 'ISO 27001', description: 'International standard for information security management systems', icon: '🌍', gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30' },
  { name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act compliance', icon: '🏥', gradient: 'from-pink-500 to-rose-600', iconBg: 'bg-pink-500/20', borderColor: 'border-pink-500/30' },
];

const bestPractices = [
  { title: 'Use Strong Passwords', description: 'Create passwords with at least 12 characters including uppercase, lowercase, numbers, and symbols.', icon: Key, gradient: 'from-cyan-500 to-blue-600', iconBg: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30' },
  { title: 'Enable MFA', description: 'Always enable multi-factor authentication on your account for an extra layer of security.', icon: Lock, gradient: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-500/20', borderColor: 'border-violet-500/30' },
  { title: 'Keep Software Updated', description: 'Regularly update your browser and operating system to receive the latest security patches.', icon: Server, gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30' },
  { title: 'Be Cautious with Links', description: "Don't click suspicious links or download files from untrusted sources.", icon: AlertTriangle, gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-500/20', borderColor: 'border-amber-500/30' },
  { title: 'Review Access Logs', description: 'Regularly review your account access logs and remove any unauthorized sessions.', icon: Eye, gradient: 'from-pink-500 to-rose-600', iconBg: 'bg-pink-500/20', borderColor: 'border-pink-500/30' },
  { title: 'Report Vulnerabilities', description: 'Report any security issues to our security team at security@maula.ai.', icon: Shield, gradient: 'from-indigo-500 to-blue-600', iconBg: 'bg-indigo-500/20', borderColor: 'border-indigo-500/30' },
];

const faqs = [
  { q: 'Where is my data stored?', a: 'Your data is stored in secure, redundant data centers across multiple geographic locations. All data is encrypted both in transit and at rest.' },
  { q: 'How often do you perform security audits?', a: 'We perform comprehensive security audits quarterly and maintain continuous monitoring. We also engage third-party security firms for penetration testing twice yearly.' },
  { q: 'Can I export my data?', a: 'Yes, you can export your data at any time in standard formats. We support GDPR data portability requirements for all users.' },
  { q: "What happens if there's a data breach?", a: 'In the unlikely event of a breach, we will notify affected users within 24 hours as required by law. We maintain comprehensive incident response procedures.' },
  { q: 'Is my data shared with third parties?', a: 'No, we do not sell or share your personal data with third parties. We only share data with service providers under strict data processing agreements.' },
  { q: 'How do I enable two-factor authentication?', a: 'You can enable 2FA in your account settings. We support authenticator apps and SMS-based verification methods for maximum security.' },
];

export default function SecurityPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('securityWiggle', { wiggles: 5, type: 'uniform' });
        gsap.registerPlugin(ScrollTrigger);

        // Floating icons animation only
        gsap.fromTo('.floating-icon', 
          { y: 30, opacity: 0, scale: 0 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)', delay: 0.3 }
        );
        
        gsap.fromTo('.gradient-orb', 
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' }
        );

        // Security cards with ScrollTrigger
        ScrollTrigger.batch('.security-card', {
          onEnter: (el) => gsap.fromTo(el, 
            { y: 60, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' }
          ),
          start: 'top 90%',
          once: true,
        });

        // Compliance cards
        ScrollTrigger.batch('.compliance-card', {
          onEnter: (el) => gsap.fromTo(el,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
          ),
          start: 'top 90%',
          once: true,
        });

        // Practice cards
        ScrollTrigger.batch('.practice-card', {
          onEnter: (el) => gsap.fromTo(el,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
          ),
          start: 'top 90%',
          once: true,
        });

        // FAQ cards
        ScrollTrigger.batch('.faq-card', {
          onEnter: (el) => gsap.fromTo(el,
            { x: -30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
          ),
          start: 'top 90%',
          once: true,
        });

        // Floating icons animation
        document.querySelectorAll('.floating-icon').forEach((icon, i) => {
          gsap.to(icon, { y: `random(-15, 15)`, x: `random(-10, 10)`, rotation: `random(-10, 10)`, duration: `random(3, 5)`, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.2 });
        });

        // Gradient orbs animation
        gsap.to('.gradient-orb-1', { x: 80, y: -60, duration: 15, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.gradient-orb-2', { x: -70, y: 80, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut' });

        // Card hover effects
        const cards = document.querySelectorAll('.security-card');
        cards.forEach((card) => {
          const glow = card.querySelector('.card-glow');
          const icon = card.querySelector('.card-icon');
          card.addEventListener('mouseenter', () => {
            gsap.to(card, { scale: 1.02, y: -8, duration: 0.4, ease: 'power2.out' });
            if (glow) gsap.to(glow, { opacity: 1, duration: 0.4 });
            if (icon) gsap.to(icon, { scale: 1.1, rotate: 10, duration: 0.3, ease: 'back.out(2)' });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(card, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
            if (glow) gsap.to(glow, { opacity: 0, duration: 0.3 });
            if (icon) gsap.to(icon, { scale: 1, rotate: 0, duration: 0.3, ease: 'power2.out' });
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
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-24 left-[10%]">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/20">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-40 right-[12%]">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 backdrop-blur-sm flex items-center justify-center border border-violet-500/20">
            <Lock className="w-5 h-5 text-violet-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-48 left-[12%]">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
            <Key className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-8">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Enterprise Security</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Security First
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Your data security and privacy are our <span className="text-cyan-400">top priorities.</span>
            </p>
          </div>
        </section>

        {/* Security Features */}
        <section ref={cardsRef} className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Security Features</h2>
            <p className="text-gray-400 text-center mb-12">Comprehensive security measures protecting your data</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {securityFeatures.map((feature, i) => (
                <div key={i} className="security-card group relative">
                  {/* Glow effect */}
                  <div className={`card-glow absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 blur-xl transition-opacity duration-500`} />
                  
                  <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden">
                    {/* Corner accents */}
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                    
                    {/* Icon */}
                    <div className={`card-icon w-16 h-16 rounded-xl ${feature.iconBg} border ${feature.borderColor} flex items-center justify-center mb-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">{feature.description}</p>
                    
                    {/* Details list */}
                    <div className="pt-4 border-t border-gray-800">
                      <ul className="space-y-2">
                        {feature.details.map((detail, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Compliance Standards</h2>
            <p className="text-gray-400 text-center mb-12">We maintain the highest industry certifications</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {complianceStandards.map((standard, i) => (
                <div key={i} className="compliance-card group relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-gray-700 transition-colors text-center overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-violet-500/30 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-violet-500/30 rounded-bl-lg" />
                  
                  <div className="text-5xl mb-4">{standard.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{standard.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{standard.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Security Best Practices</h2>
            <p className="text-gray-400 text-center mb-12">Tips to keep your account and data secure</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bestPractices.map((practice, i) => (
                <div key={i} className="practice-card group relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-lg" />
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${practice.iconBg} border ${practice.borderColor} flex items-center justify-center mb-6`}>
                    <practice.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{practice.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{practice.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Report Section */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-amber-500/20 text-center overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
              
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500/30 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500/30 rounded-bl-lg" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Report a Security Issue</h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  If you discover a security vulnerability, please report it responsibly to our security team.
                </p>
                <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 mb-6 inline-block">
                  <p className="text-gray-500 text-sm mb-2">Security Email:</p>
                  <a href="mailto:security@maula.ai" className="text-xl font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-2">
                    <Mail className="w-5 h-5" />
                    security@maula.ai
                  </a>
                </div>
                <p className="text-sm text-gray-500">
                  Please provide detailed information and allow 48 hours for our team to respond.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Security FAQ</h2>
            <p className="text-gray-400 text-center mb-12">Common questions about our security practices</p>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="faq-card group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/20 group-hover:border-cyan-500/40 rounded-tr-lg transition-colors" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/20 group-hover:border-cyan-500/40 rounded-bl-lg transition-colors" />
                  
                  <div className="relative flex gap-4">
                    {/* Question icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <span className="text-2xl">{i === 0 ? '🗄️' : i === 1 ? '🔍' : i === 2 ? '📤' : i === 3 ? '🚨' : i === 4 ? '🤝' : '🔐'}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{faq.q}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 text-center overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10" />
              
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-violet-500/40 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-lg" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">Your security is guaranteed. Start using our AI platform with confidence.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-violet-500/25 transition-all hover:scale-105"
                  >
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    href="/legal"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 font-medium hover:bg-gray-700 hover:text-white hover:border-gray-600 transition-all"
                  >
                    Legal Documents
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
