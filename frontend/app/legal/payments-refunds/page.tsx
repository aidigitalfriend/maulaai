'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, Observer, CustomWiggle, CustomEase, DrawSVGPlugin, MotionPathPlugin, Draggable } from '@/lib/gsap';
import Link from 'next/link';
import { CreditCard, DollarSign, RefreshCcw, Clock, Shield, AlertTriangle, CheckCircle, ArrowLeft, ChevronDown, ChevronRight, Wallet, Ban, Zap, Calendar, XCircle, HelpCircle } from 'lucide-react';

export default function PaymentsRefundsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const pricingTiers = [
    { duration: '1 Day', price: '$1', perDay: '$1/day', color: 'cyan', popular: false },
    { duration: '1 Week', price: '$5', perDay: '$0.71/day', color: 'purple', popular: true },
    { duration: '1 Month', price: '$15', perDay: '$0.50/day', color: 'emerald', popular: false },
  ];

  const sections = [
    {
      id: 'pricing',
      icon: DollarSign,
      title: 'Pricing Structure',
      color: 'emerald',
      content: [
        {
          subtitle: 'Per-Agent Pricing',
          text: 'Each AI agent is priced individually. You pay only for the agents you want to access, with no bundled packages or hidden fees.'
        },
        {
          subtitle: 'Access Durations',
          text: 'Choose from daily ($1), weekly ($5), or monthly ($15) access for any agent. The longer your access period, the more you save per day.'
        },
        {
          subtitle: 'One-Time Purchase',
          text: 'All purchases are one-time. There are no automatic renewals, subscriptions, or recurring charges. You buy access only when you want it.'
        },
        {
          subtitle: 'Multiple Agents',
          text: 'You can purchase access to multiple agents simultaneously. Each agent purchase is independent and tracked separately.'
        }
      ]
    },
    {
      id: 'payment-methods',
      icon: CreditCard,
      title: 'Payment Methods',
      color: 'blue',
      content: [
        {
          subtitle: 'Credit & Debit Cards',
          text: 'We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover through our secure payment processor.'
        },
        {
          subtitle: 'Digital Wallets',
          text: 'Pay conveniently with Apple Pay, Google Pay, or other supported digital wallet services for faster checkout.'
        },
        {
          subtitle: 'Payment Security',
          text: 'All transactions are processed through Stripe, a PCI-DSS Level 1 certified payment processor. We never store your full card details.'
        },
        {
          subtitle: 'Currency',
          text: 'All prices are displayed and charged in USD. Your bank may apply currency conversion fees for non-USD payments.'
        }
      ]
    },
    {
      id: 'access-duration',
      icon: Clock,
      title: 'Access Duration & Expiration',
      color: 'purple',
      content: [
        {
          subtitle: 'Start Time',
          text: 'Your access period begins immediately upon successful payment. You can start using the agent right away.'
        },
        {
          subtitle: 'Expiration',
          text: 'Access expires automatically at the end of your purchased period. You will receive a notification 24 hours before expiration.'
        },
        {
          subtitle: 'No Auto-Renewal',
          text: 'Your access will not automatically renew. To continue using an agent after expiration, you must make a new purchase.'
        },
        {
          subtitle: 'Access History',
          text: 'View your complete purchase and access history in your account dashboard, including current and past agent access periods.'
        }
      ]
    },
    {
      id: 'refund-policy',
      icon: RefreshCcw,
      title: 'Refund Policy',
      color: 'amber',
      content: [
        {
          subtitle: 'General Policy',
          text: 'Due to the instant-access nature of our digital services, all purchases are final and non-refundable once access has been granted.'
        },
        {
          subtitle: 'Technical Issues',
          text: 'If you experience technical issues that prevent you from accessing your purchased agent, contact support within 24 hours for assistance or potential credit.'
        },
        {
          subtitle: 'Duplicate Purchases',
          text: 'If you accidentally make a duplicate purchase for the same agent and period, contact us within 24 hours for a refund of the duplicate charge.'
        },
        {
          subtitle: 'Service Credits',
          text: 'In lieu of refunds, we may offer service credits for future purchases in cases of significant service disruptions or documented issues.'
        }
      ]
    },
    {
      id: 'cancellation',
      icon: XCircle,
      title: 'Cancellation',
      color: 'rose',
      content: [
        {
          subtitle: 'No Cancellation Needed',
          text: 'Since all purchases are one-time with no auto-renewal, there is nothing to cancel. Your access simply expires at the end of your paid period.'
        },
        {
          subtitle: 'Early Termination',
          text: 'If you wish to stop using an agent before your access expires, you may do so at any time. However, no partial refunds are provided for unused time.'
        },
        {
          subtitle: 'Account Deletion',
          text: 'If you delete your account while you have active agent access, your remaining access time will be forfeited without refund.'
        },
        {
          subtitle: 'Violation Termination',
          text: 'If your access is terminated due to Terms of Service violations, no refund will be provided for any remaining access time.'
        }
      ]
    },
    {
      id: 'billing-issues',
      icon: AlertTriangle,
      title: 'Billing Issues & Support',
      color: 'red',
      content: [
        {
          subtitle: 'Failed Payments',
          text: 'If your payment fails, no access will be granted. You can retry the payment or use a different payment method.'
        },
        {
          subtitle: 'Disputed Charges',
          text: 'If you believe you were charged incorrectly, contact our billing support before initiating a chargeback with your bank.'
        },
        {
          subtitle: 'Receipts & Invoices',
          text: 'A receipt is sent to your email after every successful purchase. You can also download receipts from your account dashboard.'
        },
        {
          subtitle: 'Support Contact',
          text: 'For billing questions or issues, email billing@maula.ai or use our in-app support chat. We typically respond within 24 hours.'
        }
      ]
    },
    {
      id: 'promotions',
      icon: Zap,
      title: 'Promotions & Discounts',
      color: 'cyan',
      content: [
        {
          subtitle: 'Promotional Codes',
          text: 'We occasionally offer promotional codes for discounts. Enter codes at checkout. Codes cannot be applied after purchase.'
        },
        {
          subtitle: 'Referral Program',
          text: 'Refer friends to Maula AI and earn credits when they make their first purchase. Check your account for your referral link.'
        },
        {
          subtitle: 'Combining Offers',
          text: 'Unless otherwise stated, promotional offers cannot be combined with other discounts or credits.'
        },
        {
          subtitle: 'Offer Expiration',
          text: 'Promotional offers have expiration dates and usage limits. Check offer terms for specific conditions.'
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
      CustomWiggle.create('paymentWiggle', { wiggles: 5, type: 'uniform' });

      // Hero animations
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSubtitle = new SplitText('.hero-subtitle', { type: 'words' });

      gsap.set(heroTitle.chars, { y: 80, opacity: 0, rotateX: -90 });
      gsap.set(heroSubtitle.words, { y: 25, opacity: 0 });
      gsap.set('.hero-card', { scale: 0, rotate: -15 });
      gsap.set('.hero-badge', { y: 30, opacity: 0 });
      gsap.set('.hero-line', { scaleX: 0 });
      gsap.set('.floating-coin', { y: -60, opacity: 0, scale: 0 });

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      heroTl
        .to('.hero-card', {
          scale: 1,
          rotate: 0,
          duration: 1,
          ease: 'back.out(1.7)'
        })
        .to('.floating-coin', {
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

      // Floating card animation
      gsap.to('.hero-card', {
        y: -12,
        rotate: 5,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.2
      });

      // Floating coins animation
      document.querySelectorAll('.floating-coin').forEach((coin, i) => {
        gsap.to(coin, {
          y: `random(-30, 30)`,
          x: `random(-20, 20)`,
          rotation: `random(-20, 20)`,
          duration: `random(3, 5)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

      // Pricing cards entrance
      gsap.set('.pricing-card', { y: 50, opacity: 0, scale: 0.9 });
      
      ScrollTrigger.create({
        trigger: '.pricing-section',
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.pricing-card', {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'back.out(1.5)'
          });
        }
      });

      // Pricing card hover effects
      document.querySelectorAll('.pricing-card').forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
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
    const colors: Record<string, { bg: string; border: string; text: string; iconBg: string; gradient: string }> = {
      emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20', gradient: 'from-emerald-500 to-teal-500' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', iconBg: 'bg-blue-500/20', gradient: 'from-blue-500 to-cyan-500' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', iconBg: 'bg-purple-500/20', gradient: 'from-purple-500 to-pink-500' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', iconBg: 'bg-amber-500/20', gradient: 'from-amber-500 to-orange-500' },
      rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', iconBg: 'bg-rose-500/20', gradient: 'from-rose-500 to-red-500' },
      red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', iconBg: 'bg-red-500/20', gradient: 'from-red-500 to-rose-500' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', iconBg: 'bg-cyan-500/20', gradient: 'from-cyan-500 to-blue-500' },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb-1 absolute top-20 right-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="gradient-orb-2 absolute bottom-40 left-1/4 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-black to-black" />
        
        {/* Floating coins */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <DollarSign
              key={i}
              className={`floating-coin absolute w-5 h-5 text-emerald-400/30`}
              style={{
                left: `${12 + i * 15}%`,
                top: `${22 + (i % 3) * 20}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            href="/legal" 
            className="inline-flex items-center text-gray-400 hover:text-emerald-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Legal
          </Link>

          {/* Card Icon */}
          <div className="hero-card mb-8 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
            <CreditCard className="w-12 h-12 text-emerald-400" />
          </div>

          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent">
            Payments & Refunds
          </h1>
          
          <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Simple, transparent pricing with no subscriptions. Pay once for the access you need.
          </p>

          <div className="hero-line w-32 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-8 rounded-full" />

          <div className="flex flex-wrap justify-center gap-4">
            <div className="hero-badge px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
              <Ban className="w-4 h-4" />
              No Subscriptions
            </div>
            <div className="hero-badge px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secure Payments
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="pricing-section relative py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Simple Per-Agent Pricing</h2>
          <p className="text-gray-400 text-center mb-12">No hidden fees. No auto-renewals. Pay only for what you need.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.duration}
                className={`pricing-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border ${
                  tier.popular ? 'border-purple-500/50' : 'border-gray-800'
                } overflow-hidden`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-bl-lg">
                    BEST VALUE
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-${tier.color}-500/20 border border-${tier.color}-500/30 flex items-center justify-center mb-4`}>
                  <Calendar className={`w-6 h-6 text-${tier.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{tier.duration}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-400 text-sm">/ agent</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{tier.perDay}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Full agent access
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    No auto-renewal
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Instant access
                  </div>
                </div>
              </div>
            ))}
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
                <h3 className="text-lg font-semibold text-white mb-2">Important: No Refunds Policy</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Due to the instant-access nature of our digital services, all purchases are final and non-refundable. Please review your purchase carefully before completing payment.
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
            <h3 className="text-2xl font-bold text-white mb-4">Billing Questions?</h3>
            <p className="text-gray-400 mb-6">
              If you have any questions about billing, payments, or need assistance with a purchase, our billing team is here to help.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="mailto:billing@maula.ai"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500/30 transition-colors"
              >
                billing@maula.ai
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
