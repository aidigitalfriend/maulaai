'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import { Newspaper, Zap, TrendingUp, Award, Calendar, ArrowRight, MessageSquare, X, Clock, ChevronRight, Sparkles, Bell } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All News', icon: Newspaper, color: 'cyan' },
  { id: 'product', label: 'Product Updates', icon: Zap, color: 'emerald' },
  { id: 'industry', label: 'Industry News', icon: TrendingUp, color: 'purple' },
  { id: 'awards', label: 'Awards', icon: Award, color: 'amber' }
];

const newsArticles = [
  {
    id: 1,
    title: 'Maula AI Launches New $1/Day Testing Plan',
    description: 'We\'re excited to announce our affordable new testing plan, allowing users to evaluate all features for just $1 per day.',
    category: 'product',
    date: 'October 22, 2025',
    image: '🚀',
    readTime: '3 min read',
    featured: true,
    color: 'emerald'
  },
  {
    id: 2,
    title: 'AI Adoption Reaches All-Time High in Enterprise',
    description: 'A new industry report shows that 78% of enterprises have adopted some form of AI technology.',
    category: 'industry',
    date: 'October 20, 2025',
    image: '📈',
    readTime: '5 min read',
    featured: true,
    color: 'purple'
  },
  {
    id: 3,
    title: 'Maula AI Recognized as Top AI Platform',
    description: 'We\'re thrilled to announce that Maula AI has been recognized by TechCrunch as one of the top 10 emerging AI platforms.',
    category: 'awards',
    date: 'October 18, 2025',
    image: '🏆',
    readTime: '2 min read',
    featured: true,
    color: 'amber'
  },
  {
    id: 4,
    title: 'New Voice Integration Features Now Available',
    description: 'We\'ve rolled out enhanced voice capabilities for all agents, enabling more natural conversations.',
    category: 'product',
    date: 'October 15, 2025',
    image: '🎙️',
    readTime: '4 min read',
    featured: false,
    color: 'cyan'
  },
  {
    id: 5,
    title: 'The Future of Conversational AI in 2026',
    description: 'Industry experts weigh in on what to expect from conversational AI technology in the coming year.',
    category: 'industry',
    date: 'October 12, 2025',
    image: '🔮',
    readTime: '6 min read',
    featured: false,
    color: 'purple'
  },
  {
    id: 6,
    title: 'Canvas Feature: AI-Powered Code Generation',
    description: 'Introducing Canvas - our new AI-powered workspace for code and content generation.',
    category: 'product',
    date: 'October 10, 2025',
    image: '🎨',
    readTime: '4 min read',
    featured: false,
    color: 'emerald'
  }
];

export default function NewsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredArticles = selectedCategory === 'all' 
    ? newsArticles 
    : newsArticles.filter(a => a.category === selectedCategory);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('newsWiggle', { wiggles: 5, type: 'uniform' });
        gsap.registerPlugin(ScrollTrigger);

        gsap.fromTo('.floating-icon', { y: 30, opacity: 0, scale: 0 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' });
        gsap.fromTo('.gradient-orb', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' });

        ScrollTrigger.batch('.news-card', {
          onEnter: (elements) => gsap.fromTo(elements, { y: 60, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' }),
          start: 'top 90%',
          once: true
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
        const cards = document.querySelectorAll('.news-card');
        cards.forEach(card => {
          const glow = card.querySelector('.card-glow');
          
          card.addEventListener('mouseenter', () => {
            gsap.to(card, { scale: 1.02, y: -5, duration: 0.3, ease: 'back.out(2)' });
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
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-amber-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-24 left-[10%]">
          <div className="relative w-12 h-12 rounded-xl bg-amber-500/10 backdrop-blur-sm flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-amber-500/50 rounded-tr" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-amber-500/50 rounded-bl" />
            <Newspaper className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-40 right-[12%]">
          <div className="relative w-10 h-10 rounded-lg bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan-500/50 rounded-tr" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-cyan-500/50 rounded-bl" />
            <Bell className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-48 left-[12%]">
          <div className="relative w-11 h-11 rounded-xl bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/10">
            <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-purple-500/50 rounded-tr" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-purple-500/50 rounded-bl" />
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8">
              <Newspaper className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Latest Updates</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              News & Updates
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Stay informed with the latest product updates, industry news, and
              <span className="text-amber-400"> company announcements.</span>
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`category-btn flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-white'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Articles */}
        <section className="py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">Featured</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {filteredArticles.filter(a => a.featured).map((article) => (
                <div key={article.id} className="news-card group relative">
                  <div className={`card-glow absolute inset-0 bg-${article.color}-500/20 rounded-2xl opacity-0 blur-xl transition-opacity`} />
                  
                  <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 overflow-hidden">
                    <div className={`absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-${article.color}-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className={`absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-${article.color}-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{article.image}</div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-${article.color}-500/10 text-${article.color}-400 border border-${article.color}-500/20`}>
                        Featured
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Articles */}
        <section className="py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">All Articles</h2>
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div key={article.id} className="news-card group relative">
                  <div className="card-glow absolute inset-0 bg-cyan-500/10 rounded-xl opacity-0 blur-xl transition-opacity" />
                  
                  <div className="relative p-5 rounded-xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 flex items-center gap-5 overflow-hidden">
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="text-3xl flex-shrink-0">{article.image}</div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors truncate">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">
                        {article.description}
                      </p>
                    </div>
                    
                    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime}
                      </div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-amber-500/10 via-gray-900 to-orange-500/10 border border-gray-800 text-center overflow-hidden group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-500/40 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-orange-500/40 rounded-bl-lg" />
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-500/20 rounded-tl-lg" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-orange-500/20 rounded-br-lg" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/25">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Never Miss an Update
                </h2>
                
                <p className="text-gray-400 mb-8">
                  Subscribe to our newsletter and stay ahead with the latest news and announcements.
                </p>
                
                <Link
                  href="/subscribe"
                  className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/25 transition-all hover:scale-105"
                >
                  Subscribe Now
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
