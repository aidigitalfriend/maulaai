'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, Observer, CustomWiggle, CustomEase, DrawSVGPlugin, MotionPathPlugin, Draggable } from '@/lib/gsap';
import Link from 'next/link';
import { Cookie, Settings, Shield, Eye, ToggleLeft, ToggleRight, ArrowLeft, ChevronDown, ChevronRight, CheckCircle, AlertCircle, Fingerprint, BarChart3, Target, Cog } from 'lucide-react';

export default function CookiePolicyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: true,
    functional: true,
    marketing: false
  });

  const sections = [
    {
      id: 'what-are-cookies',
      icon: Cookie,
      title: 'What Are Cookies?',
      color: 'amber',
      content: [
        {
          subtitle: 'Definition',
          text: 'Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences and improve your browsing experience.'
        },
        {
          subtitle: 'How They Work',
          text: 'When you visit our site, we send cookies to your browser, which stores them. On subsequent visits, these cookies are sent back to us, allowing us to recognize you and customize your experience.'
        },
        {
          subtitle: 'Session vs Persistent',
          text: 'Session cookies are temporary and deleted when you close your browser. Persistent cookies remain on your device for a set period or until you delete them.'
        },
        {
          subtitle: 'First-Party vs Third-Party',
          text: 'First-party cookies are set by us directly. Third-party cookies are set by external services we use, such as analytics providers.'
        }
      ]
    },
    {
      id: 'essential-cookies',
      icon: Shield,
      title: 'Essential Cookies',
      color: 'cyan',
      content: [
        {
          subtitle: 'Authentication',
          text: 'Essential for keeping you logged in and maintaining your session security across our platform. Without these, you would need to log in on every page.'
        },
        {
          subtitle: 'Security',
          text: 'Help protect against cross-site request forgery (CSRF) attacks and other security threats. These cookies are crucial for platform safety.'
        },
        {
          subtitle: 'Load Balancing',
          text: 'Ensure our servers distribute traffic efficiently, providing you with fast and reliable service access.'
        },
        {
          subtitle: 'Cookie Consent',
          text: 'Remember your cookie preferences so we do not ask you repeatedly. Essential for respecting your choices.'
        }
      ]
    },
    {
      id: 'analytics-cookies',
      icon: BarChart3,
      title: 'Analytics Cookies',
      color: 'purple',
      content: [
        {
          subtitle: 'Usage Statistics',
          text: 'Help us understand how visitors interact with our platform by collecting and reporting information anonymously.'
        },
        {
          subtitle: 'Performance Monitoring',
          text: 'Track page load times, error rates, and other performance metrics to help us optimize your experience.'
        },
        {
          subtitle: 'Feature Usage',
          text: 'Understand which features are most popular and how users navigate through our AI agent platform.'
        },
        {
          subtitle: 'A/B Testing',
          text: 'Allow us to test different versions of features to determine which provides the best user experience.'
        }
      ]
    },
    {
      id: 'functional-cookies',
      icon: Cog,
      title: 'Functional Cookies',
      color: 'emerald',
      content: [
        {
          subtitle: 'Preferences',
          text: 'Remember your settings such as language, theme (dark/light mode), and other customization options.'
        },
        {
          subtitle: 'Personalization',
          text: 'Enable personalized features and recommendations based on your previous interactions with our AI agents.'
        },
        {
          subtitle: 'Chat History',
          text: 'Allow continuity in your AI conversations by remembering context from previous sessions.'
        },
        {
          subtitle: 'Recent Activity',
          text: 'Track your recently used agents and features for quick access and improved navigation.'
        }
      ]
    },
    {
      id: 'marketing-cookies',
      icon: Target,
      title: 'Marketing Cookies',
      color: 'rose',
      content: [
        {
          subtitle: 'Advertising',
          text: 'Used to deliver advertisements more relevant to you and your interests. These are only enabled with your explicit consent.'
        },
        {
          subtitle: 'Campaign Tracking',
          text: 'Help us measure the effectiveness of our marketing campaigns and understand how you found our platform.'
        },
        {
          subtitle: 'Social Media',
          text: 'Enable social media features and may track your browsing across sites. You can opt out at any time.'
        },
        {
          subtitle: 'Retargeting',
          text: 'Allow us to show you relevant ads on other websites. We respect Do Not Track signals and provide easy opt-out options.'
        }
      ]
    },
    {
      id: 'manage-cookies',
      icon: Settings,
      title: 'Managing Your Cookies',
      color: 'blue',
      content: [
        {
          subtitle: 'Browser Settings',
          text: 'Most browsers allow you to control cookies through their settings. You can block or delete cookies, though this may affect site functionality.'
        },
        {
          subtitle: 'Our Cookie Banner',
          text: 'Use our cookie consent banner or the preferences panel below to customize which cookies we can use.'
        },
        {
          subtitle: 'Opt-Out Links',
          text: 'For third-party cookies, you can often opt out directly through the provider\'s website or through industry opt-out tools like the NAI or DAA.'
        },
        {
          subtitle: 'Do Not Track',
          text: 'We honor Do Not Track (DNT) browser signals. When enabled, we will limit tracking to essential cookies only.'
        }
      ]
    },
    {
      id: 'legal-basis',
      icon: Fingerprint,
      title: 'Legal Basis & Compliance',
      color: 'indigo',
      content: [
        {
          subtitle: 'GDPR Compliance',
          text: 'For EU users, we obtain explicit consent before setting non-essential cookies, in compliance with the General Data Protection Regulation.'
        },
        {
          subtitle: 'ePrivacy Directive',
          text: 'We comply with the ePrivacy Directive (Cookie Law) requirements for informed consent and clear information about cookie usage.'
        },
        {
          subtitle: 'CCPA Rights',
          text: 'California residents can opt out of the "sale" of personal information through cookies using our cookie preferences or the Do Not Sell My Info link.'
        },
        {
          subtitle: 'Data Retention',
          text: 'Cookie data is retained only as long as necessary for its purpose. Analytics data is typically aggregated and anonymized after 26 months.'
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

  const toggleCookiePreference = (key: keyof typeof cookiePreferences) => {
    if (key === 'essential') return; // Cannot disable essential
    setCookiePreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Register custom wiggle
      CustomWiggle.create('cookieWiggle', { wiggles: 6, type: 'uniform' });

      // Hero animations
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSubtitle = new SplitText('.hero-subtitle', { type: 'words' });

      gsap.set(heroTitle.chars, { y: 80, opacity: 0, rotateX: -90 });
      gsap.set(heroSubtitle.words, { y: 25, opacity: 0 });
      gsap.set('.hero-cookie', { scale: 0, rotate: -180 });
      gsap.set('.hero-badge', { y: 30, opacity: 0 });
      gsap.set('.hero-line', { scaleX: 0 });
      gsap.set('.floating-cookie', { y: -50, opacity: 0, scale: 0 });

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      heroTl
        .to('.hero-cookie', {
          scale: 1,
          rotate: 0,
          duration: 1,
          ease: 'back.out(1.7)'
        })
        .to('.floating-cookie', {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.08
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

      // Floating cookie animation with wobble
      gsap.to('.hero-cookie', {
        y: -12,
        rotate: 8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.2
      });

      // Floating mini cookies
      document.querySelectorAll('.floating-cookie').forEach((cookie, i) => {
        gsap.to(cookie, {
          y: `random(-30, 30)`,
          x: `random(-25, 25)`,
          rotation: `random(-20, 20)`,
          duration: `random(3, 5)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
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

      // Cookie preference toggles animation
      gsap.set('.cookie-toggle', { x: -20, opacity: 0 });
      
      ScrollTrigger.create({
        trigger: '.preferences-section',
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.cookie-toggle', {
            x: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'back.out(1.5)'
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
            rotate: 15,
            duration: 0.4,
            ease: 'cookieWiggle'
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
        x: 60,
        y: -40,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-2', {
        x: -50,
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
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', iconBg: 'bg-amber-500/20' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', iconBg: 'bg-cyan-500/20' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
      emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
      rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', iconBg: 'bg-rose-500/20' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', iconBg: 'bg-blue-500/20' },
      indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', iconBg: 'bg-indigo-500/20' },
    };
    return colors[color] || colors.amber;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb-1 absolute top-20 left-1/4 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-3xl" />
        <div className="gradient-orb-2 absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-orange-500/8 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-black to-black" />
        
        {/* Floating cookies */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <Cookie
              key={i}
              className={`floating-cookie absolute w-5 h-5 text-amber-400/30`}
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 4) * 18}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            href="/legal" 
            className="inline-flex items-center text-gray-400 hover:text-amber-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Legal
          </Link>

          {/* Cookie Icon */}
          <div className="hero-cookie mb-8 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Cookie className="w-12 h-12 text-amber-400" />
          </div>

          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          
          <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Learn about the cookies and tracking technologies we use and how you can control them.
          </p>

          <div className="hero-line w-32 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto mb-8 rounded-full" />

          <div className="flex flex-wrap justify-center gap-4">
            <div className="hero-badge px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
              Effective: January 15, 2026
            </div>
            <div className="hero-badge px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm">
              ePrivacy Compliant
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Preferences Section */}
      <section className="preferences-section relative py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Settings className="w-6 h-6 text-amber-400" />
              Cookie Preferences
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'essential', label: 'Essential Cookies', desc: 'Required for basic site functionality', locked: true, color: 'cyan' },
                { key: 'analytics', label: 'Analytics Cookies', desc: 'Help us improve our service', locked: false, color: 'purple' },
                { key: 'functional', label: 'Functional Cookies', desc: 'Remember your preferences', locked: false, color: 'emerald' },
                { key: 'marketing', label: 'Marketing Cookies', desc: 'Personalized advertisements', locked: false, color: 'rose' }
              ].map((item) => (
                <div
                  key={item.key}
                  className="cookie-toggle flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/20 border border-${item.color}-500/30 flex items-center justify-center`}>
                      {item.key === 'essential' && <Shield className={`w-5 h-5 text-${item.color}-400`} />}
                      {item.key === 'analytics' && <BarChart3 className={`w-5 h-5 text-${item.color}-400`} />}
                      {item.key === 'functional' && <Cog className={`w-5 h-5 text-${item.color}-400`} />}
                      {item.key === 'marketing' && <Target className={`w-5 h-5 text-${item.color}-400`} />}
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCookiePreference(item.key as keyof typeof cookiePreferences)}
                    disabled={item.locked}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      cookiePreferences[item.key as keyof typeof cookiePreferences]
                        ? 'bg-amber-500'
                        : 'bg-gray-600'
                    } ${item.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        cookiePreferences[item.key as keyof typeof cookiePreferences]
                          ? 'translate-x-7'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all">
              Save Preferences
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
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
            <h3 className="text-2xl font-bold text-white mb-4">Questions About Cookies?</h3>
            <p className="text-gray-400 mb-6">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="mailto:privacy@maula.ai"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-medium hover:bg-amber-500/30 transition-colors"
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
