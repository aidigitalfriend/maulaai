'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function CreateTicketPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phoneNumber: '',
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general',
    attachments: [] as File[]
  })

  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const categories = [
    { value: 'general', label: 'General Support' },
    { value: 'billing', label: 'Billing & Payment' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'account', label: 'Account Issue' },
    { value: 'integration', label: 'Integration Help' },
    { value: 'other', label: 'Other' }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low - Can wait', icon: '🟢' },
    { value: 'medium', label: 'Medium - Normal', icon: '🟡' },
    { value: 'high', label: 'High - Urgent', icon: '🔴' },
    { value: 'critical', label: 'Critical - Emergency', icon: '⛔' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
    // Simulate upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 100)
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Generate ticket ID (in production, this would come from backend)
    const newTicketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Log submission (in production, send to backend)
    console.log('Ticket submitted:', {
      ...formData,
      ticketId: newTicketId,
      createdAt: new Date().toISOString()
    })
    
    setTicketId(newTicketId)
    setSubmitted(true)
  }

  const handleCreateAnother = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      phoneNumber: '',
      subject: '',
      description: '',
      priority: 'medium',
      category: 'general',
      attachments: []
    })
    setSubmitted(false)
    setTicketId('')
    setUploadProgress(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      {/* Header */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Create Support Ticket</h1>
          <p className="text-xl opacity-90">Get help from our support team. We're here to assist you.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          {submitted ? (
            <div className="bg-green-900 bg-opacity-20 border border-green-600 rounded-lg p-8 mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4">✓</div>
                <h2 className="text-3xl font-bold mb-2">Ticket Created Successfully!</h2>
                <p className="text-neural-300 mb-6 text-lg">
                  Thank you for reaching out. Your support ticket has been created and our team will review it shortly.
                </p>
              </div>

              {/* Ticket Details Card */}
              <div className="bg-neural-800 border border-neural-700 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Your Ticket Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <p className="text-neural-400 text-sm mb-1">Ticket ID</p>
                    <p className="text-xl font-mono font-bold text-brand-400">{ticketId}</p>
                    <p className="text-xs text-neural-400 mt-2">Save this ID for reference</p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <p className="text-neural-400 text-sm mb-1">Status</p>
                    <p className="text-xl font-bold text-yellow-400">Waiting for Review</p>
                    <p className="text-xs text-neural-400 mt-2">Avg. response: 2-4 hours</p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <p className="text-neural-400 text-sm mb-1">Subject</p>
                    <p className="text-lg font-semibold">{formData.subject}</p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <p className="text-neural-400 text-sm mb-1">Priority</p>
                    <p className="text-lg font-semibold capitalize">{formData.priority}</p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-neural-800 border border-neural-700 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">What Happens Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-semibold">Confirmation Email</p>
                      <p className="text-neural-300 text-sm">We'll send a confirmation email to {formData.email} with your ticket details.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-semibold">Team Review</p>
                      <p className="text-neural-300 text-sm">Our support team will review your ticket and assign it to the appropriate specialist.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-semibold">Support Response</p>
                      <p className="text-neural-300 text-sm">You'll receive updates via email. Track your ticket status anytime using your Ticket ID.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/support" className="flex-1 px-6 py-3 bg-neural-700 hover:bg-neural-600 text-white rounded-lg font-semibold transition text-center">
                  Back to Support
                </Link>
                <button onClick={handleCreateAnother} className="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition">
                  Create Another Ticket
                </button>
                <Link href="/support/track-ticket" className="flex-1 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-semibold transition text-center">
                  Track Ticket Status
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-neural-800 border border-neural-700 rounded-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information Section */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 pb-2 border-b border-neural-700">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:outline-none focus:border-brand-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:outline-none focus:border-brand-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:outline-none focus:border-brand-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Username *</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:outline-none focus:border-brand-500"
                        placeholder="johndoe"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:outline-none focus:border-brand-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Ticket Details Section */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 pb-2 border-b border-neural-700">Ticket Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white focus:outline-none focus:border-brand-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Priority *</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white focus:outline-none focus:border-brand-500"
                      >
                        {priorityLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.icon} {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:outline-none focus:border-brand-500"
                      placeholder="Brief summary of your issue"
                    />
                    <p className="text-xs text-neural-400 mt-1">{formData.subject.length}/100</p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      maxLength={2000}
                      rows={6}
                      className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:outline-none focus:border-brand-500 resize-none"
                      placeholder="Please provide detailed information about your issue. Include steps to reproduce, error messages, screenshots, etc."
                    />
                    <p className="text-xs text-neural-400 mt-1">{formData.description.length}/2000</p>
                  </div>
                </div>

                {/* File Attachments Section */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 pb-2 border-b border-neural-700">Attachments (Optional)</h3>

                  <div className="bg-neural-700 border-2 border-dashed border-neural-600 rounded-lg p-6 text-center cursor-pointer hover:border-brand-500 transition">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.png,.gif,.zip"
                      />
                      <div>
                        <p className="text-2xl mb-2">📎</p>
                        <p className="font-semibold mb-1">Click to upload or drag and drop</p>
                        <p className="text-sm text-neural-400">PNG, JPG, PDF, DOC, ZIP up to 10MB</p>
                      </div>
                    </label>
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Uploading... {uploadProgress}%</p>
                      <div className="w-full bg-neural-700 rounded-full h-2">
                        <div
                          className="bg-brand-600 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Attached Files List */}
                  {formData.attachments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Attached Files ({formData.attachments.length}):</p>
                      <div className="space-y-2">
                        {formData.attachments.map((file, idx) => (
                          <div key={idx} className="bg-neural-700 p-3 rounded border border-neural-600 flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-lg">📄</span>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{file.name}</p>
                                <p className="text-xs text-neural-400">{(file.size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms & Submit */}
                <div className="bg-neural-700 p-4 rounded-lg border border-neural-600">
                  <p className="text-sm text-neural-300">
                    ✓ By submitting this ticket, you agree to our support terms and privacy policy.
                  </p>
                  <p className="text-sm text-neural-300 mt-2">
                    ✓ You'll receive a confirmation email with your ticket ID and status updates as we work on your issue.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Create Support Ticket
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-neural-700">
                <h3 className="text-xl font-bold mb-4">Need Immediate Help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/support/live-support" className="bg-neural-700 p-4 rounded border border-neural-600 hover:border-brand-500 transition text-center">
                    <p className="text-2xl mb-2">💬</p>
                    <p className="font-semibold">Live Chat</p>
                    <p className="text-sm text-neural-400">Chat with support now</p>
                  </Link>
                  <Link href="/support/faqs" className="bg-neural-700 p-4 rounded border border-neural-600 hover:border-brand-500 transition text-center">
                    <p className="text-2xl mb-2">❓</p>
                    <p className="font-semibold">Browse FAQs</p>
                    <p className="text-sm text-neural-400">Find quick answers</p>
                  </Link>
                  <Link href="/resources/documentation" className="bg-neural-700 p-4 rounded border border-neural-600 hover:border-brand-500 transition text-center">
                    <p className="text-2xl mb-2">📚</p>
                    <p className="font-semibold">Documentation</p>
                    <p className="text-sm text-neural-400">Learn how to use One Last AI</p>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
