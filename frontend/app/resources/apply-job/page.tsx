'use client';

import { useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, Briefcase, User, Mail, Phone, FileText, Send, Check, ChevronLeft, ChevronRight, Upload, Linkedin, Globe } from 'lucide-react';

function ApplyJobContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const position = searchParams.get('position') || 'General Application';
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    resume: null as File | null,
    coverLetter: '',
    experience: '',
    whyJoin: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 4;

  const updateField = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to an API
    setSubmitted(true);
  };

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.form-container', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2');
  }, { scope: containerRef });

  if (submitted) {
    return (
      <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden flex items-center justify-center px-6">
        <style jsx global>{`
          .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); }
          .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        `}</style>
        <div className="glass-card rounded-3xl p-12 text-center max-w-lg">
          <div className="w-20 h-20 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00ff88]/40">
            <Check className="w-10 h-10 text-[#00ff88]" />
          </div>
          <h2 className="text-2xl font-bold metallic-text mb-4">Application Submitted!</h2>
          <p className="text-gray-400 mb-8">
            Thank you for applying for {position}. We'll review your application and get back to you within 5-7 business days.
          </p>
          <Link href="/resources/careers" className="inline-block px-8 py-4 bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-xl font-semibold hover:opacity-90 transition-all">
            View More Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .input-field { @apply w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50 transition-colors; }
        .input-label { @apply block text-sm font-medium text-gray-300 mb-2; }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/resources/careers" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#a855f7] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Careers
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <Briefcase className="w-4 h-4 text-[#a855f7]" />
              <span className="text-gray-300">Application</span>
            </div>
            <h1 className="hero-title text-4xl md:text-5xl font-bold mb-4 metallic-text opacity-0">Apply for Position</h1>
            <p className="text-xl text-[#a855f7] font-medium">{position}</p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    s === step ? 'bg-[#a855f7] text-white' : s < step ? 'bg-[#00ff88] text-black' : 'bg-white/10 text-gray-500'
                  }`}>
                    {s < step ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && <div className={`w-16 md:w-24 h-1 mx-2 rounded ${s < step ? 'bg-[#00ff88]' : 'bg-white/10'}`}></div>}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Personal</span>
              <span>Contact</span>
              <span>Resume</span>
              <span>Questions</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-container glass-card rounded-2xl p-8 opacity-0">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                    <div className="relative">
                      <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => updateField('linkedin', e.target.value)}
                        className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50"
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={formData.portfolio}
                        onChange={(e) => updateField('portfolio', e.target.value)}
                        className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50"
                        placeholder="yoursite.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Resume */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Resume & Cover Letter</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Resume *</label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#a855f7]/50 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Drop your resume here or click to upload</p>
                    <p className="text-gray-600 text-sm">PDF, DOC, DOCX (Max 5MB)</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => updateField('resume', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                  {formData.resume && (
                    <p className="text-[#00ff88] text-sm mt-2 flex items-center gap-2">
                      <Check className="w-4 h-4" /> {formData.resume.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cover Letter</label>
                  <textarea
                    rows={6}
                    value={formData.coverLetter}
                    onChange={(e) => updateField('coverLetter', e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50 resize-none"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Questions */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Additional Questions</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Years of relevant experience *</label>
                  <select
                    required
                    value={formData.experience}
                    onChange={(e) => updateField('experience', e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#a855f7]/50"
                  >
                    <option value="" className="bg-[#1a1a1a]">Select...</option>
                    <option value="0-1" className="bg-[#1a1a1a]">0-1 years</option>
                    <option value="2-4" className="bg-[#1a1a1a]">2-4 years</option>
                    <option value="5-7" className="bg-[#1a1a1a]">5-7 years</option>
                    <option value="8+" className="bg-[#1a1a1a]">8+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Why do you want to join One Last AI? *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.whyJoin}
                    onChange={(e) => updateField('whyJoin', e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50 resize-none"
                    placeholder="Share what excites you about our mission..."
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  step === 1 ? 'opacity-50 cursor-not-allowed text-gray-500' : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all"
                >
                  Submit Application <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function ApplyJobPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ApplyJobContent />
    </Suspense>
  );
}
