'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import { Sparkles, TrendingUp, BarChart3, Building2, ShoppingCart, Landmark, Factory, ArrowRight, CheckCircle, Quote, Users, Zap } from 'lucide-react';

const caseStudies = [
  {
    title: "Healthcare Provider Reduces Response Time by 85%",
    industry: "Healthcare",
    company: "MedFirst Hospital Network",
    icon: "🏥",
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    challenge: "Overwhelming patient inquiries and appointment scheduling",
    solution: "AI-powered patient support and scheduling assistant",
    results: ["85% faster response time", "60% reduction in call volume", "95% patient satisfaction", "$2M annual savings"],
    category: "Customer Success"
  },
  {
    title: "E-commerce Giant Scales Customer Support 10x",
    industry: "Retail",
    company: "ShopFlow Commerce",
    icon: "🛒",
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    challenge: "Seasonal customer service demands and 24/7 support needs",
    solution: "Multi-language AI agents for customer service and order management",
    results: ["10x support capacity", "24/7 availability", "40% cost reduction", "92% issue resolution"],
    category: "ROI Analysis"
  },
  {
    title: "Financial Services Improves Compliance by 95%",
    industry: "Finance",
    company: "SecureBank Holdings",
    icon: "🏦",
    color: 'emerald',
    gradient: 'from-emerald-500 to-cyan-500',
    challenge: "Complex regulatory compliance and risk assessment",
    solution: "AI compliance monitoring and automated risk analysis",
    results: ["95% compliance improvement", "75% faster risk assessment", "50% audit preparation time", "Zero compliance violations"],
    category: "Implementation Stories"
  },
  {
    title: "Manufacturing Company Optimizes Production by 30%",
    industry: "Manufacturing",
    company: "TechFlow Industries",
    icon: "🏭",
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    challenge: "Production inefficiencies and quality control issues",
    solution: "AI-driven production optimization and quality monitoring",
    results: ["30% production optimization", "25% quality improvement", "20% waste reduction", "$5M cost savings"],
    category: "Before & After"
  }
];

const categories = ["All", "Customer Success", "ROI Analysis", "Implementation Stories", "Before & After"];

export default function CaseStudiesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('caseWiggle', { wiggles: 5, type: 'uniform' });
        gsap.registerPlugin(ScrollTrigger);

        // Floating elements with fromTo
        gsap.fromTo('.floating-icon',
          { y: 30, opacity: 0, scale: 0 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' }
        );

        gsap.fromTo('.gradient-orb',
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' }
        );

        // Filter buttons
        gsap.fromTo('.filter-btn',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power4.out' }
        );

        // ScrollTrigger for case cards
        ScrollTrigger.batch('.case-card', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { y: 60, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // ScrollTrigger for stats
        ScrollTrigger.batch('.stats-item', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // Floating icons continuous animation
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
        gsap.to('.gradient-orb-1', {
          x: 80,
          y: -60,
          duration: 15,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        gsap.to('.gradient-orb-2', {
          x: -70,
          y: 80,
          duration: 18,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        // Card hover effects
        const cards = document.querySelectorAll('.case-card');
        cards.forEach(card => {
          const glow = card.querySelector('.card-glow');
          
          card.addEventListener('mouseenter', () => {
            gsap.to(card, { scale: 1.02, y: -8, duration: 0.3, ease: 'back.out(2)' });
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
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-purple-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-24 left-[10%]">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/20">
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-40 right-[12%]">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/20">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-48 left-[12%]">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Success Stories</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Case Studies
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Discover how organizations across industries are transforming their operations with
              <span className="text-purple-400"> our AI agents.</span>
            </p>
          </div>
        </section>

        {/* Filter Categories */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`filter-btn px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  index === 0
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Case Studies Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            {caseStudies.map((study, index) => (
              <div key={index} className="case-card group relative">
                <div className={`card-glow absolute inset-0 bg-gradient-to-r ${study.gradient} rounded-2xl opacity-0 blur-xl transition-opacity`} />
                
                <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 overflow-hidden">
                  {/* Corner accents */}
                  <div className={`absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-${study.color}-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className={`absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-${study.color}-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-xl bg-${study.color}-500/20 border border-${study.color}-500/30 flex items-center justify-center text-3xl`}>
                      {study.icon}
                    </div>
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full bg-${study.color}-500/10 text-${study.color}-400 border border-${study.color}-500/20`}>
                      {study.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                    {study.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                    <span className="font-medium text-gray-400">{study.industry}</span>
                    <span>•</span>
                    <span>{study.company}</span>
                  </div>

                  {/* Challenge & Solution */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Challenge</div>
                      <p className="text-gray-400 text-sm">{study.challenge}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Solution</div>
                      <p className="text-gray-400 text-sm">{study.solution}</p>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="p-4 rounded-xl bg-black/30 border border-gray-800">
                    <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">Key Results</div>
                    <div className="grid grid-cols-2 gap-3">
                      {study.results.map((result, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Read More */}
                  <div className="mt-6 flex items-center text-cyan-400 text-sm font-medium group-hover:gap-2 gap-1 transition-all cursor-pointer">
                    Read Full Story
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950 border border-gray-800">
              <h3 className="text-2xl font-bold text-white text-center mb-8">
                Trusted by Industry Leaders
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { value: '500+', label: 'Clients Served', icon: Users },
                  { value: '85%', label: 'Avg. Efficiency Gain', icon: TrendingUp },
                  { value: '$50M+', label: 'Client Savings', icon: BarChart3 },
                  { value: '99%', label: 'Satisfaction Rate', icon: Sparkles },
                ].map((stat, i) => (
                  <div key={i} className="stats-item text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                      <stat.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-gray-500 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 text-center overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
              
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-500/40 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-lg" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Write Your Success Story?
                </h2>
                <p className="text-gray-400 mb-8">
                  Join hundreds of organizations transforming their operations with AI.
                </p>
                <Link
                  href="/agents"
                  className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105"
                >
                  Get Started Today
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
