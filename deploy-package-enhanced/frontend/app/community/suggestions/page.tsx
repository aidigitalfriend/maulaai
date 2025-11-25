'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Lightbulb, Send, CheckCircle, ArrowRight, MessageSquare, Zap, Users } from 'lucide-react'

export default function SuggestionsPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    title: '',
    description: '',
    category: 'feature',
    priority: 'medium',
    attachments: [] as File[]
  })

  const [submitted, setSubmitted] = useState(false)
  const [suggestionId, setSuggestionId] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const categories = [
    { value: 'feature', label: '💡 New Feature' },
    { value: 'improvement', label: '⚡ Improvement' },
    { value: 'integration', label: '🔗 Integration' },
    { value: 'performance', label: '🚀 Performance' },
    { value: 'security', label: '🔒 Security' },
    { value: 'ux', label: '🎨 User Experience' },
    { value: 'documentation', label: '📚 Documentation' },
    { value: 'other', label: '📝 Other' }
  ]

  const priorityLevels = [
    { value: 'low', label: '🟢 Nice to Have' },
    { value: 'medium', label: '🟡 Important' },
    { value: 'high', label: '🔴 Critical' }
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
    
    // Generate suggestion ID
    const newSuggestionId = `SUG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Log submission (in production, send to backend)
    console.log('Suggestion submitted:', {
      ...formData,
      suggestionId: newSuggestionId,
      createdAt: new Date().toISOString()
    })
    
    setSuggestionId(newSuggestionId)
    setSubmitted(true)
  }

  const handleSubmitAnother = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      title: '',
      description: '',
      category: 'feature',
      priority: 'medium',
      attachments: []
    })
    setSubmitted(false)
    setSuggestionId('')
    setUploadProgress(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      {/* Header */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lightbulb className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Share Your Ideas</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Help shape the future of One Last AI. Submit your feature requests, improvements, and ideas to make our platform even better.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-neural-800 border border-neural-700 rounded-lg p-6 text-center">
              <MessageSquare className="w-12 h-12 text-brand-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Your Voice Matters</h3>
              <p className="text-neural-300 text-sm">Every suggestion is reviewed by our team and helps prioritize future development.</p>
            </div>
            <div className="bg-neural-800 border border-neural-700 rounded-lg p-6 text-center">
              <Users className="w-12 h-12 text-accent-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Community Driven</h3>
              <p className="text-neural-300 text-sm">Vote on and discuss ideas with other community members to show your support.</p>
            </div>
            <div className="bg-neural-800 border border-neural-700 rounded-lg p-6 text-center">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Quick Updates</h3>
              <p className="text-neural-300 text-sm">Receive notifications when your suggested feature is implemented or discussed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          {submitted ? (
            <div className="bg-green-900 bg-opacity-20 border border-green-600 rounded-lg p-8 mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4">✓</div>
                <h2 className="text-3xl font-bold mb-2">Thank You for Your Suggestion!</h2>
                <p className="text-neural-300 mb-6 text-lg">
                  Your idea has been submitted successfully. Our team will review it and get back to you soon.
                </p>
              </div>

              {/* Suggestion Details Card */}
              <div className="bg-neural-800 border border-neural-700 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Your Suggestion Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <p className="text-neural-400 text-sm mb-1">Suggestion ID</p>
                    <p className="text-xl font-mono font-bold text-brand-400">{suggestionId}</p>
                    <p className="text-xs text-neural-400 mt-2">Save this for reference</p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <p className="text-neural-400 text-sm mb-1">Category</p>
                    <p className="text-lg font-semibold capitalize">
                      {categories.find(c => c.value === formData.category)?.label}
                    </p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <p className="text-neural-400 text-sm mb-1">Title</p>
                    <p className="text-lg font-semibold">{formData.title}</p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600">
                    <p className="text-neural-400 text-sm mb-1">Priority</p>
                    <p className="text-lg font-semibold capitalize">{formData.priority}</p>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-neural-800 border border-neural-700 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">What Happens Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-semibold">Review & Assessment</p>
                      <p className="text-neural-300 text-sm">Our team evaluates your suggestion for feasibility and alignment with our roadmap.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-semibold">Community Voting</p>
                      <p className="text-neural-300 text-sm">The idea appears in our community board where members can vote and discuss it.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-semibold">Roadmap Integration</p>
                      <p className="text-neural-300 text-sm">Popular ideas get added to our product roadmap and you receive updates on progress.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/community/roadmap" className="flex-1 px-6 py-3 bg-neural-700 hover:bg-neural-600 text-white rounded-lg font-semibold transition text-center">
                  View Roadmap
                </Link>
                <button onClick={handleSubmitAnother} className="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition">
                  Submit Another
                </button>
                <Link href="/community" className="flex-1 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-semibold transition text-center">
                  Explore Community
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-neural-800 border border-neural-700 rounded-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information Section */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 pb-2 border-b border-neural-700">About You</h3>
                  
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
                      <label className="block text-sm font-semibold mb-2">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:outline-none focus:border-brand-500"
                        placeholder="Your Company"
                      />
                    </div>
                  </div>
                </div>

                {/* Suggestion Details Section */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 pb-2 border-b border-neural-700">Your Suggestion</h3>

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
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      className="w-full px-4 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:outline-none focus:border-brand-500"
                      placeholder="Brief title of your idea"
                    />
                    <p className="text-xs text-neural-400 mt-1">{formData.title.length}/100</p>
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
                      placeholder="Describe your suggestion in detail. What problem does it solve? How would it improve One Last AI?"
                    />
                    <p className="text-xs text-neural-400 mt-1">{formData.description.length}/2000</p>
                  </div>
                </div>

                {/* Attachments Section */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 pb-2 border-b border-neural-700">Attachments (Optional)</h3>

                  <div className="bg-neural-700 border-2 border-dashed border-neural-600 rounded-lg p-6 text-center cursor-pointer hover:border-brand-500 transition">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.gif,.sketch,.fig,.xd"
                      />
                      <div>
                        <p className="text-2xl mb-2">🎨</p>
                        <p className="font-semibold mb-1">Click to upload mockups or screenshots</p>
                        <p className="text-sm text-neural-400">PNG, JPG, PDF, Sketch, Figma up to 10MB</p>
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
                              <span className="text-lg">📎</span>
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

                {/* Suggestion Guidelines */}
                <div className="bg-neural-700 p-4 rounded-lg border border-neural-600">
                  <p className="text-sm text-neural-300 mb-2">
                    <span className="font-semibold">💡 Pro Tips:</span>
                  </p>
                  <ul className="text-sm text-neural-300 space-y-1 ml-4">
                    <li>• Be specific about the problem and your proposed solution</li>
                    <li>• Include examples of how this would improve your workflow</li>
                    <li>• Attach mockups or screenshots if they help explain your idea</li>
                    <li>• Check the roadmap to avoid duplicate suggestions</li>
                  </ul>
                </div>

                {/* Terms & Submit */}
                <div className="bg-neural-700 p-4 rounded-lg border border-neural-600">
                  <p className="text-sm text-neural-300">
                    ✓ By submitting this suggestion, you agree that your idea may be implemented, discussed publicly, or used to improve One Last AI.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Your Suggestion
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-neural-700">
                <h3 className="text-xl font-bold mb-4">What Happens with Your Suggestion?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neural-700 p-4 rounded border border-neural-600 text-center">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="font-semibold">Review</p>
                    <p className="text-sm text-neural-400 mt-2">Our team reviews and evaluates your suggestion</p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600 text-center">
                    <p className="text-3xl mb-2">🗳️</p>
                    <p className="font-semibold">Vote</p>
                    <p className="text-sm text-neural-400 mt-2">Community members can vote on ideas</p>
                  </div>
                  <div className="bg-neural-700 p-4 rounded border border-neural-600 text-center">
                    <p className="text-3xl mb-2">🚀</p>
                    <p className="font-semibold">Build</p>
                    <p className="text-sm text-neural-400 mt-2">Popular ideas make it to our roadmap</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
