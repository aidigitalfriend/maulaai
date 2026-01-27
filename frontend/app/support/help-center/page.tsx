'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HelpCenterPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  const categories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      items: ['Quick Start Guide', 'Account Setup', 'First Steps', 'Basic Concepts']
    },
    {
      title: 'AI Agents',
      icon: '🤖',
      items: ['Creating Agents', 'Agent Configuration', 'Training & Fine-tuning', 'Best Practices']
    },
    {
      title: 'Studio & Tools',
      icon: '🎨',
      items: ['Canvas Overview', 'Code Generation', 'Templates Library', 'Customization']
    },
    {
      title: 'Billing & Plans',
      icon: '💳',
      items: ['Subscription Plans', 'Payment Methods', 'Invoices & Receipts', 'Plan Upgrades']
    },
    {
      title: 'API & Integrations',
      icon: '🔗',
      items: ['API Documentation', 'Authentication', 'Webhooks', 'Third-party Apps']
    },
    {
      title: 'Account & Security',
      icon: '🔒',
      items: ['Profile Settings', '2FA Setup', 'Privacy Controls', 'Data Export']
    }
  ]

  const popularArticles = [
    { title: 'How to create your first AI agent', views: '12.5K views' },
    { title: 'Understanding subscription tiers', views: '8.2K views' },
    { title: 'API rate limits explained', views: '6.8K views' },
    { title: 'Best practices for agent prompts', views: '5.4K views' }
  ]

  useGSAP(() => {
    gsap.fromTo('.hero-title', 
      { opacity: 0, y: 100, rotateX: 20 }, 
      { opacity: 1, y: 0, rotateX: 0, duration: 1.2, ease: 'power3.out' }
    )
    gsap.fromTo('.hero-subtitle', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' }
    )
    gsap.fromTo('.search-box', 
      { opacity: 0, y: 30, scale: 0.95 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.5, ease: 'back.out(1.5)' }
    )

    const cards = gsap.utils.toArray('.category-card')
    cards.forEach((card: any, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(0, 212, 255, 0.3);
        }
        .glow-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, #00d4ff, #00ff88, #0066ff, #00d4ff);
          background-size: 400% 100%;
          animation: glow-rotate 4s linear infinite;
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .glow-card:hover::before { opacity: 1; }
        .glow-card::after {
          content: '';
          position: absolute;
          inset: 1px;
          background: #0f0f0f;
          border-radius: inherit;
          z-index: -1;
        }
        @keyframes glow-rotate {
          0% { background-position: 0% 50%; }
          100% { background-position: 400% 50%; }
        }
        .float-card {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
        }
        .float-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 212, 255, 0.25);
        }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle,rgba(0,212,255,0.1),transparent)] blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent opacity-0">
            Help Center
          </h1>
          <p className="hero-subtitle text-lg text-gray-400 max-w-xl mx-auto mb-10 opacity-0">
            Find answers, explore guides, and learn how to get the most out of our platform.
          </p>
          
          {/* Search Box */}
          <div className="search-box max-w-xl mx-auto opacity-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full px-6 py-4 pl-14 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 transition-colors"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <div key={i} className="category-card group relative rounded-2xl p-6 glass-card glow-card float-card opacity-0">
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#00d4ff] transition-colors">
                  {cat.title}
                </h3>
                <ul className="space-y-2">
                  {cat.items.map((item, j) => (
                    <li key={j}>
                      <Link href="#" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                        <span className="w-1 h-1 bg-[#00d4ff] rounded-full"></span>
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
            Popular Articles
          </h2>
          <div className="space-y-4">
            {popularArticles.map((article, i) => (
              <Link key={i} href="#" className="block group rounded-xl p-4 glass-card hover:border-[#00d4ff]/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-white group-hover:text-[#00d4ff] transition-colors">{article.title}</span>
                  <span className="text-sm text-gray-500">{article.views}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl p-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(0,102,255,0.1) 100%)' }}>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-gray-400 mb-6">Our support team is ready to help you with any questions.</p>
            <Link href="/support/contact-us" className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all hover:scale-105">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
