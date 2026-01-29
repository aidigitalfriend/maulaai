'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, Observer, CustomWiggle, CustomEase, DrawSVGPlugin, MotionPathPlugin, Draggable } from '@/lib/gsap';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, UserCheck, Globe, Server, Key, ArrowLeft, ChevronDown, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const sections = [
    {
      id: 'data-collection',
      icon: Database,
      title: 'Information We Collect',
      color: 'cyan',
      content: [
        {
          subtitle: 'Personal Information',
          text: 'When you create an account, we collect your name, email address, and payment information. This is essential for providing our AI agent services and processing transactions.'
        },
        {
          subtitle: 'Usage Data',
          text: 'We automatically collect information about how you interact with our platform, including pages visited, features used, and time spent on various sections.'
        },
        {
          subtitle: 'Device Information',
          text: 'We collect device identifiers, browser type, operating system, and IP address to ensure security and optimize your experience.'
        },
        {
          subtitle: 'AI Interaction Data',
          text: 'Conversations with our AI agents may be stored to improve service quality, train our models, and provide personalized experiences.'
        }
      ]
    },
    {
      id: 'data-usage',
      icon: Eye,
      title: 'How We Use Your Data',
      color: 'purple',
      content: [
        {
          subtitle: 'Service Delivery',
          text: 'Your data enables us to provide, maintain, and improve our AI agent services, including personalization and feature enhancements.'
        },
        {
          subtitle: 'Communication',
          text: 'We use your contact information to send important updates, security alerts, and optional marketing communications (with your consent).'
        },
        {
          subtitle: 'Security & Fraud Prevention',
          text: 'We analyze usage patterns to detect and prevent fraudulent activities, unauthorized access, and potential security threats.'
        },
        {
          subtitle: 'Analytics & Improvement',
          text: 'Aggregated, anonymized data helps us understand usage trends and improve our platform for all users.'
        }
      ]
    },
    {
      id: 'data-sharing',
      icon: Globe,
      title: 'Information Sharing',
      color: 'amber',
      content: [
        {
          subtitle: 'Service Providers',
          text: 'We share data with trusted third-party providers who assist in payment processing, hosting, analytics, and customer support—under strict confidentiality agreements.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose information when required by law, court order, or to protect our rights, users, or public safety.'
        },
        {
          subtitle: 'Business Transfers',
          text: 'In the event of a merger, acquisition, or sale, user data may be transferred as part of the business assets.'
        },
        {
          subtitle: 'With Your Consent',
          text: 'We will share your information with third parties when you explicitly authorize us to do so.'
        }
      ]
    },
    {
      id: 'data-security',
      icon: Lock,
      title: 'Data Security',
      color: 'emerald',
      content: [
        {
          subtitle: 'Encryption',
          text: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Your information is protected at every stage.'
        },
        {
          subtitle: 'Access Controls',
          text: 'We implement strict role-based access controls, ensuring only authorized personnel can access user data, with full audit logging.'
        },
        {
          subtitle: 'Regular Audits',
          text: 'Our security practices undergo regular third-party audits and penetration testing to identify and address vulnerabilities.'
        },
        {
          subtitle: 'Incident Response',
          text: 'We maintain a comprehensive incident response plan to quickly address any security events and notify affected users as required by law.'
        }
      ]
    },
    {
      id: 'your-rights',
      icon: UserCheck,
      title: 'Your Rights',
      color: 'rose',
      content: [
        {
          subtitle: 'Access & Portability',
          text: 'You can request a copy of all personal data we hold about you in a machine-readable format at any time.'
        },
        {
          subtitle: 'Correction',
          text: 'You have the right to correct any inaccurate personal information in your account or by contacting our support team.'
        },
        {
          subtitle: 'Deletion',
          text: 'You can request deletion of your account and associated data. We will comply within 30 days, subject to legal retention requirements.'
        },
        {
          subtitle: 'Opt-Out',
          text: 'You can opt out of marketing communications, AI training data usage, and certain analytics at any time through your account settings.'
        }
      ]
    },
    {
      id: 'cookies',
      icon: Key,
      title: 'Cookies & Tracking',
      color: 'blue',
      content: [
        {
          subtitle: 'Essential Cookies',
          text: 'Required for basic site functionality, authentication, and security. These cannot be disabled.'
        },
        {
          subtitle: 'Analytics Cookies',
          text: 'Help us understand how users interact with our platform. You can opt out through your browser settings or our cookie preferences.'
        },
        {
          subtitle: 'Preference Cookies',
          text: 'Remember your settings, language preferences, and customizations across sessions.'
        },
        {
          subtitle: 'Marketing Cookies',
          text: 'Used only with your consent to deliver relevant advertisements and measure campaign effectiveness.'
        }
      ]
    },
    {
      id: 'international',
      icon: Server,
      title: 'International Transfers',
      color: 'indigo',
      content: [
        {
          subtitle: 'Data Locations',
          text: 'Your data may be processed in the United States and other countries where our service providers operate.'
        },
        {
          subtitle: 'Safeguards',
          text: 'We use Standard Contractual Clauses (SCCs) and other approved mechanisms to ensure adequate protection for international data transfers.'
        },
        {
          subtitle: 'EU/UK Users',
          text: 'For users in the European Union and United Kingdom, we comply with GDPR requirements and maintain appropriate data transfer agreements.'
        },
        {
          subtitle: 'California Residents',
          text: 'California residents have additional rights under the CCPA, including the right to know what data is sold and to opt out of such sales.'
        }
      ]
    }
  ];

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Register custom wiggle
      CustomWiggle.create('privacyWiggle', { wiggles: 5, type: 'uniform' });

      // Hero animations
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSubtitle = new SplitText('.hero-subtitle', { type: 'words' });

      gsap.set(heroTitle.chars, { y: 80, opacity: 0, rotateX: -90 });
      gsap.set(heroSubtitle.words, { y: 25, opacity: 0 });
      gsap.set('.hero-shield', { scale: 0, rotate: -180 });
      gsap.set('.hero-badge', { y: 30, opacity: 0 });
      gsap.set('.hero-line', { scaleX: 0 });
      gsap.set('.floating-lock', { y: -50, opacity: 0 });

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      heroTl
        .to('.hero-shield', {
          scale: 1,
          rotate: 0,
          duration: 1,
          ease: 'back.out(1.7)'
        })
        .to('.floating-lock', {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1
        }, '-=0.5')
        .to(heroTitle.chars, {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.02
        }, '-=0.4')
        .to(heroSubtitle.words, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.02
        }, '-=0.3')
        .to('.hero-line', {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.inOut'
        }, '-=0.2')
        .to('.hero-badge', {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.5)'
        }, '-=0.4');

      // Floating shield animation
      gsap.to('.hero-shield', {
        y: -10,
        rotate: 5,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.2
      });

      // Floating locks orbit
      document.querySelectorAll('.floating-lock').forEach((lock, i) => {
        gsap.to(lock, {
          y: `random(-20, 20)`,
          x: `random(-15, 15)`,
          rotation: `random(-10, 10)`,
          duration: `random(3, 5)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3
        });
      });

      // Section cards entrance
      gsap.set('.section-card', { y: 60, opacity: 0 });
      
      ScrollTrigger.batch('.section-card', {
        start: 'top 85%',
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out'
          });
        }
      });

      // Section card hover effects
      document.querySelectorAll('.section-card').forEach((card) => {
        const icon = card.querySelector('.section-icon');
        const chevron = card.querySelector('.section-chevron');

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.01,
            duration: 0.3,
            ease: 'power2.out'
          });
          gsap.to(icon, {
            scale: 1.2,
            rotate: 10,
            duration: 0.3,
            ease: 'back.out(2)'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
          gsap.to(icon, {
            scale: 1,
            rotate: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });

      // Table of contents sticky animation
      gsap.to('.toc-container', {
        scrollTrigger: {
          trigger: '.content-section',
          start: 'top 100px',
          end: 'bottom bottom',
          pin: '.toc-container',
          pinSpacing: false
        }
      });

      // Gradient orbs
      gsap.to('.gradient-orb-1', {
        x: 60,
        y: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-2', {
        x: -50,
        y: 40,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Observer for scroll velocity
      Observer.create({
        target: containerRef.current,
        type: 'scroll',
        onChangeY: (self) => {
          const velocity = Math.min(Math.abs(self.velocityY) / 1500, 0.5);
          gsap.to('.section-card', {
            skewY: self.velocityY > 0 ? velocity : -velocity,
            duration: 0.2
          });
        },
        onStop: () => {
          gsap.to('.section-card', {
            skewY: 0,
            duration: 0.4,
            ease: 'elastic.out(1, 0.5)'
          });
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', iconBg: 'bg-cyan-500/20' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', iconBg: 'bg-amber-500/20' },
      emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
      rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', iconBg: 'bg-rose-500/20' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', iconBg: 'bg-blue-500/20' },
      indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', iconBg: 'bg-indigo-500/20' },
    };
    return colors[color] || colors.cyan;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb-1 absolute top-20 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="gradient-orb-2 absolute bottom-40 left-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-black to-black" />
        
        {/* Floating locks */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <Lock
              key={i}
              className={`floating-lock absolute w-6 h-6 text-cyan-400/30`}
              style={{
                left: `${15 + i * 15}%`,
                top: `${25 + (i % 3) * 20}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            href="/legal" 
            className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Legal
          </Link>

          {/* Shield Icon */}
          <div className="hero-shield mb-8 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <Shield className="w-12 h-12 text-cyan-400" />
          </div>

          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          
          <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Your privacy is fundamental to us. This policy explains how we collect, use, and protect your personal information.
          </p>

          <div className="hero-line w-32 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mb-8 rounded-full" />

          <div className="flex flex-wrap justify-center gap-4">
            <div className="hero-badge px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm">
              Effective: January 15, 2026
            </div>
            <div className="hero-badge px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
              GDPR & CCPA Compliant
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Quick Summary */}
          <div className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Quick Summary</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We collect only the data necessary to provide our AI services. Your data is encrypted, never sold to third parties, and you have full control over it including the right to access, correct, or delete your information at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const colors = getColorClasses(section.color);
              const isExpanded = expandedSections.has(section.id);

              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="section-card"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-gray-700 transition-all text-left`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`section-icon w-12 h-12 rounded-xl ${colors.iconBg} border ${colors.border} flex items-center justify-center`}>
                          <IconComponent className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{section.title}</h3>
                      </div>
                      <ChevronDown 
                        className={`section-chevron w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-800 space-y-6">
                        {section.content.map((item, idx) => (
                          <div key={idx} className="pl-16">
                            <h4 className={`text-lg font-semibold ${colors.text} mb-2`}>
                              {item.subtitle}
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              {item.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Contact Section */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-4">Questions About Your Privacy?</h3>
            <p className="text-gray-400 mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="mailto:privacy@maula.ai"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-colors"
              >
                privacy@maula.ai
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white font-medium hover:bg-gray-700 transition-colors"
              >
                Contact Support
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
