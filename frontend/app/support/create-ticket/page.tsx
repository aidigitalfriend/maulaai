'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CreateTicketPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    category: '', priority: 'medium', subject: '', description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [error, setError] = useState('')

  const categories = [
    { value: 'general', label: 'General Support' },
    { value: 'billing', label: 'Billing & Payment' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'account', label: 'Account Issue' },
    { value: 'agents', label: 'AI Agents' },
    { value: 'other', label: 'Other' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: '#00ff88' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#f97316' },
    { value: 'critical', label: 'Critical', color: '#ef4444' }
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
    gsap.fromTo('.form-section',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' }
    )
  }, { scope: containerRef })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const guestUserId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: guestUserId, userEmail: formData.email,
          userName: `${formData.firstName} ${formData.lastName}`,
          userPhone: formData.phone,
          subject: formData.subject, description: formData.description,
          category: formData.category, priority: formData.priority,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create ticket')
      if (data.success && data.ticket) {
        setTicketId(data.ticket.ticketId)
        setSubmitted(true)
      } else throw new Error('Invalid response from server')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit ticket')
    } finally { setIsSubmitting(false) }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
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
        .gradient-border {
          background: linear-gradient(#0f0f0f, #0f0f0f) padding-box,
                      linear-gradient(135deg, #00d4ff, #00ff88) border-box;
          border: 2px solid transparent;
        }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle,rgba(0,212,255,0.1),transparent)] blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent opacity-0">
            Create Support Ticket
          </h1>
          <p className="hero-subtitle text-lg text-gray-400 max-w-xl mx-auto opacity-0">
            Submit a detailed request and our team will respond within 2-4 hours.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="form-section rounded-2xl p-8 glass-card opacity-0">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-border flex items-center justify-center">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
                  Ticket Created Successfully!
                </h2>
                <div className="mb-6 p-4 rounded-xl bg-white/5 inline-block">
                  <p className="text-sm text-gray-400 mb-1">Ticket ID</p>
                  <p className="text-xl font-mono font-bold text-[#00d4ff]">{ticketId}</p>
                </div>
                <p className="text-gray-400 mb-6">We&apos;ll review your request and get back to you soon.</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/support" className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all">
                    Back to Support
                  </Link>
                  <button onClick={() => { setSubmitted(false); setFormData({ firstName: '', lastName: '', email: '', phone: '', category: '', priority: 'medium', subject: '', description: '' }) }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold hover:shadow-lg transition-all">
                    Create Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    {error}
                  </div>
                )}

                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <span className="text-xl">👤</span> Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">First Name *</label>
                      <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 input-field" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Last Name *</label>
                      <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 input-field" placeholder="Doe" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email *</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 input-field" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Phone</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 input-field" placeholder="+1 234 567 890" />
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <span className="text-xl">🎫</span> Ticket Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Category *</label>
                      <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl text-white input-field">
                        <option value="" className="bg-[#0a0a0a]">Select category</option>
                        {categories.map(cat => <option key={cat.value} value={cat.value} className="bg-[#0a0a0a]">{cat.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Priority *</label>
                      <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-3 rounded-xl text-white input-field">
                        {priorities.map(p => <option key={p.value} value={p.value} className="bg-[#0a0a0a]">{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Subject *</label>
                    <input type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 input-field" placeholder="Brief summary of your issue" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Description *</label>
                    <textarea required rows={5} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 resize-none input-field" placeholder="Provide as much detail as possible..." />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all hover:scale-[1.02] disabled:opacity-50">
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
