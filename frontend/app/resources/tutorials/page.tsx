'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, GraduationCap, Play, Clock, Star, Check, ChevronRight, Search, Filter } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function TutorialsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Getting Started', 'Agent Building', 'Customization', 'Integrations', 'Advanced'];

  const tutorials = [
    {
      title: 'Building Your First AI Agent',
      description: 'Learn how to create and deploy your first AI agent in under 10 minutes.',
      category: 'Getting Started',
      duration: '10 min',
      difficulty: 'Beginner',
      rating: 4.9,
      views: '15.2K',
      color: '#00d4ff'
    },
    {
      title: 'Customizing Agent Personalities',
      description: 'Deep dive into personality configuration and tone adjustments.',
      category: 'Customization',
      duration: '25 min',
      difficulty: 'Intermediate',
      rating: 4.8,
      views: '8.7K',
      color: '#a855f7'
    },
    {
      title: 'Advanced Memory & Context',
      description: 'Master long-term memory and context management for your agents.',
      category: 'Advanced',
      duration: '35 min',
      difficulty: 'Advanced',
      rating: 4.7,
      views: '5.4K',
      color: '#00ff88'
    },
    {
      title: 'API Integration Guide',
      description: 'Connect your agents to external APIs and services.',
      category: 'Integrations',
      duration: '20 min',
      difficulty: 'Intermediate',
      rating: 4.8,
      views: '10.1K',
      color: '#f59e0b'
    },
    {
      title: 'Multi-Agent Workflows',
      description: 'Build complex workflows with multiple cooperating agents.',
      category: 'Advanced',
      duration: '40 min',
      difficulty: 'Advanced',
      rating: 4.6,
      views: '3.2K',
      color: '#ec4899'
    },
    {
      title: 'Agent Training Basics',
      description: 'Understand how to train and fine-tune your AI agents.',
      category: 'Agent Building',
      duration: '30 min',
      difficulty: 'Intermediate',
      rating: 4.9,
      views: '12.8K',
      color: '#6366f1'
    }
  ];

  const filteredTutorials = tutorials.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#00ff88';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ec4899';
      default: return '#00d4ff';
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.search-bar', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

    gsap.fromTo('.category-btn',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.categories', start: 'top 90%' } }
    );

    gsap.fromTo('.tutorial-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.tutorials-grid', start: 'top 85%' } }
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/resources" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#6366f1] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <GraduationCap className="w-4 h-4 text-[#6366f1]" />
              <span className="text-gray-300">Learn & Grow</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Tutorials</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Step-by-step guides to help you master AI agent development
            </p>
          </div>

          {/* Search */}
          <div className="search-bar mt-10 max-w-2xl mx-auto opacity-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1]/50"
              />
            </div>
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
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorials Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="tutorials-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial, i) => (
              <div key={i} className="tutorial-card glass-card rounded-2xl p-6 opacity-0 group hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${tutorial.color}10, transparent)` }}></div>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 rounded text-xs" style={{ background: `${getDifficultyColor(tutorial.difficulty)}20`, color: getDifficultyColor(tutorial.difficulty) }}>
                    {tutorial.difficulty}
                  </span>
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {tutorial.duration}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#6366f1] transition-colors">{tutorial.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{tutorial.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" /> {tutorial.rating}
                  </span>
                  <span className="text-gray-500">{tutorial.views} views</span>
                </div>
              </div>
            ))}
          </div>

          {filteredTutorials.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No tutorials found. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Ready to Start Building?</h2>
          <p className="text-gray-400 mb-8">Create your first AI agent today with our step-by-step guidance</p>
          <Link href="/agents" className="inline-block px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl font-semibold hover:opacity-90 transition-all">
            Create Your Agent
          </Link>
        </div>
      </section>
    </div>
  );
}
