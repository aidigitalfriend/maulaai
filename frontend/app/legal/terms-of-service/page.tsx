'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, Observer, CustomWiggle, CustomEase, DrawSVGPlugin, MotionPathPlugin, Draggable } from '@/lib/gsap';
import Link from 'next/link';
import { FileText, Gavel, AlertTriangle, Users, Ban, CheckCircle, Scale, ArrowLeft, ChevronDown, ChevronRight, Shield, Clock, XCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const sections = [
    {
      id: 'acceptance',
      icon: CheckCircle,
      title: 'Acceptance of Terms',
      color: 'purple',
      content: [
        {
          subtitle: 'Agreement to Terms',
          text: 'By accessing or using Maula AI services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.'
        },
        {
          subtitle: 'Eligibility',
          text: 'You must be at least 18 years old to use our services. By using Maula AI, you represent that you meet this age requirement and have the legal capacity to enter into a binding agreement.'
        },
        {
          subtitle: 'Modifications',
          text: 'We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use after changes constitutes acceptance.'
        },
        {
          subtitle: 'Additional Terms',
          text: 'Certain features may be subject to additional terms or guidelines. Such additional terms are incorporated by reference into these Terms of Service.'
        }
      ]
    },
    {
      id: 'services',
      icon: Scale,
      title: 'Service Description',
      color: 'cyan',
      content: [
        {
          subtitle: 'AI Agent Platform',
          text: 'Maula AI provides access to various AI agents for different purposes including productivity, creativity, analysis, and more. Each agent has specific capabilities and limitations.'
        },
        {
          subtitle: 'Access Model',
          text: 'Our services operate on a pay-per-use model with daily, weekly, and monthly access options. Access is granted per agent and does not automatically renew.'
        },
        {
          subtitle: 'Service Availability',
          text: 'We strive for high availability but do not guarantee uninterrupted service. Scheduled maintenance and updates may temporarily affect access.'
        },
        {
          subtitle: 'Feature Changes',
          text: 'We continuously improve our platform and may add, modify, or remove features. We will provide reasonable notice for significant changes affecting user experience.'
        }
      ]
    },
    {
      id: 'user-accounts',
      icon: Users,
      title: 'User Accounts & Responsibilities',
      color: 'emerald',
      content: [
        {
          subtitle: 'Account Creation',
          text: 'You must provide accurate, complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials.'
        },
        {
          subtitle: 'Account Security',
          text: 'You are responsible for all activities under your account. Notify us immediately if you suspect unauthorized access or security breaches.'
        },
        {
          subtitle: 'Acceptable Use',
          text: 'You agree to use our services only for lawful purposes and in accordance with these terms. You must not misuse our AI agents or attempt to circumvent restrictions.'
        },
        {
          subtitle: 'Content Responsibility',
          text: 'You are solely responsible for content you generate using our AI agents. We do not claim ownership of your outputs but require responsible use.'
        }
      ]
    },
    {
      id: 'prohibited',
      icon: Ban,
      title: 'Prohibited Activities',
      color: 'red',
      content: [
        {
          subtitle: 'Harmful Content',
          text: 'Using AI agents to generate content that is illegal, harmful, threatening, abusive, defamatory, obscene, or otherwise objectionable is strictly prohibited.'
        },
        {
          subtitle: 'System Abuse',
          text: 'Attempting to hack, reverse engineer, or interfere with our systems, or using automated tools to access services beyond normal usage, is prohibited.'
        },
        {
          subtitle: 'Fraudulent Activities',
          text: 'Using our services for fraud, phishing, impersonation, or any deceptive practices that could harm others is strictly forbidden.'
        },
        {
          subtitle: 'Intellectual Property Violations',
          text: 'Using our AI agents to infringe upon copyrights, trademarks, or other intellectual property rights of third parties is prohibited.'
        }
      ]
    },
    {
      id: 'intellectual-property',
      icon: FileText,
      title: 'Intellectual Property',
      color: 'amber',
      content: [
        {
          subtitle: 'Platform Ownership',
          text: 'Maula AI, including all software, content, features, and trademarks, is owned by us or our licensors and protected by intellectual property laws.'
        },
        {
          subtitle: 'User Content',
          text: 'You retain ownership of content you create using our AI agents. However, you grant us a license to use this content for service improvement and analytics.'
        },
        {
          subtitle: 'AI-Generated Content',
          text: 'Content generated by our AI agents may be subject to limitations on commercial use. Check specific agent terms for detailed licensing information.'
        },
        {
          subtitle: 'Feedback',
          text: 'Any feedback, suggestions, or ideas you provide about our services become our property and may be used without compensation or attribution.'
        }
      ]
    },
    {
      id: 'liability',
      icon: Shield,
      title: 'Limitation of Liability',
      color: 'blue',
      content: [
        {
          subtitle: 'Disclaimer of Warranties',
          text: 'Our services are provided "as is" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, or non-infringement.'
        },
        {
          subtitle: 'Limitation of Damages',
          text: 'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.'
        },
        {
          subtitle: 'Maximum Liability',
          text: 'Our total liability for any claims arising from these terms shall not exceed the amount you paid to us in the twelve months preceding the claim.'
        },
        {
          subtitle: 'AI Output Disclaimer',
          text: 'AI-generated content may contain errors, biases, or inaccuracies. You are responsible for reviewing and validating any outputs before use.'
        }
      ]
    },
    {
      id: 'termination',
      icon: XCircle,
      title: 'Termination',
      color: 'rose',
      content: [
        {
          subtitle: 'Your Right to Terminate',
          text: 'You may terminate your account at any time through your account settings or by contacting support. Access will end immediately upon termination.'
        },
        {
          subtitle: 'Our Right to Terminate',
          text: 'We may suspend or terminate your access immediately if you violate these terms, engage in prohibited activities, or for any other reason at our discretion.'
        },
        {
          subtitle: 'Effect of Termination',
          text: 'Upon termination, your right to use our services ends immediately. Certain provisions of these terms survive termination, including liability limitations and dispute resolution.'
        },
        {
          subtitle: 'Data Retention',
          text: 'After termination, we may retain certain data as required by law or for legitimate business purposes, subject to our Privacy Policy.'
        }
      ]
    },
    {
      id: 'disputes',
      icon: Gavel,
      title: 'Dispute Resolution',
      color: 'indigo',
      content: [
        {
          subtitle: 'Governing Law',
          text: 'These terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.'
        },
        {
          subtitle: 'Informal Resolution',
          text: 'Before filing any legal claim, you agree to attempt to resolve disputes informally by contacting us at legal@maula.ai.'
        },
        {
          subtitle: 'Arbitration',
          text: 'Any disputes not resolved informally shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.'
        },
        {
          subtitle: 'Class Action Waiver',
          text: 'You agree to resolve disputes on an individual basis and waive any right to participate in class action lawsuits or class-wide arbitration.'
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
      CustomWiggle.create('termsWiggle', { wiggles: 5, type: 'uniform' });

      // Hero animations
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSubtitle = new SplitText('.hero-subtitle', { type: 'words' });

      gsap.set(heroTitle.chars, { y: 80, opacity: 0, rotateX: -90 });
      gsap.set(heroSubtitle.words, { y: 25, opacity: 0 });
      gsap.set('.hero-gavel', { scale: 0, rotate: -180, y: -50 });
      gsap.set('.hero-badge', { y: 30, opacity: 0 });
      gsap.set('.hero-line', { scaleX: 0 });
      gsap.set('.floating-scale', { y: -50, opacity: 0, scale: 0.5 });

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      heroTl
        .to('.hero-gavel', {
          scale: 1,
          rotate: 0,
          y: 0,
          duration: 1,
          ease: 'back.out(1.7)'
        })
        .to('.floating-scale', {
          y: 0,
          opacity: 1,
          scale: 1,
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

      // Floating gavel animation with bounce
      gsap.to('.hero-gavel', {
        y: -15,
        rotate: 8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.2
      });

      // Floating scales animation
      document.querySelectorAll('.floating-scale').forEach((scale, i) => {
        gsap.to(scale, {
          y: `random(-25, 25)`,
          x: `random(-20, 20)`,
          rotation: `random(-15, 15)`,
          duration: `random(3, 5)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

      // Section cards entrance with ScrollTrigger
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

      // Gradient orbs
      gsap.to('.gradient-orb-1', {
        x: 70,
        y: -40,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-2', {
        x: -60,
        y: 50,
        duration: 11,
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
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', iconBg: 'bg-cyan-500/20' },
      emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
      red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', iconBg: 'bg-red-500/20' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', iconBg: 'bg-amber-500/20' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', iconBg: 'bg-blue-500/20' },
      rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', iconBg: 'bg-rose-500/20' },
      indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', iconBg: 'bg-indigo-500/20' },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb-1 absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-3xl" />
        <div className="gradient-orb-2 absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        
        {/* Floating scales */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <Scale
              key={i}
              className={`floating-scale absolute w-6 h-6 text-purple-400/30`}
              style={{
                left: `${15 + i * 18}%`,
                top: `${25 + (i % 3) * 20}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            href="/legal" 
            className="inline-flex items-center text-gray-400 hover:text-purple-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Legal
          </Link>

          {/* Gavel Icon */}
          <div className="hero-gavel mb-8 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <FileText className="w-12 h-12 text-purple-400" />
          </div>

          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          
          <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            These terms govern your use of the Maula AI platform. Please read them carefully before using our services.
          </p>

          <div className="hero-line w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-8 rounded-full" />

          <div className="flex flex-wrap justify-center gap-4">
            <div className="hero-badge px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm">
              Effective: January 15, 2026
            </div>
            <div className="hero-badge px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              ~10 min read
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Important Notice */}
          <div className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Important Notice</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  By using Maula AI, you agree to these Terms of Service. These terms include a mandatory arbitration clause and class action waiver. Please review the Dispute Resolution section carefully.
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
            <h3 className="text-2xl font-bold text-white mb-4">Questions About These Terms?</h3>
            <p className="text-gray-400 mb-6">
              If you have any questions about these Terms of Service, please contact our legal team.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="mailto:legal@maula.ai"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 font-medium hover:bg-purple-500/30 transition-colors"
              >
                legal@maula.ai
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
