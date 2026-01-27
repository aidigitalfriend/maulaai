'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const creativeStyles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .glow-card {
    position: relative;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .faq-item {
    transition: all 0.3s ease;
  }
  .faq-item:hover {
    border-color: rgba(0, 212, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
  }
  .faq-item[open] {
    border-color: rgba(168, 85, 247, 0.5);
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.15);
  }
  .faq-item[open] summary {
    color: #00d4ff;
  }
  .category-pill {
    transition: all 0.3s ease;
  }
  .category-pill:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
  }
`

const faqs = [
  {
    category: 'Getting Started',
    color: '#00d4ff',
    questions: [
      { q: 'What is One Last AI?', a: 'One Last AI is a comprehensive AI platform featuring 20+ specialized AI agents, an AI Studio for interactive conversations, Canvas for real-time code generation, and developer tools including APIs and SDKs.' },
      { q: 'How do I get started?', a: 'Create your account, browse our AI agents at /agents, and choose the one that fits your needs. Purchase access for $1/day, $5/week, or $15/month. Once purchased, access your agent through the Studio.' },
      { q: 'What is the AI Studio?', a: 'The AI Studio (/studio) is your central hub for interacting with AI agents. It features a modern chat interface, conversation history, real-time streaming responses, and integration with Canvas.' },
      { q: 'What is Canvas?', a: 'Canvas is our real-time code and content generation tool. When chatting with agents in Studio, you can open Canvas to generate live React applications, HTML pages, and interactive content.' },
      { q: 'Do I need technical skills?', a: 'No! One Last AI is designed for everyone. Non-technical users can chat with agents naturally, while developers can leverage our APIs, SDKs, and Canvas for advanced integrations.' }
    ]
  },
  {
    category: 'Billing & Pricing',
    color: '#a855f7',
    questions: [
      { q: 'What are the pricing plans?', a: 'We offer simple per-agent pricing: $1/day, $5/week, or $15/month. Each one-time purchase gives you unlimited access to one AI agent including Studio chat, Canvas generation, and API access.' },
      { q: 'What does per agent pricing mean?', a: 'Each purchase gives you full access to one AI agent. If you want multiple agents, purchase them separately. This lets you choose exactly what you need.' },
      { q: 'Can I cancel anytime?', a: 'Yes! There is no auto-renewal. Your access simply expires at the end of the period. You keep access until expiration and can repurchase whenever you want.' },
      { q: 'Do you offer refunds?', a: 'Yes. Full refunds within 30 days, 50% refunds between 30-60 days. After 60 days, no refunds but you can always let your access expire naturally.' },
      { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) via Stripe, plus PayPal and bank transfers for enterprise customers.' }
    ]
  },
  {
    category: 'Account & Security',
    color: '#00ff88',
    questions: [
      { q: 'Is my data secure?', a: 'Yes. We use enterprise-grade encryption (AES-256), SOC 2 Type II compliance, and regular security audits. All communications use HTTPS.' },
      { q: 'How do I reset my password?', a: 'Click Forgot Password on the login page. You will receive a secure reset link via email (expires in 24 hours).' },
      { q: 'How do I enable two-factor authentication?', a: 'Go to Account Settings, then Security, then Enable 2FA. We support authenticator apps like Google Authenticator, Authy, and Microsoft Authenticator.' },
      { q: 'Can I export my conversation data?', a: 'Yes. Export your conversation history in JSON or CSV format from Account Settings, then Data, then Export.' },
      { q: 'What happens to my data if I delete my account?', a: 'All personal data and conversations are permanently deleted within 30 days. You can request immediate deletion of specific data.' }
    ]
  },
  {
    category: 'API & Developer Tools',
    color: '#f59e0b',
    questions: [
      { q: 'Do you have an API?', a: 'Yes! We provide a comprehensive REST API at /docs/api. All agent purchases include API access with chat endpoints, streaming support, and webhooks.' },
      { q: 'What SDKs are available?', a: 'We offer official SDKs for JavaScript/Node.js, Python, Go, PHP, Ruby, and Java. Each SDK includes type definitions and async support.' },
      { q: 'What is the API rate limit?', a: 'Default: 1000 requests/hour per agent. Daily purchases: 500 calls/day. Weekly: 2,500/week. Monthly: 15,000/month.' },
      { q: 'Do you support streaming responses?', a: 'Yes! Our API supports Server-Sent Events (SSE) for real-time streaming. Get responses token-by-token as they generate.' },
      { q: 'How do I get my API key?', a: 'Go to Account Settings, then Developer, then API Keys. Generate a new key and keep it secure. You can create multiple keys with different permissions.' }
    ]
  },
  {
    category: 'Support & Help',
    color: '#ec4899',
    questions: [
      { q: 'How do I get support?', a: 'Visit /support for options: check this FAQ, browse our Help Center, create a support ticket, or use live chat.' },
      { q: 'What are the support response times?', a: 'Free accounts: 24-48 hours. Paid users: 2-4 hours. Enterprise: 1 hour with priority queue.' },
      { q: 'Where can I find documentation?', a: 'Visit /docs for complete documentation including Getting Started guides, API reference, SDK tutorials, and best practices.' },
      { q: 'Can I book a demo or consultation?', a: 'Yes! Schedule a free consultation at /support/book-consultation. Enterprise customers can request personalized demos.' },
      { q: 'How do I report a bug?', a: 'Report bugs through /support/create-ticket with details about what happened, steps to reproduce, and any error messages.' }
    ]
  }
]

export default function FAQsPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-content', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' })
      gsap.from('.category-pill', { opacity: 0, y: 20, duration: 0.5, stagger: 0.08, delay: 0.3, ease: 'power3.out' })
      gsap.from('.faq-category', { opacity: 0, y: 30, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.faq-section', start: 'top 85%' } })
      gsap.from('.cta-section', { opacity: 0, scale: 0.95, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.cta-section', start: 'top 85%' } })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      <style dangerouslySetInnerHTML={{ __html: creativeStyles }} />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-[#a855f7]/10 to-[#00ff88]/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="hero-content text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Find answers to common questions about One Last AI, our agents, Studio, Canvas, and more
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {faqs.map((category, idx) => (
              <a
                key={idx}
                href={`#${category.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="category-pill px-5 py-2 text-sm font-medium glass-card rounded-full transition-all"
                style={{ color: category.color, borderColor: `${category.color}33` }}
              >
                {category.category}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="faq-section py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-12">
            {faqs.map((category, catIdx) => (
              <div key={catIdx} id={category.category.toLowerCase().replace(/\s+/g, '-')} className="faq-category">
                <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-800 flex items-center gap-3">
                  <span className="w-1 h-8 rounded-full" style={{ backgroundColor: category.color }}></span>
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((item, qIdx) => (
                    <details
                      key={qIdx}
                      className="faq-item glass-card rounded-xl border border-gray-800 group"
                    >
                      <summary className="font-semibold text-gray-200 p-5 flex items-center justify-between cursor-pointer list-none">
                        <span className="pr-4">{item.q}</span>
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full glass-card group-open:rotate-180 transition-transform" style={{ color: category.color }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <p className="text-gray-400 px-5 pb-5 leading-relaxed">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="cta-section glass-card rounded-3xl p-10 text-center" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(0,255,136,0.1) 100%)' }}>
            <h2 className="text-3xl font-bold text-white mb-4">Can't find your answer?</h2>
            <p className="text-lg text-gray-400 mb-8">Our support team is here to help. Reach out to us anytime.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/support/contact-us" className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-xl shadow-lg shadow-[#00d4ff]/25 transition-all transform hover:scale-105">
                Contact Support
              </Link>
              <Link href="/support/create-ticket" className="px-8 py-4 glass-card text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                Create Ticket
              </Link>
              <Link href="/docs" className="px-8 py-4 glass-card text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                Browse Docs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
