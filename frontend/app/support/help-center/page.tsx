'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Book, Video, HelpCircle, FileText, Users, Map, Lightbulb, MessageSquare, ShoppingCart, Phone, Zap, BarChart3 } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function HelpCenterPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  const quickLinks = [
    { label: 'FAQs', icon: '❓', href: '/support/faqs', color: 'from-red-500/20 to-red-500/5' },
    { label: 'Docs', icon: '📚', href: '/docs', color: 'from-blue-500/20 to-blue-500/5' },
    { label: 'Live Chat', icon: '💬', href: '/support/live-support', color: 'from-green-500/20 to-green-500/5' },
    { label: 'Ticket', icon: '🎫', href: '/support/create-ticket', color: 'from-amber-500/20 to-amber-500/5' },
  ]

  const categories = [
    {
      title: 'Learning & Resources',
      cards: [
        {
          icon: Book,
          title: 'Documentation',
          description: 'Complete guides and API documentation for developers',
          items: ['Getting Started', 'API Reference', 'Integration Guide'],
          href: '/docs'
        },
        {
          icon: Video,
          title: 'Tutorials',
          description: 'Step-by-step tutorials for all agents and features',
          items: ['Agent Walkthroughs', 'Best Practices', 'Video Guides'],
          href: '/resources/tutorials'
        },
        {
          icon: HelpCircle,
          title: 'FAQ & Help',
          description: 'Answers to frequently asked questions',
          items: ['Common Questions', 'Troubleshooting', 'Tips & Tricks'],
          href: '/support/faqs'
        },
        {
          icon: FileText,
          title: 'Blog & Case Studies',
          description: 'Insights, case studies, and product updates',
          items: ['Industry News', 'Success Stories', 'Use Cases'],
          href: '/resources/blog'
        },
      ]
    },
    {
      title: 'Community & Support',
      cards: [
        {
          icon: Users,
          title: 'Community',
          description: 'Connect with other users and get community support',
          items: ['Community Forum', 'Events', 'Networking'],
          href: '/community'
        },
        {
          icon: Map,
          title: 'Product Roadmap',
          description: 'See what we\'re building next and share feedback',
          items: ['Upcoming Features', 'Status Updates', 'Public Roadmap'],
          href: '/community/roadmap'
        },
        {
          icon: Lightbulb,
          title: 'Submit Ideas',
          description: 'Share feature requests and improvement ideas',
          items: ['Feature Requests', 'Improvements', 'Community Voting'],
          href: '/community/suggestions'
        },
        {
          icon: MessageSquare,
          title: 'Live Support',
          description: 'Get real-time assistance from our support team',
          items: ['Live Chat', 'Real-time Help', 'Expert Support'],
          href: '/support/live-support'
        },
      ]
    },
    {
      title: 'Services & Information',
      cards: [
        {
          icon: ShoppingCart,
          title: 'Pricing Plans',
          description: 'Explore our pricing options and choose the right plan',
          items: ['Per-Agent Pricing', 'Feature Comparison', 'Plans Overview'],
          href: '/pricing'
        },
        {
          icon: Phone,
          title: 'Book Consultation',
          description: 'Schedule a one-on-one consultation with an expert',
          items: ['Expert Consultation', 'Personalized Support', 'Training'],
          href: '/support/book-consultation'
        },
        {
          icon: Zap,
          title: 'Contact Us',
          description: 'Get in touch with our team for any inquiries',
          items: ['Email Support', 'Contact Form', 'Response Guarantee'],
          href: '/support/contact-us'
        },
        {
          icon: BarChart3,
          title: 'Support Ticket',
          description: 'Submit a ticket for technical issues or problems',
          items: ['Issue Tracking', 'Priority Support', 'Ticket History'],
          href: '/support/create-ticket'
        },
      ]
    }
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
    gsap.fromTo('.quick-link',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, delay: 0.4, ease: 'back.out(1.5)' }
    )

    const sections = gsap.utils.toArray('.category-section')
    sections.forEach((section: any) => {
      gsap.fromTo(section.querySelector('.section-title'),
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      )
      
      const cards = section.querySelectorAll('.resource-card')
      cards.forEach((card: any, i: number) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(0, 212, 255, 0.3);
          transform: translateY(-4px);
        }
        .icon-container {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.2);
        }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle,rgba(0,212,255,0.1),transparent)] blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent opacity-0">
            Help Center
          </h1>
          <p className="hero-subtitle text-lg text-gray-400 max-w-xl mx-auto mb-10 opacity-0">
            Find answers, explore guides, and get the support you need to succeed.
          </p>

          {/* Quick Links Bar */}
          <div className="inline-flex items-center gap-4 p-3 rounded-2xl bg-[#1a1a1a] border border-white/10">
            {quickLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={`quick-link flex flex-col items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-b ${link.color} border border-white/5 hover:border-[#00d4ff]/30 transition-all opacity-0`}
              >
                <span className="text-2xl">{link.icon}</span>
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Sections */}
      {categories.map((category, catIndex) => (
        <section key={catIndex} className="category-section py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Title */}
            <div className="section-title flex items-center gap-4 mb-8 opacity-0">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#00ff88] bg-clip-text text-transparent">
                {category.title}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.cards.map((card, cardIndex) => {
                const IconComponent = card.icon
                return (
                  <Link
                    key={cardIndex}
                    href={card.href}
                    className="resource-card group glass-card rounded-2xl p-6 opacity-0"
                  >
                    {/* Icon */}
                    <div className="icon-container w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-[#00d4ff]" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                      {card.description}
                    </p>

                    {/* Items List */}
                    <ul className="space-y-2 mb-4">
                      {card.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Learn More Link */}
                    <div className="flex items-center text-sm font-medium text-[#00d4ff]">
                      <span>Learn More</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl p-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(0,102,255,0.1) 100%)' }}>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-gray-400 mb-6">Our support team is ready to help you with any questions.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/support/contact-us" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all hover:scale-105">
                Contact Support
              </Link>
              <Link href="/support/live-support" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all">
                Start Live Chat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
