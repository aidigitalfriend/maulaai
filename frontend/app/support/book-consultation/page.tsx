'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function BookConsultationPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', phone: '', topic: '', message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const topics = [
    'Getting Started',
    'Enterprise Solutions',
    'API Integration',
    'Custom AI Agents',
    'Billing & Plans',
    'Technical Support',
    'Other'
  ]

  const benefits = [
    { icon: '🎯', title: 'Personalized Guidance', desc: 'One-on-one session tailored to your needs' },
    { icon: '⚡', title: 'Quick Resolution', desc: 'Get answers to complex questions fast' },
    { icon: '🔧', title: 'Expert Support', desc: 'Direct access to our technical team' },
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
    gsap.fromTo('.benefit-card',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.4, ease: 'back.out(1.5)' }
    )
    gsap.fromTo('.form-section',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' }
    )
  }, { scope: containerRef })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubmitted(true)
    setIsSubmitting(false)
  }

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
        .input-field {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .input-field:focus {
          border-color: #00d4ff;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
          outline: none;
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
            Book a Consultation
          </h1>
          <p className="hero-subtitle text-lg text-gray-400 max-w-xl mx-auto opacity-0">
            Schedule a one-on-one session with our experts. We&apos;ll help you get the most out of our platform.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="benefit-card text-center rounded-2xl p-6 glass-card float-card opacity-0">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="form-section rounded-2xl p-8 glass-card opacity-0">
            {submitted ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-6">📅</div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
                  Consultation Requested!
                </h2>
                <p className="text-gray-400 mb-6">We&apos;ll reach out within 24 hours to confirm your appointment.</p>
                <Link href="/support" className="inline-block px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all">
                  Back to Support
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
                  Schedule Your Session
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 input-field"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 input-field"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Company</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 input-field"
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 input-field"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Consultation Topic *</label>
                    <select
                      required
                      value={formData.topic}
                      onChange={e => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-white input-field"
                    >
                      <option value="" className="bg-[#0a0a0a]">Select a topic</option>
                      {topics.map((topic, i) => (
                        <option key={i} value={topic} className="bg-[#0a0a0a]">{topic}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Additional Details</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 resize-none input-field"
                      placeholder="Tell us what you'd like to discuss..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Scheduling...' : 'Request Consultation'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
