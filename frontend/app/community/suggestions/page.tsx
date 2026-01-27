'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Lightbulb, Send, CheckCircle, MessageSquare, Zap, Users } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const creativeStyles = `
  .glass-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .glow-card {
    position: relative;
    overflow: hidden;
  }
  .glow-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, #00d4ff, #00ff88, #a855f7, #00d4ff);
    background-size: 400% 400%;
    animation: glow-rotate 8s linear infinite;
    opacity: 0;
    transition: opacity 0.5s ease;
    border-radius: inherit;
    z-index: -1;
  }
  .glow-card:hover::before {
    opacity: 1;
  }
  .glow-card::after {
    content: '';
    position: absolute;
    inset: 1px;
    background: #0a0a0a;
    border-radius: inherit;
    z-index: -1;
  }
  @keyframes glow-rotate {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .shimmer-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.7s ease;
  }
  .shimmer-card:hover::before {
    left: 100%;
  }
  .float-card {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
  }
  .float-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px -12px rgba(0, 212, 255, 0.25);
  }
`

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
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
  }

  useGSAP(() => {
    gsap.fromTo('.hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' })
    gsap.fromTo('.hero-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' })
    gsap.fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' })
    gsap.fromTo('.benefit-card', { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.benefits-grid', start: 'top 85%' } })
    gsap.fromTo('.form-section', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '.form-section', start: 'top 85%' } })
  }, { scope: containerRef })

  const categories = [
    { value: 'feature', label: 'New Feature' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'integration', label: 'Integration' },
    { value: 'performance', label: 'Performance' },
    { value: 'security', label: 'Security' },
    { value: 'ux', label: 'User Experience' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'other', label: 'Other' }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Nice to Have' },
    { value: 'medium', label: 'Important' },
    { value: 'high', label: 'Critical' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }))
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return prev + 10
      })
    }, 100)
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newSuggestionId = `SUG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    console.log('Suggestion submitted:', { ...formData, suggestionId: newSuggestionId, createdAt: new Date().toISOString() })
    setSuggestionId(newSuggestionId)
    setSubmitted(true)
  }

  const handleSubmitAnother = () => {
    setFormData({ firstName: '', lastName: '', email: '', company: '', title: '', description: '', category: 'feature', priority: 'medium', attachments: [] })
    setSubmitted(false)
    setSuggestionId('')
    setUploadProgress(0)
  }

  const benefits = [
    { icon: MessageSquare, title: "Your Voice Matters", desc: "Every suggestion is reviewed by our team and helps prioritize future development.", color: "#00d4ff" },
    { icon: Users, title: "Community Driven", desc: "Vote on and discuss ideas with other community members to show your support.", color: "#a855f7" },
    { icon: Zap, title: "Quick Updates", desc: "Receive notifications when your suggested feature is implemented or discussed.", color: "#f59e0b" }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      <style jsx>{creativeStyles}</style>
      
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#f59e0b]/10 via-transparent to-transparent blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 mb-6">
            <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b] font-medium">Community Ideas</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Share Your Ideas
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Help shape the future of One Last AI. Submit your feature requests, improvements, and ideas to make our platform even better.
          </p>
        </div>
      </section>

      <section className="py-12 px-6 -mt-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="benefits-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon
              return (
                <div 
                  key={idx}
                  className="benefit-card glass-card glow-card shimmer-card rounded-2xl border border-white/5 p-6 text-center cursor-pointer overflow-hidden relative group"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10" style={{ background: `linear-gradient(135deg, ${benefit.color}40, ${benefit.color}20)`, boxShadow: `0 10px 40px ${benefit.color}30` }}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 relative z-10">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm relative z-10">{benefit.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="form-section py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {submitted ? (
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              <div className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] p-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Thank You for Your Suggestion!</h2>
                <p className="text-white/90 text-lg">Your idea has been submitted successfully. Our team will review it and get back to you soon.</p>
              </div>

              <div className="p-8">
                <div className="glass-card rounded-xl border border-white/10 p-6 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Your Suggestion Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-gray-500 text-sm mb-1">Suggestion ID</p>
                      <p className="text-xl font-mono font-bold text-[#00d4ff]">{suggestionId}</p>
                      <p className="text-xs text-gray-500 mt-2">Save this for reference</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-gray-500 text-sm mb-1">Category</p>
                      <p className="text-lg font-semibold text-white capitalize">{categories.find(c => c.value === formData.category)?.label}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-gray-500 text-sm mb-1">Title</p>
                      <p className="text-lg font-semibold text-white">{formData.title}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-gray-500 text-sm mb-1">Priority</p>
                      <p className="text-lg font-semibold text-white capitalize">{formData.priority}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/community/roadmap" className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition text-center">View Roadmap</Link>
                  <button onClick={handleSubmitAnother} className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] hover:from-[#00b8e6] hover:to-[#00e077] text-black rounded-xl font-semibold transition shadow-lg shadow-[#00d4ff]/25">Submit Another</button>
                  <Link href="/community" className="flex-1 px-6 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-xl font-semibold transition text-center shadow-lg">Explore Community</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-white/5 p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[#00d4ff]/20 rounded-lg flex items-center justify-center text-[#00d4ff]">1</span>
                    About You
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">First Name *</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-transparent transition" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Last Name *</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-transparent transition" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-transparent transition" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Company</label>
                      <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-transparent transition" placeholder="Your Company" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[#a855f7]/20 rounded-lg flex items-center justify-center text-[#a855f7]">2</span>
                    Your Suggestion
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Category *</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-transparent transition">
                        {categories.map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Priority *</label>
                      <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-transparent transition">
                        {priorityLevels.map((level) => (<option key={level.value} value={level.value}>{level.label}</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required maxLength={100} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-transparent transition" placeholder="Brief title of your idea" />
                    <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Description *</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required maxLength={2000} rows={6} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-transparent transition resize-none" placeholder="Describe your suggestion in detail. What problem does it solve? How would it improve One Last AI?" />
                    <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[#00ff88]/20 rounded-lg flex items-center justify-center text-[#00ff88]">3</span>
                    Attachments (Optional)
                  </h3>

                  <div className="bg-[#1a1a1a] border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/5 transition">
                    <label className="cursor-pointer">
                      <input type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.gif,.sketch,.fig,.xd" />
                      <div>
                        <div className="w-16 h-16 bg-[#00d4ff]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lightbulb className="w-8 h-8 text-[#00d4ff]" />
                        </div>
                        <p className="font-semibold text-white mb-1">Click to upload mockups or screenshots</p>
                        <p className="text-sm text-gray-500">PNG, JPG, PDF, Sketch, Figma up to 10MB</p>
                      </div>
                    </label>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-300 mb-2">Uploading... {uploadProgress}%</p>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#00d4ff] to-[#00ff88] h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {formData.attachments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-300 mb-2">Attached Files ({formData.attachments.length}):</p>
                      <div className="space-y-2">
                        {formData.attachments.map((file, idx) => (
                          <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <Lightbulb className="w-5 h-5 text-gray-400" />
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-white">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => removeAttachment(idx)} className="px-3 py-1 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] rounded-lg text-sm transition font-medium">Remove</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="glass-card p-5 rounded-xl border border-[#f59e0b]/20">
                  <p className="text-sm text-white mb-2 font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-[#f59e0b]" /> Pro Tips:</p>
                  <ul className="text-sm text-gray-400 space-y-1.5 ml-6">
                    <li>• Be specific about the problem and your proposed solution</li>
                    <li>• Include examples of how this would improve your workflow</li>
                    <li>• Attach mockups or screenshots if they help explain your idea</li>
                    <li>• Check the roadmap to avoid duplicate suggestions</li>
                  </ul>
                </div>

                <div className="glass-card p-4 rounded-xl border border-white/10">
                  <p className="text-sm text-gray-400 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
                    By submitting this suggestion, you agree that your idea may be implemented, discussed publicly, or used to improve One Last AI.
                  </p>
                </div>

                <button type="submit" className="w-full px-6 py-4 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] hover:from-[#00b8e6] hover:to-[#00e077] text-black rounded-xl font-semibold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-[#00d4ff]/25">
                  <Send className="w-5 h-5" />
                  Submit Your Suggestion
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
