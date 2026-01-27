'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Newspaper, Calendar, ArrowRight, Sparkles, Tag, TrendingUp, Users } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function NewsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Product Updates', 'Company News', 'Partnerships', 'Industry Insights'];

  const newsItems = [
    {
      title: 'Introducing AI Agent Memory 2.0',
      excerpt: 'Our latest update brings revolutionary long-term memory capabilities to all AI agents, enabling more personalized and context-aware conversations.',
      date: 'January 28, 2026',
      category: 'Product Updates',
      image: '🧠',
      color: '#00d4ff',
      featured: true
    },
    {
      title: 'One Last AI Raises $50M Series B',
      excerpt: 'We are thrilled to announce our Series B funding round led by top-tier investors to accelerate AI agent development.',
      date: 'January 20, 2026',
      category: 'Company News',
      image: '🚀',
      color: '#a855f7',
      featured: true
    },
    {
      title: 'Strategic Partnership with Enterprise Cloud',
      excerpt: 'New partnership brings seamless cloud integration and enhanced scalability for enterprise customers.',
      date: 'January 15, 2026',
      category: 'Partnerships',
      image: '🤝',
      color: '#00ff88',
      featured: false
    },
    {
      title: 'The Future of AI Agents in Customer Service',
      excerpt: 'Industry analysis on how AI agents are transforming customer service across sectors.',
      date: 'January 10, 2026',
      category: 'Industry Insights',
      image: '📊',
      color: '#f59e0b',
      featured: false
    },
    {
      title: 'New Voice Capabilities Now Available',
      excerpt: 'All agents now support natural voice interactions with multiple language options.',
      date: 'January 5, 2026',
      category: 'Product Updates',
      image: '🎙️',
      color: '#ec4899',
      featured: false
    },
    {
      title: 'One Last AI Expands to APAC Region',
      excerpt: 'Opening new offices in Singapore and Tokyo to better serve our growing Asia-Pacific customer base.',
      date: 'December 28, 2025',
      category: 'Company News',
      image: '🌏',
      color: '#6366f1',
      featured: false
    }
  ];

  const filteredNews = newsItems.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const featuredNews = filteredNews.filter(item => item.featured);
  const regularNews = filteredNews.filter(item => !item.featured);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.category-btn',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.categories', start: 'top 90%' } }
    );

    gsap.fromTo('.featured-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.featured-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.news-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.news-grid', start: 'top 85%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,255,136,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/resources" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00ff88] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Newspaper className="w-4 h-4 text-[#00ff88]" />
              <span className="text-gray-300">Latest Updates</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">News & Updates</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Stay informed about product updates, company news, and industry insights
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="categories flex flex-wrap gap-3 justify-center">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`category-btn px-5 py-2 rounded-full text-sm font-medium transition-all opacity-0 ${
                  selectedCategory === cat
                    ? 'bg-[#00ff88] text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featuredNews.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold metallic-text mb-8">Featured Stories</h2>
            <div className="featured-grid grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredNews.map((item, i) => (
                <div key={i} className="featured-card glass-card rounded-2xl p-8 opacity-0 group hover:scale-[1.01] transition-transform cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{item.image}</div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: `${item.color}20`, color: item.color }}>
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00ff88] transition-colors">{item.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{item.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {item.date}
                    </span>
                    <span className="text-[#00ff88] flex items-center gap-1 text-sm">
                      Read more <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All News */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold metallic-text mb-8">All News</h2>
          <div className="news-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((item, i) => (
              <div key={i} className="news-card glass-card rounded-2xl p-6 opacity-0 group hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{item.image}</div>
                  <span className="px-2 py-1 rounded text-xs" style={{ background: `${item.color}20`, color: item.color }}>
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-2 group-hover:text-[#00ff88] transition-colors">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.excerpt}</p>
                <span className="text-gray-500 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {item.date}
                </span>
              </div>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No news found for this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <Sparkles className="w-12 h-12 text-[#00ff88] mx-auto mb-6" />
          <h2 className="text-2xl font-bold metallic-text mb-4">Stay in the Loop</h2>
          <p className="text-gray-400 mb-8">Subscribe to receive the latest news and updates directly to your inbox</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black rounded-xl font-semibold hover:opacity-90 transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
