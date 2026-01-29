'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import { Sparkles, BookOpen, Newspaper, Video, FileText, GraduationCap, Briefcase, ArrowRight, Zap, Users, ChevronRight, Mail, Send } from 'lucide-react';

const resourceCategories = [
  {
    title: "Blog",
    description: "89+ articles on AI history, technology trends, and expert insights.",
    icon: BookOpen,
    href: "/resources/blog",
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    items: ["AI History & Evolution", "Technology Deep Dives", "Expert Opinions", "Industry Analysis"]
  },
  {
    title: "Case Studies",
    description: "Explore real-world success stories and implementations from our clients.",
    icon: FileText,
    href: "/resources/case-studies",
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    items: ["Customer Success", "ROI Analysis", "Implementation Stories", "Before & After"]
  },
  {
    title: "News",
    description: "Latest news, product updates, and announcements from Maula AI.",
    icon: Newspaper,
    href: "/resources/news",
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    items: ["Product Updates", "Company Announcements", "Industry News", "Feature Releases"]
  },
  {
    title: "Webinars",
    description: "Join live sessions and access recorded presentations from industry experts.",
    icon: Video,
    href: "/resources/webinars",
    color: 'emerald',
    gradient: 'from-emerald-500 to-cyan-500',
    items: ["Live Sessions", "Recorded Content", "Expert Panels", "Q&A Sessions"]
  },
  {
    title: "Documentation",
    description: "Comprehensive guides and technical documentation for our platform.",
    icon: FileText,
    href: "/resources/documentation",
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
    items: ["API Reference", "Integration Guides", "Best Practices", "Troubleshooting"]
  },
  {
    title: "Tutorials",
    description: "Step-by-step guides to help you get the most out of our AI agents.",
    icon: GraduationCap,
    href: "/resources/tutorials",
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    items: ["Getting Started", "Advanced Features", "Video Guides", "Interactive Demos"]
  },
  {
    title: "Careers",
    description: "Join our team and help shape the future of AI.",
    icon: Briefcase,
    href: "/resources/careers",
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    items: ["Open Positions", "Company Culture", "Benefits", "Growth Opportunities"]
  }
];

export default function ResourcesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('resourceWiggle', { wiggles: 5, type: 'uniform' });
        gsap.registerPlugin(ScrollTrigger);

        // Floating icons and orbs
        gsap.fromTo('.floating-icon',
          { y: 30, opacity: 0, scale: 0 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' }
        );

        gsap.fromTo('.gradient-orb',
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' }
        );

        // ScrollTrigger for resource cards
        ScrollTrigger.batch('.resource-card', {
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { y: 60, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' }
            );
          },
          start: 'top 90%',
          once: true
        });

        // ScrollTrigger for CTA
        ScrollTrigger.create({
          trigger: '.cta-section',
          start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.fromTo('.cta-section',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
          );
        }
      });

      // Floating icons animation
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
      const cards = document.querySelectorAll('.resource-card');
      cards.forEach(card => {
        const glow = card.querySelector('.card-glow');
        const icon = card.querySelector('.card-icon');
        
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { scale: 1.02, y: -8, duration: 0.3, ease: 'back.out(2)' });
          if (glow) gsap.to(glow, { opacity: 1, duration: 0.3 });
          if (icon) gsap.to(icon, { scale: 1.1, rotation: 5, duration: 0.3, ease: 'back.out(2)' });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' });
          if (glow) gsap.to(glow, { opacity: 0, duration: 0.3 });
          if (icon) gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' });
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
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-24 left-[10%]">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/20">
            <BookOpen className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-40 right-[12%]">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-48 left-[12%]">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 backdrop-blur-sm flex items-center justify-center border border-amber-500/20">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-32 right-[8%]">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-8">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Knowledge Hub</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Resources & Learning
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Discover insights, learn best practices, and stay ahead with our
              <span className="text-cyan-400"> comprehensive resource library.</span>
            </p>
          </div>
        </section>

        {/* Resource Cards */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resourceCategories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="resource-card group relative block"
              >
                <div className={`card-glow absolute inset-0 bg-gradient-to-r ${category.gradient} rounded-2xl opacity-0 blur-xl transition-opacity`} />
                
                <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden">
                  {/* Corner accents */}
                  <div className={`absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-${category.color}-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className={`absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-${category.color}-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className={`card-icon w-14 h-14 rounded-xl bg-${category.color}-500/20 border border-${category.color}-500/30 flex items-center justify-center mb-4`}>
                    <category.icon className={`w-7 h-7 text-${category.color}-400`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {category.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <ul className="space-y-2 mb-4">
                    {category.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${category.color}-400`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center text-cyan-400 text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                    Explore
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="cta-section relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
              
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500/40 rounded-bl-lg" />
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-cyan-400" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Stay Updated
                </h2>
                
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  Subscribe to our newsletter for the latest resources, insights, and updates delivered to your inbox.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
