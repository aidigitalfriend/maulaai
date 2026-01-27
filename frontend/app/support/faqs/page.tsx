'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function FAQsPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      category: 'Getting Started',
      items: [
        { q: 'How do I create an account?', a: 'Click the Sign Up button on our homepage, enter your email and create a password. You will receive a verification email to confirm your account.' },
        { q: 'Is there a free trial available?', a: 'Yes! We offer a generous free tier that includes access to basic features. No credit card required to get started.' },
        { q: 'How do I create my first AI agent?', a: 'Navigate to the Agents section in your dashboard, click "Create Agent", choose a template or start from scratch, and follow the guided setup process.' },
      ]
    },
    {
      category: 'Billing & Subscriptions',
      items: [
        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for enterprise accounts.' },
        { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.' },
        { q: 'Do you offer refunds?', a: 'We offer a 14-day money-back guarantee for new subscriptions. Contact our support team to request a refund.' },
      ]
    },
    {
      category: 'Technical Questions',
      items: [
        { q: 'What are the API rate limits?', a: 'Rate limits vary by plan. Free tier: 100 requests/hour. Pro: 1,000/hour. Enterprise: Custom limits based on your needs.' },
        { q: 'How secure is my data?', a: 'We use enterprise-grade AES-256 encryption, are SOC 2 Type II compliant, and perform regular security audits. Your data is never shared or sold.' },
        { q: 'Which AI models are supported?', a: 'We support multiple providers including OpenAI GPT-4, Anthropic Claude, Google Gemini, Mistral, and more. You can switch between models seamlessly.' },
      ]
    },
    {
      category: 'Account & Security',
      items: [
        { q: 'How do I enable two-factor authentication?', a: 'Go to Settings > Security > Two-Factor Authentication. You can use an authenticator app or SMS verification for added security.' },
        { q: 'Can I export my data?', a: 'Yes, you can export all your data including conversations, agents, and settings from the Account Settings page in JSON or CSV format.' },
        { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox.' },
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

    const sections = gsap.utils.toArray('.faq-section')
    sections.forEach((section: any, i) => {
      gsap.fromTo(section,
        { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
        {
          opacity: 1, x: 0,
          duration: 0.6,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })
  }, { scope: containerRef })

  let globalIndex = 0

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .faq-item {
          transition: all 0.3s ease;
        }
        .faq-item:hover {
          border-color: rgba(0, 212, 255, 0.3);
        }
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease, padding 0.3s ease;
        }
        .faq-answer.open {
          max-height: 500px;
        }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle,rgba(0,212,255,0.1),transparent)] blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent opacity-0">
            Frequently Asked Questions
          </h1>
          <p className="hero-subtitle text-lg text-gray-400 max-w-xl mx-auto opacity-0">
            Quick answers to common questions about our platform, billing, and features.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {faqs.map((category, catIndex) => {
            return (
              <div key={catIndex} className="faq-section opacity-0">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] bg-clip-text text-transparent">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.items.map((faq, i) => {
                    const currentIndex = globalIndex++
                    return (
                      <div key={i} className="faq-item rounded-xl glass-card overflow-hidden">
                        <button
                          onClick={() => setOpenFaq(openFaq === currentIndex ? null : currentIndex)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left"
                        >
                          <span className="font-medium text-white pr-4">{faq.q}</span>
                          <span className={`text-[#00d4ff] text-2xl transition-transform duration-300 ${openFaq === currentIndex ? 'rotate-45' : ''}`}>
                            +
                          </span>
                        </button>
                        <div className={`faq-answer px-6 ${openFaq === currentIndex ? 'open pb-5' : ''}`}>
                          <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl p-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(0,102,255,0.1) 100%)' }}>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
              Still have questions?
            </h2>
            <p className="text-gray-400 mb-6">Our support team is ready to help you.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/support/contact-us" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all hover:scale-105">
                Contact Support
              </Link>
              <Link href="/support/live-support" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all">
                Live Chat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
