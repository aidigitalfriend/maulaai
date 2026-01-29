'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, Observer, CustomWiggle, CustomEase, DrawSVGPlugin, MotionPathPlugin, Draggable } from '@/lib/gsap';
import Link from 'next/link';
import { AlertTriangle, Shield, FileText, Send, CheckCircle, AlertCircle, ArrowLeft, ChevronRight, Flag, Bug, UserX, Scale, MessageSquare, Clock, Eye, Lock } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  reportType: string;
  severity: string;
  description: string;
  evidence: string;
  agentName: string;
  agreeToTerms: boolean;
}

export default function ReportsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    reportType: 'inappropriate-content',
    severity: 'medium',
    description: '',
    evidence: '',
    agentName: '',
    agreeToTerms: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = [
    { value: 'inappropriate-content', label: 'Inappropriate Content', icon: Flag, color: 'amber' },
    { value: 'abuse', label: 'Abuse or Harassment', icon: UserX, color: 'red' },
    { value: 'security', label: 'Security Vulnerability', icon: Shield, color: 'cyan' },
    { value: 'bug', label: 'Technical Bug', icon: Bug, color: 'purple' },
    { value: 'policy-violation', label: 'Policy Violation', icon: Scale, color: 'rose' },
    { value: 'other', label: 'Other Issue', icon: MessageSquare, color: 'gray' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'emerald', desc: 'Minor issue, no immediate action needed' },
    { value: 'medium', label: 'Medium', color: 'amber', desc: 'Significant issue, requires attention' },
    { value: 'high', label: 'High', color: 'orange', desc: 'Serious issue, urgent response needed' },
    { value: 'critical', label: 'Critical', color: 'red', desc: 'Emergency, immediate action required' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Register custom wiggle
      CustomWiggle.create('reportWiggle', { wiggles: 5, type: 'uniform' });

      // Hero animations
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSubtitle = new SplitText('.hero-subtitle', { type: 'words' });

      gsap.set(heroTitle.chars, { y: 80, opacity: 0, rotateX: -90 });
      gsap.set(heroSubtitle.words, { y: 25, opacity: 0 });
      gsap.set('.hero-alert', { scale: 0, rotate: -180 });
      gsap.set('.hero-badge', { y: 30, opacity: 0 });
      gsap.set('.hero-line', { scaleX: 0 });
      gsap.set('.floating-flag', { y: -50, opacity: 0, scale: 0 });

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      heroTl
        .to('.hero-alert', {
          scale: 1,
          rotate: 0,
          duration: 1,
          ease: 'back.out(1.7)'
        })
        .to('.floating-flag', {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.08
        }, '-=0.5')
        .to(heroTitle.chars, {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.02
        }, '-=0.4')
        .to(heroSubtitle.words, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.02
        }, '-=0.3')
        .to('.hero-line', {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.inOut'
        }, '-=0.2')
        .to('.hero-badge', {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.5)'
        }, '-=0.4');

      // Pulsing alert animation
      gsap.to('.hero-alert', {
        scale: 1.05,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.2
      });

      // Floating flags animation
      document.querySelectorAll('.floating-flag').forEach((flag, i) => {
        gsap.to(flag, {
          y: `random(-25, 25)`,
          x: `random(-20, 20)`,
          rotation: `random(-15, 15)`,
          duration: `random(3, 5)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });

      // Form elements entrance
      gsap.set('.form-section', { y: 50, opacity: 0 });
      
      ScrollTrigger.create({
        trigger: '.form-container',
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.form-section', {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out'
          });
        }
      });

      // Report type cards entrance
      gsap.set('.report-type-card', { scale: 0.9, opacity: 0 });
      
      ScrollTrigger.create({
        trigger: '.report-types-section',
        start: 'top 85%',
        onEnter: () => {
          gsap.to('.report-type-card', {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'back.out(1.5)'
          });
        }
      });

      // Info cards entrance
      gsap.set('.info-card', { y: 40, opacity: 0 });
      
      ScrollTrigger.batch('.info-card', {
        start: 'top 85%',
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out'
          });
        }
      });

      // Gradient orbs
      gsap.to('.gradient-orb-1', {
        x: 60,
        y: -40,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-2', {
        x: -50,
        y: 50,
        duration: 11,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Observer for scroll velocity
      Observer.create({
        target: containerRef.current,
        type: 'scroll',
        onChangeY: (self) => {
          const velocity = Math.min(Math.abs(self.velocityY) / 1500, 0.5);
          gsap.to('.info-card', {
            skewY: self.velocityY > 0 ? velocity : -velocity,
            duration: 0.2
          });
        },
        onStop: () => {
          gsap.to('.info-card', {
            skewY: 0,
            duration: 0.4,
            ease: 'elastic.out(1, 0.5)'
          });
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (submitted) {
    return (
      <div ref={containerRef} className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Report Submitted</h1>
          <p className="text-gray-400 mb-8">
            Thank you for your report. Our trust and safety team will review it and take appropriate action. You will receive a confirmation email shortly.
          </p>
          <Link
            href="/legal"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all"
          >
            Back to Legal
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb-1 absolute top-20 left-1/4 w-[500px] h-[500px] bg-red-500/8 rounded-full blur-3xl" />
        <div className="gradient-orb-2 absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-rose-500/8 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-black to-black" />
        
        {/* Floating flags */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <Flag
              key={i}
              className={`floating-flag absolute w-5 h-5 text-red-400/30`}
              style={{
                left: `${15 + i * 18}%`,
                top: `${25 + (i % 3) * 18}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            href="/legal" 
            className="inline-flex items-center text-gray-400 hover:text-red-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Legal
          </Link>

          {/* Alert Icon */}
          <div className="hero-alert mb-8 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>

          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-red-200 to-rose-200 bg-clip-text text-transparent">
            Report an Issue
          </h1>
          
          <p className="hero-subtitle text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Help us maintain a safe and respectful platform. Report inappropriate activities, violations, or security concerns.
          </p>

          <div className="hero-line w-32 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto mb-8 rounded-full" />

          <div className="flex flex-wrap justify-center gap-4">
            <div className="hero-badge px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              24h Response Time
            </div>
            <div className="hero-badge px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confidential
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="relative py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="info-card p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Review Process</h3>
              <p className="text-gray-400 text-sm">
                All reports are reviewed by our Trust & Safety team within 24 hours.
              </p>
            </div>

            <div className="info-card p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Your Privacy</h3>
              <p className="text-gray-400 text-sm">
                Your identity remains confidential. We never share reporter information.
              </p>
            </div>

            <div className="info-card p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Fair Investigation</h3>
              <p className="text-gray-400 text-sm">
                We investigate all reports fairly and take appropriate action based on evidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Report Form Section */}
      <section className="form-container relative py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Report Type Selection */}
            <div className="form-section report-types-section">
              <label className="block text-lg font-semibold text-white mb-4">What would you like to report?</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {reportTypes.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = formData.reportType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, reportType: type.value }))}
                      className={`report-type-card p-4 rounded-xl border transition-all text-left ${
                        isSelected 
                          ? `bg-${type.color}-500/20 border-${type.color}-500/50` 
                          : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <IconComponent className={`w-6 h-6 mb-2 ${isSelected ? `text-${type.color}-400` : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {type.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Selection */}
            <div className="form-section">
              <label className="block text-lg font-semibold text-white mb-4">Severity Level</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {severityLevels.map((level) => {
                  const isSelected = formData.severity === level.value;
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                      className={`p-4 rounded-xl border transition-all text-center ${
                        isSelected 
                          ? `bg-${level.color}-500/20 border-${level.color}-500/50` 
                          : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <p className={`font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {level.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{level.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:border-red-500/50 focus:outline-none transition-colors"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:border-red-500/50 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Agent Name (Optional) */}
            <div className="form-section">
              <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name (Optional)</label>
              <input
                type="text"
                name="agentName"
                value={formData.agentName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:border-red-500/50 focus:outline-none transition-colors"
                placeholder="Which AI agent is this related to?"
              />
            </div>

            {/* Description */}
            <div className="form-section">
              <label className="block text-sm font-medium text-gray-300 mb-2">Detailed Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:border-red-500/50 focus:outline-none transition-colors resize-none"
                placeholder="Please describe the issue in detail. Include what happened, when it occurred, and any other relevant information."
              />
              <p className="text-xs text-gray-500 mt-2">Minimum 50 characters required</p>
            </div>

            {/* Evidence */}
            <div className="form-section">
              <label className="block text-sm font-medium text-gray-300 mb-2">Supporting Evidence (Optional)</label>
              <textarea
                name="evidence"
                value={formData.evidence}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:border-red-500/50 focus:outline-none transition-colors resize-none"
                placeholder="Paste any relevant URLs, screenshots links, or additional evidence here."
              />
            </div>

            {/* Agreement */}
            <div className="form-section">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-5 h-5 rounded border-gray-700 bg-gray-900 text-red-500 focus:ring-red-500/50"
                />
                <span className="text-sm text-gray-400">
                  I confirm that the information provided is accurate to the best of my knowledge. I understand that filing false reports may result in action against my account. I agree to the <Link href="/legal/terms-of-service" className="text-red-400 hover:underline">Terms of Service</Link> and <Link href="/legal/privacy-policy" className="text-red-400 hover:underline">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="form-section">
              <button
                type="submit"
                disabled={isSubmitting || !formData.agreeToTerms}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Legal Disclaimer */}
          <div className="mt-12 p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Legal Disclaimer</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This reporting system is for platform-related issues only. For emergencies or immediate safety concerns, please contact local authorities. Filing false or malicious reports may result in account suspension. All reports are confidential and will be handled according to our privacy policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
