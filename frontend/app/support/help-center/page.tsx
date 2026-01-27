'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BookOpen, Users, MessageSquare, Lightbulb, FileText, Video, ShoppingCart, BarChart3, Zap, Phone, Scroll, Map, HelpCircle, ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const creativeStyles = `
  .glass-card {
    background: rgba(30, 30, 35, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  .glow-card {
    position: relative;
    background: linear-gradient(135deg, rgba(40, 40, 50, 0.95) 0%, rgba(25, 25, 35, 0.95) 100%);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .glow-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(135deg, #00d4ff, #a855f7, #00ff88);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .glow-card:hover::before { opacity: 1; }
  .shimmer-card {
    position: relative;
    overflow: hidden;
  }
  .shimmer-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    transition: left 0.6s ease;
  }
  .shimmer-card:hover::after { left: 100%; }
  .float-card {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
  }
  .float-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 212, 255, 0.15);
  }
`

const sections = [
  {
    category: 'Learning & Resources',
    cards: [
      { title: 'Documentation', description: 'Complete guides and API documentation', icon: BookOpen, href: '/docs', color: '#00d4ff', features: ['Getting Started', 'API Reference', 'Integration Guide'] },
      { title: 'Tutorials', description: 'Step-by-step tutorials for all features', icon: Video, href: '/resources/tutorials', color: '#a855f7', features: ['Agent Walkthroughs', 'Best Practices', 'Video Guides'] },
      { title: 'FAQ & Help', description: 'Answers to frequently asked questions', icon: FileText, href: '/support/faqs', color: '#00ff88', features: ['Common Questions', 'Troubleshooting', 'Tips & Tricks'] },
      { title: 'Blog & Case Studies', description: 'Insights and product updates', icon: Scroll, href: '/resources/blog', color: '#f59e0b', features: ['Industry News', 'Success Stories', 'Use Cases'] }
    ]
  },
  {
    category: 'Community & Support',
    cards: [
      { title: 'Community', description: 'Connect with other users', icon: Users, href: '/community', color: '#ec4899', features: ['Community Forum', 'Events', 'Networking'] },
      { title: 'Product Roadmap', description: 'See what we\'re building next', icon: Map, href: '/community/roadmap', color: '#8b5cf6', features: ['Upcoming Features', 'Status Updates', 'Public Roadmap'] },
      { title: 'Submit Ideas', description: 'Share feature requests', icon: Lightbulb, href: '/community/suggestions', color: '#f59e0b', features: ['Feature Requests', 'Improvements', 'Community Voting'] },
      { title: 'Live Support', description: 'Real-time assistance', icon: MessageSquare, href: '/support/live-support', color: '#00d4ff', features: ['Live Chat', 'Real-time Help', 'Expert Support'] }
    ]
  },
  {
    category: 'Services & Information',
    cards: [
      { title: 'Pricing Plans', description: 'Explore pricing options', icon: ShoppingCart, href: '/pricing', color: '#ef4444', features: ['Per-Agent Pricing', 'Feature Comparison', 'Plans Overview'] },
      { title: 'Book Consultation', description: 'Schedule with an expert', icon: Phone, href: '/support/book-consultation', color: '#10b981', features: ['Expert Consultation', 'Personalized Support', 'Training'] },
      { title: 'Contact Us', description: 'Get in touch with our team', icon: Zap, href: '/support/contact-us', color: '#a855f7', features: ['Email Support', 'Contact Form', 'Response Guarantee'] },
      { title: 'Support Ticket', description: 'Submit technical issues', icon: BarChart3, href: '/support/create-ticket', color: '#06b6d4', features: ['Issue Tracking', 'Priority Support', 'Ticket History'] }
    ]
  }
]

export default function HelpCenterPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-content', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' })
      gsap.from('.quick-link', { opacity: 0, y: 20, duration: 0.5, stagger: 0.1, delay: 0.3, ease: 'power3.out' })
      gsap.from('.section-title', { opacity: 0, x: -30, duration: 0.6, stagger: 0.2, ease: 'power3.out', scrollTrigger: { trigger: '.sections-container', start: 'top 85%' } })
      gsap.from('.help-card', { opacity: 0, y: 40, duration: 0.6, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.sections-container', start: 'top 85%' } })
      gsap.from('.cta-section', { opacity: 0, scale: 0.95, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.cta-section', start: 'top 85%' } })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const handleTilt = (e: React.MouseEvent<HTMLElement>, card: HTMLElement) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 15
    const rotateY = (centerX - x) / 15
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
  }

  const resetTilt = (card: HTMLElement) => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      <style dangerouslySetInnerHTML={{ __html: creativeStyles }} />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-[#a855f7]/10 to-[#00ff88]/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="hero-content text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 glass-card rounded-2xl mb-6">
              <HelpCircle className="w-10 h-10 text-[#00d4ff]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] bg-clip-text text-transparent">
                Help Center
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Find everything you need to get the most out of One Last AI. Browse documentation, tutorials, community resources, and support options.
            </p>
          </div>

          {/* Quick Access */}
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: '❓', label: 'FAQs', href: '/support/faqs', color: '#00d4ff' },
                  { icon: '📚', label: 'Docs', href: '/docs', color: '#a855f7' },
                  { icon: '💬', label: 'Live Chat', href: '/support/live-support', color: '#00ff88' },
                  { icon: '🎫', label: 'Ticket', href: '/support/create-ticket', color: '#f59e0b' }
                ].map((item, i) => (
                  <Link key={i} href={item.href} className="quick-link text-center p-4 glass-card rounded-xl hover:bg-white/10 transition-all group">
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div className="text-sm font-semibold" style={{ color: item.color }}>{item.label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="sections-container py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-16">
              <h2 className="section-title text-2xl font-bold text-white mb-8 pb-4 border-b border-gray-800 flex items-center gap-3">
                <span className="w-1 h-8 bg-gradient-to-b from-[#00d4ff] to-[#a855f7] rounded-full"></span>
                {section.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {section.cards.map((card, cardIdx) => (
                  <Link
                    key={cardIdx}
                    href={card.href}
                    className="help-card group glass-card glow-card shimmer-card rounded-2xl p-6 transition-all duration-300"
                    onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                    onMouseLeave={(e) => resetTilt(e.currentTarget)}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${card.color}33, ${card.color}11)` }}>
                      <card.icon className="w-6 h-6" style={{ color: card.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">{card.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">{card.description}</p>
                    <div className="space-y-2 mb-4">
                      {card.features.map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.color }}></span>
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center text-sm font-semibold group-hover:translate-x-2 transition-transform" style={{ color: card.color }}>
                      Learn More <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-section glass-card glow-card rounded-3xl p-10 md:p-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(0,255,136,0.1) 100%)' }}>
            <h2 className="text-3xl font-bold text-white mb-4">Still Need Help?</h2>
            <p className="text-lg text-gray-400 mb-8">
              Can't find what you're looking for? Our dedicated support team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/support/contact-us" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-xl shadow-lg shadow-[#00d4ff]/25 transition-all transform hover:scale-105">
                Contact Support
              </Link>
              <Link href="/support/live-support" className="px-8 py-4 glass-card text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                Start Live Chat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
