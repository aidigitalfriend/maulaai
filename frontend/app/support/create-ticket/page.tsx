'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
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
  .input-glow:focus {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }
  .success-glow {
    box-shadow: 0 0 40px rgba(0, 255, 136, 0.3);
  }
`

export default function CreateTicketPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', username: '', phoneNumber: '',
    subject: '', description: '', priority: 'medium', category: 'general', attachments: [] as File[]
  })
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [ticketNumber, setTicketNumber] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    { value: 'general', label: 'General Support', icon: '💬' },
    { value: 'billing', label: 'Billing & Payment', icon: '💳' },
    { value: 'technical', label: 'Technical Issue', icon: '🔧' },
    { value: 'bug', label: 'Bug Report', icon: '🐛' },
    { value: 'feature', label: 'Feature Request', icon: '✨' },
    { value: 'account', label: 'Account Issue', icon: '👤' },
    { value: 'agents', label: 'AI Agents', icon: '🤖' },
    { value: 'other', label: 'Other', icon: '📋' }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low', icon: '🟢', color: '#00ff88' },
    { value: 'medium', label: 'Medium', icon: '🟡', color: '#f59e0b' },
    { value: 'high', label: 'High', icon: '🟠', color: '#f97316' },
    { value: 'critical', label: 'Critical', icon: '🔴', color: '#ef4444' }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-content', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' })
      gsap.from('.form-section', { opacity: 0, y: 40, duration: 0.8, delay: 0.3, ease: 'power3.out' })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

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
          userPhone: formData.phoneNumber, username: formData.username,
          subject: formData.subject, description: formData.description,
          category: formData.category, priority: formData.priority,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create ticket')
      if (data.success && data.ticket) {
        setTicketId(data.ticket.ticketId)
        setTicketNumber(data.ticket.ticketNumber || 0)
        setSubmitted(true)
      } else throw new Error('Invalid response from server')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit ticket. Please try again.')
    } finally { setIsSubmitting(false) }
  }

  const handleCreateAnother = () => {
    setFormData({ firstName: '', lastName: '', email: '', username: '', phoneNumber: '', subject: '', description: '', priority: 'medium', category: 'general', attachments: [] })
    setSubmitted(false)
    setTicketId('')
    setTicketNumber(0)
    setError('')
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      <style dangerouslySetInnerHTML={{ __html: creativeStyles }} />

      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-[#a855f7]/10 to-[#00ff88]/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="hero-content text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm font-medium text-[#00d4ff] mb-6">
              <span>🎫</span> Support Ticket System
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] bg-clip-text text-transparent">
                Create Support Ticket
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get help from our expert support team. We typically respond within 2-4 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {submitted ? (
            <div className="form-section glass-card glow-card rounded-2xl p-8 success-glow">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,255,136,0.2)' }}>
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Ticket Created Successfully!</h2>
                <p className="text-gray-400 text-lg">Our support team will review your ticket shortly.</p>
              </div>

              <div className="rounded-xl p-6 mb-8" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(168,85,247,0.1) 100%)' }}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>📄</span> Your Ticket Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-gray-500 text-sm mb-1">Ticket ID</p>
                    <p className="text-xl font-mono font-bold text-[#00d4ff]">{ticketId}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-gray-500 text-sm mb-1">Ticket Number</p>
                    <p className="text-xl font-bold text-white">#{ticketNumber}</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-gray-500 text-sm mb-1">Status</p>
                    <p className="text-xl font-bold text-[#f59e0b] flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse"></span>
                      Waiting for Review
                    </p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-gray-500 text-sm mb-1">Priority</p>
                    <p className="text-xl font-bold text-white capitalize flex items-center gap-2">
                      {priorityLevels.find(p => p.value === formData.priority)?.icon}
                      {formData.priority}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/support" className="flex-1 px-6 py-3 glass-card text-white rounded-xl font-semibold text-center hover:bg-white/10 transition-all">
                  Back to Support
                </Link>
                <button onClick={handleCreateAnother} className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white rounded-xl font-semibold hover:shadow-xl transition-all">
                  Create Another Ticket
                </button>
              </div>
            </div>
          ) : (
            <div className="form-section glass-card glow-card rounded-2xl p-8">
              {error && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <span>❌</span>
                  <div>
                    <p className="font-semibold text-red-400">Error Submitting Ticket</p>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Info */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.2)' }}>
                      <span>👤</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Contact Information</h3>
                      <p className="text-gray-500 text-sm">How can we reach you?</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">First Name *</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Last Name *</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all" placeholder="Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Phone (optional)</label>
                      <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all" placeholder="+1 234 567 8900" />
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.2)' }}>
                      <span>🎫</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Ticket Details</h3>
                      <p className="text-gray-500 text-sm">Describe your issue</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Category *</label>
                        <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00d4ff] input-glow transition-all">
                          {categories.map(cat => <option key={cat.value} value={cat.value} className="bg-[#1a1a1a]">{cat.icon} {cat.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Priority *</label>
                        <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00d4ff] input-glow transition-all">
                          {priorityLevels.map(p => <option key={p.value} value={p.value} className="bg-[#1a1a1a]">{p.icon} {p.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Subject *</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all" placeholder="Brief summary of your issue" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Description *</label>
                      <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={5} className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all resize-none" placeholder="Please provide as much detail as possible..."></textarea>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={`w-full py-4 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-xl shadow-lg shadow-[#00d4ff]/25 transition-all transform hover:scale-[1.02] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
