'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Calendar, Clock, Users, Zap, Bot, BarChart3, Settings, DollarSign, Shield, HelpCircle, ArrowRight, CheckCircle, XCircle } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function DemoPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    interest: '',
    date: '',
    time: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    
    tl.fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    
    gsap.fromTo('.info-card', 
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, scrollTrigger: { trigger: '.info-section', start: 'top 80%' } }
    )
    
    gsap.fromTo('.form-card',
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.8, scrollTrigger: { trigger: '.form-section', start: 'top 80%' } }
    )
    
    gsap.fromTo('.faq-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, scrollTrigger: { trigger: '.faq-section', start: 'top 80%' } }
    )
  }, { scope: containerRef })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', company: '', phone: '', interest: '', date: '', time: '', message: '' })
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.message || 'Failed to submit request. Please try again.')
      }
    } catch (err) {
      setSubmitStatus('error')
      setErrorMessage('An error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const glassCard = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container-custom section-padding-lg">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="hero-title inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            Book Your Personalized Demo
          </div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-6">
            Schedule Your Personal Demo
          </h1>
          <p className="hero-subtitle text-xl text-gray-400 leading-relaxed mb-8">
            Experience One Last AI firsthand. Our product experts will show you exactly how our AI agents can transform your business.
          </p>
        </div>

        <div className="info-section grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="info-card rounded-2xl p-8" style={glassCard}>
              <h2 className="text-xl font-bold text-white mb-6">What You'll Learn</h2>
              <div className="space-y-5">
                {[
                  { icon: Bot, title: "AI Agent Capabilities", desc: "See how our 20+ AI agents can solve your specific challenges", color: "text-purple-400" },
                  { icon: BarChart3, title: "Real-time Analytics", desc: "Explore powerful dashboards and performance metrics", color: "text-cyan-400" },
                  { icon: Settings, title: "Easy Integration", desc: "Learn how to integrate One Last AI into your workflow", color: "text-emerald-400" },
                  { icon: DollarSign, title: "ROI & Pricing", desc: "Understand pricing models and expected returns", color: "text-amber-400" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card rounded-2xl p-8" style={glassCard}>
              <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  <div className="text-2xl font-bold text-purple-400">500+</div>
                  <div className="text-xs text-gray-400">Demos Completed</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                  <div className="text-2xl font-bold text-cyan-400">98%</div>
                  <div className="text-xs text-gray-400">Satisfaction Rate</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                  <div className="text-2xl font-bold text-emerald-400">30min</div>
                  <div className="text-xs text-gray-400">Avg Demo Time</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                  <div className="text-2xl font-bold text-amber-400">24h</div>
                  <div className="text-xs text-gray-400">Response Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="form-section lg:col-span-2">
            <div className="form-card rounded-2xl p-8" style={glassCard}>
              <h2 className="text-2xl font-bold text-white mb-6">Book Your Demo</h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-emerald-400 font-medium">Demo request submitted successfully! We'll contact you within 24 hours to confirm your session.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 font-medium">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                      style={inputStyle}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                      style={inputStyle}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                      style={inputStyle}
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                      style={inputStyle}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="interest" className="block text-sm font-medium text-gray-300 mb-2">
                    What are you interested in? *
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={inputStyle}
                  >
                    <option value="" className="bg-[#1a1a1a]">Select an option</option>
                    <option value="ai-agents" className="bg-[#1a1a1a]">AI Agent Marketplace</option>
                    <option value="enterprise" className="bg-[#1a1a1a]">Enterprise Solutions</option>
                    <option value="custom-agents" className="bg-[#1a1a1a]">Custom AI Agent Development</option>
                    <option value="integration" className="bg-[#1a1a1a]">API Integration</option>
                    <option value="consulting" className="bg-[#1a1a1a]">AI Strategy Consulting</option>
                    <option value="other" className="bg-[#1a1a1a]">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Time *
                    </label>
                    <select
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={inputStyle}
                    >
                      <option value="" className="bg-[#1a1a1a]">Select a time</option>
                      <option value="09:00" className="bg-[#1a1a1a]">9:00 AM</option>
                      <option value="10:00" className="bg-[#1a1a1a]">10:00 AM</option>
                      <option value="11:00" className="bg-[#1a1a1a]">11:00 AM</option>
                      <option value="14:00" className="bg-[#1a1a1a]">2:00 PM</option>
                      <option value="15:00" className="bg-[#1a1a1a]">3:00 PM</option>
                      <option value="16:00" className="bg-[#1a1a1a]">4:00 PM</option>
                      <option value="17:00" className="bg-[#1a1a1a]">5:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                    style={inputStyle}
                    placeholder="Tell us about your goals, challenges, or specific questions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed bg-purple-600' : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500'}`}
                >
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      Schedule Your Demo
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  We respect your privacy. No spam, unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              Common Questions
            </div>
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "How long does the demo take?",
                a: "Our demos typically last 30-45 minutes, depending on your specific needs and questions."
              },
              {
                q: "Do I need to prepare anything?",
                a: "No preparation needed! Just join with your questions ready. Our experts will guide you through everything."
              },
              {
                q: "What if I can't make the scheduled time?",
                a: "No problem! You can reschedule anytime. Just contact our support team with your preferred time."
              },
              {
                q: "Can multiple team members join?",
                a: "Absolutely! We encourage team members from different departments to join and see how One Last AI can help them."
              },
              {
                q: "Will I get a trial account after the demo?",
                a: "Yes! Qualified leads receive a 14-day free trial to experience One Last AI firsthand."
              }
            ].map((item, idx) => (
              <div key={idx} className="faq-item p-6 rounded-2xl" style={glassCard}>
                <h3 className="font-semibold text-lg text-white mb-2">{item.q}</h3>
                <p className="text-gray-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="rounded-2xl p-8 md:p-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <h2 className="text-3xl font-bold text-white mb-4">Not ready for a demo?</h2>
            <p className="text-lg text-gray-400 mb-8">
              Explore our platform and see what our users are raving about.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agents" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all">
                <Users className="w-5 h-5" />
                Explore Agents
              </Link>
              <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all">
                <Zap className="w-5 h-5" />
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
