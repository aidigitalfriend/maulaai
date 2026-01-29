'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, Observer, CustomWiggle, CustomEase } from '@/lib/gsap';
import { Briefcase, User, Mail, Phone, MapPin, FileText, Upload, ChevronRight, ChevronLeft, Check, Sparkles, Star, Building, Calendar, DollarSign, Send, Loader2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Experience', icon: Briefcase },
  { id: 3, title: 'Work History', icon: Building },
  { id: 4, title: 'Documents', icon: FileText },
  { id: 5, title: 'Additional', icon: Star },
];

function ApplyJobContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const position = searchParams.get('position') || 'General Application';
  const jobId = searchParams.get('id') || 'general';

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    yearsExperience: '',
    currentRole: '',
    currentCompany: '',
    skills: '',
    workHistory: [
      { company: '', role: '', duration: '', description: '' }
    ],
    resume: null as File | null,
    coverLetter: null as File | null,
    whyJoin: '',
    salary: '',
    startDate: '',
    referral: '',
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      CustomWiggle.create('formWiggle', { wiggles: 6, type: 'uniform' });

      gsap.registerPlugin(ScrollTrigger);

      // Initial states
      gsap.set('.hero-badge', { y: -30, opacity: 0 });
      gsap.set('.hero-title span', { y: 60, opacity: 0, rotateX: -45 });
      gsap.set('.hero-subtitle', { y: 30, opacity: 0 });
      gsap.set('.step-indicator', { scale: 0.5, opacity: 0 });
      gsap.set('.form-container', { y: 40, opacity: 0 });
      gsap.set('.floating-icon', { y: 20, opacity: 0, scale: 0 });
      gsap.set('.gradient-orb', { scale: 0.5, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.to('.gradient-orb', {
        scale: 1,
        opacity: 1,
        duration: 1.5,
        stagger: 0.2,
        ease: 'expo.out'
      })
      .to('.hero-badge', {
        y: 0,
        opacity: 1,
        duration: 0.6
      }, '-=1')
      .to('.hero-title span', {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: 'back.out(1.5)'
      }, '-=0.4')
      .to('.hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 0.5
      }, '-=0.3')
      .to('.step-indicator', {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'back.out(2)'
      }, '-=0.2')
      .to('.form-container', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.2')
      .to('.floating-icon', {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(2)'
      }, '-=0.3');

      // Floating icons animation
      document.querySelectorAll('.floating-icon').forEach((icon, i) => {
        gsap.to(icon, {
          y: `random(-12, 12)`,
          x: `random(-8, 8)`,
          rotation: `random(-8, 8)`,
          duration: `random(3, 4.5)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

      // Gradient orbs animation
      gsap.to('.gradient-orb-1', {
        x: 60,
        y: -40,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-2', {
        x: -50,
        y: 60,
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Step transition animation
  useEffect(() => {
    gsap.fromTo('.step-content',
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }
    );
  }, [currentStep]);

  const updateField = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateWorkHistory = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updated = [...prev.workHistory];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, workHistory: updated };
    });
  };

  const addWorkHistory = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, { company: '', role: '', duration: '', description: '' }]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);

    gsap.fromTo('.success-container',
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }
    );
  };

  if (isSubmitted) {
    return (
      <div ref={containerRef} className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="success-container max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Application Submitted!</h1>
          <p className="text-gray-400 mb-8">
            Thank you for applying for <span className="text-cyan-400">{position}</span>. 
            We'll review your application and get back to you within 5-7 business days.
          </p>
          <Link
            href="/resources/careers"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-24 left-[8%]">
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 backdrop-blur-sm flex items-center justify-center border border-violet-500/20">
            <Briefcase className="w-5 h-5 text-violet-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-36 right-[10%]">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/20">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-40 left-[10%]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-28 pb-8 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-6">
              <Briefcase className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Job Application</span>
            </div>

            <h1 className="hero-title text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {'Apply for'.split(' ').map((word, i) => (
                <span key={i} className="inline-block mr-3 bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                  {word}
                </span>
              ))}
              <span className="inline-block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {position}
              </span>
            </h1>

            <p className="hero-subtitle text-lg text-gray-400">
              Complete the form below to submit your application.
            </p>
          </div>
        </section>

        {/* Progress Steps */}
        <section className="pb-8 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => (
                <div key={step.id} className="step-indicator flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep > step.id
                        ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                        : currentStep === step.id
                        ? 'bg-gradient-to-br from-violet-500 to-cyan-500'
                        : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <step.icon className={`w-5 h-5 ${currentStep === step.id ? 'text-white' : 'text-gray-500'}`} />
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`hidden md:block w-16 lg:w-24 h-1 mx-2 rounded ${
                      currentStep > step.id ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gray-800'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="hidden md:flex items-center justify-between mt-2">
              {steps.map((step) => (
                <span key={step.id} className={`text-xs ${currentStep === step.id ? 'text-cyan-400' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="pb-20 px-6">
          <div className="form-container max-w-2xl mx-auto">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800">
              <div className="step-content">
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">First Name *</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Last Name *</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => updateField('location', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">LinkedIn Profile</label>
                        <input
                          type="url"
                          value={formData.linkedin}
                          onChange={(e) => updateField('linkedin', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="linkedin.com/in/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Portfolio/Website</label>
                        <input
                          type="url"
                          value={formData.portfolio}
                          onChange={(e) => updateField('portfolio', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Experience */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-6">Professional Experience</h2>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Years of Experience *</label>
                      <select
                        value={formData.yearsExperience}
                        onChange={(e) => updateField('yearsExperience', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select years</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Current/Most Recent Role</label>
                      <input
                        type="text"
                        value={formData.currentRole}
                        onChange={(e) => updateField('currentRole', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                        placeholder="Senior Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Current/Most Recent Company</label>
                      <input
                        type="text"
                        value={formData.currentCompany}
                        onChange={(e) => updateField('currentCompany', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                        placeholder="Tech Company Inc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Key Skills</label>
                      <textarea
                        value={formData.skills}
                        onChange={(e) => updateField('skills', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                        placeholder="List your key skills relevant to this role..."
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Work History */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-6">Work History</h2>
                    
                    {formData.workHistory.map((work, index) => (
                      <div key={index} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-cyan-400">Position {index + 1}</span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Company</label>
                            <input
                              type="text"
                              value={work.company}
                              onChange={(e) => updateWorkHistory(index, 'company', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                              placeholder="Company name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Role/Title</label>
                            <input
                              type="text"
                              value={work.role}
                              onChange={(e) => updateWorkHistory(index, 'role', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                              placeholder="Your role"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Duration</label>
                          <input
                            type="text"
                            value={work.duration}
                            onChange={(e) => updateWorkHistory(index, 'duration', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                            placeholder="Jan 2020 - Present"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Description</label>
                          <textarea
                            value={work.description}
                            onChange={(e) => updateWorkHistory(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                            placeholder="Key responsibilities and achievements..."
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addWorkHistory}
                      className="w-full py-3 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                    >
                      + Add Another Position
                    </button>
                  </div>
                )}

                {/* Step 4: Documents */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-6">Upload Documents</h2>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Resume/CV *</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => updateField('resume', e.target.files?.[0] || null)}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label
                          htmlFor="resume-upload"
                          className="flex items-center justify-center gap-3 w-full py-8 rounded-xl border-2 border-dashed border-gray-700 hover:border-cyan-500 cursor-pointer transition-colors"
                        >
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-gray-400">
                            {formData.resume ? formData.resume.name : 'Click to upload resume (PDF, DOC)'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Cover Letter (Optional)</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => updateField('coverLetter', e.target.files?.[0] || null)}
                          className="hidden"
                          id="cover-letter-upload"
                        />
                        <label
                          htmlFor="cover-letter-upload"
                          className="flex items-center justify-center gap-3 w-full py-8 rounded-xl border-2 border-dashed border-gray-700 hover:border-cyan-500 cursor-pointer transition-colors"
                        >
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-gray-400">
                            {formData.coverLetter ? formData.coverLetter.name : 'Click to upload cover letter (PDF, DOC)'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Additional */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-6">Additional Information</h2>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Why do you want to join Maula AI?</label>
                      <textarea
                        value={formData.whyJoin}
                        onChange={(e) => updateField('whyJoin', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                        placeholder="Tell us what excites you about this opportunity..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Salary Expectations</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="text"
                            value={formData.salary}
                            onChange={(e) => updateField('salary', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                            placeholder="e.g., $80,000 - $100,000"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Earliest Start Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => updateField('startDate', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">How did you hear about us?</label>
                      <select
                        value={formData.referral}
                        onChange={(e) => updateField('referral', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select an option</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="job-board">Job Board</option>
                        <option value="referral">Employee Referral</option>
                        <option value="website">Company Website</option>
                        <option value="social">Social Media</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                    currentStep === 1
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {currentStep < 5 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ApplyJobPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <ApplyJobContent />
    </Suspense>
  );
}
