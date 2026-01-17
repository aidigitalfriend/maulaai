'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DemoPage() {
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
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

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
    setError('')

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', company: '', phone: '', interest: '', date: '', time: '', message: '' })
      } else {
        setError(data.message || 'Failed to submit request. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="container-custom section-padding-lg flex items-center justify-center min-h-screen">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Demo Request Submitted! 🎉
            </h1>
            <p className="text-xl text-purple-200 mb-8">
              Thank you for your interest! Our team will reach out within 24 hours to confirm your demo session.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/agents" 
                className="px-8 py-4 bg-white text-purple-900 font-semibold rounded-xl hover:bg-purple-50 transition-all shadow-lg"
              >
                Explore Agents
              </Link>
              <Link 
                href="/" 
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-indigo-500/25 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-purple-200 text-sm mb-6">
            <span className="animate-pulse">🎯</span>
            <span>Personalized Demo Experience</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Schedule Your{' '}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Personal Demo
            </span>
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Experience One Last AI firsthand. Our product experts will show you exactly how our AI agents can transform your business.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-10 pb-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left Column - Info */}
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-2xl font-bold text-white mb-8">What You&apos;ll Learn</h2>
              
              {[
                { 
                  icon: "🤖", 
                  title: "AI Agent Capabilities", 
                  desc: "See how our 20+ AI agents can solve your specific challenges",
                  color: "from-pink-500 to-rose-500"
                },
                { 
                  icon: "📊", 
                  title: "Real-time Analytics", 
                  desc: "Explore powerful dashboards and performance metrics",
                  color: "from-purple-500 to-indigo-500"
                },
                { 
                  icon: "🔧", 
                  title: "Easy Integration", 
                  desc: "Learn how to integrate One Last AI into your workflow",
                  color: "from-indigo-500 to-blue-500"
                },
                { 
                  icon: "💰", 
                  title: "ROI & Pricing", 
                  desc: "Understand pricing models and expected returns",
                  color: "from-emerald-500 to-teal-500"
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-purple-300">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Trust Badges */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-8">
                <h3 className="text-white font-semibold mb-4">Trusted by Industry Leaders</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-pink-400">500+</div>
                    <div className="text-xs text-purple-300">Demos Completed</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-400">98%</div>
                    <div className="text-xs text-purple-300">Satisfaction Rate</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-indigo-400">30min</div>
                    <div className="text-xs text-purple-300">Avg Demo Time</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-emerald-400">24h</div>
                    <div className="text-xs text-purple-300">Response Time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Book Your Demo</h3>
                  <p className="text-purple-300">Fill in your details and we&apos;ll set up a personalized session</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-purple-200 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-purple-200 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interest" className="block text-sm font-medium text-purple-200 mb-2">
                      What are you interested in? *
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    >
                      <option value="" className="bg-purple-900">Select an option</option>
                      <option value="ai-agents" className="bg-purple-900">AI Agent Marketplace</option>
                      <option value="enterprise" className="bg-purple-900">Enterprise Solutions</option>
                      <option value="custom-agents" className="bg-purple-900">Custom AI Agent Development</option>
                      <option value="integration" className="bg-purple-900">API Integration</option>
                      <option value="consulting" className="bg-purple-900">AI Strategy Consulting</option>
                      <option value="other" className="bg-purple-900">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-purple-200 mb-2">
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
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-purple-200 mb-2">
                        Preferred Time *
                      </label>
                      <select
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      >
                        <option value="" className="bg-purple-900">Select a time</option>
                        <option value="09:00" className="bg-purple-900">9:00 AM</option>
                        <option value="10:00" className="bg-purple-900">10:00 AM</option>
                        <option value="11:00" className="bg-purple-900">11:00 AM</option>
                        <option value="14:00" className="bg-purple-900">2:00 PM</option>
                        <option value="15:00" className="bg-purple-900">3:00 PM</option>
                        <option value="16:00" className="bg-purple-900">4:00 PM</option>
                        <option value="17:00" className="bg-purple-900">5:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-purple-200 mb-2">
                      Additional Details
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us about your goals, challenges, or specific questions..."
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-sm flex items-center gap-2">
                      <span>⚠️</span>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 focus:ring-4 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Schedule Your Demo →'
                    )}
                  </button>

                  <p className="text-sm text-purple-300/70 text-center">
                    🔒 We respect your privacy. No spam, unsubscribe anytime.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-purple-300">Everything you need to know about our demo sessions</p>
          </div>
          
          <div className="grid gap-4">
            {[
              {
                q: "How long does the demo take?",
                a: "Our demos typically last 30-45 minutes, depending on your specific needs and questions. We keep it focused and valuable."
              },
              {
                q: "Do I need to prepare anything?",
                a: "No preparation needed! Just join with your questions ready. Our experts will guide you through everything and tailor the demo to your interests."
              },
              {
                q: "What if I can't make the scheduled time?",
                a: "No problem at all! You can reschedule anytime with no penalty. Just contact our support team or reply to your confirmation email."
              },
              {
                q: "Can multiple team members join?",
                a: "Absolutely! We encourage team members from different departments to join. It helps everyone understand how One Last AI can benefit their workflow."
              },
              {
                q: "Will I get a trial account after the demo?",
                a: "Yes! All demo attendees receive a 14-day free trial to experience One Last AI hands-on with full access to our AI agents."
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <h3 className="font-semibold text-lg text-white mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-sm">
                    {idx + 1}
                  </span>
                  {item.q}
                </h3>
                <p className="text-purple-300 pl-11">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Not ready for a demo?</h2>
            <p className="text-lg text-purple-200 mb-8 max-w-2xl mx-auto">
              Explore our platform and see what our users are raving about. No commitment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/agents" 
                className="px-8 py-4 bg-white text-purple-900 font-semibold rounded-xl hover:bg-purple-50 transition-all shadow-lg"
              >
                Explore Agents
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
