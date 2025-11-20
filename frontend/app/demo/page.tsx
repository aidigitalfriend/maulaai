'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DemoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    date: '',
    time: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Demo booking:', formData)
    alert('Thank you for booking a demo! We will contact you soon.')
    setFormData({ name: '', email: '', company: '', date: '', time: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neural-50">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Schedule Your Personal Demo</h1>
          <p className="text-xl text-neural-600 max-w-2xl mx-auto">
            Experience One Last AI firsthand. Our product experts will show you exactly how our AI agents can transform your business.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-8">What You'll Learn</h2>
              <div className="space-y-6">
                {[
                  { icon: "🤖", title: "AI Agent Capabilities", desc: "See how our 20+ AI agents can solve your specific challenges" },
                  { icon: "📊", title: "Real-time Analytics", desc: "Explore powerful dashboards and performance metrics" },
                  { icon: "🔧", title: "Easy Integration", desc: "Learn how to integrate One Last AI into your workflow" },
                  { icon: "💰", title: "ROI & Pricing", desc: "Understand pricing models and expected returns" }
                ].map((item, idx) => (
                  <div key={idx} className="border-l-4 border-brand-500 pl-4">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-neural-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neural-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-neural-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neural-900 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-neural-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-neural-900 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neural-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="Your Company"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-neural-900 mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-neural-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-neural-900 mb-2">
                        Preferred Time *
                      </label>
                      <select
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-neural-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        <option value="">Select a time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary bg-brand-600 hover:bg-brand-700"
                  >
                    Schedule Your Demo
                  </button>

                  <p className="text-sm text-neural-500 text-center">
                    We respect your privacy. No spam, unsubscribe anytime.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-neural-50">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
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
              <div key={idx} className="bg-white p-6 rounded-lg border border-neural-200">
                <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
                <p className="text-neural-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-brand-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Not ready for a demo?</h2>
          <p className="text-lg mb-6 opacity-90">Explore our platform and see what our users are raving about.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents" className="btn-primary bg-white text-brand-600 hover:bg-neural-50">
              Explore Agents
            </Link>
            <Link href="/auth/signup" className="btn-primary border-2 border-white bg-transparent hover:bg-white hover:text-brand-600">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
