'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function WebinarRegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    phoneNumber: '',
    webinarTopic: 'getting-started'
  })

  const [submitted, setSubmitted] = useState(false)

  const webinarOptions = [
    { value: 'getting-started', label: 'Getting Started with AI Agents' },
    { value: 'advanced-customization', label: 'Advanced Customization Techniques' },
    { value: 'enterprise-solutions', label: 'Building Enterprise Solutions' },
    { value: 'analytics-reporting', label: 'Real-time Analytics & Reporting' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        jobTitle: '',
        phoneNumber: '',
        webinarTopic: 'getting-started'
      })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Webinar Registration
          </h1>
          <p className="text-xl text-neural-600 leading-relaxed">
            Register for our upcoming webinars and enhance your AI knowledge
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Registration Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
            {submitted ? (
              <div className="text-center py-8">
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-5xl mb-4">✓</div>
                  <h2 className="text-2xl font-bold text-neural-800 mb-2">Registration Successful!</h2>
                  <p className="text-neural-600 mb-4">
                    Thank you for registering. We've sent a confirmation email to <strong>{formData.email}</strong>
                  </p>
                  <p className="text-neural-600 mb-6">
                    You'll receive webinar details and access links shortly.
                  </p>
                </div>
                <Link href="/resources/webinars" className="inline-block btn-primary">
                  Back to Webinars
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-neural-800 mb-6">Register for a Webinar</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neural-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neural-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neural-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neural-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-neural-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neural-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Company and Job Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neural-700 mb-2">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neural-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neural-700 mb-2">Job Title</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neural-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Product Manager"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-neural-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neural-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Webinar Selection */}
                  <div>
                    <label className="block text-sm font-medium text-neural-700 mb-2">Select Webinar *</label>
                    <select
                      name="webinarTopic"
                      value={formData.webinarTopic}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neural-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {webinarOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Terms */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-neural-600">
                      ✓ By registering, you agree to receive webinar updates and related communications from us.
                    </p>
                    <p className="text-sm text-neural-600 mt-2">
                      ✓ We respect your privacy and will never share your email address with third parties.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full btn-primary"
                  >
                    Complete Registration →
                  </button>
                </form>

                {/* Back Link */}
                <div className="mt-6 text-center">
                  <Link href="/resources/webinars" className="text-brand-600 hover:text-brand-700 transition font-medium">
                    ← Back to Webinars
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* What to Expect */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
              <h3 className="text-xl font-bold text-neural-800 mb-6">What to Expect</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neural-800">Confirmation Email</h4>
                    <p className="text-neural-600 text-sm">You'll receive a confirmation email with webinar details and access links.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎥</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neural-800">Live Webinar</h4>
                    <p className="text-neural-600 text-sm">Join us live for interactive sessions with Q&A and expert insights.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📹</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neural-800">Recording Access</h4>
                    <p className="text-neural-600 text-sm">Can't attend live? Access the recorded session anytime after the webinar.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
              <h3 className="text-xl font-bold text-neural-800 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/resources/webinars" className="block w-full btn-secondary text-center">
                  View All Webinars
                </Link>
                <Link href="/resources/tutorials" className="block w-full btn-secondary text-center">
                  Browse Tutorials
                </Link>
                <Link href="/support/help-center" className="block w-full btn-secondary text-center">
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-neural-800 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
              <h3 className="font-bold text-neural-800 mb-2">Do I need to attend live?</h3>
              <p className="text-neural-600 text-sm">
                No, you can attend live or watch the recording later. Both registered attendees and those who can't make it live will have access to the recording.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
              <h3 className="font-bold text-neural-800 mb-2">Will there be a Q&A session?</h3>
              <p className="text-neural-600 text-sm">
                Yes! All our webinars include a dedicated Q&A session where you can ask questions directly to our experts.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
              <h3 className="font-bold text-neural-800 mb-2">What if I need to cancel?</h3>
              <p className="text-neural-600 text-sm">
                No problem! You can unsubscribe from webinar notifications at any time. Simply click the unsubscribe link in any email we send you.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
              <h3 className="font-bold text-neural-800 mb-2">Is there a cost?</h3>
              <p className="text-neural-600 text-sm">
                All webinars are completely free! We offer these sessions to help you get the most out of our platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
